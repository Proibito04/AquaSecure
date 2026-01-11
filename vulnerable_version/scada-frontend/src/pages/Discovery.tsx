import React, { useState } from 'react';

interface ScanResult {
    ip: string;
    port: number;
    status: string;
    type: string;
}

const Discovery: React.FC = () => {
    const [scanResults, setScanResults] = useState<ScanResult[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [hostToCheck, setHostToCheck] = useState('');
    const [hostStatus, setHostStatus] = useState<{ status: string; detail: string } | null>(null);
    const [isCheckingHost, setIsCheckingHost] = useState(false);

    const handleScan = async () => {
        setIsScanning(true);
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
            const response = await fetch(`${backendUrl}/api/v1/diagnostics/scan`, { method: 'POST' });
            const data = await response.json();
            setScanResults(data.results);
        } catch (error) {
            console.error('Scan failed', error);
        } finally {
            setIsScanning(false);
        }
    };

    const handleCheckHost = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCheckingHost(true);
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
            const response = await fetch(`${backendUrl}/api/v1/diagnostics/check-host`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ host: hostToCheck }),
            });
            const data = await response.json();
            if (response.status === 403) {
                setHostStatus({ status: 'blocked', detail: data.detail });
            } else {
                setHostStatus(data);
            }
        } catch (error) {
            setHostStatus({ status: 'error', detail: 'Network error or server down' });
        } finally {
            setIsCheckingHost(false);
        }
    };

    return (
        <div className="animate-hero-entrance space-y-8">
            {/* Step 2.1: Auto-Discovery */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Network Discovery</h1>
                    <p className="text-gray-400 text-sm">Step 2.1: Auto-Discovery Unauthenticated (Modbus Port 502)</p>
                </div>

                <button
                    onClick={handleScan}
                    disabled={isScanning}
                    className="mb-8 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
                >
                    {isScanning ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Scanning Network...
                        </>
                    ) : (
                        'Run Device Scan'
                    )}
                </button>

                {scanResults.length > 0 && (
                    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/10 text-gray-300">
                                <tr>
                                    <th className="px-4 py-3">IP Address</th>
                                    <th className="px-4 py-3">Port</th>
                                    <th className="px-4 py-3">Type</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {scanResults.map((res, i) => (
                                    <tr key={i} className="hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3 font-mono text-blue-300">{res.ip}</td>
                                        <td className="px-4 py-3 text-gray-400">{res.port}</td>
                                        <td className="px-4 py-3 text-gray-300">{res.type}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                                                res.status === 'detected' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                            }`}>
                                                {res.status.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Step 2.4: Blind SSRF & 2.3: Verbose Errors */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Diagnostic Host Checker</h2>
                    <p className="text-gray-400 text-sm">Step 2.4: Blind SSRF with Blacklist & Step 2.3: Verbose Error Messages</p>
                </div>

                <form onSubmit={handleCheckHost} className="flex gap-4 mb-8">
                    <input
                        type="text"
                        placeholder="IP Address (e.g. 192.168.10.50)"
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white transition-all"
                        value={hostToCheck}
                        onChange={(e) => setHostToCheck(e.target.value)}
                    />
                    <button
                        type="submit"
                        disabled={isCheckingHost}
                        className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
                    >
                        {isCheckingHost ? 'Checking...' : 'Check Connection'}
                    </button>
                </form>

                {hostStatus && (
                    <div className={`p-6 rounded-xl border animate-fade-in-up ${
                        hostStatus.status === 'up' 
                            ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                            : hostStatus.status === 'blocked'
                            ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                        <div className="flex items-start gap-3">
                            <span className="text-lg">
                                {hostStatus.status === 'up' ? '✅' : hostStatus.status === 'blocked' ? '🚫' : '❌'}
                            </span>
                            <div>
                                <h4 className="font-bold mb-1 uppercase tracking-wider text-xs">
                                    {hostStatus.status === 'up' ? 'Success' : hostStatus.status === 'blocked' ? 'Blocked' : 'Error'}
                                </h4>
                                <p className="text-sm font-mono break-all leading-relaxed">{hostStatus.detail}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-blue-300">
                    <p>💡 <strong>Hint:</strong> The diagnostic tool has a weak blacklist. Try <code>127.0.0.1</code> to see it in action, then try to bypass it if possible (e.g. using CIDR, octal, or other representations). Probe IPs found in the Diagnostics page.</p>
                </div>
            </div>
        </div>
    );
};

export default Discovery;
