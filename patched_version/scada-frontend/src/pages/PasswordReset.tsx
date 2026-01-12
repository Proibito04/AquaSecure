import React, { useState } from 'react';

const PasswordReset: React.FC = () => {
    const [username, setUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
            const response = await fetch(`${backendUrl}/api/v1/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, new_password: newPassword }),
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
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">Insecure Password Reset</h1>
                    <p className="text-gray-400 text-sm">Step 1.2 & 1.3: Brute-force & Lockout test</p>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-8 text-sm text-yellow-300">
                    <p>⚠️ <strong>Vulnerability:</strong> This endpoint lacks rate limiting and account lockout. It can be easily brute-forced.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Target Username</label>
                        <input 
                            type="text" 
                            placeholder="e.g. operator" 
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all outline-none text-white placeholder-gray-500"
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">New Password Pin</label>
                        <input 
                            type="password" 
                            placeholder="Set target's new password" 
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all outline-none text-white placeholder-gray-500"
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full py-4 bg-gradient-to-r from-yellow-600 to-amber-500 hover:from-yellow-500 hover:to-amber-400 text-white font-semibold rounded-xl shadow-lg shadow-yellow-600/20 transition-all active:scale-[0.98] disabled:opacity-70"
                    >
                        {isLoading ? 'Resetting...' : 'Trigger Password Reset'}
                    </button>
                </form>

                {message && (
                    <div className="mt-6 p-4 rounded-xl border text-center transition-all animate-fade-in-up bg-green-500/10 border-green-500/20 text-green-400">
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PasswordReset;
