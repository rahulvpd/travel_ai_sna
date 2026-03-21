import { useState } from 'react';
import { generateHuggingFaceContent } from '../lib/huggingface';

const GeminiDemo = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResponse('');
    try {
      const text = await generateHuggingFaceContent([input]);
      setResponse(text);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-24 px-4">
      <h1 className="text-3xl font-bold mb-6">Gemini API Demo</h1>
      <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask Gemini something..."
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Asking...' : 'Ask'}
        </button>
      </form>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {response && (
        <div className="bg-gray-100 p-4 rounded shadow mt-4 whitespace-pre-line">
          {response}
        </div>
      )}
    </div>
  );
};

export default GeminiDemo;
