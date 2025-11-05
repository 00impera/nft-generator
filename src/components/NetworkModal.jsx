const NETWORKS = {
  eth: { name: "Ethereum", chainId: "0x1", symbol: "ETH", fee: "0.001" },
  polygon: { name: "Polygon", chainId: "0x89", symbol: "MATIC", fee: "1.0" },
  base: { name: "Base", chainId: "0x2105", symbol: "ETH", fee: "0.0005" },
};

export default function NetworkModal({ show, onClose, onSelect }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-lg border-2 border-purple-400 rounded-2xl p-8 max-w-xs w-full shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Select Network</h2>
          <button onClick={onClose} className="text-white text-2xl hover:text-purple-400">×</button>
        </div>
        <div className="space-y-3">
          {Object.entries(NETWORKS).map(([key, net]) => (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold py-4 rounded-xl shadow transition"
            >
              {net.name} - {net.fee} {net.symbol}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export { NETWORKS };
