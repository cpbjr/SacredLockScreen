import { useState, useEffect, useRef } from 'react';
import { Minus, Plus, Download, RefreshCw, Loader2, AlertCircle, Sparkles, PenTool, Image as ImageIcon } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { OrganicBackground } from './components/OrganicBackground';
import { OrganicDivider } from './components/OrganicDivider';

// API_BASE is for API calls only - image URLs from backend already include full path
// In development, use '' so Vite proxy handles the API requests
const API_BASE = import.meta.env.MODE === 'production' ? '/sacredlockscreen' : '';

interface Background {
  id: string;
  filename: string;
  thumbnailUrl: string;
}

interface DevicePreset {
  id: string;
  name: string;
  width: number;
  height: number;
  isDefault: boolean;
}

interface Font {
  id: string;
  name: string;
}

// Background Gallery Component
const BackgroundGallerySection = ({
  backgrounds,
  selectedBackground,
  setSelectedBackground
}: {
  backgrounds: Background[];
  selectedBackground: string;
  setSelectedBackground: (id: string) => void;
}) => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

  return (
    <section ref={sectionRef} className="bg-surface rounded-3xl p-6 md:p-8 organic-shadow mb-8 border border-stone-light/20">
      <div className="mb-6 text-center">
        <h3 className="font-display text-2xl md:text-3xl font-medium text-navy mb-2">
          Choose Your Canvas
        </h3>
        <OrganicDivider className="opacity-60 scale-75" />
      </div>

      {/* Mobile-optimized: 2 columns, compact spacing */}
      <div className="grid grid-cols-2 gap-4 md:gap-6">
        {backgrounds.map((bg, index) => (
          <motion.button
            key={bg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            onClick={() => setSelectedBackground(bg.id)}
            className={`group relative aspect-[9/16] rounded-2xl overflow-hidden transition-all duration-300 touch-manipulation ${selectedBackground === bg.id
              ? 'ring-4 ring-primary/30 scale-[0.98]'
              : 'hover:opacity-90 active:scale-[0.96]'
              }`}
          >
            <img
              src={bg.thumbnailUrl}
              alt={bg.filename}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Selected indicator */}
            {selectedBackground === bg.id && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 bg-primary/10 flex items-center justify-center"
              >
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-primary shadow-lg">
                  <Sparkles className="w-4 h-4" />
                </div>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </section>
  );
};

function App() {
  // State
  const [verse, setVerse] = useState('');
  const [reference, setReference] = useState('');
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [selectedBackground, setSelectedBackground] = useState<string>('');
  const [devicePresets, setDevicePresets] = useState<DevicePreset[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [fonts, setFonts] = useState<Font[]>([]);
  const [selectedFont, setSelectedFont] = useState<string>('dejavu-serif');
  const [fontSize, setFontSize] = useState<number | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Map font IDs to CSS font family names
  const getFontFamily = (fontId: string): string => {
    const fontMap: Record<string, string> = {
      'dejavu-serif': 'serif',
      'dejavu-sans': 'sans-serif',
      'liberation-serif': 'serif',
      'noto-serif': 'serif',
      'italianno': 'Italianno, cursive',
      'great-vibes': 'Great Vibes, cursive',
      'rindeya': 'Rindeya, cursive',
      'ms-stusi': 'Ms Stusi, cursive',
    };
    return fontMap[fontId] || 'serif';
  };

  const [useAI, setUseAI] = useState(true);
  const [useProFont, setUseProFont] = useState(true);


  // Fetch initial data
  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/backgrounds`).then(r => r.json()),
      fetch(`${API_BASE}/api/device-presets`).then(r => r.json()),
      fetch(`${API_BASE}/api/fonts`).then(r => r.json()),
    ]).then(([bgs, presets, availableFonts]) => {
      setBackgrounds(bgs);
      if (bgs.length > 0) setSelectedBackground(bgs[0].id);
      setDevicePresets(presets);
      const defaultPreset = presets.find((p: DevicePreset) => p.isDefault);
      if (defaultPreset) setSelectedPreset(defaultPreset.id);
      setFonts(availableFonts);
    }).catch(err => {
      setError('Failed to load data. Make sure the server is running.');
      console.error(err);
    });
  }, []);

  // Character count
  const charCount = verse.length;
  const isValidLength = charCount >= 10 && charCount <= 500;

  // Debounced auto-regenerate when font or size changes
  useEffect(() => {
    if (!generatedImage) return;

    // Debounce: wait 500ms after last change before regenerating
    const timeoutId = setTimeout(() => {
      handleGenerate();
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFont, fontSize]);

  // Generate image (Intelligent Pipeline)
  const handleGenerate = async (customFontSize?: number) => {
    // If we already have an image and are just adjusting size, skip the AI processing
    if (customFontSize !== undefined && generatedImage) {
      // Just regenerate image with new size
      // ... (existing logic for simple regeneration)
    } else {
      // Full generation flow
      if (!verse.trim()) {
        setError('Please enter some text to start.');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Step 1: Process Input (AI Intent & Content)
        // Only do this if we don't have a generated image yet, or if the user explicitly clicked "Generate"
        // For now, we'll assume every "Generate" click triggers the pipeline unless it's a size adjustment

        let finalVerse = verse;
        let finalRef = reference;
        let finalBg = selectedBackground;

        // Call Process API
        const processRes = await fetch(`${API_BASE}/api/process-input`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: verse })
        });

        if (!processRes.ok) {
          // Fallback: If process fails, just use what the user typed
          console.warn('AI Processing failed, using raw input');
        } else {
          const processData = await processRes.json();
          if (processData.error) {
            // If it's an off-topic error, stop here
            if (processData.type === 'OFF_TOPIC') {
              throw new Error(processData.error);
            }
          } else {
            // Success! Update state with AI results
            finalVerse = processData.verse;
            finalRef = processData.reference || '';
            finalBg = processData.backgroundId;

            setVerse(finalVerse);
            setReference(finalRef);
            if (finalBg) setSelectedBackground(finalBg);
          }
        }

        // Step 2: Generate Image (Nano Banana Pro)
        const fontSizeToUse = customFontSize !== undefined ? customFontSize : fontSize;
        const requestBody = {
          verse: finalVerse,
          reference: finalRef,
          backgroundId: finalBg || backgrounds[0]?.id, // Fallback
          devicePreset: selectedPreset,
          fontFamily: selectedFont,
          fontSize: useAI ? null : fontSizeToUse,
          useAI,
          useProFont
        };

        const response = await fetch(`${API_BASE}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Generation failed');
        }

        const data = await response.json();
        setGeneratedImage(data.image);
        setFontSize(data.fontSize);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate image');
      } finally {
        setLoading(false);
      }
    }
  };

  // Adjust font size and regenerate
  const adjustFontSize = (delta: number) => {
    if (fontSize === null) return;
    const newSize = fontSize + delta;
    setFontSize(newSize);
    handleGenerate(newSize);
  };

  // Regenerate with current font size
  const handleRegenerate = () => {
    handleGenerate(undefined);
  };

  // Download image
  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `inspired-wallpaper-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen relative font-body text-navy selection:bg-primary/20">
      <OrganicBackground />

      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden pt-10 pb-20">
        <div className="relative z-10 w-full max-w-2xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="inline-flex items-center justify-center p-3 bg-white/50 rounded-full mb-6 shadow-sm backdrop-blur-sm">
              <PenTool className="w-6 h-6 text-primary" />
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-medium text-navy mb-6 leading-tight tracking-tight">
              Inspired <span className="text-primary italic">Wallpapers</span>
            </h1>

            <p className="text-lg md:text-xl text-stone font-light max-w-md mx-auto leading-relaxed mb-8">
              Transform your favorite quotes and verses into beautiful, organic phone wallpapers.
            </p>


          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main id="create" className="max-w-3xl mx-auto px-4 md:px-8 pb-24 relative z-10">

        {/* Error Display */}
        {error && (
          <div className="flex items-start gap-3 p-4 mb-6 bg-error-light border border-error/20 rounded-xl text-error text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Step 1: Magic Input */}
        <section className="bg-surface rounded-3xl p-6 md:p-8 organic-shadow mb-8 border border-stone-light/20">
          <div className="mb-6 text-center">
            <h3 className="font-display text-2xl md:text-3xl font-medium text-navy mb-2">
              Your Inspiration
            </h3>
            <OrganicDivider className="opacity-60 scale-75" />
          </div>

          <div className="relative">
            <textarea
              value={verse}
              onChange={(e) => setVerse(e.target.value)}
              placeholder="Paste a verse, type a reference (e.g. John 3:16), or ask for a theme (e.g. Hope)..."
              className="w-full min-h-40 p-5 border border-stone-light rounded-2xl text-navy text-lg placeholder:text-stone/40 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all resize-y bg-page/50 leading-relaxed font-display"
            />
            {loading && !generatedImage && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <span className="text-sm font-medium text-navy">Analyzing...</span>
                </div>
              </div>
            )}
          </div>

          {/* Hidden reference input (populated by AI) */}
          {reference && (
            <div className="mt-4 p-3 bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-between">
              <span className="text-sm font-medium text-primary">Ref: {reference}</span>
              <button onClick={() => setReference('')} className="text-xs text-primary/60 hover:text-primary">Clear</button>
            </div>
          )}
        </section>

        {/* Step 2: Choose Background */}
        <BackgroundGallerySection
          backgrounds={backgrounds}
          selectedBackground={selectedBackground}
          setSelectedBackground={setSelectedBackground}
        />

        {/* Step 3: Device Size */}
        <section className="bg-surface rounded-3xl p-6 md:p-8 organic-shadow mb-8 border border-stone-light/20">
          <div className="mb-6 text-center">
            <h3 className="font-display text-2xl md:text-3xl font-medium text-navy mb-2">
              Format
            </h3>
            <OrganicDivider className="opacity-60 scale-75" />
          </div>

          <div className="relative">
            <select
              value={selectedPreset}
              onChange={(e) => setSelectedPreset(e.target.value)}
              className="w-full p-4 border border-stone-light rounded-2xl text-navy text-base bg-page/50 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all appearance-none cursor-pointer"
            >
              {devicePresets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name} ({preset.width} × {preset.height})
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone">
              <ImageIcon className="w-5 h-5" />
            </div>
          </div>
        </section>

        {/* Generate Button */}
        <div className="mb-12">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => handleGenerate()}
            disabled={loading || !isValidLength}
            className="w-full px-8 py-5 bg-navy hover:bg-charcoal text-white font-medium text-lg rounded-2xl transition-all shadow-lg hover:shadow-xl disabled:bg-stone-light disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Creating Art...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 text-primary" />
                Generate Wallpaper
              </>
            )}
          </motion.button>
        </div>

        {/* Preview & Adjust */}
        {generatedImage && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-surface rounded-[2.5rem] p-8 md:p-10 organic-shadow border border-stone-light/20"
          >
            <div className="text-center mb-8">
              <h3 className="font-display text-3xl font-medium text-navy mb-2">
                Your Creation
              </h3>
              <p className="text-stone text-sm">Customize and download</p>
            </div>

            <div className="grid md:grid-cols-2 gap-10 items-start">
              {/* Raw Image Preview */}
              <div className="order-2 md:order-1 flex justify-center">
                <div className="relative shadow-2xl rounded-lg overflow-hidden border-4 border-white/10 max-w-[300px]">
                  <img
                    src={generatedImage}
                    alt="Generated Wallpaper"
                    className="w-full h-auto"
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="order-1 md:order-2 space-y-8 pt-4">


                {/* AI Status Indicator */}
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 text-center">
                  <p className="text-purple-800 font-medium text-sm">✨ Nano Banana Pro Active</p>
                  <p className="text-purple-600/80 text-xs mt-1">AI is crafting the perfect typography for this moment.</p>
                </div>



                {/* Actions */}
                <div className="space-y-3 pt-4">
                  <button
                    onClick={handleDownload}
                    className="w-full px-6 py-4 bg-primary hover:bg-primary-hover text-white font-medium rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download
                  </button>
                  <button
                    onClick={handleRegenerate}
                    disabled={loading}
                    className="w-full px-6 py-4 border border-stone-light hover:bg-stone-light/10 text-navy font-medium rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Regenerate
                  </button>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </main>

      {/* Footer */}
      <footer className="py-10 text-center text-stone/60 text-sm">
        <p>© 2025 Inspired Wallpapers</p>
      </footer>
    </div>
  );
}

export default App;
