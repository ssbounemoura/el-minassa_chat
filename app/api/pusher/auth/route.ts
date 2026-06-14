import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Pusher from "pusher";

const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { socket_id, channel_name } = body;

    const authResponse = pusherServer.authorizeChannel(socket_id, channel_name, {
      user_id: session.user.id,
      user_info: {
        name: session.user.name || "",
        email: session.user.email,
      },
    });

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error("Erreur auth Pusher:", error);
    return NextResponse.json({ error: "Erreur d'authentification" }, { status: 500 });
  }
}