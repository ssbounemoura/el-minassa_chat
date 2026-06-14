import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Récupérer tous les rendez-vous de l'utilisateur
export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie");
    const authCookie = cookieHeader?.match(/authUserId=([^;]+)/);
    const userId = authCookie ? authCookie[1] : null;

    if (!userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const rendezVous = await prisma.rendezVous.findMany({
      where: { userId },
      include: { dossier: true },
      orderBy: { date: "asc" },
    });

    // Formater la date et l'heure
    const formatted = rendezVous.map((rv) => ({
      id: rv.id,
      title: rv.title,
      description: rv.description,
      date: rv.date.toISOString().split("T")[0],
      time: rv.date.toISOString().split("T")[1]?.substring(0, 5) || "10:00",
      duration: rv.duration,
      location: rv.location,
      isDone: rv.isDone,
      dossierId: rv.dossierId,
      dossier: rv.dossier,
    }));

    return NextResponse.json({ rendezVous: formatted });
  } catch (error) {
    console.error("GET rendez-vous error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Créer un nouveau rendez-vous
export async function POST(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie");
    const authCookie = cookieHeader?.match(/authUserId=([^;]+)/);
    const userId = authCookie ? authCookie[1] : null;

    if (!userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, date, time, duration, location, dossierId } = body;

    if (!title || !date) {
      return NextResponse.json({ error: "Titre et date requis" }, { status: 400 });
    }

    // Combiner date et heure
    const dateTime = new Date(`${date}T${time || "10:00"}:00`);

    const rendezVous = await prisma.rendezVous.create({
      data: {
        userId,
        title,
        description: description || "",
        date: dateTime,
        duration: duration ? parseInt(duration) : 30,
        location: location || "",
        dossierId: dossierId || null,
      },
    });

    return NextResponse.json({ rendezVous }, { status: 201 });
  } catch (error) {
    console.error("POST rendez-vous error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PUT - Modifier un rendez-vous
export async function PUT(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie");
    const authCookie = cookieHeader?.match(/authUserId=([^;]+)/);
    const userId = authCookie ? authCookie[1] : null;

    if (!userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await req.json();
    const { id, title, description, date, time, duration, location, dossierId, isDone } = body;

    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }

    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (date !== undefined && time !== undefined) {
      updateData.date = new Date(`${date}T${time}:00`);
    }
    if (duration !== undefined) updateData.duration = parseInt(duration);
    if (location !== undefined) updateData.location = location;
    if (dossierId !== undefined) updateData.dossierId = dossierId;
    if (isDone !== undefined) updateData.isDone = isDone;

    const rendezVous = await prisma.rendezVous.updateMany({
      where: { id, userId },
      data: updateData,
    });

    if (rendezVous.count === 0) {
      return NextResponse.json({ error: "Rendez-vous non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT rendez-vous error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE - Supprimer un rendez-vous
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

    await prisma.rendezVous.deleteMany({
      where: { id, userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE rendez-vous error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}