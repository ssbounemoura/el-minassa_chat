import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export async function POST(req: NextRequest) {
  if (!OPENROUTER_API_KEY) {
    return NextResponse.json({ error: "مفتاح API غير مُهيّأ." }, { status: 500 });
  }

  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string" || query.trim().length < 3) {
      return NextResponse.json({ error: "يرجى إدخال سؤال بحث صالح." }, { status: 400 });
    }

    // 1. Search DB using keyword matching
    const [allTexts, dossierCandidates, documentCandidates] = await Promise.all([
      prisma.legalText.findMany(),
      prisma.dossier.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
            { caseType: { contains: query } },
            { caseNumber: { contains: query } },
            { courtName: { contains: query } },
            { parties: { contains: query } },
            { notes: { contains: query } },
          ],
        },
      }),
      prisma.document.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { category: { contains: query } },
            { fileUrl: { contains: query } },
          ],
        },
      }),
    ]);

    // Simple keyword-based scoring
    const queryWords = query
      .replace(/[؟?!.,،؛]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2);

    const scored = allTexts.map((text) => {
      let score = 0;
      const searchable = `${text.title} ${text.content} ${text.keywords} ${text.category}`;

      for (const word of queryWords) {
        if (searchable.includes(word)) score += 3;
        if (text.keywords.includes(word)) score += 2;
        if (text.title.includes(word)) score += 2;
      }

      // Also check keyword overlap
      const textKeywords = text.keywords.split(",");
      for (const kw of textKeywords) {
        if (query.includes(kw.trim())) score += 4;
      }

      return { ...text, score };
    });

    const scoredDossiers = dossierCandidates.map((dossier) => {
      let score = 0;
      const searchable = `${dossier.title} ${dossier.description || ""} ${dossier.caseType} ${dossier.caseNumber || ""} ${dossier.courtName || ""} ${dossier.parties || ""} ${dossier.notes || ""}`;
      for (const word of queryWords) {
        if (searchable.includes(word)) score += 3;
        if (dossier.title.includes(word)) score += 2;
        if ((dossier.description || "").includes(word)) score += 2;
      }
      return { ...dossier, score };
    });

    const scoredDocuments = documentCandidates.map((document) => {
      let score = 0;
      const searchable = `${document.title} ${document.category || ""} ${document.fileUrl}`;
      for (const word of queryWords) {
        if (searchable.includes(word)) score += 3;
        if (document.title.includes(word)) score += 2;
        if ((document.category || "").includes(word)) score += 2;
      }
      return { ...document, score };
    });

    const topResults = scored
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);

    const topDossierResults = scoredDossiers
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    const topDocumentResults = scoredDocuments
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    if (topResults.length === 0) {
      return NextResponse.json({
        results: [],
        dossierResults: topDossierResults,
        documentResults: topDocumentResults,
        aiAnalysis: "لم أجد نصوصاً قانونية مطابقة لسؤالك في قاعدة البيانات الحالية. جرب صياغة سؤالك بكلمات مختلفة أو بمصطلحات قانونية أكثر دقة.",
      });
    }

    // 2. Send to AI for semantic ranking and analysis
    const resultsText = topResults
      .map(
        (r, i) =>
          `${i + 1}. [${r.articleNumber}] ${r.title}\n   القانون: ${r.lawReference} | الفئة: ${r.category}\n   النص: ${r.content}\n   درجة التطابق: ${r.score}`
      )
      .join("\n\n");

    const aiResponse = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
        "X-Title": "El-Minassa Legal Platform",
      },
      body: JSON.stringify({
        model: "google/gemma-4-31b-it:free",
        messages: [
          {
            role: "system",
            content: `أنت محلل قانوني متخصص في القانون الجزائري. ستحصل على سؤال المستخدم ومجموعة من النصوص القانونية.

مهمتك:
1. رتّب النصوص حسب درجة صلتها بالسؤال (من الأكثر صلة للأقل)
2. اشرح باختصار لماذا كل نص ذو صلة بالسؤال
3. قدم تحليلاً قانونياً مختصراً يربط بين النصوص والسؤال

القواعد:
- أجب باللغة العربية
- استخدم التنسيق Markdown
- اذكر أرقام المواد والقوانين
- إذا لم يكن أي نص ذا صلة، قل ذلك بصراحة
- أنهِ بنصيحة قانونية عملية`,
          },
          {
            role: "user",
            content: `السؤال: ${query}\n\nالنصوص القانونية المتاحة:\n${resultsText}\n\nحلّل هذه النصوص ورتّبها حسب صلة كل منها بالسؤال.`,
          },
        ],
        max_tokens: 2048,
        temperature: 0.3,
      }),
    });

    let aiAnalysis = "";
    if (aiResponse.ok) {
      const data = await aiResponse.json();
      aiAnalysis = data.choices?.[0]?.message?.content || "";
    }

    // 3. Return results
    return NextResponse.json({
      results: topResults.map((r) => ({
        id: r.id,
        category: r.category,
        lawReference: r.lawReference,
        articleNumber: r.articleNumber,
        title: r.title,
        content: r.content,
        score: r.score,
      })),
      dossierResults: topDossierResults.map((d) => ({
        id: d.id,
        title: d.title,
        description: d.description,
        caseType: d.caseType,
        status: d.status,
        caseNumber: d.caseNumber,
        courtName: d.courtName,
        score: d.score,
      })),
      documentResults: topDocumentResults.map((doc) => ({
        id: doc.id,
        title: doc.title,
        category: doc.category,
        fileUrl: doc.fileUrl,
        score: doc.score,
      })),
      aiAnalysis,
    });
  } catch (error) {
    console.error("Legal search error:", error);
    return NextResponse.json({ error: "حدث خطأ في البحث. حاول مرة أخرى." }, { status: 500 });
  }
}
