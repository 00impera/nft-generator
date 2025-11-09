import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Sparkles, Film, Zap, Camera, Palette, Wallet, X, Check, Network } from 'lucide-react';

const NETWORKS = {
  eth: { name: 'Ethereum', chainId: '0x1', symbol: 'ETH', fee: '0.001', color: '#627EEA' },
  bsc: { name: 'BSC', chainId: '0x38', symbol: 'BNB', fee: '0.003', color: '#F3BA2F' },
  polygon: { name: 'Polygon', chainId: '0x89', symbol: 'MATIC', fee: '1.0', color: '#8247E5' },
  base: { name: 'Base', chainId: '0x2105', symbol: 'ETH', fee: '0.0005', color: '#0052FF' }
};

const TREASURY = '0x592B35c8917eD36c39Ef73D0F5e92B0173560b2e';

const NFTCardGenerator = () => {
  const [media, setMedia] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [name, setName] = useState('Epic NFT');
  const [rarity, setRarity] = useState('Legendary');
  const [stats, setStats] = useState({ attack: 85, defense: 70, speed: 90, magic: 75 });
  const [chain, setChain] = useState('eth');
  const [color, setColor] = useState('#00ffff');
  const [isConverting, setIsConverting] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [provider, setProvider] = useState(null);
  const [showWallet, setShowWallet] = useState(false);
  const [showNetwork, setShowNetwork] = useState(false);
  const [txStatus, setTxStatus] = useState(null);
  const fileInputRef = useRef();
  const canvasRef = useRef();

  useEffect(() => { checkWallet(); }, []);

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
    } catch (err) { console.error(err); }
  };

  const connectWallet = async (type) => {
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

  const switchNetwork = async (net) => {
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: NETWORKS[net].chainId }]
      });
      setChain(net);
      setShowNetwork(false);
    } catch (err) {
      if (err.code === 4902) {
        alert('Please add this network to your wallet first');
      }
    }
  };

  const mintWithPayment = async () => {
    if (!wallet) { setShowWallet(true); return; }
    if (!media) { alert('Upload image first!'); return; }
    try {
      setTxStatus('pending');
      const net = NETWORKS[chain];
      const value = '0x' + BigInt(Math.floor(parseFloat(net.fee) * 1e18)).toString(16);
      const tx = await provider.request({
        method: 'eth_sendTransaction',
        params: [{ from: wallet, to: TREASURY, value, gas: '0x5208' }]
      });
      setTxStatus('success');
      alert('✅ Payment successful! Downloading card...');
      setTimeout(downloadCard, 1000);
    } catch (err) {
      setTxStatus('failed');
      if (err.code === 4001) {
        alert('❌ Transaction cancelled');
      } else if (err.message?.includes('insufficient')) {
        alert(`💰 Insufficient funds. Need ${NETWORKS[chain].fee} ${NETWORKS[chain].symbol}`);
      } else {
        alert('❌ Transaction failed: ' + err.message);
      }
    }
  };

  const handleMediaUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setMedia(ev.target.result);
      setMediaType(file.type.startsWith('image/') ? 'image' : 'video');
    };
    reader.readAsDataURL(file);
  };

  const convertToGif = async () => {
    if (!media || mediaType !== 'image') return;
    setIsConverting(true);
    setTimeout(() => {
      alert('GIF conversion ready! Use gif.js library for production.');
      setMediaType('gif');
      setIsConverting(false);
    }, 1000);
  };

  const randomizeStats = () => {
    setStats({
      attack: Math.floor(Math.random() * 100),
      defense: Math.floor(Math.random() * 100),
      speed: Math.floor(Math.random() * 100),
      magic: Math.floor(Math.random() * 100)
    });
  };

  const downloadMetadata = () => {
    const metadata = {
      name,
      description: `${rarity} NFT on ${NETWORKS[chain].name}`,
      image: media || "ipfs://...",
      attributes: [
        { trait_type: 'Rarity', value: rarity },
        { trait_type: 'Chain', value: NETWORKS[chain].name },
        { trait_type: 'Attack', value: stats.attack },
        { trait_type: 'Defense', value: stats.defense },
        { trait_type: 'Speed', value: stats.speed },
        { trait_type: 'Magic', value: stats.magic }
      ]
    };
    const blob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nft-metadata.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 600;
    const gradient = ctx.createLinearGradient(0, 0, 0, 600);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 600);
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.shadowBlur = 20;
    ctx.shadowColor = color;
    ctx.strokeRect(10, 10, 380, 580);
    if (media && (mediaType === 'image' || mediaType === 'gif')) {
      const img = new window.Image();
      img.onload = () => {
        ctx.drawImage(img, 30, 30, 340, 340);
        drawText();
      };
      img.src = media;
    } else {
      drawText();
    }
    function drawText() {
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(name, 200, 410);
      ctx.font = '16px Arial';
      ctx.fillStyle = color;
      ctx.fillText(rarity, 200, 440);
      ctx.font = '14px Arial';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`⚔️${stats.attack} 🛡️${stats.defense}`, 200, 480);
      ctx.fillText(`⚡${stats.speed} ✨${stats.magic}`, 200, 505);
      ctx.fillText(`${NETWORKS[chain].name}`, 200, 560);
      const link = document.createElement('a');
      link.download = 'nft-card.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const net = NETWORKS[chain];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-3">
      {/* Wallet Connect Modal */}
      {showWallet && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 transition-all">
          <div className="bg-[#181828] border-2 border-cyan-500 rounded-2xl p-8 max-w-xs w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-cyan-400" />
                Connect Wallet
              </h2>
              <button onClick={() => setShowWallet(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <button onClick={() => connectWallet('metamask')} className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                🦊 MetaMask
              </button>
              <button onClick={() => connectWallet('trust')} className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                💙 Trust Wallet
              </button>
              <button onClick={() => connectWallet('coinbase')} className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                🔷 Coinbase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Network Selector Modal */}
      {showNetwork && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 transition-all">
          <div className="bg-[#181828] border-2 border-purple-500 rounded-2xl p-8 max-w-xs w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Network className="w-5 h-5 text-purple-400" />
                Select Network
              </h2>
              <button onClick={() => setShowNetwork(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {Object.entries(NETWORKS).map(([key, n]) => (
                <button
                  key={key}
                  onClick={() => switchNetwork(key)}
                  className="w-full text-white font-bold py-3 rounded-lg flex items-center justify-between"
                  style={{ background: n.color }}
                >
                  <span>{n.name}</span>
                  <span className="text-xs opacity-80">{n.fee} {n.symbol}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center justify-center md:justify-start gap-2">
              <Sparkles className="w-6 h-6 text-cyan-400" />
              NFT Card Generator
            </h1>
            <p className="text-gray-400 text-xs">Multi-chain • {net.fee} {net.symbol}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowNetwork(true)}
              className="px-3 py-1.5 rounded-lg font-bold text-white flex items-center gap-1 text-xs"
              style={{ background: net.color }}
            >
              <Network className="w-3 h-3" />
              {net.name}
            </button>
            {wallet ? (
              <div className="bg-black/50 rounded-lg px-3 py-1.5 border border-green-500/50">
                <span className="text-white text-xs">{wallet.substring(0, 6)}...{wallet.substring(38)}</span>
              </div>
            ) : (
              <button
                onClick={() => setShowWallet(true)}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 text-xs"
              >
                <Wallet className="w-3 h-3" />
                Connect
              </button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Controls */}
          <div className="space-y-3">
            {/* Upload */}
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2 text-sm">
                <Upload className="w-4 h-4" />
                Media
              </h3>
              <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleMediaUpload} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-2 rounded-lg hover:from-cyan-600 hover:to-blue-600 text-sm font-semibold flex items-center justify-center gap-2">
                <Camera className="w-4 h-4" />
                Choose File
              </button>
              {media && mediaType === 'image' && (
                <button onClick={convertToGif} disabled={isConverting} className="w-full mt-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 text-xs font-semibold flex items-center justify-center gap-1 disabled:opacity-50">
                  <Film className="w-3 h-3" />
                  {isConverting ? 'Converting...' : 'Convert to GIF'}
                </button>
              )}
            </div>

            {/* Details */}
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <h3 className="text-white font-semibold mb-2 text-sm">Details</h3>
              <div className="space-y-2">
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-700 text-white px-2 py-1.5 rounded border border-gray-600 focus:border-cyan-500 focus:outline-none text-xs" placeholder="Name" />
                <div className="grid grid-cols-2 gap-2">
                  <select value={rarity} onChange={(e) => setRarity(e.target.value)} className="w-full bg-gray-700 text-white px-2 py-1.5 rounded border border-gray-600 text-xs">
                    <option>Common</option>
                    <option>Rare</option>
                    <option>Epic</option>
                    <option>Legendary</option>
                    <option>Mythic</option>
                  </select>
                  <div className="flex items-center gap-1">
                    <Palette className="w-3 h-3 text-gray-400" />
                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="flex-1 h-7 bg-gray-700 rounded border border-gray-600 cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold text-sm">Stats</h3>
                <button onClick={randomizeStats} className="text-cyan-400 hover:text-cyan-300 text-xs flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Random
                </button>
              </div>
              <div className="space-y-1.5">
                {Object.entries(stats).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-gray-400 capitalize">{key}</span>
                      <span className="text-white">{value}</span>
                    </div>
                    <input type="range" min="0" max="100" value={value} onChange={(e) => setStats({ ...stats, [key]: parseInt(e.target.value) })} className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer" style={{ accentColor: color }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Payment & Download */}
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
              <h3 className="text-white font-semibold mb-2 text-sm flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Mint & Download
              </h3>
              
              {txStatus === 'success' && (
                <div className="mb-2 p-2 bg-green-500/20 border border-green-500 rounded-lg">
                  <div className="flex items-center gap-2 text-green-400 text-xs">
                    <Check className="w-3 h-3" />
                    <span>Payment successful!</span>
                  </div>
                </div>
              )}

              {txStatus === 'failed' && (
                <div className="mb-2 p-2 bg-red-500/20 border border-red-500 rounded-lg">
                  <div className="flex items-center gap-2 text-red-400 text-xs">
                    <X className="w-3 h-3" />
                    <span>Payment failed</span>
                  </div>
                </div>
              )}

              <button
                onClick={mintWithPayment}
                disabled={txStatus === 'pending'}
                className={`w-full text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 text-sm mb-2 ${txStatus === 'pending' ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'}`}
              >
                {txStatus === 'pending' ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4" />
                    Pay {net.fee} {net.symbol}
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button onClick={downloadCard} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-2 rounded-lg hover:from-blue-600 hover:to-indigo-600 text-xs font-semibold flex items-center justify-center gap-1">
                  <Download className="w-3 h-3" />
                  Card
                </button>
                <button onClick={downloadMetadata} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 text-xs font-semibold flex items-center justify-center gap-1">
                  <Download className="w-3 h-3" />
                  JSON
                </button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h3 className="text-white font-semibold mb-3 text-sm">Preview</h3>
            <div className="relative rounded-lg overflow-hidden" style={{ background: `linear-gradient(135deg, ${color}40, #1a1a2e)`, border: `2px solid ${color}`, boxShadow: `0 0 20px ${color}40` }}>
              <div className="aspect-square bg-gray-900/50 flex items-center justify-center">
                {media ? (
                  (mediaType === 'image' || mediaType === 'gif') ? (
                    <img src={media} alt="NFT" className="w-full h-full object-cover" />
                  ) : mediaType === 'video' ? (
                    <video src={media} className="w-full h-full object-cover" controls />
                  ) : null
                ) : (
                  <Camera className="w-16 h-16 text-gray-600" />
                )}
              </div>
              <div className="p-3 bg-gradient-to-t from-black/80 to-transparent">
                <h2 className="text-white text-lg font-bold mb-0.5">{name}</h2>
                <p className="text-xs mb-2" style={{ color }}>
                  {rarity} • {net.name}
                </p>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <div className="bg-black/40 rounded px-2 py-1.5">
                    <span className="text-gray-400">⚔️:</span>
                    <span className="text-white ml-1 font-semibold">{stats.attack}</span>
                  </div>
                  <div className="bg-black/40 rounded px-2 py-1.5">
                    <span className="text-gray-400">🛡️:</span>
                    <span className="text-white ml-1 font-semibold">{stats.defense}</span>
                  </div>
                  <div className="bg-black/40 rounded px-2 py-1.5">
                    <span className="text-gray-400">⚡:</span>
                    <span className="text-white ml-1 font-semibold">{stats.speed}</span>
                  </div>
                  <div className="bg-black/40 rounded px-2 py-1.5">
                    <span className="text-gray-400">✨:</span>
                    <span className="text-white ml-1 font-semibold">{stats.magic}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default NFTCardGenerator;
