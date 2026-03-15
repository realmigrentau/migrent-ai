import {
  Button,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import EmailLayout, { BRAND_COLOR, FRONTEND_URL } from "./EmailLayout";

interface BookingDeclinedProps {
  seekerName: string;
  listingTitle: string;
}

export default function BookingDeclined({
  seekerName = "Alex",
  listingTitle = "Sunny Room in Bondi",
}: BookingDeclinedProps) {
  return (
    <EmailLayout preview={`Update on your booking request for ${listingTitle}`}>
      <Text style={heading}>Booking Update</Text>

      <Text style={paragraph}>
        Hi {seekerName},
      </Text>

      <Text style={paragraph}>
        Unfortunately, the owner has declined your booking request
        for <strong>{listingTitle}</strong>.
      </Text>

      <Text style={paragraph}>
        This can happen for many reasons - the dates might not work, or the room may
        already be spoken for. Don't worry, there are plenty of other great listings
        on MigRent!
      </Text>

      <Section style={{ textAlign: "center", margin: "24px 0" }}>
        <Button style={button} href={`${FRONTEND_URL}/seeker/search`}>
          Browse More Listings
        </Button>
      </Section>

      <Section style={tipBox}>
        <Text style={tipTitle}>Tips for getting accepted:</Text>
        <Text style={tipText}>- Write a friendly introduction about yourself</Text>
        <Text style={tipText}>- Mention your occupation or study plans</Text>
        <Text style={tipText}>- Be clear about your move-in timeline</Text>
        <Text style={tipText}>- Complete your profile verification</Text>
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

const tipBox = {
  backgroundColor: "#eff6ff",
  borderRadius: "8px",
  padding: "16px 20px",
  margin: "16px 0 0",
  borderLeft: `3px solid #3b82f6`,
};

const tipTitle = {
  fontSize: "14px",
  fontWeight: "600" as const,
  color: "#1e40af",
  margin: "0 0 8px",
};

const tipText = {
  fontSize: "13px",
  color: "#1e40af",
  margin: "0 0 4px",
  lineHeight: "20px",
};
