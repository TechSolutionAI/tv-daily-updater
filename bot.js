const { Client, GatewayIntentBits, Partials, ActivityType, User, GuildMember } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { SWJMessageParser } = require('./parser');

const DISCORD_BOT_TOKEN = process.env.DISCORD_TOKEN;
const TARGET_CHANNEL_ID = '1226485601902133320'; //goat-scalps channel id
const TARGET_USER_ID = '1389761466596327514';  //user id
const OUTPUT_CHANNEL_ID = '1396983481137107165'; //maro-testing channel id

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

function updatePineScriptDefaultSetups(newSetupsString) {
	const pinePath = path.join(__dirname, 'pinescriptcode.txt');
	const original = fs.readFileSync(pinePath, 'utf8');
	const quoted = JSON.stringify(newSetupsString);
	const replaced = original.replace(/defaultSetups\s*=\s*"(?:[^"\\]|\\.)*"/s, `defaultSetups = ${quoted}`);
	fs.writeFileSync(pinePath, replaced, 'utf8');
	return pinePath;
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

		updatePineScriptDefaultSetups(tradingViewInput);
		console.log('Updated pinescriptcode.txt with new defaultSetups.');

		const publishResult = await runPublish();
		console.log('Publish completed.');

		const setupsPreview = safeTruncate(tradingViewInput, 1800);
		let header = 'Publish response received.';
		if (publishResult?.json) {
			const r = publishResult.json;
			header = `Publish ${r.success ? 'succeeded' : 'failed'} — title: ${r.pineTitle || 'n/a'}, version: ${r.version || 'n/a'}`;
			if (r.pineId || r.publishedstudyscript_id || r.digest) {
				header += `\nId: ${r.pineId || r.publishedstudyscript_id || 'n/a'}${r.digest ? `\nDigest: ${r.digest}` : ''}`;
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


