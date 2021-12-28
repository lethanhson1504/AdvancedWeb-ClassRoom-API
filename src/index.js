const express = require('express')
const http = require("http");

const socketIo = require("socket.io");
const classroomSocket = require('./routers/socket');
require('./db/mongoose')
const UserRouter = require('./routers/user')
const ClassRoomRouter = require('./routers/classroom')
const AssignmentRouter = require('./routers/assignment')

const GradeReviewRouter = require("./routers/gradeReview");
const NotificationRouter = require('./routers/notification').router

const AdminRouter = require('./routers/admin')

const cors = require('cors')
const corsOptions ={
  origin:'*', 
  credentials:true,
  optionSuccessStatus:200,
}

const app = express()
const port = process.env.PORT
const server = http.createServer(app);
global.io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// dòng này để start cái socket server
const socket = classroomSocket(io);

app.use(cors(corsOptions)) 
app.use(express.json())

app.use(UserRouter)
app.use(ClassRoomRouter)
app.use(AssignmentRouter)
app.use(NotificationRouter)
app.use(GradeReviewRouter)
app.use(AdminRouter)


server.listen(port, () => console.log(`Server is listening on port ${port}`));
