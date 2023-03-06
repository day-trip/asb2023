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
    socket.on("new", (data) => {
        io.except(socket.id).emit("new", data);
    });
    socket.on("votesg", (data) => {
        io.except(socket.id).emit("votesg", data);
    });
    socket.on("newg", (data) => {
        io.except(socket.id).emit("newg", data);
    });
});

io.listen(5000);