import React, { useState, useRef, useEffect } from "react";
import { Camera, Palette, Zap, Download, Check, Lock, Unlock, Film, Image as ImageIcon, RefreshCw } from "lucide-react";
import { createThirdwebClient } from "thirdweb";
import { ConnectButton, useActiveAccount, useActiveWallet } from "thirdweb/react";

const client = createThirdwebClient({
  clientId: "821819db832d1a313ae3b1a62fbeafb7"
});

const RARITY_COLORS = {
  Common: { bg: "#18181b", border: "#9ca3af", glow: "rgba(156, 163, 175, 0.5)", text: "#d1d5db" },
  Rare: { bg: "#1e293b", border: "#3b82f6", glow: "rgba(59, 130, 246, 0.6)", text: "#60a5fa" },
  Epic: { bg: "#312e81", border: "#a855f7", glow: "rgba(168, 85, 247, 0.6)", text: "#c084fc" },
  Legendary: { bg: "#78350f", border: "#fbbf24", glow: "rgba(251, 191, 36, 0.7)", text: "#fbbf24" },
  Mythic: { bg: "#1a1a1a", border: "#ec4899", glow: "rgba(236, 72, 153, 0.8)", text: "#fff" }
};

const COLOR_PRESETS = [
  { name: "Blue", color: "#2563eb", glow: "rgba(37, 99, 235, 0.6)" },
  { name: "Green", color: "#10b981", glow: "rgba(16, 185, 129, 0.6)" },
  { name: "Purple", color: "#a855f7", glow: "rgba(168, 85, 247, 0.6)" },
  { name: "Red", color: "#ef4444", glow: "rgba(239, 68, 68, 0.6)" }
];

const NETWORKS = [
  { name: "Ethereum", chainId: 1, symbol: "ETH", fee: "0.001", color: "#2563eb", icon: "Ξ" },
  { name: "Polygon", chainId: 137, symbol: "MATIC", fee: "0.01", color: "#8247E5", icon: "◈" },
  { name: "Base", chainId: 8453, symbol: "ETH", fee: "0.0005", color: "#0052FF", icon: "🔵" },
  { name: "BSC", chainId: 56, symbol: "BNB", fee: "0.001", color: "#F0B90B", icon: "⬡" }
];

const TREASURY = "0x592B35c8917eD36c39Ef73D0F5e92B0173560b2e";

function Led({ color, glow, delay = "0s", disabled }) {
  return (
    <span
      className="inline-block w-3 h-3 rounded-full mr-2"
      style={{
        background: disabled ? "#374151" : color,
        boxShadow: disabled ? "none" : `0 0 8px 2px ${glow}`,
        animation: disabled ? "none" : `led-pulse 1.2s infinite`,
        animationDelay: delay
      }}
    />
  );
}

export default function App() {
  // ...[rest of your App code, unchanged]...
  // (Paste the full App code from the previous message here, or keep your current logic)
}
