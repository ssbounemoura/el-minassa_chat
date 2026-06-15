import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("authUserId")?.value;
    const userRole = cookieStore.get("authRole")?.value;

    if (!userId || userRole !== "NOTAIRE") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const typeActe = searchParams.get("typeActe");

    const where: any = { userId };
    if (status) where.status = status;
    if (typeActe) where.typeActe = typeActe;

    const actes = await prisma.acteNotarie.findMany({
      where,
      include: {
        client: true,
        registreNotariae: true,
        parties: true,
      },
      orderBy: { dateActe: "desc" },
    });

    return NextResponse.json(
      { success: true, actes },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Error fetching actes:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des actes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("authUserId")?.value;
    const userRole = cookieStore.get("authRole")?.value;

    if (!userId || userRole !== "NOTAIRE") {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const {
      numeroActe,
      typeActe,
      dateActe,
      clientId,
      montantTransaction,
      description,
      parties,
    } = data;

    // Vérifier l'unicité du numéro d'acte
    const existingActe = await prisma.acteNotarie.findUnique({
      where: { numeroActe },
    });

    if (existingActe) {
      return NextResponse.json(
        { error: "Ce numéro d'acte existe déjà" },
        { status: 400 }
      );
    }

    const acte = await prisma.acteNotarie.create({
      data: {
        userId,
        numeroActe,
        typeActe,
        dateActe: new Date(dateActe),
        clientId,
        montantTransaction,
        description,
        parties: JSON.stringify(parties || []),
        status: "EN_COURS",
      },
      include: {
        client: true,
        parties: true,
      },
    });

    return NextResponse.json(
      { success: true, acte },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Error creating acte:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'acte" },
      { status: 500 }
    );
  }
}
