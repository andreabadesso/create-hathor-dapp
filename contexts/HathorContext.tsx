'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { HathorCoreAPI } from '@/lib/hathorCoreAPI';
import { ContractState, ContractTransaction } from '@/types/hathor';
import { config, Network } from '@/lib/config';
import { useWalletConnect } from './WalletConnectContext';
import { useMetaMask } from './MetaMaskContext';
import { useWallet } from './WalletContext';

interface HathorContextType {
  isConnected: boolean;
  address: string | null;
  network: Network;
  contractStates: Record<string, ContractState>;
  getContractStateForToken: (token: string) => ContractState | null;
  getContractIdForToken: (token: string) => string | null;
  coreAPI: HathorCoreAPI;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  switchNetwork: (network: Network) => Promise<void>;
  refreshContractStates: () => Promise<void>;
  // Contract history data
  allTransactions: ContractTransaction[];
  isLoadingHistory: boolean;
  lastHistoryUpdate: Date | null;
  refreshHistory: () => Promise<void>;
}

const HathorContext = createContext<HathorContextType | undefined>(undefined);

// Cache for token symbols fetched from the node
const tokenSymbolCache: Record<string, string> = {
  '00': 'HTR',
};

const MOCK_CONTRACT_STATES: Record<string, ContractState> = {
  'HTR': {
    token_uid: '00',
    max_bet_amount: 10000n,
    house_edge_basis_points: 190,
    random_bit_length: 16,
    available_tokens: 100000000n,
    total_liquidity_provided: 100000000n,
  },
};

const NETWORK_STORAGE_KEY = 'hathor_selected_network';

// Helper to get initial network from localStorage or default
const getInitialNetwork = (): Network => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(NETWORK_STORAGE_KEY);
    if (stored === 'mainnet' || stored === 'testnet') {
      return stored;
    }
  }
  return config.defaultNetwork;
};

export function HathorProvider({ children }: { children: ReactNode }) {
  const walletConnect = useWalletConnect();
  const metaMask = useMetaMask();
  const wallet = useWallet();
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<Network>(getInitialNetwork);
  const [contractStates, setContractStates] = useState<Record<string, ContractState>>({});
  const [tokenContractMap, setTokenContractMap] = useState<Record<string, string>>({});
  const [coreAPI, setCoreAPI] = useState(() => new HathorCoreAPI(getInitialNetwork()));

  // Centralized history state
  const [allTransactions, setAllTransactions] = useState<ContractTransaction[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [lastHistoryUpdate, setLastHistoryUpdate] = useState<Date | null>(null);

  const isConnected = walletConnect.isConnected || metaMask.isConnected;

  useEffect(() => {
    const newCoreAPI = new HathorCoreAPI(network);
    setCoreAPI(newCoreAPI);
    // Clear existing states when network changes
    setContractStates({});
    setTokenContractMap({});

    // Fetch contract states for the new network
    const fetchContractStates = async () => {
      if (config.useMockWallet) {
        setContractStates(MOCK_CONTRACT_STATES);
        setTokenContractMap({
          'HTR': 'mock-contract-htr',
        });
        return;
      }

      const contractIds = config.getContractIdsForNetwork(network);
      if (contractIds.length === 0) {
        return;
      }

      try {
        const states: Record<string, ContractState> = {};
        const map: Record<string, string> = {};
        for (const contractId of contractIds) {
          const state = await newCoreAPI.getContractState(contractId);

          // Get token symbol - check cache first, then fetch from node
          let tokenSymbol = tokenSymbolCache[state.token_uid];
          if (!tokenSymbol) {
            // Check if it's all zeros (HTR)
            if (/^0+$/.test(state.token_uid)) {
              tokenSymbol = 'HTR';
            } else {
              // Fetch from node
              const tokenInfo = await newCoreAPI.getTokenInfo(state.token_uid);
              tokenSymbol = tokenInfo?.symbol || state.token_uid.slice(0, 8);
            }
            // Cache the result
            tokenSymbolCache[state.token_uid] = tokenSymbol;
          }

          states[tokenSymbol] = state;
          map[tokenSymbol] = contractId;
        }
        setContractStates(states);
        setTokenContractMap(map);
      } catch (error) {
        console.error('Failed to fetch contract states:', error);
      }
    };

    fetchContractStates();
  }, [network]);

  useEffect(() => {
    if (isConnected) {
      // Get address and network from the connected wallet
      if (walletConnect.isConnected) {
        const addr = walletConnect.getFirstAddress();
        setAddress(addr);
        // Sync network from wallet session
        const walletNetwork = walletConnect.getConnectedNetwork();
        if (walletNetwork && walletNetwork !== network) {
          console.log(`Syncing network from wallet: ${walletNetwork}`);
          setNetwork(walletNetwork);
          localStorage.setItem(NETWORK_STORAGE_KEY, walletNetwork);
        }
      } else if (metaMask.isConnected) {
        setAddress(metaMask.address);
        // Sync network from MetaMask wallet
        if (metaMask.walletNetwork && metaMask.walletNetwork !== network) {
          console.log(`Syncing network from MetaMask: ${metaMask.walletNetwork}`);
          setNetwork(metaMask.walletNetwork);
          localStorage.setItem(NETWORK_STORAGE_KEY, metaMask.walletNetwork);
        }
      }
      refreshContractStates();
    } else {
      setAddress(null);
      wallet.setBalance(0n);
    }
  }, [isConnected, walletConnect.isConnected, metaMask.isConnected, walletConnect, metaMask]);

  const connectWallet = async () => {
    try {
      await walletConnect.connect();
      // walletConnect context will update isConnected and addresses; effect above will pick it up
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  const disconnectWallet = async () => {
    try {
      // Disconnect whichever wallet is connected
      if (walletConnect.isConnected) {
        await walletConnect.disconnect();
      }
      if (metaMask.isConnected) {
        await metaMask.disconnect();
      }
      // Clear wallet type from localStorage
      localStorage.removeItem('wallet_type');
      // wallet contexts will update isConnected; effect above will clear address/balance
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      // don't rethrow to avoid breaking UI flows
    }
  };

  const switchNetwork = async (newNetwork: Network) => {
    setNetwork(newNetwork);
    // Persist to localStorage
    localStorage.setItem(NETWORK_STORAGE_KEY, newNetwork);
    // If WalletConnect supports network switching, attempt it
    if (typeof (walletConnect as any).switchNetwork === 'function') {
      try {
        await (walletConnect as any).switchNetwork(newNetwork);
      } catch (err) {
        console.warn('WalletConnect network switch failed (continuing with client-side network):', err);
      }
    }
    if (isConnected) {
      await refreshContractStates();
    }
  };

  const getContractStateForToken = useCallback((token: string): ContractState | null => {
    return contractStates[token] || null;
  }, [contractStates]);

  const getContractIdForToken = useCallback((token: string): string | null => {
    return tokenContractMap[token] || null;
  }, [tokenContractMap]);

  const refreshContractStatesWithAPI = async (api: HathorCoreAPI, currentNetwork: Network) => {
    if (config.useMockWallet) {
      setContractStates(MOCK_CONTRACT_STATES);
      setTokenContractMap({
        'HTR': 'mock-contract-htr',
      });
      return;
    }

    const contractIds = config.getContractIdsForNetwork(currentNetwork);
    if (contractIds.length === 0) {
      return;
    }

    try {
      const states: Record<string, ContractState> = {};
      const map: Record<string, string> = {};
      for (const contractId of contractIds) {
        const state = await api.getContractState(contractId);

        // Get token symbol - check cache first, then fetch from node
        let tokenSymbol = tokenSymbolCache[state.token_uid];
        if (!tokenSymbol) {
          // Check if it's all zeros (HTR)
          if (/^0+$/.test(state.token_uid)) {
            tokenSymbol = 'HTR';
          } else {
            // Fetch from node
            const tokenInfo = await api.getTokenInfo(state.token_uid);
            tokenSymbol = tokenInfo?.symbol || state.token_uid.slice(0, 8);
          }
          // Cache the result
          tokenSymbolCache[state.token_uid] = tokenSymbol;
        }

        states[tokenSymbol] = state;
        map[tokenSymbol] = contractId;
      }
      setContractStates(states);
      setTokenContractMap(map);
    } catch (error) {
      console.error('Failed to fetch contract states:', error);
    }
  };

  const refreshContractStates = async () => {
    await refreshContractStatesWithAPI(coreAPI, network);
  };

  // Centralized refresh function that updates all history data
  const refreshHistory = async () => {
    if (config.useMockWallet) {
      setAllTransactions([]);
      setLastHistoryUpdate(new Date());
      return;
    }

    // Wait for tokenContractMap to be populated before fetching history
    if (Object.keys(tokenContractMap).length === 0 && config.getContractIdsForNetwork(network).length > 0) {
      return;
    }

    // Create API instance based on current network to avoid stale coreAPI state
    const api = new HathorCoreAPI(network);

    setIsLoadingHistory(true);
    try {
      const allTxs: ContractTransaction[] = [];

      for (const contractId of config.getContractIdsForNetwork(network)) {
        const history = await api.getContractHistory(contractId, 100);

        // Store all transactions with contractId
        const txsWithContractId = history.transactions.map(tx => ({...tx, contractId}));
        allTxs.push(...txsWithContractId);
      }

      setAllTransactions(allTxs);
      setLastHistoryUpdate(new Date());
    } catch (error) {
      console.error('Failed to refresh history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Auto-refresh history on mount and when address/network/contracts change
  useEffect(() => {
    refreshHistory();
    const interval = setInterval(refreshHistory, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, network, tokenContractMap]);

  return (
    <HathorContext.Provider
      value={{
        isConnected,
        address,
        network,
        contractStates,
        getContractStateForToken,
        getContractIdForToken,
        coreAPI,
        connectWallet,
        disconnectWallet,
        switchNetwork,
        refreshContractStates,
        allTransactions,
        isLoadingHistory,
        lastHistoryUpdate,
        refreshHistory,
      }}
    >
      {children}
    </HathorContext.Provider>
  );
}

export function useHathor() {
  const context = useContext(HathorContext);
  if (context === undefined) {
    throw new Error('useHathor must be used within a HathorProvider');
  }
  return context;
}
