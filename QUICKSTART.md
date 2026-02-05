# Quick Start Guide

## Getting Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.local.example .env.local
```

The default configuration uses mock wallet mode, so you can test immediately without a real wallet.

### 3. Run Development Server
```bash
npm run dev
```

### 4. Open in Browser
Navigate to [http://localhost:3000](http://localhost:3000)

## Testing with Mock Wallet

With `NEXT_PUBLIC_USE_MOCK_WALLET=true` (default), you can:

1. **Connect Wallet**: Click "Connect Wallet" and choose any option
2. **View Mock Balance**: See simulated HTR balance
3. **Place Bets**: Test the betting interface
4. **View Contract Info**: See mock contract state

All actions are simulated and no real transactions occur.

## Connecting a Real Wallet

### Prerequisites
- Hathor Wallet extension or Metamask with Hathor Snap
- HTR tokens on India Testnet
- Deployed HathorDice contract

### Steps

1. **Update Environment**:
```env
NEXT_PUBLIC_USE_MOCK_WALLET=false
NEXT_PUBLIC_CONTRACT_IDS=["your_contract_id_here"]
```

2. **Restart Server**:
```bash
npm run dev
```

3. **Connect Wallet**:
   - Click "Connect Wallet"
   - Choose Reown or Metamask Snaps
   - Approve connection in wallet

4. **Place a Bet**:
   - Enter bet amount
   - Set win chance or threshold
   - Review multiplier and payout
   - Click "Place Bet"
   - Confirm transaction in wallet

## Network Selection

Use the network selector in the top-right to switch between:
- **India Testnet** (active)
- **Mainnet** (coming soon)

## Contract Information

The Contract Information panel shows:
- House Edge percentage
- Maximum bet amount
- Available liquidity
- Total liquidity provided
- Random bit length
- Token UID

## Troubleshooting

### "Wallet not connected" error
- Ensure wallet extension is installed and unlocked
- Try refreshing the page
- Check that you're on the correct network

### "Contract state not loaded"
- Verify `NEXT_PUBLIC_CONTRACT_IDS` is set correctly
- Check that the contract exists on the selected network
- Ensure node URL is accessible

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Delete `.next` folder and rebuild: `rm -rf .next && npm run dev`
- Check that Node.js version is 18 or higher

## Next Steps

1. **Deploy Contract**: Deploy HathorDice to India Testnet
2. **Update Config**: Add contract ID to `.env.local`
3. **Test Features**: Try all game actions
4. **Customize**: Modify UI and add features

## Development Tips

- Use mock mode for rapid UI development
- Test calculations with different contract parameters
- Monitor browser console for errors
- Use React DevTools to inspect component state

## Support

- Check [README.md](./README.md) for detailed documentation
- Review [INTEGRATION.md](./INTEGRATION.md) for technical details
- Open an issue on GitHub for bugs or questions

---

Happy betting! 🎲
