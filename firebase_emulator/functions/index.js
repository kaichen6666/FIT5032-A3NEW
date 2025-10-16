require("dotenv").config();

const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const AWS = require("aws-sdk");
const admin = require("firebase-admin");

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
