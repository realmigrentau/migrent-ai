import {
  Button,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import EmailLayout, { BRAND_COLOR, FRONTEND_URL } from "./EmailLayout";

interface LegalReminderEmailProps {
  userName: string;
}

export default function LegalReminderEmail({
  userName = "there",
}: LegalReminderEmailProps) {
  return (
    <EmailLayout preview={`Review the MigRent terms and policies, ${userName}`}>
      <Text style={heading}>Review Our Terms</Text>

      <Text style={paragraph}>
        Hi {userName},
      </Text>

      <Text style={paragraph}>
        Thanks for signing up to MigRent! As part of Australian Consumer Law
        (ACCC) compliance, we want to make sure you have reviewed our legal
        documents. Here is a quick summary of what you agreed to:
      </Text>

      <Section style={tipBox}>
        <Text style={tipTitle}>Your agreements:</Text>
        <Text style={tipText}>- MigRent is a facilitator only, not a real estate agent</Text>
        <Text style={tipText}>- You agree to our Terms of Service and Privacy Policy</Text>
        <Text style={tipText}>- You will comply with local rental laws</Text>
        <Text style={tipText}>- You indemnify MigRent from claims on platform deals</Text>
      </Section>

      <Text style={paragraph}>
        You can review the full documents at any time using the links below:
      </Text>

      <Section style={{ textAlign: "center", margin: "24px 0" }}>
        <Button style={button} href={`${FRONTEND_URL}/terms-of-service`}>
          Terms of Service
        </Button>
      </Section>

      <Section style={{ textAlign: "center", margin: "12px 0" }}>
        <Button style={buttonOutline} href={`${FRONTEND_URL}/privacy-policy`}>
          Privacy Policy
        </Button>
      </Section>

      <Section style={{ textAlign: "center", margin: "12px 0" }}>
        <Button style={buttonOutline} href={`${FRONTEND_URL}/disclaimer`}>
          Platform Disclaimer
        </Button>
      </Section>

      <Text style={muted}>
        If you have questions about our terms, contact us at support@migrent.com.au
      </Text>
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

const tipBox = {
  backgroundColor: "#fef3c7",
  borderRadius: "8px",
  padding: "16px 20px",
  margin: "16px 0",
  borderLeft: "3px solid #f59e0b",
};

const tipTitle = {
  fontSize: "14px",
  fontWeight: "600" as const,
  color: "#92400e",
  margin: "0 0 8px",
};

const tipText = {
  fontSize: "13px",
  color: "#92400e",
  margin: "0 0 4px",
  lineHeight: "20px",
};

const button = {
  backgroundColor: BRAND_COLOR,
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600" as const,
  textDecoration: "none" as const,
  textAlign: "center" as const,
  padding: "12px 28px",
};

const buttonOutline = {
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  color: BRAND_COLOR,
  fontSize: "14px",
  fontWeight: "600" as const,
  textDecoration: "none" as const,
  textAlign: "center" as const,
  padding: "12px 28px",
  border: `1px solid ${BRAND_COLOR}`,
};

const muted = {
  fontSize: "13px",
  color: "#9ca3af",
  textAlign: "center" as const,
  margin: "16px 0 0",
};
