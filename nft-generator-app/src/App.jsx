import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Camera, Palette, Zap, Download, Check, Lock, Unlock, Film, Image as ImageIcon, RefreshCw, Paintbrush } from "lucide-react";
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

const NETWORKS = [
  { name: "Ethereum", chainId: 1, symbol: "ETH", fee: "0.001", color: "#2563eb", icon: "Ξ" },
  { name: "Polygon", chainId: 137, symbol: "MATIC", fee: "0.01", color: "#8247E5", icon: "◈" },
  { name: "Base", chainId: 8453, symbol: "ETH", fee: "0.0005", color: "#0052FF", icon: "🔵" },
  { name: "BSC", chainId: 56, symbol: "BNB", fee: "0.001", color: "#F0B90B", icon: "⬡" }
];

const TREASURY = "0x592B35c8917eD36c39Ef73D0F5e92B0173560b2e";

function Led({ active, disabled }) {
  return (
    <span
      className={
        `inline-block w-3 h-3 rounded-full mr-2 ` +
        (disabled
          ? "bg-gray-700"
          : active
            ? "bg-blue-400 shadow-[0_0_8px_2px_rgba(59,130,246,0.7)] animate-pulse"
            : "bg-blue-500 shadow-[0_0_8px_2px_rgba(59,130,246,0.7)]"
        )
      }
    />
  );
}

export default function App() {
  const [media, setMedia] = useState(null);
  const [name, setName] = useState("Epic NFT");
  const [rarity, setRarity] = useState("Legendary");
  const [stats, setStats] = useState({ attack: 85, defense: 70, speed: 90, magic: 75 });
  const [color, setColor] = useState("#2563eb");
  const [network, setNetwork] = useState(NETWORKS[2]);
  const [txStatus, setTxStatus] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [mediaType, setMediaType] = useState("image");
  const [frames, setFrames] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef();
  const canvasRef = useRef();
  const account = useActiveAccount();
  const wallet = useActiveWallet();

  useEffect(() => {
    document.body.style.overflowX = "hidden";
    return () => { document.body.style.overflowX = ""; };
  }, []);

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
      name, description: `${rarity} NFT on ${network.name}`, image: media || "ipfs://...",
      animation_url: mediaType === "gif" ? media : undefined,
      attributes: [
        { trait_type: "Rarity", value: rarity },
        { trait_type: "Attack", value: stats.attack },
        { trait_type: "Defense", value: stats.defense },
        { trait_type: "Speed", value: stats.speed },
        { trait_type: "Magic", value: stats.magic },
        { trait_type: "Type", value: mediaType.toUpperCase() }
      ],
      transaction: txHash, network: network.name, created_at: new Date().toISOString()
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
    canvas.width = 600;
    canvas.height = 900;
    const rarityTheme = RARITY_COLORS[rarity];
    const bgGradient = ctx.createLinearGradient(0, 0, 0, 900);
    if (rarity === "Mythic") {
      bgGradient.addColorStop(0, "#ec4899");
      bgGradient.addColorStop(0.5, "#8b5cf6");
      bgGradient.addColorStop(1, "#3b82f6");
    } else {
      bgGradient.addColorStop(0, rarityTheme.border);
      bgGradient.addColorStop(1, "#000");
    }
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 600, 900);
    ctx.strokeStyle = color;
    ctx.lineWidth = 12;
    ctx.shadowColor = rarityTheme.glow;
    ctx.shadowBlur = 30;
    ctx.strokeRect(15, 15, 570, 870);
    ctx.shadowBlur = 0;
    if (media) {
      const img = new window.Image();
      img.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(50, 50, 500, 400, 25);
        ctx.clip();
        ctx.drawImage(img, 50, 50, 500, 400);
        ctx.restore();
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.shadowColor = rarityTheme.glow;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.roundRect(50, 50, 500, 400, 25);
        ctx.stroke();
        ctx.shadowBlur = 0;
        drawText();
      };
      img.src = media;
    } else { drawText(); }
    function drawText() {
      ctx.font = "bold 48px Arial";
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(0,0,0,0.9)";
      ctx.shadowBlur = 15;
      ctx.fillText(name, 300, 520);
      ctx.shadowBlur = 20;
      ctx.font = "bold 28px Arial";
      if (rarity === "Mythic") {
        const grad = ctx.createLinearGradient(200, 0, 400, 0);
        grad.addColorStop(0, "#f43f5e");
        grad.addColorStop(0.25, "#f59e42");
        grad.addColorStop(0.5, "#fbbf24");
        grad.addColorStop(0.75, "#10b981");
        grad.addColorStop(1, "#a21caf");
        ctx.fillStyle = grad;
      } else { ctx.fillStyle = rarityTheme.border; }
      ctx.fillText(`✨ ${rarity} ✨`, 300, 580);
      ctx.shadowBlur = 8;
      ctx.font = "bold 32px Arial";
      ctx.fillStyle = "#fff";
      ctx.fillText(`⚔️ ${stats.attack}`, 150, 660);
      ctx.fillText(`🛡️ ${ stats.defense}`, 450, 660);
      ctx.fillText(`⚡ ${stats.speed}`, 150, 730);
      ctx.fillText(`✨ ${stats.magic}`, 450, 730);
      ctx.font = "bold 22px Arial";
      ctx.fillStyle = mediaType === "gif" ? "#ec4899" : "#10b981";
      ctx.fillText(mediaType === "gif" ? "🎬 ANIMATED" : "🖼️ STATIC", 300,  810);
      ctx.font = "bold 26px Arial";
      ctx.fillStyle = network.color;
      ctx.fillText(`${network.icon} ${network.name}`, 300, 855);
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

  // Helper for LED state: active if not disabled and not loading
  const ledActive = (disabled, loading) => !disabled && !loading;

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col items-center justify-center p-2 md:p-6">
      <div className="w-full max-w-6xl mx-auto mt-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-6 rounded-3xl bg-black border-2 border-blue-500 shadow-2xl mb-8" style={{ boxShadow: "0 0 20px rgba(59,130,246,0.5)" }}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-blue-400">NFT Generator Pro</h1>
              <p className="text-sm text-blue-300 font-medium mt-1">Create, Customize & Mint NFTs</p>
            </div>
          </div>
          <ConnectButton client={client} />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-6">
            {/* Upload */}
            <div className="bg-black rounded-2xl p-6 border-2 border-blue-500 shadow-xl" style={{ boxShadow: "0 0 20px rgba(59,130,246,0.5)" }}>
              <h3 className="text-blue-400 font-bold mb-4 flex items-center gap-2 text-lg">
                <Camera className="w-6 h-6" /> Upload Media
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 border-2 border-blue-500 shadow-lg flex items-center justify-center gap-2 hover:scale-105 transition"
                  style={{ boxShadow: "0 0 20px rgba(59,130,246,0.5)" }}
                >
                  <Led active={true} />
                  <ImageIcon className="w-5 h-5" />Choose File
                </button>
                <button
                  onClick={convertToGif}
                  disabled={!media || mediaType === "gif" || isProcessing}
                  className={`py-4 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 border-2 border-blue-500 shadow-lg flex items-center justify-center gap-2 transition ${(!media || mediaType === "gif" || isProcessing) ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
                  style={{ boxShadow: "0 0 20px rgba(59,130,246,0.5)" }}
                >
                  <Led active={ledActive(!(!media || mediaType === "gif" || isProcessing), isProcessing)} disabled={!media || mediaType === "gif" || isProcessing} />
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
            <div className="bg-black rounded-2xl p-6 border-2 border-blue-500 shadow-xl" style={{ boxShadow: "0 0 20px rgba(59,130,246,0.5)" }}>
              <h3 className="text-blue-400 font-bold mb-4 flex items-center gap-2 text-lg">
                <Palette className="w-6 h-6" /> NFT Configuration
              </h3>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-black text-white px-5 py-4 rounded-xl mb-4 font-semibold border-2 border-blue-700 focus:border-blue-500 transition-all outline-none shadow-inner text-lg" placeholder="Enter NFT Name" />
              <div className="grid grid-cols-2 gap-4">
                <select value={rarity} onChange={e => setRarity(e.target.value)} className="bg-black text-white px-5 py-4 rounded-xl font-bold border-2 border-blue-700 focus:border-blue-500 transition-all outline-none cursor-pointer shadow-inner text-lg" style={{ color: rarityTheme.text }}>
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
            <div className="bg-black rounded-2xl p-6 border-2 border-blue-500 shadow-xl" style={{ boxShadow: "0 0 20px rgba(59,130,246,0.5)" }}>
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-blue-400 font-bold flex items-center gap-3 text-lg">
                  <Zap className="w-6 h-6" /> Attributes
                </h3>
                <button
                  onClick={randomizeStats}
                  className="text-white text-sm flex items-center gap-2 font-bold px-4 py-2 rounded-xl border-2 border-blue-500 bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg hover:scale-105 transition"
                  style={{ boxShadow: "0 0 20px rgba(59,130,246,0.5)" }}
                >
                  <Led active={true} />
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
            <div className="bg-black rounded-2xl p-6 border-2 border-blue-500 shadow-xl" style={{ boxShadow: "0 0 20px rgba(59,130,246,0.5)" }}>
              <h3 className="text-blue-400 font-bold mb-4 flex items-center gap-2 text-lg">
                <span className="text-2xl">⛓️</span> Select Network
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {NETWORKS.map(net => (
                  <button key={net.name} onClick={() => setNetwork(net)} className={`py-4 px-4 rounded-xl font-bold text-base transition-all border-2 ${network.name === net.name ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white border-white shadow-xl scale-105" : "bg-black text-blue-200 border-blue-700 hover:bg-blue-900"} flex items-center gap-2 shadow-lg hover:scale-105`} style={{ boxShadow: "0 0 20px rgba(59,130,246,0.5)" }}>
                    <Led active={network.name === net.name} disabled={false} />
                    <div className="text-2xl mb-1">{net.icon}</div>
                    {net.name}
                    <div className="text-xs mt-1 opacity-80">{net.fee} {net.symbol}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment & Download */}
            <div className="bg-black rounded-2xl p-6 border-2 border-blue-500 shadow-xl" style={{ boxShadow: "0 0 20px rgba(59,130,246,0.5)" }}>
              <h3 className="text-blue-400 font-bold mb-4 flex items-center gap-2 text-lg">
                <div className="p-2 rounded-xl bg-blue-500/20">{isPaid ? <Unlock className="w-6 h-6 text-blue-400" /> : <Lock className="w-6 h-6 text-blue-400" />}</div>
                {isPaid ? "✅ Downloads Unlocked" : "🔒 Payment Required"}
              </h3>
              <button
                onClick={mintWithPayment}
                disabled={txStatus === "pending" || isPaid || !account}
                className={`w-full py-5 rounded-xl font-bold mb-4 flex items-center justify-center gap-3 text-lg transition-all border-2 border-blue-500 bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg ${isPaid ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
                style={{ boxShadow: "0 0 20px rgba(59,130,246,0.5)" }}
              >
                <Led active={!isPaid && !!account && txStatus !== "pending"} disabled={isPaid || !account || txStatus === "pending"} />
                {!account ? <><Lock className="w-6 h-6" /> Connect Wallet First</> : isPaid ? <><Check className="w-6 h-6" /> Payment Completed</> : txStatus === "pending" ? <><RefreshCw className="w-6 h-6 animate-spin" /> Processing...</> : <><span className="text-2xl">{network.icon}</span>Pay {network.fee} {network.symbol}</>}
              </button>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={downloadCard}
                  disabled={!isPaid}
                  className={`py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border-2 border-blue-500 bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg ${!isPaid ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
                  style={{ boxShadow: "0 0 20px rgba(59,130,246,0.5)" }}
                >
                  <Led active={isPaid} disabled={!isPaid} />
                  <Download className="w-5 h-5" /> Card PNG
                </button>
                <button
                  onClick={downloadMetadata}
                  disabled={!isPaid}
                  className={`py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border-2 border-blue-500 bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg ${!isPaid ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
                  style={{ boxShadow: "0 0 20px rgba(59,130,246,0.5)" }}
                >
                  <Led active={isPaid} disabled={!isPaid} />
                  <Download className="w-5 h-5" /> Metadata
                </button>
              </div>
            </div>
          </div>

          {/* NFT Card Preview */}
          <div className="flex justify-center items-start">
            <div
              className="rounded-3xl overflow-hidden w-full max-w-md shadow-2xl"
              style={{
                border: "4px solid #a855f7",
                boxShadow: "0 0 50px #a855f7, 0 0 100px #a855f7",
                background: "linear-gradient(135deg, #7c3aed 0%, #22d3ee 100%)",
              }}
            >
              <div
                className="aspect-[2/3] flex items-center justify-center relative"
                style={{
                  background: "linear-gradient(135deg, #7c3aed 0%, #22d3ee 100%)",
                  minHeight: "500px",
                }}
              >
                {media ? (
                  mediaType === "gif" && frames.length > 0 ? (
                    <img src={frames[Math.floor(Date.now() / 200) % frames.length]} alt="NFT GIF" className="w-full h-full object-cover" />
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
                <h2 className="text-3xl font-black mb-3" style={{ color: color, textShadow: `0 0 20px ${rarityTheme.glow}, 0 0 40px ${rarityTheme.glow}` }}>{name}</h2>
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
                    <div className="text-xl">🛡️ { stats.defense}</div>
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
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
