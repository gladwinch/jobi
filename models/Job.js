const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title for the review'],
    },
    salary: String,
    company: String,
    description: String,
    more_description: String,
    location: String,
    job_type: String,
    img: String,
    posted: String,
    apply: String,
    notes: String,
    recruiter: {
        name: String,
        email: String,
        phone: String
    },
    skill: {
        skills: [String],
        score: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = Jobs = mongoose.model('Job', JobSchema);
