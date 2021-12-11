const jwt = require('jsonwebtoken')
const User = require('../model/user')

const socketAuth = async (token, data, next) => {
    try {
        // const token = token.replace('Bearer ', '')
        // const token = token
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({ _id: decode._id, 'tokens.token': token })//.lean()

        if (!user) {
            throw new Error()
        }
        // req.token = token
        // req.user = user
        console.log("Verified!")
        next(data)
    } catch (e) {
        console.log(e)
        res.status(401).send({ error: "Please authenticate!" })
    }
}

module.exports = socketAuth