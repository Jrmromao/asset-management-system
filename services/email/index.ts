import { Resend } from "resend";
import { emailTemplates } from "./templates";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendEmailOptions {
  to: string;
  subject: string;
  templateName: keyof typeof emailTemplates;
  templateData: Record<string, any>;
}

export class EmailService {
  static async sendEmail({
    to,
    subject,
    templateName,
    templateData,
  }: SendEmailOptions) {
    try {
      const templateFn = emailTemplates[templateName];
      const html = templateFn(templateData);

      const { data, error } = await resend.emails.send({
        from: "Your App <noreply@yourdomain.com>",
        to,
        subject,
        html,
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Email service error:", error);
      return { success: false, error };
    }
  }
}
