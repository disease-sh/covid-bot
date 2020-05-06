const api = require('covidapi'),
	Discord = require('discord.js')

const client = new Discord.Client()
	const config = require('dotenv').config()
	
if (config.error) {
	console.warn('[ERROR]: cannot parse .env file')
	process.exit(-1)
}
	
api.settings({baseUrl: 'https://disease.sh'})

const formatNumber = number => String(number).replace(/(.)(?=(\d{3})+$)/g,'$1,')

client.once('ready', () => console.log('[INFO]: bot is running'))

client.on('message', async message => {
	const { content, channel } = message
	const args = content.split(' ')
	if (args[0] === '.cov' && args.length > 1) {
		switch (args[1]) {
			case 'c':
			case 'country':
				const data = await api.countries({ country: args[2] })
				const exampleEmbed = new Discord.MessageEmbed()
					.setColor('#303136')
					.setAuthor('\u200B', 'https://cdn.discordapp.com/icons/707227171835609108/2a0d204187b4160cfd959f82f5e820e0.png?size=256')
					.setThumbnail(data.countryInfo.flag)
					.setTitle(`${data.country}, ${data.continent}`)
					.addFields(
						{ name: 'Cases', value: `${formatNumber(data.cases)} (${(data.todayCases >= 0 ? "+":"-")+String(Math.abs(data.todayCases)).replace(/(.)(?=(\d{3})+$)/g,'$1,')})`, inline: true },
						{ name: 'Active', value: `${formatNumber(data.active)}`, inline: true },
						{ name: 'Recovered', value: `${formatNumber(data.recovered)}`, inline: true },
						{ name: 'Deaths', value: `${formatNumber(data.deaths)} (${(data.todayDeaths >= 0 ? "+":"-")+String(Math.abs(data.todayDeaths)).replace(/(.)(?=(\d{3})+$)/g,'$1,')})`, inline: true },
						{ name: 'Critical', value: `${formatNumber(data.critical)}`, inline: true },
						{ name: 'Tests', value: `${formatNumber(data.tests)}`, inline: true },
						{ name: 'Cases / 1 Million', value: `${formatNumber(data.casesPerOneMillion)}`, inline: true },
						{ name: 'Deaths / 1 Million', value: `${formatNumber(data.deathsPerOneMillion)}`, inline: true },
						{ name: 'Tests / 1 Million', value: `${formatNumber(data.testsPerOneMillion)}`, inline: true },
						{ name: 'Last Updated', value: data.updated, inline: true },
					)
					.setTimestamp()
					.setFooter('Fetched from https://disease.sh')
				await channel.send(exampleEmbed)
				break
			case 'h':
			case 'graph':
			case 'history':
				await channel.send('Not implemented yet.')
		}
	}
})

client.login(process.env.TOKEN)
