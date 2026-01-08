# TradingView Discord Auto-Updater Bot

A Discord bot that monitors messages for trading setups and automatically updates and publishes TradingView PineScript indicators.

## Features

- Monitors Discord channel for trading setup messages
- Parses stock tickers, breakout/breakdown levels, and targets
- Automatically updates PineScript indicator files
- Publishes to multiple TradingView indicators
- Day-based setup management (Monday-Friday)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Discord Bot Configuration
DISCORD_BOT_TOKEN=your_discord_bot_token_here
TARGET_CHANNEL_ID=1226485601902133320
TARGET_USER_ID=1101365896192213003
OUTPUT_CHANNEL_ID=1436462315829592145

# TradingView Session Cookies
# Get these from your browser's developer tools when logged into TradingView
# These cookies expire periodically and need to be refreshed
TRADINGVIEW_COOKIE=your_tradingview_cookie_string_here

# TradingView Script IDs
TRADINGVIEW_SCRIPT_ID_1=USER;d07048cd1bc440a9a05d7544eddaa260
TRADINGVIEW_SCRIPT_ID_2=USER;93048a846363444eb9fc928170a2d543
TRADINGVIEW_SCRIPT_ID_3=USER;b7d09b7e02b44df8af2045cf42cbe39b

# TradingView Script Versions
TRADINGVIEW_VERSION_1=78.0
TRADINGVIEW_VERSION_2=0.20
TRADINGVIEW_VERSION_3=5.0

# TradingView Username
TRADINGVIEW_USERNAME=stockcryptobots

# Optional: Draft Script ID (for save.js)
TRADINGVIEW_DRAFT_SCRIPT_ID=USER;5369896c2e834f1283386871c9f1ceff
```

### 3. Getting Your Discord Bot Token

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application or select an existing one
3. Go to the "Bot" section
4. Copy the bot token
5. Add it to your `.env` file

### 4. Getting TradingView Cookies

1. Log into TradingView in your browser
2. Open Developer Tools (F12)
3. Go to the Network tab
4. Make a request to TradingView (e.g., publish a script)
5. Find the request and copy the `Cookie` header value
6. Add it to your `.env` file as `TRADINGVIEW_COOKIE`

**Note:** These cookies expire periodically. You'll need to refresh them when the bot stops working.

### 5. Run the Bot

```bash
npm start
```

## How It Works

1. The bot monitors a specific Discord channel for messages from a specific user
2. When a message is detected, it parses the content for trading setups:
   - Stock tickers (e.g., SPY, TSLA, NVDA)
   - Breakdown levels: `🔻 Breakdown Below 628.00 🔻 626.10, 624.40, 622.75`
   - Breakout levels: `🔼 Breakout Above 631.50 🔼 633.80, 635.50, 637.20`
   - Rejection lines are ignored
3. The parsed setups are formatted and injected into PineScript files
4. The updated indicators are published to TradingView
5. Status updates are sent to the output Discord channel

## File Structure

- `bot.js` - Main Discord bot orchestrator
- `parser.js` - Message parsing logic
- `publish.js` - Publishes primary indicator
- `publish2.js` - Publishes second indicator (A+ Dashboard)
- `publish3.js` - Publishes third indicator (GOAT Scalp Levels)
- `save.js` - Draft saver (optional)
- `pinescriptcode.txt` - Primary PineScript indicator
- `aplusdash.txt` - Second PineScript indicator
- `goatscalplevels.txt` - Third PineScript indicator

## Security Notes

- **Never commit your `.env` file to git** - it's already in `.gitignore`
- TradingView cookies expire and need periodic updates
- Discord bot tokens should be kept secret
- If you accidentally commit secrets, rotate them immediately

## Troubleshooting

### Bot won't start
- Check that `DISCORD_BOT_TOKEN` is set in `.env`
- Verify the token is valid

### Publishing fails
- Check that `TRADINGVIEW_COOKIE` is current (cookies expire)
- Verify script IDs and versions are correct
- Check TradingView username is correct

### Parser not working
- Ensure message format matches expected pattern
- Check console logs for parsing errors

## License

ISC
