import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("authUserId")?.value;
    const userRole = cookieStore.get("authRole")?.value;

    if (!userId || userRole !== "NOTAIRE") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const categorie = searchParams.get("categorie");
    const typeActe = searchParams.get("typeActe");

    const where: any = { userId };
    if (categorie) where.categorie = categorie;
    if (typeActe) where.typeActe = typeActe;

    const aides = await prisma.aideNotaire.findMany({
      where,
      orderBy: { dateModification: "desc" },
    });

    return NextResponse.json(
      { success: true, aides },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Error fetching aides:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des aides" },
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
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const data = await request.json();
    const { titre, description, contenu, typeActe, categorie } = data;

    const aide = await prisma.aideNotaire.create({
      data: {
        userId,
        titre,
        description,
        contenu,
        typeActe,
        categorie,
      },
    });

    return NextResponse.json(
      { success: true, aide },
      { status: 201, headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Error creating aide:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'aide" },
      { status: 500 }
    );
  }
}
