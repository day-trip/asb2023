import {Server} from "socket.io";

const io = new Server({
    cors: {
        origin: "*"
    }
});

io.on("connection", (socket) => {
    socket.on("votes", (data) => {
        io.except(socket.id).emit("votes", data);
    });
});

io.listen(5000);