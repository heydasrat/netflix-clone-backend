export function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export function otpHTML(otp) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Verify Your Email</title>
</head>

<body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fb;padding:40px 0;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0"
style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 5px 20px rgba(0,0,0,0.08);">

<tr>
<td style="background:#2563eb;padding:30px;text-align:center;">
<h1 style="color:#ffffff;margin:0;font-size:28px;">
Advance Authentication
</h1>
</td>
</tr>

<tr>
<td style="padding:40px;">

<h2 style="margin-top:0;color:#222;">
Verify Your Email Address
</h2>

<p style="font-size:16px;color:#555;line-height:1.7;">
Welcome! Thank you for creating an account.
To complete your registration, please use the One-Time Password (OTP) below.
</p>

<div style="
background:#f3f6ff;
border:2px dashed #2563eb;
border-radius:10px;
padding:25px;
margin:35px 0;
text-align:center;
">

<p style="margin:0;color:#666;font-size:14px;">
Your Verification Code
</p>

<h1 style="
margin:15px 0 0;
font-size:42px;
letter-spacing:10px;
color:#2563eb;
font-weight:bold;
">
${otp}
</h1>

</div>

<p style="font-size:15px;color:#666;">
This OTP will expire in
<strong>5 minutes</strong>.
</p>

<p style="font-size:15px;color:#666;">
If you didn't request this verification, you can safely ignore this email.
</p>

<hr style="border:none;border-top:1px solid #eeeeee;margin:35px 0;">

<p style="font-size:13px;color:#999;text-align:center;">
For security reasons, never share this OTP with anyone.
Our team will never ask for your verification code.
</p>

</td>
</tr>

<tr>
<td style="
background:#fafafa;
padding:20px;
text-align:center;
font-size:13px;
color:#999;
">

© ${new Date().getFullYear()} Advance Authentication.<br>
All Rights Reserved.

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`;
}
