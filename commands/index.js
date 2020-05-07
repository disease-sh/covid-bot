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
  return await channel.send(embed)
}

const graph = async (message, args) => {

}

module.exports = {
  help,
  h: help,
  info: help,
  invite,
  i: invite,
  country,
  c: country
}