const express = require('express')
const http = require("http");
const socketIo = require("socket.io");

require('./db/mongoose')
const UserRouter = require('./routers/user')
const ClassRoomRouter = require('./routers/classroom')
const AssignmentRouter = require('./routers/assignment')
const cors = require('cors')
const corsOptions ={
  origin:'*', 
  credentials:true,
  optionSuccessStatus:200,
}

const app = express()
const port = process.env.PORT
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// dòng này để start cái socket server
var socket = require('./routers/socket')(io);

app.use(cors(corsOptions)) 
app.use(express.json())

app.use(UserRouter)
app.use(ClassRoomRouter)
app.use(AssignmentRouter)


server.listen(port, () => console.log(`Server is listening on port ${port}`));