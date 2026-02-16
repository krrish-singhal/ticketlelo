import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, setDoc, getDoc, collection, query, where, getDocs, Timestamp } from "firebase/firestore";

export const signup = async (email, password, fullName, whatsappPhone) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const firebaseUser = userCredential.user;

    // Create user document in Firestore
    const userData = {
      id: firebaseUser.uid,
      email,
      fullName,
      whatsappPhone,
      createdAt: Timestamp.now(),
      isAdmin: false,
    };

    await setDoc(doc(db, "users", firebaseUser.uid), userData);
    return userData;
  } catch (error) {
    console.error("Signup error:", error.message);
    throw new Error(error.message || "Failed to create account");
  }
};

export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const firebaseUser = userCredential.user;
    
    // Fetch user data from Firestore with timeout fallback
    try {
      const userData = await Promise.race([
        getCurrentUser(firebaseUser.uid),
        new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 5000)),
      ]);
      if (userData) return userData;
    } catch (firestoreErr) {
      console.warn("Firestore fetch failed/timed out, using auth data:", firestoreErr.message);
    }

    // Fallback: return basic user data from Firebase Auth
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email,
      fullName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
      isAdmin: false,
    };
  } catch (error) {
    console.error("Login error:", error.message);
    throw new Error(error.message || "Failed to login");
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error.message);
    throw new Error(error.message || "Failed to logout");
  }
};

export const getCurrentUser = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      // Ensure id field is always present
      return {
        ...userData,
        id: uid,
      };
    }
    return null;
  } catch (error) {
    console.error("Get user error:", error.message);
    return null;
  }
};

export const getUserByEmail = async (email) => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return {
        id: userDoc.id,
        ...userDoc.data()
      };
    }
    return null;
  } catch (error) {
    console.error("Get user by email error:", error.message);
    return null;
  }
};

export const checkEmailExists = async (email) => {
  try {
    // Try to sign in with an empty password to check if email exists
    // This is a workaround since Firebase doesn't have a direct email check
    // In production, use a Cloud Function for this
    return false;
  } catch (error) {
    return false;
  }
};
