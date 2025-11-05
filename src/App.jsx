import React, { useState, useRef, useEffect } from "react";

const COLORS = [
  {
    name: "Cyan",
    primary: "#00ffff",
    secondary: "#0088ff",
    glow: "rgba(0,255,255,0.5)",
  },
  {
    name: "Gold",
    primary: "#ffd700",
    secondary: "#ff8800",
    glow: "rgba(255,215,0,0.5)",
  },
  {
    name: "Pink",
    primary: "#ff00ff",
    secondary: "#ff0088",
    glow: "rgba(255,0,255,0.5)",
  },
  {
    name: "Black",
    primary: "#1a1a1a",
    secondary: "#000000",
    glow: "rgba(128,0,255,0.5)",
  },
  {
    name: "Purple",
    primary: "#8800ff",
    secondary: "#ff00ff",
    glow: "rgba(136,0,255,0.5)",
  },
  {
    name: "Green",
    primary: "#00ff00",
    secondary: "#88ff00",
    glow: "rgba(0,255,0,0.5)",
  },
  {
    name: "Red",
    primary: "#ff0000",
    secondary: "#ff0088",
    glow: "rgba(255,0,0,0.5)",
  },
];

const NETWORKS = {
  eth: { name: "Ethereum", chainId: "0x1", symbol: "ETH", fee: "0.001" },
  polygon: { name: "Polygon", chainId: "0x89", symbol: "MATIC", fee: "1.0" },
  base: { name: "Base", chainId: "0x2105", symbol: "ETH", fee: "0.0005" },
};

function NFTCanvas({ image, colorIdx, stats, edition, transform }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    let animId;
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      canvas.width = 800;
      canvas.height = 1200;
      const color = COLORS[colorIdx];

      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, 800, 1200);

      ctx.strokeStyle = color.primary;
      ctx.lineWidth = 8;
      ctx.strokeRect(30, 30, 740, 1140);

      ctx.fillStyle = "rgba(0,0,0,0.8)";
      ctx.fillRect(80, 180, 640, 480);

      if (image) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(80, 180, 640, 480);
        ctx.clip();
        const { scale, positionX, positionY } = transform;
        ctx.drawImage(
          image,
          80 + positionX,
          180 + positionY,
          image.width * scale,
          image.height * scale,
        );
        ctx.restore();
      } else {
        ctx.fillStyle = color.primary;
        ctx.font = "bold 32px Inter, Arial";
        ctx.textAlign = "center";
        ctx.fillText("Upload Your Image", 400, 420);
      }

      ctx.fillStyle = color.primary;
      ctx.font = "bold 56px Inter, Arial";
      ctx.textAlign = "center";
      ctx.fillText(`NFT #${edition.toString().padStart(3, "0")}`, 400, 130);

      ctx.fillStyle = color.primary;
      ctx.font = "bold 36px Inter, Arial";
      ctx.fillText(color.name.toUpperCase(), 400, 768);

      const statList = [
        { label: "ATK", value: stats.attack, y: 840 },
        { label: "DEF", value: stats.defense, y: 920 },
        { label: "SPD", value: stats.speed, y: 1000 },
        { label: "MAG", value: stats.magic, y: 1080 },
      ];

      statList.forEach((s) => {
        ctx.fillStyle = "white";
        ctx.font = "bold 28px Inter, Arial";
        ctx.textAlign = "left";
        ctx.fillText(s.label, 100, s.y);
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.fillRect(200, s.y - 25, 500, 35);
        ctx.fillStyle = color.primary;
        ctx.fillRect(200, s.y - 25, (s.value / 100) * 500, 35);
        ctx.fillStyle = "white";
        ctx.font = "bold 24px Inter, Arial";
        ctx.textAlign = "center";
        ctx.fillText(s.value, 700, s.y);
      });

      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => animId && cancelAnimationFrame(animId);
  }, [image, colorIdx, stats, edition, transform]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        maxWidth: 400,
        borderRadius: 24,
        boxShadow: "0 8px 32px 0 rgba(0,255,255,0.15)",
        background: "#0a3d91",
        display: "block",
      }}
    />
  );
}

export default function App() {
  const [image, setImage] = useState(null);
  const [transform, setTransform] = useState({
    scale: 1,
    positionX: 0,
    positionY: 0,
  });
  const [colorIdx, setColorIdx] = useState(0);
  const [stats, setStats] = useState({
    attack: 85,
    defense: 70,
    speed: 90,
    magic: 75,
  });
  const [edition] = useState(Math.floor(Math.random() * 999) + 1);
  const [wallet, setWallet] = useState(null);
  const [network, setNetwork] = useState("eth");
  const [showWallet, setShowWallet] = useState(false);
  const [showNetwork, setShowNetwork] = useState(false);
  const fileRef = useRef(null);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new window.Image();
        img.onload = () => {
          setImage(img);
          const scale = Math.min(640 / img.width, 480 / img.height, 1);
          setTransform({
            scale,
            positionX: (640 - img.width * scale) / 2,
            positionY: (480 - img.height * scale) / 2,
          });
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const download = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `nft-${edition}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const connectWallet = async (walletType = "metamask") => {
    let provider = null;
    if (window.ethereum?.providers && window.ethereum.providers.length > 0) {
      if (walletType === "metamask") {
        provider = window.ethereum.providers.find((p) => p.isMetaMask);
      } else if (walletType === "trust") {
        provider = window.ethereum.providers.find(
          (p) => p.isTrust || p.isTrustWallet,
        );
      } else if (walletType === "coinbase") {
        provider = window.ethereum.providers.find((p) => p.isCoinbaseWallet);
      }
      if (!provider) provider = window.ethereum.providers[0];
    } else if (window.ethereum) {
      provider = window.ethereum;
    }
    if (!provider) {
      alert(
        `Please install ${walletType === "metamask" ? "MetaMask" : "a Web3 wallet"}`,
      );
      return;
    }
    try {
      const accounts = await provider.request({
        method: "eth_requestAccounts",
      });
      setWallet(accounts[0]);
      setShowWallet(false);
    } catch (err) {
      alert("Connection failed: " + (err.message || err));
    }
  };

  const mint = async () => {
    if (!wallet) {
      setShowWallet(true);
      return;
    }
    if (!image) {
      alert("Upload an image first!");
      return;
    }
    try {
      const fee = NETWORKS[network].fee;
      const value =
        "0x" + BigInt(Math.floor(parseFloat(fee) * 1e18)).toString(16);
      await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: wallet,
            to: "0x592B35c8917eD36c39Ef73D0F5e92B0173560b2e",
            value,
            gas: "0x5208",
          },
        ],
      });
      alert("Success!");
      download();
    } catch (err) {
      alert("Transaction failed");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-blue-800 p-4"
      style={{ fontFamily: "'Inter', Arial, sans-serif" }}
    >
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8">
        <div className="flex flex-col items-center mb-8 gap-2">
          <img
            src="https://cryptologos.cc/logos/ethereum-eth-logo.png"
            alt="Logo"
            className="w-14 h-14 mb-2"
            style={{ filter: "drop-shadow(0 0 8px #00ffff88)" }}
          />
          <h1 className="text-4xl font-bold text-cyan-400 mb-2 text-center">
            NFT Card Generator
          </h1>
          <p className="text-blue-200 text-lg text-center">
            Create epic mythic cards • Connect wallet to mint
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="flex flex-col items-center">
            <NFTCanvas
              image={image}
              colorIdx={colorIdx}
              stats={stats}
              edition={edition}
              transform={transform}
            />
            {image && (
              <div className="mt-4 grid grid-cols-4 gap-2">
                <button
                  onClick={() =>
                    setTransform((t) => ({
                      ...t,
                      scale: Math.min(t.scale * 1.1, 2),
                    }))
                  }
                  className="bg-blue-700 hover:bg-blue-600 text-white px-3 py-2 rounded-xl shadow transition"
                >
                  +
                </button>
                <button
                  onClick={() =>
                    setTransform((t) => ({
                      ...t,
                      scale: Math.max(t.scale * 0.9, 0.2),
                    }))
                  }
                  className="bg-blue-700 hover:bg-blue-600 text-white px-3 py-2 rounded-xl shadow transition"
                >
                  -
                </button>
                <button
                  onClick={() =>
                    setTransform((t) => ({
                      ...t,
                      positionX: t.positionX - 20,
                    }))
                  }
                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-xl shadow transition"
                >
                  ←
                </button>
                <button
                  onClick={() =>
                    setTransform((t) => ({
                      ...t,
                      positionX: t.positionX + 20,
                    }))
                  }
                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-xl shadow transition"
                >
                  →
                </button>
              </div>
            )}
            <button
              onClick={download}
              className="w-full mt-4 bg-gradient-to-r from-green-400 to-emerald-600 hover:from-green-500 hover:to-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg text-lg transition"
            >
              💾 Download
            </button>
          </div>
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-cyan-400 shadow">
              <h2 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                📸 Upload
              </h2>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-4 rounded-xl shadow transition"
              >
                Choose Image
              </button>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-purple-400 shadow">
              <h2 className="text-2xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                ✨ Colors
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() =>
                    setColorIdx((colorIdx - 1 + COLORS.length) % COLORS.length)
                  }
                  className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold py-3 rounded-xl shadow transition"
                >
                  ← Prev
                </button>
                <button
                  onClick={() => setColorIdx((colorIdx + 1) % COLORS.length)}
                  className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold py-3 rounded-xl shadow transition"
                >
                  Next →
                </button>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-yellow-400 shadow">
              <h2 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                ⚡ Stats
              </h2>
              {Object.entries(stats).map(([key, value]) => (
                <div key={key} className="mb-3">
                  <div className="flex justify-between mb-2 text-white">
                    <span className="capitalize">{key}</span>
                    <span>{value}</span>
                  </div>
                  <input
                    type="range"
                    min={60}
                    max={100}
                    value={value}
                    onChange={(e) =>
                      setStats((s) => ({ ...s, [key]: Number(e.target.value) }))
                    }
                    className="w-full accent-yellow-400"
                  />
                </div>
              ))}
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-green-400 shadow">
              <h2 className="text-2xl font-bold text-green-400 mb-4 flex items-center gap-2">
                🔥 Mint
              </h2>
              <button
                onClick={mint}
                className="w-full bg-gradient-to-r from-green-400 to-emerald-600 hover:from-green-500 hover:to-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg text-lg transition flex items-center justify-center gap-2"
                disabled={!wallet || !image}
                title={
                  !wallet ? "Connect wallet" : !image ? "Upload image" : ""
                }
              >
                Pay {NETWORKS[network].fee} {NETWORKS[network].symbol}
              </button>
            </div>
            <div className="flex gap-2 justify-center">
              {wallet ? (
                <div className="bg-green-600/20 border border-green-500 rounded-lg px-4 py-2 text-white text-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  {wallet.slice(0, 6)}...{wallet.slice(-4)}
                </div>
              ) : (
                <button
                  onClick={() => setShowWallet(true)}
                  className="bg-gradient-to-r from-green-400 to-emerald-600 hover:from-green-500 hover:to-emerald-700 text-white px-4 py-2 rounded-xl shadow transition font-bold"
                >
                  Connect Wallet
                </button>
              )}
              <button
                onClick={() => setShowNetwork(true)}
                className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl shadow transition font-bold"
              >
                {NETWORKS[network].name}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Wallet Modal */}
      {showWallet && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg border-2 border-cyan-400 rounded-2xl p-8 max-w-xs w-full shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Connect Wallet</h2>
              <button
                onClick={() => setShowWallet(false)}
                className="text-white text-2xl hover:text-cyan-400"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => connectWallet("metamask")}
                className="w-full flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-3 px-4 rounded-xl shadow-md transition"
              >
                <img
                  src="https://cryptologos.cc/logos/metamask-fox-logo.png"
                  alt="MetaMask"
                  className="w-7 h-7"
                />
                MetaMask
              </button>
              <button
                onClick={() => connectWallet("trust")}
                className="w-full flex items-center gap-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-3 px-4 rounded-xl shadow-md transition"
              >
                <img
                  src="https://cryptologos.cc/logos/trust-wallet-trust-logo.png"
                  alt="Trust"
                  className="w-7 h-7"
                />
                Trust Wallet
              </button>
              <button
                onClick={() => connectWallet("coinbase")}
                className="w-full flex items-center gap-3 bg-gradient-to-r from-blue-700 to-indigo-500 hover:from-blue-800 hover:to-indigo-600 text-white font-bold py-3 px-4 rounded-xl shadow-md transition"
              >
                <img
                  src="https://cryptologos.cc/logos/coinbase-coinbase-logo.png"
                  alt="Coinbase"
                  className="w-7 h-7"
                />
                Coinbase Wallet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Network Modal */}
      {showNetwork && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg border-2 border-purple-400 rounded-2xl p-8 max-w-xs w-full shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Select Network</h2>
              <button
                onClick={() => setShowNetwork(false)}
                className="text-white text-2xl hover:text-purple-400"
              >
                ×
              </button>
            </div>
            <div className="space-y-3">
              {Object.entries(NETWORKS).map(([key, net]) => (
                <button
                  key={key}
                  onClick={() => {
                    setNetwork(key);
                    setShowNetwork(false);
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold py-4 rounded-xl shadow transition"
                >
                  {net.name} - {net.fee} {net.symbol}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

