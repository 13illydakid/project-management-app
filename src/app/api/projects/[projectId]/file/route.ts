import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import path from "path";
import fs from "fs/promises";
import { statSync } from "fs";
import { put } from "@vercel/blob";

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

  let url: string;
  if (process.env.VERCEL) {
    // Upload to Vercel Blob in production
    try {
      const { url: blobUrl } = await put(file.name, file, {
        access: "public",
        addRandomSuffix: true,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      url = blobUrl;
    } catch (err: unknown) {
      const e = err as { message?: string } | undefined;
      // Helpful message if the Blob integration/token is missing
      const message = e?.message || "Upload failed. Check Blob configuration.";
      return NextResponse.json(
        {
          error:
            "Vercel Blob upload failed. Ensure the Vercel Blob integration is enabled for this project OR set BLOB_READ_WRITE_TOKEN.",
          details: message,
        },
        { status: 500 }
      );
    }
  } else {
    // Local dev: write to public/uploads
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, file.name);
    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(arrayBuffer));
    url = `/uploads/${file.name}`;
  }
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
    let size: number | null = null;
    if (!/^https?:\/\//.test(f.url)) {
      const abs = path.join(process.cwd(), "public", f.url.replace(/^\/+/, ""));
      try {
        size = statSync(abs).size;
      } catch {}
    }
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
