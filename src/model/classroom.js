const mongoose = require('mongoose')

const classroomSchema = new mongoose.Schema( {
    name: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    colorthemes: {
        type: String,
        default: "66B2FF"
    },
    teachers: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }],
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }],
},
{
    timestamps: true
})

classroomSchema.pre('save', async function(next) {
    const classroom = this

    console.log("change update classroom!")

    next()
})

const ClassRoom = mongoose.model('ClassRoom', classroomSchema)

module.exports = ClassRoom