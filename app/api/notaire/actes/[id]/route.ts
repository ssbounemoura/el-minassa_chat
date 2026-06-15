import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("authUserId")?.value;
    const userRole = cookieStore.get("authRole")?.value;

    if (!userId || userRole !== "NOTAIRE") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    const acte = await prisma.acteNotarie.findFirst({
      where: { id, userId },
      include: {
        client: true,
        registreNotariae: true,
        parties: true,
      },
    });

    if (!acte) {
      return NextResponse.json({ error: "Acte non trouvé" }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, acte },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Error fetching acte:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'acte" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("authUserId")?.value;
    const userRole = cookieStore.get("authRole")?.value;

    if (!userId || userRole !== "NOTAIRE") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();

    // Vérifier que l'acte appartient à l'utilisateur
    const existingActe = await prisma.acteNotarie.findFirst({
      where: { id, userId },
    });

    if (!existingActe) {
      return NextResponse.json({ error: "Acte non trouvé" }, { status: 404 });
    }

    const updateData: any = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.dateSignature !== undefined) updateData.dateSignature = new Date(data.dateSignature);
    if (data.signatureDigitale !== undefined) updateData.signatureDigitale = data.signatureDigitale;
    if (data.nombrePages !== undefined) updateData.nombrePages = data.nombrePages;
    if (data.montantTransaction !== undefined) updateData.montantTransaction = data.montantTransaction;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.remarques !== undefined) updateData.remarques = data.remarques;
    if (data.controleLegalite !== undefined) updateData.controleLegalite = data.controleLegalite;

    const acte = await prisma.acteNotarie.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        registreNotariae: true,
        parties: true,
      },
    });

    return NextResponse.json(
      { success: true, acte },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Error updating acte:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'acte" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("authUserId")?.value;
    const userRole = cookieStore.get("authRole")?.value;

    if (!userId || userRole !== "NOTAIRE") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    // Vérifier que l'acte appartient à l'utilisateur
    const existingActe = await prisma.acteNotarie.findFirst({
      where: { id, userId },
    });

    if (!existingActe) {
      return NextResponse.json({ error: "Acte non trouvé" }, { status: 404 });
    }

    // Supprimer les parties associées
    await prisma.partie.deleteMany({ where: { acteId: id } });

    // Supprimer le registre si existant
    await prisma.registreNotariae.deleteMany({ where: { acteId: id } });

    // Supprimer l'acte
    await prisma.acteNotarie.delete({ where: { id } });

    return NextResponse.json(
      { success: true, message: "Acte supprimé avec succès" },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("Error deleting acte:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'acte" },
      { status: 500 }
    );
  }
}
