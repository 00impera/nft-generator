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

const BUTTON_THEMES = {
  blue: {
    label: "Blue",
    gradient: "from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500",
    led: "bg-blue-400 shadow-[0_0_8px_2px_rgba(59,130,246,0.7)]",
  },
  green: {
    label: "Green",
    gradient: "from-green-600 to-emerald-400 hover:from-green-700 hover:to-emerald-500",
    led: "bg-green-400 shadow-[0_0_8px_2px_rgba(34,197,94,0.7)]",
  },
  purple: {
    label: "Purple",
    gradient: "from-purple-600 to-pink-400 hover:from-purple-700 hover:to-pink-500",
    led: "bg-purple-400 shadow-[0_0_8px_2px_rgba(168,85,247,0.7)]",
  },
  red: {
    label: "Red",
    gradient: "from-rose-600 to-orange-400 hover:from-rose-700 hover:to-orange-500",
    led: "bg-rose-400 shadow-[0_0_8px_2px_rgba(244,63,94,0.7)]",
  }
};

function Led({ active, disabled, color = "blue" }) {
  const theme = BUTTON_THEMES[color] || BUTTON_THEMES.blue;
  return (
    <span
      className={
        `inline-block w-3 h-3 rounded-full mr-2 ` +
        (disabled
          ? "bg-gray-700"
          : active
            ? `${theme.led} animate-pulse`
            : theme.led
        )
      }
    />
  );
}

export default function App() {
  // Visual/logic state
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
  const [buttonTheme, setButtonTheme] = useState("blue");
  // Holographic card tilt
  const [cardRotation, setCardRotation] = useState({ x: 0, y: 0 });
  // Particle background
  const [particles] = useState(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 3 + 2
    }))
  );
  const fileInputRef = useRef();
  const canvasRef = useRef();
  const account = useActiveAccount();
  const wallet = useActiveWallet();

  useEffect(() => {
    document.body.style.overflowX = "hidden";
    return () => { document.body.style.overflowX = ""; };
  }, []);

  // Holographic card tilt handlers
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

  // Confetti
  const triggerConfetti = () => {
    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.left = 0;
    canvas.style.top = 0;
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.pointerEvents = "none";
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    const confetti = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      r: Math.random() * 6 + 4,
      d: Math.random() * 80 + 10,
      color: ["#2563eb", "#a855f7", "#ec4899", "#fbbf24"][Math.floor(Math.random() * 4)],
      tilt: Math.random() * 10 - 10
    }));

    let angle = 0;
    let frame = 0;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      angle += 0.01;
      for (let i = 0; i < confetti.length; i++) {
        let c = confetti[i];
        c.y += (Math.cos(angle + c.d) + 3 + c.r / 2) / 2;
        c.x += Math.sin(angle);
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, c.r, c.r / 2, c.tilt, 0, 2 * Math.PI);
        ctx.fillStyle = c.color;
        ctx.globalAlpha = 0.8;
        ctx.fill();
      }
      frame++;
      if (frame < 100) {
        requestAnimationFrame(draw);
      } else {
        document.body.removeChild(canvas);
      }
    }
    draw();
  };

  // Main logic
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
      triggerConfetti();
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
  const ledActive = (disabled, loading) => !disabled && !loading;

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col items-center justify-center p-2 md:p-6">
      {/* Particle background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <svg width="100vw" height="100vh" className="absolute w-full h-full">
          {particles.map(p => (
            <circle
              key={p.id}
              cx={`${p.x}vw`}
              cy={`${p.y}vh`}
              r={p.size}
              fill="#2563eb"
              opacity="0.3"
            >
              <animate
                attributeName="cy"
                values={`${p.y}vh;${(p.y + 10) % 100}vh;${p.y}vh`}
                dur={`${p.duration}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </svg>
      </div>
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

        {/* Color selector */}
        <div className="flex gap-2 mb-4">
          {Object.keys(BUTTON_THEMES).map((key) => (
            <button
              key={key}
              onClick={() => setButtonTheme(key)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full font-bold border-2 transition-all shadow
                ${buttonTheme === key
                  ? `border-white bg-gradient-to-r ${BUTTON_THEMES[key].gradient} scale-105`
                  : "border-transparent bg-black/40 hover:scale-105"}`}
            >
              <span className={`w-3 h-3 rounded-full ${BUTTON_THEMES[key].led}`}></span>
              {BUTTON_THEMES[key].label}
            </button>
          ))}
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
                  className={`py-4 rounded-xl font-bold text-white bg-gradient-to-r ${BUTTON_THEMES[buttonTheme].gradient} border-2 border-blue-500 shadow-lg flex items-center justify-center gap-2 hover:scale-105 transition`}
                  style={{ boxShadow: "0 0 20px rgba(59,130,246,0.5)" }}
                >
                  <Led active={true} color={buttonTheme} />
                  <ImageIcon className="w-5 h-5" />Choose File
                </button>
                <button
                  onClick={convertToGif}
                  disabled={!media || mediaType === "gif" || isProcessing}
                  className={`py-4 rounded-xl font-bold text-white bg-gradient-to-r ${BUTTON_THEMES[buttonTheme].gradient} border-2 border-blue-500 shadow-lg flex items-center justify-center gap-2 transition ${(!media || mediaType === "gif" || isProcessing) ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
                  style={{ boxShadow: "0 0 20px rgba(59,130,246,0.5)" }}
                >
                  <Led active={ledActive(!(!media || mediaType === "gif" || isProcessing), isProcessing)} disabled={!media || mediaType === "gif" || isProcessing} color={buttonTheme} />
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
            {/* ...rest of your controls (NFT Config, Attributes, Network, Payment & Download) ... */}
            {/* (Use the same BUTTON_THEMES[buttonTheme].gradient and <Led color={buttonTheme} /> for all buttons) */}
            {/* ...copy the rest of your controls from your previous App.jsx ... */}
            {/* ...for brevity, not repeating the entire controls block here ... */}
          </div>

          {/* NFT Card Preview */}
          <div className="flex justify-center items-start">
            <div
              className="rounded-3xl overflow-hidden w-full max-w-md shadow-2xl"
              style={{
                border: "4px solid #a855f7",
                boxShadow: "0 0 50px #a855f7, 0 0 100px #a855f7",
                background: "linear-gradient(135deg, #7c3aed 0%, #22d3ee 100%)",
                transform: `perspective(900px) rotateX(${cardRotation.x}deg) rotateY(${cardRotation.y}deg)`,
                transition: "transform 0.2s cubic-bezier(.25,.8,.25,1)"
              }}
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
            >
              {/* ...rest of your NFT card preview... */}
              {/* (No changes needed here except for the new style/handlers above) */}
              {/* ...copy the rest of your NFT card preview from your previous App.jsx ... */}
            </div>
          </div>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
