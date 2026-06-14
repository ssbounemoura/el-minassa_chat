import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Récupérer l'userId depuis les cookies
    const cookieStore = await cookies();
    const userId = cookieStore.get("authUserId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    // Compter toutes les entités
    const totalClients = await prisma.client.count({ where: { userId } });
    const totalDossiers = await prisma.dossier.count({ where: { userId } });
    const totalRendezVous = await prisma.rendezVous.count({ where: { userId } });
    const totalDocuments = await prisma.document.count({ where: { userId } });

    // Prochains rendez-vous (sans le champ time qui n'existe pas)
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
      })),
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}