const { MongoClient } = require("mongodb");
require("dotenv").config();

async function mongoGetMessages(room) {
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

    // Retrieve messages from the MongoDB collection
    const messages = await messagesCollection
      .find({ room })
      .limit(100)
      .toArray();

    console.log("Messages retrieved from MongoDB:", messages);

    return messages;
  } catch (error) {
    console.error("Error retrieving messages from MongoDB:", error);
    throw error;
  } finally {
    await client.close();
    console.log("Disconnected from MongoDB");
  }
}

module.exports = mongoGetMessages;
