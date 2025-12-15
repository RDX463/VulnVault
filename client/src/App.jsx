import { useState, useEffect } from 'react';
import { triggerScan, checkScanStatus } from './services/api';
import { Shield, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

function App() {
  const [target, setTarget] = useState('');
  const [scanType, setScanType] = useState('quick');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('Ready...');

  const handleScan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);
    setDebugInfo('Starting scan...');

    try {
      setDebugInfo('Sending POST request...');
      const response = await triggerScan(target, scanType);
      
      const jobId = response.jobId || response.id;
      setDebugInfo(`Scan started! Job ID: ${jobId}. Polling now...`);

      if (!jobId) throw new Error("Server did not return a Job ID");
      
      const pollInterval = setInterval(async () => {
        try {
          setDebugInfo(`Checking status for Job ${jobId}...`);
          const statusData = await checkScanStatus(jobId);
          
          if (statusData.status === 'completed') {
            clearInterval(pollInterval);
            setResults(statusData.result);
            setLoading(false);
          } 
          else if (statusData.status === 'failed') {
            clearInterval(pollInterval);
            setError(statusData.error || "Scan failed internal");
            setLoading(false);
          }
        } catch (err) {
          console.error(err);
          setDebugInfo(`Polling Error: ${err.message || "Network Failed"}`);
        }
      }, 2000);

    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to start scan");
      setDebugInfo(`Critical Error: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto bg-gray-900 text-white font-mono">
      <header className="flex items-center gap-3 mb-10 border-b border-gray-700 pb-4">
        <Shield className="w-10 h-10 text-blue-400" />
        <h1 className="text-3xl font-bold">VULN_VAULT <span className="text-xs text-gray-500">v1.0.1</span></h1>
      </header>

      {/* DEBUG LOG (Optional - keep it for now) */}
      <div className="bg-black border border-gray-700 p-2 mb-6 rounded text-gray-500 text-xs font-mono">
         SYSTEM_LOG: {debugInfo}
      </div>

      <div className="bg-gray-800 p-6 rounded-lg mb-8 border border-gray-700">
        <form onSubmit={handleScan} className="flex gap-4">
          <input 
            type="text" 
            placeholder="Target IP (e.g. 8.8.8.8)" 
            className="flex-1 bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white focus:border-blue-500 outline-none"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
          <select 
            className="bg-gray-900 border border-gray-600 rounded px-4 py-2 text-white focus:border-blue-500 outline-none"
            value={scanType}
            onChange={(e) => setScanType(e.target.value)}
          >
            <option value="quick">Quick Scan</option>
            <option value="full">Full Scan</option>
          </select>
          <button type="submit" disabled={loading} className={`px-6 py-2 rounded font-bold text-black transition ${loading ? 'bg-gray-600' : 'bg-blue-500 hover:bg-blue-400'}`}>
            {loading ? 'SCANNING...' : 'SCAN'}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded mb-6 flex items-center gap-2">
          <AlertCircle /> {error}
        </div>
      )}

      {results && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 animate-fade-in shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                {results.status === 'up' ? <CheckCircle className="text-green-500" /> : <XCircle className="text-red-500" />}
                Scan Complete
              </h2>
              <p className="text-gray-400 text-sm mt-1 font-mono">{results.ip}</p>
            </div>
            <span className={`px-3 py-1 rounded text-sm uppercase tracking-wider font-bold ${results.status === 'up' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
              {results.status}
            </span>
          </div>

          {/* CRASH PROTECTION: Only show details if status is UP */}
          {results.status === 'up' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900 p-4 rounded border border-gray-800">
                <h3 className="text-gray-500 text-sm uppercase mb-3 font-bold tracking-wider">Hostnames</h3>
                {(results.hostnames && results.hostnames.length > 0) ? (
                  <ul className="space-y-1">
                    {results.hostnames.map((h, i) => (
                      <li key={i} className="font-mono text-sm text-blue-400 break-all">
                        {h.name} <span className="text-gray-600">({h.type})</span>
                      </li>
                    ))}
                  </ul>
                ) : <span className="text-gray-600 italic text-sm">No hostnames found</span>}
              </div>

              <div className="bg-gray-900 p-4 rounded border border-gray-800">
                <h3 className="text-gray-500 text-sm uppercase mb-3 font-bold tracking-wider">Open Ports</h3>
                {(results.open_ports && results.open_ports.length > 0) ? (
                  <div className="space-y-2">
                    {results.open_ports.map((p, i) => (
                      <div key={i} className="flex justify-between items-center border-b border-gray-800 pb-1 last:border-0">
                        <span className="font-bold text-blue-400 font-mono">{p.port}</span>
                        <span className="text-sm text-gray-400 font-mono">{p.service}</span>
                      </div>
                    ))}
                  </div>
                ) : <span className="text-gray-600 italic text-sm">No open ports found</span>}
              </div>
            </div>
          ) : (
            <div className="bg-gray-900/50 p-6 rounded text-center border border-gray-800">
              <p className="text-gray-400">Target is offline or blocking ping requests.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
