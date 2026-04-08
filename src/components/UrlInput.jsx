import { useState } from 'react';
import { Search } from 'lucide-react';
import { isValidUrl } from '../utils/validateUrl.js';

export default function UrlInput({ onSubmit, loading }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Clear previous error
    setError('');
    
    // Trim whitespace
    const trimmedUrl = url.trim();
    
    // Validate: check if empty
    if (!trimmedUrl) {
      setError('URL required');
      return;
    }
    
    // Validate: check format
    if (!isValidUrl(trimmedUrl)) {
      setError('Invalid URL format. Please enter a valid http:// or https:// URL');
      return;
    }
    
    // Call onSubmit with trimmed URL
    onSubmit(trimmedUrl);
  };

  const handleChange = (e) => {
    setUrl(e.target.value);
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            onChange={handleChange}
            disabled={loading}
            maxLength={2048}
            placeholder="Paste a URL to check... e.g. https://example.com"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Search size={20} />
            Check
          </button>
        </div>
        
        {error && (
          <p className="text-red-600 text-sm px-1">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
