import React, { useState, useRef } from "react";
import {
  Download,
  Upload,
  Sparkles,
  Wallet,
  ShoppingBag,
  FileJson,
  Star,
  BadgeDollarSign,
  BadgePercent,
} from "lucide-react";
import { BuyWidget, createThirdwebClient } from "thirdweb/react";
import { base } from "thirdweb/chains"; // Change to your target chain if needed

const treasuryAddress = "0x802Ef4Dd42D736eF4EFf0A32A6dCCeaE151B765D";
const clientId = "821819db832d1a313ae3b1a62fbeafb7";
const openSeaLink = "https://opensea.io/SUPERRARECOINS";
const client = createThirdwebClient({ clientId });

export default function UnicornNFTGenerator() {
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

  // Unicorn & crypto-inspired gradients
  const gradients = [
    {
      classes: "from-pink-500 via-purple-500 to-blue-500",
      colors: ["#ec4899", "#a21caf", "#3b82f6"],
    },
    {
      classes: "from-yellow-400 via-pink-500 to-purple-500",
      colors: ["#facc15", "#ec4899", "#a21caf"],
    },
    {
      classes: "from-green-400 via-blue-400 to-purple-500",
      colors: ["#4ade80", "#60a5fa", "#a21caf"],
    },
    {
      classes: "from-pink-400 via-yellow-400 to-green-400",
      colors: ["#f472b6", "#fde68a", "#4ade80"],
    },
    {
      classes: "from-blue-400 via-pink-400 to-yellow-400",
      colors: ["#60a5fa", "#f472b6", "#fde68a"],
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
      const img = new window.Image();
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
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 p-0">
      {/* Dashboard Bar */}
      <div className="w-full flex items-center justify-between px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 shadow-lg rounded-b-3xl mb-8">
        <div className="flex items-center gap-3">
          <Sparkles size={32} className="text-white drop-shadow" />
          <span className="text-2xl font-extrabold text-white tracking-wide drop-shadow">
            Unicorn NFT Dashboard
          </span>
        </div>
        <div className="flex gap-4">
          <a
            href={openSeaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl font-semibold transition-all"
          >
            <ShoppingBag size={18} />
            OpenSea
          </a>
          <a
            href="https://thirdweb.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl font-semibold transition-all"
          >
            <Wallet size={18} />
            thirdweb
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
        {/* NFT Preview Card */}
        <div className="bg-white/30 backdrop-blur-xl rounded-3xl p-6 border-2 border-pink-400/30 shadow-2xl space-y-4">
          <div
            className={`bg-gradient-to-br ${gradients[currentGradient].classes} rounded-2xl p-4 shadow-xl`}
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
            <h3 className="text-2xl font-bold text-white text-center mb-1 flex items-center justify-center gap-2">
              {name}
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-white/30 text-xs font-bold text-pink-600 ml-2">
                <Star size={14} className="inline mr-1" />
                NFT
              </span>
            </h3>
            <p className="text-white/80 text-center text-sm mb-2">
              {description.substring(0, 40)}...
            </p>
            <p className="text-white/90 text-center text-lg font-bold flex items-center justify-center gap-2">
              <BadgeDollarSign size={18} className="text-yellow-300" />
              {price} ETH
            </p>
            {/* NFT Marks */}
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {attributes.map(
                (attr, i) =>
                  attr.trait_type &&
                  attr.value && (
                    <span
                      key={i}
                      className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-pink-400 via-yellow-400 to-blue-400 text-xs font-bold text-white shadow"
                    >
                      <BadgePercent size={12} className="mr-1" />
                      {attr.trait_type}: {attr.value}
                    </span>
                  ),
              )}
            </div>
          </div>
          {/* Color Pickers */}
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
            className="w-full bg-gradient-to-r from-green-400 via-teal-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transform hover:scale-105 transition-all"
          >
            <Download size={20} />
            Download Image
          </button>
          <button
            onClick={downloadMetadata}
            className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transform hover:scale-105 transition-all"
          >
            <FileJson size={20} />
            Download JSON
          </button>
          <button
            onClick={downloadAll}
            className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:to-indigo-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg transform hover:scale-105 transition-all"
          >
            <Download size={20} />
            Download All
          </button>
        </div>

        {/* Editor Card */}
        <div className="bg-white/30 backdrop-blur-xl rounded-3xl p-6 border-2 border-blue-400/30 shadow-2xl space-y-4">
          {/* Upload */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
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
            <label className="block text-gray-700 text-sm font-medium mb-2">
              NFT Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900/50 border border-indigo-500/30 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          {/* Description */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-slate-900/50 border border-indigo-500/30 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 resize-none"
            />
          </div>
          {/* Price */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Price (ETH)
            </label>
            <input
              type="number"
              step="0.001"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full bg-slate-900/50 border border-indigo-500/30 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          {/* Attributes */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
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
                    className="flex-1 bg-slate-900/50 border border-indigo-500/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    value={attr.value}
                    onChange={(e) =>
                      updateAttribute(i, "value", e.target.value)
                    }
                    placeholder="Value"
                    className="flex-1 bg-slate-900/50 border border-indigo-500/30 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500"
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
          {/* Payment */}
          <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-xl p-4 mt-4">
            <h3 className="text-gray-700 font-bold mb-2 flex items-center gap-2 text-sm">
              <Wallet size={18} />
              Thirdweb Payment
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
        <div className="bg-white/30 backdrop-blur-xl rounded-3xl p-6 border-2 border-yellow-400/30 shadow-2xl">
          <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
            <FileJson className="text-green-400" />
            NFT Metadata
          </h2>
          <div className="bg-slate-900/80 rounded-xl p-4 overflow-auto max-h-[600px]">
            <pre className="text-xs text-green-300 font-mono whitespace-pre-wrap break-all">
              {JSON.stringify(metadata, null, 2)}
            </pre>
          </div>
          <p className="text-gray-500 text-xs mt-4">
            ✅ Complete OpenSea compatible metadata
            <br />
            ✅ Includes image, price, attributes
            <br />✅ Treasury address: {treasuryAddress.slice(0, 6)}...
            {treasuryAddress.slice(-4)}
          </p>
        </div>
      </div>
    </div>
  );
}

