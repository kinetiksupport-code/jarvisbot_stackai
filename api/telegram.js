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
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;

    if (!apiKey || !telegramToken) {
      throw new Error("Faltan variables de entorno");
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [
            {
              role: "system",
              content: `Eres JARVIS, un asistente personal de inteligencia artificial.

Tu personalidad es propia: inteligente, educado, natural,
con un toque de humor sutil y actitud tecnológica.

Hablas en español salvo que el usuario pida otro idioma.

Sé útil, claro y directo.
No inventes acciones que no hayas realizado.
Si no puedes hacer algo todavía, dilo claramente.

Tu objetivo es convertirte progresivamente en un asistente
personal capaz de usar herramientas, memoria y automatizaciones.`
            },
            {
              role: "user",
              content: userText
            }
          ],
          max_tokens: 500
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter:", data);
      throw new Error("Error de OpenRouter");
    }

    const answer =
      data?.choices?.[0]?.message?.content ||
      "No he podido generar una respuesta.";

    await fetch(
      `https://api.telegram.org/bot${telegramToken}/sendMessage`,
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
    console.error("JARVIS:", error);

    return res.status(500).json({
      ok: false,
      error: "Error procesando el mensaje"
    });
  }
}
