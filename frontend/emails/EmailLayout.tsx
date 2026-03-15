import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

const BRAND_COLOR = "#E11D48";
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || "https://migrent-ai.vercel.app";

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
}

export default function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Link href={FRONTEND_URL} style={{ textDecoration: "none" }}>
              <Text style={logo}>MigRent</Text>
            </Link>
          </Section>

          {/* Content */}
          <Section style={content}>
            {children}
          </Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              MigRent - Find your home in Australia
            </Text>
            <Text style={footerLinks}>
              <Link href={FRONTEND_URL} style={footerLink}>Website</Link>
              {" | "}
              <Link href={`${FRONTEND_URL}/support`} style={footerLink}>Support</Link>
              {" | "}
              <Link href={`${FRONTEND_URL}/settings`} style={footerLink}>Email Preferences</Link>
            </Text>
            <Text style={footerMuted}>
              You are receiving this email because you have an account on MigRent.
              You can update your email preferences in your account settings.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export { BRAND_COLOR, FRONTEND_URL };

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "0",
  maxWidth: "600px",
  borderRadius: "8px",
  overflow: "hidden" as const,
};

const header = {
  backgroundColor: BRAND_COLOR,
  padding: "24px 32px",
  textAlign: "center" as const,
};

const logo = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "bold" as const,
  margin: "0",
  letterSpacing: "-0.5px",
};

const content = {
  padding: "32px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "0",
};

const footer = {
  padding: "24px 32px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#8898aa",
  fontSize: "14px",
  margin: "0 0 8px",
};

const footerLinks = {
  color: "#8898aa",
  fontSize: "12px",
  margin: "0 0 8px",
};

const footerLink = {
  color: BRAND_COLOR,
  textDecoration: "none" as const,
};

const footerMuted = {
  color: "#b0b8c4",
  fontSize: "11px",
  lineHeight: "16px",
  margin: "8px 0 0",
};
