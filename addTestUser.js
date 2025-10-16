import admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

try {
  const docRef = await db.collection("users").add({
    name: "Test User",
    email: "test@example.com"
  });
  console.log("Test user added with ID:", docRef.id);
} catch (error) {
  console.error("Error adding test user:", error);
}
