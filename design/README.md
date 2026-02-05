# HathorDice dApp - Design Files

This directory contains the complete UI/UX design for the HathorDice dApp.

## Files

### 1. `UI_UX_DESIGN.md`
Comprehensive design document including:
- Logo concept and design rationale
- ASCII mockups for both wallet states
- Color scheme and typography specifications
- Interactive elements and components
- Responsive design guidelines
- Accessibility considerations
- Animation and transition specifications

### 2. `mockup-disconnected.html`
Interactive HTML mockup showing the dApp when wallet is **not connected**:
- Welcome hero section with connect button
- Recent bets table on the left (2/3 of screen)
- Game actions on the right (1/3 of screen)
- Token selector in actions panel
- "Place a Bet" action open by default, others collapsed
- Real-time calculations with TypeScript
- No scrolling on main page (app-like experience)

**To view**: Open this file in any modern web browser

### 3. `mockup-connected.html`
Interactive HTML mockup showing the dApp when wallet **is connected**:
- Wallet address display with disconnect button
- Balance card showing wallet + contract balances
- Recent bets with user's bets highlighted on the left (2/3 of screen)
- Game actions on the right (1/3 of screen)
- Token selector in actions panel
- Quick amount buttons (25%, 50%, 75%, MAX) with functionality
- "Place a Bet" action open by default, others collapsed
- Real-time calculation displays with TypeScript
- No scrolling on main page (app-like experience)

**To view**: Open this file in any modern web browser

### 4. `logo.svg`
Vector logo for HathorDice featuring:
- 3D dice with gradient colors
- Blockchain connection elements
- Sparkle accents
- Scalable SVG format

## Design Principles

### Color Palette
```
Primary Purple:   #6B46C1 → #7C3AED (gradient)
Secondary Cyan:   #06B6D4
Accent Gold:      #F59E0B
Success Green:    #10B981
Error Red:        #EF4444
Background Dark:  #0F172A → #1E293B (gradient)
Text Gray:        #94A3B8
```

### Typography
- **Headers**: Inter Bold, 24px
- **Body**: Inter Regular, 16px
- **Numbers**: JetBrains Mono, 16px
- **Buttons**: Inter SemiBold, 16px

### Key Features

#### Wallet Disconnected State
- Prominent "Connect Wallet" call-to-action
- All actions visible for exploration
- Recent bets from other players
- Educational tooltips and information

#### Wallet Connected State
- Balance overview (wallet + contract)
- Quick amount buttons (25%, 50%, 75%, MAX)
- Real-time bet calculations
- User's bets highlighted in history
- Smooth transitions and animations

#### Betting Interface
- Toggle between threshold and win chance input
- Visual slider for win chance
- Real-time calculation of:
  - Threshold (0-65,535)
  - Multiplier (based on house edge)
  - Potential payout
- Clear display of betting parameters

#### Multi-Token Support
- Token selector dropdown (HTR, USDC, Custom)
- Automatic contract selection based on token
- Token symbol displayed in all amount fields
- Custom contract address option

## Responsive Design

### Desktop (>1024px)
- Full two-column layout
- All features visible
- Expanded tables and forms

### Tablet (768px - 1024px)
- Single column layout
- Stacked sections
- Maintained functionality

### Mobile (<768px)
- Optimized touch targets (44x44px minimum)
- Simplified table views
- Bottom sheet for actions
- Native number inputs

## Interaction Flows

### 1. First Visit
```
Landing → Explore Actions → View Recent Bets → Connect Wallet
```

### 2. Placing a Bet
```
Connect Wallet → Enter Amount → Set Win Chance → Review Calculation → Place Bet → Confirm Transaction → View Result
```

### 3. Managing Liquidity
```
Navigate to Liquidity Section → Enter Amount → Confirm → Transaction Processing → Balance Update
```

### 4. Withdrawing
```
View Available Balance → Click MAX or Enter Amount → Confirm Withdrawal → Funds to Wallet
```

## Formulas Used

### Threshold ↔ Win Chance Conversion
```javascript
// Win chance (%) to threshold
threshold = Math.floor(winChance * 65536 / 100)

// Threshold to win chance (%)
winChance = (threshold / 65536) * 100
```

### Payout Calculation
```javascript
// Multiplier (with house edge)
multiplier = (65536 / threshold) * (1 - houseEdge)

// Payout
payout = betAmount * multiplier
```

### Available Balance
```javascript
availableBalance = walletBalance + contractBalance
```

## Accessibility Features

- ✅ Keyboard navigation support
- ✅ ARIA labels for screen readers
- ✅ High contrast mode compatible
- ✅ Clear focus indicators
- ✅ Descriptive error messages
- ✅ Minimum touch target sizes (44x44px)

## Animations

1. **Wallet Connection**: Fade-in (300ms)
2. **Bet Placement**: Dice roll animation
3. **Win/Lose**: Confetti (win) / Shake (lose)
4. **Balance Updates**: Count-up animation
5. **New Bets**: Slide-in from top
6. **Button Hover**: Scale + glow effect

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Next Steps

1. **Implementation**: Convert mockups to React components
2. **Integration**: Connect to Hathor Network via Reown/MetaMask
3. **Testing**: User testing with real wallets
4. **Optimization**: Performance and loading time improvements
5. **Enhancement**: Add statistics dashboard and leaderboard

## Notes

- House edge default: 2% (configurable per contract)
- Threshold range: 1 - 65,535
- Win chance range: 0.001% - 99.999%
- All amounts support decimal precision
- Real-time updates every 5 seconds for recent bets

## Design Rationale

### Why Dark Theme?
- Reduces eye strain for extended use
- Common in crypto/blockchain applications
- Makes colorful elements (wins, losses) stand out
- Professional and modern aesthetic

### Why Prominent Actions?
- Users can explore before connecting wallet
- Reduces friction in user journey
- Educational for new users
- Transparent about available features

### Why Real-time Calculations?
- Helps users understand risk/reward
- Reduces errors in bet placement
- Builds trust through transparency
- Improves user confidence

### Why Quick Amount Buttons?
- Speeds up common actions
- Reduces input errors
- Better mobile experience
- Industry standard pattern

## Feedback Welcome

This design is a starting point. Please provide feedback on:
- Color scheme preferences
- Layout improvements
- Additional features
- Accessibility concerns
- Mobile experience
- Animation preferences

---

**Created for**: HathorDice dApp  
**Platform**: Hathor Network  
**Technology**: Nano Contracts  
**Wallets**: Reown, MetaMask
