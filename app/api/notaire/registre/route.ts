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
    const { acteId, numeroRegistre, volume, page, fraisRegistre } = data;

    // Vérifier que l'acte appartient à l'utilisateur
    const acte = await prisma.acteNotarie.findFirst({
      where: { id: acteId, userId },
    });

    if (!acte) {
      return NextResponse.json({ error: "Acte non trouvé" }, { status: 404 });
    }

    // Vérifier l'unicité du numéro de registre
    const existingRegistre = await prisma.registreNotariae.findUnique({
      where: { numeroRegistre },
    });

    if (existingRegistre) {
      return NextResponse.json(
        { error: "Ce numéro de registre existe déjà" },
        { status: 400 }
      );
    }

    // Créer l'enregistrement
    const registre = await prisma.registreNotariae.create({
      data: {
        acteId,
        userId,
        numeroRegistre,
        volume,
        page,
        fraisRegistre,
        dateEnregistrement: new Date(),
        statusLegal: "ENREGISTRE",
      },
    });

    // Mettre à jour le statut de l'acte
    await prisma.acteNotarie.update({
      where: { id: acteId },
      data: {
        status: "ENREGISTRE",
        dateEnregistrement: new Date(),
        numeroRegistre,
      },
    });

    return NextResponse.json(
      { success: true, registre },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Error creating registre:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement" },
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

    const registre = await prisma.registreNotariae.findFirst({
      where: { acteId, userId },
    });

    return NextResponse.json(
      { success: true, registre },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Error fetching registre:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du registre" },
      { status: 500 }
    );
  }
}
