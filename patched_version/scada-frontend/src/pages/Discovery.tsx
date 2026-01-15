import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface ScanResult {
    ip: string;
    port: number;
    status: string;
    type: string;
}

const Discovery: React.FC = () => {
    const navigate = useNavigate();
    const [scanResults, setScanResults] = useState<ScanResult[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [hostToCheck, setHostToCheck] = useState('');
    const [hostStatus, setHostStatus] = useState<{ status: string; detail: string } | null>(null);
    const [isCheckingHost, setIsCheckingHost] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        // SECURE: Auth check via API response code
        const checkAuth = async () => {
             try {
                const response = await fetch('http://localhost:8000/api/v1/plc/live-status');
                if (response.status === 401) {
                    setIsAuthenticated(false);
                    navigate('/vulnerability/default-login');
                } else {
                    setIsAuthenticated(true);
                }
             } catch (error) {
                console.error("Auth check failed", error);
                setIsAuthenticated(false);
             }
        };
        checkAuth();
    }, []);

    const handleScan = async () => {
        setIsScanning(true);
        try {
            const response = await fetch('http://localhost:8000/api/v1/plc/live-status');
            const data = await response.json();
            
            if (data.status === 'online') {
                setScanResults([{
                    ip: '192.168.10.5',
                    port: 502,
                    status: 'detected',
                    type: 'AquaSecure Industrial PLC'
                }]);
            } else {
                setScanResults([]);
            }
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
                credentials: 'include',
            });
            const data = await response.json();
            if (response.status === 403) {
                setHostStatus({ status: 'blocked', detail: data.detail });
            } else if (response.status === 401) {
                setHostStatus({ status: 'error', detail: 'Unauthorized: Session missing' });
            } else {
                setHostStatus(data);
            }
        } catch (error) {
            setHostStatus({ status: 'error', detail: 'Network error or server down' });
        } finally {
            setIsCheckingHost(false);
        }
    };

    if (isAuthenticated === false) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up text-center">
                <div className="p-12 rounded-2xl bg-red-500/10 border border-red-500/20 backdrop-blur-xl max-w-lg">
                    <span className="text-6xl mb-6 block">🚫</span>
                    <h2 className="text-3xl font-bold text-red-500 mb-4">Access Denied</h2>
                    <p className="text-gray-400 mb-8 leading-relaxed">
                        Network discovery tools are restricted to authenticated personnel. 
                        Perform a Step 1 attack to gain administrative access.
                    </p>
                    <Link to="/vulnerability/sqli-login" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all">
                        Go to SQL Injection
                    </Link>
                </div>
            </div>
        );
    }

    if (isAuthenticated === null) return null;

    return (
        <div className="animate-hero-entrance space-y-8">
            {/* Step 2.1: Auto-Discovery */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Network Discovery</h1>
                    <p className="text-gray-400 text-sm">Step 2.1: Auto-Discovery (Requires Post-Exploitation Session)</p>
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

            {/* Step 2.4 & 2.3: REMOVED (SSRF and Verbose Errors Patched) */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
                <div className="mb-4">
                    <h2 className="text-2xl font-bold text-white mb-2">Network Security Status</h2>
                    <p className="text-green-400 text-sm font-bold">✅ SECURED: Diagnostics endpoints have been hardened.</p>
                </div>
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-xs text-green-300">
                    <p>Information leakage and SSRF vulnerabilities have been removed. The system no longer permits arbitrary host checks via diagnostic tools.</p>
                </div>
            </div>
        </div>
    );
};

export default Discovery;

