import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Create new directory
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const { name, parentId } = await req.json();
  if (!name)
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  const dir = await prisma.directory.create({
    data: {
      name,
      projectId,
      parentId: parentId || null,
    },
  });
  return NextResponse.json(dir);
}

// Get all directories for a project
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const dirs = await prisma.directory.findMany({
    where: { projectId, parentId: null },
    include: { children: true, files: true },
  });
  return NextResponse.json(dirs);
}
