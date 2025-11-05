export default function WalletModal({ show, onClose, onConnect }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-lg border-2 border-cyan-400 rounded-2xl p-8 max-w-xs w-full shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Connect Wallet</h2>
          <button onClick={onClose} className="text-white text-2xl hover:text-cyan-400">×</button>
        </div>
        <div className="space-y-4">
          <button
            onClick={() => onConnect("metamask")}
            className="w-full flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-3 px-4 rounded-xl shadow-md transition"
          >
            <img src="https://cryptologos.cc/logos/metamask-fox-logo.png" alt="MetaMask" className="w-7 h-7" />
            MetaMask
          </button>
          <button
            onClick={() => onConnect("trust")}
            className="w-full flex items-center gap-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-3 px-4 rounded-xl shadow-md transition"
          >
            <img src="https://cryptologos.cc/logos/trust-wallet-trust-logo.png" alt="Trust" className="w-7 h-7" />
            Trust Wallet
          </button>
          <button
            onClick={() => onConnect("coinbase")}
            className="w-full flex items-center gap-3 bg-gradient-to-r from-blue-700 to-indigo-500 hover:from-blue-800 hover:to-indigo-600 text-white font-bold py-3 px-4 rounded-xl shadow-md transition"
          >
            <img src="https://cryptologos.cc/logos/coinbase-coinbase-logo.png" alt="Coinbase" className="w-7 h-7" />
            Coinbase Wallet
          </button>
        </div>
      </div>
    </div>
  );
}
