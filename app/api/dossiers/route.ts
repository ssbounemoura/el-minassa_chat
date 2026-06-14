import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Récupérer tous les dossiers de l'utilisateur
export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie");
    const authCookie = cookieHeader?.match(/authUserId=([^;]+)/);
    const userId = authCookie ? authCookie[1] : null;

    if (!userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const dossiers = await prisma.dossier.findMany({
      where: { userId },
      include: { client: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ dossiers });
  } catch (error) {
    console.error("GET dossiers error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Créer un nouveau dossier
export async function POST(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie");
    const authCookie = cookieHeader?.match(/authUserId=([^;]+)/);
    const userId = authCookie ? authCookie[1] : null;

    if (!userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await req.json();
    const { title, clientId, caseType, status, courtName, caseNumber, nextHearing, description } = body;

    const dossier = await prisma.dossier.create({
      data: {
        userId,
        title,
        clientId: clientId || null,
        caseType,
        status: status || "EN_COURS",
        courtName,
        caseNumber,
        nextHearing: nextHearing ? new Date(nextHearing) : null,
        description,
      },
    });

    return NextResponse.json({ dossier }, { status: 201 });
  } catch (error) {
    console.error("POST dossier error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PUT - Modifier un dossier
export async function PUT(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie");
    const authCookie = cookieHeader?.match(/authUserId=([^;]+)/);
    const userId = authCookie ? authCookie[1] : null;

    if (!userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await req.json();
    const { id, title, clientId, caseType, status, courtName, caseNumber, nextHearing, description } = body;

    const dossier = await prisma.dossier.updateMany({
      where: { id, userId },
      data: { title, clientId, caseType, status, courtName, caseNumber, nextHearing: nextHearing ? new Date(nextHearing) : null, description },
    });

    if (dossier.count === 0) {
      return NextResponse.json({ error: "Dossier non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT dossier error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE - Supprimer un dossier
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

    await prisma.dossier.deleteMany({
      where: { id, userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE dossier error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}