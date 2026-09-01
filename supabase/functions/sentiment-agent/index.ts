Deno.serve(async (req: Request) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { headlines, stockSymbol } = await req.json();

    if (!Array.isArray(headlines) || headlines.length === 0) {
      return new Response(
        JSON.stringify({ error: "No headlines provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Anthropic API key not configured" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const headlineText = headlines
      .map((h: { headline: string; sentiment: string }, i: number) => `${i + 1}. [${h.sentiment}] ${h.headline}`)
      .join("\n");

    const systemPrompt = `You are a financial sentiment analysis agent for Indian stock ${stockSymbol}. Analyze the following news headlines and return ONLY strict JSON with no markdown formatting, no explanation, no code fences. The JSON must have exactly this shape: {"label": "Bullish"|"Bearish"|"Neutral", "confidence": <0-100 integer>, "reasoning": "<one sentence, under 25 words>"}. Base your assessment on the overall sentiment balance of the headlines.`;

    const userMessage = `Analyze these news headlines for ${stockSymbol}:\n\n${headlineText}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 200,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", response.status, errText);
      return new Response(
        JSON.stringify({ error: `Claude API returned ${response.status}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await response.json();
    const rawText: string = data.content?.[0]?.text ?? "";

    let parsed: { label: string; confidence: number; reasoning: string };
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
    } catch {
      return new Response(
        JSON.stringify({ error: "Failed to parse Claude response as JSON" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const validLabels = ["Bullish", "Bearish", "Neutral"];
    if (!validLabels.includes(parsed.label)) {
      parsed.label = "Neutral";
    }
    parsed.confidence = Math.min(Math.max(Math.round(parsed.confidence) || 50, 0), 100);
    if (typeof parsed.reasoning !== "string") {
      parsed.reasoning = "Sentiment analysis completed.";
    }

    return new Response(
      JSON.stringify(parsed),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: "Sentiment Agent unavailable" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
