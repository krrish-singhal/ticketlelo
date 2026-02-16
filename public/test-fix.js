// Quick test to verify the fix works
// Place this in your browser console after logging in

console.log("🧪 Testing registration system...");

// Check if your user is loaded
if (window.location.pathname === "/dashboard") {
  console.log("✅ On dashboard page");

  // Check if registrations are loading
  setTimeout(() => {
    const ticketCards = document.querySelectorAll('[class*="ticket"]');
    console.log(`🎫 Found ${ticketCards.length} ticket elements on page`);

    if (ticketCards.length === 0) {
      console.log(
        "❌ No tickets showing - check browser network tab for API errors",
      );
      console.log("💡 Try refreshing the page in 5 seconds");
    } else {
      console.log("✅ Tickets are displaying correctly!");
    }
  }, 3000);
} else {
  console.log("📍 Navigate to /dashboard to test");
}
