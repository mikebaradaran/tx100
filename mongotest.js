const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

// ========================
// MongoDB setup
// ========================
const username = "mikeb";   
const password = "Password123";
const dbName = "test";
const mongoUri = `mongodb+srv://${username}:${password}@cluster0.smk7bk1.mongodb.net/${dbName}?retryWrites=true&w=majority`;
const client = new MongoClient(mongoUri);
let collection;

async function initDB() {
    await client.connect();
    const db = client.db(dbName);
    collection = db.collection("startData");
}

initDB();

let startData;
// ========================
// Routes
// ========================
async function saveAll(res) {
    try {
        await collection.deleteMany({}); // clear old messages
        await collection.insertOne(startData); // save current chat array
        res.send({ success: true, saved: startData });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error saving chats");
    }
}
// Save  array to MongoDB
app.get("/save", async (req, res) => {
    saveAll(res);
});

// Read chat array back from MongoDB
app.get("/read", async (req, res) => {
    try {
        const x = await collection.find({}).toArray();
        res.send(x[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error reading data");
    }
});

// Add a sample chat (just for demo)
// app.get("/add", async (req, res) => {

//     await collection.updateOne(
//         { name: "Bobby" },
//         { $set: { message: "Hello from Bobby at " + new Date().toLocaleTimeString() } },
//         { upsert: true }                    // insert if not exists
//     );
//     res.send({ success: true, updated: "Bobby" });
// });


app.get("/", (req, res) => {
    res.send("<h2>Chat Array Example</h2><p>Use /save, /read</p>");
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});