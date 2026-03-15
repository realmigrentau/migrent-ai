import {
  Button,
  Column,
  Row,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import EmailLayout, { BRAND_COLOR, FRONTEND_URL } from "./EmailLayout";

interface BookingConfirmedProps {
  recipientName: string;
  recipientRole: "owner" | "seeker";
  otherPartyName: string;
  listingTitle: string;
  checkIn: string;
  checkOut: string;
}

export default function BookingConfirmed({
  recipientName = "Alex",
  recipientRole = "seeker",
  otherPartyName = "Jordan",
  listingTitle = "Sunny Room in Bondi",
  checkIn = "2026-04-01",
  checkOut = "2026-05-01",
}: BookingConfirmedProps) {
  const isSeeker = recipientRole === "seeker";
  const dashboardUrl = `${FRONTEND_URL}/dashboard/${recipientRole}`;

  return (
    <EmailLayout preview={`Booking confirmed - ${listingTitle}`}>
      <Section style={successBanner}>
        <Text style={successText}>Booking Confirmed!</Text>
      </Section>

      <Text style={heading}>
        {isSeeker ? "Welcome to Your New Home!" : "Your Room is Booked!"}
      </Text>

      <Text style={paragraph}>
        Hi {recipientName},
      </Text>

      <Text style={paragraph}>
        Payment is complete! The booking for <strong>{listingTitle}</strong> is now confirmed.
      </Text>

      <Section style={detailsBox}>
        <Row>
          <Column>
            <Text style={label}>{isSeeker ? "Host" : "Guest"}</Text>
            <Text style={value}>{otherPartyName}</Text>
          </Column>
          <Column>
            <Text style={label}>Status</Text>
            <Text style={confirmedBadge}>Confirmed</Text>
          </Column>
        </Row>
        <Row>
          <Column>
            <Text style={label}>Check-in</Text>
            <Text style={value}>{checkIn}</Text>
          </Column>
          <Column>
            <Text style={label}>Check-out</Text>
            <Text style={value}>{checkOut}</Text>
          </Column>
        </Row>
      </Section>

      {isSeeker ? (
        <Section style={nextStepsBox}>
          <Text style={nextStepsTitle}>Next Steps:</Text>
          <Text style={stepText}>1. Message {otherPartyName} to coordinate move-in details</Text>
          <Text style={stepText}>2. Prepare your documents (ID, visa if applicable)</Text>
          <Text style={stepText}>3. Arrive on your check-in date</Text>
        </Section>
      ) : (
        <Section style={nextStepsBox}>
          <Text style={nextStepsTitle}>Next Steps:</Text>
          <Text style={stepText}>1. Message {otherPartyName} to share move-in instructions</Text>
          <Text style={stepText}>2. Prepare the room for your guest's arrival</Text>
          <Text style={stepText}>3. Be available on check-in day for handover</Text>
        </Section>
      )}

      <Section style={{ textAlign: "center", margin: "24px 0" }}>
        <Button style={button} href={dashboardUrl}>
          Go to Dashboard
        </Button>
      </Section>
    </EmailLayout>
  );
}

const successBanner = {
  backgroundColor: "#ecfdf5",
  borderRadius: "8px",
  padding: "16px",
  textAlign: "center" as const,
  margin: "0 0 20px",
};

const successText = {
  color: "#059669",
  fontSize: "18px",
  fontWeight: "700" as const,
  margin: "0",
};

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

const detailsBox = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "20px",
  margin: "16px 0",
  border: "1px solid #e5e7eb",
};

const label = {
  fontSize: "12px",
  color: "#6b7280",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 4px",
};

const value = {
  fontSize: "15px",
  fontWeight: "500" as const,
  color: "#1a1a1a",
  margin: "0 0 12px",
};

const confirmedBadge = {
  fontSize: "14px",
  fontWeight: "600" as const,
  color: "#059669",
  margin: "0 0 12px",
};

const nextStepsBox = {
  backgroundColor: "#fef3c7",
  borderRadius: "8px",
  padding: "16px 20px",
  margin: "16px 0",
  borderLeft: "3px solid #f59e0b",
};

const nextStepsTitle = {
  fontSize: "14px",
  fontWeight: "600" as const,
  color: "#92400e",
  margin: "0 0 8px",
};

const stepText = {
  fontSize: "13px",
  color: "#92400e",
  margin: "0 0 4px",
  lineHeight: "20px",
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
