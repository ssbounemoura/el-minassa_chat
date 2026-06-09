import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

const settingsPath = path.join(process.cwd(), "src/lib/settings.json");

async function readSettings() {
  try {
    const file = await fs.readFile(settingsPath, "utf-8");
    return JSON.parse(file);
  } catch {
    return { maintenanceMode: false };
  }
}

export async function GET() {
  const settings = await readSettings();
  return NextResponse.json({ maintenanceMode: !!settings.maintenanceMode });
}
