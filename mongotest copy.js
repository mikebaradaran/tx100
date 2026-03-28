const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

// ========================
// MongoDB setup
// ========================
const username = "mikeb";        // your DB username
const password = "Password123";
const dbName = "test";
const mongoUri = `mongodb+srv://${username}:${password}@cluster0.smk7bk1.mongodb.net/${dbName}?retryWrites=true&w=majority`;
const client = new MongoClient(mongoUri);
let collection;

async function initDB() {
    await client.connect();
    const db = client.db(dbName);
    collection = db.collection("chatHistory"); // collection for chat messages
    console.log("MongoDB connected");
}

initDB().catch(console.error);


let chats = [
    { name: "Alice", message: "Hello!" },
    { name: "Bob", message: "Hi Alice!" }
];

// ========================
// Routes
// ========================
async function saveAll(res) {
    try {
        await collection.deleteMany({}); // clear old messages
        await collection.insertMany(chats); // save current chat array
        res.send({ success: true, saved: chats.length });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error saving chats");
    }
}
// Save chat array to MongoDB
app.get("/save", async (req, res) => {
    saveAll(res);
});

// Save chat array to MongoDB
app.get("/clear", async (req, res) => {
    chats.forEach(chat => chat.message = "");
    saveAll(res);
});

app.get("/reset", async (req, res) => {
    chats = []
    saveAll(res);
});


// Read chat array back from MongoDB
app.get("/read", async (req, res) => {
    try {
        const savedChats = await collection.find({}).toArray();
        res.send(savedChats);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error reading chats");
    }
});

// Add a sample chat (just for demo)
app.get("/add", async (req, res) => {

    await collection.updateOne(
        { name: "Bobby" },
        { $set: { message: "Hello from Bobby at " + new Date().toLocaleTimeString() } },
        { upsert: true }                    // insert if not exists
    );
    res.send({ success: true, updated: "Bobby" });
});


app.get("/", (req, res) => {
    res.send("<h2>Chat Array Example</h2><p>Use /add, /save, /read /clear /reset</p>");
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});