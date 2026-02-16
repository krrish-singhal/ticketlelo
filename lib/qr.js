import QRCode from "qrcode";

/**
 * Generate QR Code for ticket
 * QR only stores ticketId
 */
export const generateQRCode = async (ticketId) => {
  if (!ticketId) throw new Error("Ticket ID required");

  return await QRCode.toDataURL(ticketId, {
    width: 300,
    margin: 2,
    errorCorrectionLevel: "H",
  });
};

/**
 * Extract ticketId from scanned QR
 */
export const parseQRData = (rawValue) => {
  if (!rawValue || typeof rawValue !== "string")
    throw new Error("Invalid QR");

  return rawValue.trim();
};
