import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `FAC-${year}-${random}`;
}

export async function GET(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie");
    const authCookie = cookieHeader?.match(/authUserId=([^;]+)/);
    const userId = authCookie ? authCookie[1] : null;

    if (!userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const factures = await prisma.facture.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ factures });
  } catch (error) {
    console.error("GET factures error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie");
    const authCookie = cookieHeader?.match(/authUserId=([^;]+)/);
    const userId = authCookie ? authCookie[1] : null;

    if (!userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await req.json();
    const { client, amount, description, dueDate } = body;

    if (!client || !amount) {
      return NextResponse.json({ error: "Nom du client et montant requis" }, { status: 400 });
    }

    const invoiceNumber = generateInvoiceNumber();

    const facture = await prisma.facture.create({
      data: {
        userId,
        invoiceNumber,
        client,
        amount: parseFloat(amount),
        description: description || "",
        dueDate: dueDate ? new Date(dueDate) : null,
        status: "BROUILLON",
      },
    });

    return NextResponse.json({ facture }, { status: 201 });
  } catch (error) {
    console.error("POST facture error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get("cookie");
    const authCookie = cookieHeader?.match(/authUserId=([^;]+)/);
    const userId = authCookie ? authCookie[1] : null;

    if (!userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await req.json();
    const { id, client, amount, description, dueDate, status } = body;

    if (!id) {
      return NextResponse.json({ error: "ID requis" }, { status: 400 });
    }

    const updateData: any = {};
    if (client !== undefined) updateData.client = client;
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (status !== undefined) updateData.status = status;

    const result = await prisma.facture.updateMany({
      where: { id, userId },
      data: updateData,
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Facture non trouvée" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT facture error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

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

    await prisma.facture.deleteMany({
      where: { id, userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE facture error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}