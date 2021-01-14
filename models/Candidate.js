const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const secretOrKey = require('../config/keys').secretOrKey

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
    height: {
        type: String,
        default: 160
    },
    width: {
        type: String,
        default: 480
    },
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

const CandidateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a title for the review'],
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    avatar: {
        url: {
            type: String,
            default: null,
        },
        name: {
            type: String,
            default: 'default-name'
        }
    },
    package: {
        type: String,
        default: null
    },
    subscription: {
        user: {
            type: Boolean,
            default: false
        },
        duration: {
            type: Number,
            default: 0
        },
        admin: {
            type: Boolean,
            default: true
        }
    },
    stripeCustomerId: {
        type: String,
        default: null
    },
    stripeSubscriptionID: {
        type: String,
        default: null
    },
    intendId: {
        type: String,
        default: null
    },
    card: {
        type: Boolean,
        default: false
    },
    profession: String,
    jobs_section: {
        interested: [JobSchema],
        applied: [JobSchema],
        invited_offer: [JobSchema]
    },
    job_alert: {
        email: {
            type: String,
            required: [true, 'Please add an email'],
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email'
            ]
        },
        searchs: [
            {
                jobType: String,
                location: String,
                remote: String,
                salary: String,
                skills: String,
                title: String
            }
        ]
    },
    password: {
        type: String,
        minlength: 6,
        select: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

// Encrypt password using bcrypt
CandidateSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
      next();
    }
  
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt)
    this.job_alert.email = this.email
})

// Sign JWT and return
CandidateSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({ id: this._id }, secretOrKey, {
      expiresIn: 360000
    })
}

module.exports = mongoose.model('Candidate', CandidateSchema);
