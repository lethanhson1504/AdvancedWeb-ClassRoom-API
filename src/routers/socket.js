const auth = require("../middleware/socketAuth");

const a = (data) => {
    console.log("receiveData", data);

};


exports = module.exports = function(io){
        
    let interval;
    
    io.on("connection", (socket) => {
      console.log("New client connected");
      if (interval) {
        clearInterval(interval);
      }
      interval = setInterval(() => getApiAndEmit(socket), 1000);
      socket.on("disconnect", () => {
        console.log("Client disconnected");
        clearInterval(interval);
      });
      socket.on("setSocketId", (token, data) => {
        
        auth(token, data, a);
            
      });
    });

    const getApiAndEmit = (socket) => {
      const response = new Date();
      socket.emit("FromAPI", response);
    };
  }

  