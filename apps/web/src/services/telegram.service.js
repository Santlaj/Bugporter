export const telegramService = {
  /**
   * Sends an alert message via Telegram Bot API.
   * @param {object} params
   * @param {string} params.botToken
   * @param {string} params.chatId
   * @param {string} params.text
   * @param {string} [params.topicId]
   * @param {string} [params.parseMode="HTML"]
   */
  async sendMessage({ botToken, chatId, text, topicId = null, parseMode = "HTML" }) {
    if (!botToken || !chatId) {
      throw new Error("Telegram bot token and chat ID are required.");
    }

    const payload = {
      chat_id: chatId,
      text,
      parse_mode: parseMode,
      disable_web_page_preview: false,
      ...(topicId ? { message_thread_id: Number(topicId) } : {}),
    };

    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Telegram API error: ${res.status} - ${err}`);
    }

    return res.json();
  },
};

export default telegramService;
