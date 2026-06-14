import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Récupérer l'userId depuis le cookie
    const cookieHeader = req.headers.get("cookie");
    const authCookie = cookieHeader?.match(/authUserId=([^;]+)/);
    const userId = authCookie ? authCookie[1] : null;

    if (!userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    // Compter toutes les entités
    const totalClients = await prisma.client.count({ where: { userId } });
    const totalDossiers = await prisma.dossier.count({ where: { userId } });
    const totalRendezVous = await prisma.rendezVous.count({ where: { userId } });
    const totalDocuments = await prisma.document.count({ where: { userId } });

    // Prochains rendez-vous
    const upcomingRendezVous = await prisma.rendezVous.findMany({
      where: {
        userId,
        isDone: false,
        date: { gte: new Date() },
      },
      orderBy: { date: "asc" },
      take: 5,
      select: {
        id: true,
        title: true,
        date: true,
        time: true,
      },
    });

    return NextResponse.json({
      totalClients,
      totalDossiers,
      totalRendezVous,
      totalDocuments,
      upcomingRendezVous: upcomingRendezVous.map(r => ({
        id: r.id,
        title: r.title,
        date: r.date.toISOString(),
        time: r.time,
      })),
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}