# Debug Mode

## Enabling Debug Mode

To enable debug mode in the Fortune Tiger slot machine, open your browser console and run:

```javascript
localStorage.setItem('debug_mode', 'true');
```

Then refresh the page. You'll see a purple "🐛 Debug Spin" button in the top-left corner.

## Disabling Debug Mode

To disable debug mode:

```javascript
localStorage.removeItem('debug_mode');
// or
localStorage.setItem('debug_mode', 'false');
```

Then refresh the page.

## What Does Debug Mode Do?

The debug button allows you to test the spinning animation and transaction flow without actually:
- Connecting a wallet
- Placing a real bet
- Spending any tokens

When you click "🐛 Debug Spin", it will:
1. **Ask you to choose**: Click OK to WIN, or Cancel to LOSE
2. Start the spinning animation immediately
3. Show "CONFIRMING..." state for 2 seconds (simulating wallet confirmation)
4. Show "Transaction confirmed! Spinning..." toast
5. Continue spinning for 5 seconds (simulating blockchain confirmation)
6. Stop at the result you chose (guaranteed win or guaranteed lose)
7. If you chose WIN, show the "WINNER CHICKEN DINNER" animation
8. Play spinning sound effect (if `spin.mp3` exists in `public/sounds/`)

This is useful for:
- Testing the UI/UX flow
- Checking animations
- Debugging audio playback
- Testing the winning animation
- Demonstrating the app without needing a wallet connection

## Audio

The app will automatically play a spinning sound effect when the reels are spinning.

### Automatic Fallback Sound

**No setup required!** If the `spin.mp3` file is missing, the app will automatically generate a spinning sound using Web Audio API. You'll see this console message:
- `🔊 Playing Web Audio API fallback sound`

### Optional: Add Better Sound

For a more realistic casino experience:

1. Download a free slot machine spin sound (MP3 format)
   - Mixkit: https://mixkit.co/free-sound-effects/casino/
   - Freesound: https://freesound.org/ (search "slot machine spin")
   - Pixabay: https://pixabay.com/sound-effects/search/slot%20machine/

2. Rename the file to `spin.mp3`

3. Place it in `public/sounds/spin.mp3`

4. Refresh the browser

5. Check console for "✅ Audio file loaded successfully" and "🔊 Playing MP3 audio" messages

See `public/sounds/README.md` for detailed audio setup instructions.

## Notes

- The debug button is only visible when debug mode is enabled
- You can toggle debug mode at any time by changing localStorage
- Debug spins don't affect your real balance or create real transactions
- You can choose to win or lose before each debug spin
- Audio will only play if `spin.mp3` exists in the `public/sounds/` folder
- If audio is blocked by browser, it will play after user interaction (clicking debug button)
