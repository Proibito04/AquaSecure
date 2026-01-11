import { Link } from 'react-router-dom';
import { SOCIAL_LINKS } from "../constants/data";

export const Footer = () => {
  return (
    <footer className="bg-[#0a0f1e] text-white py-16 px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mb-6">
              AquaSecure SCADA
            </h3>
            <p className="text-gray-400 text-lg leading-relaxed font-light mb-6">
              Empowering industrial facilities with secure, reliable, and intelligent control systems. 
              Built for the future of operational technology.
            </p>
            <div className="flex gap-4">
               {/* Add social/github links here if needed */}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-blue-500 mb-6">
              System
            </h4>
            <ul className="space-y-4">
              <li><Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link to="/vulnerability/discovery" className="text-gray-400 hover:text-white transition-colors">Diagnostics</Link></li>
              <li><Link to="/vulnerability/default-login" className="text-gray-400 hover:text-white transition-colors">Access Control</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-blue-500 mb-6">
              Support
            </h4>
            <ul className="space-y-4">
              <li><a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">GitHub Repository</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Security Advisories</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-gray-500 text-sm font-light">
          <p>© 2026 AquaSecure Systems. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Status</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
