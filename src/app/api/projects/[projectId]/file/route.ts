import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs/promises";
import { statSync } from "fs";

const prisma = new PrismaClient();
const uploadDir = path.join(process.cwd(), "public", "uploads");

// POST: Upload file to project root directory
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const directoryId = (formData.get("directoryId") as string) || null;
  if (!file)
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

  await fs.mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, file.name);
  const arrayBuffer = await file.arrayBuffer();
  await fs.writeFile(filePath, Buffer.from(arrayBuffer));

  const url = `/uploads/${file.name}`;
  const dbFile = await prisma.file.create({
    data: {
      name: file.name,
      url,
      projectId,
      directoryId,
    },
  });
  return NextResponse.json(dbFile);
}

// GET: List files in project root directory
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const files = await prisma.file.findMany({
    where: { projectId, directoryId: null },
  });
  const withMeta = files.map((f) => {
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
  return NextResponse.json(withMeta);
}
