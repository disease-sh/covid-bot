const Discord = require('discord.js'),
	parser = require('discord-command-parser'),
	commands = require('./commands')

const client = new Discord.Client(),
	config = require('dotenv').config()

if (config.error) {
	console.warn('[ERROR]: cannot parse .env file')
	process.exit(-1)
}

const prefix = process.env.PREFIX || 'cov'

client.once('ready', () => {
	console.log('[INFO]: bot is running')
	client.user.setActivity({ status: 'online', type: 3, name: 'NovelCOVID', url: 'https://disease.sh' })
})

client.on('message', async message => {
	message.content = message.content.toLowerCase()
	const parsed = parser.parse(message, prefix, { allowSpaceBeforeCommand: true })
	if (parsed.success && commands[parsed.command]) {
		commands[parsed.command](message, parsed.arguments)
	}
})

client.login(process.env.TOKEN)
