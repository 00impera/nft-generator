import React, { useState, useRef } from "react";
import {
  Download,
  Upload,
  Sparkles,
  Wallet,
  ShoppingBag,
  FileJson,
} from "lucide-react";
import { BuyWidget, ConnectButton } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";


const treasuryAddress = "0x802Ef4Dd42D736eF4EFf0A32A6dCCeaE151B765D";
const clientId = "821819db832d1a313ae3b1a62fbeafb7";
const openSeaLink = "https://opensea.io/SUPERRARECOINS";
const client = createThirdwebClient({ clientId });

export default function NFTGenerator() {
  const [image, setImage] = useState(null);
  const [name, setName] = useState("SuperRare Coin #001");
  const [description, setDescription] = useState(
    "A rare digital collectible from SuperRare Coins",
  );
  const [price, setPrice] = useState("0.01");
  const [attributes, setAttributes] = useState([
    { trait_type: "Rarity", value: "Legendary" },
    { trait_type: "Edition", value: "1 of 100" },
  ]);
  const [currentGradient, setCurrentGradient] = useState(0);
  const fileInputRef = useRef(null);

  const gradients = [
    {
      classes: "from-fuchsia-600 via-pink-500 to-yellow-400",
      colors: ["#c026d3", "#ec4899", "#facc15"],
    },
    {
      classes: "from-blue-600 via-cyan-400 to-green-400",
      colors: ["#2563eb", "#22d3ee", "#4ade80"],
    },
    {
      classes: "from-orange-500 via-red-500 to-pink-600",
      colors: ["#f97316", "#ef4444", "#ec4899"],
    },
    {
      classes: "from-purple-600 via-indigo-500 to-blue-400",
      colors: ["#7c3aed", "#6366f1", "#60a5fa"],
    },
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setImage(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const addAttribute = () => {
    setAttributes([...attributes, { trait_type: "", value: "" }]);
  };

  const updateAttribute = (index, field, value) => {
    const newAttrs = [...attributes];
    newAttrs[index][field] = value;
    setAttributes(newAttrs);
  };

  const removeAttribute = (index) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const generateMetadata = () => {
    const metadata = {
      name: name,
      description: description,
      image: image || "ipfs://YOUR_IMAGE_HASH",
      external_url: openSeaLink,
      price: price + " ETH",
      attributes: attributes.filter((attr) => attr.trait_type && attr.value),
      properties: {
        treasury: treasuryAddress,
        collection: "SuperRare Coins",
        creator: "SuperRareCoins",
      },
    };
    return metadata;
  };

  const downloadMetadata = () => {
    const metadata = generateMetadata();
    const blob = new Blob([JSON.stringify(metadata, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${name.replace(/\s+/g, "_")}_metadata.json`;
    link.click();
  };

  const downloadAll = () => {
    downloadNFT();
    setTimeout(() => {
      downloadMetadata();
    }, 500);
  };

  const downloadNFT = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 800;
    canvas.height = 1000;

    const gradient = ctx.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height,
    );
    const colors = gradients[currentGradient].colors;
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(0.5, colors[1]);
    gradient.addColorStop(1, colors[2]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (image) {
      const img = new Image();
      img.onload = () => {
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fillRect(40, 40, 720, 600);
        ctx.drawImage(img, 50, 50, 700, 580);
        drawText();
      };
      img.src = image;
    } else {
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.fillRect(40, 40, 720, 600);
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Upload Image", 400, 340);
      drawText();
    }

    function drawText() {
      ctx.fillStyle = "white";
      ctx.font = "bold 42px Arial";
      ctx.textAlign = "center";
      ctx.fillText(name, 400, 700);
      ctx.font = "20px Arial";
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.fillText(description.substring(0, 50), 400, 735);
      ctx.font = "28px Arial";
      ctx.fillText(`${price} ETH`, 400, 770);

      // Attributes
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.fillRect(40, 800, 720, 160);
      ctx.font = "bold 18px Arial";
      ctx.textAlign = "left";
      let y = 840;
      attributes.slice(0, 4).forEach((attr, i) => {
        if (attr.trait_type && attr.value) {
          const x = i % 2 === 0 ? 70 : 420;
          ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
          ctx.fillText(attr.trait_type, x, y);
          ctx.fillStyle = "white";
          ctx.font = "bold 22px Arial";
          ctx.fillText(attr.value, x, y + 25);
          ctx.font = "bold 18px Arial";
          if (i % 2 === 1) y += 60;
        }
      });

      const link = document.createElement("a");
      link.download = `${name.replace(/\s+/g, "_")}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const metadata = generateMetadata();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Dashboard Header */}
      <header className="flex items-center justify-between px-8 py-6 bg-gradient-to-r from-fuchsia-600 via-pink-500 to-yellow-400 shadow-lg rounded-b-3xl mb-8">
        <div className="flex items-center gap-3">
          <Sparkles size={32} className="text-white drop-shadow" />
          <span className="text-2xl font-extrabold text-white tracking-wide drop-shadow">
            NFT Card Generator
          </span>
        </div>
        <ConnectButton
          client={client}
          theme="dark"
          connectButton={{
            label: "Connect Wallet",
            className:
              "bg-white/20 hover:bg-white/30 text-white font-bold px-6 py-2 rounded-xl shadow transition-all",
          }}
        />
      </header>

      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Preview */}
          <div className="space-y-4">
            <div
              className={`bg-gradient-to-br ${gradients[currentGradient].classes} rounded-2xl p-6 shadow-2xl`}
            >
              <div className="bg-black/30 rounded-xl mb-4 overflow-hidden h-64 flex items-center justify-center">
                {image ? (
                  <img
                    src={image}
                    alt="NFT"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-white/60 text-center">
                    <Upload size={40} className="mx-auto mb-2" />
                    <p>Upload Image</p>
                  </div>
                )}
              </div>
              <h3 className="text-2xl font-bold text-white text-center mb-1">
                {name}
              </h3>
              <p className="text-white/80 text-center text-sm mb-2">
                {description.substring(0, 40)}...
              </p>
              <p className="text-white/90 text-center text-lg font-bold">
                {price} ETH
              </p>
              {/* Attributes Preview */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {attributes.slice(0, 4).map(
                  (attr, i) =>
                    attr.trait_type &&
                    attr.value && (
                      <div key={i} className="bg-black/30 rounded-lg p-2">
                        <div className="text-xs text-white/60">
                          {attr.trait_type}
                        </div>
                        <div className="text-sm font-bold text-white">
                          {attr.value}
                        </div>
                      </div>
                    ),
                )}
              </div>
            </div>

            {/* Colors */}
            <div className="flex gap-2 justify-center">
              {gradients.map((grad, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentGradient(i)}
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${grad.classes} transition-all ${
                    currentGradient === i
                      ? "ring-4 ring-white scale-110"
                      : "hover:scale-105"
                  }`}
                />
              ))}
            </div>

            {/* Download Buttons */}
            <button
              onClick={downloadNFT}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transform hover:scale-105 transition-all"
            >
              <Download size={20} />
              Download Image
            </button>

            <button
              onClick={downloadMetadata}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transform hover:scale-105 transition-all"
            >
              <FileJson size={20} />
              Download JSON
            </button>

            <button
              onClick={downloadAll}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transform hover:scale-105 transition-all"
            >
              <Download size={20} />
              Download All
            </button>
          </div>

          {/* Editor */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 space-y-4">
            {/* Upload */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Upload Image
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <Upload size={18} />
                Choose Image
              </button>
            </div>

            {/* Name */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                NFT Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900/50 border border-purple-500/30 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-slate-900/50 border border-purple-500/30 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 resize-none"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Price (ETH)
              </label>
              <input
                type="number"
                step="0.001"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-slate-900/50 border border-purple-500/30 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            {/* Attributes */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Attributes
              </label>
              <div className="space-y-2">
                {attributes.map((attr, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      value={attr.trait_type}
                      onChange={(e) =>
                        updateAttribute(i, "trait_type", e.target.value)
                      }
                      placeholder="Trait"
                      className="flex-1 bg-slate-900/50 border border-purple-500/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                    />
                    <input
                      type="text"
                      value={attr.value}
                      onChange={(e) =>
                        updateAttribute(i, "value", e.target.value)
                      }
                      placeholder="Value"
                      className="flex-1 bg-slate-900/50 border border-purple-500/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                    />
                    <button
                      onClick={() => removeAttribute(i)}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 rounded-lg transition-all"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addAttribute}
                className="mt-2 w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 font-semibold py-2 rounded-lg transition-all"
              >
                + Add Attribute
              </button>
            </div>

            {/* OpenSea */}
            <a
              href={openSeaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transform hover:scale-105 transition-all"
            >
              <ShoppingBag size={20} />
              View on OpenSea
            </a>

            {/* Payment */}
            <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-xl p-4">
              <h3 className="text-white font-bold mb-2 flex items-center gap-2 text-sm">
                <Wallet size={18} />
                Mint NFT
              </h3>
              <BuyWidget
                client={client}
                title={name}
                tokenAddress="0x..." // <-- Replace with your NFT contract address!
                chain={base}
                amount={price}
                seller={treasuryAddress}
              />
            </div>
          </div>

          {/* Metadata JSON Preview */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FileJson className="text-green-400" />
              NFT Metadata
            </h2>
            <div className="bg-slate-900/80 rounded-xl p-4 overflow-auto max-h-[600px]">
              <pre className="text-xs text-green-300 font-mono whitespace-pre-wrap break-all">
                {JSON.stringify(metadata, null, 2)}
              </pre>
            </div>
            <p className="text-gray-400 text-xs mt-4">
              ✅ Complete OpenSea compatible metadata
              <br />
              ✅ Includes image, price, attributes
              <br />✅ Treasury address: {treasuryAddress.slice(0, 6)}...
              {treasuryAddress.slice(-4)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

