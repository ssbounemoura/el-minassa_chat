import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

// Configuration
const UPLOAD_DIR = "public/uploads/documents";

// Helper pour générer un nom de fichier unique
function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = path.extname(originalName);
  const name = path.basename(originalName, extension);
  const safeName = name.replace(/[^a-zA-Z0-9]/g, "_");
  return `${safeName}_${timestamp}_${random}${extension}`;
}

// Helper pour formater la taille du fichier
function getFileSize(bytes: number): number {
  return bytes;
}

export async function POST(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie");
    const authCookie = cookieHeader?.match(/authUserId=([^;]+)/);
    const userId = authCookie ? authCookie[1] : null;

    if (!userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const category = formData.get("category") as string;
    const dossierId = formData.get("dossierId") as string | null;

    if (!file || !title) {
      return NextResponse.json({ error: "Fichier et titre requis" }, { status: 400 });
    }

    // Créer le dossier s'il n'existe pas
    const uploadDir = path.join(process.cwd(), UPLOAD_DIR);
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.log("Dossier déjà existant ou créé");
    }

    // Générer un nom unique pour le fichier
    const fileName = generateFileName(file.name);
    const filePath = path.join(uploadDir, fileName);
    const fileUrl = `/uploads/documents/${fileName}`;

    // Convertir le fichier en buffer et l'écrire
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Sauvegarder dans la base de données
    const document = await prisma.document.create({
      data: {
        userId,
        title,
        category: category || "autre",
        dossierId: dossierId || null,
        fileUrl,
        fileSize: file.size,
      },
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Erreur lors de l'upload" }, { status: 500 });
  }
}