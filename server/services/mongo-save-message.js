const { MongoClient } = require("mongodb");
require("dotenv").config();

async function mongoSaveMessage(message, username, room) {
  const mongoURI = process.env.MONGODB_URL;
  const mongoPwd = process.env.MONGODB_PWD;

  if (!mongoURI || !mongoPwd) {
    console.error("MongoDB credentials not provided.");
    return null;
  }

  const client = new MongoClient(`${mongoURI}/${mongoPwd}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db();
    const messagesCollection = db.collection("messages");

    // Insert the message into the MongoDB collection
    const result = await messagesCollection.insertOne({
      message,
      username,
      room,
    });

    console.log("Message saved to MongoDB:", result.insertedId);

    return result.insertedId;
  } catch (error) {
    console.error("Error saving message to MongoDB:", error);
    throw error;
  } finally {
    await client.close();
    console.log("Disconnected from MongoDB");
  }
}

module.exports = mongoSaveMessage;
