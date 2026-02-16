"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getCurrentUser, logout as firebaseLogout } from "@/lib/auth";
import { migrateUserRegistrations } from "@/lib/firestore";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Set auth cookie for middleware
          try {
            const token = await firebaseUser.getIdToken();
            document.cookie = `auth-token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
          } catch (cookieErr) {
            console.warn("Failed to set auth cookie:", cookieErr);
          }

          // Fetch user data from Firestore
          let userData = await getCurrentUser(firebaseUser.uid);

          // If no Firestore doc exists, create one from Firebase Auth data
          if (!userData) {
            console.warn(
              "No Firestore user doc found — creating one from Auth profile",
            );
            const { doc, setDoc, Timestamp } =
              await import("firebase/firestore");
            const { db } = await import("@/lib/firebase");

            userData = {
              id: firebaseUser.uid,
              email: firebaseUser.email || "",
              fullName:
                firebaseUser.displayName ||
                firebaseUser.email?.split("@")[0] ||
                "User",
              whatsappPhone: firebaseUser.phoneNumber || "",
              createdAt: Timestamp.now(),
              isAdmin: false,
            };

            await setDoc(doc(db, "users", firebaseUser.uid), userData);
          }

          setUser(userData);
          setError(null);

          // Migrate any orphaned registrations for this user
          try {
            await migrateUserRegistrations(userData.id, userData.email);
          } catch (migrationError) {
            console.warn("Registration migration failed:", migrationError);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        setError(err.message || "Failed to load user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await firebaseLogout();
      // Clear auth cookie
      document.cookie = "auth-token=; path=/; max-age=0; SameSite=Lax";
      setUser(null);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to logout");
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
