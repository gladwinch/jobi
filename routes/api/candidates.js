const express = require('express')
const admin = require("firebase-admin")
const multer = require('multer')
const { v4: uuidv4 } = require('uuid')

const Candidate = require('../../models/Candidate')
const auth = require('../../middleware/auth')
const serviceAccount = require("../../config/firebaseConfig.json")

const router = express.Router()

// Create new storage instance
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://jobiie.appspot.com/"
})

const bucket = admin.storage().bucket()

// Initiating a memory storage engine to store files as Buffer objects
const uploader = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // limiting files size to 5 MB
  },
})


// @route    GET api/candidate
// @desc     Get user informatione
// @access   Private
router.get('/', auth, async (req,res) => {
  try {
    const candidate = await Candidate.findById(req.candidate.id)

    if (!candidate) {
      return res.status(400).json({ success: false, data: null, msg: 'User not found!' })
    }

    res.status(200).json({ success: true, data: candidate, msg: 'Successful request' })
  } catch (err) {
    console.log(err)
    res.status(500).json({ success: false, data: null, msg: 'Server error!' })
  }
})

// @route    POST api/candidate/
// @desc     Save candidate infomation
// @access   Private
router.post('/', auth, async (req,res) => {

  try {
    const candidate = await Candidate.findByIdAndUpdate(req.candidate.id, req.body, {new: true})

    const { admin, user, duration } = candidate.subscription
    candidate.subscription = admin && user && duration > Date.now()
    candidate.sub_duration = duration

    res.status(200).json({ success: true, data: candidate, msg: 'Successful request' })
  } catch (err) {
    console.log(err)
    res.status(500).json({ success: false, data: null, msg: 'Server error!' })
  }
})

// @route    POST api/candidate/alert
// @desc     Save candidate alert infomation
// @access   Private
router.post('/alert', auth, async (req,res) => {

  try {
    const candidate = await Candidate.findByIdAndUpdate(req.candidate.id, { job_alert: req.body }, {new: true})

    res.status(200).json({ success: true, data: candidate.job_alert, msg: 'Successful request' })
  } catch (err) {
    console.log(err)
    res.status(500).json({ success: false, data: null, msg: 'Server error!' })
  }
})

// @route    POST api/candidate/swap-sub
// @desc     Swap candidate subscription
// @access   Private
router.post('/swap-sub', auth, async (req,res) => {
  try {
    let newValue = req.body.newValue

    if(typeof newValue !== 'boolean') {
      res.status(500).json({ success: false, data: null, msg: 'Server error!' })
      return
    }

    const candidate = await Candidate.findById(req.candidate.id)
    candidate.subscription.user = newValue
    await candidate.save()
    res.status(200).json({ success: true, data: 'hello mars'})
  } catch (err) {
    console.log(err)
    res.status(500).json({ success: false, data: null, msg: 'Server error!' })
  }
})

// @route    POST api/candidate/image
// @desc     Save candidate profile image
// @access   Private
router.post('/image',uploader.single('image'), auth, async(req, res) => {
  
  try {
    if (!req.file) {
      res.status(400).send('Error, could not upload file');
      return;
    }

    const candidate = await Candidate.findById(req.candidate.id)

    if(!candidate) {
      return res.status(400).json({ success: false, data: null, msg: 'User not found!' })
    }

    if(candidate.avatar.url !== null && candidate.avatar.url.includes('appspot')) {
      let fileNameData = candidate.avatar.name
      let deletedFile = bucket.file(fileNameData)
      await deletedFile.delete()
    }

    let fileName = uuidv4() +'-'+ req.file.originalname

    const blob = bucket.file(fileName);

    const blobWriter = blob.createWriteStream({
      metadata: {
        contentType: req.file.mimetype,
      },
    })

    blobWriter.on('error', (err) => console.log(err))

    blobWriter.on('finish', async () => {
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${
        bucket.name
      }/o/${encodeURI(blob.name)}?alt=media`;

      
      candidate.avatar.url = publicUrl
      candidate.avatar.name = fileName

      await candidate.save()

      console.log("c: ", candidate)

      res
        .status(200)
        .send({ fileName: fileName, fileLocation: publicUrl })
    })

    blobWriter.end(req.file.buffer);
  } catch (error) {
    res.status(400).send(`Error, could not upload file: ${error}`)
    return;
  }
})


module.exports = router