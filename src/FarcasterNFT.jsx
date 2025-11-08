import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Zap, Sparkles, Wallet, Check, X, Network } from 'lucide-react';

const MYTHIC_COLORS = [
  { name: 'Electric Cyan', primary: '#00ffff', secondary: '#0088ff', glow: 'rgba(0,255,255,0.5)' },
  { name: 'Laser Gold', primary: '#ffd700', secondary: '#ff8800', glow: 'rgba(255,215,0,0.5)' },
  { name: 'Neon Pink', primary: '#ff00ff', secondary: '#ff0088', glow: 'rgba(255,0,255,0.5)' },
  { name: 'Plasma Purple', primary: '#8800ff', secondary: '#ff00ff', glow: 'rgba(136,0,255,0.5)' },
  { name: 'Toxic Green', primary: '#00ff00', secondary: '#88ff00', glow: 'rgba(0,255,0,0.5)' },
  { name: 'Crimson Red', primary: '#ff0000', secondary: '#ff0088', glow: 'rgba(255,0,0,0.5)' }
];

const NETWORKS = {
  eth: { name: 'Ethereum', chainId: '0x1', symbol: 'ETH', fee: '0.001', explorer: 'https://etherscan.io', color: '#627EEA' },
  bsc: { name: 'BSC', chainId: '0x38', symbol: 'BNB', fee: '0.003', explorer: 'https://bscscan.com', color: '#F3BA2F' },
  polygon: { name: 'Polygon', chainId: '0x89', symbol: 'MATIC', fee: '1.0', explorer: 'https://polygonscan.com', color: '#8247E5' },
  arbitrum: { name: 'Arbitrum', chainId: '0xa4b1', symbol: 'ETH', fee: '0.0005', explorer: 'https://arbiscan.io', color: '#28A0F0' },
  base: { name: 'Base', chainId: '0x2105', symbol: 'ETH', fee: '0.0005', explorer: 'https://basescan.org', color: '#0052FF' }
};

const TREASURY = '0x592B35c8917eD36c39Ef73D0F5e92B0173560b2e';

export default function NFTCardGenerator() {
  const [image, setImage] = useState(null);
  const [color, setColor] = useState(0);
  const [stats, setStats] = useState({ attack: 85, defense: 70, speed: 90, magic: 75 });
  const [edition] = useState(Math.floor(Math.random() * 999) + 1);
  const [wallet, setWallet] = useState(null);
  const [provider, setProvider] = useState(null);
  const [showWallet, setShowWallet] = useState(false);
  const [showNetwork, setShowNetwork] = useState(false);
  const [network, setNetwork] = useState('eth');
  const [txStatus, setTxStatus] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const canvasRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    drawCard();
    const interval = setInterval(drawCard, 50);
    return () => clearInterval(interval);
  }, [image, color, stats]);

  useEffect(() => {
    checkWallet();
  }, []);

  const checkWallet = async () => {
    try {
      const p = window.ethereum || window.trustwallet;
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

  const connect = async (type) => {
    try {
      let p = window.ethereum;
      if (type === 'trust' && window.trustwallet) p = window.trustwallet;
      if (window.ethereum?.providers) {
        if (type === 'metamask') p = window.ethereum.providers.find(x => x.isMetaMask);
        if (type === 'coinbase') p = window.ethereum.providers.find(x => x.isCoinbaseWallet);
      }
      
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
      if (err.code === 4902) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: NETWORKS[net].chainId,
              chainName: NETWORKS[net].name,
              nativeCurrency: { name: NETWORKS[net].symbol, symbol: NETWORKS[net].symbol, decimals: 18 },
              rpcUrls: ['https://rpc.ankr.com/' + net]
            }]
          });
          setNetwork(net);
          setShowNetwork(false);
        } catch (addErr) {
          alert('Failed to add network');
        }
      }
    }
  };

  const mint = async () => {
    if (!wallet) { setShowWallet(true); return; }
    if (!image) { alert('Upload image first!'); return; }
    
    try {
      setTxStatus('pending');
      const net = NETWORKS[network];
      const value = '0x' + BigInt(Math.floor(parseFloat(net.fee) * 1e18)).toString(16);
      
      const tx = await provider.request({
        method: 'eth_sendTransaction',
        params: [{ from: wallet, to: TREASURY, value, gas: '0x5208' }]
      });
      
      setTxHash(tx);
      setTxStatus('success');
      alert('✅ Success! Downloading...');
      setTimeout(download, 1000);
    } catch (err) {
      setTxStatus('failed');
      if (err.code === 4001) alert('❌ Transaction cancelled');
      else if (err.message?.includes('insufficient')) alert(`💰 Need ${NETWORKS[network].fee} ${NETWORKS[network].symbol}`);
      else alert('❌ Failed: ' + err.message);
    }
  };

  const upload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => setImage(img);
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
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

  const download = () => {
    const link = document.createElement('a');
    link.download = `nft-card-${edition}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const drawCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const col = MYTHIC_COLORS[color];

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

    if (image) {
      const aspect = image.width / image.height;
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
      ctx.drawImage(image, 80 + ox, 180 + oy, w, h);
      ctx.restore();
    } else {
      ctx.fillStyle = col.primary;
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Upload Your Image', 400, 420);
    }

    ctx.shadowColor = col.primary;
    ctx.shadowBlur = 30;
    ctx.fillStyle = col.primary;
    ctx.font = 'bold 56px Arial';
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
    ctx.font = 'bold 36px Arial';
    ctx.fillText(col.name.toUpperCase(), 400, 768);

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
    <div className="min-h-screen relative overflow-hidden">
      {/* Glassmorphism animated background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-blue-500 animate-gradient"></div>
      
      {/* Floating orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-delayed"></div>
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-slow"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 p-4 md:p-8">
        {/* Version Badge */}
        <div className="fixed top-4 left-4 z-50 backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg px-3 py-1 shadow-lg">
          <span className="text-cyan-300 text-xs font-bold">v24 GLASSMORPHISM</span>
        </div>

        {/* Wallet Modal */}
        {showWallet && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Connect Wallet</h2>
                <button onClick={() => setShowWallet(false)} className="text-white/60 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-3">
                <button onClick={() => connect('metamask')} className="w-full backdrop-blur-xl bg-gradient-to-r from-orange-500/80 to-yellow-600/80 hover:from-orange-600/90 hover:to-yellow-700/90 text-white font-bold py-3 px-4 rounded-xl border border-white/20 shadow-lg transition-all transform hover:scale-105">
                  MetaMask
                </button>
                <button onClick={() => connect('trust')} className="w-full backdrop-blur-xl bg-gradient-to-r from-blue-600/80 to-blue-800/80 hover:from-blue-700/90 hover:to-blue-900/90 text-white font-bold py-3 px-4 rounded-xl border border-white/20 shadow-lg transition-all transform hover:scale-105">
                  Trust Wallet
                </button>
                <button onClick={() => connect('coinbase')} className="w-full backdrop-blur-xl bg-gradient-to-r from-indigo-600/80 to-purple-700/80 hover:from-indigo-700/90 hover:to-purple-800/90 text-white font-bold py-3 px-4 rounded-xl border border-white/20 shadow-lg transition-all transform hover:scale-105">
                  Coinbase
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Network Modal */}
        {showNetwork && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="backdrop-blur-xl bg-white/10 border-2 border-white/20 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Select Network</h2>
                <button onClick={() => setShowNetwork(false)} className="text-white/60 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-2">
                {Object.entries(NETWORKS).map(([key, n]) => (
                  <button
                    key={key}
                    onClick={() => switchNet(key)}
                    className="w-full backdrop-blur-xl text-white font-bold py-3 px-4 rounded-xl hover:opacity-90 flex justify-between items-center border border-white/20 shadow-lg transition-all transform hover:scale-105"
                    style={{ background: n.color + 'CC' }}
                  >
                    <span>{n.name}</span>
                    <span className="text-sm opacity-75">{n.fee} {n.symbol}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 border border-white/20 shadow-2xl">
              <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg mb-2 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-yellow-300 animate-pulse" />
                NFT Card Generator
              </h1>
              <p className="text-white/90 font-medium">Multi-chain minting • {net.fee} {net.symbol}</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowNetwork(true)}
                className="backdrop-blur-xl px-4 py-3 rounded-xl font-bold text-white flex items-center gap-2 border border-white/30 shadow-lg transition-all transform hover:scale-105"
                style={{ background: net.color + 'CC' }}
              >
                <Network className="w-4 h-4" />
                {net.name}
              </button>
              
              {wallet ? (
                <div className="backdrop-blur-xl bg-white/20 rounded-xl px-4 py-3 border border-white/30 shadow-lg">
                  <span className="text-white text-sm font-medium">{wallet.substring(0, 6)}...{wallet.substring(38)}</span>
                </div>
              ) : (
                <button
                  onClick={() => setShowWallet(true)}
                  className="backdrop-blur-xl bg-gradient-to-r from-cyan-500/80 to-purple-600/80 hover:from-cyan-600/90 hover:to-purple-700/90 text-white font-bold py-3 px-4 rounded-xl flex items-center gap-2 border border-white/20 shadow-lg transition-all transform hover:scale-105"
                >
                  <Wallet className="w-4 h-4" />
                  Connect
                </button>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Canvas */}
            <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 border border-white/20 shadow-2xl">
              <canvas ref={canvasRef} width={800} height={1200} className="w-full rounded-2xl shadow-xl" />
            </div>

            {/* Controls */}
            <div className="space-y-4">
              {/* Upload */}
              <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-5 border border-white/20 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-cyan-300" />
                  Upload Image
                </h2>
                <input ref={fileRef} type="file" accept="image/*" onChange={upload} className="hidden" />
                <button onClick={() => fileRef.current?.click()} className="w-full backdrop-blur-xl bg-gradient-to-r from-cyan-500/80 to-blue-600/80 hover:from-cyan-600/90 hover:to-blue-700/90 text-white font-bold py-4 px-4 rounded-xl border border-white/20 shadow-lg transition-all transform hover:scale-105">
                  Choose Image
                </button>
              </div>

              {/* Colors */}
              <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-5 border border-white/20 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-300" />
                  Colors ({color + 1}/{MYTHIC_COLORS.length})
                </h2>
                <div className="mb-4 p-4 rounded-xl border-2 backdrop-blur-xl bg-white/5 shadow-lg" style={{ borderColor: MYTHIC_COLORS[color].primary }}>
                  <p className="text-center font-bold text-xl text-white drop-shadow-lg">
                    {MYTHIC_COLORS[color].name}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setColor((color - 1 + MYTHIC_COLORS.length) % MYTHIC_COLORS.length)} className="backdrop-blur-xl bg-white/20 hover:bg-white/30 text-white font-bold py-3 rounded-xl border border-white/20 shadow-lg transition-all transform hover:scale-105">
                    ← Prev
                  </button>
                  <button onClick={() => setColor((color + 1) % MYTHIC_COLORS.length)} className="backdrop-blur-xl bg-white/20 hover:bg-white/30 text-white font-bold py-3 rounded-xl border border-white/20 shadow-lg transition-all transform hover:scale-105">
                    Next →
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-5 border border-white/20 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-300" />
                  Stats
                </h2>
                <div className="space-y-3 mb-4">
                  {Object.entries(stats).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-3">
                      <span className="text-white font-bold w-20 capitalize text-sm">{key}:</span>
                      <div className="flex-1 backdrop-blur-xl bg-white/20 rounded-full h-4 border border-white/30 shadow-inner">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-4 rounded-full shadow-lg" style={{ width: `${val}%` }} />
                      </div>
                      <span className="text-white font-bold w-10 text-right text-sm">{val}</span>
                    </div>
                  ))}
                </div>
                <button onClick={randomize} className="w-full backdrop-blur-xl bg-gradient-to-r from-yellow-500/80 to-orange-600/80 hover:from-yellow-600/90 hover:to-orange-700/90 text-white font-bold py-4 rounded-xl border border-white/20 shadow-lg transition-all transform hover:scale-105">
                  Randomize
                </button>
              </div>

              {/* Mint */}
              <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-5 border border-white/20 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-green-300" />
                  Mint Card
                </h2>
                
                {txStatus === 'success' && (
                  <div className="mb-4 p-4 backdrop-blur-xl bg-green-500/20 border border-green-400/50 rounded-xl shadow-lg">
                    <div className="flex items-center gap-2 text-green-300 text-sm font-medium">
                      <Check className="w-4 h-4" />
                      <span>Success!</span>
                    </div>
                    {txHash && (
                      <a href={`${net.explorer}/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="text-cyan-300 text-xs underline mt-2 block">
                        View Transaction
                      </a>
                    )}
                  </div>
                )}

                {txStatus === 'failed' && (
                  <div className="mb-4 p-4 backdrop-blur-xl bg-red-500/20 border border-red-400/50 rounded-xl shadow-lg">
                    <div className="flex items-center gap-2 text-red-300 text-sm font-medium">
                      <X className="w-4 h-4" />
                      <span>Transaction Failed</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={mint}
                  disabled={txStatus === 'pending'}
                  className={`w-full text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 border border-white/20 shadow-lg transition-all transform hover:scale-105 ${txStatus === 'pending' ? 'backdrop-blur-xl bg-gray-600/50 cursor-not-allowed' : 'backdrop-blur-xl bg-gradient-to-r from-green-500/80 to-emerald-600/80 hover:from-green-600/90 hover:to-emerald-700/90'}`}
                >
                  {txStatus === 'pending' ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-5 h-5" />
                      Pay {net.fee} {net.symbol}
                    </>
                  )}
                </button>

                <button onClick={download} className="w-full mt-3 backdrop-blur-xl bg-white/20 hover:bg-white/30 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 border border-white/20 shadow-lg transition-all transform hover:scale-105">
                  <Download className="w-4 h-4" />
                  Free Download
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(20px) translateX(-10px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 15s ease infinite;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
