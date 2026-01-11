import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [user, setUser] = useState<string>('');

    useEffect(() => {
        // VULNERABLE: Checking session_id from document.cookie (Insecure Session Management)
        const cookies = document.cookie.split(';').reduce((acc: any, cookie) => {
            const [name, value] = cookie.trim().split('=');
            acc[name] = value;
            return acc;
        }, {});

        if (cookies.session_id) {
            setIsAuthenticated(true);
            setUser(cookies.session_id);
        } else {
            setIsAuthenticated(false);
            // Optionally redirect after a few seconds if you want the user to see the error
        }
    }, []);

    const handleLogout = () => {
        // Insecure logout: just clear the cookie client-side
        document.cookie = "session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        navigate('/vulnerability/default-login');
    };

    if (isAuthenticated === false) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in-up">
                <div className="p-12 rounded-2xl bg-red-500/10 border border-red-500/20 backdrop-blur-xl text-center max-w-lg">
                    <span className="text-6xl mb-6 block">🚫</span>
                    <h2 className="text-3xl font-bold text-red-500 mb-4">Access Denied</h2>
                    <p className="text-gray-400 mb-8 leading-relaxed">
                        No active session detected. Please authenticate via the 
                        <Link to="/vulnerability/default-login" className="text-blue-400 hover:underline mx-1">Default Login</Link> 
                        or 
                        <Link to="/vulnerability/sqli-login" className="text-red-400 hover:underline mx-1">SQL Injection</Link> 
                        endpoints to acquire a session token.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link to="/vulnerability/default-login" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (isAuthenticated === null) return null; // Loading state
    return (
        <div className="animate-hero-entrance space-y-8">
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">SCADA Control Center</h1>
                        <p className="text-gray-400 text-sm italic">Authenticated Session: <span className="text-blue-400 font-mono">{user}</span> (v1.0.4-vuln)</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/20 transition-all"
                        >
                            LOGOUT
                        </button>
                        <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-xs font-bold animate-pulse">
                            ● SYSTEM ONLINE
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="p-6 rounded-xl bg-blue-500/5 border border-blue-500/20">
                        <h3 className="text-blue-400 text-xs font-bold uppercase mb-2">Water Tank Alpha</h3>
                        <p className="text-2xl font-mono text-white">84.2%</p>
                        <div className="w-full bg-white/5 h-2 rounded-full mt-4 overflow-hidden">
                            <div className="bg-blue-500 h-full w-[84%]"></div>
                        </div>
                    </div>
                    <div className="p-6 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                        <h3 className="text-cyan-400 text-xs font-bold uppercase mb-2">Chlorine Level</h3>
                        <p className="text-2xl font-mono text-white">1.02 mg/L</p>
                        <div className="w-full bg-white/5 h-2 rounded-full mt-4 overflow-hidden">
                            <div className="bg-cyan-500 h-full w-[40%]"></div>
                        </div>
                    </div>
                    <div className="p-6 rounded-xl bg-purple-500/5 border border-purple-500/20">
                        <h3 className="text-purple-400 text-xs font-bold uppercase mb-2">Flow Rate</h3>
                        <p className="text-2xl font-mono text-white">12.4 L/s</p>
                        <div className="w-full bg-white/5 h-2 rounded-full mt-4 overflow-hidden">
                            <div className="bg-purple-500 h-full w-[65%]"></div>
                        </div>
                    </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 text-yellow-200">
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                        <span>⚠️</span> SYSTEM DIAGNOSTICS DETECTED
                    </h4>
                    <p className="text-sm mb-4">Internal network configuration might be exposed through legacy diagnostic endpoints. Admin review required.</p>
                    <div className="flex gap-4">
                        <Link to="/vulnerability/diagnostics" className="px-4 py-2 bg-yellow-500 text-black text-xs font-bold rounded-lg hover:bg-yellow-400 transition-colors">
                            VIEW DIAGNOSTICS (Step 2.2)
                        </Link>
                        <Link to="/vulnerability/discovery" className="px-4 py-2 bg-white/10 text-white text-xs font-bold rounded-lg hover:bg-white/20 transition-colors">
                            SCAN OT NETWORK (Step 2.1)
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
                    <h2 className="text-xl font-bold text-white mb-4">Historical Events</h2>
                    <div className="space-y-4 font-mono text-[10px] text-gray-500">
                        <div className="flex gap-4"><span className="text-blue-500">14:21:05</span> Login Success: operator</div>
                        <div className="flex gap-4"><span className="text-blue-500">13:45:12</span> Valve Pump-01 Closed by AUTO</div>
                        <div className="flex gap-4"><span className="text-blue-500">12:30:44</span> Filter Rinse Cycle Start</div>
                    </div>
                </div>
                <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
                    <h2 className="text-xl font-bold text-white mb-4">Security Advisory</h2>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        Note: This session is managed via <code>session_id</code> cookie. 
                        In this vulnerable demonstration, the cookie is insecurely configured 
                        (no HttpOnly/Secure flags) and predictable, allowing for session hijacking research.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
