import { useState } from 'react';
import { ShieldCheck, ShieldAlert, ShieldQuestion, Copy, CheckCheck } from 'lucide-react';

export default function ResultCard({ result, url }) {
  const [copyStatus, setCopyStatus] = useState('idle'); // 'idle' | 'success' | 'error'

  // Determine visual treatment based on verdict
  const getVerdictStyles = () => {
    switch (result.verdict) {
      case 'SAFE':
        return {
          containerClass: 'bg-emerald-50 border-emerald-200',
          iconClass: 'text-emerald-600',
          Icon: ShieldCheck,
          verdictClass: 'text-emerald-700',
          verdictText: 'SAFE'
        };
      case 'UNSAFE':
        return {
          containerClass: 'bg-red-50 border-red-200',
          iconClass: 'text-red-600',
          Icon: ShieldAlert,
          verdictClass: 'text-red-700',
          verdictText: 'UNSAFE'
        };
      case 'UNKNOWN':
        return {
          containerClass: 'bg-yellow-50 border-yellow-200',
          iconClass: 'text-yellow-600',
          Icon: ShieldQuestion,
          verdictClass: 'text-yellow-700',
          verdictText: 'UNKNOWN'
        };
      default:
        return {
          containerClass: 'bg-gray-50 border-gray-200',
          iconClass: 'text-gray-600',
          Icon: ShieldQuestion,
          verdictClass: 'text-gray-700',
          verdictText: 'UNKNOWN'
        };
    }
  };

  const handleCopy = async () => {
    // Check if clipboard API is available
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      setCopyStatus('error');
      return;
    }

    try {
      // Write verdict and URL to clipboard
      const textToCopy = `${result.verdict}: ${url}`;
      await navigator.clipboard.writeText(textToCopy);
      
      // Show success confirmation
      setCopyStatus('success');
      
      // Reset after 2 seconds
      setTimeout(() => {
        setCopyStatus('idle');
      }, 2000);
    } catch (error) {
      // Show error if clipboard write fails
      setCopyStatus('error');
    }
  };

  const styles = getVerdictStyles();
  const { Icon } = styles;

  // Get threat sources for UNSAFE verdict
  const threatSources = result.verdict === 'UNSAFE' 
    ? result.sources.filter(s => !s.safe && !s.error)
    : [];

  return (
    <div className={`w-full max-w-2xl mx-auto border-2 rounded-lg p-6 ${styles.containerClass}`}>
      {/* Header with icon and verdict */}
      <div className="flex items-start gap-4 mb-4">
        <Icon size={48} className={styles.iconClass} />
        <div className="flex-1">
          <h2 className={`text-2xl font-bold mb-2 ${styles.verdictClass}`}>
            {styles.verdictText}
          </h2>
          <p className="text-gray-700 break-all">
            {url}
          </p>
        </div>
      </div>

      {/* Threat badges for UNSAFE verdict */}
      {result.verdict === 'UNSAFE' && threatSources.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">Threats detected:</p>
          <div className="flex flex-wrap gap-2">
            {threatSources.map((source, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-300"
              >
                {source.source}: {source.threatType || 'Threat detected'}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Partial data indicator for SAFE with partial flag */}
      {result.verdict === 'SAFE' && result.partial && (
        <div className="mb-4 text-sm text-gray-600">
          <p>⚠️ Result based on partial data (one service unavailable)</p>
        </div>
      )}

      {/* Copy button */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
        >
          {copyStatus === 'success' ? (
            <>
              <CheckCheck size={18} className="text-emerald-600" />
              <span className="text-emerald-600">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={18} />
              <span>Copy Result</span>
            </>
          )}
        </button>

        {/* Error message if clipboard unavailable */}
        {copyStatus === 'error' && (
          <span className="text-sm text-red-600">
            Unable to copy to clipboard
          </span>
        )}
      </div>
    </div>
  );
}
