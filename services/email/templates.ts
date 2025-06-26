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
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="background-color: #22c55e; color: #fff; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Go to Your Dashboard</a>
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
  
  contactConfirmation: ({ firstName, inquiryType }: { firstName: string; inquiryType: string }) => `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #f7f7f7; padding: 20px; text-align: center;">
        <h1 style="color: #22c55e; margin: 0;">EcoKeepr</h1>
        <p style="margin: 5px 0 0; color: #666;">Thank you for contacting us!</p>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #333;">Hi ${firstName},</h2>
        <p>We've received your message regarding <strong>${inquiryType}</strong> and will get back to you within 24 hours.</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
          <p style="margin: 0; font-size: 14px; color: #666;">
            <strong>What happens next?</strong><br/>
            Our team will review your inquiry and respond via email with next steps or additional information.
          </p>
        </div>
        <p>In the meantime, feel free to explore our website or check out our documentation.</p>
        <p>Best regards,<br>The EcoKeepr Team</p>
      </div>
      <div style="background-color: #f7f7f7; padding: 15px; text-align: center; font-size: 12px; color: #777;">
        <p>EcoKeepr - Sustainable Asset Management<br/>123 Innovation Square, Suite 4, Dublin 2, Ireland</p>
        <p>&copy; ${new Date().getFullYear()} EcoKeepr. All rights reserved.</p>
      </div>
    </div>
  `,
  
  contactNotification: (data: EmailTemplateData) => `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #22c55e; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">New Contact Form Submission</h1>
        <p style="margin: 5px 0 0; color: rgba(255,255,255,0.9);">EcoKeepr Contact Form</p>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #333; margin-top: 0;">Contact Details</h2>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #495057; width: 30%;">Name:</td>
              <td style="padding: 8px 0; color: #666;">${data.firstName} ${data.lastName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #495057;">Email:</td>
              <td style="padding: 8px 0;"><a href="mailto:${data.email}" style="color: #22c55e;">${data.email}</a></td>
            </tr>
            ${data.company ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #495057;">Company:</td>
              <td style="padding: 8px 0; color: #666;">${data.company}</td>
            </tr>
            ` : ''}
            ${data.jobTitle ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #495057;">Job Title:</td>
              <td style="padding: 8px 0; color: #666;">${data.jobTitle}</td>
            </tr>
            ` : ''}
            ${data.phoneNumber ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #495057;">Phone:</td>
              <td style="padding: 8px 0; color: #666;">${data.phoneNumber}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #495057;">Inquiry Type:</td>
              <td style="padding: 8px 0;">
                <span style="background: #22c55e; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px;">
                  ${data.inquiryType}
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #495057;">Submitted:</td>
              <td style="padding: 8px 0; color: #666;">${new Date(data.submittedAt).toLocaleString()}</td>
            </tr>
          </table>
        </div>
        
        <h3 style="color: #333; margin-bottom: 10px;">Message:</h3>
        <div style="background: #fff; border: 1px solid #e9ecef; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0;">
            ${data.message.replace(/\n/g, '<br/>')}
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="mailto:${data.email}?subject=Re: ${data.inquiryType} Inquiry" 
             style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Reply to ${data.firstName}
          </a>
        </div>
      </div>
      <div style="background-color: #f7f7f7; padding: 15px; text-align: center; font-size: 12px; color: #777;">
        <p>Submission ID: ${data.submissionId}<br/>This email was generated automatically from the EcoKeepr contact form.</p>
        <p>&copy; ${new Date().getFullYear()} EcoKeepr. All rights reserved.</p>
      </div>
    </div>
  `,
  
  invitation: ({
    firstName,
    lastName,
    companyName,
    roleName,
    invitationUrl,
    inviterName,
  }: {
    firstName?: string;
    lastName?: string;
    companyName: string;
    roleName: string;
    invitationUrl: string;
    inviterName: string;
  }) => `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #f7f7f7; padding: 20px; text-align: center;">
        <h1 style="color: #22c55e; margin: 0;">You're Invited!</h1>
        <p style="margin: 5px 0 0; color: #666;">Join ${companyName} on EcoKeepr</p>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #333;">Hello${firstName ? ` ${firstName}` : ''}!</h2>
        <p><strong>${inviterName}</strong> has invited you to join <strong>${companyName}</strong> as a <strong>${roleName}</strong> on EcoKeepr.</p>
        <p>EcoKeepr is a sustainable asset management platform that helps organizations track and manage their environmental impact.</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
          <p style="margin: 0; font-size: 14px; color: #666;">
            <strong>What's next?</strong><br/>
            Click the button below to accept your invitation and set up your account. The invitation will expire in 7 days.
          </p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${invitationUrl}" style="background-color: #22c55e; color: #fff; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Accept Invitation</a>
        </div>
        <p style="font-size: 12px; color: #666;">
          If the button doesn't work, copy and paste this link into your browser:<br/>
          <a href="${invitationUrl}" style="color: #22c55e; word-break: break-all;">${invitationUrl}</a>
        </p>
        <p>If you have any questions, feel free to contact ${inviterName} or our support team.</p>
        <p>Best regards,<br>The EcoKeepr Team</p>
      </div>
      <div style="background-color: #f7f7f7; padding: 15px; text-align: center; font-size: 12px; color: #777;">
        <p>You received this email because you were invited to join ${companyName}.</p>
        <p>&copy; ${new Date().getFullYear()} EcoKeepr. All rights reserved.</p>
      </div>
    </div>
  `,
  
  licenseAssignment: ({ userName, licenseName, links }: { userName: string; licenseName: string; links: { name: string; url: string }[] }) => `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #f7f7f7; padding: 20px; text-align: center;">
        <h1 style="color: #22c55e; margin: 0;">You've been assigned a license!</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #333;">Hello, ${userName}!</h2>
        <p>You have been assigned the license <strong>${licenseName}</strong>. You can download the license files below:</p>
        <ul>
          ${links.map(link => `<li><a href="${link.url}">${link.name}</a></li>`).join("")}
        </ul>
        <p>If you have any questions, please contact your administrator.</p>
        <p>Best regards,<br>The EcoKeepr Team</p>
      </div>
      <div style="background-color: #f7f7f7; padding: 15px; text-align: center; font-size: 12px; color: #777;">
        <p>&copy; ${new Date().getFullYear()} EcoKeepr. All rights reserved.</p>
      </div>
    </div>
  `,
};
