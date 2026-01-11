import React, { useState } from 'react';

const SQLILogin: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
            const response = await fetch(`${backendUrl}/api/v1/login/sqli`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();
            setMessage(data.message);
        } catch (error) {
            setMessage('Error connecting to backend');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[70vh] animate-hero-entrance">
            <div className="w-full max-w-md p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
                <div className="mb-8 text-center text-red-500">
                    <h1 className="text-3xl font-bold mb-2">SQL Injection Login</h1>
                    <p className="text-gray-400 text-sm">Step 1.4: Database exploitation test</p>
                </div>

                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-8 text-sm text-red-300">
                    <p>🛑 <strong>Blacklist Active:</strong> Keywords like <code>SELECT</code>, <code>OR</code>, <code>UNION</code> are blocked. Can you bypass it using mixed case <code>(oR)</code> or SQL comments?</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Username / SQL Payload</label>
                        <input 
                            type="text" 
                            placeholder="admin' OR '1'='1' --" 
                            className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none text-red-100 placeholder-gray-600 font-mono"
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            className="w-full px-4 py-3 bg-black/40 border border-red-500/30 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none text-red-100 placeholder-gray-600 font-mono"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full py-4 bg-gradient-to-r from-red-700 to-rose-600 hover:from-red-600 hover:to-rose-500 text-white font-semibold rounded-xl shadow-lg shadow-red-900/40 transition-all active:scale-[0.98] disabled:opacity-70"
                    >
                        {isLoading ? 'Executing Payload...' : 'Authorize (SQLi)'}
                    </button>
                </form>

                {message && (
                    <div className={`mt-6 p-4 rounded-xl border text-center font-mono text-xs transition-all animate-fade-in-up ${
                        message.toLowerCase().includes('success') 
                            ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                            : 'bg-red-500/20 border-red-500/40 text-red-200'
                    }`}>
                        {`> ${message}`}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SQLILogin;
