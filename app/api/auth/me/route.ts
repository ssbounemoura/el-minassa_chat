import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("authUserId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        officeName: true,
        wilayaId: true,
        customWilaya: true,
        wilaya: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    const responseUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      officeName: user.officeName,
      wilayaId: user.wilayaId,
      customWilaya: user.customWilaya,
      wilayaName: user.wilaya?.name || null,
    };

    return NextResponse.json({ user: responseUser }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Error in /api/auth/me GET:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("authUserId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const data = await request.json();
    const { name, email, phone, officeName } = data;

    // Check if email is being changed to an existing one
    if (email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 400 });
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (officeName !== undefined) updateData.officeName = officeName;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        officeName: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Error in /api/auth/me PATCH:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}