import * as Icons from "lucide-react";
import type { ComponentType } from "react";

const iconMap: Record<string, keyof typeof Icons> = {
  Brain: "BrainCircuit", Globe2: "Globe2", Atom: "Atom", Orbit: "Orbit",
  Landmark: "Landmark", Cpu: "Cpu", PawPrint: "PawPrint", Sigma: "Sigma", Leaf: "Leaf",
};

export default function CategoryIcon({ name, size = 20 }: { name: string | null | undefined; size?: number }) {
  const key = iconMap[name || ""] || "Sparkles";
  const Icon = Icons[key] as ComponentType<{ size?: number; strokeWidth?: number }>;
  return <Icon size={size} strokeWidth={1.8} />;
}
