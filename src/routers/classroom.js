const express = require('express')
const ClassRoom = require('../model/classroom')
const router = new express.Router()
const auth = require('../middleware/auth')
const { nanoid } = require('nanoid')
const User = require('../model/user')
const ObjectID = require('mongodb').ObjectID

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

//get list students and teachers in a class
router.post('/students-teachers', auth, async (req, res) => {
    const userId = req.user._id
    
    try {
        const classroom = await ClassRoom.findById(req.body.classroomId)

        if (classroom.teachers.toString().includes(userId) || classroom.students.toString().includes(userId)) {
            const teachers = []
            for (let i = 0; i < classroom.teachers.length; i++) {
                const user = await User.findById( classroom.teachers[i] )
                teachers.push( {name: user.name} )
            }

            const students = []
            for (let i = 0; i < classroom.students.length; i++) {
                const user = await User.findById( classroom.students[i] )
                students.push( {name: user.name} )
            }

            res.status(200).send( {teachers, students} )
        }
        else {
            res.status(400).send( {Error: "You don't have permission to do this!"} )
        }
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
        const classroom = await ClassRoom.findById(req.params.classCode)

        if (!classroom.teachers.toString().includes(userId) && !classroom.students.toString().includes(userId)) {
            classroom.students = classroom.students.concat( userId )
            await classroom.save()
        }
        res.status(200).send(classroom)
    }
    catch(e) { 
        console.log(e)
        res.status(400).send(e)
    }
})

module.exports = router