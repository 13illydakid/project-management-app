import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json([], { status: 401 });
  const tasks = await prisma.task.findMany({
    where: { projectId },
  });
  return NextResponse.json(tasks);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { title, status, dueDate } = await req.json();
  const task = await prisma.task.create({
    data: {
      title,
      status: status || "todo",
      dueDate: dueDate ? new Date(dueDate) : undefined,
      projectId,
    },
  });
  return NextResponse.json(task);
}
