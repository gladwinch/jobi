const express = require('express')
const app = express()
require('./models/User')
const cors = require('cors')

const connectDB = require('./config/db')
const passport = require('passport')
const path = require('path')

const schedular = require('./utils/cronJob')

// Connect Database
connectDB()

//enable pre-flight
app.use(cors())

app.use(express.json());
app.use(passport.initialize())
require('./middleware/passport-setup')(passport)

// Define Routes
app.use('/api/users', require('./routes/api/users'))
app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/profile', require('./routes/api/profile'))
app.use('/api/payment', require('./routes/api/payment'))

//Cron jobs
// schedular.premium.start()
// schedular.freetier.start()

// Serve static assets in production
if (true) {
  // Set static folder
  app.use(express.static('dist'))

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'))
  })
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
