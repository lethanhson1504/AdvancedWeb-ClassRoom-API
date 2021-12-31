const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        clientId: [
            {
                socketId: String
            }
        ],
        notifications: [
            {
                description: String,
                time: String
            },
        ],
        newNotifCount: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true,
    }
);

notificationSchema.pre("save", async function (next) {
    const assignment = this;

    console.log("Change update notification!");

    next();
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
