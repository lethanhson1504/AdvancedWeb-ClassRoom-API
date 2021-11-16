const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const validator = require("email-validator")
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name: {
        type: String
    },
    accountType: {
        required: false,
        type: String
    },
    password: {
        type: String,
        required: false,
        trim: true,
        minlength: 6,
        validate(value) {
            if (value.includes("password")) {
                throw new Error("The pass word could not contains \"password\"!")
            }
        }
    },
    socialId: {
        type: String,
        required: false,
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.validate(value)) {
                throw new Error("Invalid email!")
            }
        }
    },
    studentId: {
        required: false,
        type: String,
        unique: true
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

userSchema.methods.toJSON = function () {
    const userObeject = this.toObject()

    delete userObeject.password
    delete userObeject.tokens
    delete userObeject.avatar

    return userObeject
}

userSchema.methods.generateAuthToken = async function () {

    const token = jwt.sign({ _id: this._id.toString() }, process.env.JWT_SECRET)

    this.tokens = this.tokens.concat({ token })

    await this.save()

    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('Unable to login!')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error("Unable to login!")
    }

    return user
}

userSchema.statics.findByGoogleAccount = async (name, email, id) => {
    var user = await User.findOne({ email })

    if (!user) {
        body = {
            name: name,
            email: email,
            socialId: id,
            accountType: "social"
        }
        console.log("[Not a account, create user with] ", body)
        user = new User(body)
        user.save()
    }

    if (user.accountType == undefined || user.accountType != "social") {
        throw new Error("Unable to login!")
    }
    return user
}

const User = mongoose.model("User", userSchema)

module.exports = User