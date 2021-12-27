import { NextRequest, NextResponse, NextFetchEvent } from "next/server";

export const middleware = async (req: NextRequest, ev: NextFetchEvent) => {
  const { pathname } = req.nextUrl;
  if (pathname === "/beatmaps") {
    return NextResponse.redirect("/");
  }
  return NextResponse.next();
};
