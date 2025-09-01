import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Move file to a directory
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; fileId: string }> }
) {
  const { fileId } = await params;
  const body = await req.json();
  const data: {
    directoryId?: string | null;
    name?: string;
    note?: string | null;
  } = {};
  if ("directoryId" in body)
    data.directoryId = body.directoryId as string | null;
  if (typeof body.name === "string") data.name = body.name;
  if ("note" in body) data.note = body.note as string | null;
  const file = await prisma.file.update({
    where: { id: fileId },
    data,
  });
  return NextResponse.json(file);
}

// Delete file with confirmation
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; fileId: string }> }
) {
  const { fileId } = await params;
  // In a real app, add confirmation logic here
  await prisma.file.delete({ where: { id: fileId } });
  return NextResponse.json({ success: true });
}
