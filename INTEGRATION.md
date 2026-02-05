# HathorDice DApp Integration Summary

## Overview

This document summarizes the integration of the HathorDice DApp with the Hathor Network and the HathorDice Nano Contract.

## Implementation Status

### ✅ Completed Features

1. **Environment Configuration**
   - Mock wallet mode for development
   - Network selection (India Testnet / Mainnet)
   - Configurable node URLs
   - Contract ID management

2. **Hathor Core API Service** (`lib/hathorCoreAPI.ts`)
   - Blueprint information fetching
   - Contract state retrieval
   - Transaction history
   - Network-aware API calls

3. **Hathor RPC Service** (`lib/hathorRPC.ts`)
   - Full RPC API implementation
   - Mock mode support
   - Methods implemented:
     - `htr_getConnectedNetwork`
     - `htr_getBalance`
     - `htr_getAddress`
     - `htr_sendNanoContractTx`

4. **Hathor Context** (`contexts/HathorContext.tsx`)
   - Wallet connection management
   - Contract state management
   - Network switching
   - Bet placement integration

5. **UI Components**
   - `WalletConnectionModal`: Reown and Metamask Snaps support
   - `NetworkSelector`: Network switching with mainnet restriction
   - `ContractInfoPanel`: Real-time contract state display
   - Custom Dialog and Toast components

6. **Updated Components**
   - `PlaceBetCard`: Integrated with contract parameters
     - Dynamic max bet enforcement
     - Contract-based calculations
     - Real-time payout computation
   - `Header`: Wallet connection flow
   - `Page`: Contract info display

7. **Utility Functions**
   - Dynamic calculations using contract parameters
   - Support for variable random bit length
   - Configurable house edge
   - Token amount formatting

## Contract Integration

### Contract Parameters Used

```typescript
interface ContractState {
  token_uid: string;              // Token for betting
  max_bet_amount: number;         // Maximum bet limit
  house_edge_basis_points: number; // House edge (e.g., 200 = 2%)
  random_bit_length: number;      // Random number bits (16-32)
  available_tokens: number;       // Current liquidity
  total_liquidity_provided: number;
  liquidity_providers: Record<string, number>;
  balances: Record<string, number>;
}
```

### Calculation Formulas

**Multiplier:**
```
multiplier = (2^randomBitLength / threshold) * (1 - houseEdge)
```

**Payout:**
```
payout = (betAmount * 2^randomBitLength * (10000 - houseEdgeBasisPoints)) / (10000 * threshold)
```

**Win Chance:**
```
winChance = (threshold / 2^randomBitLength) * 100
```

### RPC Integration

The DApp uses the Hathor RPC API to:
1. Connect to user wallets
2. Query balances and addresses
3. Submit nano contract transactions
4. Handle user confirmations

### Transaction Flow

1. User initiates bet
2. DApp validates amount and parameters
3. Creates nano contract transaction:
   ```typescript
   {
     method: 'place_bet',
     nc_id: contractId,
     actions: [{
       type: 'deposit',
       amount: betAmount,
       token: tokenUid,
       address: userAddress
     }],
     args: [betAmount, threshold],
     push_tx: true
   }
   ```
4. Wallet prompts user for confirmation
5. Transaction submitted to network
6. DApp displays result

## Architecture Decisions

### 1. Mock Mode
- Allows development without wallet
- Simulates all RPC calls
- Configurable via environment variable

### 2. Network Abstraction
- Single API service per network
- Easy network switching
- Mainnet preparation

### 3. Context-Based State
- Centralized wallet state
- Contract state caching
- Automatic refresh on network change

### 4. Component Isolation
- Reusable UI components
- Separation of concerns
- Easy testing and maintenance

## File Structure

```
lib/
├── config.ts           # Environment configuration
├── hathorRPC.ts        # RPC service (wallet communication)
├── hathorCoreAPI.ts    # Core API (blockchain data)
├── utils.ts            # Calculation utilities
└── toast.tsx           # Notification system

contexts/
└── HathorContext.tsx   # Wallet & contract state

components/
├── WalletConnectionModal.tsx
├── NetworkSelector.tsx
├── ContractInfoPanel.tsx
└── PlaceBetCard.tsx (updated)

types/
└── hathor.ts           # TypeScript definitions
```

## Configuration

### Environment Variables

```env
NEXT_PUBLIC_USE_MOCK_WALLET=true
NEXT_PUBLIC_DEFAULT_NETWORK=testnet
NEXT_PUBLIC_HATHOR_NODE_URL_TESTNET=https://node1.india.testnet.hathor.network/v1a
NEXT_PUBLIC_HATHOR_NODE_URL_MAINNET=https://node1.mainnet.hathor.network/v1a
NEXT_PUBLIC_CONTRACT_IDS=["contract_id"]
```

## Testing

### Mock Mode Testing
1. Set `NEXT_PUBLIC_USE_MOCK_WALLET=true`
2. Run `npm run dev`
3. Test all features without wallet

### Wallet Integration Testing
1. Set `NEXT_PUBLIC_USE_MOCK_WALLET=false`
2. Install Hathor Wallet or Metamask Snap
3. Connect wallet
4. Test on India Testnet

## Next Steps

### Immediate
1. Deploy contract to India Testnet
2. Update `NEXT_PUBLIC_CONTRACT_IDS` with real contract ID
3. Test with real wallet
4. Verify all calculations match contract

### Future Enhancements
1. **Add Liquidity Integration**
   - Implement `add_liquidity` method
   - Calculate adjusted liquidity shares
   - Display LP position

2. **Remove Liquidity Integration**
   - Implement `remove_liquidity` method
   - Calculate maximum withdrawal
   - Handle LP token burning

3. **Withdraw Integration**
   - Implement `claim_balance` method
   - Display claimable balance
   - Handle withdrawals

4. **History & Statistics**
   - Fetch contract history
   - Display recent bets
   - Show win/loss statistics
   - Leaderboard

5. **Advanced Features**
   - Multi-token support
   - Custom token selection
   - Batch betting
   - Auto-bet functionality

## Known Issues

1. **TypeScript Cache**: May show stale errors for sonner import
   - Solution: Restart TypeScript server or IDE

2. **Network Switching**: Requires page refresh when connected
   - Solution: Implement wallet network change detection

3. **Balance Updates**: Not real-time
   - Solution: Add polling or WebSocket support

## API Endpoints Used

### Hathor Core API
- `GET /nc_blueprint/{blueprintId}` - Blueprint info
- `GET /nc_state/{contractId}` - Contract state
- `GET /nc_history/{contractId}` - Transaction history
- `GET /transaction?id={txId}` - Transaction details

### Hathor RPC API
- `htr_getConnectedNetwork` - Network info
- `htr_getBalance` - Token balances
- `htr_getAddress` - Wallet addresses
- `htr_sendNanoContractTx` - Submit transactions

## Security Considerations

1. **Input Validation**
   - Bet amount validation
   - Threshold range checking
   - Balance verification

2. **Transaction Safety**
   - User confirmation required
   - Clear transaction details
   - Error handling

3. **Environment Security**
   - No private keys in code
   - Environment variables for config
   - Separate test/prod configs

## Performance Optimizations

1. **State Caching**
   - Contract state cached in context
   - Refresh on demand
   - Network-aware caching

2. **Lazy Loading**
   - Components loaded on demand
   - Contract state fetched when needed

3. **Calculation Efficiency**
   - Pre-computed values
   - Memoized calculations
   - Efficient formulas

## Deployment Checklist

- [ ] Set production environment variables
- [ ] Deploy contract to network
- [ ] Update contract IDs
- [ ] Test wallet connections
- [ ] Verify calculations
- [ ] Test all transaction types
- [ ] Monitor for errors
- [ ] Set up analytics

## Support & Resources

- **Hathor Docs**: https://docs.hathor.network
- **RPC Spec**: hathor-rpc-lib OpenRPC
- **Contract Source**: HathorDice blueprint
- **Network Explorer**: https://explorer.hathor.network

---

**Integration Date**: 2024
**Status**: Ready for Testing
**Next Milestone**: Testnet Deployment
