const express = require("express");
const ClassRoom = require("../model/classroom");
const Assignment = require("../model/assignment");
const Notification = require("../model/notification");
const router = new express.Router();
const auth = require("../middleware/auth");
const {nanoid} = require("nanoid");
const User = require("../model/user");
const ObjectID = require("mongodb").ObjectID;


const sendNotifToUser = async (notifId, message) => {
    const notif = await Notification.findById(notifId)

    if (notif && notif !== undefined) {
        console.log("send notif to",notifId, message)
        var offset = 7;
        var stringDate = new Date( ).toUTCString()

        var date = new Date(stringDate)
        var time = date.toLocaleString("vi-VN");

        notif.notifications.push({description: message, time: time});


        await notif.save()
        for (const clientId of notif.clientId) {
            io.to(clientId.socketId).emit("newNotif", notif.notifications);
        }
    }
}
//get all assignments
router.get("/notifications", auth, async (req, res) => {

    try {
        const user = await User.findById(req.user._id)
        if (user) {
            const notification = await Notification.findById(user.notifications._id);
            if (notification) {

                result = notification.notifications;

                if (result) {
                    return res.status(200).send(result);
                }
                return res.status(200).send({});
            }
        }
        return res.status(400).send("Cant not found notifications");
    } catch (e) {
        console.log(e);
        return res.status(400).send(e);
    }
});
exports.router = router;
exports.sendNotif = sendNotifToUser;