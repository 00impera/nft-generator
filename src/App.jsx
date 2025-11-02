import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Zap, Sparkles, Wallet, Check, X, Network } from 'lucide-react';

const MYTHIC_COLORS = [
  { name: 'Electric Cyan', primary: '#00ffff', secondary: '#0088ff', glow: 'rgba(0,255,255,0.5)' },
  { name: 'Laser Gold', primary: '#ffd700', secondary: '#ff8800', glow: 'rgba(255,215,0,0.5)' },
  { name: 'Neon Pink', primary: '#ff00ff', secondary: '#ff0088', glow: 'rgba(255,0,255,0.5)' },
  { name: 'Void Black', primary: '#1a1a1a', secondary: '#000000', glow: 'rgba(128,0,255,0.5)' },
  { name: 'Plasma Purple', primary: '#8800ff', secondary: '#ff00ff', glow: 'rgba(136,0,255,0.5)' },
  { name: 'Toxic Green', primary: '#00ff00', secondary: '#88ff00', glow: 'rgba(0,255,0,0.5)' },
  { name: 'Solar Flare', primary: '#ffff00', secondary: '#ff6600', glow: 'rgba(255,255,0,0.5)' },
  { name: 'Arctic Blue', primary: '#00ffff', secondary: '#0088ff', glow: 'rgba(0,255,255,0.5)' },
  { name: 'Crimson Red', primary: '#ff0000', secondary: '#ff0088', glow: 'rgba(255,0,0,0.5)' },
  { name: 'Emerald Matrix', primary: '#00ff88', secondary: '#00ffff', glow: 'rgba(0,255,136,0.5)' },
  { name: 'Holographic Silver', primary: '#e0e0e0', secondary: '#00ffff', glow: 'rgba(224,224,224,0.5)' },
  { name: 'Quantum Violet', primary: '#8800ff', secondary: '#ff00ff', glow: 'rgba(136,0,255,0.5)' },
  { name: 'Phoenix Orange', primary: '#ff6600', secondary: '#ffff00', glow: 'rgba(255,102,0,0.5)' }
];

const NETWORKS = {
  ethereum: {
    name: 'Ethereum',
    chainId: '0x1',
    symbol: 'ETH',
    fee: '0.001',
    explorer: 'https://etherscan.io',
    rpc: 'https://mainnet.infura.io/v3/',
    color: '#627EEA'
  },
  bsc: {
    name: 'BNB Smart Chain',
    chainId: '0x38',
    symbol: 'BNB',
    fee: '0.003',
    explorer: 'https://bscscan.com',
    rpc: 'https://bsc-dataseed.binance.org/',
    color: '#F3BA2F'
  },
  polygon: {
    name: 'Polygon',
    chainId: '0x89',
    symbol: 'MATIC',
    fee: '1.0',
    explorer: 'https://polygonscan.com',
    rpc: 'https://polygon-rpc.com/',
    color: '#8247E5'
  },
  arbitrum: {
    name: 'Arbitrum One',
    chainId: '0xa4b1',
    symbol: 'ETH',
    fee: '0.0005',
    explorer: 'https://arbiscan.io',
    rpc: 'https://arb1.arbitrum.io/rpc',
    color: '#28A0F0'
  },
  optimism: {
    name: 'Optimism',
    chainId: '0xa',
    symbol: 'ETH',
    fee: '0.0008',
    explorer: 'https://optimistic.etherscan.io',
    rpc: 'https://mainnet.optimism.io',
    color: '#FF0420'
  },
  base: {
    name: 'Base',
    chainId: '0x2105',
    symbol: 'ETH',
    fee: '0.0005',
    explorer: 'https://basescan.org',
    rpc: 'https://mainnet.base.org',
    color: '#0052FF'
  },
  avalanche: {
    name: 'Avalanche',
    chainId: '0xa86a',
    symbol: 'AVAX',
    fee: '0.05',
    explorer: 'https://snowtrace.io',
    rpc: 'https://api.avax.network/ext/bc/C/rpc',
    color: '#E84142'
  }
};

const TREASURY_WALLET = '0x592B35c8917eD36c39Ef73D0F5e92B0173560b2e';

export default function NFTCardGenerator() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [currentColor, setCurrentColor] = useState(0);
  const [stats, setStats] = useState({
    attack: 85,
    defense: 70,
    speed: 90,
    magic: 75
  });
  const [edition, setEdition] = useState(Math.floor(Math.random() * 999) + 1);
  const [walletAddress, setWalletAddress] = useState(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showNetworkModal, setShowNetworkModal] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState('ethereum');
  const [currentNetwork, setCurrentNetwork] = useState(null);
  const [txStatus, setTxStatus] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [isInFrame, setIsInFrame] = useState(false);
  const [connectedProvider, setConnectedProvider] = useState(null);
  const [walletType, setWalletType] = useState(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    try {
      const inIframe = window.self !== window.top;
      const inFarcasterFrame = window.location.href.includes('frame') || 
                               window.location.href.includes('warpcast') ||
                               document.referrer.includes('warpcast');
      setIsInFrame(inIframe && inFarcasterFrame);
    } catch (e) {
      setIsInFrame(false);
    }
  }, []);

  useEffect(() => {
    drawCard();
  }, [uploadedImage, currentColor, stats, edition]);

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const checkIfWalletIsConnected = async () => {
    try {
      const providers = [];
      
      if (window.ethereum) providers.push({ provider: window.ethereum, type: 'ethereum' });
      if (window.trustwallet) providers.push({ provider: window.trustwallet, type: 'trust' });
      if (window.ethereum?.providers) {
        window.ethereum.providers.forEach(p => providers.push({ provider: p, type: 'multi' }));
      }
      
      for (const { provider, type } of providers) {
        try {
          const accounts = await provider.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setConnectedProvider(provider);
            setWalletType(type);
            
            // Get current network
            try {
              const chainId = await provider.request({ method: 'eth_chainId' });
              const network = Object.entries(NETWORKS).find(([key, net]) => net.chainId === chainId);
              if (network) {
                setCurrentNetwork(network[0]);
                setSelectedNetwork(network[0]);
              }
            } catch (err) {
              console.error('Error getting network:', err);
            }
            
            return;
          }
        } catch (err) {
          continue;
        }
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  };

  const switchNetwork = async (networkKey) => {
    if (!connectedProvider) {
      alert('Please connect your wallet first');
      return;
    }

    const network = NETWORKS[networkKey];
    
    try {
      await connectedProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainId }],
      });
      
      setCurrentNetwork(networkKey);
      setSelectedNetwork(networkKey);
      setShowNetworkModal(false);
      
    } catch (switchError) {
      // Network not added to wallet
      if (switchError.code === 4902) {
        try {
          await connectedProvider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: network.chainId,
              chainName: network.name,
              nativeCurrency: {
                name: network.symbol,
                symbol: network.symbol,
                decimals: 18
              },
              rpcUrls: [network.rpc],
              blockExplorerUrls: [network.explorer]
            }],
          });
          
          setCurrentNetwork(networkKey);
          setSelectedNetwork(networkKey);
          setShowNetworkModal(false);
          
        } catch (addError) {
          console.error('Error adding network:', addError);
          alert('Failed to add network. Please add it manually in your wallet.');
        }
      } else {
        console.error('Error switching network:', switchError);
        alert('Failed to switch network. Please try again.');
      }
    }
  };

  const connectMetaMask = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        let provider = window.ethereum;
        
        if (window.ethereum.providers?.length) {
          provider = window.ethereum.providers.find(p => p.isMetaMask) || window.ethereum.providers[0];
        }
        
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
        setConnectedProvider(provider);
        setWalletType('metamask');
        setShowWalletModal(false);
        
        // Get current network
        try {
          const chainId = await provider.request({ method: 'eth_chainId' });
          const network = Object.entries(NETWORKS).find(([key, net]) => net.chainId === chainId);
          if (network) {
            setCurrentNetwork(network[0]);
            setSelectedNetwork(network[0]);
          }
        } catch (err) {
          console.error('Error getting network:', err);
        }
        
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
        if (error.code === 4001) {
          alert('❌ Connection rejected by user');
        } else {
          alert('❌ Failed to connect to MetaMask');
        }
      }
    } else {
      const install = confirm('MetaMask is not installed. Would you like to install it now?');
      if (install) {
        window.open('https://metamask.io/download/', '_blank');
      }
    }
  };

  const connectWalletConnect = async () => {
    try {
      if (window.ethereum && window.ethereum.providers) {
        const provider = window.ethereum.providers.find(p => p.isWalletConnect);
        if (provider) {
          const accounts = await provider.request({ method: 'eth_requestAccounts' });
          setWalletAddress(accounts[0]);
          setConnectedProvider(provider);
          setWalletType('walletconnect');
          setShowWalletModal(false);
          return;
        }
      }
      
      if (typeof window.ethereum !== 'undefined' && window.ethereum.isWalletConnect) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
        setConnectedProvider(window.ethereum);
        setWalletType('walletconnect');
        setShowWalletModal(false);
        return;
      }

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        const dappUrl = window.location.href;
        const wcUrl = `https://metamask.app.link/dapp/${dappUrl.replace(/^https?:\/\//, '')}`;
        window.location.href = wcUrl;
      } else {
        alert('WalletConnect not detected. Please use MetaMask browser extension.');
      }
    } catch (error) {
      console.error('WalletConnect connection error:', error);
      alert('Failed to connect with WalletConnect. Please try MetaMask instead.');
    }
  };

  const connectCoinbase = async () => {
    try {
      if (window.ethereum && window.ethereum.providers) {
        const coinbaseProvider = window.ethereum.providers.find(p => p.isCoinbaseWallet);
        if (coinbaseProvider) {
          const accounts = await coinbaseProvider.request({ method: 'eth_requestAccounts' });
          setWalletAddress(accounts[0]);
          setConnectedProvider(coinbaseProvider);
          setWalletType('coinbase');
          setShowWalletModal(false);
          return;
        }
      }

      if (window.ethereum && window.ethereum.isCoinbaseWallet) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
        setConnectedProvider(window.ethereum);
        setWalletType('coinbase');
        setShowWalletModal(false);
        return;
      }

      if (window.coinbaseWalletExtension) {
        const accounts = await window.coinbaseWalletExtension.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
        setConnectedProvider(window.coinbaseWalletExtension);
        setWalletType('coinbase');
        setShowWalletModal(false);
        return;
      }

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        window.open('https://go.cb-w.com/dapp?cb_url=' + encodeURIComponent(window.location.href), '_blank');
      } else {
        const install = confirm('Coinbase Wallet is not installed. Would you like to install it now?');
        if (install) {
          window.open('https://www.coinbase.com/wallet/downloads', '_blank');
        }
      }
    } catch (error) {
      console.error('Coinbase Wallet connection error:', error);
      alert('Failed to connect with Coinbase Wallet.');
    }
  };

  const connectTrustWallet = async () => {
    try {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        const dappUrl = window.location.href;
        window.location.href = `https://link.trustwallet.com/open_url?coin_id=60&url=${encodeURIComponent(dappUrl)}`;
        return;
      }

      if (window.trustwallet) {
        const accounts = await window.trustwallet.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
        setConnectedProvider(window.trustwallet);
        setWalletType('trust');
        setShowWalletModal(false);
        return;
      }

      if (window.ethereum?.providers) {
        const trustProvider = window.ethereum.providers.find(p => p.isTrust || p.isTrustWallet);
        if (trustProvider) {
          const accounts = await trustProvider.request({ method: 'eth_requestAccounts' });
          setWalletAddress(accounts[0]);
          setConnectedProvider(trustProvider);
          setWalletType('trust');
          setShowWalletModal(false);
          return;
        }
      }

      if (window.ethereum && (window.ethereum.isTrust || window.ethereum.isTrustWallet)) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]);
        setConnectedProvider(window.ethereum);
        setWalletType('trust');
        setShowWalletModal(false);
        return;
      }

      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setWalletAddress(accounts[0]);
          setConnectedProvider(window.ethereum);
          setWalletType('generic');
          setShowWalletModal(false);
          return;
        } catch (err) {
          console.log('Generic ethereum provider failed:', err);
        }
      }

      const install = confirm('Trust Wallet not detected. Install now?');
      if (install) {
        window.open('https://trustwallet.com/browser-extension', '_blank');
      }
    } catch (error) {
      console.error('Trust Wallet connection error:', error);
      alert('Failed to connect with Trust Wallet.');
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setConnectedProvider(null);
    setWalletType(null);
    setCurrentNetwork(null);
    setTxStatus(null);
    setTxHash(null);
    console.log('Wallet disconnected');
  };

  const payMintFee = async () => {
    if (!walletAddress) {
      setShowWalletModal(true);
      return;
    }

    if (!uploadedImage) {
      alert('Please upload an image first!');
      return;
    }

    const network = NETWORKS[selectedNetwork];

    try {
      setTxStatus('pending');
      
      let provider = connectedProvider || window.ethereum;
      
      if (!provider) {
        if (window.ethereum) provider = window.ethereum;
        else if (window.trustwallet) provider = window.trustwallet;
        else if (window.coinbaseWalletExtension) provider = window.coinbaseWalletExtension;
      }
      
      if (!provider) {
        throw new Error('No wallet provider found. Please reconnect your wallet.');
      }

      const accounts = await provider.request({ method: 'eth_accounts' });
      
      if (!accounts || accounts.length === 0) {
        setTxStatus(null);
        setWalletAddress(null);
        setConnectedProvider(null);
        alert('⚠️ Wallet Disconnected\n\nPlease reconnect and try again.');
        setShowWalletModal(true);
        return;
      }

      // Switch to selected network if needed
      try {
        const chainId = await provider.request({ method: 'eth_chainId' });
        if (chainId !== network.chainId) {
          await switchNetwork(selectedNetwork);
          // Wait a bit for network to switch
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (switchError) {
        console.error('Chain switch error:', switchError);
        setTxStatus(null);
        return;
      }

      const weiValue = BigInt(Math.floor(parseFloat(network.fee) * 1e18));
      const hexValue = '0x' + weiValue.toString(16);
      
      console.log('Transaction details:', {
        network: network.name,
        from: accounts[0],
        to: TREASURY_WALLET,
        value: hexValue,
        valueInToken: network.fee + ' ' + network.symbol
      });

      let gasLimit = '0x5208';
      try {
        const estimatedGas = await provider.request({
          method: 'eth_estimateGas',
          params: [{
            from: accounts[0],
            to: TREASURY_WALLET,
            value: hexValue,
          }]
        });
        gasLimit = estimatedGas;
      } catch (gasError) {
        console.log('Gas estimation failed, using default:', gasError);
      }

      const txParams = {
        from: accounts[0],
        to: TREASURY_WALLET,
        value: hexValue,
        gas: gasLimit,
      };

      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });

      console.log('Transaction sent successfully:', txHash);
      setTxHash(txHash);
      setTxStatus('success');
      
      alert(`✅ Payment Successful on ${network.name}!\n\nYour NFT card will download automatically.\n\nTx: ${txHash.substring(0, 10)}...`);
      
      setTimeout(() => {
        downloadCard();
      }, 1000);

    } catch (error) {
      console.error('Payment error:', error);
      setTxStatus('failed');
      
      if (error.code === 4001) {
        alert('❌ Transaction Rejected\n\nYou cancelled the transaction.');
      } else if (error.code === -32603) {
        alert(`⚠️ Transaction Error\n\nPossible causes:\n• Insufficient ${network.symbol} balance\n• Network congestion\n• Gas price too low`);
      } else if (error.message?.includes('insufficient funds')) {
        alert(`💰 Insufficient Funds\n\nYou need at least ${network.fee} ${network.symbol} plus gas fees.\n\nPlease add more ${network.symbol} to your wallet.`);
      } else if (error.code === -32002) {
        alert('⏳ Request Pending\n\nPlease check your wallet for a pending request.');
      } else {
        alert('❌ Transaction Failed\n\n' + (error.message || 'Unknown error') + '\n\n💡 Try:\n• Check balance\n• Switch network\n• Refresh page\n• Reconnect wallet');
      }
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setUploadedImage(img);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const randomizeStats = () => {
    setStats({
      attack: Math.floor(Math.random() * 40) + 60,
      defense: Math.floor(Math.random() * 40) + 60,
      speed: Math.floor(Math.random() * 40) + 60,
      magic: Math.floor(Math.random() * 40) + 60
    });
  };

  const changeColor = () => {
    setCurrentColor((prev) => (prev + 1) % MYTHIC_COLORS.length);
  };

  const downloadCard = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `nft-card-${edition}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const drawCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const color = MYTHIC_COLORS[currentColor];

    ctx.clearRect(0, 0, 800, 1200);

    const bgGrad = ctx.createLinearGradient(0, 0, 800, 1200);
    bgGrad.addColorStop(0, '#0a0a0a');
    bgGrad.addColorStop(0.5, '#1a1a2e');
    bgGrad.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 800, 1200);

    const glowCount = 4;
    for (let i = 0; i < glowCount; i++) {
      const angle = (Date.now() / 2000 + (i * Math.PI * 2) / glowCount) % (Math.PI * 2);
      const x = 400 + Math.cos(angle) * 200;
      const y = 600 + Math.sin(angle) * 200;
      
      const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, 150);
      glowGrad.addColorStop(0, color.glow);
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
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
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
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
      ctx.drawImage(uploadedImage, 80 + offsetX, 180 + offsetY, drawWidth, drawHeight);
      ctx.restore();
    } else {
      ctx.fillStyle = color.primary;
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Upload Your Image', 400, 420);
    }

    ctx.shadowColor = color.primary;
    ctx.shadowBlur = 30;
    ctx.fillStyle = color.primary;
    ctx.font = 'bold 56px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`MYTHIC NFT #${edition.toString().padStart(3, '0')}`, 400, 130);

    const badgeY = 720;
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.9)';
    ctx.beginPath();
    ctx.roundRect(250, badgeY, 300, 70, 35);
    ctx.fill();

    const badgeGrad = ctx.createLinearGradient(250, badgeY, 550, badgeY);
    badgeGrad.addColorStop(0, color.primary);
    badgeGrad.addColorStop(1, color.secondary);
    ctx.strokeStyle = badgeGrad;
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.fillStyle = badgeGrad;
    ctx.font = 'bold 36px Arial';
    ctx.fillText(color.name.toUpperCase(), 400, badgeY + 48);

    const statConfigs = [
      { name: 'ATTACK', value: stats.attack, y: 840, label: 'ATK' },
      { name: 'DEFENSE', value: stats.defense, y: 920, label: 'DEF' },
      { name: 'SPEED', value: stats.speed, y: 1000, label: 'SPD' },
      { name: 'MAGIC', value: stats.magic, y: 1080, label: 'MAG' }
    ];

    statConfigs.forEach((stat) => {
      ctx.fillStyle = 'white';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(stat.label, 100, stat.y);

      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(200, stat.y - 25, 500, 35);

      const barGrad = ctx.createLinearGradient(200, stat.y - 25, 700, stat.y - 25);
      barGrad.addColorStop(0, color.primary);
      barGrad.addColorStop(1, color.secondary);
      ctx.fillStyle = barGrad;
      ctx.fillRect(200, stat.y - 25, (stat.value / 100) * 500, 35);

      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(stat.value, 650 + (50 - stat.value / 2), stat.y);
    });

    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Edition ${edition}/999`, 400, 1160);
  };

  useEffect(() => {
    const interval = setInterval(drawCard, 50);
    return () => clearInterval(interval);
  }, [uploadedImage, currentColor, stats, edition]);

  const formatAddress = (address) => {
    return `${address.substring(0, 6)}...${address.substring(38)}`;
  };

  const getWalletTypeName = () => {
    if (!walletType) return 'Unknown';
    const types = {
      metamask: 'MetaMask',
      trust: 'Trust Wallet',
      coinbase: 'Coinbase',
      walletconnect: 'WalletConnect',
      generic: 'Ethereum Wallet'
    };
    return types[walletType] || 'Connected';
  };

  const network = NETWORKS[selectedNetwork];

  return (
    <div>
      {/* Your UI goes here */}
    </div>
  );
}

export default NFTCardGenerator;
