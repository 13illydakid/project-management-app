import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Minimal guard to avoid accidental public use; require a header token
const TOKEN = process.env.SEED_TOKEN;

export async function POST(req: NextRequest) {
  if (!TOKEN) {
    return NextResponse.json({ error: "SEED_TOKEN not set" }, { status: 500 });
  }
  const provided = req.headers.get("x-seed-token");
  if (provided !== TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = "demo@demo.com";
  const password = "demo123"; // stored in plain text per current demo logic
  const name = "Demo User";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ created: false, message: "Demo user exists" });
  }

  await prisma.user.create({ data: { email, password, name } });
  return NextResponse.json({ created: true });
}
