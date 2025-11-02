import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  Download,
  Zap,
  Sparkles,
  Wallet,
  Check,
  X,
  Network,
} from "lucide-react";
import GIF from "gif.js";

const MYTHIC_COLORS = [
  {
    name: "Electric Cyan",
    primary: "#00ffff",
    secondary: "#0088ff",
    glow: "rgba(0,255,255,0.5)",
  },
  {
    name: "Laser Gold",
    primary: "#ffd700",
    secondary: "#ff8800",
    glow: "rgba(255,215,0,0.5)",
  },
  {
    name: "Neon Pink",
    primary: "#ff00ff",
    secondary: "#ff0088",
    glow: "rgba(255,0,255,0.5)",
  },
  {
    name: "Void Black",
    primary: "#1a1a1a",
    secondary: "#000000",
    glow: "rgba(128,0,255,0.5)",
  },
  {
    name: "Plasma Purple",
    primary: "#8800ff",
    secondary: "#ff00ff",
    glow: "rgba(136,0,255,0.5)",
  },
  {
    name: "Toxic Green",
    primary: "#00ff00",
    secondary: "#88ff00",
    glow: "rgba(0,255,0,0.5)",
  },
  {
    name: "Crimson Red",
    primary: "#ff0000",
    secondary: "#ff0088",
    glow: "rgba(255,0,0,0.5)",
  },
];

const NETWORKS = {
  eth: {
    name: "Ethereum",
    chainId: "0x1",
    symbol: "ETH",
    fee: "0.001",
    explorer: "https://etherscan.io",
    color: "#627EEA",
  },
  bsc: {
    name: "BSC",
    chainId: "0x38",
    symbol: "BNB",
    fee: "0.003",
    explorer: "https://bscscan.com",
    color: "#F3BA2F",
  },
  polygon: {
    name: "Polygon",
    chainId: "0x89",
    symbol: "MATIC",
    fee: "1.0",
    explorer: "https://polygonscan.com",
    color: "#8247E5",
  },
  arbitrum: {
    name: "Arbitrum",
    chainId: "0xa4b1",
    symbol: "ETH",
    fee: "0.0005",
    explorer: "https://arbiscan.io",
    color: "#28A0F0",
  },
  base: {
    name: "Base",
    chainId: "0x2105",
    symbol: "ETH",
    fee: "0.0005",
    explorer: "https://basescan.org",
    color: "#0052FF",
  },
};

const TREASURY_WALLET = "0x592B35c8917eD36c39Ef73D0F5e92B0173560b2e";

export default function App() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [currentColor, setCurrentColor] = useState(0);
  const [stats, setStats] = useState({
    attack: 85,
    defense: 70,
    speed: 90,
    magic: 75,
  });
  const [edition] = useState(Math.floor(Math.random() * 999) + 1);
  const [walletAddress, setWalletAddress] = useState(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showNetwork, setShowNetwork] = useState(false);
  const [network, setNetwork] = useState("eth");
  const [txStatus, setTxStatus] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [canvasZoom, setCanvasZoom] = useState(1);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const containerRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 600 });

  // Responsive canvas size
  useEffect(() => {
    function resizeCanvas() {
      if (!containerRef.current) return;
      const width = Math.min(containerRef.current.offsetWidth, 400);
      const height = Math.round(width * 1.5);
      setCanvasSize({ width, height });
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  useEffect(() => {
    drawCard();
  }, [uploadedImage, currentColor, stats, edition, canvasSize, canvasZoom]);

  // --- Drawing ---
  const drawCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = 800;
    canvas.height = 1200;
    const color = MYTHIC_COLORS[currentColor];

    ctx.clearRect(0, 0, 800, 1200);

    const bgGrad = ctx.createLinearGradient(0, 0, 800, 1200);
    bgGrad.addColorStop(0, "#0a3d91");
    bgGrad.addColorStop(0.5, "#1a1a2e");
    bgGrad.addColorStop(1, "#0a3d91");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 800, 1200);

    for (let i = 0; i < 4; i++) {
      const angle = (Date.now() / 2000 + (i * Math.PI) / 2) % (Math.PI * 2);
      const x = 400 + Math.cos(angle) * 200;
      const y = 600 + Math.sin(angle) * 200;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 150);
      glow.addColorStop(0, color.glow);
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, 150, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowColor = color.primary;
    ctx.shadowBlur = 20;
    ctx.strokeStyle = color.primary;
    ctx.lineWidth = 8;
    ctx.strokeRect(30, 30, 740, 1140);
    ctx.shadowBlur = 10;
    ctx.lineWidth = 4;
    ctx.strokeStyle = color.secondary;
    ctx.strokeRect(45, 45, 710, 1110);

    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.fillRect(80, 180, 640, 480);

    if (uploadedImage) {
      const imgAspect = uploadedImage.width / uploadedImage.height;
      const boxAspect = 640 / 480;
      let drawWidth, drawHeight, offsetX, offsetY;
      if (imgAspect > boxAspect) {
        drawHeight = 480;
        drawWidth = 480 * imgAspect;
        offsetX = (640 - drawWidth) / 2;
        offsetY = 0;
      } else {
        drawWidth = 640;
        drawHeight = 640 / imgAspect;
        offsetX = 0;
        offsetY = (480 - drawHeight) / 2;
      }
      ctx.save();
      ctx.beginPath();
      ctx.rect(80, 180, 640, 480);
      ctx.clip();
      ctx.drawImage(
        uploadedImage,
        80 + offsetX,
        180 + offsetY,
        drawWidth,
        drawHeight,
      );
      ctx.restore();
    } else {
      ctx.fillStyle = color.primary;
      ctx.font = "bold 32px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Upload Your Image", 400, 420);
    }

    ctx.shadowColor = color.primary;
    ctx.shadowBlur = 30;
    ctx.fillStyle = color.primary;
    ctx.font = "bold 56px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      `MYTHIC NFT #${edition.toString().padStart(3, "0")}`,
      400,
      130,
    );

    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(0,0,0,0.9)";
    ctx.beginPath();
    ctx.roundRect(250, 720, 300, 70, 35);
    ctx.fill();
    const badgeGrad = ctx.createLinearGradient(250, 720, 550, 720);
    badgeGrad.addColorStop(0, color.primary);
    badgeGrad.addColorStop(1, color.secondary);
    ctx.strokeStyle = badgeGrad;
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.fillStyle = badgeGrad;
    ctx.font = "bold 36px Arial";
    ctx.fillText(color.name.toUpperCase(), 400, 768);

    const statList = [
      { label: "ATK", value: stats.attack, y: 840 },
      { label: "DEF", value: stats.defense, y: 920 },
      { label: "SPD", value: stats.speed, y: 1000 },
      { label: "MAG", value: stats.magic, y: 1080 },
    ];

    statList.forEach((s) => {
      ctx.fillStyle = "white";
      ctx.font = "bold 28px Arial";
      ctx.textAlign = "left";
      ctx.fillText(s.label, 100, s.y);
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.fillRect(200, s.y - 25, 500, 35);
      const barGrad = ctx.createLinearGradient(200, s.y - 25, 700, s.y - 25);
      barGrad.addColorStop(0, color.primary);
      barGrad.addColorStop(1, color.secondary);
      ctx.fillStyle = barGrad;
      ctx.fillRect(200, s.y - 25, (s.value / 100) * 500, 35);
      ctx.fillStyle = "white";
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "center";
      ctx.fillText(s.value, 650 + (50 - s.value / 2), s.y);
    });

    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.font = "bold 20px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`Edition ${edition}/999`, 400, 1160);
  };

  // --- Zoom Controls ---
  const zoomIn = () => setCanvasZoom((z) => Math.min(z + 0.1, 2));
  const zoomOut = () => setCanvasZoom((z) => Math.max(z - 0.1, 0.5));
  const resetZoom = () => setCanvasZoom(1);

  // --- Download as GIF ---
  const downloadGif = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gif = new GIF({ workers: 2, quality: 10, width: 400, height: 600 });
    let frame = 0;
    const totalFrames = 30;
    const originalZoom = canvasZoom;
    setCanvasZoom(1);

    function addFrame() {
      drawCard();
      gif.addFrame(canvas, { copy: true, delay: 100 });
      frame++;
      if (frame < totalFrames) {
        setTimeout(addFrame, 100);
      } else {
        gif.on("finished", function (blob) {
          setCanvasZoom(originalZoom);
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.download = "nft-card.gif";
          a.href = url;
          a.click();
          URL.revokeObjectURL(url);
        });
        gif.render();
      }
    }
    addFrame();
  };

  // --- Wallet Connectors ---
  const connectMetaMask = async () => {
    try {
      let p = window.ethereum;
      if (window.ethereum?.providers) {
        p =
          window.ethereum.providers.find((x) => x.isMetaMask) ||
          window.ethereum.providers[0];
      }
      const accounts = await p.request({ method: "eth_requestAccounts" });
      setWalletAddress(accounts[0]);
      setShowWalletModal(false);
      await switchNet(network, p);
    } catch (err) {
      alert("MetaMask connection failed: " + (err.message || err));
    }
  };

  const connectTrustWallet = async () => {
    try {
      let p = window.trustwallet || window.ethereum;
      if (window.ethereum?.providers) {
        p =
          window.ethereum.providers.find((x) => x.isTrust || x.isTrustWallet) ||
          p;
      }
      const accounts = await p.request({ method: "eth_requestAccounts" });
      setWalletAddress(accounts[0]);
      setShowWalletModal(false);
      await switchNet(network, p);
    } catch (err) {
      alert("Trust Wallet connection failed: " + (err.message || err));
    }
  };

  const connectCoinbase = async () => {
    try {
      let p = window.ethereum;
      if (window.ethereum?.providers) {
        p = window.ethereum.providers.find((x) => x.isCoinbaseWallet) || p;
      }
      const accounts = await p.request({ method: "eth_requestAccounts" });
      setWalletAddress(accounts[0]);
      setShowWalletModal(false);
      await switchNet(network, p);
    } catch (err) {
      alert("Coinbase Wallet connection failed: " + (err.message || err));
    }
  };

  const connectWalletConnect = async () => {
    try {
      let p = window.ethereum;
      if (window.ethereum?.providers) {
        p = window.ethereum.providers.find((x) => x.isWalletConnect) || p;
      }
      const accounts = await p.request({ method: "eth_requestAccounts" });
      setWalletAddress(accounts[0]);
      setShowWalletModal(false);
      await switchNet(network, p);
    } catch (err) {
      alert("WalletConnect connection failed: " + (err.message || err));
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setTxStatus(null);
    setTxHash(null);
  };

  const switchNet = async (net, customProvider) => {
    const p = customProvider;
    if (!p) return;
    try {
      await p.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: NETWORKS[net].chainId }],
      });
      setNetwork(net);
      setShowNetwork(false);
    } catch (err) {
      if (err.code === 4902) {
        try {
          await p.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: NETWORKS[net].chainId,
                chainName: NETWORKS[net].name,
                nativeCurrency: {
                  name: NETWORKS[net].symbol,
                  symbol: NETWORKS[net].symbol,
                  decimals: 18,
                },
                rpcUrls: ["https://rpc.ankr.com/" + net],
              },
            ],
          });
          setNetwork(net);
          setShowNetwork(false);
        } catch (addErr) {
          alert("Failed to add network");
        }
      }
    }
  };

  // --- Mint ---
  const mint = async () => {
    if (!walletAddress) {
      setShowWalletModal(true);
      return;
    }
    if (!uploadedImage) {
      alert("Upload image first!");
      return;
    }
    try {
      setTxStatus("pending");
      const net = NETWORKS[network];
      const value =
        "0x" + BigInt(Math.floor(parseFloat(net.fee) * 1e18)).toString(16);
      const p = window.ethereum;
      const tx = await p.request({
        method: "eth_sendTransaction",
        params: [
          { from: walletAddress, to: TREASURY_WALLET, value, gas: "0x5208" },
        ],
      });
      setTxHash(tx);
      setTxStatus("success");
      alert("✅ Success! Downloading...");
      setTimeout(downloadCard, 1000);
    } catch (err) {
      setTxStatus("failed");
      if (err.code === 4001) alert("❌ Transaction cancelled");
      else if (err.message?.includes("insufficient"))
        alert(`💰 Need ${NETWORKS[network].fee} ${NETWORKS[network].symbol}`);
      else alert("❌ Failed: " + err.message);
    }
  };

  // --- UI ---
  return (
    <div
      className="min-h-screen w-full bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 p-2 md:p-8 flex flex-col"
      ref={containerRef}
      style={{ minHeight: "100vh" }}
    >
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-4">
              NFT Card Generator
            </h1>
            <p className="text-blue-200 text-lg">
              Create epic mythic cards • Mint Fee: {NETWORKS[network].fee}{" "}
              {NETWORKS[network].symbol}
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-2">
            <button
              onClick={zoomOut}
              className="bg-blue-700 text-white px-3 py-2 rounded-lg"
            >
              -
            </button>
            <button
              onClick={resetZoom}
              className="bg-blue-700 text-white px-3 py-2 rounded-lg"
            >
              Reset
            </button>
            <button
              onClick={zoomIn}
              className="bg-blue-700 text-white px-3 py-2 rounded-lg"
            >
              +
            </button>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-8 flex-1">
          <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 border border-cyan-500/30 flex flex-col items-center">
            <div
              style={{
                width: canvasSize.width * canvasZoom,
                height: canvasSize.height * canvasZoom,
                maxWidth: "100%",
                overflow: "hidden",
                borderRadius: 16,
                boxShadow: "0 0 32px #00ffff44",
                background: "#0a3d91",
              }}
            >
              <canvas
                ref={canvasRef}
                width={800}
                height={1200}
                style={{
                  width: `${canvasSize.width * canvasZoom}px`,
                  height: `${canvasSize.height * canvasZoom}px`,
                  display: "block",
                }}
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={downloadCard}
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Download className="w-5 h-5" /> Download PNG
              </button>
              <button
                onClick={downloadGif}
                className="bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                🎬 Download GIF
              </button>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 border border-cyan-500/30">
              <h2 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                <Upload className="w-6 h-6" /> Upload Image
              </h2>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const img = new window.Image();
                      img.onload = () => setUploadedImage(img);
                      img.src = event.target.result;
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-lg"
              >
                Choose Image
              </button>
            </div>
            <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
              <h2 className="text-2xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6" /> Mythic Colors (
                {currentColor + 1}/{MYTHIC_COLORS.length})
              </h2>
              <div
                className="mb-4 p-4 rounded-lg border-2"
                style={{
                  borderColor: MYTHIC_COLORS[currentColor].primary,
                  background: `linear-gradient(135deg, ${MYTHIC_COLORS[currentColor].primary}15, ${MYTHIC_COLORS[currentColor].secondary}15)`,
                  boxShadow: `0 0 20px ${MYTHIC_COLORS[currentColor].glow}`,
                }}
              >
                <p
                  className="text-center font-bold text-2xl"
                  style={{
                    color: MYTHIC_COLORS[currentColor].primary,
                    textShadow: `0 0 10px ${MYTHIC_COLORS[currentColor].glow}`,
                  }}
                >
                  {MYTHIC_COLORS[currentColor].name}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() =>
                    setCurrentColor(
                      (currentColor - 1 + MYTHIC_COLORS.length) %
                        MYTHIC_COLORS.length,
                    )
                  }
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg"
                >
                  ← Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentColor((currentColor + 1) % MYTHIC_COLORS.length)
                  }
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg"
                >
                  Next →
                </button>
              </div>
              <button
                onClick={() =>
                  setCurrentColor(
                    Math.floor(Math.random() * MYTHIC_COLORS.length),
                  )
                }
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg"
              >
                🎲 Random Color
              </button>
            </div>
            <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 border border-yellow-500/30">
              <h2 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                <Zap className="w-6 h-6" /> Stats
              </h2>
              <div className="space-y-3 mb-4">
                {Object.entries(stats).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-4">
                    <span className="text-white font-bold w-24 capitalize">
                      {key}:
                    </span>
                    <div className="flex-1 bg-gray-700 rounded-full h-4">
                      <div
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 h-4 rounded-full transition-all"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                    <span className="text-white font-bold w-12 text-right">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={() =>
                  setStats({
                    attack: Math.floor(Math.random() * 40) + 60,
                    defense: Math.floor(Math.random() * 40) + 60,
                    speed: Math.floor(Math.random() * 40) + 60,
                    magic: Math.floor(Math.random() * 40) + 60,
                  })
                }
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-lg"
              >
                Randomize Stats
              </button>
            </div>
            <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 border border-green-500/30">
              <h2 className="text-2xl font-bold text-green-400 mb-4 flex items-center gap-2">
                <Wallet className="w-6 h-6" /> Mint Your Card
              </h2>
              {txStatus === "success" && (
                <div className="mb-4 p-4 bg-green-500/20 border border-green-500 rounded-lg">
                  <div className="flex items-center gap-2 text-green-400 mb-2">
                    <Check className="w-4 h-4" />
                    <span className="font-bold">Payment Successful!</span>
                  </div>
                  {txHash && (
                    <a
                      href={`${NETWORKS[network].explorer}/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 text-sm underline"
                    >
                      View on Explorer
                    </a>
                  )}
                </div>
              )}
              {txStatus === "failed" && (
                <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg">
                  <div className="flex items-center gap-2 text-red-400">
                    <X className="w-4 h-4" />
                    <span className="font-bold">Transaction Failed</span>
                  </div>
                </div>
              )}
              <button
                onClick={mint}
                disabled={txStatus === "pending"}
                className={`w-full text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-2 ${txStatus === "pending" ? "bg-gray-600 cursor-not-allowed" : "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"}`}
              >
                {txStatus === "pending" ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Wallet className="w-6 h-6" />
                    Pay {NETWORKS[network].fee} {NETWORKS[network].symbol} &
                    Download
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Wallet Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border-2 border-cyan-500 rounded-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Connect Wallet</h2>
              <button
                onClick={() => setShowWalletModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-3">
              <button
                onClick={connectMetaMask}
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-600 hover:from-orange-600 hover:to-yellow-700 text-white font-bold py-4 px-6 rounded-lg flex items-center gap-3"
              >
                <Wallet className="w-6 h-6" /> MetaMask
              </button>
              <button
                onClick={connectTrustWallet}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold py-4 px-6 rounded-lg flex items-center gap-3"
              >
                <Wallet className="w-6 h-6" /> Trust Wallet
              </button>
              <button
                onClick={connectCoinbase}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-bold py-4 px-6 rounded-lg flex items-center gap-3"
              >
                <Wallet className="w-6 h-6" /> Coinbase Wallet
              </button>
              <button
                onClick={connectWalletConnect}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold py-4 px-6 rounded-lg flex items-center gap-3"
              >
                <Wallet className="w-6 h-6" /> WalletConnect
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Network Modal */}
      {showNetwork && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border-2 border-purple-500 rounded-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Select Network</h2>
              <button
                onClick={() => setShowNetwork(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-3">
              {Object.entries(NETWORKS).map(([key, n]) => (
                <button
                  key={key}
                  onClick={() => setNetwork(key)}
                  className="w-full text-white font-bold py-4 px-6 rounded-lg hover:opacity-80 flex justify-between items-center"
                  style={{ background: n.color }}
                >
                  <span>{n.name}</span>
                  <span className="text-sm opacity-75">
                    {n.fee} {n.symbol}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

