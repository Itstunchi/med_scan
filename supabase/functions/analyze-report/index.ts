import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  }

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { reportId, imageBase64, serviceCategory } = await req.json()

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    const prompt = `You are a medical report analysis assistant. Analyze this ${serviceCategory || "medical"} report image and return ONLY valid JSON (no markdown, no code fences) matching exactly this shape:
{
  "summary": "2-3 sentence plain-language summary",
  "health_insights": "1-2 sentences of general health insight",
  "recommended_specialty": "e.g. General Practitioner, Cardiologist, etc.",
  "findings": ["short finding 1", "short finding 2"],
  "results": [{"label": "Test name", "value": "result value", "range": "normal range"}],
  "medical_terms": [{"term": "Medical term", "definition": "plain-language definition"}],
  "questions_for_doctor": ["Question 1", "Question 2"]
}
This is for educational purposes only, not a diagnosis.`

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("GROQ_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "llama-3.2-90b-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageBase64 } },
            ],
          },
        ],
        temperature: 0.3,
      }),
    })

    const groqData = await groqRes.json()
    let raw = groqData.choices?.[0]?.message?.content || "{}"
    raw = raw.replace(/```json\n?|```/g, "").trim()
    const analysis = JSON.parse(raw)

    await supabase.from("report_analyses").insert({
      report_id: reportId,
      summary: analysis.summary,
      health_insights: analysis.health_insights,
      recommended_specialty: analysis.recommended_specialty,
      findings: analysis.findings || [],
      results: analysis.results || [],
      medical_terms: analysis.medical_terms || [],
      questions_for_doctor: analysis.questions_for_doctor || [],
    })

    await supabase.from("medical_reports").update({ status: "completed" }).eq("id", reportId)

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})