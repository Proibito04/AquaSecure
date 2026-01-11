import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Features } from "./components/Features";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { QuickStart } from "./components/QuickStart";
import DefaultLogin from "./pages/DefaultLogin";
import PasswordReset from "./pages/PasswordReset";
import SQLILogin from "./pages/SQLILogin";
import Discovery from "./pages/Discovery";
import Diagnostics from "./pages/Diagnostics";
import Dashboard from "./pages/Dashboard";

const NavLink = ({ to, children }: { to: string, children: React.ReactNode }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link 
      to={to} 
      className={`px-4 py-2 rounded-lg transition-all duration-300 ${
        isActive 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
          : 'text-gray-300 hover:text-white hover:bg-white/10'
      }`}
    >
      {children}
    </Link>
  );
};

const Home = () => (
  <div className="animate-fade-in-up">
    <Hero />
    <Features />
    <QuickStart />
  </div>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0a0f1e] text-gray-100 font-sans selection:bg-blue-500/30">
        <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#0a0f1e]/80 border-b border-white/10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
              AquaSecure SCADA
            </Link>
            <div className="hidden md:flex items-center gap-2">
              <NavLink to="/">Home</NavLink>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/vulnerability/default-login">1.1 Default</NavLink>
              <NavLink to="/vulnerability/password-reset">1.2/1.3 Reset</NavLink>
              <NavLink to="/vulnerability/sqli-login">1.4 SQLi</NavLink>
              <NavLink to="/vulnerability/discovery">2.1/2.3 Scan</NavLink>
              <NavLink to="/vulnerability/diagnostics">2.2 Diagnostics</NavLink>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/vulnerability/default-login" element={<DefaultLogin />} />
            <Route path="/vulnerability/password-reset" element={<PasswordReset />} />
             <Route path="/vulnerability/sqli-login" element={<SQLILogin />} />
             <Route path="/vulnerability/discovery" element={<Discovery />} />
             <Route path="/vulnerability/diagnostics" element={<Diagnostics />} />
             <Route path="/dashboard" element={<Dashboard />} />
           </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
