# create-hathor-dapp

Create Hathor Network dApps with one command.

## Quick Start

```bash
npx create-hathor-dapp my-app
cd my-app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your dApp.

## What You Get

- **Wallet Integration** — Connect via Reown (WalletConnect) or MetaMask Snaps
- **Network Support** — Testnet and Mainnet with easy switching
- **Nano Contract Support** — Ready-to-use infrastructure for interacting with nano contracts
- **Mock Mode** — Test the UI without connecting a real wallet
- **Modern Stack** — Next.js 14, React 18, TypeScript, Tailwind CSS
- **Testing** — Unit tests (Vitest) and E2E tests (Playwright)
- **CI/CD** — GitHub Actions workflows for testing and deployment

## Configuration

After scaffolding, edit `.env.local` in your project:

```env
# WalletConnect Project ID (get one at https://cloud.walletconnect.com/)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Network Configuration
NEXT_PUBLIC_DEFAULT_NETWORK=testnet
NEXT_PUBLIC_USE_MOCK_WALLET=true

# Contract IDs
NEXT_PUBLIC_CONTRACT_IDS_TESTNET=["your_contract_id"]
NEXT_PUBLIC_CONTRACT_IDS_MAINNET=[]
```

## Resources

- [Hathor Documentation](https://docs.hathor.network)
- [Nano Contracts Guide](https://docs.hathor.network/guides/nano-contracts/)
- [Hathor Discord](https://discord.gg/hathor)

## License

MIT
