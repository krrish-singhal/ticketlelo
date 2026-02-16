import { NextRequest, NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Check if the route requires admin access
  if (pathname.startsWith("/admin")) {
    // Get the auth token from cookies
    const authToken = request.cookies.get("auth-token");

    // If no auth token, redirect to login
    if (!authToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // In a production app, validate the token here
    // For now, if token exists, allow access
    // In real implementation, verify with Firebase or JWT
  }

  return NextResponse.next();
}

// Configure which routes to apply middleware to
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
