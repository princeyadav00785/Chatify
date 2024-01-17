const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const { MongoClient } = require("mongodb");
require("dotenv").config(); // Load environment variables from .env file

app.use(cors());

const server = http.createServer(app);
const CHAT_BOT = "ChatBot";
const MongoSaveMessage = require("./services/mongo-save-message");
const MongoGetMessage = require("./services/mongo-get-message");

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// MongoDB connection URI and password from environment variables
const mongoURI = process.env.MONGODB_URL;
const mongoPwd = process.env.MONGODB_PWD;

// Function to connect to MongoDB
async function connectToMongo() {
  const client = new MongoClient(`${mongoURI}/${mongoPwd}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    console.log("Connected to MongoDB");
    return client.db(); // Return the database instance
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}

// Additional log statement for successful MongoDB connection
connectToMongo()
  .then(() => {
    console.log("Server successfully connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

io.on("connection", (socket) => {
  console.log(`User connected ${socket.id}`);

  socket.on("join_room", async (data) => {
    const { username, room } = data;

    // Connect to MongoDB
    const db = await connectToMongo();

    // Use the correct function for getting messages (MongoGetMessage instead of harperGetMessages)
    MongoGetMessage(room)
      .then((last100Messages) => {
        socket.emit("last_100_messages", last100Messages);
      })
      .catch((err) => console.log(err));

    socket.join(room);

    let __createdtime__ = Date.now();

    // Emit welcome message
    socket.to(room).emit("receive_message", {
      message: `${username} has joined the chat room`,
      username: CHAT_BOT,
      __createdtime__,
    });

    socket.emit("receive_message", {
      message: `Welcome ${username}`,
      username: CHAT_BOT,
      __createdtime__,
    });

    socket.on("disconnect", async () => {
      console.log("User disconnected");

      // Emit user leaving message
      socket.to(room).emit("receive_message", {
        message: `${username} has left the chat room`,
        username: CHAT_BOT,
        __createdtime__,
      });

      // Disconnect from MongoDB
      db.close();
    });
  });
});

app.get("/", (req, res) => {
  res.send("Hello world");
});

server.listen(4000, () => {
  console.log("Server is running on port 4000");
});
