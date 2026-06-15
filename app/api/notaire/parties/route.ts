import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("authUserId")?.value;
    const userRole = cookieStore.get("authRole")?.value;

    if (!userId || userRole !== "NOTAIRE") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const data = await request.json();
    const { acteId, nomComplet, qualite, nationalite, numIdNationale, adresseComplete, wilaya, telephone, email } = data;

    // Vérifier que l'acte appartient à l'utilisateur
    const acte = await prisma.acteNotarie.findFirst({
      where: { id: acteId, userId },
    });

    if (!acte) {
      return NextResponse.json({ error: "Acte non trouvé" }, { status: 404 });
    }

    const partie = await prisma.partie.create({
      data: {
        acteId,
        nomComplet,
        qualite,
        nationalite,
        numIdNationale,
        adresseComplete,
        wilaya,
        telephone,
        email,
      },
    });

    return NextResponse.json(
      { success: true, partie },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Error creating partie:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'ajout de la partie" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("authUserId")?.value;
    const userRole = cookieStore.get("authRole")?.value;

    if (!userId || userRole !== "NOTAIRE") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const acteId = searchParams.get("acteId");

    if (!acteId) {
      return NextResponse.json({ error: "acteId manquant" }, { status: 400 });
    }

    // Vérifier que l'acte appartient à l'utilisateur
    const acte = await prisma.acteNotarie.findFirst({
      where: { id: acteId, userId },
    });

    if (!acte) {
      return NextResponse.json({ error: "Acte non trouvé" }, { status: 404 });
    }

    const parties = await prisma.partie.findMany({
      where: { acteId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      { success: true, parties },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Error fetching parties:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des parties" },
      { status: 500 }
    );
  }
}
