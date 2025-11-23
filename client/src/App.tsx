import { useState, useEffect } from 'react';
import { Minus, Plus, Download, RefreshCw, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { LightRays } from './components/LightRays';
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

// Background Gallery Component with scroll-triggered animations
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
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section ref={sectionRef} className="bg-surface/80 backdrop-blur-sm rounded-2xl p-8 shadow-glow-sm mb-8 border border-primary/10">
      <div className="text-center mb-8">
        <h3 className="font-display text-3xl font-semibold text-navy mb-3 text-glow">
          Choose Your Sacred Backdrop
        </h3>
        <GoldenAccent variant="line" className="mx-auto mb-4 opacity-50" />
        <p className="text-stone">Select from our curated collection of inspiring imagery</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {backgrounds.map((bg, index) => (
          <motion.button
            key={bg.id}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            onClick={() => setSelectedBackground(bg.id)}
            className={`group relative aspect-[9/16] rounded-xl overflow-hidden border-3 transition-all duration-300 ${
              selectedBackground === bg.id
                ? 'border-primary shadow-glow-golden scale-[1.02]'
                : 'border-transparent hover:border-primary/30 hover:shadow-glow-sm hover:scale-[1.01]'
            }`}
          >
            <img
              src={bg.thumbnailUrl}
              alt={bg.filename}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Overlay with glow effect */}
            <div className={`absolute inset-0 transition-opacity duration-300 ${
              selectedBackground === bg.id
                ? 'bg-gradient-to-t from-primary/20 via-transparent to-transparent'
                : 'bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100'
            }`} />

            {/* Selected indicator with radial glow */}
            {selectedBackground === bg.id && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute top-4 right-4"
              >
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-navy shadow-glow-lg">
                  <Sparkles className="w-5 h-5" />
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
      {/* Floating particles atmosphere */}
      <FloatingParticles />

      {/* Ethereal Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Animated light rays background */}
        <LightRays />

        {/* Radial golden gradient overlay */}
        <div className="absolute inset-0 bg-radial-golden pointer-events-none" />

        {/* Hero content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 text-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <Sparkles className="w-12 h-12 mx-auto mb-6 text-primary opacity-70 animate-glow-pulse" />

            <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-bold text-navy mb-6 text-glow-strong leading-tight">
              Sacred Lock Screens
            </h1>

            <GoldenAccent variant="line" className="mx-auto mb-8 opacity-60" />

            <p className="text-xl md:text-2xl text-charcoal font-light max-w-3xl mx-auto leading-relaxed mb-4">
              Transform your daily devotion into beautiful art
            </p>

            <p className="text-lg text-stone max-w-2xl mx-auto leading-relaxed">
              Create stunning, readable Bible verse lock screens with guaranteed text accuracy.
              Paste any verse and watch it come alive with ethereal beauty.
            </p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="mt-12"
            >
              <a
                href="#create"
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-hover text-navy font-semibold rounded-lg transition-all shadow-glow-md hover:shadow-glow-lg"
              >
                Begin Creating
                <Sparkles className="w-5 h-5" />
              </a>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-primary rounded-full flex items-start justify-center p-2 opacity-50 animate-glow-pulse">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-1.5 h-1.5 bg-primary rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Main Content */}
      <main id="create" className="max-w-3xl mx-auto px-6 md:px-12 py-16 relative z-10">

        {/* Error Display */}
        {error && (
          <div className="flex items-start gap-3 p-4 mb-6 bg-error-light border border-error rounded-lg text-error text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Enter Verse - Refined Design */}
        <section className="bg-surface/80 backdrop-blur-sm rounded-2xl p-8 shadow-glow-sm mb-8 border border-primary/10">
          <div className="text-center mb-6">
            <h3 className="font-display text-3xl font-semibold text-navy mb-3 text-glow">
              Begin With Scripture
            </h3>
            <GoldenAccent variant="line" className="mx-auto mb-4 opacity-50" />
            <p className="text-stone">Share the verse that speaks to your heart</p>
          </div>

          <label className="block text-sm font-display font-medium text-charcoal mb-3">
            Verse Text
          </label>
          <textarea
            value={verse}
            onChange={(e) => setVerse(e.target.value)}
            placeholder="Enter your Bible verse here..."
            className="w-full min-h-36 p-5 border-2 border-primary/20 rounded-xl text-navy placeholder:text-stone/50 focus:outline-none focus:border-primary focus:shadow-glow-sm transition-all resize-y bg-surface/80 backdrop-blur-sm leading-relaxed"
          />
          <div className={`text-right text-sm mt-2 font-medium ${
            charCount > 500 ? 'text-error' : charCount > 400 ? 'text-coral' : 'text-stone'
          }`}>
            {charCount}/500 characters
          </div>

          <label className="block text-sm font-display font-medium text-charcoal mb-3 mt-6">
            Verse Reference
          </label>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g., John 3:16"
            className="w-full p-4 border-2 border-primary/20 rounded-xl text-navy placeholder:text-stone/50 focus:outline-none focus:border-primary focus:shadow-glow-sm transition-all bg-surface/80 backdrop-blur-sm"
          />
        </section>

        {/* Step 2: Choose Background - Immersive Gallery */}
        <BackgroundGallerySection
          backgrounds={backgrounds}
          selectedBackground={selectedBackground}
          setSelectedBackground={setSelectedBackground}
        />

        {/* Step 3: Screen Size - Refined Design */}
        <section className="bg-surface/80 backdrop-blur-sm rounded-2xl p-8 shadow-glow-sm mb-10 border border-primary/10">
          <div className="text-center mb-6">
            <h3 className="font-display text-3xl font-semibold text-navy mb-3 text-glow">
              Select Your Device
            </h3>
            <GoldenAccent variant="line" className="mx-auto mb-4 opacity-50" />
            <p className="text-stone">Choose the perfect dimensions for your screen</p>
          </div>

          <select
            value={selectedPreset}
            onChange={(e) => setSelectedPreset(e.target.value)}
            className="w-full p-4 border-2 border-primary/20 rounded-xl text-navy bg-surface/80 backdrop-blur-sm focus:outline-none focus:border-primary focus:shadow-glow-sm transition-all cursor-pointer font-medium"
          >
            {devicePresets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name} ({preset.width} × {preset.height})
              </option>
            ))}
          </select>
        </section>

        {/* Generate Button - Glowing CTA */}
        <div className="flex justify-center mb-16">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleGenerate()}
            disabled={loading || !isValidLength}
            className="px-12 py-5 bg-primary hover:bg-primary-hover text-navy font-display font-bold text-lg rounded-xl transition-all shadow-glow-golden hover:shadow-glow-radial disabled:bg-stone-light disabled:text-stone disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Creating Your Masterpiece...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                Generate Sacred Image
              </>
            )}
          </motion.button>
        </div>

        {/* Preview & Adjust - Celebratory Reveal */}
        {generatedImage && (
          <motion.section
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-gradient-to-br from-surface/90 via-surface/80 to-surface/90 backdrop-blur-sm rounded-2xl p-10 shadow-glow-golden border border-primary/20 relative overflow-hidden"
          >
            {/* Decorative golden circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-coral/5 rounded-full blur-3xl -z-10" />

            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                <Sparkles className="w-10 h-10 mx-auto mb-4 text-primary animate-glow-pulse" />
              </motion.div>
              <h3 className="font-display text-3xl font-semibold text-navy mb-2 text-glow">
                Your Sacred Creation
              </h3>
              <p className="text-stone">Adjust and perfect your lock screen</p>
            </div>

            <div className="flex flex-col items-center">
              {/* Image preview with radial glow background */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent blur-2xl" />
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="relative bg-gradient-to-br from-stone-light/30 to-stone-light/10 p-6 rounded-2xl shadow-glow-md"
                >
                  <img
                    src={generatedImage}
                    alt="Generated lock screen"
                    className="max-w-full max-h-[500px] rounded-xl shadow-2xl"
                  />
                </motion.div>
              </div>

              {/* Font and Size Controls - Refined Design */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex flex-col items-center gap-6 mt-10 w-full max-w-md"
              >
                {/* Font Selector */}
                <div className="w-full">
                  <label className="block text-sm font-display font-medium text-charcoal mb-2 text-center">
                    Typography
                  </label>
                  <select
                    value={selectedFont}
                    onChange={(e) => setSelectedFont(e.target.value)}
                    className="w-full px-5 py-3 border-2 border-primary/20 rounded-xl text-navy bg-surface/80 backdrop-blur-sm focus:outline-none focus:border-primary focus:shadow-glow-sm transition-all cursor-pointer font-medium"
                    style={{ fontFamily: selectedFont }}
                  >
                    {fonts.map((font) => (
                      <option
                        key={font.id}
                        value={font.id}
                        style={{ fontFamily: font.id }}
                      >
                        {font.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Font Size Controls */}
                <div className="w-full">
                  <label className="block text-sm font-display font-medium text-charcoal mb-3 text-center">
                    Text Size
                  </label>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => adjustFontSize(-5)}
                      className="w-12 h-12 flex items-center justify-center border-2 border-primary/30 rounded-xl hover:border-primary hover:shadow-glow-sm hover:bg-primary/5 transition-all text-primary"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col items-center gap-1">
                      <input
                        type="number"
                        value={fontSize || ''}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val) && val > 0) {
                            setFontSize(val);
                          }
                        }}
                        className="w-24 px-3 py-2 text-center border-2 border-primary/20 rounded-xl text-lg font-semibold text-navy bg-surface/80 focus:outline-none focus:border-primary focus:shadow-glow-sm transition-all"
                        placeholder="72"
                        min="10"
                        max="200"
                      />
                      <span className="text-xs text-stone font-medium">
                        pixels
                      </span>
                    </div>
                    <button
                      onClick={() => adjustFontSize(5)}
                      className="w-12 h-12 flex items-center justify-center border-2 border-primary/30 rounded-xl hover:border-primary hover:shadow-glow-sm hover:bg-primary/5 transition-all text-primary"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Action Buttons - Glowing CTAs */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="flex gap-4 mt-10"
              >
                <button
                  onClick={handleRegenerate}
                  disabled={loading}
                  className="px-8 py-4 border-2 border-teal text-teal font-semibold rounded-xl hover:bg-teal-light hover:shadow-glow-sm transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className="w-5 h-5" />
                  Regenerate
                </button>
                <button
                  onClick={handleDownload}
                  className="px-8 py-4 bg-primary hover:bg-primary-hover text-navy font-semibold rounded-xl shadow-glow-md hover:shadow-glow-lg transition-all flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download
                </button>
              </motion.div>
            </div>
          </motion.section>
        )}
      </main>

      {/* Footer - Elegant and Ethereal */}
      <footer className="relative border-t border-primary/10 py-12 mt-24 text-center">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
        <div className="relative">
          <GoldenAccent variant="circle" className="mx-auto mb-4 opacity-30" />
          <p className="text-sm text-stone font-light">
            © 2025 WhitePine Tech · Crafted with devotion
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
