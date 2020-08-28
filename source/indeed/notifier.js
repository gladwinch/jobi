const scraper = require('./scraper')
const cheerio = require('cheerio')

const { indeedLink, getHtml, nameParser, getSingleJob } = require('./helper')

const indeedNotify = ({ title, location, page }, getc) => {
    return new Promise(async (resolve, reject) => {

       let titlep = nameParser(title)
       location = nameParser(location)

       let link = await indeedLink(location)

       if (!link) {
         console.log("no job found with this location")

         resolve({
           link: 'no job error type right format',
           page: 'no job found',
           jobs: {}
         })
       }

       let ctLink = `${link}/jobs?q=${titlep}&l=${location}&sort=date&start=${page - 1}0`

       let html = await getHtml(ctLink)
       const ScrapedData = await scraper(html)

       let matchedJob = ScrapedData.job_list.filter(element => {
           return element.title.toLowerCase().indexOf(title.toLowerCase()) != -1
       })

      if (matchedJob.length == 0 || getc) {
           
           let data = await getSingleJob(ScrapedData.job_list, link)
           resolve(data)
       } else {
           let data = await getSingleJob(matchedJob, link)
           resolve(data)
       }

       
    })
}

module.exports = indeedNotify