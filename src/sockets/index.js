const { handlePresence } = require("./presence");

const initializeSockets = (io) => {
  io.on("connection", (socket) => {
    const { userId, name } = socket.data;
    console.log(`User ${name} [${userId}] connected - Session ID: ${socket.id}`);

    // Register presence tracking module
    handlePresence(io, socket);

    // Other socket modules (tasks, chat, etc) can be registered here
  });
};

module.exports = initializeSockets;
