export const OverviewTab = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border-l-4 border-blue-600 border border-white/5">
        <h3 className="text-2xl font-bold text-white mb-6">
          🏗️ Core Infrastructure
        </h3>
        <ul className="space-y-4">
          <li className="text-gray-400 leading-relaxed pb-4 border-b border-white/5">
            <strong className="text-gray-200">SCADA Backend</strong> - High-performance Python core managing Modbus communication.
          </li>
          <li className="text-gray-400 leading-relaxed pb-4 border-b border-white/5">
            <strong className="text-gray-200">PLC Simulators</strong> - Emulated industrial controllers for realistic testing.
          </li>
          <li className="text-gray-400 leading-relaxed pb-4 border-b border-white/5">
            <strong className="text-gray-200">Real-time Dashboard</strong> - React-based HMI (Human-Machine Interface).
          </li>
          <li className="text-gray-400 leading-relaxed">
            <strong className="text-gray-200">Nginx Edge</strong> - Secure reverse proxy and static content delivery.
          </li>
        </ul>
      </div>

      <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border-l-4 border-blue-600 border border-white/5">
        <h3 className="text-2xl font-bold text-white mb-6">🛠️ Control Stack</h3>
        <ul className="space-y-4">
          <li className="text-gray-400 leading-relaxed pb-4 border-b border-white/5">
            Modbus TCP/IP Protocol
          </li>
          <li className="text-gray-400 leading-relaxed pb-4 border-b border-white/5">
            Python 3.12 (PyModbus)
          </li>
          <li className="text-gray-400 leading-relaxed pb-4 border-b border-white/5">
            React 19 & TypeScript
          </li>
          <li className="text-gray-400 leading-relaxed pb-4 border-b border-white/5">
            Docker & Compose Orchestration
          </li>
          <li className="text-gray-400 leading-relaxed">
            SQL Registry Interface
          </li>
        </ul>
      </div>
    </div>
  );
};
