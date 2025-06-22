import { Resend } from "resend";
import { emailTemplates } from "./templates";

const resend = new Resend("re_3X6yYWsR_BjuhW5XcVBi3PhnkiThLdvnG");

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
      const html = templateFn(templateData as any);

      const { data, error } = await resend.emails.send({
        from: "onboarding@resend.dev",
        to: "jrmromao@gmail.com",
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
