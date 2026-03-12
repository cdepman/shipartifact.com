import { Rocket } from "lucide-react";

export function Logo({ size = "default" }: { size?: "small" | "default" }) {
  const iconSize = size === "small" ? 18 : 22;
  const textSize = size === "small" ? "text-lg" : "text-xl";

  return (
    <div className="flex items-center gap-2">
      <Rocket size={iconSize} className="text-primary" />
      <span className={`${textSize} font-bold tracking-tight`}>
        Ship<span className="text-primary">Artifact</span>
      </span>
    </div>
  );
}
