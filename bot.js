require('dotenv').config();
const { Client, GatewayIntentBits, Partials, ActivityType, User, GuildMember } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { SWJMessageParser } = require('./parser');

// Load configuration from environment variables
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || '';
const TARGET_CHANNEL_ID = process.env.TARGET_CHANNEL_ID || '1226485601902133320';
const TARGET_USER_ID = process.env.TARGET_USER_ID || '1101365896192213003';
const OUTPUT_CHANNEL_ID = process.env.OUTPUT_CHANNEL_ID || '1436462315829592145';

// Second indicator configuration
const SECOND_INDICATOR_FILE = 'aplusdash.txt'; // Update with your second indicator file name
const ENABLE_SECOND_INDICATOR = true; // Set to false to disable second indicator updates

// Third indicator configuration
const THIRD_INDICATOR_FILE = 'goatscalplevels.txt'; // Third indicator file name
const ENABLE_THIRD_INDICATOR = true; // Set to false to disable third indicator updates

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent
	],
	partials: [Partials.Channel]
});

client.once('clientReady', () => {
    client.user.setPresence({
        activities: [{ name: 'scalp alerts', type: ActivityType.Watching }],
        status: 'online'
    });
    console.log(`📡 Monitoring channel: ${TARGET_CHANNEL_ID} Named: ${client.channels.cache.get(TARGET_CHANNEL_ID).name}`);
    console.log(`📤 Output channel: ${OUTPUT_CHANNEL_ID} Named: ${client.channels.cache.get(OUTPUT_CHANNEL_ID).name}`);
    console.log(`👤 Monitoring user: ${TARGET_USER_ID}`);
});

function safeTruncate(text, max = 1800) {
	if (!text) return '';
	if (text.length <= max) return text;
	return text.slice(0, max) + '...';
}

function getDayOfWeek() {
	const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	const dayIndex = new Date().getDay();
	return days[dayIndex];
}

function getCurrentDate() {
	// Get current date in format "Dec 07, 2025" (MMM DD, YYYY)
	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const today = new Date();
	const month = months[today.getMonth()];
	const day = today.getDate().toString().padStart(2, '0');
	const year = today.getFullYear();
	return `${month} ${day}, ${year}`;
}

function updatePineScriptDefaultSetups(newSetupsString) {
	const pinePath = path.join(__dirname, 'pinescriptcode.txt');
	let content = fs.readFileSync(pinePath, 'utf8');
	const quoted = JSON.stringify(newSetupsString);
	const dayOfWeek = getDayOfWeek();
	
	console.log(`Current day: ${dayOfWeek}`);
	
	// If Monday, reset all day variables to empty strings first
	if (dayOfWeek === 'Monday') {
		console.log('Monday detected: Resetting all day setups...');
		content = content.replace(/defaultSetupsMonday\s*=\s*"(?:[^"\\]|\\.)*"/s, 'defaultSetupsMonday = ""');
		content = content.replace(/defaultSetupsTuesday\s*=\s*"(?:[^"\\]|\\.)*"/s, 'defaultSetupsTuesday = ""');
		content = content.replace(/defaultSetupsWednesday\s*=\s*"(?:[^"\\]|\\.)*"/s, 'defaultSetupsWednesday = ""');
		content = content.replace(/defaultSetupsThursday\s*=\s*"(?:[^"\\]|\\.)*"/s, 'defaultSetupsThursday = ""');
		content = content.replace(/defaultSetupsFriday\s*=\s*"(?:[^"\\]|\\.)*"/s, 'defaultSetupsFriday = ""');
	}
	
	// Update the appropriate day variable based on current day
	let dayVariable = '';
	switch (dayOfWeek) {
		case 'Monday':
			dayVariable = 'defaultSetupsMonday';
			break;
		case 'Tuesday':
			dayVariable = 'defaultSetupsTuesday';
			break;
		case 'Wednesday':
			dayVariable = 'defaultSetupsWednesday';
			break;
		case 'Thursday':
			dayVariable = 'defaultSetupsThursday';
			break;
		case 'Friday':
			dayVariable = 'defaultSetupsFriday';
			break;
		default:
			console.log(`Warning: Day ${dayOfWeek} is not a trading day. Skipping update.`);
			return pinePath;
	}
	
	// Replace the specific day's defaultSetups variable
	const regex = new RegExp(`(${dayVariable}\\s*=\\s*)"(?:[^"\\\\]|\\\\.)*"`, 's');
	content = content.replace(regex, `$1${quoted}`);
	
	// Update publication date to current date
	const publicationDateMatch = content.match(/publication_date\s*=\s*input\.string\("([^"]+)"/);
	if (publicationDateMatch) {
		const currentDate = getCurrentDate();
		content = content.replace(
			/(publication_date\s*=\s*input\.string\(")[^"]+(")/,
			`$1${currentDate}$2`
		);
		console.log(`Updated publication date to: ${currentDate}`);
	} else {
		console.log('Warning: Could not find publication_date to update');
	}
	
	fs.writeFileSync(pinePath, content, 'utf8');
	console.log(`Updated ${dayVariable} with new setups.`);
	return pinePath;
}

function updateSecondIndicatorPublicationDate() {
	if (!ENABLE_SECOND_INDICATOR) {
		return null;
	}
	
	const secondPinePath = path.join(__dirname, SECOND_INDICATOR_FILE);
	
	// Check if file exists
	if (!fs.existsSync(secondPinePath)) {
		console.log(`Warning: Second indicator file not found: ${SECOND_INDICATOR_FILE}`);
		return null;
	}
	
	let content = fs.readFileSync(secondPinePath, 'utf8');
	const currentDate = getCurrentDate();
	
	// Update publication date
	const publicationDateMatch = content.match(/publication_date\s*=\s*input\.string\("([^"]+)"/);
	if (publicationDateMatch) {
		content = content.replace(
			/(publication_date\s*=\s*input\.string\(")[^"]+(")/,
			`$1${currentDate}$2`
		);
		fs.writeFileSync(secondPinePath, content, 'utf8');
		console.log(`Updated second indicator publication date to: ${currentDate}`);
		return secondPinePath;
	} else {
		console.log('Warning: Could not find publication_date in second indicator file');
		return null;
	}
}

function updateThirdIndicatorSetups(newSetupsString) {
	if (!ENABLE_THIRD_INDICATOR) {
		return null;
	}
	
	const thirdPinePath = path.join(__dirname, THIRD_INDICATOR_FILE);
	
	// Check if file exists
	if (!fs.existsSync(thirdPinePath)) {
		console.log(`Warning: Third indicator file not found: ${THIRD_INDICATOR_FILE}`);
		return null;
	}
	
	let content = fs.readFileSync(thirdPinePath, 'utf8');
	const quoted = JSON.stringify(newSetupsString);
	const dayOfWeek = getDayOfWeek();
	
	console.log(`Updating third indicator - Current day: ${dayOfWeek}`);
	
	// If Monday, reset all day variables to empty strings first
	if (dayOfWeek === 'Monday') {
		console.log('Third indicator - Monday detected: Resetting all day setups...');
		content = content.replace(/defaultSetupsMonday\s*=\s*"(?:[^"\\]|\\.)*"/s, 'defaultSetupsMonday = ""');
		content = content.replace(/defaultSetupsTuesday\s*=\s*"(?:[^"\\]|\\.)*"/s, 'defaultSetupsTuesday = ""');
		content = content.replace(/defaultSetupsWednesday\s*=\s*"(?:[^"\\]|\\.)*"/s, 'defaultSetupsWednesday = ""');
		content = content.replace(/defaultSetupsThursday\s*=\s*"(?:[^"\\]|\\.)*"/s, 'defaultSetupsThursday = ""');
		content = content.replace(/defaultSetupsFriday\s*=\s*"(?:[^"\\]|\\.)*"/s, 'defaultSetupsFriday = ""');
	}
	
	// Update the appropriate day variable based on current day
	let dayVariable = '';
	switch (dayOfWeek) {
		case 'Monday':
			dayVariable = 'defaultSetupsMonday';
			break;
		case 'Tuesday':
			dayVariable = 'defaultSetupsTuesday';
			break;
		case 'Wednesday':
			dayVariable = 'defaultSetupsWednesday';
			break;
		case 'Thursday':
			dayVariable = 'defaultSetupsThursday';
			break;
		case 'Friday':
			dayVariable = 'defaultSetupsFriday';
			break;
		default:
			console.log(`Warning: Day ${dayOfWeek} is not a trading day. Skipping third indicator update.`);
			return null;
	}
	
	// Replace the specific day's defaultSetups variable
	const regex = new RegExp(`(${dayVariable}\\s*=\\s*)"(?:[^"\\\\]|\\\\.)*"`, 's');
	content = content.replace(regex, `$1${quoted}`);
	
	fs.writeFileSync(thirdPinePath, content, 'utf8');
	console.log(`Updated third indicator ${dayVariable} with new setups.`);
	return thirdPinePath;
}

function runPublish() {
	return new Promise((resolve, reject) => {
		const scriptPath = path.join(__dirname, 'publish.js');
		const child = spawn(process.execPath, [scriptPath], { stdio: ['ignore', 'pipe', 'pipe'] });
		let stdout = '';
		let stderr = '';
		child.stdout.on('data', (d) => { stdout += d.toString(); });
		child.stderr.on('data', (d) => { stderr += d.toString(); });
		child.on('exit', code => {
			if (code !== 0) {
				return reject(new Error('publish.js exited with code ' + code + (stderr ? (': ' + stderr) : '')));
			}
			let json = null;
			try {
				const match = stdout.match(/\{[\s\S]*\}$/m);
				json = match ? JSON.parse(match[0]) : JSON.parse(stdout);
			} catch (_) {}
			resolve({ stdout, stderr, json });
		});
		child.on('error', reject);
	});
}

function runPublish2() {
	return new Promise((resolve, reject) => {
		const scriptPath = path.join(__dirname, 'publish2.js');
		const child = spawn(process.execPath, [scriptPath], { stdio: ['ignore', 'pipe', 'pipe'] });
		let stdout = '';
		let stderr = '';
		child.stdout.on('data', (d) => { stdout += d.toString(); });
		child.stderr.on('data', (d) => { stderr += d.toString(); });
		child.on('exit', code => {
			if (code !== 0) {
				return reject(new Error('publish2.js exited with code ' + code + (stderr ? (': ' + stderr) : '')));
			}
			let json = null;
			try {
				const match = stdout.match(/\{[\s\S]*\}$/m);
				json = match ? JSON.parse(match[0]) : JSON.parse(stdout);
			} catch (_) {}
			resolve({ stdout, stderr, json });
		});
		child.on('error', reject);
	});
}

function runPublish3() {
	return new Promise((resolve, reject) => {
		const scriptPath = path.join(__dirname, 'publish3.js');
		const child = spawn(process.execPath, [scriptPath], { stdio: ['ignore', 'pipe', 'pipe'] });
		let stdout = '';
		let stderr = '';
		child.stdout.on('data', (d) => { stdout += d.toString(); });
		child.stderr.on('data', (d) => { stderr += d.toString(); });
		child.on('exit', code => {
			if (code !== 0) {
				return reject(new Error('publish3.js exited with code ' + code + (stderr ? (': ' + stderr) : '')));
			}
			let json = null;
			try {
				const match = stdout.match(/\{[\s\S]*\}$/m);
				json = match ? JSON.parse(match[0]) : JSON.parse(stdout);
			} catch (_) {}
			resolve({ stdout, stderr, json });
		});
		child.on('error', reject);
	});
}

client.on('messageCreate', async (message) => {
	try {
		if (message.channelId !== TARGET_CHANNEL_ID) return;
		if (message.author?.id !== TARGET_USER_ID) return;
		if (!message.content || message.content.trim().length === 0) return;

		console.log('Detected target message. Parsing...');
		const parser = new SWJMessageParser();
		parser.parseMessage(message.content);
		console.log(JSON.stringify(parser.setups, null, 2));

		const tradingViewInput = parser.formatForTradingView();
		if (!tradingViewInput || tradingViewInput.length === 0) {
			console.log('Parser produced empty result. Skipping.');
			await message.channel.send('Parser produced empty result. Skipping publish.');
			return;
		}

		const dayOfWeek = getDayOfWeek();
		updatePineScriptDefaultSetups(tradingViewInput);
		console.log(`Updated pinescriptcode.txt with new setups for ${dayOfWeek}.`);

		const publishResult = await runPublish();
		// const publishResult = { json: { success: true, pineTitle: 'Test', version: '1.0' } };
		console.log(`Publish completed (${dayOfWeek}).`);

		// Update and publish second indicator (only publication date)
		let secondIndicatorResult = null;
		if (ENABLE_SECOND_INDICATOR) {
			try {
				updateSecondIndicatorPublicationDate();
				secondIndicatorResult = await runPublish2();
				console.log('Second indicator publish completed.');
			} catch (err) {
				console.error('Error updating/publishing second indicator:', err);
				secondIndicatorResult = { error: err.message };
			}
		}

		// Update and publish third indicator (only setups, no publication date)
		let thirdIndicatorResult = null;
		if (ENABLE_THIRD_INDICATOR) {
			try {
				updateThirdIndicatorSetups(tradingViewInput);
				thirdIndicatorResult = await runPublish3();
				console.log('Third indicator publish completed.');
			} catch (err) {
				console.error('Error updating/publishing third indicator:', err);
				thirdIndicatorResult = { error: err.message };
			}
		}

		const setupsPreview = safeTruncate(tradingViewInput, 1800);
		let header = `Publish response received (${dayOfWeek}).`;
		if (publishResult?.json) {
			const r = publishResult.json;
			header = `Publish ${r.success ? 'succeeded' : 'failed'} (${dayOfWeek}) — title: ${r.pineTitle || 'n/a'}, version: ${r.version || 'n/a'}`;
			if (r.pineId || r.publishedstudyscript_id || r.digest) {
				header += `\nId: ${r.pineId || r.publishedstudyscript_id || 'n/a'}${r.digest ? `\nDigest: ${r.digest}` : ''}`;
			}
		}
		
		// Add second indicator status
		if (ENABLE_SECOND_INDICATOR && secondIndicatorResult) {
			if (secondIndicatorResult.error) {
				header += `\n\n⚠️ Second indicator: Error - ${secondIndicatorResult.error}`;
			} else if (secondIndicatorResult?.json) {
				const r2 = secondIndicatorResult.json;
				header += `\n\n✅ Second indicator: ${r2.success ? 'succeeded' : 'failed'} — title: ${r2.pineTitle || 'n/a'}, version: ${r2.version || 'n/a'}`;
			} else {
				header += `\n\n✅ Second indicator: Published (publication date updated)`;
			}
		}
		
		// Add third indicator status
		if (ENABLE_THIRD_INDICATOR && thirdIndicatorResult) {
			if (thirdIndicatorResult.error) {
				header += `\n\n⚠️ Third indicator: Error - ${thirdIndicatorResult.error}`;
			} else if (thirdIndicatorResult?.json) {
				const r3 = thirdIndicatorResult.json;
				header += `\n\n✅ Third indicator: ${r3.success ? 'succeeded' : 'failed'} — title: ${r3.pineTitle || 'n/a'}, version: ${r3.version || 'n/a'}`;
			} else {
				header += `\n\n✅ Third indicator: Published (setups updated)`;
			}
		}
		
		const stdoutPreview = safeTruncate(publishResult.stdout?.trim() || '', 1200);
		let reply = header;
		if (stdoutPreview) {
			reply += `\n\nRaw response:\n\`\`\`json\n${stdoutPreview}\n\`\`\``;
		}
		reply += `\n\nParsed setups:\n\`\`\`\n${setupsPreview}\n\`\`\``;

		const outputChannel = client.channels.cache.get(OUTPUT_CHANNEL_ID);
		await outputChannel?.send(reply);
	} catch (err) {
		console.error('Error handling message:', err);
		try {
			await message.channel.send(`Error while processing message: ${err.message || err}`);
		} catch (_) {}
	}
});

client.login(DISCORD_BOT_TOKEN).catch(err => {
	console.error('Failed to login:', err);
});


