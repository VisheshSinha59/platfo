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
- Keep responses short and friendly — max 3-4 sentences
- Never make up items that are not on the menu
- If customer wants to order, tell them to use the menu above to add items to cart
- Speak in a warm, welcoming tone
- If customer writes in Hindi or any other language, respond in that language`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        system: systemPrompt,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "AI error");

    const reply = data.content[0]?.text || "Sorry, I couldn't understand that.";
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Chat error:", err);
    return res.status(500).json({ error: err.message });
  }
}
