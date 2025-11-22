import { useState, useEffect } from 'react';
import { Minus, Plus, Download, RefreshCw, Loader2, AlertCircle } from 'lucide-react';

const API_BASE = 'http://localhost:3001';

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

function App() {
  // State
  const [verse, setVerse] = useState('');
  const [reference, setReference] = useState('');
  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [selectedBackground, setSelectedBackground] = useState<string>('');
  const [devicePresets, setDevicePresets] = useState<DevicePreset[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [fontSizeAdjustment, setFontSizeAdjustment] = useState(0);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [currentFontSize, setCurrentFontSize] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data
  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/backgrounds`).then(r => r.json()),
      fetch(`${API_BASE}/api/device-presets`).then(r => r.json()),
    ]).then(([bgs, presets]) => {
      setBackgrounds(bgs);
      if (bgs.length > 0) setSelectedBackground(bgs[0].id);
      setDevicePresets(presets);
      const defaultPreset = presets.find((p: DevicePreset) => p.isDefault);
      if (defaultPreset) setSelectedPreset(defaultPreset.id);
    }).catch(err => {
      setError('Failed to load data. Make sure the server is running.');
      console.error(err);
    });
  }, []);

  // Character count
  const charCount = verse.length;
  const isValidLength = charCount >= 10 && charCount <= 500;

  // Generate image
  const handleGenerate = async (overrideFontSizeAdjustment?: number) => {
    if (!isValidLength) {
      setError('Verse must be between 10 and 500 characters');
      return;
    }

    setLoading(true);
    setError(null);

    // Only use override if it's actually a number (not an event object)
    const adjustmentToUse = typeof overrideFontSizeAdjustment === 'number'
      ? overrideFontSizeAdjustment
      : fontSizeAdjustment;

    try {
      const response = await fetch(`${API_BASE}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verse,
          reference,
          backgroundId: selectedBackground,
          devicePreset: selectedPreset,
          fontSizeAdjustment: adjustmentToUse,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Generation failed');
      }

      const data = await response.json();
      setGeneratedImage(data.image);
      setCurrentFontSize(data.fontSize);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setLoading(false);
    }
  };

  // Adjust font size and regenerate
  const adjustFontSize = (delta: number) => {
    const newAdjustment = fontSizeAdjustment + delta;
    setFontSizeAdjustment(newAdjustment);
    // Immediately regenerate with the new adjustment value
    handleGenerate(newAdjustment);
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
    <div className="min-h-screen bg-page">
      {/* Header */}
      <header className="border-b border-stone-light py-6">
        <div className="max-w-3xl mx-auto px-6 md:px-12">
          <h1 className="text-xl font-semibold text-navy">Sacred Lock Screens</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 md:px-12 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-navy mb-4">
            Create Beautiful Scripture Lock Screens
          </h2>
          <p className="text-lg text-charcoal">
            Paste any Bible verse and instantly generate a professionally-formatted lock screen image.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-start gap-3 p-4 mb-6 bg-error-light border border-error rounded-lg text-error text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1: Enter Verse */}
        <section className="bg-surface rounded-xl p-6 shadow-sm mb-6">
          <h3 className="text-lg font-medium text-navy mb-4">Step 1: Enter Your Verse</h3>

          <label className="block text-sm font-medium text-charcoal mb-2">
            Verse Text
          </label>
          <textarea
            value={verse}
            onChange={(e) => setVerse(e.target.value)}
            placeholder="Enter your Bible verse here..."
            className="w-full min-h-32 p-4 border border-stone-light rounded-lg text-navy placeholder:text-stone focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal-light resize-y"
          />
          <div className={`text-right text-xs mt-2 ${
            charCount > 500 ? 'text-error' : charCount > 400 ? 'text-coral' : 'text-stone'
          }`}>
            {charCount}/500 characters
          </div>

          <label className="block text-sm font-medium text-charcoal mb-2 mt-4">
            Verse Reference
          </label>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g., John 3:16"
            className="w-full p-3 border border-stone-light rounded-lg text-navy placeholder:text-stone focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal-light"
          />
        </section>

        {/* Step 2: Choose Background */}
        <section className="bg-surface rounded-xl p-6 shadow-sm mb-6">
          <h3 className="text-lg font-medium text-navy mb-4">Step 2: Choose Background</h3>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {backgrounds.map((bg) => (
              <button
                key={bg.id}
                onClick={() => setSelectedBackground(bg.id)}
                className={`relative aspect-[9/16] rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                  selectedBackground === bg.id
                    ? 'border-primary ring-2 ring-primary'
                    : 'border-transparent hover:border-stone-light'
                }`}
              >
                <img
                  src={`${API_BASE}${bg.thumbnailUrl}`}
                  alt={bg.filename}
                  className="w-full h-full object-cover"
                />
                {selectedBackground === bg.id && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-navy text-sm font-semibold">
                    ✓
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Step 3: Screen Size */}
        <section className="bg-surface rounded-xl p-6 shadow-sm mb-6">
          <h3 className="text-lg font-medium text-navy mb-4">Step 3: Screen Size</h3>

          <select
            value={selectedPreset}
            onChange={(e) => setSelectedPreset(e.target.value)}
            className="w-full p-3 border border-stone-light rounded-lg text-navy bg-surface focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal-light cursor-pointer"
          >
            {devicePresets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name} ({preset.width} × {preset.height})
              </option>
            ))}
          </select>
        </section>

        {/* Generate Button */}
        <div className="flex justify-center mb-12">
          <button
            onClick={handleGenerate}
            disabled={loading || !isValidLength}
            className="px-8 py-4 bg-primary hover:bg-primary-hover text-navy font-semibold rounded-lg transition-colors disabled:bg-stone-light disabled:text-stone disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Image'
            )}
          </button>
        </div>

        {/* Preview & Adjust */}
        {generatedImage && (
          <section className="bg-surface rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-medium text-navy mb-4">Preview & Adjust</h3>

            <div className="flex flex-col items-center">
              <div className="bg-page p-4 rounded-lg">
                <img
                  src={generatedImage}
                  alt="Generated lock screen"
                  className="max-w-full max-h-[500px] rounded-lg shadow-xl"
                />
              </div>

              {/* Font Size Controls */}
              <div className="flex items-center gap-4 mt-6">
                <button
                  onClick={() => adjustFontSize(-5)}
                  className="w-11 h-11 flex items-center justify-center border border-stone-light rounded-lg hover:border-teal hover:text-teal transition-colors"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-sm font-medium text-charcoal min-w-[80px] text-center">
                  {fontSizeAdjustment >= 0 ? '+' : ''}{fontSizeAdjustment}%
                  {currentFontSize && <span className="block text-xs text-stone">({currentFontSize}px)</span>}
                </span>
                <button
                  onClick={() => adjustFontSize(5)}
                  className="w-11 h-11 flex items-center justify-center border border-stone-light rounded-lg hover:border-teal hover:text-teal transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleRegenerate}
                  disabled={loading}
                  className="px-6 py-3 border-2 border-teal text-teal font-medium rounded-lg hover:bg-teal-light transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className="w-5 h-5" />
                  Regenerate
                </button>
                <button
                  onClick={handleDownload}
                  className="px-6 py-3 border-2 border-teal text-teal font-medium rounded-lg hover:bg-teal-light transition-colors flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-light py-8 mt-16 text-center">
        <p className="text-sm text-stone">
          © 2025 WhitePine Tech
        </p>
      </footer>
    </div>
  );
}

export default App;
