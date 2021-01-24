const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const cors = require('cors')
const path = require('path')

const connectDB = require('./config/db')
const passport = require('passport')

const schedular = require('./utils/cronJob')
// global.appRoot = path.resolve(__dirname)

// Connect Database
connectDB()

//enable pre-flight
app.use(cors())

app.use(cookieParser())

app.use(express.json())
app.use(passport.initialize())
require('./middleware/passport-setup')(passport)

// Define Routes
app.use('/api/users', require('./routes/api/users'))
app.use('/api/profile', require('./routes/api/profile'))

// New Routes
app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/candidate', require('./routes/api/candidates'))
app.use('/api/jobs', require('./routes/api/jobs'))
app.use('/api/payment', require('./routes/api/payment'))

//Cron jobs
// schedular.premium.start()
// schedular.freetier.start()

// Serve static assets in production
if (true) {
  // Set static folder
  app.use(express.static('client/dist'))

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html'))
  })
}


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
