const axios = require('axios')
const cheerio = require('cheerio')
const { v4: uuidv4 } = require('uuid')
const placeKey = require('../../config/keys').placeKey
// const nlp = require('compromise')

const getHtml = async (link) => {
  try {
    let result = await axios.get(link)
    return result.data
  } catch (err) {
    console.log('request error -----------------------------------------')
    console.log(err)
  }
}

const nameParser = (data) => {
  console.log("-=-=-helper: ",data)
  let val = data.split(" ")

  if (val.length == 1) {
    return data
  }

  let result = ''

  for (let i = 0; i < val.length; i++) {

    if (i == (val.length - 1)) {
      result = result + '+' + val[i]
    } else if (i == 0) {
      result = val[i]
    } else {
      result = result + '+' + val[i]
    }
  }

  return result
}

const getLocation = async (loc) => {
  let url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${loc}&inputtype=textquery&fields=formatted_address,name&key=${placeKey}`

  try {
    let response = await axios.get(url)
    let val = response.data.candidates[0].formatted_address.split(",")
  
    return val[val.length - 1]

  } catch (err) {
    return 'usa'
  }
}

const indeedLink = async (location) => {

  let myctLocation = await getLocation(location)

  let result = await getHtml(`https://www.indeed.com/jobs?q=&l=${myctLocation}`)
  const $ = cheerio.load(result)
  const output = $('.oocs').find('a').attr('href')

  if (output == undefined || output == "" || output.length < 3) {
    return "https://www.indeed.com"
  }

  let myLink = "https://" + output.slice(7).split("/")[0]

  return myLink

}

let getLinker = async (data) => {

    let { title, location } = data
    let link = await indeedLink(location)

    let ctlink = `${link}/jobs?q=${title}&l=${location}`

    let html = await getHtml(ctlink)
    const $ = cheerio.load(html)
     
    let body = await $('#refineresults #rb_Title ul li a').attr("href")
    let text = await $('#refineresults #rb_Title ul li a span').text().split("(")[0]
    
    let jobTitle =  text.trim().toLowerCase()

    if (jobTitle == title.toLowerCase()) {
       return body || false
    }

    return false
}

const getSingleJob = async (jobs, link) => {
  let index = Math.floor(Math.random() * jobs.length)

  console.log("link: ",link, "job link: ", jobs[index].link)

  let html2 = await getHtml(link + jobs[index].link)

    console.log(`link ${index} is on process`)
    const $ = cheerio.load(html2)

    const heading = $('.jobsearch-JobComponent')
    const imageCont = $('.icl-Card-body')

    let job_type = heading.find('.icl-IconFunctional--md.icl-IconFunctional--jobs').next().text().replace(/\s\s+/g, '')
    // let reviews = heading.find('.icl-Ratings-count').text().split(" ")[0] || Math.floor(Math.random() * 150)
    let applyLink = heading.find('.icl-u-lg-hide .icl-Button--primary').attr('href') || link + jobs[index].link
    let compantImg = imageCont.find('.jobsearch-CompanyAvatar-image').attr('src') || ''
    let more_description = $('#jobDescriptionText').text().trim().replace(/\n/g, ' <br /> ')
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

    // jobs[index].review = reviews
    jobs[index].apply = applyLink
    jobs[index].job_type = job_type
    jobs[index].img = compantImg 
    // jobs[index].ratingLink = jobs[index].ratingLink ? link + jobs[index].ratingLink : false
    jobs[index].id = uuidv4()
    jobs[index].more_description = more_description
    jobs[index].recruiter = recruiter
    jobs[index].notes = ''

    return jobs[index]
}

module.exports = {
  indeedLink,
  getHtml,
  nameParser,
  getLinker,
  getSingleJob
}
