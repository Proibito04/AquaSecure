import type { DockerCommand } from "../types";

interface CommandCardProps {
  command: DockerCommand;
}

export const CommandCard = ({ command }: CommandCardProps) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(command.command);
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border-l-4 border-blue-600 border border-white/5">
      <h3 className="text-2xl font-bold text-white mb-2">{command.title}</h3>
      <p className="text-gray-400 mb-4 font-light">{command.description}</p>
      <div className="bg-[#050810] p-6 rounded-xl flex flex-wrap items-center justify-between gap-4 border border-white/5">
        <code className="text-blue-400 font-mono text-lg flex-1 break-all">
          {command.command}
        </code>
        <button
          onClick={handleCopy}
          className="bg-white/10 border border-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 hover:scale-105 transition-all duration-300 text-xl"
          title="Copy to clipboard"
          aria-label="Copy command to clipboard"
        >
          📋
        </button>
      </div>
    </div>
  );
};

