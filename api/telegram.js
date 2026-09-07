export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("JARVIS online 🤖");
  }

  try {
    const message = req.body?.message;

    if (!message?.chat?.id || !message?.text) {
      return res.status(200).json({ ok: true });
    }

    const chatId = message.chat.id;
    const userText = message.text;

    const apiKey = process.env.JARVIS_AI_OPENROUTER;

    if (!apiKey) {
      throw new Error("Falta JARVIS_AI_OPENROUTER en Vercel");
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "z-ai/glm-5.2:free",
        messages: [
          {
            role: "system",
            content: `Eres JARVIS, un asistente de IA personal.

Tu personalidad es propia: inteligente, natural, educado,
con un toque de humor y actitud tecnológica.

Hablas en español salvo que el usuario te pida otro idioma.
Sé útil y directo. No finjas haber realizado acciones que
realmente no puedes realizar.

Actualmente estás conectado a Telegram.`
          },
          {
            role: "user",
            content: userText
          }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter:", data);
      throw new Error("Error de OpenRouter");
    }

    const answer =
      data.choices?.[0]?.message?.content ||
      "No he podido generar una respuesta.";

    await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: answer
        })
      }
    );

    return res.status(200).json({ ok: true });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      ok: false,
      error: "Error procesando el mensaje"
    });
  }
}
