import {
  Button,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import EmailLayout, { BRAND_COLOR } from "./EmailLayout";

interface PasswordResetProps {
  userName: string;
  resetUrl: string;
}

export default function PasswordReset({
  userName = "Alex",
  resetUrl = "#",
}: PasswordResetProps) {
  return (
    <EmailLayout preview="Reset your MigRent password">
      <Text style={heading}>Reset Your Password</Text>

      <Text style={paragraph}>
        Hi {userName},
      </Text>

      <Text style={paragraph}>
        We received a request to reset your password. Click the button below
        to choose a new password:
      </Text>

      <Section style={{ textAlign: "center", margin: "24px 0" }}>
        <Button style={button} href={resetUrl}>
          Reset Password
        </Button>
      </Section>

      <Text style={paragraph}>
        This link will expire in 1 hour. If you did not request a password reset,
        you can safely ignore this email - your account is secure.
      </Text>

      <Section style={warningBox}>
        <Text style={warningText}>
          If you did not request this, someone may be trying to access your account.
          Consider updating your password as a precaution.
        </Text>
      </Section>
    </EmailLayout>
  );
}

const heading = {
  fontSize: "24px",
  fontWeight: "bold" as const,
  color: "#1a1a1a",
  margin: "0 0 16px",
};

const paragraph = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "#374151",
  margin: "0 0 12px",
};

const button = {
  backgroundColor: BRAND_COLOR,
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600" as const,
  textDecoration: "none" as const,
  textAlign: "center" as const,
  padding: "14px 32px",
};

const warningBox = {
  backgroundColor: "#fef2f2",
  borderRadius: "8px",
  padding: "16px",
  margin: "16px 0 0",
  borderLeft: "3px solid #ef4444",
};

const warningText = {
  fontSize: "13px",
  color: "#991b1b",
  margin: "0",
  lineHeight: "20px",
};
