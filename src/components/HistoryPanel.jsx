import { useState } from 'react';
import { History, Trash2, ChevronDown, ChevronUp, ShieldCheck, ShieldAlert, ShieldQuestion, RotateCw } from 'lucide-react';

export default function HistoryPanel({ history, onClear, onRecheck }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get verdict icon and color
  const getVerdictDisplay = (verdict) => {
    switch (verdict) {
      case 'SAFE':
        return {
          Icon: ShieldCheck,
          iconClass: 'text-emerald-600',
          textClass: 'text-emerald-700'
        };
      case 'UNSAFE':
        return {
          Icon: ShieldAlert,
          iconClass: 'text-red-600',
          textClass: 'text-red-700'
        };
      case 'UNKNOWN':
        return {
          Icon: ShieldQuestion,
          iconClass: 'text-yellow-600',
          textClass: 'text-yellow-700'
        };
      default:
        return {
          Icon: ShieldQuestion,
          iconClass: 'text-gray-600',
          textClass: 'text-gray-700'
        };
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleString();
    } catch (error) {
      return timestamp;
    }
  };

  // If no history, don't render anything
  if (!history || history.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto border border-gray-300 rounded-lg bg-white">
      {/* Header - collapsible toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <History size={20} className="text-gray-600" />
          <span className="font-semibold text-gray-700">
            Check History ({history.length})
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp size={20} className="text-gray-600" />
        ) : (
          <ChevronDown size={20} className="text-gray-600" />
        )}
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          {/* History entries */}
          <div className="divide-y divide-gray-200">
            {history.map((entry, index) => {
              const { Icon, iconClass, textClass } = getVerdictDisplay(entry.verdict);
              
              return (
                <div
                  key={index}
                  className="px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* Verdict icon */}
                    <Icon size={20} className={`${iconClass} flex-shrink-0 mt-0.5`} />
                    
                    {/* Entry details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-semibold text-sm ${textClass}`}>
                          {entry.verdict}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(entry.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 break-all">
                        {entry.url}
                      </p>
                    </div>

                    {/* Recheck button */}
                    <button
                      onClick={() => onRecheck(entry.url)}
                      className="flex-shrink-0 p-1.5 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                      title="Recheck this URL"
                    >
                      <RotateCw size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Clear history button */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClear}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-300 rounded-lg transition-colors"
            >
              <Trash2 size={16} />
              Clear History
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
