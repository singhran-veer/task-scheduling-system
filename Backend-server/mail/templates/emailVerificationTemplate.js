const emailVerificationTemplate = (otp) => `
<!doctype html>
<html>
    <body style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
        <div style="max-width: 560px; margin: 0 auto; padding: 24px;">
            <h2 style="margin-bottom: 12px;">Verify your email</h2>
            <p>Use this OTP to finish creating your Task Scheduling account:</p>
            <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 24px 0;">${otp}</p>
            <p>This OTP is valid for 5 minutes. If you did not request this, you can ignore this email.</p>
        </div>
    </body>
</html>
`;

module.exports = emailVerificationTemplate;
