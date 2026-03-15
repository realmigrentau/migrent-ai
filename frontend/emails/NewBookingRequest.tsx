import {
  Button,
  Column,
  Row,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import EmailLayout, { BRAND_COLOR, FRONTEND_URL } from "./EmailLayout";

interface NewBookingRequestProps {
  ownerName: string;
  seekerName: string;
  listingTitle: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: string;
  seekerMessage?: string;
}

export default function NewBookingRequest({
  ownerName = "Owner",
  seekerName = "Alex",
  listingTitle = "Sunny Room in Bondi",
  checkIn = "2026-04-01",
  checkOut = "2026-05-01",
  guests = 1,
  totalPrice = "$1,200.00",
  seekerMessage,
}: NewBookingRequestProps) {
  return (
    <EmailLayout preview={`New booking request from ${seekerName} for ${listingTitle}`}>
      <Text style={heading}>New Booking Request</Text>

      <Text style={paragraph}>
        Hi {ownerName},
      </Text>

      <Text style={paragraph}>
        <strong>{seekerName}</strong> wants to book your listing:
      </Text>

      <Section style={detailsBox}>
        <Text style={listingName}>{listingTitle}</Text>
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
        <Row>
          <Column>
            <Text style={label}>Guests</Text>
            <Text style={value}>{guests}</Text>
          </Column>
          <Column>
            <Text style={label}>Estimated Rent</Text>
            <Text style={value}>AUD {totalPrice}</Text>
          </Column>
        </Row>
      </Section>

      {seekerMessage && (
        <Section style={messageBox}>
          <Text style={label}>Message from {seekerName}:</Text>
          <Text style={messageText}>"{seekerMessage}"</Text>
        </Section>
      )}

      <Section style={{ textAlign: "center", margin: "24px 0" }}>
        <Button style={button} href={`${FRONTEND_URL}/dashboard/owner`}>
          Review Request
        </Button>
      </Section>

      <Text style={muted}>
        You have 48 hours to respond before the request expires.
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

const detailsBox = {
  backgroundColor: "#f9fafb",
  borderRadius: "8px",
  padding: "20px",
  margin: "16px 0",
  border: "1px solid #e5e7eb",
};

const listingName = {
  fontSize: "16px",
  fontWeight: "600" as const,
  color: "#1a1a1a",
  margin: "0 0 16px",
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

const messageBox = {
  backgroundColor: "#fef3c7",
  borderRadius: "8px",
  padding: "16px",
  margin: "16px 0",
  borderLeft: `3px solid #f59e0b`,
};

const messageText = {
  fontSize: "14px",
  fontStyle: "italic" as const,
  color: "#92400e",
  margin: "4px 0 0",
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
