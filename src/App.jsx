import { useState, useRef } from "react";
import NFTCanvas, { COLORS } from "./components/NFTCanvas";
import WalletModal from "./components/WalletModal";
import NetworkModal, { NETWORKS } from "./components/NetworkModal";
import useWallet from "./hooks/useWallet";

export default function App() {
  const [image, setImage] = useState(null);
  const [transform, setTransform] = useState({
    scale: 1,
    positionX: 0,
    positionY: 0,
  });
  const [colorIdx, setColorIdx] = useState(0);
  const [stats, setStats] = useState({
    attack: 85,
    defense: 70,
    speed: 90,
    magic: 75,
  });
  const [edition] = useState(Math.floor(Math.random() * 999) + 1);
  const [network, setNetwork] = useState("eth");
  const [showWallet, setShowWallet] = useState(false);
  const [showNetwork, setShowNetwork] = useState(false);
  const fileRef = useRef(null);
  const { wallet, connectWallet } = useWallet();

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new window.Image();
        img.onload = () => {
          setImage(img);
          const scale = Math.min(640 / img.width, 480 / img.height, 1);
          setTransform({
            scale,
            positionX: (640 - img.width * scale) / 2,
            positionY: (480 - img.height * scale) / 2,
          });
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const download = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `nft-${edition}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleConnectWallet = async (walletType) => {
    const success = await connectWallet(walletType);
    if (success) setShowWallet(false);
  };

  const mint = async () => {
    if (!wallet) {
      setShowWallet(true);
      return;
    }
    if (!image) {
      alert("Upload an image first!");
      return;
    }
    try {
      const fee = NETWORKS[network].fee;
      const value =
        "0x" + BigInt(Math.floor(parseFloat(fee) * 1e18)).toString(16);
      await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: wallet,
            to: "0x592B35c8917eD36c39Ef73D0F5e92B0173560b2e",
            value,
            gas: "0x5208",
          },
        ],
      });
      alert("Success!");
      download();
    } catch (err) {
      alert("Transaction failed");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-blue-800 p-4"
      style={{ fontFamily: "'Inter', Arial, sans-serif" }}
    >
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8">
        <div className="flex flex-col items-center mb-8 gap-2">
          <img
            src="https://cryptologos.cc/logos/ethereum-eth-logo.png"
            alt="Logo"
            className="w-14 h-14 mb-2"
            style={{ filter: "drop-shadow(0 0 8px #00ffff88)" }}
          />
          <h1 className="text-4xl font-bold text-cyan-400 mb-2 text-center">
            NFT Card Generator
          </h1>
          <p className="text-blue-200 text-lg text-center">
            Create epic mythic cards • Connect wallet to mint
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="flex flex-col items-center">
            <NFTCanvas
              image={image}
              colorIdx={colorIdx}
              stats={stats}
              edition={edition}
              transform={transform}
            />
            {image && (
              <div className="mt-4 grid grid-cols-4 gap-2">
                <button
                  onClick={() =>
                    setTransform((t) => ({
                      ...t,
                      scale: Math.min(t.scale * 1.1, 2),
                    }))
                  }
                  className="bg-blue-700 hover:bg-blue-600 text-white px-3 py-2 rounded-xl shadow transition"
                >
                  +
                </button>
                <button
                  onClick={() =>
                    setTransform((t) => ({
                      ...t,
                      scale: Math.max(t.scale * 0.9, 0.2),
                    }))
                  }
                  className="bg-blue-700 hover:bg-blue-600 text-white px-3 py-2 rounded-xl shadow transition"
                >
                  -
                </button>
                <button
                  onClick={() =>
                    setTransform((t) => ({ ...t, positionX: t.positionX - 20 }))
                  }
                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-xl shadow transition"
                >
                  ←
                </button>
                <button
                  onClick={() =>
                    setTransform((t) => ({ ...t, positionX: t.positionX + 20 }))
                  }
                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-xl shadow transition"
                >
                  →
                </button>
              </div>
            )}
            <button
              onClick={download}
              className="w-full mt-4 bg-gradient-to-r from-green-400 to-emerald-600 hover:from-green-500 hover:to-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg text-lg transition"
            >
              💾 Download
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-cyan-400 shadow">
              <h2 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                📸 Upload
              </h2>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-4 rounded-xl shadow transition"
              >
                Choose Image
              </button>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-purple-400 shadow">
              <h2 className="text-2xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                ✨ Colors
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() =>
                    setColorIdx((colorIdx - 1 + COLORS.length) % COLORS.length)
                  }
                  className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold py-3 rounded-xl shadow transition"
                >
                  ← Prev
                </button>
                <button
                  onClick={() => setColorIdx((colorIdx + 1) % COLORS.length)}
                  className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold py-3 rounded-xl shadow transition"
                >
                  Next →
                </button>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-yellow-400 shadow">
              <h2 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                ⚡ Stats
              </h2>
              {Object.entries(stats).map(([key, value]) => (
                <div key={key} className="mb-3">
                  <div className="flex justify-between mb-2 text-white">
                    <span className="capitalize">{key}</span>
                    <span>{value}</span>
                  </div>
                  <input
                    type="range"
                    min={60}
                    max={100}
                    value={value}
                    onChange={(e) =>
                      setStats((s) => ({ ...s, [key]: Number(e.target.value) }))
                    }
                    className="w-full accent-yellow-400"
                  />
                </div>
              ))}
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-green-400 shadow">
              <h2 className="text-2xl font-bold text-green-400 mb-4 flex items-center gap-2">
                🔥 Mint
              </h2>
              <button
                onClick={mint}
                className="w-full bg-gradient-to-r from-green-400 to-emerald-600 hover:from-green-500 hover:to-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg text-lg transition flex items-center justify-center gap-2"
                disabled={!wallet || !image}
              >
                Pay {NETWORKS[network].fee} {NETWORKS[network].symbol}
              </button>
            </div>

            <div className="flex gap-2 justify-center">
              {wallet ? (
                <div className="bg-green-600/20 border border-green-500 rounded-lg px-4 py-2 text-white text-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  {wallet.slice(0, 6)}...{wallet.slice(-4)}
                </div>
              ) : (
                <button
                  onClick={() => setShowWallet(true)}
                  className="bg-gradient-to-r from-green-400 to-emerald-600 hover:from-green-500 hover:to-emerald-700 text-white px-4 py-2 rounded-xl shadow transition font-bold"
                >
                  Connect Wallet
                </button>
              )}
              <button
                onClick={() => setShowNetwork(true)}
                className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-4 py-2 rounded-xl shadow transition font-bold"
              >
                {NETWORKS[network].name}
              </button>
            </div>
          </div>
        </div>
      </div>

      <WalletModal
        show={showWallet}
        onClose={() => setShowWallet(false)}
        onConnect={handleConnectWallet}
      />
      <NetworkModal
        show={showNetwork}
        onClose={() => setShowNetwork(false)}
        onSelect={(key) => {
          setNetwork(key);
          setShowNetwork(false);
        }}
      />
    </div>
  );
}

