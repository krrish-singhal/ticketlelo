import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { ticketId } = await req.json();

    if (!ticketId) {
      return NextResponse.json({ status: "invalid" }, { status: 400 });
    }

    // Find registration by ticketId
    const registrationsRef = collection(db, "registrations");
    const q = query(registrationsRef, where("ticketId", "==", ticketId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return NextResponse.json({ status: "not_found" });
    }

    const registrationDoc = querySnapshot.docs[0];
    const registration = registrationDoc.data();

    if (registration.status === "Used") {
      return NextResponse.json({
        status: "already_used",
        usedAt: registration.usedAt,
        user: registration.fullName,
      });
    }

    // Update status to Used
    await updateDoc(registrationDoc.ref, {
      status: "Used",
      usedAt: Timestamp.now(),
    });

    return NextResponse.json({
      status: "valid",
      user: registration.fullName,
      email: registration.email,
      ticketId: registration.ticketId,
    });
  } catch (error) {
    console.error("Verify ticket error:", error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 },
    );
  }
}
