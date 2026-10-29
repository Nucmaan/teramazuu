import { NextResponse, type NextRequest } from "next/server";

// Optimistic gate only: bounce visitors without a session cookie away from the
// admin. Every admin page, action and route handler still verifies the session
// against the database (lib/auth.ts) — this is not the authorization layer.
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has("scim_admin");
  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/((?!login).*)"],
};
