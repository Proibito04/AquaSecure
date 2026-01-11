import type { Feature } from "../types";

interface FeatureCardProps {
  feature: Feature;
  index: number;
}

export const FeatureCard = ({ feature, index }: FeatureCardProps) => {
  return (
    <div
      className="group bg-white/5 backdrop-blur-sm p-10 rounded-2xl border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all duration-500 opacity-0 animate-fade-in-up shadow-xl shadow-black/20"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300 inline-block">{feature.icon}</div>
      <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">
        {feature.title}
      </h3>
      <p className="text-gray-400 leading-relaxed font-light">
        {feature.description}
      </p>
    </div>
  );
};

