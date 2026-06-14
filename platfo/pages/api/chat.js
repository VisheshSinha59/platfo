export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { messages, restaurant } = req.body;
  if (!messages || !restaurant) {
    return res.status(400).json({ error: "messages and restaurant required." });
  }

  const menuText = (restaurant.menu || []).map(item =>
    `- ${item.name}: ₹${item.price}${item.desc ? " — " + item.desc : ""}${item.tag ? " [" + item.tag + "]" : ""}`
  ).join("\n");

  const sectionsText = (restaurant.sections || []).map(s => s.name).join(", ");

  const systemPrompt = `You are a friendly AI assistant for ${restaurant.name}, a restaurant.
Your job is to help customers with menu questions, recommendations, and food information.

RESTAURANT: ${restaurant.name}
SECTIONS: ${sectionsText || "General Menu"}

FULL MENU:
${menuText || "Menu not available yet."}

RULES:
- Only answer questions related to this restaurant and its menu
- Be friendly, helpful and concise
- If asked about items not on the menu, say they are not available
- Suggest items based on customer preferences
- Mention prices when relevant
- If asked about allergens or dietary restrictions, be helpful but recommend confirming with staff
- Keep responses short — max 3-4 sentences
- Never make up items not on the menu
- If customer wants to order, tell them to use the menu above
- Speak in a warm, welcoming tone
- If customer writes in Hindi or any other language, respond in that language`;

  // Build conversation for Gemini
  const conversation = messages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  // Add system prompt to first user message
  if (conversation.length > 0 && conversation[0].role === "user") {
    conversation[0].parts[0].text = systemPrompt + "\n\nCustomer: " + conversation[0].parts[0].text;
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: conversation,
          generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.7,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini error:", data);
      throw new Error(data.error?.message || "Gemini API error");
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text
      || "Sorry, I couldn't understand that. Please try again!";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Chat error:", err);
    return res.status(500).json({ error: err.message });
  }
}
