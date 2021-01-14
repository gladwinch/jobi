const scraper = require('./scraper')
const cheerio = require('cheerio')
const { v4: uuidv4 } = require('uuid')
// const nlp = require('compromise')

const { indeedLink, getHtml, nameParser } = require('./helper')

const getIndeed = ({ title, location }) => {
    return new Promise(async (resolve, reject) => {
       title = nameParser(title)
       location = nameParser(location)

       let start = Date.now()

       let link = await indeedLink(location)

       if (!link) {
         console.log("no job found with this location")

         resolve({
           link: 'no job error type right format',
         })
       }

       let page = Math.floor(Math.random() * 2) + 2
       console.log('current page: ',page)

       location = location || 'remote'

       let ctLink = `${link}/jobs?q=${title}&l=${location}&sort=date&start=${page - 1}0`

       let html = await getHtml(ctLink)
       const ScrapedData = await scraper(html)

       console.log("Check scraped data: ",ScrapedData)


       let mapFun = ScrapedData.job_list.map((element, index) => {
         return new Promise(async (resolve, reject) => {

           let html2 = await getHtml(link + element.link)
           console.log(`link: ${element.link} is on process`)
           const $ = cheerio.load(html2)

           const heading = $('.jobsearch-JobComponent')
           const imageCont = $('.icl-Card-body')

           let job_type = heading.find('.icl-IconFunctional--md.icl-IconFunctional--jobs').next().text().replace(/\s\s+/g, '')
          //  let reviews = heading.find('.icl-Ratings-count').text().split(" ")[0] || Math.floor(Math.random() * 150)
           let apply = heading.find('.icl-u-lg-hide .icl-Button--primary').attr('href') || link + element.link
           let img = imageCont.find('.jobsearch-CompanyAvatar-image').attr('src') || ''
           let more_description = $('#jobDescriptionText').text().trim().replace(/\n/g, ' <br/> ')

           let recruiter_email = more_description.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi)
           let recruiter_number = more_description.match(/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/gi)
          
          // let recruiter_name
          // if(nlp(more_description).people().json().length === 0) {
          //   recruiter_name = ''
          // } else {
          //   recruiter_name = nlp(more_description).people().json()[0].text
          // }

          let recruiter = { 
            email: recruiter_email ? recruiter_email[0] : '' ,
            phone: recruiter_number ? recruiter_number[0] : '',
            // name: recruiter_name
          }

           resolve({
             job_type,
            //  reviews,
             apply,
             img,
             id: uuidv4(),
             more_description,
             recruiter,
             notes: ''
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

       console.log({
        time: (Date.now() - start) / 1000 + " " + 'sec',
        link: ctLink,
        page: ScrapedData.pageCount,
       })

       resolve(jobList)

    })
}

module.exports = getIndeed