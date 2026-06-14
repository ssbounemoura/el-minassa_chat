import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Récupérer tous les clients de l'utilisateur
export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie");
    const authCookie = cookieHeader?.match(/authUserId=([^;]+)/);
    const userId = authCookie ? authCookie[1] : null;

    if (!userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const clients = await prisma.client.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ clients });
  } catch (error) {
    console.error("GET clients error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Créer un nouveau client
export async function POST(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie");
    const authCookie = cookieHeader?.match(/authUserId=([^;]+)/);
    const userId = authCookie ? authCookie[1] : null;

    if (!userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await req.json();
    const { fullName, phone, email, address, nationalId, notes } = body;

    const client = await prisma.client.create({
      data: {
        userId,
        fullName,
        phone,
        email,
        address,
        nationalId,
        notes,
      },
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    console.error("POST client error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PUT - Modifier un client
export async function PUT(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie");
    const authCookie = cookieHeader?.match(/authUserId=([^;]+)/);
    const userId = authCookie ? authCookie[1] : null;

    if (!userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await req.json();
    const { id, fullName, phone, email, address, nationalId, notes } = body;

    const client = await prisma.client.updateMany({
      where: { id, userId },
      data: { fullName, phone, email, address, nationalId, notes },
    });

    if (client.count === 0) {
      return NextResponse.json({ error: "Client non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT client error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE - Supprimer un client
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

    await prisma.client.deleteMany({
      where: { id, userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE client error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}