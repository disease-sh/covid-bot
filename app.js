const Discord = require('discord.js'),
	moment = require('moment'),
	parser = require('discord-command-parser'),
	commands = require('./commands')

const client = new Discord.Client(),
	config = require('dotenv').config()
	
if (config.error) {
	console.warn('[ERROR]: cannot parse .env file')
	process.exit(-1)
}

const prefix = process.env.PREFIX || 'cov'

client.once('ready', () => {
	console.log('[INFO]: bot is running')
	client.user.setActivity({ status: 'online', type: 3, name: 'NovelCOVID', url: 'https://disease.sh' })
})

client.on('message', async message => {
	const parsed = parser.parse(message, prefix)
	if	(!parsed.success) return;

	if(commands[parsed.command])
		commands[parsed.command](message, parsed.arguments)
	else 
		commands['help'](message)

	const { content, author, channel } = message
	if(author.bot || !content.startsWith(prefix+" ")) return
	const args = message.content.slice(prefix).trim().split(/ +/g);
	if (args.length > 1) {
		let embed, buffer, data;
		switch (args[1]) {
			case 'c':
			case 'country':
				//#region 
				if (args.length < 3){
					await message.reply('Please specify a country name.')
					return
				}
				data = { country: args.splice(2).join(' ').trim()}
				const countryData = await api.countries(data)
				const yesterdayCountryData = await api.yesterday.countries(data)
				countryData.todayActives = countryData.active - yesterdayCountryData.active
				countryData.todayRecovereds = countryData.recovered - yesterdayCountryData.recovered
				countryData.todayCriticals = countryData.critical - yesterdayCountryData.critical
				countryData.todayTests = countryData.tests - yesterdayCountryData.tests
				embed = createEmbed({
					color: '#303136', 
					author: { name: 'COVID Stats by NovelCOVID', url: 'https://img.icons8.com/ios-filled/50/000000/virus.png' },
					thumbnail: countryData.countryInfo.flag,
					title: `${countryData.country}, ${countryData.continent}`,
					fields: [
						{ name: 'Cases', value: `${formatNumber(countryData.cases)}\n(${(countryData.todayCases >= 0 ? "+":"-")+String(Math.abs(countryData.todayCases)).replace(/(.)(?=(\d{3})+$)/g,'$1,')})`, inline: true },
						{ name: 'Deaths', value: `${formatNumber(countryData.deaths)}\n(${(countryData.todayDeaths >= 0 ? "+":"-")+String(Math.abs(countryData.todayDeaths)).replace(/(.)(?=(\d{3})+$)/g,'$1,')})`, inline: true },
						{ name: 'Active', value: `${formatNumber(countryData.active)}\n(${(countryData.todayActives >= 0 ? "+":"-")+String(Math.abs(countryData.todayActives)).replace(/(.)(?=(\d{3})+$)/g,'$1,')})`, inline: true },
						{ name: 'Recovered', value: `${formatNumber(countryData.recovered)}\n(${(countryData.todayRecovereds >= 0 ? "+":"-")+String(Math.abs(countryData.todayRecovereds)).replace(/(.)(?=(\d{3})+$)/g,'$1,')})`, inline: true },
						{ name: 'Critical', value: `${formatNumber(countryData.critical)}\n(${(countryData.todayCriticals >= 0 ? "+":"-")+String(Math.abs(countryData.todayCriticals)).replace(/(.)(?=(\d{3})+$)/g,'$1,')})`, inline: true },
						{ name: 'Tests', value: `${formatNumber(countryData.tests)}\n(${(countryData.todayTests >= 0 ? "+":"-")+String(Math.abs(countryData.todayTests)).replace(/(.)(?=(\d{3})+$)/g,'$1,')})`, inline: true },
						{ name: 'Infection Rate', value: `${(countryData.casesPerOneMillion/10000).toFixed(4)} %`, inline: true },
						{ name: 'Fatality rate', value: `${(countryData.deathsPerOneMillion/10000).toFixed(4)} %`, inline: true },
						{ name: 'Test rate', value: `${(countryData.testsPerOneMillion/10000).toFixed(4)} %`, inline: true },
						{ name: 'Last Updated', value: moment(countryData.updated).fromNow(), inline: true }
					],
					footer: 'Fetched from https://disease.sh'
				})
				await channel.send(embed)
				break
				//#endregion
			case 'h':
			case 'g':
			case 'graph':
			case 'history':
				//#region 
				
				break
				//#endregion
			case 'o':
			case 'overview':
				//#region 
				
				break
				//#endregion
			case 'a':
			case 'all':
				//#region 
				const allData = await api.all()
				const yesterdayAllData = await api.yesterday.all()
				allData.todayActives = allData.active - yesterdayAllData.active
				allData.todayRecovereds = allData.recovered - yesterdayAllData.recovered
				allData.todayCriticals = allData.critical - yesterdayAllData.critical
				allData.todayTests = allData.tests - yesterdayAllData.tests
				embed = createEmbed({
					color: '#303136', 
					author: { name: 'COVID Stats by NovelCOVID', url: 'https://img.icons8.com/ios-filled/50/000000/virus.png' },
					thumbnail: 'https://i2x.ai/wp-content/uploads/2018/01/flag-global.jpg',
					title: 'Global Data',
					fields: [
						{ name: 'Cases', value: `${formatNumber(allData.cases)}\n(${(allData.todayCases >= 0 ? "+":"-")+String(Math.abs(allData.todayCases)).replace(/(.)(?=(\d{3})+$)/g,'$1,')})`, inline: true },
						{ name: 'Deaths', value: `${formatNumber(allData.deaths)}\n(${(allData.todayDeaths >= 0 ? "+":"-")+String(Math.abs(allData.todayDeaths)).replace(/(.)(?=(\d{3})+$)/g,'$1,')})`, inline: true },
						{ name: 'Active', value: `${formatNumber(allData.active)}\n(${(allData.todayActives >= 0 ? "+":"-")+String(Math.abs(allData.todayActives)).replace(/(.)(?=(\d{3})+$)/g,'$1,')})`, inline: true },
						{ name: 'Recovered', value: `${formatNumber(allData.recovered)}\n(${(allData.todayRecovereds >= 0 ? "+":"-")+String(Math.abs(allData.todayRecovereds)).replace(/(.)(?=(\d{3})+$)/g,'$1,')})`, inline: true },
						{ name: 'Critical', value: `${formatNumber(allData.critical)}\n(${(allData.todayCriticals >= 0 ? "+":"-")+String(Math.abs(allData.todayCriticals)).replace(/(.)(?=(\d{3})+$)/g,'$1,')})`, inline: true },
						{ name: 'Tests', value: `${formatNumber(allData.tests)}\n(${(allData.todayTests >= 0 ? "+":"-")+String(Math.abs(allData.todayTests)).replace(/(.)(?=(\d{3})+$)/g,'$1,')})`, inline: true },
						{ name: 'Infection Rate', value: `${(allData.casesPerOneMillion/10000).toFixed(4)} %`, inline: true },
						{ name: 'Fatality rate', value: `${(allData.deathsPerOneMillion/10000).toFixed(4)} %`, inline: true },
						{ name: 'Test rate', value: `${(allData.testsPerOneMillion/10000).toFixed(4)} %`, inline: true },
						{ name: 'Last Updated', value: moment(allData.updated).fromNow(), inline: true }
					],
					footer: 'Fetched from https://disease.sh'
				})
				await channel.send(embed)
				break
				//#endregion
			case 's':
			case 'state':
				//#region 
				
				break
				//#endregion
			case 'l':
			case 'r':
			case 'rank':
			case 'leaderboard':
				//#region 
				
				break
				//#endregion
		}
	}
})

client.login(process.env.TOKEN)
