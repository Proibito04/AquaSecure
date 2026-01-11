import { useState } from "react";
import { CommandsTab } from "./CommandsTab";
import { OverviewTab } from "./OverviewTab";
import type { TabType } from "../types";

export const QuickStart = () => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  return (
    <section className="py-24 px-8 bg-[#0a0f1e]">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-extrabold text-center text-white mb-12">
          Technical <span className="text-blue-500">Overview</span>
        </h2>

        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 border ${
              activeTab === "overview"
                ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
            }`}
          >
            System Architecture
          </button>
          <button
            onClick={() => setActiveTab("commands")}
            className={`px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 border ${
              activeTab === "commands"
                ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20"
                : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
            }`}
          >
            Deployment Commands
          </button>
        </div>

        <div className="animate-[fadeIn_0.5s_ease]">
          {activeTab === "overview" ? <OverviewTab /> : <CommandsTab />}
        </div>
      </div>
    </section>
  );
};
