import React, { useState, useRef, useEffect } from 'react';
import { Download, Sparkles, Zap, Camera, Palette, Wallet, X, Check, Lock, Unlock } from 'lucide-react';

const NETWORKS = {
  base: { name: 'Base', chainId: '0x2105', symbol: 'ETH', fee: '0.0005', color: '#FFD700' }
};
const TREASURY = '0x802ef4dd42d736ef4eff0a32a6dcceae151b765d';

export default function NFTCardGenerator() {
  const [media, setMedia] = useState(null);
  const [name, setName] = useState('Epic NFT');
  const [rarity, setRarity] = useState('Legendary');
  const [stats, setStats] = useState({ attack: 85, defense: 70, speed: 90, magic: 75 });
  const [color, setColor] = useState('#FFD700');
  const [resolution, setResolution] = useState({ width: 1080, height: 1350 });
  const [wallet, setWallet] = useState(null);
  const [provider, setProvider] = useState(null);
  const [showWallet, setShowWallet] = useState(false);
  const [txStatus, setTxStatus] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const fileInputRef = useRef();
  const canvasRef = useRef();

  useEffect(() => { checkWallet(); }, []);

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
    } catch (err) { console.error(err); }
  };

  const connectWallet = async () => {
    try {
      const p = window.ethereum;
      if (!p) { alert('Please install MetaMask!'); return; }
      const accounts = await p.request({ method: 'eth_requestAccounts' });
      setWallet(accounts[0]);
      setProvider(p);
      setShowWallet(false);
    } catch (err) { alert('Connection failed: ' + err.message); }
  };

  const mintWithPayment = async () => {
    if (!wallet) { setShowWallet(true); return; }
    if (!media) { alert('⚠️ Upload an image first!'); return; }
    try {
      setTxStatus('pending');
      const net = NETWORKS.base;
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
      if (err.code === 4001) { alert('❌ Transaction cancelled'); }
      else if (err.message?.includes('insufficient')) { alert(`💰 Need 0.0005 ETH`); }
      else { alert('❌ Transaction failed: ' + err.message); }
    }
  };

  const handleMediaUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('File too large! Max 10MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { setMedia(ev.target.result); };
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
    if (!isPaid) { alert('🔒 Pay to unlock downloads!'); return; }
    const metadata = {
      name,
      description: `${rarity} NFT on Base`,
      image: media || "ipfs://",
      attributes: [
        { trait_type: 'Rarity', value: rarity },
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
    if (!isPaid) { alert('🔒 Pay to unlock downloads!'); return; }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height } = resolution;
    canvas.width = width;
    canvas.height = height;
    ctx.fillStyle = "#181818";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = color;
    ctx.lineWidth = width * 0.02;
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
    } else { drawText(); }
    function drawText() {
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.font = `bold ${width * 0.06}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(name, width / 2, height * 0.70);
      ctx.font = `${width * 0.04}px Arial`;
      ctx.fillStyle = "#fff";
      ctx.fillText(rarity, width / 2, height * 0.76);
      ctx.shadowBlur = 0;
      const statsY = height * 0.80;
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(width * 0.08, statsY, width * 0.84, height * 0.10);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(width * 0.08, statsY, width * 0.84, height * 0.10);
      ctx.fillStyle = color;
      ctx.font = `bold ${width * 0.035}px Arial`;
      ctx.textAlign = 'left';
      ctx.fillText(`⚔️ ${stats.attack}`, width * 0.12, statsY + height * 0.035);
      ctx.fillText(`🛡️ ${stats.defense}`, width * 0.55, statsY + height * 0.035);
      ctx.fillText(`⚡ ${stats.speed}`, width * 0.12, statsY + height * 0.07);
      ctx.fillText(`✨ ${stats.magic}`, width * 0.55, statsY + height * 0.07);
      ctx.font = `${width * 0.025}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillStyle = color;
      ctx.fillText(`Base • ${resolution.width}×${resolution.height}`, width / 2, height * 0.95);
      const link = document.createElement('a');
      link.download = `${name.replace(/\s+/g, '_')}_${resolution.width}x${resolution.height}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const net = NETWORKS.base;

  return (
    <div className="min-h-screen bg-[#111] p-4">
      {showWallet && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-[#181818] border-2 border-yellow-400 rounded-xl p-6 max-w-sm w-full">
            <div className="flex justify-between mb-4">
              <h2 className="text-yellow-400 font-bold">Connect MetaMask</h2>
              <button onClick={() => setShowWallet(false)} className="text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <button onClick={connectWallet} className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold py-3 rounded-lg">
              🦊 MetaMask
            </button>
          </div>
        </div>
      )}
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-yellow-400 flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-yellow-400" />
            NFT Card Generator
          </h1>
          <div className="flex gap-2">
            <div className="bg-black px-4 py-2 rounded-lg border-2 border-yellow-400">
              <span className="text-yellow-400 text-sm">{TREASURY.slice(0,6)}...{TREASURY.slice(-4)}</span>
            </div>
            {wallet ? (
              <div className="bg-black px-4 py-2 rounded-lg border-2 border-green-500">
                <span className="text-green-400 text-sm">{wallet.slice(0,6)}...{wallet.slice(-4)}</span>
              </div>
            ) : (
              <button onClick={() => setShowWallet(true)} className="bg-yellow-400 px-4 py-2 rounded-lg text-black font-bold">
                Connect MetaMask
              </button>
            )}
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-[#181818] rounded-xl p-4 border-2 border-yellow-400">
              <h3 className="text-yellow-400 font-bold mb-3">Resolution</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { w: 1080, h: 1350, label: 'Instagram' },
                  { w: 1200, h: 1500, label: 'HD' },
                  { w: 800, h: 1000, label: 'Standard' },
                  { w: 600, h: 750, label: 'Mobile' }
                ].map(res => (
                  <button key={res.w} onClick={() => setResolution({ width: res.w, height: res.h })} className={`py-2 rounded-lg font-bold ${resolution.width === res.w ? 'bg-yellow-400 text-black' : 'bg-black text-yellow-400'}`}>
                    {res.label}<br/><span className="text-xs">{res.w}×{res.h}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-[#181818] rounded-xl p-4 border-2 border-yellow-400">
              <h3 className="text-yellow-400 font-bold mb-3">Upload Image</h3>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleMediaUpload} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="w-full bg-yellow-400 text-black py-3 rounded-lg font-bold">
                <Camera className="w-5 h-5 inline mr-2" />
                Choose File
              </button>
              {media && (
                <div className="mt-2 p-2 bg-black border border-green-500 rounded text-green-400 text-sm">
                  <Check className="w-4 h-4 inline mr-1" />
                  Image uploaded!
                </div>
              )}
            </div>
            <div className="bg-[#181818] rounded-xl p-4 border-2 border-yellow-400">
              <h3 className="text-yellow-400 font-bold mb-3">Details</h3>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black text-yellow-400 px-3 py-2 rounded-lg mb-3" placeholder="NFT Name" />
              <div className="grid grid-cols-2 gap-3">
                <select value={rarity} onChange={(e) => setRarity(e.target.value)} className="bg-black text-yellow-400 px-3 py-2 rounded-lg">
                  <option>Common</option>
                  <option>Rare</option>
                  <option>Epic</option>
                  <option>Legendary</option>
                  <option>Mythic</option>
                </select>
                <div className="flex items-center gap-2 bg-black px-3 rounded-lg">
                  <Palette className="w-4 h-4 text-yellow-400" />
                  <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="flex-1" />
                </div>
              </div>
            </div>
            <div className="bg-[#181818] rounded-xl p-4 border-2 border-yellow-400">
              <div className="flex justify-between mb-3">
                <h3 className="text-yellow-400 font-bold">Stats</h3>
                <button onClick={randomizeStats} className="text-yellow-400 text-sm">
                  <Zap className="w-4 h-4 inline" /> Random
                </button>
              </div>
              {Object.entries(stats).map(([key, value]) => (
                <div key={key} className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-yellow-400 capitalize">{key}</span>
                    <span className="text-yellow-400 font-bold">{value}</span>
                  </div>
                  <input type="range" min="0" max="100" value={value} onChange={(e) => setStats({ ...stats, [key]: parseInt(e.target.value) })} className="w-full" style={{ accentColor: color }} />
                </div>
              ))}
            </div>
            <div className="bg-[#181818] rounded-xl p-4 border-2 border-yellow-400">
              <h3 className="text-yellow-400 font-bold mb-3 flex items-center gap-2">
                {isPaid ? <Unlock className="w-5 h-5 text-green-400" /> : <Lock className="w-5 h-5 text-red-400" />}
                {isPaid ? 'Unlocked' : 'Locked'}
              </h3>
              {txStatus === 'success' && (
                <div className="mb-3 p-2 bg-black border border-green-500 rounded text-green-400 text-sm break-all">
                  <Check className="w-4 h-4 inline" /> {txHash?.slice(0,20)}...
                </div>
              )}
              {!isPaid && (
                <button onClick={mintWithPayment} disabled={txStatus === 'pending'} className={`w-full py-3 rounded-lg font-bold mb-3 ${txStatus === 'pending' ? 'bg-gray-600' : 'bg-yellow-400'} text-black`}>
                  {txStatus === 'pending' ? 'Processing...' : `Pay 0.0005 ETH`}
                </button>
              )}
              <div className="grid grid-cols-2 gap-2">
                <button onClick={downloadCard} disabled={!isPaid} className={`py-3 rounded-lg font-bold ${isPaid ? 'bg-yellow-400 text-black' : 'bg-gray-600 text-yellow-400'}`}>
                  {isPaid ? <Download className="w-4 h-4 inline" /> : <Lock className="w-4 h-4 inline" />} PNG
                </button>
                <button onClick={downloadMetadata} disabled={!isPaid} className={`py-3 rounded-lg font-bold ${isPaid ? 'bg-yellow-400 text-black' : 'bg-gray-600 text-yellow-400'}`}>
                  {isPaid ? <Download className="w-4 h-4 inline" /> : <Lock className="w-4 h-4 inline" />} JSON
                </button>
              </div>
            </div>
          </div>
          <div className="bg-[#181818] rounded-xl p-4 border-2 border-yellow-400">
            <h3 className="text-yellow-400 font-bold mb-4">Preview</h3>
            <div className="rounded-xl overflow-hidden" style={{ border: `3px solid ${color}`, boxShadow: `0 0 30px ${color}60` }}>
              <div className="aspect-[4/5] bg-black flex items-center justify-center">
                {media ? (
                  <img src={media} alt="NFT" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-16 h-16 text-yellow-400" />
                )}
              </div>
              <div className="p-4 bg-gradient-to-t from-black to-transparent">
                <h2 className="text-yellow-400 text-xl font-bold">{name}</h2>
                <p className="text-sm mb-2" style={{ color }}>{rarity} • Base</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-black/40 rounded px-2 py-1 text-yellow-400">⚔️ {stats.attack}</div>
                  <div className="bg-black/40 rounded px-2 py-1 text-yellow-400">🛡️ {stats.defense}</div>
                  <div className="bg-black/40 rounded px-2 py-1 text-yellow-400">⚡ {stats.speed}</div>
                  <div className="bg-black/40 rounded px-2 py-1 text-yellow-400">✨ {stats.magic}</div>
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
