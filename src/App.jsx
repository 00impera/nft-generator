import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Sparkles, Wallet, X, Network, Film, Info, Copy, Palette, Wand2 } from 'lucide-react';

const MYTHIC_COLORS = [
  { name: 'Electric Cyan', primary: '#00ffff', secondary: '#0088ff', glow: 'rgba(0,255,255,0.5)' },
  { name: 'Laser Gold', primary: '#ffd700', secondary: '#ff8800', glow: 'rgba(255,215,0,0.5)' },
  { name: 'Neon Pink', primary: '#ff00ff', secondary: '#ff0088', glow: 'rgba(255,0,255,0.5)' },
  { name: 'Plasma Purple', primary: '#8800ff', secondary: '#ff00ff', glow: 'rgba(136,0,255,0.5)' },
  { name: 'Toxic Green', primary: '#00ff00', secondary: '#88ff00', glow: 'rgba(0,255,0,0.5)' },
  { name: 'Crimson Red', primary: '#ff0000', secondary: '#ff0088', glow: 'rgba(255,0,0,0.5)' }
];

const NETWORKS = {
  eth: { name: 'Ethereum', chainId: '0x1', symbol: 'ETH', fee: '0.001', color: '#627EEA' },
  bsc: { name: 'BSC', chainId: '0x38', symbol: 'BNB', fee: '0.003', color: '#F3BA2F' },
  polygon: { name: 'Polygon', chainId: '0x89', symbol: 'MATIC', fee: '1.0', color: '#8247E5' },
  arbitrum: { name: 'Arbitrum', chainId: '0xa4b1', symbol: 'ETH', fee: '0.0005', color: '#28A0F0' },
  base: { name: 'Base', chainId: '0x2105', symbol: 'ETH', fee: '0.0005', color: '#0052FF' }
};

const TREASURY = '0x592B35c8917eD36c39Ef73D0F5e92B0173560b2e';

export default function NFTCardGenerator() {
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [color, setColor] = useState(0);
  const [customColor, setCustomColor] = useState({ r: 0, g: 255, b: 255 });
  const [useCustomColor, setUseCustomColor] = useState(false);
  const [stats, setStats] = useState({ attack: 85, defense: 70, speed: 90, magic: 75 });
  const [edition] = useState(Math.floor(Math.random() * 999) + 1);
  const [metadata, setMetadata] = useState({ name: '', description: '', creator: '' });
  const [showMetadata, setShowMetadata] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [provider, setProvider] = useState(null);
  const [showWallet, setShowWallet] = useState(false);
  const [showNetwork, setShowNetwork] = useState(false);
  const [network, setNetwork] = useState('eth');
  const [dragActive, setDragActive] = useState(false);
  const canvasRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    drawCard();
    const interval = setInterval(drawCard, 50);
    return () => clearInterval(interval);
  }, [mediaFile, color, customColor, useCustomColor, stats]);

  useEffect(() => {
    checkWallet();
  }, []);

  const checkWallet = async () => {
    try {
      const p = window.ethereum;
      if (p) {
        const accounts = await p.request({ method: 'eth_accounts' });
        if (accounts[0]) {
          setWallet(accounts[0]);
          setProvider(p);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const connect = async () => {
    try {
      const p = window.ethereum;
      const accounts = await p.request({ method: 'eth_requestAccounts' });
      setWallet(accounts[0]);
      setProvider(p);
      setShowWallet(false);
    } catch (err) {
      alert('Connection failed: ' + err.message);
    }
  };

  const switchNet = async (net) => {
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NETWORKS[net].chainId }]
      });
      setNetwork(net);
      setShowNetwork(false);
    } catch (err) {
      alert('Network switch failed');
    }
  };

  const mint = async () => {
    if (!wallet) { setShowWallet(true); return; }
    if (!mediaFile) { alert('Upload media first!'); return; }
    
    try {
      const net = NETWORKS[network];
      const value = '0x' + BigInt(Math.floor(parseFloat(net.fee) * 1e18)).toString(16);
      
      await provider.request({
        method: 'eth_sendTransaction',
        params: [{ from: wallet, to: TREASURY, value, gas: '0x5208' }]
      });
      
      downloadCard();
      downloadMetadata();
      alert('✅ Success! Downloading card + metadata...');
    } catch (err) {
      if (err.code === 4001) alert('❌ Transaction cancelled');
      else alert('❌ Failed: ' + err.message);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const processFile = (file) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          setMediaFile(img);
          setMediaType(file.type === 'image/gif' ? 'gif' : 'image');
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.onloadeddata = () => {
        setMediaFile(video);
        setMediaType('video');
      };
      video.src = url;
      video.load();
    } else {
      alert('Please upload image, GIF, or video');
    }
  };

  const randomize = () => {
    setStats({
      attack: Math.floor(Math.random() * 40) + 60,
      defense: Math.floor(Math.random() * 40) + 60,
      speed: Math.floor(Math.random() * 40) + 60,
      magic: Math.floor(Math.random() * 40) + 60
    });
  };

  const downloadCard = () => {
    const link = document.createElement('a');
    link.download = `nft-card-${edition}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const downloadMetadata = () => {
    const meta = {
      name: metadata.name || `MYTHIC NFT #${edition}`,
      description: metadata.description || 'A unique NFT card',
      image: `nft-card-${edition}.png`,
      edition: edition,
      creator: metadata.creator || wallet || 'Anonymous',
      attributes: [
        { trait_type: 'Attack', value: stats.attack },
        { trait_type: 'Defense', value: stats.defense },
        { trait_type: 'Speed', value: stats.speed },
        { trait_type: 'Magic', value: stats.magic },
        { trait_type: 'Color', value: getCurrentColor().name },
        { trait_type: 'Media', value: mediaType || 'None' }
      ]
    };
    
    const blob = new Blob([JSON.stringify(meta, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = `nft-card-${edition}-metadata.json`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const copyMetadata = () => {
    const meta = { name: metadata.name || `MYTHIC NFT #${edition}`, edition, stats };
    navigator.clipboard.writeText(JSON.stringify(meta, null, 2));
    alert('Copied!');
  };

  const getCurrentColor = () => {
    if (useCustomColor) {
      const { r, g, b } = customColor;
      return {
        name: `RGB(${r},${g},${b})`,
        primary: `rgb(${r},${g},${b})`,
        secondary: `rgb(${Math.max(0, r-50)},${Math.max(0, g-50)},${Math.max(0, b-50)})`,
        glow: `rgba(${r},${g},${b},0.5)`
      };
    }
    return MYTHIC_COLORS[color];
  };

  const drawCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const col = getCurrentColor();

    ctx.clearRect(0, 0, 800, 1200);

    const bgGrad = ctx.createLinearGradient(0, 0, 800, 1200);
    bgGrad.addColorStop(0, '#0a0a0a');
    bgGrad.addColorStop(0.5, '#1a1a2e');
    bgGrad.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 800, 1200);

    for (let i = 0; i < 4; i++) {
      const angle = (Date.now() / 2000 + (i * Math.PI / 2)) % (Math.PI * 2);
      const x = 400 + Math.cos(angle) * 200;
      const y = 600 + Math.sin(angle) * 200;
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 150);
      glow.addColorStop(0, col.glow);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, 150, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowColor = col.primary;
    ctx.shadowBlur = 20;
    ctx.strokeStyle = col.primary;
    ctx.lineWidth = 8;
    ctx.strokeRect(30, 30, 740, 1140);
    ctx.shadowBlur = 10;
    ctx.lineWidth = 4;
    ctx.strokeStyle = col.secondary;
    ctx.strokeRect(45, 45, 710, 1110);

    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(80, 180, 640, 480);

    if (mediaFile) {
      const aspect = mediaFile.width / mediaFile.height || mediaFile.videoWidth / mediaFile.videoHeight;
      const boxAspect = 640 / 480;
      let w, h, ox, oy;
      if (aspect > boxAspect) {
        h = 480; w = 480 * aspect; ox = (640 - w) / 2; oy = 0;
      } else {
        w = 640; h = 640 / aspect; ox = 0; oy = (480 - h) / 2;
      }
      ctx.save();
      ctx.beginPath();
      ctx.rect(80, 180, 640, 480);
      ctx.clip();
      ctx.drawImage(mediaFile, 80 + ox, 180 + oy, w, h);
      ctx.restore();

      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.fillRect(90, 190, 80, 30);
      ctx.fillStyle = col.primary;
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(mediaType?.toUpperCase() || 'IMAGE', 100, 210);
    } else {
      ctx.fillStyle = col.primary;
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Upload Your Media', 400, 420);
    }

    ctx.shadowColor = col.primary;
    ctx.shadowBlur = 30;
    ctx.fillStyle = col.primary;
    ctx.font = 'bold 56px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`MYTHIC NFT #${String(edition).padStart(3, '0')}`, 400, 130);

    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.9)';
    ctx.beginPath();
    ctx.roundRect(250, 720, 300, 70, 35);
    ctx.fill();
    const badgeGrad = ctx.createLinearGradient(250, 720, 550, 720);
    badgeGrad.addColorStop(0, col.primary);
    badgeGrad.addColorStop(1, col.secondary);
    ctx.strokeStyle = badgeGrad;
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.fillStyle = badgeGrad;
    ctx.font = 'bold 28px Arial';
    ctx.fillText(col.name.toUpperCase(), 400, 760);

    const statList = [
      { label: 'ATK', value: stats.attack, y: 840 },
      { label: 'DEF', value: stats.defense, y: 920 },
      { label: 'SPD', value: stats.speed, y: 1000 },
      { label: 'MAG', value: stats.magic, y: 1080 }
    ];

    statList.forEach(s => {
      ctx.fillStyle = 'white';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(s.label, 100, s.y);
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(200, s.y - 25, 500, 35);
      const barGrad = ctx.createLinearGradient(200, s.y - 25, 700, s.y - 25);
      barGrad.addColorStop(0, col.primary);
      barGrad.addColorStop(1, col.secondary);
      ctx.fillStyle = barGrad;
      ctx.fillRect(200, s.y - 25, (s.value / 100) * 500, 35);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(s.value, 650 + (50 - s.value / 2), s.y);
    });

    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(`Edition ${edition}/999`, 400, 1160);
  };

  const net = NETWORKS[network];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-500 to-blue-500">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      </div>

      <div className="relative z-10 p-4 md:p-8">
        {showWallet && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-3xl p-6 max-w-sm w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Connect Wallet</h2>
                <button onClick={() => setShowWallet(false)} className="text-white/60 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <button onClick={connect} className="w-full bg-gradient-to-r from-orange-500 to-yellow-600 hover:from-orange-600 hover:to-yellow-700 text-white font-bold py-3 px-4 rounded-xl">
                MetaMask
              </button>
            </div>
          </div>
        )}

        {showNetwork && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-3xl p-6 max-w-sm w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Select Network</h2>
                <button onClick={() => setShowNetwork(false)} className="text-white/60 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-2">
                {Object.entries(NETWORKS).map(([key, n]) => (
                  <button
                    key={key}
                    onClick={() => switchNet(key)}
                    className="w-full text-white font-bold py-3 px-4 rounded-xl flex justify-between"
                    style={{ background: n.color }}
                  >
                    <span>{n.name}</span>
                    <span className="text-sm">{n.fee} {n.symbol}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {showMetadata && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Metadata
                </h2>
                <button onClick={() => setShowMetadata(false)} className="text-white/60 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-white text-sm font-semibold mb-2 block">Name</label>
                  <input
                    type="text"
                    value={metadata.name}
                    onChange={(e) => setMetadata({...metadata, name: e.target.value})}
                    placeholder={`MYTHIC NFT #${edition}`}
                    className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>
                <div>
                  <label className="text-white text-sm font-semibold mb-2 block">Description</label>
                  <textarea
                    value={metadata.description}
                    onChange={(e) => setMetadata({...metadata, description: e.target.value})}
                    placeholder="Describe your NFT..."
                    rows="3"
                    className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>
                <div>
                  <label className="text-white text-sm font-semibold mb-2 block">Creator</label>
                  <input
                    type="text"
                    value={metadata.creator}
                    onChange={(e) => setMetadata({...metadata, creator: e.target.value})}
                    placeholder={wallet || "Anonymous"}
                    className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={copyMetadata} className="flex-1 bg-white/20 hover:bg-white/30 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                  <button onClick={downloadMetadata} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 border border-white/20">
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
                NFT Card Generator
              </h1>
              <p className="text-white/90 font-medium">Premium • Multi-chain • Metadata</p>
            </div>
            
            <div className="flex gap-3 flex-wrap justify-center">
              <button
                onClick={() => setShowNetwork(true)}
                className="px-4 py-3 rounded-xl font-bold text-white flex items-center gap-2"
                style={{ background: net.color }}
              >
                <Network className="w-4 h-4" />
                {net.name}
              </button>
              
              {wallet ? (
                <div className="bg-white/20 rounded-xl px-4 py-3">
                  <span className="text-white text-sm font-medium">{wallet.substring(0, 6)}...{wallet.substring(38)}</span>
                </div>
              ) : (
                <button
                  onClick={() => setShowWallet(true)}
                  className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold py-3 px-4 rounded-xl flex items-center gap-2"
                >
                  <Wallet className="w-4 h-4" />
                  Connect
                </button>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 border border-white/20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Preview</h2>
                <button onClick={downloadCard} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Save
                </button>
              </div>
              <canvas ref={canvasRef} width="800" height="1200" className="w-full rounded-2xl shadow-2xl" />
            </div>

            <div className="space-y-6">
              <div
                className={`backdrop-blur-xl bg-white/10 rounded-3xl p-6 border-2 ${dragActive ? 'border-yellow-400' : 'border-white/20 border-dashed'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Media
                </h3>
                <input ref={fileRef} type="file" accept="image/*,video/*" onChange={(e) => e.target.files[0] && processFile(e.target.files[0])} className="hidden" />
                <div 
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-white/40 rounded-2xl p-8 text-center cursor-pointer hover:border-white/60 hover:bg-white/5"
                >
                  <div className="text-6xl mb-4">📸</div>
                  <p className="text-white font-bold mb-2">Drag & Drop or Click</p>
                  <p className="text-white/70 text-sm">Images, GIFs, Videos</p>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 border border-white/20">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Color Theme
                  </h3>
                  <button
                    onClick={() => setUseCustomColor(!useCustomColor)}
                    className="text-sm text-white/80 hover:text-white font-semibold"
                  >
                    {useCustomColor ? 'Presets' : 'Custom RGB'}
                  </button>
                </div>
                
                {useCustomColor ? (
                  <div className="space-y-3">
                    {['r', 'g', 'b'].map(ch => (
                      <div key={ch}>
                        <label className="text-white text-sm font-semibold mb-1 block">{ch.toUpperCase()}: {customColor[ch]}</label>
                        <input
                          type="range"
                          min="0"
                          max="255"
                          value={customColor[ch]}
                          onChange={(e) => setCustomColor({...customColor, [ch]: parseInt(e.target.value)})}
                          className="w-full"
                        />
                      </div>
                    ))}
                    <div className="h-12 rounded-xl mt-4" style={{ background: `rgb(${customColor.r},${customColor.g},${customColor.b})` }}></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {MYTHIC_COLORS.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => setColor(i)}
                        className={`h-16 rounded-xl transition-all ${color === i ? 'ring-4 ring-white scale-110' : ''}`}
                        style={{ background: c.primary }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 border border-white/20">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Wand2 className="w-5 h-5" />
                    Stats
                  </h3>
                  <button onClick={randomize} className="text-sm text-white/80 hover:text-white font-semibold">
                    Randomize
                  </button>
                </div>
                {Object.entries(stats).map(([key, val]) => (
                  <div key={key} className="mb-3">
                    <label className="text-white text-sm font-semibold mb-1 block capitalize">{key}: {val}</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={val}
                      onChange={(e) => setStats({...stats, [key]: parseInt(e.target.value)})}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShowMetadata(true)}
                  className="backdrop-blur-xl bg-white/20 hover:bg-white/30 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2"
                >
                  <Info className="w-5 h-5" />
                  Metadata
                </button>
                <button
                  onClick={mint}
                  className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  Mint NFT
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
