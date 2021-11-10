const express = require('express')
const ClassRoom = require('../model/classroom')
const router = new express.Router()
const auth = require('../middleware/auth')
const { nanoid } = require('nanoid')

//create new classroom
router.post('/create-classroom', auth, async (req, res) => {
    const data = req.body
    data.code = nanoid()
    const teacherId = req.user._id
    const classroom = new ClassRoom(data)
    
    classroom.teachers = classroom.teachers.concat( teacherId )

    try {
        await classroom.save()
        res.status(201).send({classroom})
    }
    catch(e) { 
        console.log(e)
        res.status(400).send(e)
    }
})

router.get('/classrooms', auth, async (req, res) => {
    const userId = req.user._id

    try {
        const classroom = await ClassRoom.find( { teachers: userId } )

        if (!classroom) {
            res.status(404).send("Classroom not found!")
        }
        res.status(200).send(classroom)
    }
    catch(e) { 
        console.log(e)
        res.status(400).send(e)
    }
})

module.exports = router