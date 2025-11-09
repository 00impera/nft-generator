import React, { useState, useRef } from "react";
import { Sparkles, Camera, Palette, Zap, Wallet, Download, Check } from "lucide-react";

const RARITY_COLORS = {
  Common: "#b0b0b0",
  Rare: "#3b82f6",
  Epic: "#a21caf",
  Legendary: "#f59e42",
  Mythic: "linear-gradient(90deg,#f43f5e,#f59e42,#fbbf24,#10b981,#3b82f6,#a21caf,#f43f5e)"
};

const NETWORK = {
  name: "Ethereum",
  chainId: "0x1",
  symbol: "ETH",
  fee: "0.001",
  color: "#627EEA"
};
const TREASURY = "0x592B35c8917eD36c39Ef73D0F5e92B0173560b2e";

export default function App() {
  const [media, setMedia] = useState(null);
  const [name, setName] = useState("Epic NFT");
  const [rarity, setRarity] = useState("Mythic");
  const [stats, setStats] = useState({ attack: 85, defense: 70, speed: 90, magic: 75 });
  const [color, setColor] = useState("#00ffff");
  const [wallet, setWallet] = useState(null);
  const [provider, setProvider] = useState(null);
  const [txStatus, setTxStatus] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const fileInputRef = useRef();
  const canvasRef = useRef();

  // Connect MetaMask
  const connectWallet = async () => {
    try {
      const p = window.ethereum;
      if (!p) return alert("Please install MetaMask!");
      const accounts = await p.request({ method: "eth_requestAccounts" });
      setWallet(accounts[0]);
      setProvider(p);
    } catch (err) {
      alert("Connection failed: " + err.message);
    }
  };

  // Payment and Mint
  const mintWithPayment = async () => {
    if (!wallet) return connectWallet();
    if (!media) return alert("Upload an image first!");
    try {
      setTxStatus("pending");
      const value = "0x" + BigInt(Math.floor(parseFloat(NETWORK.fee) * 1e18)).toString(16);
      const tx = await provider.request({
        method: "eth_sendTransaction",
        params: [{ from: wallet, to: TREASURY, value, gas: "0x5208" }]
      });
      setTxHash(tx);
      setTxStatus("success");
      setIsPaid(true);
      setTimeout(downloadCard, 1000);
    } catch (err) {
      setTxStatus("failed");
      if (err.code === 4001) alert("❌ Transaction cancelled");
      else if (err.message?.includes("insufficient")) alert(`💰 Need ${NETWORK.fee} ${NETWORK.symbol}`);
      else alert("❌ Transaction failed: " + err.message);
    }
  };

  // Upload
  const handleMediaUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setMedia(ev.target.result);
    reader.readAsDataURL(file);
  };

  // Download Metadata
  const downloadMetadata = () => {
    const metadata = {
      name,
      description: `${rarity} NFT on ${NETWORK.name}`,
      image: media || "ipfs://...",
      attributes: [
        { trait_type: "Rarity", value: rarity },
        { trait_type: "Attack", value: stats.attack },
        { trait_type: "Defense", value: stats.defense },
        { trait_type: "Speed", value: stats.speed },
        { trait_type: "Magic", value: stats.magic }
      ],
      transaction: txHash
    };
    const blob = new Blob([JSON.stringify(metadata, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.replace(/\s+/g, "_")}_metadata.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download Card
  const downloadCard = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = 400;
    canvas.height = 600;
    // BG
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 400, 600);
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 300, 400, 300);
    // Border
    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    ctx.strokeRect(6, 6, 388, 588);
    // Image
    if (media) {
      const img = new window.Image();
      img.onload = () => {
        ctx.drawImage(img, 30, 30, 340, 240);
        drawText();
      };
      img.src = media;
    } else drawText();
    function drawText() {
      // Name
      ctx.font = "bold 28px Arial";
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.fillText(name, 200, 300);
      // Rarity
      ctx.font = "bold 20px Arial";
      if (rarity === "Mythic") {
        const grad = ctx.createLinearGradient(100, 0, 300, 0);
        grad.addColorStop(0, "#f43f5e");
        grad.addColorStop(0.2, "#f59e42");
        grad.addColorStop(0.4, "#fbbf24");
        grad.addColorStop(0.6, "#10b981");
        grad.addColorStop(0.8, "#3b82f6");
        grad.addColorStop(1, "#a21caf");
        ctx.fillStyle = grad;
      } else ctx.fillStyle = RARITY_COLORS[rarity];
      ctx.fillText(rarity, 200, 335);
      // Stats
      ctx.font = "16px Arial";
      ctx.fillStyle = "#fff";
      ctx.fillText(`⚔️${stats.attack} 🛡️${stats.defense}`, 200, 370);
      ctx.fillText(`⚡${stats.speed} ✨${stats.magic}`, 200, 395);
      ctx.font = "14px Arial";
      ctx.fillStyle = color;
      ctx.fillText(`${NETWORK.name}`, 200, 570);
      // Download
      const link = document.createElement("a");
      link.download = `${name.replace(/\s+/g, "_")}_card.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  // Randomize
  const randomizeStats = () => setStats({
    attack: Math.floor(Math.random() * 100),
    defense: Math.floor(Math.random() * 100),
    speed: Math.floor(Math.random() * 100),
    magic: Math.floor(Math.random() * 100)
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-2">
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-cyan-400" />
            NFT Card Generator
          </h1>
          <div className="flex gap-2">
            {wallet ? (
              <div className="bg-green-900 px-4 py-2 rounded-lg border-2 border-green-500 text-white text-sm flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400" />
                {wallet.slice(0, 6)}...{wallet.slice(-4)}
              </div>
            ) : (
              <button onClick={connectWallet} className="bg-cyan-500 px-4 py-2 rounded-lg text-white font-bold flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Connect MetaMask
              </button>
            )}
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-4">
            {/* Upload */}
            <div className="bg-gray-800 rounded-xl p-4 border-2 border-gray-700">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <Camera className="w-5 h-5" /> Upload Image
              </h3>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleMediaUpload} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="w-full bg-cyan-500 text-white py-3 rounded-lg font-bold">
                Choose File
              </button>
              {media && (
                <div className="mt-2 p-2 bg-green-900 border border-green-500 rounded text-green-400 text-sm flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Image uploaded!
                </div>
              )}
            </div>
            {/* Details */}
            <div className="bg-gray-800 rounded-xl p-4 border-2 border-gray-700">
              <h3 className="text-white font-bold mb-3">Details</h3>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg mb-3" placeholder="NFT Name" />
              <div className="grid grid-cols-2 gap-3">
                <select value={rarity} onChange={e => setRarity(e.target.value)} className="bg-gray-700 text-white px-3 py-2 rounded-lg font-bold" style={rarity === "Mythic" ? { background: "linear-gradient(90deg,#f43f5e,#f59e42,#fbbf24,#10b981,#3b82f6,#a21caf,#f43f5e)", color: "#fff" } : { color: RARITY_COLORS[rarity] }}>
                  {Object.keys(RARITY_COLORS).map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <div className="flex items-center gap-2 bg-gray-700 px-3 rounded-lg">
                  <Palette className="w-4 h-4 text-gray-400" />
                  <input type="color" value={color} onChange={e => setColor(e.target.value)} className="flex-1" />
                </div>
              </div>
            </div>
            {/* Stats */}
            <div className="bg-gray-800 rounded-xl p-4 border-2 border-gray-700">
              <div className="flex justify-between mb-3">
                <h3 className="text-white font-bold">Stats</h3>
                <button onClick={randomizeStats} className="text-cyan-400 text-sm flex items-center gap-1">
                  <Zap className="w-4 h-4" /> Random
                </button>
              </div>
              {Object.entries(stats).map(([key, value]) => (
                <div key={key} className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300 capitalize">{key}</span>
                    <span className="text-white font-bold">{value}</span>
                  </div>
                  <input type="range" min="0" max="100" value={value} onChange={e => setStats({ ...stats, [key]: parseInt(e.target.value) })} className="w-full" style={{ accentColor: color }} />
                </div>
              ))}
            </div>
            {/* Payment & Download */}
            <div className="bg-gray-800 rounded-xl p-4 border-2 border-gray-700">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <Wallet className="w-5 h-5" /> Mint & Download
              </h3>
              <button onClick={mintWithPayment} disabled={txStatus === "pending"} className={`w-full py-3 rounded-lg font-bold mb-3 ${txStatus === "pending" ? "bg-gray-600" : "bg-green-500"} text-white flex items-center justify-center gap-2`}>
                {txStatus === "pending" ? "Processing..." : `Pay ${NETWORK.fee} ${NETWORK.symbol} & Mint`}
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={downloadCard} className="py-3 rounded-lg font-bold bg-blue-500 text-white flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> Card
                </button>
                <button onClick={downloadMetadata} className="py-3 rounded-lg font-bold bg-purple-500 text-white flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> JSON
                </button>
              </div>
            </div>
          </div>
          {/* Preview */}
          <div className="bg-gray-800 rounded-xl p-4 border-2 border-gray-700">
            <h3 className="text-white font-bold mb-4">Preview</h3>
            <div className="rounded-xl overflow-hidden" style={{ border: `3px solid ${color}`, boxShadow: `0 0 30px ${color}60` }}>
              <div className="aspect-[2/3] bg-gray-900 flex items-center justify-center" style={{ width: "200px", height: "300px" }}>
                {media ? (
                  <img src={media} alt="NFT" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-16 h-16 text-gray-600" />
                )}
              </div>
              <div className="p-4 bg-gradient-to-t from-black to-transparent">
                <h2 className="text-white text-xl font-bold">{name}</h2>
                <span className="text-xs font-bold px-2 py-1 rounded" style={rarity === "Mythic"
                  ? { background: "linear-gradient(90deg,#f43f5e,#f59e42,#fbbf24,#10b981,#3b82f6,#a21caf,#f43f5e)", color: "#fff" }
                  : { background: RARITY_COLORS[rarity], color: "#fff" }
                }>
                  {rarity}
                </span>
                <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                  <div className="bg-black/40 rounded px-2 py-1">⚔️ {stats.attack}</div>
                  <div className="bg-black/40 rounded px-2 py-1">🛡️ {stats.defense}</div>
                  <div className="bg-black/40 rounded px-2 py-1">⚡ {stats.speed}</div>
                  <div className="bg-black/40 rounded px-2 py-1">✨ {stats.magic}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
