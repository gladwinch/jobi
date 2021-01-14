module.exports = (data) => {
    let errors = {}
    console.log(data)

    if(data.add_type.length === 0) {
        errors.type = "Please add type"
    }

    if(data.card.title.length === 0) {
        errors.title = "Please add title"
    }

    return errors
}