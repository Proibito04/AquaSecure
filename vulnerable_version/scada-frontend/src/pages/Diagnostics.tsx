import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface DiagnosticInfo {
    system_status: string;
    ot_network_config: {
        remote_ips: string[];
        plc_ids: string[];
        register_map: Record<string, string>;
        supported_function_codes: number[];
    };
    internal_debug: {
        gateway: string;
        subnet: string;
    };
}

const Diagnostics: React.FC = () => {
    const [info, setInfo] = useState<DiagnosticInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const cookies = document.cookie.split(';').reduce((acc: any, cookie) => {
            const [name, value] = cookie.trim().split('=');
            acc[name] = value;
            return acc;
        }, {});

        if (cookies.session_id) {
            setIsAuthenticated(true);
            const fetchDiagnostics = async () => {
                try {
                    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
                    const response = await fetch(`${backendUrl}/api/v1/diagnostics/info`, {
                        credentials: 'include'
                    });
                    if (!response.ok) throw new Error('Failed to fetch diagnostics');
                    const data = await response.json();
                    setInfo(data);
                } catch (err: any) {
                    setError(err.message);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchDiagnostics();
        } else {
            setIsAuthenticated(false);
            setIsLoading(false);
        }
    }, []);

    if (isAuthenticated === false) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up text-center">
                <div className="p-12 rounded-2xl bg-red-500/10 border border-red-500/20 backdrop-blur-xl max-w-lg">
                    <span className="text-6xl mb-6 block">🚫</span>
                    <h2 className="text-3xl font-bold text-red-500 mb-4">Access Denied</h2>
                    <p className="text-gray-400 mb-8 leading-relaxed">
                        Diagnostic tools are only accessible to authenticated operators. 
                        Use an exploit from Step 1 to acquire a <code>session_id</code>.
                    </p>
                    <Link to="/vulnerability/sqli-login" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all">
                        Go to SQL Injection
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-hero-entrance space-y-8">
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Systems Diagnostics</h1>
                        <p className="text-gray-400 text-sm">Step 2.2: Information Leak Vulnerability</p>
                    </div>
                    <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-400 text-xs font-mono">
                        CONFIDENTIAL - INTERNAL USE ONLY
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-center">
                        {error}
                    </div>
                ) : info && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                                <h3 className="text-blue-400 font-semibold mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                    OT Network Configuration
                                </h3>
                                <div className="space-y-4 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Remote IPs:</span>
                                        <span className="text-gray-300 font-mono">{info.ot_network_config.remote_ips.join(', ')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">PLC IDs:</span>
                                        <span className="text-gray-300 font-mono">{info.ot_network_config.plc_ids.join(', ')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Gateway:</span>
                                        <span className="text-gray-300 font-mono">{info.internal_debug.gateway}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                                <h3 className="text-cyan-400 font-semibold mb-4">Supported Function Codes</h3>
                                <div className="flex flex-wrap gap-2">
                                    {info.ot_network_config.supported_function_codes.map(code => (
                                        <span key={code} className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-md text-cyan-300 font-mono text-xs">
                                            FC{code}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                                <h3 className="text-purple-400 font-semibold mb-4">Modbus Register Map</h3>
                                <div className="space-y-2">
                                    {Object.entries(info.ot_network_config.register_map).map(([reg, desc]) => (
                                        <div key={reg} className="flex justify-between p-2 hover:bg-white/5 rounded transition-colors border-b border-white/5 last:border-0 text-sm">
                                            <span className="text-purple-300 font-mono">{reg}</span>
                                            <span className="text-gray-400">{desc}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-xs text-red-300">
                                <p>⚠️ <strong>Security Audit Note:</strong> Authentication verified. Post-exploitation mode active. Register 40021 (Chlorine Setpoint) identified.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Diagnostics;

