import { NextRequest, NextResponse } from "next/server";

export function middleware(request) {
  // Firebase Auth is client-side only.
  // Route protection is handled in each layout/page via useAuth().
  // Middleware only handles generic concerns here.
  return NextResponse.next();
}

// Configure which routes to apply middleware to
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
