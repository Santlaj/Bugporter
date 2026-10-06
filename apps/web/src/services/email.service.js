export const emailService = {
  /**
   * Sends an outbound notification email via Resend API or SMTP webhook.
   * @param {object} params
   * @param {string} params.to
   * @param {string} params.subject
   * @param {string} params.html
   */
  async sendEmail({ to, subject, html }) {
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromAddress = process.env.EMAIL_FROM || "alerts@bugreporter.dev";

    if (!resendApiKey) {
      if (process.env.NODE_ENV === "development") {
        console.info(`[EmailService (Dev)] Email to ${to}: "${subject}"`);
      }
      return { id: "mock_email_dev_id" };
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Resend email error: ${res.status} - ${err}`);
    }

    return res.json();
  },
};

export default emailService;
