const Discord = require('discord.js'),
	parser = require('discord-command-parser'),
	{ commands, analytics } = require('./commands')

const analytics = { }
const client = new Discord.Client({
	presence: {
		status: "online",
		activity: {
			type: 'WATCHING', 
			name: 'NovelCOVID', 
			url: 'https://disease.sh'
		}
	},
	restTimeOffset: 100,
	partials: ["MESSAGE", "CHANNEL", "REACTION"],
	ws: {
		Intents: ["MESSAGE_CREATE", "MESSAGE_UPDATE", "GUILD_MESSAGE_REACTIONS"],
	},
	disabledEvents: [
		"GUILD_MEMBER_ADD",
		"GUILD_MEMBER_REMOVE",
		"GUILD_MEMBER_UPDATE",
		"GUILD_MEMBERS_CHUNK",
		"GUILD_INTEGRATIONS_UPDATE",
		"GUILD_ROLE_CREATE",
		"GUILD_ROLE_DELETE",
		"GUILD_ROLE_UPDATE",
		"GUILD_BAN_ADD",
		"GUILD_BAN_REMOVE",
		"GUILD_EMOJIS_UPDATE",
		"CHANNEL_PINS_UPDATE",
		"CHANNEL_CREATE",
		"CHANNEL_DELETE",
		"CHANNEL_UPDATE",
		"MESSAGE_DELETE",
		"MESSAGE_DELETE_BULK",
		"MESSAGE_REACTION_REMOVE",
		"MESSAGE_REACTION_REMOVE_ALL",
		"MESSAGE_REACTION_REMOVE_EMOJI",
		"USER_UPDATE",
		"USER_SETTINGS_UPDATE",
		"PRESENCE_UPDATE",
		"TYPING_START",
		"VOICE_STATE_UPDATE",
		"VOICE_SERVER_UPDATE",
		"INVITE_CREATE",
		"INVITE_DELETE",
		"WEBHOOKS_UPDATE",
	]
}),
	config = require('dotenv').config()

if (config.error) {
	console.warn('[ERROR]: cannot parse .env file')
	process.exit(-1)
}

const prefix = process.env.PREFIX || 'cov'

client.once('ready', () => {
	console.log('[INFO]: bot is running')
})

client.on('message', async message => {
	message.content = message.content.toLowerCase()
	const parsed = parser.parse(message, prefix, { allowSpaceBeforeCommand: true })
	if (parsed.success && commands[parsed.command]) {
		commands[parsed.command](message, parsed.arguments)
		analytics[parsed.command] ? analytics[parsed.command]++ : (analytics[parsed.command] = 1)
	}
})

client.login(process.env.TOKEN)
