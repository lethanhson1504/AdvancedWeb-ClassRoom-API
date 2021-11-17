const express = require('express')
const ClassRoom = require('../model/classroom')
const router = new express.Router()
const auth = require('../middleware/auth')
const { nanoid } = require('nanoid')
const User = require('../model/user')
const ObjectID = require('mongodb').ObjectID

const themeColors = ['#6D9886', '#D9CAB3', '#506D84', '#86340A', '#CC9B6D', '#91091E']

//create new classroom
router.post('/create-classroom', auth, async (req, res) => {
    const data = req.body
    data.code = nanoid()

    if (!data.themeColor?.length) {
        const random = Math.floor(Math.random() * themeColors.length)
        data['themeColor'] = themeColors[random]
    }

    const teacherId = req.user._id
    const classroom = new ClassRoom(data)

    classroom.teachers = classroom.teachers.concat(teacherId)

    try {
        await classroom.save()
        res.status(201).send(classroom)
    }
    catch (e) {
        console.log('CREATE CLASS:', e)
        res.status(400).send(e)
    }
})

//get all classroom
router.get('/classrooms', auth, async (req, res) => {
    const userId = req.user._id

    try {
        const teachers_classroom = await ClassRoom.find({ teachers: userId })
        const students_classroom = await ClassRoom.find({ students: userId })

        const result = teachers_classroom.concat(students_classroom)

        res.status(200).send(result)
    }
    catch (e) {
        console.log('GET CLASSES:', e)
        res.status(400).send(e)
    }
})

//get classroom by id
router.get('/classrooms/:id', auth, async (req, res)=>{
    const userId = req.user._id

    try {
        const classroom = await ClassRoom.findById(req.params.id)

        if (classroom.teachers.toString().includes(userId) || classroom.students.toString().includes(userId)) {
            res.status(200).send(classroom)
        }
        else {
            res.status(400).send({ Error: "You don't have permission to do this!" })
        }
    }
    catch (e) {
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
                const user = await User.findById(classroom.teachers[i])
                teachers.push({ name: user.name, email: user.email, id: user._id})
            }

            const students = []
            for (let i = 0; i < classroom.students.length; i++) {
                const user = await User.findById(classroom.students[i])
                students.push({ name: user.name, email: user.email, id: user._id, studentId: user.studentId  })
            }

            res.status(200).send({ teachers, students })
        }
        else {
            res.status(400).send({ Error: "You don't have permission to do this!" })
        }
    }
    catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

//edit class by teacher
router.patch('/classrooms/edit/:classCode', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['themeColor', 'name', 'description', 'room', 'subject', 'banner']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    const userId = req.user._id
    try {
        const classroom = await ClassRoom.findOne({ code: req.params.classCode })

        if (!classroom.teachers.toString().includes(userId)) {
            return res.status(400).send({ error: "You don't have permission to do this!" })
        }

        updates.forEach((update) => classroom[update] = req.body[update])

        await classroom.save()

        res.status(200).send(classroom)

    } catch (e) {
        res.status(400).send(e)
    }
})

//invite to classroom by link
router.get('/classrooms/join/:classCode', auth, async (req, res) => {
    const userId = req.user._id

    try {
        const classroom = await ClassRoom.findOne({ code: req.params.classCode })

        if (!classroom.teachers.toString().includes(userId) && !classroom.students.toString().includes(userId)) {
            classroom.students = classroom.students.concat(userId)
            await classroom.save()
        }
        res.status(200).send(classroom)
    }
    catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

//invite teacher to classroom by link via email
router.post('/classrooms/invite-teacher', auth, async (req, res) => {
    const userId = req.user._id
    console.log(req.user.email)

    if (req.user.email !== req.body.email) {
        return res.status(400).send( {error: "You don't have permission to do this!"} )
    }

    try {
        const classroom = await ClassRoom.findOne({ code: req.body.classCode })

        if (!classroom.teachers.toString().includes(userId)) {
            classroom.teachers = classroom.teachers.concat(userId)
            await classroom.save()    
        }
        if (classroom.students.toString().includes(userId)) {
            const index = classroom.students.indexOf(userId)
            classroom.students.splice(index, 1);
            await classroom.save()
        }

        return res.status(200).send(classroom)
    }
    catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

module.exports = router