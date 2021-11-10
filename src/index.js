const express = require('express')
require('./db/mongoose')
const UserRouter = require('./routers/user')
// const TaskRouter = require('./routers/task')
const User = require('./model/user')

const app = express()
const port = process.env.PORT


app.use(express.json())

app.use(UserRouter)
// app.use(TaskRouter)


app.listen(port, () => {
    console.log("Server is listening on " + port)
})
