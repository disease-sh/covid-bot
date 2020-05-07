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
				const lineData = args.length > 2 ? await api.historical.countries({ country: args.splice(2).join(' ').trim(), days: -1 }) : {timeline: await api.historical.all({days: -1})}
				buffer = await lineRenderer.renderToBuffer({
					type: 'line',
					data: {
						labels: Object.keys(lineData.timeline.cases),
						datasets: [{
							label: "Cases",
							borderColor: '#ffffff',
							pointBackgroundColor: '#ffffff',
							pointRadius: 2,
							borderWidth: 3,
							data: Object.keys(lineData.timeline.cases).map(key => lineData.timeline.cases[key])
						},
						{
							label: "Deaths",
							borderColor: '#E26363',
							pointBackgroundColor: '#E26363',
							pointRadius: 2,
							borderWidth: 3,
							data: Object.keys(lineData.timeline.deaths).map(key => lineData.timeline.deaths[key])
						},
						{
							label: "Recovered",
							borderColor: '#74D99F',
							pointBackgroundColor: '#74D99F',
							pointRadius: 2,
							borderWidth: 3,
							data: Object.keys(lineData.timeline.recovered).map(key => lineData.timeline.recovered[key])
						},
						{
							label: "Active",
							borderColor: '#FAE29F',
							pointBackgroundColor: '#FAE29F',
							pointRadius: 2,
							borderWidth: 3,
							data: Object.keys(lineData.timeline.cases).map(key => lineData.timeline.cases[key] - lineData.timeline.recovered[key] - lineData.timeline.deaths[key])
						}]
					},
					options: {
						scales: {
							xAxes: [{
								display: true,
								ticks: {
									fontSize: 17.5,
									callback: (label) => moment(label, 'M/D/YY').format('DD MMM'),
									padding: 10
								},
								gridLines: {
									zeroLineColor: '#fff',
									zeroLineWidth: 2
								}
							}],
							yAxes: [{
								display: true,
								ticks: {
									fontSize: 17.5,
									callback: formatNumber 
								},
								gridLines: {
									zeroLineColor: '#fff',
									zeroLineWidth: 2
								}
							}]
						},
						legend: {
							display: true,
							labels: {
								usePointStyle: true,
								padding: 25,
								fontSize: 15
							}
						}
					}
				})
				embed = createEmbed({
					color: '#303136', 
					author: { name: 'COVID Stats by NovelCOVID', url: 'https://img.icons8.com/ios-filled/50/000000/virus.png' },
					title: `${lineData.country || 'Global'} Timeline`,
					description: 'Data is provided by John Hopkins University.',
					files: [new Discord.MessageAttachment(buffer, 'graph.png')],
					image: 'attachment://graph.png',
					footer: 'Fetched from https://disease.sh'
				})
				await channel.send(embed)
				break
				//#endregion
			case 'o':
			case 'overview':
				//#region 
				const pieData = args.length > 2 ? await api.countries({ country: args.splice(2).join(' ').trim() }) : await api.all()
				buffer = await pieRenderer.renderToBuffer({
					type: 'pie',
					data: {
						labels: ['Active', 'Recovered', 'Deaths'],
						datasets: [{
							data: [pieData.active, pieData.recovered, pieData.deaths],
							backgroundColor: ['#FAE29F', '#7FD99F', '#E26363'],
							borderWidth: 0.5,
							borderColor: ['#FAE29F', '#7FD99F', '#E26363']
						}]
					},
					options: {
						legend: {
							display: true,
							labels: {
								padding: 40,
								fontSize: 30
							}
						}
					}
				})
				embed = createEmbed({
					color: '#303136', 
					author: { name: 'COVID Stats by NovelCOVID', url: 'https://img.icons8.com/ios-filled/50/000000/virus.png' },
					title: `${pieData.country || 'Global'} Overview`,
					files: [new Discord.MessageAttachment(buffer, 'graph.png')],
					image: 'attachment://graph.png',
					footer: 'Fetched from https://disease.sh'
				})
				await channel.send(embed)
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
				if (args.length < 3){
					await message.reply('Please specify a state name.')
					return
				}
				data = { state: args.splice(2).join(' ').trim() }
				const stateData = await api.states(data)
				const yesterdayStateData = await api.yesterday.states(data)
				stateData.todayActives = stateData.active - yesterdayStateData.active
				stateData.todayTests = stateData.tests - yesterdayStateData.tests
				embed = createEmbed({
					color: '#303136', 
					author: { name: 'COVID Stats by NovelCOVID', url: 'https://img.icons8.com/ios-filled/50/000000/virus.png' },
					thumbnail: 'https://disease.sh/assets/img/flags/us.png',
					title: `${stateData.state}, USA`,
					fields: [
						{ name: 'Cases', value: `${formatNumber(stateData.cases)}\n(${(stateData.todayCases >= 0 ? "+":"-")+String(Math.abs(stateData.todayCases)).replace(/(.)(?=(\d{3})+$)/g,'$1,')})`, inline: true },
						{ name: 'Deaths', value: `${formatNumber(stateData.deaths)}\n(${(stateData.todayDeaths >= 0 ? "+":"-")+String(Math.abs(stateData.todayDeaths)).replace(/(.)(?=(\d{3})+$)/g,'$1,')})`, inline: true },
						{ name: 'Active', value: `${formatNumber(stateData.active)}\n(${(stateData.todayActives >= 0 ? "+":"-")+String(Math.abs(stateData.todayActives)).replace(/(.)(?=(\d{3})+$)/g,'$1,')})`, inline: true },
						{ name: 'Tests', value: `${formatNumber(stateData.tests)}\n(${(stateData.todayTests >= 0 ? "+":"-")+String(Math.abs(stateData.todayTests)).replace(/(.)(?=(\d{3})+$)/g,'$1,')})`, inline: true },
						{ name: 'Test rate', value: `${(stateData.testsPerOneMillion/10000).toFixed(4)} %`, inline: true },
						{ name: 'Last Updated', value: moment(stateData.updated).fromNow(), inline: true }
					],
					footer: 'Fetched from https://disease.sh'
				})
				await channel.send(embed)
				break
				//#endregion
			case 'l':
			case 'r':
			case 'rank':
			case 'leaderboard':
				//#region 
				let max = typeof(parseInt(args[2])) !== 'number' ? 10 : parseInt(args[2])
				const totalCases = (await api.all()).cases
				const leaderboard = (await api.countries({ sort: 'cases' })).splice(0, max > 25 ? 25 : max)
				embed = createEmbed({
					color: '#303136', 
					author: { name: 'COVID Stats by NovelCOVID', url: 'https://img.icons8.com/ios-filled/50/000000/virus.png' },
					title: `Top ${max} Countries`,
					description: leaderboard.map((c, index) => `**${++index}**. ${c.country} \u279C ${(c.cases/totalCases*100).toFixed(2)} %`).join('\n'),
					footer: 'Fetched from https://disease.sh'
				})
				await channel.send(embed)
				break
				//#endregion
		}
	}
})

client.login(process.env.TOKEN)
