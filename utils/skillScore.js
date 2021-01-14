const skills = require('../data/ui_skill')

function skillScore(queryStr) {
    console.log("queryStr: ",queryStr)
    let rex = new RegExp(skills.reduce((curr, acc) => acc+"|"+curr),"gi")
    let matched = queryStr.match(rex) 

    matched = matched.filter((item,position,self) => {
        return self.indexOf(item) == position
    })

    return {
        skills: matched,
        score: matched.length
    }
}

module.exports = skillScore