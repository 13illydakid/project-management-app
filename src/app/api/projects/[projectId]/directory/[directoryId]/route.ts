import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import path from "path";
import { statSync } from "fs";

// Get contents of a directory (folders and files)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; directoryId: string }> }
) {
  const { directoryId } = await params;
  const dir = await prisma.directory.findUnique({
    where: { id: directoryId },
    include: { children: true, files: true },
  });
  if (!dir) return NextResponse.json(null);
  const files = (dir.files || []).map((f) => {
    const abs = path.join(process.cwd(), "public", f.url.replace(/^\/+/, ""));
    let size: number | null = null;
    try {
      size = statSync(abs).size;
    } catch {}
    const ext = f.name.split(".").pop()?.toLowerCase();
    const mimeMap: Record<string, string> = {
      pdf: "application/pdf",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      svg: "image/svg+xml",
      mp3: "audio/mpeg",
      wav: "audio/wav",
      mp4: "video/mp4",
      webm: "video/webm",
      txt: "text/plain",
      md: "text/markdown",
      json: "application/json",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    };
    const mimeType = (ext && mimeMap[ext]) || null;
    return { ...f, size, mimeType };
  });
  return NextResponse.json({ ...dir, files });
}

// Delete directory with confirmation
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; directoryId: string }> }
) {
  const { directoryId } = await params;
  // In a real app, add confirmation logic here
  await prisma.directory.delete({ where: { id: directoryId } });
  return NextResponse.json({ success: true });
}
// Update directory: rename or set note
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; directoryId: string }> }
) {
  const { directoryId } = await params;
  const body = await req.json();
  const data: {
    name?: string;
    note?: string | null;
    parentId?: string | null;
  } = {};
  if (typeof body.name === "string") data.name = body.name;
  if ("note" in body) data.note = body.note as string | null;
  if ("parentId" in body) {
    const targetParentId = (body.parentId as string | null) ?? null;
    if (targetParentId) {
      if (targetParentId === directoryId) {
        return NextResponse.json(
          { error: "Cannot move a folder into itself." },
          { status: 400 }
        );
      }
      let cur: string | null = targetParentId;
      for (let i = 0; i < 256 && cur; i++) {
        if (cur === directoryId) {
          return NextResponse.json(
            { error: "Cannot move a folder into its own descendant." },
            { status: 400 }
          );
        }
        const parent = (await prisma.directory.findUnique({
          where: { id: cur },
          select: { parentId: true },
        })) as { parentId: string | null } | null;
        cur = parent?.parentId ?? null;
      }
    }
    data.parentId = targetParentId;
  }
  const dir = await prisma.directory.update({
    where: { id: directoryId },
    data,
  });
  return NextResponse.json(dir);
}
