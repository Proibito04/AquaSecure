import { Link } from 'react-router-dom';

export const Hero = () => {
  return (
    <header className="min-h-[80vh] flex items-center justify-center bg-[#0a0f1e] relative overflow-hidden px-8 py-16">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#1e293b_0%,transparent_100%)]"></div>
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="max-w-5xl text-center relative z-10">
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/5 text-blue-400 text-sm font-medium tracking-wide animate-fade-in">
          OPERATIONAL TECHNOLOGY INTERFACE V4.2
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
          Secure Control.
          <span className="block mt-2 bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
            Absolute Reliability.
          </span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-400 mb-12 leading-relaxed max-w-3xl mx-auto font-light">
          AquaSecure provides mission-critical SCADA solutions for modern water treatment facilities. 
          Monitor, control, and protect your infrastructure with industrial-grade precision.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link
            to="/dashboard"
            className="group relative px-8 py-4 bg-blue-600 text-white font-bold rounded-xl overflow-hidden transition-all hover:bg-blue-500 active:scale-95 shadow-lg shadow-blue-900/20"
          >
            <span className="relative z-10">Access Control Panel</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>
          <Link
            to="/vulnerability/discovery"
            className="px-8 py-4 bg-white/5 text-white font-bold rounded-xl border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all active:scale-95"
          >
            System Diagnostics
          </Link>
        </div>

        <div className="mt-20 flex flex-wrap justify-center gap-12 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
           <div className="flex items-center gap-2 text-white font-semibold tracking-widest text-sm">
             <span className="text-blue-500">MODBUS</span> TCP/IP
           </div>
           <div className="flex items-center gap-2 text-white font-semibold tracking-widest text-sm">
             <span className="text-cyan-500">PROFINET</span> RT
           </div>
           <div className="flex items-center gap-2 text-white font-semibold tracking-widest text-sm">
             <span className="text-blue-400">ETHERNET</span>/IP
           </div>
        </div>
      </div>
    </header>
  );
};
