import * as React from "react";

interface EmailTemplateProps {
  otp: string;
}

export const EmailTemplate: React.FC<EmailTemplateProps> = ({ otp }) => (
  <div
    style={{
      fontFamily: "'Courier New', Courier, monospace",
      backgroundColor: "#0b0b0b", // Deep black background
      padding: "40px 24px",
      color: "#ffffff",
      border: "1px solid #00FF95", // Airwave green border
      borderRadius: "12px",
      maxWidth: "600px",
      margin: "0 auto",
      boxShadow:
        "0 0 16px rgba(0, 255, 149, 0.4), 0 0 32px rgba(0, 255, 149, 0.2)", // green glow
    }}
  >
    <h1
      style={{
        color: "#00FF95",
        textTransform: "uppercase",
        textAlign: "center",
        fontSize: "24px",
        marginBottom: "24px",
        letterSpacing: "2px",
      }}
    >
      Welcome to Airwave
    </h1>

    <p
      style={{
        fontSize: "16px",
        lineHeight: "1.6",
        textAlign: "center",
        color: "#e0e0e0",
      }}
    >
      You&apos;re almost set to go live. Use the OTP below to verify your email:
    </p>

    <div
      style={{
        backgroundColor: "rgba(0, 255, 149, 0.1)",
        padding: "16px 24px",
        borderRadius: "8px",
        fontSize: "32px",
        fontWeight: "bold",
        color: "#00FF95",
        letterSpacing: "8px",
        textAlign: "center",
        margin: "24px auto",
        width: "fit-content",
        border: "1px solid #00FF95",
      }}
    >
      {otp}
    </div>

    <p
      style={{
        fontSize: "14px",
        textAlign: "center",
        opacity: 0.8,
        color: "#cccccc",
      }}
    >
      This OTP is valid for 10 minutes. Please don&apos;t share it with anyone.
    </p>

    <p
      style={{
        fontSize: "14px",
        textAlign: "center",
        marginTop: "32px",
        opacity: 0.6,
        color: "#999999",
      }}
    >
      If you didn&apos;t request this, you can safely ignore this email.
    </p>

    <p
      style={{
        fontSize: "14px",
        marginTop: "32px",
        textAlign: "center",
        color: "#00FF95",
      }}
    >
      — Team Airwave
    </p>
  </div>
);
