const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// 
const scheduledFunction = require("./index.js").myScheduledFunction;
scheduledFunction();
