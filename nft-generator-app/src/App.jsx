import React, { useState } from "react";

const COLOR_PRESETS = [
  { name: "Blue", color: "#2563eb", glow: "rgba(37, 99, 235, 0.6)" },
  { name: "Green", color: "#10b981", glow: "rgba(16, 185, 129, 0.6)" },
  { name: "Purple", color: "#a855f7", glow: "rgba(168, 85, 247, 0.6)" },
  { name: "Red", color: "#ef4444", glow: "rgba(239, 68, 68, 0.6)" }
];

function Led({ color, glow }) {
  return (
    <span
      className="inline-block w-3 h-3 rounded-full mr-2"
      style={{
        background: color,
        boxShadow: `0 0 8px 2px ${glow}`,
        animation: `led-pulse 1.2s infinite`
      }}
    />
  );
}

export default function App() {
  const [color, setColor] = useState(COLOR_PRESETS[0].color);
  const [glow, setGlow] = useState(COLOR_PRESETS[0].glow);

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-black mb-8" style={{ color }}>NFT Generator Pro</h1>
      <div className="grid grid-cols-4 gap-3 mb-8">
        {COLOR_PRESETS.map((preset, i) => (
          <button
            key={preset.name}
            onClick={() => { setColor(preset.color); setGlow(preset.glow); }}
            className={`flex flex-col items-center justify-center px-2 py-2 rounded-xl font-bold border-2 transition-all shadow
              ${color === preset.color
                ? `border-white scale-110`
                : "border-transparent hover:scale-105"}
            `}
            style={{
              background: `linear-gradient(135deg, ${preset.color} 0%, #000 100%)`,
              boxShadow: `0 0 16px 2px ${preset.glow}`,
              color: "#fff"
            }}
          >
            <Led color={preset.color} glow={preset.glow} />
            {preset.name}
          </button>
        ))}
      </div>
      <button
        className="py-4 px-8 rounded-xl font-bold text-white border-2 shadow-lg flex items-center justify-center gap-2 hover:scale-105 transition"
        style={{
          background: `linear-gradient(90deg, ${color} 0%, #000 100%)`,
          boxShadow: `0 0 20px ${glow}`,
          borderColor: color
        }}
      >
        <Led color={color} glow={glow} />
        Main Action Button
      </button>
      <style>{`
        @keyframes led-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
