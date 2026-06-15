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
    const parsed = JSON.parse(data);
    return { ...defaultSettings, ...parsed };
  } catch {
    return { ...defaultSettings };
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

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
    }

    const currentSettings = await readSettings();

    const newSettings = {
      ...currentSettings,
      ...(body.systemName !== undefined && { systemName: String(body.systemName).trim() }),
      ...(body.maintenanceMode !== undefined && { maintenanceMode: body.maintenanceMode === true }),
      ...(body.contactEmail !== undefined && { contactEmail: String(body.contactEmail).trim() }),
      ...(body.contactPhone !== undefined && { contactPhone: String(body.contactPhone).trim() }),
      ...(body.contactAddress !== undefined && { contactAddress: String(body.contactAddress).trim() }),
      ...(body.aiModel !== undefined && { aiModel: String(body.aiModel).trim() }),
      ...(body.aiTemperature !== undefined && {
        aiTemperature: Math.min(1.2, Math.max(0, parseFloat(String(body.aiTemperature)) || currentSettings.aiTemperature)),
      }),
      ...(body.aiMaxTokens !== undefined && {
        aiMaxTokens: Math.min(8192, Math.max(256, parseInt(String(body.aiMaxTokens)) || currentSettings.aiMaxTokens)),
      }),
    };

    await fs.mkdir(path.dirname(settingsPath), { recursive: true });
    
    // Direct write to avoid Windows EPERM / EBUSY rename lock errors from file watchers
    await fs.writeFile(settingsPath, JSON.stringify(newSettings, null, 2), "utf-8");

    console.log("Settings saved — maintenanceMode:", newSettings.maintenanceMode);

    const response = NextResponse.json({ success: true, settings: newSettings });

    return response;
  } catch (error) {
    console.error("Save settings error:", error);
    // Explicitly return a friendlier message so the user doesn't see raw EPERM, but also return success=false
    return NextResponse.json({ success: false, error: "فشل حفظ الملف. الرجاء المحاولة مرة أخرى." }, { status: 500 });
  }
}
