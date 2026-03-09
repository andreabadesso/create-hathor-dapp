# AGENTS.md - AI Agent Instructions for create-hathor-dapp

This document provides instructions for AI agents (like Claude, GPT, etc.) working with this codebase.

## Project Overview

**create-hathor-dapp** is a template for building decentralized applications on the Hathor Network. It provides:

- Wallet integration (MetaMask Snaps & Reown/WalletConnect)
- Network switching (testnet/mainnet)
- Nano contract interaction infrastructure
- Balance management
- Mock mode for development

## Project Structure

```
create-hathor-dapp/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout with all providers
│   ├── page.tsx            # Main home page
│   └── globals.css         # Global styles
├── components/             # React components
│   ├── Header.tsx          # App header with wallet connection
│   ├── BalanceCard.tsx     # Display wallet balance
│   ├── ContractInfoPanel.tsx # Show contract state
│   ├── NetworkSelector.tsx # Network switching dropdown
│   ├── TokenSelector.tsx   # Token selection dropdown
│   ├── WalletConnectionModal.tsx # Wallet connection UI
│   └── ui/                 # Reusable UI primitives
├── contexts/               # React Context providers
│   ├── HathorContext.tsx   # Network & contract state management
│   ├── WalletContext.tsx   # Wallet balance & transactions
│   ├── MetaMaskContext.tsx # MetaMask Snaps integration
│   ├── WalletConnectContext.tsx # Reown/WalletConnect integration
│   └── UnifiedWalletContext.tsx # Unified wallet adapter
├── lib/                    # Core utilities
│   ├── config.ts           # Environment configuration
│   ├── hathorRPC.ts        # RPC service for wallet communication
│   ├── hathorCoreAPI.ts    # Blockchain data queries
│   ├── utils.ts            # Formatting utilities
│   └── walletConnectConfig.ts # WalletConnect setup
├── types/                  # TypeScript definitions
├── __tests__/              # Unit and integration tests
├── __mocks__/              # Test mocks
└── e2e/                    # End-to-end tests (Playwright)
```

## How to Create a New dApp

### 1. Clone and Setup

```bash
git clone https://github.com/andreabadesso/create-hathor-dapp.git my-dapp
cd my-dapp
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# Required: Get from https://cloud.walletconnect.com/
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# Network: 'testnet' or 'mainnet'
NEXT_PUBLIC_DEFAULT_NETWORK=testnet

# Your nano contract IDs (JSON array)
NEXT_PUBLIC_CONTRACT_IDS_TESTNET=["your_contract_id"]
NEXT_PUBLIC_CONTRACT_IDS_MAINNET=[]

# App metadata
NEXT_PUBLIC_APP_NAME=My Hathor dApp
NEXT_PUBLIC_APP_DESCRIPTION=Description of my dApp
```

### 3. Customize the Template

**Update app metadata:**
- `app/layout.tsx` - Update page title and description
- `lib/walletConnectConfig.ts` - Update WalletConnect metadata
- `components/Header.tsx` - Update app name

**Create your UI:**
- Modify `app/page.tsx` to build your main interface
- Add new pages in `app/` directory
- Create new components in `components/`

### 4. Interact with Nano Contracts

**Send a transaction:**
```typescript
import { useWallet } from '@/contexts/WalletContext';
import { useHathor } from '@/contexts/HathorContext';

function MyComponent() {
  const { sendNanoContractTx } = useWallet();
  const { network, getContractIdForToken, getContractStateForToken } = useHathor();

  const handleAction = async () => {
    const contractId = getContractIdForToken('HTR');
    const contractState = getContractStateForToken('HTR');
    const tokenUid = contractState?.token_uid || '00';

    const result = await sendNanoContractTx({
      network,
      nc_id: contractId,
      method: 'your_method_name',
      args: [arg1, arg2],
      actions: [
        {
          type: 'deposit',
          amount: '1000', // in cents (10.00 tokens)
          token: tokenUid,
        },
      ],
      push_tx: true,
    });

    console.log('TX Hash:', result.response.hash);
  };
}
```

**Read contract state:**
```typescript
import { useHathor } from '@/contexts/HathorContext';

function ContractInfo() {
  const { getContractStateForToken, coreAPI } = useHathor();

  // From context (cached)
  const state = getContractStateForToken('HTR');

  // Direct API call
  const fetchState = async () => {
    const state = await coreAPI.getContractState('contract_id');
    const history = await coreAPI.getContractHistory('contract_id', 100);
  };
}
```

## Key Concepts for Agents

### Wallet Connection Flow

1. User clicks "Connect Wallet"
2. `WalletConnectionModal` shows options (MetaMask Snaps or Reown)
3. Selected provider's `connect()` is called
4. `UnifiedWalletContext` provides unified `WalletAdapter` interface
5. `HathorContext` syncs address and network from connected wallet
6. `WalletContext` manages balance fetching via `HathorRPCService`

### Network Management

- Network is stored in localStorage (`hathor_selected_network`)
- Changing network disconnects the wallet (required by Hathor wallets)
- Contract states are re-fetched when network changes
- `HathorCoreAPI` uses correct node URL based on network

### RPC Service Modes

`HathorRPCService` supports three modes:
1. **Mock mode** - For development without wallet
2. **MetaMask Snaps** - Uses `wallet_invokeSnap`
3. **WalletConnect** - Uses WalletConnect client

### Important Files to Understand

| File | Purpose |
|------|---------|
| `contexts/HathorContext.tsx` | Central state for network, contracts, connection |
| `contexts/WalletContext.tsx` | Balance management and transaction sending |
| `lib/hathorRPC.ts` | RPC communication with wallets |
| `lib/hathorCoreAPI.ts` | Direct blockchain data queries |
| `lib/config.ts` | Environment variable parsing |

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run ESLint
npm run test         # Run unit tests
npm run test:coverage # Tests with coverage report
npm run test:e2e     # Run Playwright E2E tests
```

## Testing Guidelines

- Unit tests in `__tests__/unit/`
- Integration tests in `__tests__/integration/`
- E2E tests in `e2e/`
- Mocks in `__mocks__/`
- Coverage thresholds: 80% lines/statements/functions, 70% branches

## Common Tasks for Agents

### Adding a New Contract Method

1. Add method to your nano contract
2. Create a function in your component or context that calls `sendNanoContractTx`
3. Handle the response and update UI accordingly

### Adding a New Page

1. Create `app/your-page/page.tsx`
2. Import and use contexts (`useHathor`, `useWallet`, etc.)
3. Wrap with `Header` component for consistent navigation

### Adding Contract State Fields

1. Update `types/hathor.ts` with new fields in `ContractState`
2. Update `lib/hathorCoreAPI.ts` `getContractState()` to fetch new fields
3. Use in components via `getContractStateForToken()`

### Debugging Wallet Issues

1. Check browser console for RPC errors
2. Enable mock mode (`NEXT_PUBLIC_USE_MOCK_WALLET=true`) to test UI
3. Verify network matches between dApp and wallet
4. Check contract IDs are correct for the network

## Resources

- [Hathor Documentation](https://docs.hathor.network)
- [Nano Contracts Guide](https://docs.hathor.network/guides/nano-contracts/)
- [Hathor Wallet API](https://docs.hathor.network/guides/headless-wallet/http-api/)
- [WalletConnect Docs](https://docs.walletconnect.com)
