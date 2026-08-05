import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

function extractJson(raw: string): Record<string, unknown> | null {
  let text = String(raw || "").trim()
  text = text.replace(/```json\s*/gi, "").replace(/```/g, "").trim()
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim()
  text = text.replace(/<thinking>[\s\S]*?<\/thinking>/gi, "").trim()

  try {
    return JSON.parse(text)
  } catch {
    const start = text.indexOf("{")
    const end = text.lastIndexOf("}")
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1))
      } catch {
        return null
      }
    }
  }
  return null
}

async function callGroq(groqKey: string, body: Record<string, unknown>): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${groqKey}`,
    },
    body: JSON.stringify(body),
  })

  const data = await res.json()

  if (!res.ok) {
    console.error("GROQ_FAIL:", JSON.stringify(data))
    const msg = data?.error?.message || "Groq API request failed"
    throw new Error(msg)
  }

  return data.choices?.[0]?.message?.content || ""
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { reportId, imageBase64, serviceCategory, fileName } = await req.json()

    if (!reportId || !imageBase64) {
      return new Response(JSON.stringify({ error: "Missing reportId or imageBase64" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    const groqKey = Deno.env.get("GROQ_API_KEY")
    if (!groqKey) throw new Error("GROQ_API_KEY is not set")

    let imageUrl = String(imageBase64)
    if (!imageUrl.startsWith("data:")) {
      imageUrl = `data:image/png;base64,${imageUrl}`
    }

    // -------- STEP 1: Read the image as PLAIN TEXT only --------
    // No response_format. No json_object. This avoids your error.
    const visionText = await callGroq(groqKey, {
      model: "qwen/qwen3.6-27b",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Read this medical document image.

Filename: ${fileName || "unknown"}

Describe in plain English:
- What kind of document it is
- Important patient/test details if visible
- Key results, values, and any high/low flags
- A clear summary a patient can understand
- Any concerning findings
- Simple next-step advice

Only use what you can see. Do not invent values.
Write normal paragraphs. Do NOT output JSON.`,
            },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      temperature: 0.2,
      max_tokens: 2000,
      reasoning_effort: "none",
    })

    console.log("VISION_OK length=", visionText.length)
    console.log("VISION_PREVIEW=", visionText.slice(0, 300))

    if (!visionText.trim()) {
      throw new Error("Vision model returned empty text")
    }

    // -------- STEP 2: Turn text into JSON (still NO response_format) --------
    let analysis: Record<string, unknown> | null = null

    try {
      const structRaw = await callGroq(groqKey, {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "user",
            content: `From this medical analysis text, output ONLY a JSON object (no markdown):

{
  "service_category": "Laboratory",
  "document_type": "short label",
  "health_score": 70,
  "summary": "patient friendly summary",
  "health_insights": "short insights",
  "recommended_specialty": "General Practitioner",
  "findings": ["finding"],
  "results": [{"label": "name", "value": "value", "range": "", "status": "normal"}],
  "medical_terms": [{"term": "term", "definition": "simple meaning"}],
  "questions_for_doctor": ["question"],
  "body_systems": []
}

Use only facts from the text. health_score 0-100 integer.

TEXT:
${visionText}`,
          },
        ],
        temperature: 0,
        max_tokens: 1500,
        // NO response_format at all
      })

      analysis = extractJson(structRaw)
      console.log("STRUCT_OK", analysis ? "parsed" : "null")
    } catch (e) {
      console.error("STRUCT_STEP_FAILED", (e as Error).message)
      analysis = null
    }

    // -------- Fallback if JSON parsing fails: still save useful summary --------
    const summary =
      (analysis?.summary as string) ||
      visionText.slice(0, 1200)

    const detectedCategory =
      (analysis?.service_category as string) ||
      (serviceCategory && serviceCategory !== "Auto Detect"
        ? serviceCategory
        : "General Health")

    const healthScore = Math.max(
      0,
      Math.min(100, Number(analysis?.health_score) || 55)
    )

    const { error: analysisError } = await supabase.from("report_analyses").insert({
      report_id: reportId,
      summary,
      health_insights:
        (analysis?.health_insights as string) ||
        "See the summary above based on the uploaded document.",
      recommended_specialty:
        (analysis?.recommended_specialty as string) || "General Practitioner",
      findings: (analysis?.findings as unknown[]) || [summary.slice(0, 200)],
      results: (analysis?.results as unknown[]) || [],
      medical_terms: (analysis?.medical_terms as unknown[]) || [],
      questions_for_doctor:
        (analysis?.questions_for_doctor as unknown[]) ||
        ["What do these results mean for me?", "Do I need any follow-up tests?"],
    })

    if (analysisError) throw new Error(analysisError.message)

    const { error: updateError } = await supabase
      .from("medical_reports")
      .update({
        status: "completed",
        service_category: detectedCategory,
        report_type: String(detectedCategory).toLowerCase().replace(/\s+/g, "_"),
        health_score: healthScore,
      })
      .eq("id", reportId)

    if (updateError) throw new Error(updateError.message)

    return new Response(
      JSON.stringify({
        success: true,
        service_category: detectedCategory,
        health_score: healthScore,
        summary,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    console.error("HANDLER_ERROR", err)
    return new Response(
      JSON.stringify({ error: (err as Error).message || "Analysis failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})