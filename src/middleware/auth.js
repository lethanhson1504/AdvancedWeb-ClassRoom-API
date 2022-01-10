const jwt = require('jsonwebtoken')
const User = require('../model/user')
const Admin = require('../model/admin')

const auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization").replace('Bearer ', '')
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({ _id: decode._id, 'tokens.token': token })//.lean()

        if (user.status === 'lock' || user.status === 'ban') {
            return res.status(403).send({error: "User has been banned or locked!"})
        }

        if (!user) {
            throw new Error()
        }
        req.token = token
        req.user = user

        next()
    } catch (e) {
        console.log(e)
        res.status(401).send({ error: "Please authenticate!" })
    }
}

const authAdmin = async (req, res, next) => {
    try {
        const token = req.header("Authorization").replace('Bearer ', '')
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        const admin = await Admin.findOne({ _id: decode._id, 'tokens.token': token })//.lean()

        if (!admin) {
            throw new Error("hello world")
        }
        req.token = token
        req.admin = admin

        next()
    } catch (e) {
        console.log(e)
        res.status(401).send({ error: "Please authenticate!" })
    }
}

module.exports = { auth, authAdmin }