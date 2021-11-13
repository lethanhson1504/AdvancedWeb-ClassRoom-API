const express = require('express')
require('./db/mongoose')
const UserRouter = require('./routers/user')
const ClassRoomRouter = require('./routers/classroom')
const cors = require('cors')

const app = express()
const port = process.env.PORT


app.use(cors())
app.use(express.json())

app.use(UserRouter)
app.use(ClassRoomRouter)


app.listen(port, () => {
    console.log("Server is listening on " + port)
})
