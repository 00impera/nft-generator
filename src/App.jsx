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

const MINT_FEE = "0.001"; // ETH
const CHAIN_ID = "0x1"; // Ethereum Mainnet
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
  const [txStatus, setTxStatus] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [isInFrame, setIsInFrame] = useState(false);
  const [connectedProvider, setConnectedProvider] = useState(null);
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
  }, [uploadedImage, currentColor, stats, edition, canvasSize]);

  // ... (rest of your wallet and UI logic remains unchanged)

  // --- Drawing ---
  const drawCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    // Always draw at 800x1200, then scale down for display
    canvas.width = 800;
    canvas.height = 1200;
    const color = MYTHIC_COLORS[currentColor];

    ctx.clearRect(0, 0, 800, 1200);

    const bgGrad = ctx.createLinearGradient(0, 0, 800, 1200);
    bgGrad.addColorStop(0, "#0a3d91"); // blue dashboard
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

  // ... (rest of your wallet and mint logic remains unchanged)

  return (
    <div
      className="min-h-screen w-full bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 p-2 md:p-8"
      ref={containerRef}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-4">
              NFT Card Generator
            </h1>
            <p className="text-blue-200 text-lg">
              Create epic mythic cards • Mint Fee: {MINT_FEE} ETH
            </p>
          </div>
          <div>
            {walletAddress ? (
              <div className="bg-black/50 backdrop-blur-lg rounded-xl p-4 border border-green-500/50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-white font-mono">
                    {walletAddress.substring(0, 6)}...
                    {walletAddress.substring(38)}
                  </span>
                  <button
                    onClick={disconnectWallet}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowWalletModal(true)}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2"
              >
                <Wallet className="w-5 h-5" /> Connect Wallet
              </button>
            )}
            <button
              onClick={() => setShowNetwork(true)}
              className="ml-4 bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-900 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2"
            >
              <Network className="w-5 h-5" /> {NETWORKS[network].name}
            </button>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-black/50 backdrop-blur-lg rounded-2xl p-6 border border-cyan-500/30 flex flex-col items-center">
            <canvas
              ref={canvasRef}
              width={800}
              height={1200}
              style={{
                width: `${canvasSize.width}px`,
                height: `${canvasSize.height}px`,
                maxWidth: "100%",
                borderRadius: 16,
                boxShadow: "0 0 32px #00ffff44",
                background: "#0a3d91",
              }}
            />
          </div>
          {/* ...rest of your controls (upload, color, stats, mint) ... */}
          {/* You can copy the controls from your previous code here */}
        </div>
      </div>
      {/* ...rest of your modals and controls... */}
    </div>
  );
}

