'use client';

import { useState, useEffect, useRef } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useHathor } from '@/contexts/HathorContext';
import { useUnifiedWallet } from '@/contexts/UnifiedWalletContext';
import Header from '@/components/Header';
import BalanceCard from '@/components/BalanceCard';
import TokenSelector from '@/components/TokenSelector';
import { ContractInfoPanel } from '@/components/ContractInfoPanel';
import { NetworkSelector } from '@/components/NetworkSelector';
import { WalletConnectionModal } from '@/components/WalletConnectionModal';
import { formatBalanceWithCommas, formatAddress } from '@/lib/utils';
import { toast } from '@/lib/toast';
import { APP_VERSION } from '@/lib/version';

export default function Home() {
  const { balance, address, refreshBalance, setBalance, balanceVerified, isLoadingBalance, sendNanoContractTx } = useWallet();
  const { network, getContractStateForToken, getContractIdForToken, switchNetwork, isConnected, coreAPI, disconnectWallet } = useHathor();
  const { walletType } = useUnifiedWallet();
  const [selectedToken, setSelectedToken] = useState('HTR');
  const [showWalletModal, setShowWalletModal] = useState(false);

  // Handle token change - clear balance and fetch new one
  const handleTokenChange = (newToken: string) => {
    // Clear current balance when switching tokens
    setBalance(0n);
    setSelectedToken(newToken);
  };

  // Track previous token to detect token changes
  const prevTokenRef = useRef(selectedToken);
  // Track if we've fetched balance for the current connection
  const hasFetchedForConnectionRef = useRef(false);

  // Reset fetch flag when disconnected
  useEffect(() => {
    if (!isConnected) {
      hasFetchedForConnectionRef.current = false;
    }
  }, [isConnected]);

  // Refresh wallet balance when token changes OR on initial connection
  useEffect(() => {
    if (!isConnected || !address) return;

    // Wait for contract state to be loaded (needed for tokenUid)
    const contractState = getContractStateForToken(selectedToken);
    if (!contractState) {
      return;
    }

    const tokenChanged = prevTokenRef.current !== selectedToken;
    const needsInitialFetch = !hasFetchedForConnectionRef.current;

    // Fetch balance if token changed or haven't fetched yet for this connection
    if (tokenChanged || needsInitialFetch) {
      const tokenUid = contractState.token_uid || '00';
      refreshBalance(tokenUid, network);
      hasFetchedForConnectionRef.current = true;
    }

    prevTokenRef.current = selectedToken;
  }, [selectedToken, isConnected, address, network, getContractStateForToken, refreshBalance]);

  // Handle network change - disconnect wallet first if connected
  const handleNetworkChange = (newNetwork: typeof network) => {
    if (isConnected) {
      disconnectWallet();
    }
    switchNetwork(newNetwork);
  };

  const contractState = getContractStateForToken(selectedToken);
  const contractId = getContractIdForToken(selectedToken);

  // Example: How to send a nano contract transaction
  const handleExampleTransaction = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!contractId) {
      toast.error('No contract configured for this token');
      return;
    }

    const tokenUid = contractState?.token_uid || '00';

    try {
      toast.info('Please confirm the transaction in your wallet...');

      // Example: Call a method on the nano contract
      // Replace 'your_method' and args with your actual contract method
      const result = await sendNanoContractTx({
        network,
        nc_id: contractId,
        method: 'your_method', // Replace with your contract method
        args: [], // Replace with your method arguments
        actions: [
          // Example deposit action - uncomment and modify as needed
          // {
          //   type: 'deposit',
          //   amount: '1000', // Amount in cents (10.00 tokens)
          //   token: tokenUid,
          // },
        ],
        push_tx: true,
      });

      toast.success(`Transaction successful! TX: ${result.response?.hash?.slice(0, 10)}...`);

      // Refresh balance after transaction
      refreshBalance(tokenUid, network);
    } catch (error: any) {
      toast.error(error.message || 'Transaction failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Header
        selectedToken={selectedToken}
        onTokenChange={handleTokenChange}
        appName="Hathor dApp"
      />

      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Welcome to Your Hathor dApp</h2>
          <p className="text-slate-400">
            This is a template for building decentralized applications on the Hathor Network.
            Connect your wallet to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Balance Card */}
            <BalanceCard selectedToken={selectedToken} />

            {/* Example Action Card */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Example Actions</h3>
              <p className="text-slate-400 mb-4">
                This section demonstrates how to interact with nano contracts.
                Modify the code to add your own contract interactions.
              </p>

              {isConnected ? (
                <div className="space-y-4">
                  <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                    <p className="text-sm text-slate-300 mb-2">
                      <strong>Connected Address:</strong> {formatAddress(address || '')}
                    </p>
                    <p className="text-sm text-slate-300 mb-2">
                      <strong>Network:</strong> {network}
                    </p>
                    <p className="text-sm text-slate-300">
                      <strong>Contract ID:</strong> {contractId ? formatAddress(contractId) : 'Not configured'}
                    </p>
                  </div>

                  <button
                    onClick={handleExampleTransaction}
                    disabled={!contractId}
                    className="px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: contractId
                        ? 'linear-gradient(244deg, rgb(255, 166, 0) 0%, rgb(255, 115, 0) 100%)'
                        : '#475569',
                      color: '#0f172a'
                    }}
                  >
                    {contractId ? 'Send Example Transaction' : 'Configure Contract First'}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowWalletModal(true)}
                  className="px-6 py-3 rounded-lg font-medium transition-colors hover:opacity-90"
                  style={{ background: 'linear-gradient(244deg, rgb(255, 166, 0) 0%, rgb(255, 115, 0) 100%)', color: '#0f172a' }}
                >
                  Connect Wallet to Get Started
                </button>
              )}
            </div>

            {/* Getting Started Guide */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Getting Started</h3>
              <div className="space-y-4 text-slate-300">
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white text-sm flex items-center justify-center font-bold">1</span>
                  <div>
                    <p className="font-medium text-white">Configure Environment</p>
                    <p className="text-sm text-slate-400">Copy <code className="bg-slate-700 px-1 rounded">.env.example</code> to <code className="bg-slate-700 px-1 rounded">.env.local</code> and set your WalletConnect Project ID and contract IDs.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white text-sm flex items-center justify-center font-bold">2</span>
                  <div>
                    <p className="font-medium text-white">Connect Your Wallet</p>
                    <p className="text-sm text-slate-400">Use Reown (WalletConnect) or MetaMask Snaps to connect your Hathor wallet.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500 text-white text-sm flex items-center justify-center font-bold">3</span>
                  <div>
                    <p className="font-medium text-white">Build Your dApp</p>
                    <p className="text-sm text-slate-400">Use the provided contexts and utilities to interact with nano contracts on the Hathor Network.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contract Info */}
          <div className="space-y-6">
            <ContractInfoPanel
              contractState={contractState}
              token={selectedToken}
              title="Contract State"
              description="Current state of the configured nano contract"
            />

            {/* Quick Links */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Resources</h3>
              <div className="space-y-2">
                <a
                  href="https://docs.hathor.network"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-orange-400 hover:text-orange-300 transition-colors"
                >
                  Hathor Documentation
                </a>
                <a
                  href="https://docs.hathor.network/guides/headless-wallet/http-api/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-orange-400 hover:text-orange-300 transition-colors"
                >
                  Wallet API Reference
                </a>
                <a
                  href="https://discord.gg/hathor"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-orange-400 hover:text-orange-300 transition-colors"
                >
                  Hathor Discord
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Version Footer */}
      <footer className="mt-8 text-center text-sm pb-6">
        <p className="text-slate-400 mb-2">Built on Hathor Network with Nano Contracts</p>
        <p className="text-slate-500">create-hathor-dapp {APP_VERSION}</p>
      </footer>

      {/* Wallet Connection Modal */}
      <WalletConnectionModal
        open={showWalletModal}
        onOpenChange={setShowWalletModal}
      />
    </div>
  );
}
