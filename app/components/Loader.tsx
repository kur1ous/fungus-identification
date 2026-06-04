"use client";

export function Loader() {
  return (
    <div className="flex flex-col items-center gap-6 py-12">
      <div className="relative w-24 h-24">
        {/* Mycelium SVG */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          aria-hidden="true"
        >
          {/* Spore center */}
          <circle
            cx="50"
            cy="50"
            r="6"
            fill="#c4913a"
            style={{ animation: "spore-pulse 2s ease-in-out infinite" }}
          />
          {/* Mycelium threads */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const x2 = 50 + Math.cos(rad) * 36;
            const y2 = 50 + Math.sin(rad) * 36;
            const cx1 = 50 + Math.cos(rad + 0.4) * 18;
            const cy1 = 50 + Math.sin(rad + 0.4) * 18;
            return (
              <path
                key={angle}
                d={`M 50 50 Q ${cx1} ${cy1} ${x2} ${y2}`}
                stroke="#8b6f47"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                style={{
                  strokeDasharray: 50,
                  strokeDashoffset: 50,
                  animation: `mycelium-grow 1.8s ease-out ${i * 0.15}s infinite`,
                }}
              />
            );
          })}
          {/* Outer spore nodes */}
          {[0, 60, 120, 180, 240, 300].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const x = 50 + Math.cos(rad) * 38;
            const y = 50 + Math.sin(rad) * 38;
            return (
              <circle
                key={angle}
                cx={x}
                cy={y}
                r="2.5"
                fill="#7a8c72"
                style={{
                  animation: `spore-pulse 2s ease-in-out ${i * 0.3}s infinite`,
                }}
              />
            );
          })}
        </svg>
      </div>
      <p
        className="text-sm tracking-widest uppercase"
        style={{ color: "#a09880" }}
      >
        Consulting the mycelium…
      </p>
    </div>
  );
}
