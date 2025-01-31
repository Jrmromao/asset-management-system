type EmailTemplateData = Record<string, any>;

export const emailTemplates = {
  welcome: (data: EmailTemplateData) => `
    <h1>Welcome ${data.name}!</h1>
    <p>We're excited to have you on board.</p>
    ${
      data.verificationLink
        ? `
      <p>Please verify your email by clicking the link below:</p>
      <a href="${data.verificationLink}">Verify Email</a>
    `
        : ""
    }
  `,
};
