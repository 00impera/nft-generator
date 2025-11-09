import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Sparkles, Film, Zap, Camera, Palette, Wallet, X, Check, Network, Lock, Unlock, LayoutDashboard, CreditCard } from 'lucide-react';

const THIRDWEB_CLIENT_ID = '821819db832d1a313ae3b1a62fbeafb7';

const NETWORKS = {
  eth: { name: 'Ethereum', chainId: '0x1', symbol: 'ETH', fee: '0.001', color: '#627EEA', explorer: 'https://etherscan.io/tx/' },
  bsc: { name: 'BSC', chainId: '0x38', symbol: 'BNB', fee: '0.003', color: '#F3BA2F', explorer: 'https://bscscan.com/tx/' },
  polygon: { name: 'Polygon', chainId: '0x89', symbol: 'MATIC', fee: '1.0', color: '#8247E5', explorer: 'https://polygonscan.com/tx/' },
  base: { name: 'Base', chainId: '0x2105', symbol: 'ETH', fee: '0.0005', color: '#0052FF', explorer: 'https://basescan.org/tx/' }
};

const TREASURY = '0x802ef4dd42d736ef4eff0a32a6dcceae151b765d';

export default function NFTCardGenerator() {
  const [media, setMedia] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [name, setName] = useState('Epic NFT');
  const [rarity, setRarity] = useState('Legendary');
  const [stats, setStats] = useState({ attack: 85, defense: 70, speed: 90, magic: 75 });
  const [chain, setChain] = useState('base');
  const [color, setColor] = useState('#00ffff');
  const [resolution, setResolution] = useState('1024');
  const [wallet, setWallet] = useState(null);
  const [provider, setProvider] = useState(null);
  const [showWallet, setShowWallet] = useState(false);
  const [showNetwork, setShowNetwork] = useState(false);
  const [txStatus, setTxStatus] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [savedCards, setSavedCards] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [showThirdwebPay, setShowThirdwebPay] = useState(false);
  const [lastTxHash, setLastTxHash] = useState(null);
  const fileInputRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    checkWallet();
    loadSavedCards();
  }, []);

  const loadSavedCards = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('nftCards') || '[]');
      setSavedCards(saved);
    } catch (err) {
      console.error('Failed to load cards:', err);
    }
  };

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
    setShowThirdwebPay(true);
  };

  const handlePaymentSuccess = (txHash) => {
    setTxStatus('success');
    setIsPaid(true);
    setShowThirdwebPay(false);
    setLastTxHash(txHash);
    const cardData = {
      id: Date.now(),
      name,
      rarity,
      stats,
      chain,
      color,
      media,
      mediaType,
      wallet,
      txHash,
      timestamp: new Date().toISOString(),
      paid: true,
      paymentMethod: 'thirdweb'
    };
    const updated = [...savedCards, cardData];
    setSavedCards(updated);
    localStorage.setItem('nftCards', JSON.stringify(updated));
    const explorerUrl = NETWORKS[chain].explorer + txHash;
    alert(`✅ Payment successful!\n\nTransaction: ${txHash.slice(0, 10)}...${txHash.slice(-8)}\n\nView on explorer: ${explorerUrl}\n\nDownloads unlocked!`);
  };

  const handlePaymentError = (error) => {
    setTxStatus('failed');
    setTimeout(() => setTxStatus(null), 3000);
    alert('❌ Payment failed: ' + error.message);
  };

  const processThirdwebPayment = async () => {
    if (!provider || !wallet) {
      alert('Please connect wallet first!');
      return;
    }
    try {
      setTxStatus('pending');
      const net = NETWORKS[chain];
      const value = '0x' + BigInt(Math.floor(parseFloat(net.fee) * 1e18)).toString(16);
      const tx = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: wallet,
          to: TREASURY,
          value: value,
          gas: '0x5208'
        }]
      });
      handlePaymentSuccess(tx);
    } catch (err) {
      handlePaymentError(err);
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
      alert('🔒 Please complete payment first to unlock downloads!');
      setShowThirdwebPay(true);
      return;
    }
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
    if (!isPaid) {
      alert('🔒 Please complete payment first to unlock downloads!');
      setShowThirdwebPay(true);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = parseInt(resolution);
    const ratio = size / 400;
    canvas.width = size;
    canvas.height = size * 1.5;
    const gradient = ctx.createLinearGradient(0, 0, 0, size * 1.5);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size * 1.5);
    ctx.strokeStyle = color;
    ctx.lineWidth = 4 * ratio;
    ctx.shadowBlur = 20 * ratio;
    ctx.shadowColor = color;
    ctx.strokeRect(10 * ratio, 10 * ratio, size - 20 * ratio, size * 1.5 - 20 * ratio);
    if (media && (mediaType === 'image' || mediaType === 'gif')) {
      const img = new window.Image();
      img.onload = () => {
        ctx.drawImage(img, 30 * ratio, 30 * ratio, 340 * ratio, 340 * ratio);
        drawText();
      };
      img.src = media;
    } else {
      drawText();
    }
    function drawText() {
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${28 * ratio}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(name, size / 2, 410 * ratio);
      ctx.font = `${16 * ratio}px Arial`;
      ctx.fillStyle = color;
      ctx.fillText(rarity, size / 2, 440 * ratio);
      ctx.font = `${14 * ratio}px Arial`;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`⚔️${stats.attack} 🛡️${stats.defense}`, size / 2, 480 * ratio);
      ctx.fillText(`⚡${stats.speed} ✨${stats.magic}`, size / 2, 505 * ratio);
      ctx.fillText(`${NETWORKS[chain].name}`, size / 2, 560 * ratio);
      const link = document.createElement('a');
      link.download = 'nft-card.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const net = NETWORKS[chain];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-3">
      {/* Add your modals, header, controls, preview, and dashboard here */}
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-cyan-400" />
          NFT Card Generator
        </h1>
        {/* ...rest of your UI (upload, controls, preview, dashboard, etc.) */}
        {/* For brevity, you can expand this section with your full UI as needed */}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
