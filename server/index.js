const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const satori = require('satori').default;
const { Resvg } = require('@resvg/resvg-js');
const sharp = require('sharp');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = 3001;

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

app.use(cors());
app.use(express.json());
app.use('/backgrounds', express.static(path.join(__dirname, '../public/backgrounds')));

// Device presets (hardcoded for MVP)
const devicePresets = [
  { id: 'iphone-12-pro-max', name: 'iPhone 12 Pro Max', width: 1284, height: 2778, isDefault: true },
  { id: 'iphone-15-pro-max', name: 'iPhone 15 Pro Max', width: 1290, height: 2796, isDefault: false },
  { id: 'samsung-galaxy', name: 'Samsung Galaxy', width: 1440, height: 3088, isDefault: false },
];

// Load font once at startup
let fontData = null;

async function loadFont() {
  // Try to load a system font or bundled font
  const fontPaths = [
    '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf',
    '/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf',
    '/usr/share/fonts/TTF/DejaVuSerif.ttf',
    path.join(__dirname, '../public/fonts/Georgia.ttf'),
  ];

  for (const fontPath of fontPaths) {
    try {
      if (fs.existsSync(fontPath)) {
        fontData = fs.readFileSync(fontPath);
        console.log(`Loaded font from: ${fontPath}`);
        return;
      }
    } catch (e) {
      continue;
    }
  }

  // Fallback: download a free font
  console.log('No system font found, using Inter from CDN');
  const https = require('https');
  const fontUrl = 'https://github.com/rsms/inter/raw/master/docs/font-files/Inter-Regular.otf';

  return new Promise((resolve, reject) => {
    https.get(fontUrl, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        https.get(response.headers.location, (res) => {
          const chunks = [];
          res.on('data', chunk => chunks.push(chunk));
          res.on('end', () => {
            fontData = Buffer.concat(chunks);
            resolve();
          });
        });
      } else {
        const chunks = [];
        response.on('data', chunk => chunks.push(chunk));
        response.on('end', () => {
          fontData = Buffer.concat(chunks);
          resolve();
        });
      }
    }).on('error', reject);
  });
}

// Get backgrounds list
app.get('/api/backgrounds', (req, res) => {
  const backgroundsDir = path.join(__dirname, '../public/backgrounds');
  const files = fs.readdirSync(backgroundsDir).filter(f => /\.(jpg|jpeg|png)$/i.test(f));

  const backgrounds = files.map((filename, index) => ({
    id: `bg-${index + 1}`,
    filename,
    thumbnailUrl: `/backgrounds/${filename}`,
    fullUrl: `/backgrounds/${filename}`,
  }));

  res.json(backgrounds);
});

// Get device presets
app.get('/api/device-presets', (req, res) => {
  res.json(devicePresets);
});

// AI text sizing using Claude Haiku
async function getOptimalFontSize(verseText, reference, width, height) {
  const safeWidth = width * 0.8;
  const targetHeight = height / 3; // Middle third of screen
  const charCount = verseText.length;
  const wordCount = verseText.split(/\s+/).length;

  try {
    console.log('Calling AI for font size...');
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: `Calculate font size in pixels for a lock screen.

Screen: ${width}x${height}px
Text area width: ${safeWidth}px (middle 80%)
Target text height: ${targetHeight}px (middle third of screen)
Text: "${verseText}" (${charCount} chars, ${wordCount} words)
Line height: 1.4

GOAL: Text should FILL the middle third area. Choose a LARGE font that fits.
- Short text (<100 chars): 80-100px
- Medium text (100-200 chars): 60-80px
- Long text (>200 chars): 48-60px

Return ONLY an integer (font size in pixels).`
      }]
    });

    const rawResponse = response.content[0].text.trim();
    console.log('AI raw response:', rawResponse);

    // Extract first number from response
    const match = rawResponse.match(/\d+/);
    const fontSize = match ? parseInt(match[0], 10) : null;
    console.log('AI parsed font size:', fontSize);

    if (!fontSize || isNaN(fontSize)) {
      console.log('AI returned invalid, using fallback');
      if (charCount < 100) return 90;
      if (charCount < 150) return 78;
      if (charCount < 200) return 66;
      if (charCount < 300) return 54;
      return 44;
    }

    // Apply multiplier based on text length (less aggressive for long text)
    let multiplier = 1.5;
    if (charCount > 400) multiplier = 1.0;      // Very long - trust AI
    else if (charCount > 300) multiplier = 1.1; // Long
    else if (charCount > 200) multiplier = 1.25; // Medium-long

    const adjustedSize = Math.round(fontSize * multiplier);
    const finalSize = Math.min(Math.max(adjustedSize, 36), 120);
    console.log('Final adjusted size:', finalSize, '(multiplier:', multiplier, ')');
    return finalSize;
  } catch (error) {
    console.error('AI sizing error, using fallback:', error.message);
    // Fallback algorithm
    if (charCount < 100) return 90;
    if (charCount < 150) return 78;
    if (charCount < 200) return 66;
    if (charCount < 300) return 54;
    return 44;
  }
}

// Generate image
app.post('/api/generate', async (req, res) => {
  try {
    const { verse, reference, backgroundId, devicePreset, fontSizeAdjustment = 0 } = req.body;

    // Validate input
    if (!verse || verse.length < 10 || verse.length > 500) {
      return res.status(400).json({ error: 'Verse must be between 10 and 500 characters' });
    }

    // Get device dimensions
    const preset = devicePresets.find(p => p.id === devicePreset) || devicePresets[0];
    const { width, height } = preset;

    // Get background file
    const backgroundsDir = path.join(__dirname, '../public/backgrounds');
    const files = fs.readdirSync(backgroundsDir).filter(f => /\.(jpg|jpeg|png)$/i.test(f));
    const bgIndex = parseInt(backgroundId?.replace('bg-', '') || '1', 10) - 1;
    const bgFile = files[bgIndex] || files[0];
    const bgPath = path.join(backgroundsDir, bgFile);

    // Get optimal font size from AI
    const baseFontSize = await getOptimalFontSize(verse, reference, width, height);
    const adjustedFontSize = Math.round(baseFontSize * (1 + fontSizeAdjustment / 100));
    const referenceFontSize = Math.round(adjustedFontSize * 0.65);

    // Create text overlay using Satori
    const svg = await satori(
      {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            padding: '10%',
          },
          children: [
            {
              type: 'div',
              props: {
                style: {
                  fontSize: adjustedFontSize,
                  color: 'white',
                  textAlign: 'center',
                  lineHeight: 1.4,
                  textShadow: '3px 3px 5px rgba(0,0,0,0.8)',
                  maxWidth: '80%',
                  overflow: 'hidden',
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                },
                children: verse,
              },
            },
            {
              type: 'div',
              props: {
                style: {
                  fontSize: referenceFontSize,
                  color: 'white',
                  marginTop: 30,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                },
                children: reference || '',
              },
            },
          ],
        },
      },
      {
        width,
        height,
        fonts: [
          {
            name: 'Serif',
            data: fontData,
            weight: 400,
            style: 'normal',
          },
        ],
      }
    );

    // Convert SVG to PNG
    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: width },
    });
    const textPng = resvg.render().asPng();

    // Process background and composite
    const background = await sharp(bgPath)
      .resize(width, height, { fit: 'cover' })
      .composite([
        // Dark overlay for text readability
        {
          input: {
            create: {
              width,
              height,
              channels: 4,
              background: { r: 0, g: 0, b: 0, alpha: 0.3 },
            },
          },
          blend: 'over',
        },
        // Text overlay
        {
          input: textPng,
          blend: 'over',
        },
      ])
      .png()
      .toBuffer();

    // Send as base64 for preview
    res.json({
      image: `data:image/png;base64,${background.toString('base64')}`,
      fontSize: adjustedFontSize,
    });

  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ error: 'Failed to generate image: ' + error.message });
  }
});

// Start server
async function start() {
  await loadFont();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
