const api = require('covidapi'),
  { CanvasRenderService } = require('chartjs-node-canvas')

const lineRenderer = new CanvasRenderService(1200, 600, (ChartJS) => {
  ChartJS.defaults.global.defaultFontColor='#fff'
  ChartJS.defaults.global.defaultFontStyle='bold'
  ChartJS.defaults.global.defaultFontFamily='Helvetica Neue, Helvetica, Arial, sans-serif'
  ChartJS.plugins.register({
    beforeDraw: (chart, options) => {
      const ctx = chart.ctx;
      ctx.save();
      ctx.fillStyle = '#2F3136';
      ctx.fillRect(0, 0, chart.width, chart.height);
      ctx.restore();
    }
  })
})
const pieRenderer = new CanvasRenderService(700, 600, (ChartJS) => {
  ChartJS.defaults.global.defaultFontColor='#fff'
  ChartJS.defaults.global.defaultFontStyle='bold'
  ChartJS.defaults.global.defaultFontFamily='Helvetica Neue, Helvetica, Arial, sans-serif'
  ChartJS.plugins.register({
    beforeDraw: (chart, options) => {
      const ctx = chart.ctx;
      ctx.save();
      ctx.fillStyle = '#2F3136';
      ctx.fillRect(0, 0, chart.width, chart.height);
      ctx.restore();
    }
  })
})

const formatNumber = number => String(number).replace(/(.)(?=(\d{3})+$)/g,'$1,')

const createEmbed = (opts) => new Discord.MessageEmbed()
  .setColor(opts.color)
  .setAuthor(opts.author.name, opts.author.url)
  .setThumbnail(opts.thumbnail)
  .setDescription(opts.description || '')
  .setTitle(opts.title)
  .addFields(opts.fields || [])
  .setTimestamp()
  .attachFiles(opts.files || [])
  .setImage(opts.image || '')
  .setFooter(opts.footer)

const help = async message => await message.channel.send('Help command')

const invite = async message => await message.channel.send('https://discord.com/api/oauth2/authorize?client_id=707564241279909888&permissions=51200&scope=bot')

const country = async (message, args) => {
  if (args.length < 1){
    return await message.channel.send('Please specify a country name.')
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
  return await message.channel.send(embed)
}

const graph = async (message, args) => {
  const lineData = args.length > 0 ? await api.historical.countries({ country: args.splice(2).join(' ').trim(), days: -1 }) : {timeline: await api.historical.all({days: -1})}
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
  return await message.channel.send(embed)
}

const overview = async (message, args) => {
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
  return await message.channel.send(embed)
}

const state = async (message, args) => {
  if (args.length < 1){
    return await message.reply('Please specify a state name.')
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
  return await channel.send(embed)
}

const leaderboard = async (message, args) => {
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
  return await channel.send(embed)
}

module.exports = {
  help,
  h: help,
  invite,
  i: invite,
  country,
  c: country,
  graph,
  g: graph,
  overview,
  o: overview,
  state,
  s: state,
  leaderboard,
  l: leaderboard
}