import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const settingsPath = path.join(process.cwd(), "src/lib/settings.json");

const defaultSettings = {
  systemName: "المنصة القانونية الجزائرية",
  maintenanceMode: false,
  contactEmail: "contact@el-minassa.com",
  contactPhone: "0676 212 922",
  contactAddress: "Rue Berdoudi Bachir, El Arrouch, Skikda",
  aiModel: "google/gemma-4-31b-it:free",
  aiTemperature: 0.4,
  aiMaxTokens: 3072,
};

async function readSettings() {
  try {
    const data = await fs.readFile(settingsPath, "utf-8");
    return JSON.parse(data);
  } catch {
    return defaultSettings;
  }
}

export async function GET() {
  try {
    const settings = await readSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json({ error: "خطأ في تحميل الإعدادات" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const currentSettings = await readSettings();

    const newSettings = {
      ...currentSettings,
      ...body,
      // Validation & sanitization
      aiTemperature: parseFloat(body.aiTemperature) ?? currentSettings.aiTemperature,
      aiMaxTokens: parseInt(body.aiMaxTokens) ?? currentSettings.aiMaxTokens,
      maintenanceMode: !!body.maintenanceMode,
    };

    // Write back to settings.json
    await fs.mkdir(path.dirname(settingsPath), { recursive: true });
    await fs.writeFile(settingsPath, JSON.stringify(newSettings, null, 2), "utf-8");

    return NextResponse.json({ success: true, settings: newSettings });
  } catch (error) {
    console.error("Save settings error:", error);
    return NextResponse.json({ error: "خطأ في حفظ الإعدادات" }, { status: 500 });
  }
}
