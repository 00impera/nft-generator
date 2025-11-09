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

function Led({ active, disabled, color = "#2563eb", glow = "rgba(37,99,235,0.7)", delay = "0s" }) {
  return (
    <span
      className={
        `inline-block w-3 h-3 rounded-full mr-2 ` +
        (disabled
          ? "bg-gray-700"
          : active
            ? ""
            : ""
        )
      }
      style={{
        background: disabled ? "#374151" : color,
        boxShadow: disabled ? "none" : `0 0 8px 2px ${glow}`,
        animation: active && !disabled ? `led-pulse 1.2s infinite` : "none",
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
              {/* You can add a diamond SVG or logo here */}
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
              <span className={`w-3 h-3 rounded-full mb-1`} style={{
                background: preset.color,
                boxShadow: `0 0 8px 2px ${preset.glow}`,
                animation: `led-pulse 1.2s infinite`,
                animationDelay: `${i * 0.2}s`
              }} />
              {preset.name}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* NFT Card Preview (always visible) */}
          <div className="flex justify-center items-start">
            <div
              className="rounded-3xl overflow-hidden w-full max-w-md shadow-2xl relative"
              style={{
                border: `4px solid ${color}`,
                boxShadow: `0 0 50px ${glow}, 0 0 100px ${glow}`,
                background: "linear-gradient(135deg, #7c3aed 0%, #22d3ee 100%)",
                transform: `perspective(900px) rotateX(${cardRotation.x}deg) rotateY(${cardRotation.y}deg)`,
                transition: "transform 0.2s cubic-bezier(.25,.8,.25,1)"
              }}
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
            >
              {/* Locked overlay */}
              {!isPaid && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20">
                  <Lock className="w-16 h-16 text-blue-500 animate-pulse mb-4" />
                  <p className="text-lg font-bold text-blue-300">Unlock this NFT card by paying</p>
                </div>
              )}
              <div
                className="aspect-[2/3] flex items-center justify-center relative"
                style={{
                  minHeight: "500px"
                }}
              >
                {media ? (
                  mediaType === "gif" && frames.length > 0 ? (
                    <img
                      src={frames[Math.floor(Date.now() / 200) % frames.length]}
                      alt="NFT GIF"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img src={media} alt="NFT" className="w-full h-full object-cover" />
                  )
                ) : (
                  <div className="text-center p-8">
                    <div className="p-6 rounded-full bg-slate-800/50 inline-block mb-4">
                      <Camera className="w-24 h-24 text-slate-600" />
                    </div>
                    <p className="text-slate-500 font-bold text-xl">Upload your artwork</p>
                    <p className="text-slate-600 text-sm mt-2">Supports images and GIFs</p>
                  </div>
                )}
                {mediaType === "gif" && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-blue-400 text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg">
                    <Film className="w-4 h-4" />ANIMATED
                  </div>
                )}
              </div>
              <div className="p-6 relative" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.8), #000)" }}>
                <h2 className="text-3xl font-black mb-3" style={{ color, textShadow: `0 0 20px ${rarityTheme.glow}, 0 0 40px ${rarityTheme.glow}` }}>{name}</h2>
                <span className="inline-block text-base font-bold px-5 py-2 rounded-full mb-4 shadow-lg" style={rarity === "Mythic" ? { background: "linear-gradient(90deg,#f43f5e,#f59e42,#fbbf24,#10b981,#3b82f6,#a21caf)", color: "#fff", boxShadow: `0 0 20px ${rarityTheme.glow}` } : { background: RARITY_COLORS[rarity].border, color: "#fff", boxShadow: `0 0 20px ${rarityTheme.glow}` }}>
                  ✨ {rarity}
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/70 rounded-xl px-4 py-3 font-bold text-white text-center border-2 border-blue-500/40">
                    <div className="text-xs text-gray-400 mb-1">Attack</div>
                    <div className="text-xl">⚔️ {stats.attack}</div>
                  </div>
                  <div className="bg-black/70 rounded-xl px-4 py-3 font-bold text-white text-center border-2 border-blue-500/40">
                    <div className="text-xs text-gray-400 mb-1">Defense</div>
                    <div className="text-xl">🛡️ {stats.defense}</div>
                  </div>
                  <div className="bg-black/70 rounded-xl px-4 py-3 font-bold text-white text-center border-2 border-blue-500/40">
                    <div className="text-xs text-gray-400 mb-1">Speed</div>
                    <div className="text-xl">⚡ {stats.speed}</div>
                  </div>
                  <div className="bg-black/70 rounded-xl px-4 py-3 font-bold text-white text-center border-2 border-blue-500/40">
                    <div className="text-xs text-gray-400 mb-1">Magic</div>
                    <div className="text-xl">✨ {stats.magic}</div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <span className="inline-block px-4 py-2 rounded-full font-bold text-sm" style={{ backgroundColor: network.color + "30", color: network.color }}>
                    ⛓️ {network.name}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Upload */}
            <div className="bg-black rounded-2xl p-6 border-2 border-blue-500 shadow-xl" style={{ boxShadow: `0 0 20px ${glow}` }}>
              <h3 className="font-bold mb-4 flex items-center gap-2 text-lg" style={{ color }}>
                <Camera className="w-6 h-6" /> Upload Media
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="py-4 rounded-xl font-bold text-white bg-gradient-to-r border-2 shadow-lg flex items-center justify-center gap-2 hover:scale-105 transition"
                  style={{
                    background: `linear-gradient(90deg, ${color} 0%, #000 100%)`,
                    boxShadow: `0 0 20px ${glow}`,
                    borderColor: color
                  }}
                >
                  <Led active={true} color={color} glow={glow} />
                  <ImageIcon className="w-5 h-5" />Choose File
                </button>
                <button
                  onClick={convertToGif}
                  disabled={!media || mediaType === "gif" || isProcessing}
                  className={`py-4 rounded-xl font-bold text-white bg-gradient-to-r border-2 shadow-lg flex items-center justify-center gap-2 transition ${(!media || mediaType === "gif" || isProcessing) ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
                  style={{
                    background: `linear-gradient(90deg, ${color} 0%, #000 100%)`,
                    boxShadow: `0 0 20px ${glow}`,
                    borderColor: color
                  }}
                >
                  <Led active={!(!media || mediaType === "gif" || isProcessing)} color={color} glow={glow} />
                  {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Film className="w-5 h-5" />}
                  {isProcessing ? "Processing..." : "To GIF"}
                </button>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*,image/gif" onChange={handleMediaUpload} className="hidden" />
              {media && (
                <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-blue-500/20 to-blue-700/20 border-2 border-blue-500/40 flex items-center gap-3">
                  <Check className="w-6 h-6 text-blue-400" />
                  <span className="text-blue-300 font-semibold">{mediaType === "gif" ? "✨ Animated GIF ready!" : "📸 Image uploaded!"}</span>
                </div>
              )}
            </div>

            {/* NFT Config */}
            <div className="bg-black rounded-2xl p-6 border-2 border-blue-500 shadow-xl" style={{ boxShadow: `0 0 20px ${glow}` }}>
              <h3 className="font-bold mb-4 flex items-center gap-2 text-lg" style={{ color }}>
                <Palette className="w-6 h-6" /> NFT Configuration
              </h3>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-black text-white px-5 py-4 rounded-xl mb-4 font-semibold border-2 border-blue-700 focus:border-blue-500 transition-all outline-none shadow-inner text-lg" placeholder="Enter NFT Name" />
              <div className="grid grid-cols-2 gap-4">
                <select value={rarity} onChange={e => setRarity(e.target.value)} className="bg-black text-white px-5 py-4 rounded-xl font-bold border-2 border-blue-700 focus:border-blue-500 transition-all outline-none cursor-pointer shadow-inner text-lg" style={{ color: RARITY_COLORS[rarity].text }}>
                  {Object.keys(RARITY_COLORS).map(r => (
                    <option key={r} value={r} style={{ color: RARITY_COLORS[r].text }}>{r}</option>
                  ))}
                </select>
                <div className="flex items-center gap-3 bg-black px-5 rounded-xl border-2 border-blue-700 shadow-inner">
                  <Palette className="w-6 h-6 text-blue-400" />
                  <input type="color" value={color} onChange={e => setColor(e.target.value)} className="flex-1 h-10 cursor-pointer rounded-lg" />
                </div>
              </div>
            </div>

            {/* Attributes */}
            <div className="bg-black rounded-2xl p-6 border-2 border-blue-500 shadow-xl" style={{ boxShadow: `0 0 20px ${glow}` }}>
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold flex items-center gap-3 text-lg" style={{ color }}>
                  <Zap className="w-6 h-6" /> Attributes
                </h3>
                <button
                  onClick={randomizeStats}
                  className="text-white text-sm flex items-center gap-2 font-bold px-4 py-2 rounded-xl border-2 border-blue-500 bg-gradient-to-r"
                  style={{
                    background: `linear-gradient(90deg, ${color} 0%, #000 100%)`,
                    boxShadow: `0 0 20px ${glow}`,
                    borderColor: color
                  }}
                >
                  <Led active={true} color={color} glow={glow} />
                  <Zap className="w-5 h-5" /> Randomize
                </button>
              </div>
              {Object.entries(stats).map(([key, value]) => (
                <div key={key} className="mb-5">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-blue-200 capitalize font-bold text-base">{key}</span>
                    <span className="text-blue-400 font-black text-xl">{value}</span>
                  </div>
                  <input type="range" min="0" max="100" value={value} onChange={e => setStats({ ...stats, [key]: parseInt(e.target.value) })} className="w-full h-4 rounded-lg appearance-none cursor-pointer" style={{ background: `linear-gradient(to right, ${color} ${value}%, #1e293b ${value}%)` }} />
                </div>
              ))}
            </div>

            {/* Network */}
            <div className="bg-black rounded-2xl p-6 border-2 border-blue-500 shadow-xl" style={{ boxShadow: `0 0 20px ${glow}` }}>
              <h3 className="font-bold mb-4 flex items-center gap-2 text-lg" style={{ color }}>
                <span className="text-2xl">⛓️</span> Select Network
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {NETWORKS.map(net => (
                  <button key={net.name} onClick={() => setNetwork(net)} className={`py-4 px-4 rounded-xl font-bold text-base transition-all border-2 ${network.name === net.name ? "bg-gradient-to-r text-white border-white shadow-xl scale-105" : "bg-black text-blue-200 border-blue-700 hover:bg-blue-900"} flex items-center gap-2 shadow-lg hover:scale-105`} style={{ boxShadow: `0 0 20px ${glow}` }}>
                    <Led active={network.name === net.name} color={color} glow={glow} />
                    <div className="text-2xl mb-1">{net.icon}</div>
                    {net.name}
                    <div className="text-xs mt-1 opacity-80">{net.fee} {net.symbol}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment & Download */}
            <div className="bg-black rounded-2xl p-6 border-2 border-blue-500 shadow-xl" style={{ boxShadow: `0 0 20px ${glow}` }}>
              <h3 className="font-bold mb-4 flex items-center gap-2 text-lg" style={{ color }}>
                <div className="p-2 rounded-xl bg-blue-500/20">{isPaid ? <Unlock className="w-6 h-6 text-blue-400" /> : <Lock className="w-6 h-6 text-blue-400" />}</div>
                {isPaid ? "✅ Downloads Unlocked" : "🔒 Payment Required"}
              </h3>
              <button
                onClick={mintWithPayment}
                disabled={txStatus === "pending" || isPaid || !account}
                className={`w-full py-5 rounded-xl font-bold mb-4 flex items-center justify-center gap-3 text-lg transition-all border-2 bg-gradient-to-r shadow-lg ${isPaid ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
                style={{
                  background: `linear-gradient(90deg, ${color} 0%, #000 100%)`,
                  boxShadow: `0 0 20px ${glow}`,
                  borderColor: color
                }}
              >
                <Led active={!isPaid && !!account && txStatus !== "pending"} disabled={isPaid || !account || txStatus === "pending"} color={color} glow={glow} />
                {!account ? <><Lock className="w-6 h-6" /> Connect Wallet First</> : isPaid ? <><Check className="w-6 h-6" /> Payment Completed</> : txStatus === "pending" ? <><RefreshCw className="w-6 h-6 animate-spin" /> Processing...</> : <><span className="text-2xl">{network.icon}</span>Pay {network.fee} {network.symbol}</>}
              </button>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={downloadCard}
                  disabled={!isPaid}
                  className={`py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border-2 bg-gradient-to-r shadow-lg ${!isPaid ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
                  style={{
                    background: `linear-gradient(90deg, ${color} 0%, #000 100%)`,
                    boxShadow: `0 0 20px ${glow}`,
                    borderColor: color
                  }}
                >
                  <Led active={isPaid} disabled={!isPaid} color={color} glow={glow} />
                  <Download className="w-5 h-5" /> Card PNG
                </button>
                <button
                  onClick={downloadMetadata}
                  disabled={!isPaid}
                  className={`py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border-2 bg-gradient-to-r shadow-lg ${!isPaid ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
                  style={{
                    background: `linear-gradient(90deg, ${color} 0%, #000 100%)`,
                    boxShadow: `0 0 20px ${glow}`,
                    borderColor: color
                  }}
                >
                  <Led active={isPaid} disabled={!isPaid} color={color} glow={glow} />
                  <Download className="w-5 h-5" /> Metadata
                </button>
              </div>
            </div>
          </div>
        </div>
        <canvas ref={canvasRef} className="hidden" />
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
