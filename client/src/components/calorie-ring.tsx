interface CalorieRingProps {
  consumed: number;
  target: number;
  burned: number;
  size?: number;
}

export function CalorieRing({ consumed, target, burned, size = 200 }: CalorieRingProps) {
  const remaining = Math.max(0, target + burned - consumed);
  const progress = Math.min((consumed / (target + burned)) * 100, 100);
  const isOver = consumed > target + burned;

  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          className="opacity-40"
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={isOver ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
          {isOver ? "Excedido" : "Restante"}
        </span>
        <span className={`text-3xl font-bold tabular-nums ${isOver ? "text-destructive" : "text-foreground"}`}>
          {isOver ? `+${Math.round(consumed - target - burned)}` : Math.round(remaining)}
        </span>
        <span className="text-xs text-muted-foreground">kcal</span>
      </div>
    </div>
  );
}
