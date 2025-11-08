import React, { useState, useRef } from 'react';
import { Download, Sparkles, Wand2 } from 'lucide-react';

const FarcasterNFTApp = () => {
  const [prompt, setPrompt] = useState('');
  const [nftImage, setNftImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef(null);

  const generateNFT = () => {
    setIsGenerating(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 500, 500);
    const colors = [
      ['#667eea', '#764ba2', '#f093fb'],
      ['#4facfe', '#00f2fe', '#43e97b'],
      ['#fa709a', '#fee140', '#30cfd0'],
      ['#a8edea', '#fed6e3', '#d299c2'],
      ['#fbc2eb', '#a6c1ee', '#c2e9fb']
    ];
    const selectedColors = colors[Math.floor(Math.random() * colors.length)];
    
    gradient.addColorStop(0, selectedColors[0]);
    gradient.addColorStop(0.5, selectedColors[1]);
    gradient.addColorStop(1, selectedColors[2]);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 500, 500);

    // Add geometric shapes
    const shapeCount = 5 + Math.floor(Math.random() * 10);
    for (let i = 0; i < shapeCount; i++) {
      ctx.globalAlpha = 0.3 + Math.random() * 0.4;
      ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 60%)`;
      
      const shapeType = Math.floor(Math.random() * 3);
      const x = Math.random() * 500;
      const y = Math.random() * 500;
      const size = 30 + Math.random() * 100;
      
      if (shapeType === 0) {
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      } else if (shapeType === 1) {
        ctx.fillRect(x, y, size, size);
      } else {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + size, y + size / 2);
        ctx.lineTo(x, y + size);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Add text
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    
    const text = prompt || 'Generative NFT';
    const words = text.split(' ');
    let y = 250 - (words.length * 20);
    
    words.forEach(word => {
      ctx.fillText(word, 250, y);
      y += 45;
    });

    setTimeout(() => {
      setNftImage(canvas.toDataURL());
      setIsGenerating(false);
    }, 1500);
  };

  const downloadNFT = () => {
    const link = document.createElement('a');
    link.download = 'nft-artwork.png';
    link.href = nftImage;
    link.click();
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-blue-500 animate-gradient"></div>
      
      {/* Floating orbs for depth */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-delayed"></div>
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-slow"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header with glassmorphism */}
          <div className="text-center mb-8 backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-10 h-10 text-yellow-300 animate-pulse" />
              <h1 className="text-5xl font-bold text-white drop-shadow-lg">
                NFT Generator
              </h1>
              <Sparkles className="w-10 h-10 text-yellow-300 animate-pulse" />
            </div>
            <p className="text-white/90 text-lg font-medium">
              Create stunning generative art instantly
            </p>
          </div>

          {!nftImage ? (
            <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="space-y-6">
                <div>
                  <label className="block text-white text-sm font-semibold mb-3 flex items-center gap-2">
                    <Wand2 className="w-5 h-5" />
                    Describe your NFT
                  </label>
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Cosmic dreams, digital sunset, abstract waves..."
                    className="w-full px-6 py-4 rounded-2xl backdrop-blur-xl bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 transition-all text-lg font-medium shadow-lg"
                  />
                </div>

                <button
                  onClick={generateNFT}
                  disabled={isGenerating}
                  className="w-full backdrop-blur-xl bg-gradient-to-r from-purple-500/80 to-pink-500/80 hover:from-purple-600/90 hover:to-pink-600/90 text-white font-bold py-5 rounded-2xl transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl border border-white/20 flex items-center justify-center gap-3 text-lg"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating magic...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6" />
                      Generate NFT
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl space-y-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-50 group-hover:opacity-75 transition duration-1000"></div>
                <div className="relative backdrop-blur-xl bg-white/20 rounded-3xl p-4 border border-white/30">
                  <img
                    src={nftImage}
                    alt="Generated NFT"
                    className="w-full rounded-2xl shadow-2xl"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={downloadNFT}
                  className="flex-1 backdrop-blur-xl bg-gradient-to-r from-green-500/80 to-emerald-500/80 hover:from-green-600/90 hover:to-emerald-600/90 text-white font-bold py-4 rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-xl border border-white/20 flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download
                </button>
                <button
                  onClick={() => setNftImage(null)}
                  className="flex-1 backdrop-blur-xl bg-white/20 hover:bg-white/30 text-white font-bold py-4 rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-xl border border-white/20"
                >
                  Create Another
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden canvas */}
      <canvas ref={canvasRef} width="500" height="500" className="hidden" />

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
};

export default FarcasterNFTApp;
