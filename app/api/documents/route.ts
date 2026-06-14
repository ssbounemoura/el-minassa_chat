import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Récupérer tous les documents de l'utilisateur
export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie");
    const authCookie = cookieHeader?.match(/authUserId=([^;]+)/);
    const userId = authCookie ? authCookie[1] : null;

    if (!userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const documents = await prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("GET documents error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Créer un nouveau document
export async function POST(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie");
    const authCookie = cookieHeader?.match(/authUserId=([^;]+)/);
    const userId = authCookie ? authCookie[1] : null;

    if (!userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await req.json();
    const { title, category, dossierId, fileUrl, fileSize } = body;

    const document = await prisma.document.create({
      data: {
        userId,
        title,
        category,
        dossierId,
        fileUrl,
        fileSize,
      },
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error("POST document error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PUT - Modifier un document
export async function PUT(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie");
    const authCookie = cookieHeader?.match(/authUserId=([^;]+)/);
    const userId = authCookie ? authCookie[1] : null;

    if (!userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await req.json();
    const { id, title, category, dossierId } = body;

    const document = await prisma.document.updateMany({
      where: { id, userId },
      data: { title, category, dossierId },
    });

    if (document.count === 0) {
      return NextResponse.json({ error: "Document non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT document error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE - Supprimer un document
export async function DELETE(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie");
    const authCookie = cookieHeader?.match(/authUserId=([^;]+)/);
    const userId = authCookie ? authCookie[1] : null;

    if (!userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }

    await prisma.document.deleteMany({
      where: { id, userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE document error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}