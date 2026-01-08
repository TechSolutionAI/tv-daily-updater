class SWJMessageParser {
    constructor() {
        this.setups = [];
    }

    /**
     * Parse a complete message containing multiple stock setups
     * @param {string} message
     * @returns {string}
     */
    parseMessage(message) {
        this.setups = [];
        
        // Split message into lines and process each stock
        const lines = message.split('\n');
        let currentStock = null;
        let currentSetups = [];
        
        for (let line of lines) {
            line = line.trim();
            
            // Check if this is a stock ticker (uppercase, no spaces, no special chars)
            if (this.isStockTicker(line)) {
                // Save previous stock if exists
                if (currentStock && currentSetups.length > 0) {
                    this.setups.push({
                        ticker: currentStock,
                        setups: [...currentSetups]
                    });
                }
                
                currentStock = line;
                currentSetups = [];
                continue;
            }
            
            // Parse setup lines
            const setup = this.parseSetupLine(line);
            if (setup) {
                currentSetups.push(setup);
            }
        }
        
        // Add the last stock
        if (currentStock && currentSetups.length > 0) {
            this.setups.push({
                ticker: currentStock,
                setups: [...currentSetups]
            });
        }
        
        return this.formatForTradingView();
    }

    /**
     * Check if a line is a stock ticker
     */
    isStockTicker(line) {
        // Stock tickers are typically 2-5 uppercase letters
        return /^[A-Z]{2,5}$/.test(line);
    }

    /**
     * Parse a single setup line
     */
    parseSetupLine(line) {
        // Match patterns like (note: we IGNORE all Rejection lines):
        // ❌ Rejection Short Near 630.70 🔻 628.20, 626.90, 625.10  ← ignored
        // ❌ Rejection Near 638.00 🔻 637.20, 636.20               ← ignored
        // ❌ Rejection 323.38 🔻 319.80, 317.10, 314.40            ← ignored
        // 🔻 Breakdown Below 628.00 🔻 626.10, 624.40, 622.75
        // 🔻 Breakdown 319.38 🔻 317.10, 314.40, 311.25
        // 🔼 Breakout Above 631.50 🔼 633.80, 635.50, 637.20
        // 🔼 Breakout 324.45 🔼 327.60, 330.90, 334.70
        
const rejectionPattern =/❌\s*Rejection(?:\s+Short)?(?:\s+Near)?\s+([\d.]+)\s*🔻\s*([\d.,\s]+)/i;
const breakdownPattern =/🔻\s*(?:Aggressive\s+)?Breakdown(?:\s+Entry)?(?:\s+Below)?\s+([\d.]+)\s*🔻\s*([\d.,\s]+)/i;
const breakoutPattern =/🔼\s*(?:Aggressive\s+)?Breakout(?:\s+Entry)?(?:\s+Above)?\s+([\d.]+)\s*🔼\s*([\d.,\s]+)/i;

        
        let match;
        let setupType = '';
        let mainLevel = '';
        let targets = [];
        
        // If this is a Rejection line, ignore it entirely
        match = line.match(rejectionPattern);
        if (match) {
            return null;
        }

        // Try breakdown pattern
        match = line.match(breakdownPattern);
        if (match) {
            setupType = 'Breakdown';
            mainLevel = parseFloat(match[1]);
            targets = this.parseTargets(match[2]);
        } else {
            // Try breakout pattern
            match = line.match(breakoutPattern);
            if (match) {
                setupType = 'Breakout';
                mainLevel = parseFloat(match[1]);
                targets = this.parseTargets(match[2]);
            }
        }
        
        if (setupType && mainLevel) {
            return {
                type: setupType,
                mainLevel: mainLevel,
                targets: targets
            };
        }
        
        return null;
    }

    /**
     * Parse target levels from string
     */
    parseTargets(targetsStr) {
        return targetsStr
            .split(',')
            .map(t => t.trim())
            .filter(t => t.length > 0)
            .map(t => parseFloat(t))
            .filter(t => !isNaN(t));
    }

    /**
     * Format setups for TradingView indicator
     */
    formatForTradingView() {
        const lines = [];
        
        for (const stock of this.setups) {
            for (const setup of stock.setups) {
                const allLevels = [setup.mainLevel, ...setup.targets];
                const levelsStr = allLevels.join(',');
                const line = `${stock.ticker}|${setup.type}|${levelsStr}`;
                lines.push(line);
            }
        }
        
        return lines.join(';');
    }

    /**
     * Get a formatted output for easy copy-paste
     */
    getFormattedOutput() {
        const tradingViewString = this.formatForTradingView();
        
        return {
            tradingViewInput: tradingViewString,
            summary: this.getSummary(),
            copyPasteReady: `// Copy this into TradingView indicator input:\n${tradingViewString}`
        };
    }

    /**
     * Get a summary of parsed setups
     */
    getSummary() {
        const summary = [];
        
        for (const stock of this.setups) {
            summary.push(`${stock.ticker}:`);
            for (const setup of stock.setups) {
                summary.push(`  ${setup.type}: ${setup.mainLevel} → [${setup.targets.join(', ')}]`);
            }
        }
        
        return summary.join('\n');
    }
}
//⬆️ 🐂  ⬆️ 🐂 🧨
//testing
function testParser() {
    const parser = new SWJMessageParser();
    
    const testMessage = `Stocks with Josh — 8/6/25, 4:12 PM
A+ Scalp Setups — Wed Aug 6

SPY
❌ Rejection Short Near 630.70 🔻 628.20, 626.90, 625.10
🔻 Breakdown Below 628.00 🔻 626.10, 624.40, 622.75
🔼 Breakout Above 631.50 🔼 633.80, 635.50, 637.20
🔄 Bounce Zone 624.20 – 625.10 
⚠️ Bias: Market likely opens in chop between 628 – 630.70 — with rejection short at 630.70 if weak push fails. Breakdown under 628 has strong follow-through potential — Avoid breakout unless you see volume and candle expansion above 631.50 — anything else is a trap

TSLA
❌ Rejection Short Near 312.89 🔻 308.70, 306.30, 303.80
🔻 Breakdown Below 306.02 🔻 303.40, 301.00, 297.60
🔼 Breakout Above 312.89 🔼 316.00, 318.40, 321.80
🔄 Bounce Zone 303.80 
⚠️ Holding under 312.89 keeps pressure down; clean flush under 306.02 has room  down to 303.80 must hold for bulls to avoid deeper fade

NVDA
❌ Rejection Short Near 178.70 🔻 176.10, 174.50, 173.20
🔻 Breakdown Below 175.89 🔻 174.20, 172.60, 170.80
🔼 Breakout Above 178.88 🔼 180.40, 181.90, 183.50
🔄 Bounce Zone 174.12 – 174.40
⚠️ Bearish bias into open under 176.50 with gap below 175.89 offering best continuation short. Break above 178.88 reclaims major resistance with room to run`;

    const result = parser.parseMessage(testMessage);
    const output = parser.getFormattedOutput();
    
    console.log('=== PARSED SETUPS ===');
    console.log(output.summary);
    console.log('\n=== TRADINGVIEW INPUT ===');
    console.log(output.tradingViewInput);
    console.log('\n=== COPY-PASTE READY ===');
    console.log(output.copyPasteReady);
    
    return output;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SWJMessageParser, testParser };
}

// Run test if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
    testParser();
} 