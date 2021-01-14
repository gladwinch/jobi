const cheerio = require('cheerio')

const scraper = async (html) => {

   const $ = await cheerio.load(html)
   const job_list = []
   let pageCount = $('#searchCountPages').text().replace(/\s\s+/g, '')  
   
   $('.jobsearch-SerpJobCard').each((i, el) => {
       const title = $(el).find('.title a:first-child').text().replace(/\s\s+/g, '')
       const link = $(el).find('.title a').attr('href')
    //    let rating = $(el).find('.ratingsContent').text().replace(/\s\s+/g, '').replace('\n', '') || 0
    //    let ratingLink = $(el).find('.ratingNumber').attr('href') || false
       const location = $(el).find('.location').text().replace(/\s\s+/g, '').replace('\n', '')
       const company = $(el).find('.company').text().replace(/\s\s+/g, '').replace('\n', '')
       const salary = $(el).find('.salary').text().replace(/\s\s+/g, '').replace('\n', '')
       const posted = $(el).find('.date').text().replace(/\s\s+/g, '').replace('\n', '')
       const description = $(el).find('.summary ul').text().replace(/\s\s+/g, '').replace('\n', '')      

    //    rating = parseInt(rating)

       job_list.push({
           title,
           link,
           location,
           company,
           salary,
           posted,
        //    rating,
           description,
        //    ratingLink
       })
   })

   return {
       pageCount,
       job_list
   }
}

module.exports = scraper