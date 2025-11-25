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

  const [useAI, setUseAI] = useState(false);


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

  // Generate image
  const handleGenerate = async (customFontSize?: number) => {
    if (!isValidLength) {
      setError('Text must be between 10 and 500 characters');
      return;
    }

    setLoading(true);
    setError(null);

    const fontSizeToUse = customFontSize !== undefined ? customFontSize : fontSize;

    const requestBody = {
      verse: verse.trim(),
      reference: reference.trim(),
      backgroundId: selectedBackground,
      devicePreset: selectedPreset,
      fontFamily: selectedFont,
      fontSize: useAI ? null : fontSizeToUse,
      useAI
    };

    try {
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

        {/* Step 1: Enter Text */}
        <section className="bg-surface rounded-3xl p-6 md:p-8 organic-shadow mb-8 border border-stone-light/20">
          <div className="mb-6 text-center">
            <h3 className="font-display text-2xl md:text-3xl font-medium text-navy mb-2">
              Your Inspiration
            </h3>
            <OrganicDivider className="opacity-60 scale-75" />
          </div>

          <label className="block text-xs uppercase tracking-wider font-semibold text-stone mb-3 ml-1">
            Message
          </label>
          <textarea
            value={verse}
            onChange={(e) => setVerse(e.target.value)}
            placeholder="Type a quote, verse, or thought..."
            className="w-full min-h-40 p-5 border border-stone-light rounded-2xl text-navy text-lg placeholder:text-stone/40 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all resize-y bg-page/50 leading-relaxed font-display"
          />
          <div className={`text-right text-xs mt-2 font-medium ${charCount > 500 ? 'text-error' : charCount > 400 ? 'text-coral' : 'text-stone/60'
            }`}>
            {charCount}/500
          </div>

          <label className="block text-xs uppercase tracking-wider font-semibold text-stone mb-3 mt-6 ml-1">
            Attribution (Optional)
          </label>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g., Marcus Aurelius or John 3:16"
            className="w-full p-4 border border-stone-light rounded-2xl text-navy text-base placeholder:text-stone/40 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all bg-page/50"
          />
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
                {/* Font Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-navy/70">Font Style</label>
                  <div className="grid grid-cols-2 gap-2">
                    {fonts.map(font => (
                      <button
                        key={font.id}
                        onClick={() => setSelectedFont(font.id)}
                        className={`p-2 text-sm rounded-md border transition-all ${selectedFont === font.id
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-navy border-stone-light hover:border-primary/50'
                          }`}
                        style={{ fontFamily: font.name }}
                      >
                        {font.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Layout Toggle */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 p-3 bg-white/50 rounded-lg border border-stone-light/50">
                    <div className="flex items-center h-5">
                      <input
                        id="ai-mode"
                        type="checkbox"
                        checked={useAI}
                        onChange={(e) => setUseAI(e.target.checked)}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="ai-mode" className="font-medium text-navy">Nano Banana AI Layout</label>
                      <p className="text-stone text-xs">Automatically adjusts size & spacing (Gemini)</p>
                    </div>
                  </div>

                </div>

                {/* Size Controls */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-stone mb-3">
                    Size
                  </label>
                  <div className="flex items-center gap-4 bg-page/50 p-2 rounded-2xl border border-stone-light/30">
                    <button
                      onClick={() => adjustFontSize(-5)}
                      className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-white transition-colors text-navy"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <div className="flex-1 text-center font-semibold text-lg text-navy">
                      {fontSize}px
                    </div>
                    <button
                      onClick={() => adjustFontSize(5)}
                      className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-white transition-colors text-navy"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
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
