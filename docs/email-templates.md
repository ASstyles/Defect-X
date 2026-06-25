# DefectX Custom Email Templates

To make your password reset emails look highly professional, eye-catching, and aligned with the futuristic cyberpunk aesthetic of the **DefectX** platform, you can customize the email template.

---

## Option 1: Standard Firebase Console Template (Plain Text)
If you are editing the template directly in the Firebase Console under **Authentication -> Templates -> Password reset**, Firebase only allows plain text. Here is a formal, high-fidelity security-focused template:

### **Subject:**
`[DefectX Security] Action Required: Reset Operator Credential Key`

### **Body:**
```text
Hello,

A secure request has been initiated to reset the password credentials associated with your DefectX Operator Account (%EMAIL%).

To verify your identity and configure a new access authorization key, please execute the terminal link below:

%LINK%

==================================================
SECURITY NOTE:
- This unique token link is single-use and will automatically expire in 60 minutes.
- If you did not initiate this credential reset, ignore this email or contact your systems administrator immediately.
==================================================

Regards,
DefectX System Administration
Security & Inspection Operations
```

---

## Option 2: Rich HTML Template (Premium Custom SMTP)
If you enable a custom SMTP server in Firebase Authentication, you can send rich HTML emails. Here is a custom responsive HTML template styled to match the dark navy glassmorphism layout of DefectX:

### **Subject:**
`[DefectX Security] Action Required: Reset Operator Credential Key`

### **HTML Code:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Password Credential</title>
  <style>
    body {
      background-color: #02040a;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #02040a;
      padding: 40px 0;
    }
    .container {
      max-width: 520px;
      margin: 0 auto;
      background: rgba(10, 15, 30, 0.65);
      border: 1px solid rgba(0, 220, 255, 0.35);
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 0 30px rgba(0, 200, 255, 0.1), 0 0 120px rgba(0, 120, 255, 0.05);
    }
    .logo-container {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo-text {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #ffffff;
      margin: 0;
    }
    .logo-x {
      color: #00BFFF;
      text-shadow: 0 0 10px rgba(0, 191, 255, 0.6);
    }
    .title {
      font-size: 22px;
      font-weight: 700;
      color: #ffffff;
      text-align: center;
      margin-top: 0;
      margin-bottom: 12px;
    }
    .subtitle {
      font-size: 11px;
      color: #00BFFF;
      text-transform: uppercase;
      letter-spacing: 2px;
      text-align: center;
      font-weight: 600;
      margin-bottom: 25px;
    }
    .content-text {
      font-size: 14px;
      color: rgba(255, 255, 255, 0.72);
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .cta-container {
      text-align: center;
      margin-bottom: 30px;
    }
    .btn {
      display: inline-block;
      padding: 12px 30px;
      font-size: 14px;
      font-weight: 600;
      color: #ffffff !important;
      text-decoration: none;
      background: linear-gradient(90deg, #00BFFF, #3B82F6, #7C3AED);
      border-radius: 8px;
      box-shadow: 0 0 20px rgba(0, 191, 255, 0.4);
      transition: box-shadow 0.3s ease;
    }
    .security-notice {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 20px;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.45);
      line-height: 1.5;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      font-size: 10px;
      color: rgba(255, 255, 255, 0.35);
      letter-spacing: 1px;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="logo-container">
        <h1 class="logo-text">Defect<span class="logo-x">X</span></h1>
      </div>
      <h2 class="title">Reset Password Key</h2>
      <div class="subtitle">Security Dispatch Unit</div>
      
      <p class="content-text">
        Hello,<br><br>
        A request has been initiated to reset the security credentials associated with your DefectX Operator Account. 
        Please click the button below to authorize this session and configure your new access key credentials.
      </p>

      <div class="cta-container">
        <a href="%LINK%" class="btn">Reset Access Credentials</a>
      </div>

      <div class="security-notice">
        <strong>Security Warning:</strong> This link is single-use and will automatically expire in 60 minutes. If you did not request this change, please ignore this email or alert security systems.
      </div>

      <div class="footer">
        Powered by YOLOv8 & Gemini AI
      </div>
    </div>
  </div>
</body>
</html>
```

---

## How to Apply in Firebase Console
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project **Defect X**.
3. Navigate to **Authentication** in the left sidebar, then click on the **Templates** tab.
4. Click on **Password reset** in the templates list.
5. Click on the **Edit (pencil)** icon.
6. Copy the **Subject** and **Body** text from Option 1 (Plain Text) and paste them into their respective fields.
7. Click **Save**.
