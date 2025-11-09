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

const WALLETS = [
  { name: "MetaMask", id: "metamask", icon: "🦊" },
  { name: "Trust Wallet", id: "trust", icon: "💎" },
  { name: "Coinbase Wallet", id: "coinbase", icon: "🔵" }
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
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const fileInputRef = useRef();
  const canvasRef = useRef();

  // Prevent horizontal scroll on all screens
  React.useEffect(() => {
    document.body.style.overflowX = "hidden";
    document.documentElement.style.overflowX = "hidden";
    return () => {
      document.body.style.overflowX = "";
      document.documentElement.style.overflowX = "";
    };
  }, []);

  const connectWallet = async (walletType) => {
    try {
      const p = window.ethereum;
      if (!p) return alert("Please install a Web3 wallet!");
      const accounts = await p.request({ method: "eth_requestAccounts" });
      setWallet(accounts[0]);
      setProvider(p);
      setShowWalletModal(false);
    } catch (err) {
      alert("Connection failed: " + err.message);
    }
  };

  const mintWithPayment = async () => {
    if (!wallet) return setShowWalletModal(true);
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
    <div className="min-h-screen bg-black p-2 md:p-4 overflow-x-hidden w-full" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, #1a1a1a 0%, #000 100%)" }}>
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 md:mb-8 gap-2 md:gap-4 flex-wrap w-full">
          <h1 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400 flex items-center gap-2 md:gap-3 w-full md:w-auto text-center md:text-left">
            <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-yellow-400" style={{ filter: "drop-shadow(0 0 10px #d4af37)" }} />
            Luxury NFT Generator
          </h1>
          <div className="flex gap-2 md:gap-3 flex-wrap w-full md:w-auto justify-center md:justify-end">
            <button 
              onClick={() => setShowNetworkModal(true)}
              className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-semibold text-white flex items-center gap-2 transition-all text-xs md:text-base"
              style={{ 
                background: "linear-gradient(135deg, #1a1a1a, #2a2a2a)",
                border: "1px solid #d4af37",
                boxShadow: "0 0 20px rgba(212, 175, 55, 0.3)"
              }}
            >
              <div className="w-2 h-2 rounded-full" style={{ background: network.color }}></div>
              {network.name}
              <ChevronDown className="w-4 h-4" />
            </button>
            {wallet ? (
              <div 
                className="px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-semibold text-white flex items-center gap-2 text-xs md:text-base"
                style={{ 
                  background: "linear-gradient(135deg, #1a5f1a, #2a7a2a)",
                  border: "1px solid #4ade80",
                  boxShadow: "0 0 20px rgba(74, 222, 128, 0.3)"
                }}
              >
                <Check className="w-5 h-5 text-green-400" />
                {wallet.slice(0, 6)}...{wallet.slice(-4)}
              </div>
            ) : (
              <button 
                onClick={() => setShowWalletModal(true)}
                className="px-4 py-1.5 md:px-6 md:py-2 rounded-lg font-bold text-black flex items-center gap-2 transition-all hover:scale-105 text-xs md:text-base"
                style={{ 
                  background: "linear-gradient(135deg, #ffd700, #d4af37)",
                  boxShadow: "0 0 30px rgba(212, 175, 55, 0.5)"
                }}
              >
                <Wallet className="w-5 h-5" />
                Connect Wallet
              </button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 md:gap-6 w-full">
          {/* Left Panel */}
          <div className="space-y-3 md:space-y-5 w-full">
            {/* Upload */}
            <div 
              className="rounded-xl p-3 md:p-5 w-full"
              style={{ 
                background: "linear-gradient(135deg, #1a1a1a, #0a0a0a)",
                border: "1px solid #333",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)"
              }}
            >
              <h3 className="text-yellow-400 font-bold mb-2 md:mb-4 flex items-center gap-2 text-base md:text-lg">
                <Camera className="w-5 h-5" /> Upload Artwork
              </h3>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleMediaUpload} className="hidden" />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 md:py-4 rounded-lg font-bold text-black transition-all hover:scale-105 text-xs md:text-base"
                style={{ 
                  background: "linear-gradient(135deg, #ffd700, #d4af37)",
                  boxShadow: "0 4px 20px rgba(212, 175, 55, 0.4)"
                }}
              >
                Choose Image
              </button>
              {media && (
                <div className="mt-2 md:mt-3 p-2 md:p-3 rounded-lg text-green-400 text-xs md:text-sm flex items-center gap-2" style={{ background: "rgba(74, 222, 128, 0.1)", border: "1px solid #4ade80" }}>
                  <Check className="w-4 h-4" />
                  Image ready to mint!
                </div>
              )}
            </div>

            {/* Details */}
            <div 
              className="rounded-xl p-3 md:p-5 w-full"
              style={{ 
                background: "linear-gradient(135deg, #1a1a1a, #0a0a0a)",
                border: "1px solid #333",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)"
              }}
            >
              <h3 className="text-yellow-400 font-bold mb-2 md:mb-4 text-base md:text-lg">NFT Details</h3>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)}
                className="w-full bg-black text-white px-3 md:px-4 py-2 md:py-3 rounded-lg mb-2 md:mb-4 font-semibold text-xs md:text-base"
                style={{ border: "1px solid #333" }}
                placeholder="NFT Name"
              />
              <div className="grid grid-cols-2 gap-2 md:gap-4">
                <select 
                  value={rarity} 
                  onChange={e => setRarity(e.target.value)}
                  className="bg-black text-white px-3 md:px-4 py-2 md:py-3 rounded-lg font-bold text-xs md:text-base"
                  style={{ 
                    border: "1px solid #333",
                    color: rarity === "Mythic" ? "#fff" : RARITY_COLORS[rarity]
                  }}
                >
                  {Object.keys(RARITY_COLORS).map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <div className="flex items-center gap-2 md:gap-3 bg-black px-3 md:px-4 rounded-lg" style={{ border: "1px solid #333" }}>
                  <Palette className="w-5 h-5 text-gray-400" />
                  <input type="color" value={color} onChange={e => setColor(e.target.value)} className="flex-1 h-7 md:h-8" />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div 
              className="rounded-xl p-3 md:p-5 w-full"
              style={{ 
                background: "linear-gradient(135deg, #1a1a1a, #0a0a0a)",
                border: "1px solid #333",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)"
              }}
            >
              <div className="flex justify-between mb-2 md:mb-4">
                <h3 className="text-yellow-400 font-bold text-base md:text-lg">Attributes</h3>
                <button 
                  onClick={randomizeStats}
                  className="text-yellow-400 text-xs md:text-sm flex items-center gap-1 font-semibold hover:text-yellow-300 transition-colors"
                >
                  <Zap className="w-4 h-4" /> Randomize
                </button>
              </div>
              {Object.entries(stats).map(([key, value]) => (
                <div key={key} className="mb-2 md:mb-4">
                  <div className="flex justify-between text-xs md:text-sm mb-1 md:mb-2">
                    <span className="text-gray-300 capitalize font-semibold">{key}</span>
                    <span className="text-yellow-400 font-bold">{value}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={value}
                    onChange={e => setStats({ ...stats, [key]: parseInt(e.target.value) })}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{ 
                      background: `linear-gradient(to right, ${color} ${value}%, #333 ${value}%)`,
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Actions */}
            <div 
              className="rounded-xl p-3 md:p-5 w-full"
              style={{ 
                background: "linear-gradient(135deg, #1a1a1a, #0a0a0a)",
                border: "1px solid #333",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)"
              }}
            >
              <h3 className="text-yellow-400 font-bold mb-2 md:mb-4 flex items-center gap-2 text-base md:text-lg">
                <Download className="w-5 h-5" /> Mint & Export
              </h3>
              <button 
                onClick={mintWithPayment}
                disabled={txStatus === "pending"}
                className="w-full py-2 md:py-4 rounded-lg font-bold mb-2 md:mb-3 flex items-center justify-center gap-2 transition-all hover:scale-105 text-xs md:text-base"
                style={{ 
                  background: txStatus === "pending" 
                    ? "linear-gradient(135deg, #333, #1a1a1a)" 
                    : "linear-gradient(135deg, #22c55e, #16a34a)",
                  boxShadow: txStatus === "pending" ? "none" : "0 4px 20px rgba(34, 197, 94, 0.4)",
                  color: "#fff"
                }}
              >
                {txStatus === "pending" ? "Processing..." : `Pay ${network.fee} ${network.symbol} & Mint`}
              </button>
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                <button 
                  onClick={downloadCard}
                  className="py-2 md:py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-105 text-xs md:text-base"
                  style={{ 
                    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                    boxShadow: "0 4px 20px rgba(59, 130, 246, 0.3)"
                  }}
                >
                  <Download className="w-4 h-4" /> Card
                </button>
                <button 
                  onClick={downloadMetadata}
                  className="py-2 md:py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-105 text-xs md:text-base"
                  style={{ 
                    background: "linear-gradient(135deg, #a855f7, #9333ea)",
                    boxShadow: "0 4px 20px rgba(168, 85, 247, 0.3)"
                  }}
                >
                  <Download className="w-4 h-4" /> JSON
                </button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div 
            className="rounded-xl p-3 md:p-6 sticky top-4 w-full"
            style={{ 
              background: "linear-gradient(135deg, #1a1a1a, #0a0a0a)",
              border: "1px solid #333",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
              height: "fit-content"
            }}
          >
            <h3 className="text-yellow-400 font-bold mb-2 md:mb-4 text-base md:text-lg">Live Preview</h3>
            <div className="flex justify-center w-full">
              <div 
                className="rounded-2xl overflow-hidden transition-all w-full"
                style={{ 
                  border: `3px solid ${color}`,
                  boxShadow: `0 0 40px ${color}80`,
                  maxWidth: "100%",
                  width: "180px"
                }}
              >
                <div 
                  className="aspect-[2/3] flex items-center justify-center"
                  style={{ 
                    background: "linear-gradient(135deg, #1a1a1a, #000)",
                    height: "120px"
                  }}
                >
                  {media ? (
                    <img src={media} alt="NFT" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-12 h-12 text-gray-700" />
                  )}
                </div>
                <div 
                  className="p-3 md:p-5"
                  style={{ 
                    background: "linear-gradient(to top, #000, #1a1a1a)",
                    borderTop: `1px solid ${color}40`
                  }}
                >
                  <h2 className="text-white text-lg md:text-2xl font-bold mb-1 md:mb-2" style={{ color }}>{name}</h2>
                  <span 
                    className="inline-block text-xs font-bold px-2 md:px-3 py-1 rounded-full mb-2 md:mb-3"
                    style={rarity === "Mythic"
                      ? { background: "linear-gradient(90deg,#f43f5e,#f59e42,#fbbf24,#10b981,#3b82f6,#a21caf)", color: "#fff" }
                      : { background: RARITY_COLORS[rarity], color: "#fff" }
                    }
                  >
                    {rarity}
                  </span>
                  <div className="grid grid-cols-2 gap-1 md:gap-2 text-xs md:text-sm">
                    <div className="bg-black/60 rounded-lg px-2 md:px-3 py-1 md:py-2 font-semibold text-white">⚔️ {stats.attack}</div>
                    <div className="bg-black/60 rounded-lg px-2 md:px-3 py-1 md:py-2 font-semibold text-white">🛡️ {stats.defense}</div>
                    <div className="bg-black/60 rounded-lg px-2 md:px-3 py-1 md:py-2 font-semibold text-white">⚡ {stats.speed}</div>
                    <div className="bg-black/60 rounded-lg px-2 md:px-3 py-1 md:py-2 font-semibold text-white">✨ {stats.magic}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-2 md:p-4" style={{ background: "rgba(0, 0, 0, 0.85)" }}>
          <div 
            className="rounded-2xl p-4 md:p-6 max-w-md w-full"
            style={{ 
              background: "linear-gradient(135deg, #1a1a1a, #0a0a0a)",
              border: "1px solid #d4af37",
              boxShadow: "0 0 50px rgba(212, 175, 55, 0.3)"
            }}
          >
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h2 className="text-lg md:text-2xl font-bold text-yellow-400">Connect Wallet</h2>
              <button onClick={() => setShowWalletModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
            <div className="space-y-2 md:space-y-3">
              {WALLETS.map(w => (
                <button
                  key={w.id}
                  onClick={() => connectWallet(w.id)}
                  className="w-full p-3 md:p-4 rounded-xl font-bold text-white flex items-center gap-3 md:gap-4 transition-all hover:scale-105 text-xs md:text-base"
                  style={{ 
                    background: "linear-gradient(135deg, #2a2a2a, #1a1a1a)",
                    border: "1px solid #333"
                  }}
                >
                  <span className="text-xl md:text-3xl">{w.icon}</span>
                  <span className="text-base md:text-lg">{w.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Network Modal */}
      {showNetworkModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-2 md:p-4" style={{ background: "rgba(0, 0, 0, 0.85)" }}>
          <div 
            className="rounded-2xl p-4 md:p-6 max-w-md w-full"
            style={{ 
              background: "linear-gradient(135deg, #1a1a1a, #0a0a0a)",
              border: "1px solid #d4af37",
              boxShadow: "0 0 50px rgba(212, 175, 55, 0.3)"
            }}
          >
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h2 className="text-lg md:text-2xl font-bold text-yellow-400">Select Network</h2>
              <button onClick={() => setShowNetworkModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
            <div className="space-y-2 md:space-y-3">
              {NETWORKS.map(n => (
                <button
                  key={n.chainId}
                  onClick={() => { setNetwork(n); setShowNetworkModal(false); }}
                  className="w-full p-3 md:p-4 rounded-xl font-bold text-white flex items-center justify-between transition-all hover:scale-105 text-xs md:text-base"
                  style={{ 
                    background: network.chainId === n.chainId 
                      ? "linear-gradient(135deg, #2a2a2a, #1a1a1a)"
                      : "linear-gradient(135deg, #1a1a1a, #0a0a0a)",
                    border: network.chainId === n.chainId ? `1px solid ${n.color}` : "1px solid #333"
                  }}
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ background: n.color }}></div>
                    <span className="text-base md:text-lg">{n.name}</span>
                  </div>
                  <span className="text-xs md:text-sm text-gray-400">{n.fee} {n.symbol}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
