const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const adminSchema = new mongoose.Schema({
    account: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: false,
        trim: true,
        minlength: 6
    },
    name: {
        type: String,
        required: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
})

adminSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

adminSchema.methods.toJSON = function () {
    const userObeject = this.toObject()

    delete userObeject.password
    delete userObeject.tokens
    delete userObeject.avatar

    return userObeject
}

adminSchema.methods.generateAuthToken = async function () {

    const token = jwt.sign({ _id: this._id.toString() }, process.env.JWT_SECRET)

    this.tokens = this.tokens.concat({ token })

    await this.save()

    return token
}

adminSchema.statics.findByCredentials = async (account, password) => {
    const admin = await Admin.findOne({ account })

    if (!admin) {
        throw new Error('Unable to login!')
    }

    const isMatch = await bcrypt.compare(password, admin.password)

    if (!isMatch) {
        throw new Error("Unable to login!")
    }

    return admin
}

const Admin = mongoose.model("Admin", adminSchema)

module.exports = Admin