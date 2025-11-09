import React, { useState, useRef } from "react";
import { Sparkles, Camera, Palette, Zap, Wallet, Download, Check, X, ChevronDown } from "lucide-react";

const RARITY_COLORS = {
  Common: "#9ca3af",
  Rare: "#3b82f6",
  Epic: "#a855f7",
  Legendary: "#f59e0b",
  Mythic: "linear-gradient(90deg,#f43f5e,#f59e42,#fbbf24,#10b981,#3b82f6,#a21caf)"
};

const NETWORKS = [
  { name: "Ethereum", chainId: "0x1", symbol: "ETH", fee: "0.001", color: "#627EEA" },
  { name: "Polygon", chainId: "0x89", symbol: "MATIC", fee: "0.01", color: "#8247E5" },
  { name: "BSC", chainId: "0x38", symbol: "BNB", fee: "0.001", color: "#F0B90B" }
];

const TREASURY = "0x592B35c8917eD36c39Ef73D0F5e92B0173560b2e";

export default function App() {
  const [media, setMedia] = useState(null);
  const [name, setName] = useState("Epic NFT");
  const [rarity, setRarity] = useState("Mythic");
  const [stats, setStats] = useState({ attack: 85, defense: 70, speed: 90, magic: 75 });
  const [color, setColor] = useState("#d4af37");
  const [wallet, setWallet] = useState(null);
  const [provider, setProvider] = useState(null);
  const [network, setNetwork] = useState(NETWORKS[0]);
  const [txStatus, setTxStatus] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const fileInputRef = useRef();
  const canvasRef = useRef();

  // Prevent horizontal scroll
  React.useEffect(() => {
    document.body.style.overflowX = "hidden";
    document.documentElement.style.overflowX = "hidden";
    return () => {
      document.body.style.overflowX = "";
      document.documentElement.style.overflowX = "";
    };
  }, []);

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

  const mintWithPayment = async () => {
    if (!wallet) return connectWallet();
    if (!media) return alert("Upload an image first!");
    try {
      setTxStatus("pending");
      const value = "0x" + BigInt(Math.floor(parseFloat(network.fee) * 1e18)).toString(16);
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
      else if (err.message?.includes("insufficient")) alert(`💰 Need ${network.fee} ${network.symbol}`);
      else alert("❌ Transaction failed: " + err.message);
    }
  };

  const handleMediaUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setMedia(ev.target.result);
    reader.readAsDataURL(file);
  };

  const downloadMetadata = () => {
    if (!isPaid) {
      alert("🔒 Please complete payment first to download metadata!");
      return;
    }
    const metadata = {
      name,
      description: `${rarity} NFT on ${network.name}`,
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

  const downloadCard = () => {
    if (!isPaid) {
      alert("🔒 Please complete payment first to download your NFT card!");
      return;
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = 400;
    canvas.height = 600;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 400, 600);
    const gradient = ctx.createLinearGradient(0, 0, 400, 600);
    gradient.addColorStop(0, "#1a1a1a");
    gradient.addColorStop(1, "#000");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 600);
    ctx.strokeStyle = color;
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, 392, 592);
    if (media) {
      const img = new window.Image();
      img.onload = () => {
        ctx.drawImage(img, 30, 30, 340, 240);
        drawText();
      };
      img.src = media;
    } else drawText();
    function drawText() {
      ctx.font = "bold 28px Arial";
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.fillText(name, 200, 320);
      ctx.font = "bold 18px Arial";
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
      ctx.fillText(rarity, 200, 360);
      ctx.font = "16px Arial";
      ctx.fillStyle = "#fff";
      ctx.fillText(`⚔️ ${stats.attack}  🛡️ ${stats.defense}`, 200, 400);
      ctx.fillText(`⚡ ${stats.speed}  ✨ ${stats.magic}`, 200, 430);
      ctx.font = "14px Arial";
      ctx.fillStyle = color;
      ctx.fillText(network.name, 200, 560);
      const link = document.createElement("a");
      link.download = `${name.replace(/\s+/g, "_")}_card.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  const randomizeStats = () => setStats({
    attack: Math.floor(Math.random() * 100),
    defense: Math.floor(Math.random() * 100),
    speed: Math.floor(Math.random() * 100),
    magic: Math.floor(Math.random() * 100)
  });

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-black p-2 md:p-4">
      <div className="max-w-4xl w-full mx-auto">
        <div className="flex flex-col md:flex-row gap-4 w-full">
          {/* Controls */}
          <div className="flex-1 w-full space-y-3">
            <div className="rounded-xl p-3 bg-gray-900 border border-gray-800 w-full">
              <h3 className="text-yellow-400 font-bold mb-2 flex items-center gap-2 text-base">
                <Camera className="w-5 h-5" /> Upload Artwork
              </h3>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleMediaUpload} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="w-full py-2 rounded-lg font-bold text-black bg-yellow-400 hover:bg-yellow-300 transition-all text-xs">
                Choose Image
              </button>
              {media && (
                <div className="mt-2 p-2 rounded-lg text-green-400 text-xs flex items-center gap-2 bg-green-900/20 border border-green-500">
                  <Check className="w-4 h-4" />
                  Image ready to mint!
                </div>
              )}
            </div>
            <div className="rounded-xl p-3 bg-gray-900 border border-gray-800 w-full">
              <h3 className="text-yellow-400 font-bold mb-2 text-base">NFT Details</h3>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-black text-white px-3 py-2 rounded-lg mb-2 font-semibold text-xs" placeholder="NFT Name" />
              <div className="grid grid-cols-2 gap-2">
                <select value={rarity} onChange={e => setRarity(e.target.value)} className="bg-black text-white px-3 py-2 rounded-lg font-bold text-xs" style={{ color: rarity === "Mythic" ? "#fff" : RARITY_COLORS[rarity] }}>
                  {Object.keys(RARITY_COLORS).map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <div className="flex items-center gap-2 bg-black px-3 rounded-lg border border-gray-800">
                  <Palette className="w-5 h-5 text-gray-400" />
                  <input type="color" value={color} onChange={e => setColor(e.target.value)} className="flex-1 h-7" />
                </div>
              </div>
            </div>
            <div className="rounded-xl p-3 bg-gray-900 border border-gray-800 w-full">
              <div className="flex justify-between mb-2">
                <h3 className="text-yellow-400 font-bold text-base">Attributes</h3>
                <button onClick={randomizeStats} className="text-yellow-400 text-xs flex items-center gap-1 font-semibold hover:text-yellow-300 transition-colors">
                  <Zap className="w-4 h-4" /> Randomize
                </button>
              </div>
              {Object.entries(stats).map(([key, value]) => (
                <div key={key} className="mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300 capitalize font-semibold">{key}</span>
                    <span className="text-yellow-400 font-bold">{value}</span>
                  </div>
                  <input type="range" min="0" max="100" value={value} onChange={e => setStats({ ...stats, [key]: parseInt(e.target.value) })} className="w-full h-2 rounded-lg appearance-none cursor-pointer" style={{ background: `linear-gradient(to right, ${color} ${value}%, #333 ${value}%)` }} />
                </div>
              ))}
            </div>
            <div className="rounded-xl p-3 bg-gray-900 border border-gray-800 w-full">
              <h3 className="text-yellow-400 font-bold mb-2 flex items-center gap-2 text-base">
                <Download className="w-5 h-5" /> Mint & Export
              </h3>
              <button onClick={mintWithPayment} disabled={txStatus === "pending"} className="w-full py-2 rounded-lg font-bold mb-2 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-xs">
                {txStatus === "pending" ? "Processing..." : `Pay ${network.fee} ${network.symbol} & Mint`}
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={downloadCard} className="py-2 rounded-lg font-bold text-white flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-xs">
                  <Download className="w-4 h-4" /> Card
                </button>
                <button onClick={downloadMetadata} className="py-2 rounded-lg font-bold text-white flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-xs">
                  <Download className="w-4 h-4" /> JSON
                </button>
              </div>
            </div>
          </div>
          {/* Preview */}
          <div className="flex-1 w-full flex justify-center items-start">
            <div className="rounded-2xl overflow-hidden w-full max-w-xs" style={{ border: `3px solid ${color}` }}>
              <div className="aspect-[2/3] flex items-center justify-center bg-black" style={{ minHeight: "180px" }}>
                {media ? (
                  <img src={media} alt="NFT" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-12 h-12 text-gray-700" />
                )}
              </div>
              <div className="p-3 bg-gradient-to-t from-black to-transparent">
                <h2 className="text-white text-lg font-bold mb-1" style={{ color }}>{name}</h2>
                <span className="inline-block text-xs font-bold px-2 py-1 rounded-full mb-2" style={rarity === "Mythic"
                  ? { background: "linear-gradient(90deg,#f43f5e,#f59e42,#fbbf24,#10b981,#3b82f6,#a21caf)", color: "#fff" }
                  : { background: RARITY_COLORS[rarity], color: "#fff" }
                }>
                  {rarity}
                </span>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div className="bg-black/60 rounded-lg px-2 py-1 font-semibold text-white">⚔️ {stats.attack}</div>
                  <div className="bg-black/60 rounded-lg px-2 py-1 font-semibold text-white">🛡️ {stats.defense}</div>
                  <div className="bg-black/60 rounded-lg px-2 py-1 font-semibold text-white">⚡ {stats.speed}</div>
                  <div className="bg-black/60 rounded-lg px-2 py-1 font-semibold text-white">✨ {stats.magic}</div>
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
