import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Sparkles, Zap, Camera, Palette, Wallet, X, Check, Network, Lock, Unlock, LayoutDashboard, CreditCard } from 'lucide-react';

const NETWORKS = {
  eth: { name: 'Ethereum', chainId: '0x1', symbol: 'ETH', fee: '0.001', color: '#627EEA' },
  bsc: { name: 'BSC', chainId: '0x38', symbol: 'BNB', fee: '0.003', color: '#F3BA2F' },
  polygon: { name: 'Polygon', chainId: '0x89', symbol: 'MATIC', fee: '1.0', color: '#8247E5' },
  base: { name: 'Base', chainId: '0x2105', symbol: 'ETH', fee: '0.0005', color: '#0052FF' }
};
const TREASURY = '0x802ef4dd42d736ef4eff0a32a6dcceae151b765d';

export default function NFTCardGenerator() {
  const [media, setMedia] = useState(null);
  const [name, setName] = useState('Epic NFT');
  const [rarity, setRarity] = useState('Legendary');
  const [stats, setStats] = useState({ attack: 85, defense: 70, speed: 90, magic: 75 });
  const [chain, setChain] = useState('base');
  const [color, setColor] = useState('#00ffff');
  const [resolution, setResolution] = useState({ width: 1080, height: 1350 });
  const [wallet, setWallet] = useState(null);
  const [provider, setProvider] = useState(null);
  const [showWallet, setShowWallet] = useState(false);
  const [showNetwork, setShowNetwork] = useState(false);
  const [txStatus, setTxStatus] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const fileInputRef = useRef();
  const canvasRef = useRef();

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

  const connectWallet = async () => {
    try {
      const p = window.ethereum;
      if (!p) {
        alert('Please install MetaMask!');
        return;
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
      if (err.code === 4902) alert('Please add this network to your wallet');
    }
  };

  const mintWithPayment = async () => {
    if (!wallet) {
      setShowWallet(true);
      return;
    }
    if (!media) {
      alert('⚠️ Upload an image first!');
      return;
    }
    try {
      setTxStatus('pending');
      const net = NETWORKS[chain];
      const value = '0x' + BigInt(Math.floor(parseFloat(net.fee) * 1e18)).toString(16);
      const tx = await provider.request({
        method: 'eth_sendTransaction',
        params: [{ from: wallet, to: TREASURY, value, gas: '0x5208' }]
      });
      setTxHash(tx);
      setTxStatus('success');
      setIsPaid(true);
      alert(`✅ Payment successful!\nTx: ${tx}\n\nDownloads unlocked!`);
    } catch (err) {
      setTxStatus('failed');
      setTimeout(() => setTxStatus(null), 3000);
      if (err.code === 4001) {
        alert('❌ Transaction cancelled');
      } else if (err.message?.includes('insufficient')) {
        alert(`💰 Need ${NETWORKS[chain].fee} ${NETWORKS[chain].symbol}`);
      } else {
        alert('❌ Transaction failed: ' + err.message);
      }
    }
  };

  const handleMediaUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('File too large! Max 10MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setMedia(ev.target.result);
    };
    reader.readAsDataURL(file);
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
    if (!isPaid) {
      alert('🔒 Pay to unlock downloads!');
      return;
    }
    const metadata = {
      name,
      description: `${rarity} NFT on ${NETWORKS[chain].name}`,
      image: media || "ipfs://",
      attributes: [
        { trait_type: 'Rarity', value: rarity },
        { trait_type: 'Chain', value: NETWORKS[chain].name },
        { trait_type: 'Attack', value: stats.attack },
        { trait_type: 'Defense', value: stats.defense },
        { trait_type: 'Speed', value: stats.speed },
        { trait_type: 'Magic', value: stats.magic }
      ],
      transaction: txHash
    };
    const blob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name.replace(/\s+/g, '_')}_metadata.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCard = () => {
    if (!isPaid) {
      alert('🔒 Pay to unlock downloads!');
      return;
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height } = resolution;
    canvas.width = width;
    canvas.height = height;
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = color;
    ctx.lineWidth = width * 0.015;
    ctx.shadowBlur = 30;
    ctx.shadowColor = color;
    ctx.strokeRect(ctx.lineWidth/2, ctx.lineWidth/2, width - ctx.lineWidth, height - ctx.lineWidth);
    ctx.shadowBlur = 0;
    const imgY = height * 0.08;
    const imgHeight = height * 0.55;
    if (media) {
      const img = new Image();
      img.onload = () => {
        ctx.save();
        const imgX = width * 0.08;
        const imgWidth = width * 0.84;
        ctx.beginPath();
        ctx.roundRect(imgX, imgY, imgWidth, imgHeight, width * 0.03);
        ctx.clip();
        const scale = Math.max(imgWidth / img.width, imgHeight / img.height);
        const x = imgX + (imgWidth - img.width * scale) / 2;
        const y = imgY + (imgHeight - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        ctx.restore();
        drawText();
      };
      img.src = media;
    } else {
      drawText();
    }
    function drawText() {
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.font = `bold ${width * 0.06}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(name, width / 2, height * 0.70);
      ctx.font = `${width * 0.04}px Arial`;
      ctx.fillStyle = color;
      ctx.fillText(rarity, width / 2, height * 0.76);
      ctx.shadowBlur = 0;
      const statsY = height * 0.80;
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(width * 0.08, statsY, width * 0.84, height * 0.10);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(width * 0.08, statsY, width * 0.84, height * 0.10);
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${width * 0.035}px Arial`;
      ctx.textAlign = 'left';
      ctx.fillText(`⚔️ ${stats.attack}`, width * 0.12, statsY + height * 0.035);
      ctx.fillText(`🛡️ ${stats.defense}`, width * 0.55, statsY + height * 0.035);
      ctx.fillText(`⚡ ${stats.speed}`, width * 0.12, statsY + height * 0.07);
      ctx.fillText(`✨ ${stats.magic}`, width * 0.55, statsY + height * 0.07);
      ctx.font = `${width * 0.025}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillStyle = color;
      ctx.fillText(`${NETWORKS[chain].name} • ${resolution.width}×${resolution.height}`, width / 2, height * 0.95);
      const link = document.createElement('a');
      link.download = `${name.replace(/\s+/g, '_')}_${resolution.width}x${resolution.height}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const net = NETWORKS[chain];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-cyan-400" />
            NFT Card Generator
          </h1>
          <div className="flex gap-2">
            <button onClick={() => setShowNetwork(true)} className="px-4 py-2 rounded-lg text-white font-bold" style={{ background: net.color }}>
              {net.name}
            </button>
            {wallet ? (
              <div className="bg-green-900 px-4 py-2 rounded-lg border-2 border-green-500">
                <span className="text-white text-sm">{wallet.slice(0,6)}...{wallet.slice(-4)}</span>
              </div>
            ) : (
              <button onClick={() => setShowWallet(true)} className="bg-cyan-500 px-4 py-2 rounded-lg text-white font-bold">
                Connect
              </button>
            )}
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-xl p-4 border-2 border-gray-700">
              <h3 className="text-white font-bold mb-3">Resolution</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { w: 1080, h: 1350, label: 'Instagram' },
                  { w: 1200, h: 1500, label: 'HD' },
                  { w: 800, h: 1000, label: 'Standard' },
                  { w: 600, h: 750, label: 'Mobile' }
                ].map(res => (
                  <button key={res.w} onClick={() => setResolution({ width: res.w, height: res.h })} className={`py-2 rounded-lg font-bold ${resolution.width === res.w ? 'bg-cyan-500 text-white' : 'bg-gray-700 text-gray-300'}`}>
                    {res.label}<br/><span className="text-xs">{res.w}×{res.h}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 border-2 border-gray-700">
              <h3 className="text-white font-bold mb-3">Upload Image</h3>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleMediaUpload} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="w-full bg-cyan-500 text-white py-3 rounded-lg font-bold">
                <Camera className="w-5 h-5 inline mr-2" />
                Choose File
              </button>
              {media && (
                <div className="mt-2 p-2 bg-green-900 border border-green-500 rounded text-green-400 text-sm">
                  <Check className="w-4 h-4 inline mr-1" />
                  Image uploaded!
                </div>
              )}
            </div>
            <div className="bg-gray-800 rounded-xl p-4 border-2 border-gray-700">
              <h3 className="text-white font-bold mb-3">Details</h3>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg mb-3" placeholder="NFT Name" />
              <div className="grid grid-cols-2 gap-3">
                <select value={rarity} onChange={(e) => setRarity(e.target.value)} className="bg-gray-700 text-white px-3 py-2 rounded-lg">
                  <option>Common</option>
                  <option>Rare</option>
                  <option>Epic</option>
                  <option>Legendary</option>
                  <option>Mythic</option>
                </select>
                <div className="flex items-center gap-2 bg-gray-700 px-3 rounded-lg">
                  <Palette className="w-4 h-4 text-gray-400" />
                  <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="flex-1" />
                </div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 border-2 border-gray-700">
              <div className="flex justify-between mb-3">
                <h3 className="text-white font-bold">Stats</h3>
                <button onClick={randomizeStats} className="text-cyan-400 text-sm">
                  <Zap className="w-4 h-4 inline" /> Random
                </button>
              </div>
              {Object.entries(stats).map(([key, value]) => (
                <div key={key} className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300 capitalize">{key}</span>
                    <span className="text-white font-bold">{value}</span>
                  </div>
                  <input type="range" min="0" max="100" value={value} onChange={(e) => setStats({ ...stats, [key]: parseInt(e.target.value) })} className="w-full" style={{ accentColor: color }} />
                </div>
              ))}
            </div>
            <div className="bg-gray-800 rounded-xl p-4 border-2 border-gray-700">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                {isPaid ? <Unlock className="w-5 h-5 text-green-400" /> : <Lock className="w-5 h-5 text-red-400" />}
                {isPaid ? 'Unlocked' : 'Locked'}
              </h3>
              {txStatus === 'success' && (
                <div className="mb-3 p-2 bg-green-900 border border-green-500 rounded text-green-400 text-sm break-all">
                  <Check className="w-4 h-4 inline" /> {txHash?.slice(0,20)}...
                </div>
              )}
              {!isPaid && (
                <button onClick={mintWithPayment} disabled={txStatus === 'pending'} className={`w-full py-3 rounded-lg font-bold mb-3 ${txStatus === 'pending' ? 'bg-gray-600' : 'bg-green-500'} text-white`}>
                  {txStatus === 'pending' ? 'Processing...' : `Pay ${net.fee} ${net.symbol}`}
                </button>
              )}
              <div className="grid grid-cols-2 gap-2">
                <button onClick={downloadCard} disabled={!isPaid} className={`py-3 rounded-lg font-bold ${isPaid ? 'bg-blue-500' : 'bg-gray-600'} text-white`}>
                  {isPaid ? <Download className="w-4 h-4 inline" /> : <Lock className="w-4 h-4 inline" />} PNG
                </button>
                <button onClick={downloadMetadata} disabled={!isPaid} className={`py-3 rounded-lg font-bold ${isPaid ? 'bg-purple-500' : 'bg-gray-600'} text-white`}>
                  {isPaid ? <Download className="w-4 h-4 inline" /> : <Lock className="w-4 h-4 inline" />} JSON
                </button>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 border-2 border-gray-700">
            <h3 className="text-white font-bold mb-4">Preview</h3>
            <div className="rounded-xl overflow-hidden" style={{ border: `3px solid ${color}`, boxShadow: `0 0 30px ${color}60` }}>
              <div className="aspect-[4/5] bg-gray-900 flex items-center justify-center">
                {media ? (
                  <img src={media} alt="NFT" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-16 h-16 text-gray-600" />
                )}
              </div>
              <div className="p-4 bg-gradient-to-t from-black to-transparent">
                <h2 className="text-white text-xl font-bold">{name}</h2>
                <p className="text-sm mb-2" style={{ color }}>{rarity} • {net.name}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
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
