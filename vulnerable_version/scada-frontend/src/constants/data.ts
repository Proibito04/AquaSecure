import type { Feature, DockerCommand } from "../types";

export const FEATURES: Feature[] = [
  {
    icon: "🚰",
    title: "Water Treatment",
    description:
      "Advanced control systems for water purification, filtration, and chemical dosing processes.",
  },
  {
    icon: "📊",
    title: "Real-time Monitoring",
    description:
      "Visualize your facility's health with live data feeds from PLCs and industrial sensors.",
  },
  {
    icon: "🛡️",
    title: "Industrial Security",
    description:
      "Robust protection for critical infrastructure with multi-layered defense and monitoring.",
  },
  {
    icon: "☁️",
    title: "Edge Connectivity",
    description:
      "Seamlessly bridge operational technology (OT) with modern IT systems for remote management.",
  },
  {
    icon: "📉",
    title: "Predictive Analytics",
    description:
      "Leverage historical data to optimize O&M and prevent system failures before they happen.",
  },
  {
    icon: "⚙️",
    title: "Dynamic Control",
    description:
      "Fine-tune system parameters on the fly with responsive and secure control interfaces.",
  },
];

export const DOCKER_COMMANDS: DockerCommand[] = [
  {
    title: "Launch Infrastructure",
    command: "docker compose up -d",
    description: "Start the SCADA backend, PLCs, and dashboard in detached mode",
  },
  {
    title: "Monitor Logs",
    command: "docker compose logs -f",
    description: "Watch real-time system telemetry and security alerts",
  },
  {
    title: "System Update",
    command: "docker build -t aquasecure-core .",
    description: "Rebuild the SCADA core components for production deployment",
  },
];

export const SOCIAL_LINKS = {
  linkedin: "#",
  medium: "#",
  newsletter: "#",
  github: "https://github.com/Antigravity-SCADA/AquaSecure",
  githubSponsors: "#",
  donate: "#",
  documentation: "#",
} as const;
