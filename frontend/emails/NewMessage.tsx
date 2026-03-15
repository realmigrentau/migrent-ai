import {
  Button,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import EmailLayout, { BRAND_COLOR, FRONTEND_URL } from "./EmailLayout";

interface NewMessageProps {
  recipientName: string;
  senderName: string;
  messagePreview: string;
  listingTitle?: string;
  threadUrl: string;
}

export default function NewMessage({
  recipientName = "Alex",
  senderName = "Jordan",
  messagePreview = "Hey, I had a question about the room...",
  listingTitle,
  threadUrl = "#",
}: NewMessageProps) {
  return (
    <EmailLayout preview={`New message from ${senderName}`}>
      <Text style={heading}>New Message</Text>

      <Text style={paragraph}>
        Hi {recipientName},
      </Text>

      <Text style={paragraph}>
        <strong>{senderName}</strong> sent you a message
        {listingTitle ? ` about ${listingTitle}` : ""}:
      </Text>

      <Section style={messageBox}>
        <Text style={messageText}>
          "{messagePreview.length > 200 ? messagePreview.slice(0, 200) + "..." : messagePreview}"
        </Text>
      </Section>

      <Section style={{ textAlign: "center", margin: "24px 0" }}>
        <Button style={button} href={threadUrl}>
          Reply Now
        </Button>
      </Section>

      <Text style={muted}>
        You can manage your message notifications in your account settings.
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

const messageBox = {
  backgroundColor: "#f3f4f6",
  borderRadius: "8px",
  padding: "20px",
  margin: "16px 0",
  borderLeft: `3px solid ${BRAND_COLOR}`,
};

const messageText = {
  fontSize: "15px",
  fontStyle: "italic" as const,
  color: "#374151",
  lineHeight: "24px",
  margin: "0",
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

const muted = {
  fontSize: "13px",
  color: "#9ca3af",
  textAlign: "center" as const,
  margin: "8px 0 0",
};
