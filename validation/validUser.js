module.exports = function(values) {
    let errors = {}

    if (values.email.trim() === '') {
        errors.email = 'Email must not be empty'
    } else {
        //eslint-disable-next-line
        let pattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
        let emailValid = values.email.match(pattern)
        if(!emailValid) errors.email = 'Please enter a valid email id'
    }

    if (values.name.trim() === '') {
        errors.name = 'User field must not be empty'
    }

    return errors
}