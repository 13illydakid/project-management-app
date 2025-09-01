import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  // No projectId needed here
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json([], { status: 401 });
  const projects = await prisma.project.findMany({
    where: { user: { email: session.user.email } },
    include: { tasks: true },
  });
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  // No projectId needed here
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name } = await req.json();
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  const project = await prisma.project.create({
    data: { name, userId: user.id },
  });
  return NextResponse.json(project);
}
