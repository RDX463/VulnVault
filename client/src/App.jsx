import { useState } from 'react';
import { triggerScan } from './services/api';
import { Shield, Search, Server, AlertCircle, CheckCircle } from 'lucide-react';

function App() {
  const [target, setTarget] = useState('');
  const [scanType, setScanType] = useState('quick');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleScan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const data = await triggerScan(target, scanType);
      setResults(data);
    } catch (err) {
      setError(err.error || "Scan failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      {/* Header */}
      <header className="flex items-center gap-3 mb-10 border-b border-gray-700 pb-4">
        <Shield className="w-10 h-10 text-cyber-accent" />
        <h1 className="text-3xl font-bold tracking-tighter">VULN_VAULT <span className="text-xs text-gray-500 font-normal">v1.0.0</span></h1>
      </header>

      {/* Control Panel */}
      <div className="bg-cyber-light p-6 rounded-lg shadow-xl border border-gray-700 mb-8">
        <form onSubmit={handleScan} className="flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            placeholder="Target IP (e.g. 8.8.8.8)" 
            className="flex-1 bg-gray-900 border border-gray-600 rounded px-4 py-2 focus:outline-none focus:border-cyber-accent text-white"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            required
          />
          <select 
            className="bg-gray-900 border border-gray-600 rounded px-4 py-2 focus:outline-none text-white"
            value={scanType}
            onChange={(e) => setScanType(e.target.value)}
          >
            <option value="quick">Quick Scan</option>
            <option value="full">Full Scan</option>
          </select>
          <button 
            type="submit" 
            disabled={loading}
            className={`px-6 py-2 rounded font-bold transition-all ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-cyber-accent hover:bg-blue-400 text-black'}`}
          >
            {loading ? 'SCANNING...' : 'LAUNCH SCAN'}
          </button>
        </form>
      </div>
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <CheckCircle className="text-cyber-success" /> 
                Scan Complete
              </h2>
              <p className="text-gray-400 text-sm mt-1">{results.ip}</p>
            </div>
            <span className="bg-cyber-success/20 text-cyber-success px-3 py-1 rounded text-sm uppercase tracking-wider font-bold">
              {results.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900 p-4 rounded border border-gray-800">
              <h3 className="text-gray-500 text-sm uppercase mb-3 font-bold">Hostnames</h3>
              {results.hostnames.length > 0 ? (
                <ul className="space-y-1">
                  {results.hostnames.map((h, i) => (
                    <li key={i} className="font-mono text-sm text-cyber-accent">{h.name} ({h.type})</li>
                  ))}
                </ul>
              ) : <span className="text-gray-600 italic">No hostnames found</span>}
            </div>

            <div className="bg-gray-900 p-4 rounded border border-gray-800">
              <h3 className="text-gray-500 text-sm uppercase mb-3 font-bold">Open Ports</h3>
              {results.open_ports.length > 0 ? (
                <div className="space-y-2">
                  {results.open_ports.map((p, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-gray-800 pb-1 last:border-0">
                      <span className="font-bold text-white">{p.port}</span>
                      <span className="text-sm text-gray-400">{p.service}</span>
                    </div>
                  ))}
                </div>
              ) : <span className="text-gray-600 italic">No open ports found</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default App;
