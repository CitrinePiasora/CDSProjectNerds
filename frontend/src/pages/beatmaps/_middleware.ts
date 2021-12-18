import { NextResponse, NextRequest } from "next/server";

export const middleware = async (req, ev) => {
  const { pathname } = req.nextUrl;
  if (pathname === "/beatmaps") {
    return NextResponse.redirect("/");
  }
  return NextResponse.next();
};
