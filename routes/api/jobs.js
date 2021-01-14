const express = require('express')
const router = express.Router()
const jobValidate = require('../../validation/jobValidate')
const auth = require('../../middleware/auth')
const Candidate = require('../../models/Candidate')

let insert_index = ['interested', 'applied', 'invited_offer']

// @route    POST api/jobs/insert-job
// @desc     Add to job to selected section
// @access   Private
router.post('/insert-job', auth, async (req, res) => {

  let { card, add_type, currentIndex } = req.body

  try {
    const candidate = await Candidate.findById(req.candidate.id)

    if (!candidate) {
      return res.status(400).json({ success: false, data: null, msg: 'User not found!' })
    }

    if(Object.keys(jobValidate(req.body)).length !== 0) {
      res.status(400).json({
        success: false,
        data: null,
        message: errors
      })
      return
    }

    if(currentIndex === 0) {
      delete req.body.card.id

      candidate.jobs_section.interested.push(card)
      await candidate.save()
    } else {

      let deleteIndex = insert_index[currentIndex - 1]
      let insertIndex = insert_index[currentIndex]

      candidate.jobs_section[deleteIndex].pull({ _id: card._id })
      candidate.jobs_section[add_type].push(card)
      await candidate.save()
    }

    res.status(200).json({ success: true, data: candidate.jobs_section, message: "posting went successfull" })

  } catch (err) {
    res.status(500).json({ success: false, data: null, message: "posting went wrong" })
  }
})

// @route    POST api/jobs/remove-job
// @desc     Remove to job to selected section
// @access   Private
router.post('/remove-job', auth, async (req, res) => {
  let { card, remove_type } = req.body

  try {
    const candidate = await Candidate.findById(req.candidate.id)

    if (!candidate) {
      return res.status(400).json({ success: false, data: null, msg: 'User not found!' })
    }

    candidate.jobs_section[remove_type].pull({ _id: card._id })
    await candidate.save()
    res.status(200).json({ success: true, data: candidate.jobs_section, message: "posting went successfull" })
  } catch (err) {
    console.log(err)
    res.status(500).json({ success: false, data: null, message: "posting went wrong" })
  }

})


// @route    POST api/jobs/add-notes
// @desc     Add to notes to selected notes
// @access   Private
router.post('/add-notes', auth, async (req,res) => {
  let { note, currentIndex, subID } = req.body

  if(currentIndex === 0) {
    return res.status(400).json({ success: false, data: null, msg: 'Notes cannot be added to live result' })
  }

  const candidate = await Candidate.findById(req.candidate.id)

  if (!candidate) {
    return res.status(400).json({ success: false, data: null, msg: 'User not found!' })
  }

  let cardIndex = candidate.jobs_section[insert_index[currentIndex - 1]].findIndex(card => card.id === subID)
  if(cardIndex >= 0) {
    candidate.jobs_section[insert_index[currentIndex - 1]][cardIndex].notes = note

    await candidate.save()
  }

  return res.status(200).json({ success: true, data: null, msg: 'notes added successfully' })
})

module.exports = router;
