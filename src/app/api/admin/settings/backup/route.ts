import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const prismaDbPath = path.join(process.cwd(), "prisma", "dev.db");
    const rootDbPath = path.join(process.cwd(), "dev.db");

    let dbPath = prismaDbPath;

    // Check which file exists or is larger
    try {
      const prismaStats = await fs.stat(prismaDbPath);
      const rootStats = await fs.stat(rootDbPath).catch(() => null);

      if (rootStats && rootStats.size > prismaStats.size) {
        dbPath = rootDbPath;
      }
    } catch {
      try {
        await fs.stat(rootDbPath);
        dbPath = rootDbPath;
      } catch {
        return NextResponse.json({ error: "قاعدة البيانات غير موجودة" }, { status: 404 });
      }
    }

    const fileBuffer = await fs.readFile(dbPath);
    const dateStr = new Date().toISOString().split("T")[0];

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="backup-el-minassa-${dateStr}.db"`,
      },
    });
  } catch (error) {
    console.error("Database backup error:", error);
    return NextResponse.json({ error: "خطأ في تحميل نسخة قاعدة البيانات" }, { status: 500 });
  }
}
