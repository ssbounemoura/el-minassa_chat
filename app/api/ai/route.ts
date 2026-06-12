import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const settingsPath = path.join(process.cwd(), "src/lib/settings.json");

const defaultSettings = {
  aiModel: "google/gemma-4-31b-it:free",
  aiTemperature: 0.4,
  aiMaxTokens: 3072,
};

async function getAiSettings() {
  try {
    const data = await fs.readFile(settingsPath, "utf-8");
    const parsed = JSON.parse(data);
    return {
      model: parsed.aiModel || defaultSettings.aiModel,
      temperature: parsed.aiTemperature !== undefined ? parseFloat(parsed.aiTemperature) : defaultSettings.aiTemperature,
      maxTokens: parsed.aiMaxTokens !== undefined ? parseInt(parsed.aiMaxTokens) : defaultSettings.aiMaxTokens,
    };
  } catch {
    return {
      model: defaultSettings.aiModel,
      temperature: defaultSettings.aiTemperature,
      maxTokens: defaultSettings.aiMaxTokens,
    };
  }
}

const CHAT_SYSTEM_PROMPT = `أنت المساعد الذكي القانوني للمنصة القانونية الجزائرية. مهمتك:
- الإجابة على الأسئلة القانونية وفق القانون الجزائري
- تلخيص الوثائق والتقارير القانونية
- صياغة المستندات القانونية (عقود، إنذارات، عرائض...)
- شرح المواد والنصوص القانونية
- تقديم استشارات قانونية استرشادية

قواعد مهمة:
1. أجب دائماً باللغة العربية
2. استند إلى القانون الجزائري (القانون المدني، قانون الأسرة، القانون التجاري، قانون العقوبات، إلخ)
3. اذكر المواد القانونية ذات الصلة عندما يكون ذلك ممكناً
4. نبّه المستخدم أن إجاباتك استرشادية ولا تغني عن الاستشارة القانونية المتخصصة
5. استخدم التنسيق Markdown مع العناوين والقوائم لتسهيل القراءة
6. كن دقيقاً ومهنياً في إجاباتك`;

const SUMMARIZE_SYSTEM_PROMPT = `أنت محلل قانوني متخصص في تلخيص المستندات القانونية الجزائرية.

مهمتك: تلخيص المستند المقدم واستخراج أهم المعلومات القانونية منه.

يجب أن يتضمن الملخص الأقسام التالية (حسب ما يتوفر في المستند):

## نظرة عامة
ملخص مختصر لطبيعة المستند وموضوعه الرئيسي في 2-3 جمل.

## الأطراف المعنية
قائمة بجميع الأطراف المذكورة (أشخاص، شركات، مؤسسات) مع أدوارهم.

## البنود والالتزامات الجوهرية
أهم النقاط والالتزامات والشروط الواردة في المستند.

## المواد القانونية المرجعية
المواد والنصوص القانونية المشار إليها أو المتعلقة بموضوع المستند.

## التواريخ والمهل
التواريخ المهمة والمواعيد النهائية المذكورة.

## ملاحظات وتوصيات
ملاحظات مهمة أو نقاط تحتاج مراجعة أو تنبيهات.

قواعد:
1. أجب دائماً باللغة العربية
2. استخدم التنسيق Markdown
3. كن دقيقاً وموضوعياً
4. إذا لم يتوفر قسم معين، لا تذكره
5. أنهِ بتذكير: "هذا الملخص استرشادي. يرجى مراجعة المستند الأصلي للتفاصيل الكاملة."`;

async function callOpenAI(systemPrompt: string, userContent: string) {
  const aiSettings = await getAiSettings();
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
      "X-Title": "El-Minassa Legal Platform",
    },
    body: JSON.stringify({
      model: aiSettings.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      max_tokens: aiSettings.maxTokens,
      temperature: aiSettings.temperature,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    console.error("OpenRouter error:", errData);
    return null;
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || null;
}

export async function POST(req: NextRequest) {
  if (!OPENROUTER_API_KEY) {
    return NextResponse.json(
      { error: "مفتاح API غير مُهيّأ. يرجى التواصل مع الإدارة." },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { type } = body;

    // === Document Summarization ===
    if (type === "summarize") {
      const { text } = body;
      if (!text || typeof text !== "string" || text.trim().length < 50) {
        return NextResponse.json(
          { error: "النص قصير جداً للتلخيص." },
          { status: 400 }
        );
      }

      const content = await callOpenAI(
        SUMMARIZE_SYSTEM_PROMPT,
        `لخّص المستند القانوني التالي:\n\n${text}`
      );

      if (!content) {
        return NextResponse.json(
          { error: "خطأ في تلخيص المستند. حاول مرة أخرى." },
          { status: 502 }
        );
      }

      return NextResponse.json({ content });
    }

    // === Chat (default) ===
    const { messages } = body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "لا توجد رسائل" }, { status: 400 });
    }

    const formattedMessages = [
      { role: "system", content: CHAT_SYSTEM_PROMPT },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    ];

        const aiSettings = await getAiSettings();
    const response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
        "X-Title": "El-Minassa Legal Platform",
      },
      body: JSON.stringify({
        model: aiSettings.model,
        messages: formattedMessages,
        max_tokens: aiSettings.maxTokens,
        temperature: aiSettings.temperature,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error("OpenRouter error:", errData);
      return NextResponse.json(
        { error: "خطأ في الاتصال بالمساعد الذكي. حاول مرة أخرى." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content =
      data.choices?.[0]?.message?.content ||
      "عذراً، لم أتمكن من توليد إجابة. يرجى المحاولة مرة أخرى.";

    return NextResponse.json({ content });
  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json(
      { error: "حدث خطأ غير متوقع. يرجى المحاولة لاحقاً." },
      { status: 500 }
    );
  }
}
