import React, { useState, useEffect } from 'react';
import { Loader2, Share2, Download } from 'lucide-react';

const FarcasterNFTApp = () => {
  const [ready, setReady] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [nftImage, setNftImage] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const script = document.createElement('script');
        script.type = 'module';
        script.textContent = `
          import { sdk } from 'https://esm.sh/@farcaster/miniapp-sdk';
          window.farcasterSDK = sdk;
        `;
        document.head.appendChild(script);

        await new Promise(resolve => setTimeout(resolve, 1000));

        if (window.farcasterSDK) {
          await window.farcasterSDK.actions.ready();
        }
        setReady(true);
      } catch (err) {
        setReady(true);
      }
    };
    init();
  }, []);

  const generateNFT = () => {
    setGenerating(true);
    setTimeout(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      const gradient = ctx.createLinearGradient(0, 0, 512, 512);
      gradient.addColorStop(0, `hsl(${Math.random() * 360}, 70%, 50%)`);
      gradient.addColorStop(1, `hsl(${Math.random() * 360}, 70%, 30%)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 512);

      for (let i = 0; i < 10; i++) {
        ctx.fillStyle = `hsla(${Math.random() * 360}, 70%, 60%, 0.5)`;
        ctx.beginPath();
        ctx.arc(Math.random() * 512, Math.random() * 512, Math.random() * 100 + 20, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = 'white';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('NFT #' + Math.floor(Math.random() * 10000), 256, 256);

      setNftImage(canvas.toDataURL('image/png'));
      setGenerating(false);
    }, 1500);
  };

  const share = async () => {
    if (window.farcasterSDK) {
      await window.farcasterSDK.actions.openUrl('https://warpcast.com/~/compose');
    } else {
      alert('Open in Farcaster client to share');
    }
  };

  const download = () => {
    const link = document.createElement('a');
    link.download = 'nft.png';
    link.href = nftImage;
    link.click();
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 p-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">NFT Generator</h1>

        {!nftImage ? (
          <button
            onClick={generateNFT}
            disabled={generating}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-105 disabled:scale-100"
          >
            {generating ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </span>
            ) : (
              'Generate NFT'
            )}
          </button>
        ) : (
          <div className="space-y-4">
            <img src={nftImage} alt="NFT" className="w-full rounded-xl shadow-lg" />

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={share}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>

              <button
                onClick={download}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Save
              </button>
            </div>

            <button
              onClick={() => setNftImage(null)}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-xl transition-all"
            >
              Generate Another
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarcasterNFTApp;
