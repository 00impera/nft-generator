import { useState } from 'react';

export default function useWallet() {
  const [wallet, setWallet] = useState(null);

  const connectWallet = async (walletType = "metamask") => {
    let provider = null;
    if (window.ethereum?.providers && window.ethereum.providers.length > 0) {
      if (walletType === "metamask") {
        provider = window.ethereum.providers.find((p) => p.isMetaMask);
      } else if (walletType === "trust") {
        provider = window.ethereum.providers.find((p) => p.isTrust || p.isTrustWallet);
      } else if (walletType === "coinbase") {
        provider = window.ethereum.providers.find((p) => p.isCoinbaseWallet);
      }
      if (!provider) provider = window.ethereum.providers[0];
    } else if (window.ethereum) {
      provider = window.ethereum;
    }
    if (!provider) {
      alert(`Please install ${walletType === "metamask" ? "MetaMask" : "a Web3 wallet"}`);
      return false;
    }
    try {
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      setWallet(accounts[0]);
      return true;
    } catch (err) {
      alert("Connection failed: " + (err.message || err));
      return false;
    }
  };

  return { wallet, connectWallet };
}
