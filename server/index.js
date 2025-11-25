const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const satori = require('satori').default;
const { Resvg } = require('@resvg/resvg-js');
const sharp = require('sharp');
require('dotenv').config();
const { calculateOptimalLayout, generateAIFont, processUserRequest } = require('./ai-service');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use('/sacredlockscreen/backgrounds', express.static(path.join(__dirname, '../public/backgrounds')));

// Serve static frontend files in production
if (process.env.NODE_ENV === 'production') {
  app.use('/sacredlockscreen', express.static(path.join(__dirname, '../client/dist')));
}

// Device presets (hardcoded for MVP)
const devicePresets = [
  { id: 'iphone-16-pro-max', name: 'iPhone 16 Pro Max', width: 1320, height: 2868, isDefault: true },
  { id: 'iphone-15-pro', name: 'iPhone 15 Pro', width: 1179, height: 2556, isDefault: false },
  { id: 'pixel-8-pro', name: 'Google Pixel 8 Pro', width: 1344, height: 2992, isDefault: false },
  { id: 'samsung-s24-ultra', name: 'Samsung S24 Ultra', width: 1440, height: 3120, isDefault: false },
  { id: 'iphone-se', name: 'iPhone SE', width: 750, height: 1334, isDefault: false },
];

// Available fonts (curated list - serif + script fonts for scripture)
const AVAILABLE_FONTS = [
  {
    id: 'dejavu-serif',
    name: 'DejaVu Serif',
    paths: [
      '/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf',
      '/usr/share/fonts/TTF/DejaVuSerif.ttf',
    ]
  },
  {
    id: 'dejavu-sans',
    name: 'DejaVu Sans',
    paths: [
      '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
      '/usr/share/fonts/TTF/DejaVuSans.ttf',
    ]
  },
  {
    id: 'liberation-serif',
    name: 'Liberation Serif',
    paths: [
      '/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf',
      '/usr/share/fonts/liberation/LiberationSerif-Regular.ttf',
    ]
  },
  {
    id: 'noto-serif',
    name: 'Noto Serif',
    paths: [
      '/usr/share/fonts/truetype/noto/NotoSerif-Regular.ttf',
    ]
  },
  {
    id: 'italianno',
    name: 'Italianno',
    paths: [
      path.join(__dirname, '../public/fonts/Italianno-Regular.ttf'),
    ]
  },
  {
    id: 'great-vibes',
    name: 'Great Vibes',
    paths: [
      path.join(__dirname, '../public/fonts/GreatVibes-Regular.ttf'),
    ]
  },
  {
    id: 'rindeya',
    name: 'Rindeya',
    paths: [
      path.join(__dirname, '../public/fonts/Rindeya.ttf'),
    ]
  },
  {
    id: 'ms-stusi',
    name: 'Ms Stusi',
    paths: [
      path.join(__dirname, '../public/fonts/Ms Stusi.otf'),
    ]
  },
];

// Font cache
const fontCache = new Map();

// Load a specific font by ID
function loadFontById(fontId) {
  // Check cache first
  if (fontCache.has(fontId)) {
    return fontCache.get(fontId);
  }

  // Find font config
  const fontConfig = AVAILABLE_FONTS.find(f => f.id === fontId);
  if (!fontConfig) {
    throw new Error(`Font ${fontId} not found`);
  }

  // Try each path
  for (const fontPath of fontConfig.paths) {
    try {
      if (fs.existsSync(fontPath)) {
        const data = fs.readFileSync(fontPath);
        fontCache.set(fontId, data);
        console.log(`Loaded font ${fontId} from: ${fontPath}`);
        return data;
      }
    } catch (e) {
      continue;
    }
  }

  throw new Error(`Could not load font ${fontId} from any path`);
}

// Load default font at startup
let fontData = null;

async function loadFont() {
  try {
    fontData = loadFontById('dejavu-serif');
  } catch (e) {
    console.error('Failed to load default font:', e.message);
    throw e;
  }
}

// Helper handlers for API endpoints (used by both prefixed and non-prefixed routes)
function getBackgrounds(req, res) {
  const backgroundsDir = path.join(__dirname, '../public/backgrounds');
  const files = fs.readdirSync(backgroundsDir).filter(f => /\.(jpg|jpeg|png)$/i.test(f));

  const backgrounds = files.map((filename, index) => ({
    id: `bg-${index + 1}`,
    filename,
    thumbnailUrl: `/sacredlockscreen/backgrounds/${filename}`,
    fullUrl: `/sacredlockscreen/backgrounds/${filename}`,
  }));

  res.json(backgrounds);
}

function getDevicePresets(req, res) {
  res.json(devicePresets);
}

function getFonts(req, res) {
  const fonts = AVAILABLE_FONTS.map(f => ({
    id: f.id,
    name: f.name
  }));
  res.json(fonts);
}

// Production routes (with /sacredlockscreen prefix)
app.get('/sacredlockscreen/api/backgrounds', getBackgrounds);
app.get('/sacredlockscreen/api/device-presets', getDevicePresets);
app.get('/sacredlockscreen/api/fonts', getFonts);

// Development routes (without prefix - for Vite proxy)
app.get('/api/backgrounds', getBackgrounds);
app.get('/api/device-presets', getDevicePresets);
app.get('/api/fonts', getFonts);

// Deterministic font size calculator
function calculateFontSize(verseText) {
  const charCount = verseText.length;

  // Start at 105px for short verses, scale down for longer ones
  if (charCount < 100) return 105;
  if (charCount < 150) return 88;
  if (charCount < 200) return 74;
  if (charCount < 250) return 64;
  if (charCount < 300) return 56;
  if (charCount < 400) return 48;
  return 42;
}

// Generate image handler
async function generateImage(req, res) {
  try {
    const { verse, reference, backgroundId, devicePreset, fontSize, fontFamily = 'dejavu-serif' } = req.body;

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

    // Load selected font
    const selectedFontData = loadFontById(fontFamily);

    // AI Layout Calculation
    let layout = {
      fontSize: fontSize !== undefined && fontSize !== null ? fontSize : calculateFontSize(verse),
      lineHeight: 1.4,
      paddingTop: '10%',
      paddingBottom: '10%',
      maxWidth: '80%'
    };

    let aiSvg = null;

    if (req.body.useAI) {
      console.log('Using AI for layout...');
      const aiLayout = await calculateOptimalLayout(verse, process.env.OPENROUTER_API_KEY);
      if (aiLayout) {
        console.log('AI Layout:', aiLayout);
        // Enforce minimum 25% padding
        const minPadding = 25;
        const aiTop = aiLayout.paddingTop || 25;
        const aiBottom = aiLayout.paddingBottom || 25;

        layout = {
          fontSize: aiLayout.fontSize,
          lineHeight: aiLayout.lineHeight || 1.4,
          paddingTop: `${Math.max(aiTop, minPadding)}%`,
          paddingBottom: `${Math.max(aiBottom, minPadding)}%`,
          maxWidth: aiLayout.maxWidth ? `${aiLayout.maxWidth}%` : '80%'
        };
      }

      // AI Pro Font Generation (Now potentially Full Image Generation via Gemini 3 Pro)
      if (req.body.useProFont) {
        console.log('Generating Nano Banana Pro Art...');
        aiSvg = await generateAIFont(verse, process.env.OPENROUTER_API_KEY, bgFile); // Pass bg filename as description
      }
    }

    // CRITICAL CHANGE: If aiSvg is actually a URL (from Gemini 3 Pro Image Gen), return it directly!
    if (aiSvg && (aiSvg.startsWith('http') || aiSvg.startsWith('data:image'))) {
      console.log('Gemini 3 Pro returned a full image URL. Returning directly.');
      return res.json({
        image: aiSvg,
        fontSize: layout.fontSize, // Placeholder
      });
    }

    const verseFontSize = layout.fontSize;
    const referenceFontSize = Math.round(verseFontSize * 0.58); // Reduced by ~15% from 0.68

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
            paddingTop: layout.paddingTop,
            paddingBottom: layout.paddingBottom,
            paddingLeft: '10%',
            paddingRight: '10%',
          },
          children: aiSvg ? [
            {
              type: 'img',
              props: {
                src: `data:image/svg+xml;base64,${Buffer.from(aiSvg).toString('base64')}`,
                style: {
                  width: '100%',
                  height: 'auto',
                  maxHeight: '80%',
                  objectFit: 'contain',
                }
              }
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
            }
          ] : [
            {
              type: 'div',
              props: {
                style: {
                  fontSize: verseFontSize,
                  color: 'white',
                  textAlign: 'center',
                  lineHeight: layout.lineHeight,
                  textShadow: '3px 3px 5px rgba(0,0,0,0.8)',
                  maxWidth: layout.maxWidth,
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
            data: selectedFontData,
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
      fontSize: verseFontSize,
    });

  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ error: 'Failed to generate image: ' + error.message });
  }
}

// Production route (with /sacredlockscreen prefix)
app.post('/sacredlockscreen/api/generate', generateImage);

// Development route (without prefix - for Vite proxy)
app.post('/api/generate', generateImage);

// Serve index.html for all other routes under /sacredlockscreen (SPA support)
if (process.env.NODE_ENV === 'production') {
  app.get('/sacredlockscreen/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// Start server
async function start() {
  await loadFont();
  // Intelligent Pipeline Endpoint
  app.post('/api/process-input', async (req, res) => {
    try {
      const { text } = req.body;

      if (!text) {
        return res.status(400).json({ error: 'Input text is required' });
      }

      // Get available backgrounds to pass to AI
      const backgroundsDir = path.join(__dirname, '../public/backgrounds');
      const files = fs.readdirSync(backgroundsDir).filter(f => /\.(jpg|jpeg|png)$/i.test(f));
      const backgrounds = files.map((f, i) => ({
        id: `bg-${i + 1}`,
        filename: f
      }));

      console.log('Processing input with AI:', text.substring(0, 50) + '...');
      const result = await processUserRequest(text, backgrounds, process.env.OPENROUTER_API_KEY);

      if (result.error) {
        return res.status(400).json({ error: result.error });
      }

      res.json(result);
    } catch (error) {
      console.error('Process Input Error:', error);
      res.status(500).json({ error: 'Failed to process input' });
    }
  });

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
