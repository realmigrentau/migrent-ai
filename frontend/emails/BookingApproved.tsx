import {
  Button,
  Column,
  Row,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import EmailLayout, { BRAND_COLOR } from "./EmailLayout";

interface BookingApprovedProps {
  seekerName: string;
  listingTitle: string;
  checkIn: string;
  checkOut: string;
  checkoutUrl: string;
  totalFees: string;
}

export default function BookingApproved({
  seekerName = "Alex",
  listingTitle = "Sunny Room in Bondi",
  checkIn = "2026-04-01",
  checkOut = "2026-05-01",
  checkoutUrl = "#",
  totalFees = "$118.00",
}: BookingApprovedProps) {
  return (
    <EmailLayout preview={`Your booking for ${listingTitle} was approved - pay to confirm`}>
      <Section style={successBanner}>
        <Text style={successIcon}>Approved</Text>
      </Section>

      <Text style={heading}>Your Booking Was Approved!</Text>

      <Text style={paragraph}>
        Hi {seekerName},
      </Text>

      <Text style={paragraph}>
        Great news! The owner has accepted your booking request for <strong>{listingTitle}</strong>.
        Complete your payment to confirm the booking.
      </Text>

      <Section style={detailsBox}>
        <Row>
          <Column>
            <Text style={label}>Move-in</Text>
            <Text style={value}>{checkIn}</Text>
          </Column>
          <Column>
            <Text style={label}>Move-out</Text>
            <Text style={value}>{checkOut}</Text>
          </Column>
        </Row>
        <Row>
          <Column>
            <Text style={label}>Service Fees</Text>
            <Text style={value}>AUD {totalFees}</Text>
          </Column>
          <Column>
            <Text style={label}>Breakdown</Text>
            <Text style={smallText}>Owner fee: $99 + Seeker fee: $19</Text>
          </Column>
        </Row>
      </Section>

      <Section style={{ textAlign: "center", margin: "24px 0" }}>
        <Button style={button} href={checkoutUrl}>
          Pay to Confirm Booking
        </Button>
      </Section>

      <Text style={muted}>
        Secure payment powered by Stripe. Your payment details are never stored on MigRent.
      </Text>
    </EmailLayout>
  );
}

const successBanner = {
  backgroundColor: "#ecfdf5",
  borderRadius: "8px",
  padding: "12px",
  textAlign: "center" as const,
  margin: "0 0 20px",
};

const successIcon = {
  color: "#059669",
  fontSize: "16px",
  fontWeight: "600" as const,
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

const smallText = {
  fontSize: "13px",
  color: "#6b7280",
  margin: "0 0 12px",
};

const button = {
  backgroundColor: "#059669",
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
