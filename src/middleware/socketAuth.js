const jwt = require('jsonwebtoken')
const User = require('../model/user')

const socketAuth = async (token) => {
    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({ _id: decode._id, 'tokens.token': token })//.lean()
        if (!user) {
            return undefined;
        }
        return user;
    } catch (e) {
        console.log(e)
        return undefined;
    }
}

module.exports = socketAuth