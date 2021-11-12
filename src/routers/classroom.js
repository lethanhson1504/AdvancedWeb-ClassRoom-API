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

//get all classroom
router.get('/classrooms', auth, async (req, res) => {
    const userId = req.user._id

    try {
        const teachers_classroom = await ClassRoom.find( { teachers: userId } )
        const students_classroom = await ClassRoom.find( { students: userId } )

        const result = teachers_classroom.concat(students_classroom)

        res.status(200).send(result)
    }
    catch(e) { 
        console.log(e)
        res.status(400).send(e)
    }
})

//invite to classroom by link
router.get('/classrooms/:classCode', auth, async (req, res) => {
    const userId = req.user._id

    try {

        res.status(200).send(req.params.classCode)
    }
    catch(e) { 
        console.log(e)
        res.status(400).send(e)
    }
})

module.exports = router