const scraper = require('./scraper')
const cheerio = require('cheerio')

const { indeedLink, getHtml, nameParser } = require('./helper')

const getIndeed = ({ title, location, page }) => {
    return new Promise(async (resolve, reject) => {
       title = nameParser(title)
       location = nameParser(location)

       let start = Date.now()

       let link = await indeedLink(location)

       if (!link) {
         console.log("no job found with this location")

         resolve({
           link: 'no job error type right format',
           page: 'no job found',
           jobs: []
         })
       }

       let ctLink = `${link}/jobs?q=${title}&l=${location}&start=${page - 1}0`

       let html = await getHtml(ctLink)
       const ScrapedData = await scraper(html)


       let mapFun = ScrapedData.job_list.map((element, index) => {
         return new Promise(async (resolve, reject) => {

           let html2 = await getHtml(link + element.link)
           console.log(`link: ${element.link} is on process`)
           const $ = cheerio.load(html2)

           const heading = $('.jobsearch-JobComponent')
           const imageCont = $('.icl-Card-body')

           let job_type = heading.find('.icl-IconFunctional--md.icl-IconFunctional--jobs').next().text().replace(/\s\s+/g, '')
           let reviews = heading.find('.icl-Ratings-count').text().split(" ")[0] || Math.floor(Math.random() * 150)
           let applyLink = heading.find('.icl-u-lg-hide .icl-Button--primary').attr('href') || link + element.link
           let img = imageCont.find('.jobsearch-CompanyAvatar-image').attr('src') || ''

           resolve({
             job_type,
             reviews,
             applyLink,
             img,
             id: index
           })
         })
       })

        let additionalData = await Promise.all([...mapFun]).then(response => {
           return response
          })
          .catch(err => {
           console.log("ERROR: ", err)
          })

       let jobList = ScrapedData.job_list.map((element, index) => {
         return {
           ...element,
           ...additionalData[index]
         }
       })

       resolve({
         time: (Date.now() - start) / 1000 + " " + 'sec',
         link: ctLink,
         page: ScrapedData.pageCount,
         jobs: jobList
       })

    })
}

module.exports = getIndeed