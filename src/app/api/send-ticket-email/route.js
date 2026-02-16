import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import {
  getRegistrationByTicketId,
  getEvent,
  getBatchesByEvent,
} from "@/lib/firestore";
import { generatePDFTicket } from "@/lib/tickets";

/**
 * API Route: Generate PDF ticket and send it via email
 * POST /api/send-ticket-email
 * Body: { ticketId, email, fullName, eventName }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { ticketId, email, fullName, eventName } = body;

    if (!ticketId || !email) {
      return NextResponse.json(
        { error: "ticketId and email are required" },
        { status: 400 },
      );
    }

    // Fetch registration from Firestore
    const registration = await getRegistrationByTicketId(ticketId);
    if (!registration) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Fetch event details
    const event = await getEvent(registration.eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Fetch batch details
    const batches = await getBatchesByEvent(registration.eventId);
    const batch = batches.find((b) => b.id === registration.batchId);

    // Generate PDF ticket
    const pdfBlob = await generatePDFTicket(
      registration,
      event,
      batch,
      registration.qrCode,
    );

    // Convert blob to Buffer
    const pdfArrayBuffer = await pdfBlob.arrayBuffer();
    const pdfBuffer = Buffer.from(pdfArrayBuffer);

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Build the download link as a fallback
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const downloadUrl = `${appUrl}/api/generate-ticket/${ticketId}`;

    // Send email with PDF attachment
    const mailOptions = {
      from: `"TicketLelo" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: `Your Ticket for ${eventName || event.name} - TicketLelo`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #111827; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🎫 TicketLelo</h1>
            <p style="margin: 5px 0 0; opacity: 0.9;">Event Entry Pass</p>
          </div>
          
          <div style="background-color: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none;">
            <h2 style="color: #111827; margin-top: 0;">Hi ${fullName || registration.fullName}!</h2>
            
            <p style="color: #374151; line-height: 1.6;">
              Thank you for registering for <strong>${eventName || event.name}</strong>! 
              Your ticket is confirmed and attached to this email as a PDF.
            </p>
            
            <div style="background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <h3 style="color: #111827; margin-top: 0;">Ticket Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Ticket ID:</td>
                  <td style="padding: 8px 0; color: #111827;">${ticketId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Event:</td>
                  <td style="padding: 8px 0; color: #111827;">${eventName || event.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Name:</td>
                  <td style="padding: 8px 0; color: #111827;">${fullName || registration.fullName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Batch:</td>
                  <td style="padding: 8px 0; color: #111827;">${batch?.name || "General"}</td>
                </tr>
              </table>
            </div>
            
            <p style="color: #374151; line-height: 1.6;">
              📎 <strong>Your PDF ticket is attached below.</strong> Please save it and present 
              the QR code at the entry gate.
            </p>
            
            <p style="color: #6b7280; font-size: 14px;">
              You can also download your ticket anytime: 
              <a href="${downloadUrl}" style="color: #2563eb;">Download Ticket</a>
            </p>
          </div>
          
          <div style="background-color: #111827; color: #9ca3af; padding: 16px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">© ${new Date().getFullYear()} TicketLelo. All rights reserved.</p>
            <p style="margin: 5px 0 0;">This is an automated email. Please do not reply.</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `ticket-${ticketId}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    console.log(`[Email] Ticket PDF sent to ${email} for ticket ${ticketId}`);

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("Send ticket email error:", error);
    return NextResponse.json(
      { error: "Failed to send email", details: error.message },
      { status: 500 },
    );
  }
}
