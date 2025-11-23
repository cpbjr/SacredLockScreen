import { useState, useEffect } from 'react';
import { Minus, Plus, Download, RefreshCw, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { FloatingParticles } from './components/FloatingParticles';
import { GoldenAccent } from './components/GoldenAccent';

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

// Background Gallery Component - Mobile-First (375px optimized)
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
    <section ref={sectionRef} className="bg-surface rounded-2xl p-5 md:p-7 shadow-sm mb-6 border border-stone-light/30">
      <div className="mb-5">
        <h3 className="font-display text-2xl md:text-3xl font-semibold text-navy mb-2 text-center">
          Choose Background
        </h3>
        <GoldenAccent variant="line" className="mx-auto mb-3 opacity-40 scale-75" />
      </div>

      {/* Mobile-optimized: 2 columns, compact spacing */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        {backgrounds.map((bg, index) => (
          <motion.button
            key={bg.id}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            onClick={() => setSelectedBackground(bg.id)}
            className={`group relative aspect-[9/16] rounded-xl overflow-hidden border-2 transition-all duration-300 touch-manipulation ${
              selectedBackground === bg.id
                ? 'border-primary shadow-glow-md scale-[0.98]'
                : 'border-stone-light/40 active:scale-[0.96]'
            }`}
          >
            <img
              src={bg.thumbnailUrl}
              alt={bg.filename}
              className="w-full h-full object-cover transition-transform duration-300"
            />

            {/* Subtle overlay */}
            <div className={`absolute inset-0 transition-opacity duration-300 ${
              selectedBackground === bg.id
                ? 'bg-gradient-to-t from-primary/15 via-transparent to-transparent'
                : 'bg-gradient-to-t from-black/5 via-transparent to-transparent'
            }`} />

            {/* Selected indicator - compact for mobile */}
            {selectedBackground === bg.id && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute top-2 right-2"
              >
                <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-navy shadow-glow-md">
                  <Sparkles className="w-3.5 h-3.5" />
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
    };
    return fontMap[fontId] || 'serif';
  };

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
      setError('Verse must be between 10 and 500 characters');
      return;
    }

    setLoading(true);
    setError(null);

    const fontSizeToUse = customFontSize !== undefined ? customFontSize : fontSize;

    const requestBody: any = {
      verse,
      reference,
      backgroundId: selectedBackground,
      devicePreset: selectedPreset,
      fontFamily: selectedFont,
    };

    // Only include fontSize if it's explicitly set
    if (fontSizeToUse !== null && fontSizeToUse !== undefined) {
      requestBody.fontSize = fontSizeToUse;
    }

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
    link.download = `sacred-lockscreen-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen relative">
      {/* Subtle atmospheric particles - reduced for mobile */}
      <FloatingParticles />

      {/* Mobile-Optimized Hero Section - Simplified */}
      <section className="relative min-h-[60vh] md:min-h-[75vh] flex items-center justify-center overflow-hidden">
        {/* Simplified light rays for mobile performance */}
        <div className="absolute inset-0 bg-gradient-to-b from-page via-surface to-page opacity-80" />

        {/* Gentle golden radial glow */}
        <div className="absolute inset-0 bg-radial-golden pointer-events-none opacity-60" />

        {/* Compact Hero Content - Mobile First */}
        <div className="relative z-10 w-full max-w-xl mx-auto px-5 text-center py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Smaller icon for mobile */}
            <Sparkles className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-5 text-primary opacity-70 animate-glow-pulse" />

            {/* Responsive heading - mobile optimized */}
            <h1 className="font-display text-4xl md:text-6xl font-bold text-navy mb-5 text-glow-strong leading-tight px-4">
              Sacred Lock Screens
            </h1>

            <GoldenAccent variant="line" className="mx-auto mb-6 opacity-60 scale-90" />

            {/* Concise tagline for mobile */}
            <p className="text-lg md:text-xl text-charcoal font-light max-w-md mx-auto leading-relaxed mb-3 px-4">
              Transform scripture into beautiful phone wallpapers
            </p>

            <p className="text-sm md:text-base text-stone max-w-sm mx-auto leading-relaxed px-6">
              AI-powered text sizing ensures every verse is perfectly readable
            </p>

            {/* Sticky CTA - thumb-friendly */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mt-8"
            >
              <a
                href="#create"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary hover:bg-primary-hover active:scale-95 text-navy font-semibold rounded-xl transition-all shadow-glow-md text-base touch-manipulation"
              >
                Begin Creating
                <Sparkles className="w-4 h-4" />
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator - subtle on mobile */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:block"
        >
          <div className="w-5 h-8 border-2 border-primary rounded-full flex items-start justify-center p-1.5 opacity-50">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-1 h-1 bg-primary rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Main Content - Mobile-First Cards */}
      <main id="create" className="max-w-2xl mx-auto px-4 md:px-8 py-10 md:py-16 relative z-10">

        {/* Error Display - Mobile Optimized */}
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 mb-5 bg-error-light border-l-4 border-error rounded-lg text-error text-sm shadow-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Step 1: Enter Verse - Minimalist Mobile Card */}
        <section className="bg-surface rounded-2xl p-5 md:p-7 shadow-sm mb-6 border border-stone-light/30">
          <div className="mb-5">
            <h3 className="font-display text-2xl md:text-3xl font-semibold text-navy mb-2 text-center">
              Your Scripture
            </h3>
            <GoldenAccent variant="line" className="mx-auto mb-3 opacity-40 scale-75" />
          </div>

          <label className="block text-xs uppercase tracking-wide font-medium text-stone mb-2">
            Verse Text
          </label>
          <textarea
            value={verse}
            onChange={(e) => setVerse(e.target.value)}
            placeholder="Paste your favorite verse..."
            className="w-full min-h-32 p-4 border-2 border-stone-light/50 rounded-xl text-navy text-base placeholder:text-stone/40 focus:outline-none focus:border-primary focus:shadow-glow-sm transition-all resize-y bg-surface leading-relaxed touch-manipulation"
          />
          <div className={`text-right text-xs mt-1.5 font-medium ${
            charCount > 500 ? 'text-error' : charCount > 400 ? 'text-coral' : 'text-stone/60'
          }`}>
            {charCount}/500
          </div>

          <label className="block text-xs uppercase tracking-wide font-medium text-stone mb-2 mt-5">
            Reference (Optional)
          </label>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="John 3:16"
            className="w-full p-3.5 border-2 border-stone-light/50 rounded-xl text-navy text-base placeholder:text-stone/40 focus:outline-none focus:border-primary focus:shadow-glow-sm transition-all bg-surface touch-manipulation"
          />
        </section>

        {/* Step 2: Choose Background - Immersive Gallery */}
        <BackgroundGallerySection
          backgrounds={backgrounds}
          selectedBackground={selectedBackground}
          setSelectedBackground={setSelectedBackground}
        />

        {/* Step 3: Device Size - Mobile Minimalist */}
        <section className="bg-surface rounded-2xl p-5 md:p-7 shadow-sm mb-6 border border-stone-light/30">
          <div className="mb-4">
            <h3 className="font-display text-2xl md:text-3xl font-semibold text-navy mb-2 text-center">
              Device Size
            </h3>
            <GoldenAccent variant="line" className="mx-auto mb-3 opacity-40 scale-75" />
          </div>

          <select
            value={selectedPreset}
            onChange={(e) => setSelectedPreset(e.target.value)}
            className="w-full p-3.5 border-2 border-stone-light/50 rounded-xl text-navy text-base bg-surface focus:outline-none focus:border-primary focus:shadow-glow-sm transition-all cursor-pointer font-medium touch-manipulation"
          >
            {devicePresets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name} ({preset.width} × {preset.height})
              </option>
            ))}
          </select>
        </section>

        {/* Generate Button - Full-Width Mobile CTA */}
        <div className="mb-10">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => handleGenerate()}
            disabled={loading || !isValidLength}
            className="w-full px-6 py-4 bg-primary active:bg-primary-hover text-navy font-display font-bold text-lg rounded-xl transition-all shadow-glow-md disabled:bg-stone-light disabled:text-stone disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2.5 touch-manipulation"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                Generate Lock Screen
              </>
            )}
          </motion.button>
        </div>

        {/* Preview & Adjust - Mobile-Optimized Results */}
        {generatedImage && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="bg-surface rounded-2xl p-5 md:p-7 shadow-glow-md border border-primary/20"
          >
            <div className="text-center mb-5">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 180 }}
              >
                <Sparkles className="w-8 h-8 mx-auto mb-3 text-primary opacity-80" />
              </motion.div>
              <h3 className="font-display text-2xl font-semibold text-navy mb-1">
                Your Lock Screen
              </h3>
              <p className="text-xs text-stone uppercase tracking-wide">Customize below</p>
            </div>

            {/* Image Preview - Mobile Centered */}
            <div className="flex justify-center mb-6">
              <motion.div
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="bg-stone-light/10 p-3 rounded-xl shadow-lg"
              >
                <img
                  src={generatedImage}
                  alt="Generated lock screen"
                  className="max-w-full max-h-[420px] rounded-lg shadow-xl"
                />
              </motion.div>
            </div>

            {/* Font and Size Controls - Mobile Stacked */}
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="space-y-5 mb-6"
            >
              {/* Font Selector */}
              <div>
                <label className="block text-xs uppercase tracking-wide font-medium text-stone mb-2">
                  Font Style
                </label>
                <select
                  value={selectedFont}
                  onChange={(e) => setSelectedFont(e.target.value)}
                  className="w-full p-3.5 border-2 border-stone-light/50 rounded-xl text-navy text-base bg-surface focus:outline-none focus:border-primary focus:shadow-glow-sm transition-all cursor-pointer font-medium touch-manipulation"
                  style={{ fontFamily: getFontFamily(selectedFont) }}
                >
                  {fonts.map((font) => (
                    <option
                      key={font.id}
                      value={font.id}
                      style={{ fontFamily: getFontFamily(font.id) }}
                    >
                      {font.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Font Size Controls - Mobile Thumb-Friendly */}
              <div>
                <label className="block text-xs uppercase tracking-wide font-medium text-stone mb-2">
                  Text Size
                </label>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => adjustFontSize(-5)}
                    className="w-12 h-12 flex items-center justify-center border-2 border-primary/40 rounded-xl active:bg-primary/10 transition-all text-primary touch-manipulation"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <div className="flex flex-col items-center">
                    <input
                      type="number"
                      value={fontSize || ''}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val > 0) {
                          setFontSize(val);
                        }
                      }}
                      className="w-20 px-3 py-2.5 text-center border-2 border-stone-light/50 rounded-xl text-lg font-semibold text-navy bg-surface focus:outline-none focus:border-primary focus:shadow-glow-sm transition-all touch-manipulation"
                      placeholder="72"
                      min="10"
                      max="200"
                    />
                    <span className="text-xs text-stone/60 font-medium mt-1">
                      px
                    </span>
                  </div>
                  <button
                    onClick={() => adjustFontSize(5)}
                    className="w-12 h-12 flex items-center justify-center border-2 border-primary/40 rounded-xl active:bg-primary/10 transition-all text-primary touch-manipulation"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons - Mobile Stacked Full-Width */}
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-col gap-3"
            >
              <button
                onClick={handleDownload}
                className="w-full px-6 py-3.5 bg-primary active:bg-primary-hover text-navy font-semibold rounded-xl shadow-glow-md transition-all flex items-center justify-center gap-2 touch-manipulation"
              >
                <Download className="w-5 h-5" />
                Download Lock Screen
              </button>
              <button
                onClick={handleRegenerate}
                disabled={loading}
                className="w-full px-6 py-3.5 border-2 border-teal text-teal font-semibold rounded-xl active:bg-teal-light transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              >
                <RefreshCw className="w-5 h-5" />
                Regenerate
              </button>
            </motion.div>
          </motion.section>
        )}
      </main>

      {/* Footer - Minimal Mobile */}
      <footer className="relative border-t border-stone-light/20 py-8 mt-16 text-center">
        <div className="relative">
          <GoldenAccent variant="circle" className="mx-auto mb-3 opacity-20 scale-75" />
          <p className="text-xs text-stone/70">
            © 2025 WhitePine Tech
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
