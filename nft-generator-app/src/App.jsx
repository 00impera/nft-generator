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
  const [media, setMedia] = useState(null);
  const [name, setName] = useState("Epic NFT");
  const [rarity, setRarity] = useState("Legendary");
  const [stats, setStats] = useState({ attack: 85, defense: 70, speed: 90, magic: 75 });
  const [color, setColor] = useState(COLOR_PRESETS[0].color);
  const [glow, setGlow] = useState(COLOR_PRESETS[0].glow);
  const [network, setNetwork] = useState(NETWORKS[2]);
  const [txStatus, setTxStatus] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [mediaType, setMediaType] = useState("image");
  const [frames, setFrames] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardRotation, setCardRotation] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef();
  const canvasRef = useRef();
  const account = useActiveAccount();
  const wallet = useActiveWallet();

  useEffect(() => {
    document.body.style.overflowX = "hidden";
    return () => { document.body.style.overflowX = ""; };
  }, []);

  const handleCardMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    setCardRotation({ x: rotateX, y: rotateY });
  };
  const handleCardMouseLeave = () => setCardRotation({ x: 0, y: 0 });

  const mintWithPayment = async () => {
    if (!account) { alert("⚠️ Please connect your wallet first!"); return; }
    if (!media) { alert("⚠️ Upload media first!"); return; }
    try {
      setTxStatus("pending");
      const tx = { to: TREASURY, value: BigInt(Math.floor(parseFloat(network.fee) * 1e18)) };
      const result = await wallet.sendTransaction(tx);
      setTxHash(result.transactionHash);
      setTxStatus("success");
      setIsPaid(true);
      setTimeout(() => { alert("✅ Payment successful! Downloads unlocked."); }, 500);
    } catch (err) {
      setTxStatus("failed");
      console.error(err);
      if (err.code === 4001 || err.message?.includes("user rejected")) {
        alert("❌ Transaction cancelled");
      } else if (err.message?.includes("insufficient")) {
        alert(`💰 Need ${network.fee} ${network.symbol}`);
      } else {
        alert("❌ Transaction failed");
      }
    }
  };

  const handleMediaUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isGif = file.type === "image/gif";
    setMediaType(isGif ? "gif" : "image");
    const reader = new FileReader();
    reader.onload = (ev) => {
      setMedia(ev.target.result);
      if (isGif) setFrames([ev.target.result]);
    };
    reader.readAsDataURL(file);
  };

  const convertToGif = () => {
    if (!media) { alert("⚠️ Upload an image first!"); return; }
    setIsProcessing(true);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new window.Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const animatedFrames = [];
      for (let i = 0; i < 10; i++) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((i * 36) * Math.PI / 180);
        ctx.scale(1 + Math.sin(i * 0.2) * 0.1, 1 + Math.sin(i * 0.2) * 0.1);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
        ctx.drawImage(img, 0, 0);
        ctx.restore();
        animatedFrames.push(canvas.toDataURL());
      }
      setFrames(animatedFrames);
      setMediaType("gif");
      setIsProcessing(false);
      alert("✨ Animated GIF created!");
    };
    img.src = media;
  };

  const downloadMetadata = () => {
    if (!isPaid) { alert("🔒 Please complete payment first!"); return; }
    const metadata = {
      name,
      description: `${rarity} NFT on ${network.name}`,
      image: media || "ipfs://...",
      animation_url: mediaType === "gif" ? media : undefined,
      attributes: [
        { trait_type: "Rarity", value: rarity },
        { trait_type: "Attack", value: stats.attack },
        { trait_type: "Defense", value: stats.defense },
        { trait_type: "Speed", value: stats.speed },
        { trait_type: "Magic", value: stats.magic },
        { trait_type: "Type", value: mediaType.toUpperCase() }
      ],
      transaction: txHash,
      network: network.name
    };
    const blob = new Blob([JSON.stringify(metadata, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.replace(/\s+/g, "_")}_metadata.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCard = () => {
    if (!isPaid) { alert("🔒 Please complete payment first!"); return; }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = 500;
    canvas.height = 700;
    const rarityTheme = RARITY_COLORS[rarity];
    ctx.fillStyle = rarityTheme.bg;
    ctx.fillRect(0, 0, 500, 700);

    const gradient = ctx.createLinearGradient(0, 0, 0, 700);
    gradient.addColorStop(0, "rgba(0,0,0,0.3)");
    gradient.addColorStop(1, "rgba(0,0,0,0.8)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 500, 700);

    ctx.strokeStyle = color;
    ctx.lineWidth = 10;
    ctx.shadowColor = rarityTheme.glow;
    ctx.shadowBlur = 20;
    ctx.strokeRect(10, 10, 480, 680);
    ctx.shadowBlur = 0;

    if (media) {
      const img = new window.Image();
      img.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(40, 40, 420, 300, 20);
        ctx.clip();
        ctx.drawImage(img, 40, 40, 420, 300);
        ctx.restore();

        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(40, 40, 420, 300, 20);
        ctx.stroke();

        drawText();
      };
      img.src = media;
    } else {
      drawText();
    }

    function drawText() {
      ctx.font = "bold 36px 'Arial Black', Arial";
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur = 10;
      ctx.fillText(name, 250, 390);

      ctx.shadowBlur = 15;
      ctx.font = "bold 22px Arial";
      if (rarity === "Mythic") {
        const grad = ctx.createLinearGradient(150, 0, 350, 0);
        grad.addColorStop(0, "#f43f5e");
        grad.addColorStop(0.2, "#f59e42");
        grad.addColorStop(0.4, "#fbbf24");
        grad.addColorStop(0.6, "#10b981");
        grad.addColorStop(0.8, "#3b82f6");
        grad.addColorStop(1, "#a21caf");
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = RARITY_COLORS[rarity].border;
      }

      ctx.fillText(`✨ ${rarity} ✨`, 250, 435);

      ctx.shadowBlur = 5;
      ctx.font = "bold 24px Arial";
      ctx.fillStyle = "#fff";

      const statY = 490;
      const spacing = 50;

      ctx.fillText(`⚔️ ATK: ${stats.attack}`, 130, statY);
      ctx.fillText(`🛡️ DEF: ${stats.defense}`, 370, statY);
      ctx.fillText(`⚡ SPD: ${stats.speed}`, 130, statY + spacing);
      ctx.fillText(`✨ MAG: ${stats.magic}`, 370, statY + spacing);

      ctx.font = "bold 18px Arial";
      ctx.fillStyle = mediaType === "gif" ? "#ff00ff" : "#00ff00";
      ctx.fillText(mediaType === "gif" ? "🎬 ANIMATED" : "🖼️ STATIC", 250, 600);

      ctx.font = "bold 20px Arial";
      ctx.fillStyle = network.color;
      ctx.fillText(`⛓️ ${network.name}`, 250, 645);

      ctx.shadowBlur = 0;

      const link = document.createElement("a");
      link.download = `${name.replace(/\s+/g, "_")}_card.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  const randomizeStats = () => {
    setStats({
      attack: Math.floor(Math.random() * 100),
      defense: Math.floor(Math.random() * 100),
      speed: Math.floor(Math.random() * 100),
      magic: Math.floor(Math.random() * 100)
    });
  };

  const rarityTheme = RARITY_COLORS[rarity];

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col items-center justify-center p-2 md:p-6">
      <div className="w-full max-w-6xl mx-auto mt-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-6 rounded-3xl bg-black border-2 border-blue-500 shadow-2xl mb-8" style={{ boxShadow: `0 0 20px ${glow}` }}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-xl">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black" style={{ color }}>NFT Generator Pro</h1>
              <p className="text-sm" style={{ color: "#60a5fa" }}>Create, Customize & Mint NFTs</p>
            </div>
          </div>
          <ConnectButton client={client} />
        </div>

        {/* Color preset buttons */}
        <div className="grid grid-cols-4 gap-3 mb-6">
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
              <Led color={preset.color} glow={preset.glow} delay={`${i * 0.2}s`} />
              {preset.name}
            </button>
          ))}
        </div>
        {/* ...rest of your UI (controls, card, etc.) ... */}
      </div>
      <style>{`
        @keyframes led-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
