-- AlterTable
ALTER TABLE "Directory" ADD COLUMN "note" TEXT;

-- AlterTable
ALTER TABLE "File" ADD COLUMN "mimeType" TEXT;
ALTER TABLE "File" ADD COLUMN "note" TEXT;
ALTER TABLE "File" ADD COLUMN "size" INTEGER;
