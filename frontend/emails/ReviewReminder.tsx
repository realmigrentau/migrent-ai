import {
  Button,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import EmailLayout, { BRAND_COLOR, FRONTEND_URL } from "./EmailLayout";

interface ReviewReminderProps {
  recipientName: string;
  otherPartyName: string;
  listingTitle: string;
  reviewUrl: string;
}

export default function ReviewReminder({
  recipientName = "Alex",
  otherPartyName = "Jordan",
  listingTitle = "Sunny Room in Bondi",
  reviewUrl = "#",
}: ReviewReminderProps) {
  return (
    <EmailLayout preview={`How was your stay at ${listingTitle}?`}>
      <Text style={heading}>How Was Your Stay?</Text>

      <Text style={paragraph}>
        Hi {recipientName},
      </Text>

      <Text style={paragraph}>
        Your stay at <strong>{listingTitle}</strong> has ended.
        We'd love to hear about your experience!
      </Text>

      <Text style={paragraph}>
        Your review helps {otherPartyName} and future users on MigRent make
        better decisions. It only takes a minute.
      </Text>

      <Section style={starsBox}>
        <Text style={starsText}>Leave a Review</Text>
      </Section>

      <Section style={{ textAlign: "center", margin: "24px 0" }}>
        <Button style={button} href={reviewUrl}>
          Write Your Review
        </Button>
      </Section>

      <Text style={muted}>
        Reviews are published after both parties have submitted theirs,
        keeping feedback honest and fair.
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

const starsBox = {
  backgroundColor: "#fef3c7",
  borderRadius: "8px",
  padding: "20px",
  textAlign: "center" as const,
  margin: "16px 0",
};

const starsText = {
  fontSize: "20px",
  margin: "0",
  color: "#92400e",
  fontWeight: "600" as const,
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
