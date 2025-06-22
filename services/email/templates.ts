type EmailTemplateData = Record<string, any>;

export const emailTemplates = {
  welcome: ({
    firstName,
    companyName,
  }: {
    firstName: string;
    companyName: string;
  }) => `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #f7f7f7; padding: 20px; text-align: center;">
        <h1 style="color: #22c55e; margin: 0;">Welcome to EcoKeepr!</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #333;">Hello, ${firstName}!</h2>
        <p>We are thrilled to welcome you and <strong>${companyName}</strong> to EcoKeepr. You're all set to start managing your assets and tracking your environmental impact.</p>
        <p>Your journey towards a more sustainable future starts now. You can access your dashboard right away to begin adding assets, exploring features, and more.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin" style="background-color: #22c55e; color: #fff; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Go to Your Dashboard</a>
        </div>
        <p>If you have any questions, feel free to reply to this email. We're here to help!</p>
        <p>Best regards,<br>The EcoKeepr Team</p>
      </div>
      <div style="background-color: #f7f7f7; padding: 15px; text-align: center; font-size: 12px; color: #777;">
        <p>You received this email because you signed up for EcoKeepr.</p>
        <p>&copy; ${new Date().getFullYear()} EcoKeepr. All rights reserved.</p>
      </div>
    </div>
  `,
};
