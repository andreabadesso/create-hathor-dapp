function parseContractIds(value: string | undefined): string[] {
  try {
    const jsonValue = value || '[]';
    return JSON.parse(jsonValue) as string[];
  } catch (error) {
    console.error(`Failed to parse contract IDs:`, error);
    return [];
  }
}

export type Network = 'mainnet' | 'testnet';

// Next.js requires literal strings for NEXT_PUBLIC_* env vars to be replaced at build time
const CONTRACT_IDS_TESTNET = process.env.NEXT_PUBLIC_CONTRACT_IDS_TESTNET;
const CONTRACT_IDS_MAINNET = process.env.NEXT_PUBLIC_CONTRACT_IDS_MAINNET;

export const config = {
  useMockWallet: process.env.NEXT_PUBLIC_USE_MOCK_WALLET === 'true',
  defaultNetwork: (process.env.NEXT_PUBLIC_DEFAULT_NETWORK || 'mainnet') as Network,
  hathorNodeUrls: {
    'testnet': process.env.NEXT_PUBLIC_HATHOR_NODE_URL_TESTNET || 'https://node1.india.testnet.hathor.network/v1a',
    'mainnet': process.env.NEXT_PUBLIC_HATHOR_NODE_URL_MAINNET || 'https://node1.mainnet.hathor.network/v1a',
  },
  contractIds: {
    'testnet': parseContractIds(CONTRACT_IDS_TESTNET),
    'mainnet': parseContractIds(CONTRACT_IDS_MAINNET),
  },
  getContractIdsForNetwork: (network: Network): string[] => {
    return config.contractIds[network] || [];
  },
};
