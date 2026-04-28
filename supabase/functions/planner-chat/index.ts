const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function buildInstructions() {
  return [
    "You are a friendly financial planning coach inside a budgeting app.",
    "Use the planner data provided by the application as the source of truth.",
    "Give advice only. Do not claim certainty when the data is incomplete.",
    "Use cautious language like 'it looks like', 'based on the current data', or 'I would consider'.",
    "Do not recommend connecting bank accounts because this product does not require that.",
    "Keep answers practical, concise, and user-friendly.",
    "Prefer short paragraphs or a short list of 2 to 4 action items when useful.",
    "Prioritize the biggest spending issues first instead of giving broad generic advice.",
    "If a category is over budget or spending is concentrated in one area, say that clearly.",
    "When relevant, mention tradeoffs and suggest a realistic next step for this month.",
    "Do not sound alarmist or overly formal.",
    "If the question asks for a recommendation, anchor it to categories, recurring costs, cash flow, or recent transactions from the provided context.",
  ].join(" ");
}

function selectRecentMessages(messages: Array<{ role: string; content: string }>) {
  return messages
    .filter((message) => message?.role && message?.content)
    .slice(-10)
    .map((message) => ({
      role: message.role,
      content: message.content,
    }));
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const openRouterApiKey = Deno.env.get("OPENROUTER_API_KEY");

    if (!openRouterApiKey) {
      return new Response(
        JSON.stringify({
          error: "Missing OPENROUTER_API_KEY secret for planner-chat.",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const openRouterModel = Deno.env.get("OPENROUTER_MODEL") || "openrouter/free";
    const { messages = [], plannerContext = {} } = await request.json();

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openRouterApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: openRouterModel,
        messages: [
          {
            role: "system",
            content: `${buildInstructions()}\n\nPlanner context:\n${JSON.stringify(plannerContext, null, 2)}`,
          },
          ...selectRecentMessages(messages),
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({
          error: errorText || "OpenAI request failed.",
        }),
        {
          status: response.status,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content;

    return new Response(
      JSON.stringify({
        reply: reply || "I could not generate a coaching response from the current planner data.",
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unexpected planner chat error.",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
