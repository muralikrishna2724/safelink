import { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import UrlInput from './components/UrlInput.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import ResultCard from './components/ResultCard.jsx';
import HistoryPanel from './components/HistoryPanel.jsx';
import { checkUrl } from './services/checkUrl.js';
import { getHistory, addToHistory, clearHistory } from './utils/history.js';

function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [checkedUrl, setCheckedUrl] = useState('');
  const [history, setHistory] = useState([]);

  // Initialize history from localStorage on mount
  useEffect(() => {
    setHistory(getHistory());
  }, []);

  // Handle URL check submission
  const handleCheck = async (url) => {
    setLoading(true);
    setCheckedUrl(url);
    setResult(null);

    try {
      // Call checkUrl service
      const checkResult = await checkUrl(url);
      
      // Update result state
      setResult(checkResult);

      // Create history entry
      const historyEntry = {
        url,
        verdict: checkResult.verdict,
        timestamp: new Date().toISOString()
      };

      // Add to history
      addToHistory(historyEntry);
      
      // Update history state
      setHistory(getHistory());
    } catch (error) {
      // If checkUrl throws, show UNKNOWN verdict
      setResult({
        verdict: 'UNKNOWN',
        sources: []
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle clear history
  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  // Handle recheck from history
  const handleRecheck = (url) => {
    handleCheck(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ShieldCheck size={48} className="text-emerald-600" />
            <h1 className="text-4xl font-bold text-gray-800">SafeLink</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Check if a URL is safe before you visit it
          </p>
        </header>

        {/* Main content */}
        <main className="max-w-2xl mx-auto space-y-8">
          {/* URL Input */}
          <UrlInput onSubmit={handleCheck} loading={loading} />

          {/* Loading spinner or Result card */}
          {loading && <LoadingSpinner />}
          {!loading && result && <ResultCard result={result} url={checkedUrl} />}

          {/* History Panel */}
          <HistoryPanel
            history={history}
            onClear={handleClearHistory}
            onRecheck={handleRecheck}
          />
        </main>

        {/* Footer */}
        <footer className="text-center mt-16 text-sm text-gray-500">
          <p>
            SafeLink checks URLs against Google Safe Browsing and URLhaus.
            Results are for informational purposes only.
          </p>
          <p className="mt-2">
            Always exercise caution when visiting unfamiliar websites.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
