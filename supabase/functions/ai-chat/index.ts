import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });
  try {
    const { messages, conversationId, userId } = await req.json();
    if (!messages || !Array.isArray(messages) || messages.length === 0)
      return new Response(JSON.stringify({ error: "Messages array is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const groqKey = Deno.env.get("GROQ_API_KEY");
    if (!groqKey) throw new Error("Groq API key not configured");
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const chatMessages = [
      { role: "system", content: "You are MediScan AI, a knowledgeable medical assistant. Help users understand medical reports, lab results, and health questions. Be empathetic, clear, and professional. Always clarify responses are informational only and not a substitute for professional medical advice. Keep responses concise but thorough." },
      ...messages.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
    ];
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${groqKey}` },
      body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: chatMessages, max_tokens: 1000, temperature: 0.7 }),
    });
    if (!groqResponse.ok) throw new Error(`Groq API error: ${groqResponse.status}`);
    const data = await groqResponse.json();
    const assistantMessage = data.choices?.[0]?.message?.content || "I could not generate a response.";
    let finalConversationId = conversationId;
    const allMessages = [...messages, { role: "assistant", content: assistantMessage }];
    if (userId) {
      if (finalConversationId) {
        await supabase.from("conversations").update({ messages: allMessages, updated_at: new Date().toISOString() }).eq("id", finalConversationId);
      } else {
        const title = messages[0]?.content?.slice(0, 50) || "New Conversation";
        const { data: newConv } = await supabase.from("conversations").insert({ user_id: userId, title, messages: allMessages }).select("id").single();
        if (newConv) finalConversationId = newConv.id;
      }
    }
    return new Response(JSON.stringify({ message: assistantMessage, conversationId: finalConversationId }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("AI chat error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});