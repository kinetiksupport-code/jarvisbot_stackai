export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("Bot funcionando");
  }

  const message = req.body?.message;

  if (!message?.chat?.id || !message?.text) {
    return res.status(200).json({ ok: true });
  }

  const chatId = message.chat.id;
  const text = message.text;

  const token = process.env.TELEGRAM_BOT_TOKEN;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: `🤖 Recibí tu mensaje: ${text}`
    })
  });

  return res.status(200).json({ ok: true });
}
