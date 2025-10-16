require("dotenv").config();

const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const AWS = require("aws-sdk");
const admin = require("firebase-admin");

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");

// ------------------------------
// Initialize Firebase Admin SDK for real Firestore
// ------------------------------
const serviceAccount = require("./serviceAccountKey.json"); // path to your service account JSON
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

// ------------------------------
// Configure AWS SES
// ------------------------------
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
const ses = new AWS.SES({ apiVersion: "2010-12-01" });

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());
app.use(fileUpload());

// ==============================
// 📩 Route 1: Send Email via AWS SES
// ==============================
app.post("/sendEmail", async (req, res) => {
  try {
    const { to, subject, message } = req.body;
    const file = req.files?.attachment;

    if (!to || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Recipient, subject, and message are required.",
      });
    }

    const boundary = "NextPart_" + Date.now();
    const fromEmail = process.env.FROM_EMAIL;

    // Construct MIME email
    const rawLines = [];
    rawLines.push(`From: ${fromEmail}`);
    rawLines.push(`To: ${to}`);
    rawLines.push(`Subject: ${subject}`);
    rawLines.push("MIME-Version: 1.0");
    rawLines.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
    rawLines.push("");
    rawLines.push(`--${boundary}`);
    rawLines.push("Content-Type: text/plain; charset=UTF-8");
    rawLines.push("Content-Transfer-Encoding: 7bit");
    rawLines.push("");
    rawLines.push(message);
    rawLines.push("");

    if (file) {
      const fileBase64 = file.data.toString("base64");
      rawLines.push(`--${boundary}`);
      rawLines.push(`Content-Type: ${file.mimetype}; name="${file.name}"`);
      rawLines.push("Content-Transfer-Encoding: base64");
      rawLines.push(`Content-Disposition: attachment; filename="${file.name}"`);
      rawLines.push("");
      const chunkSize = 76;
      for (let i = 0; i < fileBase64.length; i += chunkSize) {
        rawLines.push(fileBase64.slice(i, i + chunkSize));
      }
      rawLines.push("");
    }

    rawLines.push(`--${boundary}--`);
    rawLines.push("");

    const params = {
      RawMessage: { Data: rawLines.join("\r\n") },
      Source: fromEmail,
    };

    const result = await ses.sendRawEmail(params).promise();
    res.json({ success: true, messageId: result.MessageId });
  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==============================
// 📡 Route 2: Fetch Users from Firestore
// ==============================
app.get("/users", async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==============================
// 📚 Route 3: Fetch Books from Firestore
// ==============================
app.get("/books", async (req, res) => {
  try {
    const snapshot = await db.collection("books").get();
    const books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ success: true, count: books.length, data: books });
  } catch (err) {
    console.error("Error fetching books:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==============================
// 404 Handler
// ==============================
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Endpoint not found." });
});

// Export Express app as Firebase Function
exports.api = functions.https.onRequest(app);


// ==============================
// ⚡ Extra Cloud Function 1: Firestore Trigger (v2)
// Automatically add a timestamp when a new book is created
// ==============================
exports.onBookCreated = onDocumentCreated("books/{bookId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;

  const bookRef = snapshot.ref;
  const createdAt = new Date().toISOString();

  await bookRef.update({ createdAt });
  console.log(`Timestamp added to book ${event.params.bookId}`);
});

// ==============================
// 🕒 Extra Cloud Function 2: Scheduled Cleanup (v2)
// Automatically delete old logs every 24 hours
// ==============================
exports.cleanupOldLogs = onSchedule(
  {
    schedule: "every 24 hours",
    timeZone: "Australia/Sydney",
  },
  async (event) => {
    const now = Date.now();
    const cutoff = now - 30 * 24 * 60 * 60 * 1000; // 30 days
    const snapshot = await db
      .collection("logs")
      .where("timestamp", "<", cutoff)
      .get();

    let deleted = 0;
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
      deleted++;
    });
    if (deleted > 0) await batch.commit();

    console.log(`🧹 Cleaned up ${deleted} old logs.`);
    return null;
  }
);
