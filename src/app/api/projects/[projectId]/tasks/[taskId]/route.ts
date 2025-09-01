import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; taskId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { projectId, taskId } = await params;
  const task = await prisma.task.findUnique({
    where: { id: taskId },
  });
  if (!task || task.projectId !== projectId)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(task);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; taskId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { taskId } = await params;
  const { title, status, dueDate } = await req.json();
  const task = await prisma.task.update({
    where: { id: taskId },
    data: { title, status, dueDate: dueDate ? new Date(dueDate) : undefined },
  });
  return NextResponse.json(task);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; taskId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { taskId } = await params;
  await prisma.task.delete({ where: { id: taskId } });
  return NextResponse.json({ success: true });
}
