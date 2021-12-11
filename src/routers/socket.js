const auth = require("../middleware/socketAuth");
const Notification = require("../model/notification");

const a = (data) => {
    console.log("receiveData", data);

};

const pushSocketClientId = async (token, clientId) => {
    try {
        const user = await auth(token)
        const notif = await Notification.findById(user.notifications)
        if (notif && notif !== undefined) {
            notif.clientId.push({socketId: clientId});
            await notif.save()
        }
    } catch (e) {
        console.log(e)
    }
}

const removeSocketClientId = async (clientId) => {
    try {
        console.log("Start remove client id", clientId);
        const notif = await Notification.find({clientId: {$elemMatch: {id: clientId.toString()}}})
        if (notif && notif !== undefined) {

            const array =  notif.clientId
            var filtered = console.filter(function(value, index, arr){
                return value.id != clientId;
            });
            notif.clientId = filtered;
            // console.log("Remove client id", clientId);
            await notif.save()
        }
    } catch (e) {
        console.log(e)
    }
}

const io = async (io) => {

    let interval;

    io.on("connection", (client) => {
        // console.log("New client connected", client.id);
        if (interval) {
            clearInterval(interval);
        }
        interval = setInterval(() => getApiAndEmit(client), 1000);
        client.on("disconnect", () => {
            // console.log("Client disconnected", client.id);
            // removeSocketClientId(client.id)
            clearInterval(interval);
        });

        client.on("setToken", (token) => {
            pushSocketClientId(token, client.id)
        });
    });

    const getApiAndEmit = (client) => {
        const response = new Date();
        client.emit("FromAPI", response);
    };
}


exports = module.exports = io
  