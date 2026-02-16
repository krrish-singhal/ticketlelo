# Firestore Security Rules Setup

## Quick Fix for Development (Testing Only)

If you just want to test the app quickly, you can use these **temporary** open rules:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `ticketlelo-18bcd`
3. Click **Firestore Database** in the left menu
4. Click the **Rules** tab
5. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

6. Click **Publish**

⚠️ **WARNING**: These rules allow anyone to read/write your database. Only use for testing!

---

## Production Setup (Recommended)

For production, use the secure rules from `firestore.rules`:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `ticketlelo-18bcd`
3. Click **Firestore Database** in the left menu
4. Click the **Rules** tab
5. Copy the content from `firestore.rules` file in this project
6. Paste it into the Firebase console
7. Click **Publish**

### Setup Admin Access

To give yourself admin access:

1. Register a user account in your app
2. Get your Firebase User ID (UID) from Firebase Console → Authentication
3. Go to Firestore Database
4. Create a new collection called `admins`
5. Create a document with your UID as the document ID
6. Add a field: `email` with your email address
7. Add a field: `createdAt` with a timestamp

Now you'll have admin access to manage events, batches, and registrations.

---

## Deploy Rules via Firebase CLI (Optional)

If you have Firebase CLI installed:

```bash
firebase deploy --only firestore:rules
```

Make sure you have `firebase.json` configured in your project root.
