import { getToken } from "next-auth/jwt";
import { NextResponse, NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;


  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const adminPaths = ["/dashboard"];


  // Check ADMIN routes
  if (adminPaths.some((path) => pathname.startsWith(path))) {
    if (token.role !== "admin") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }


  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/dashboard", "/profile", "/change-password"],
};