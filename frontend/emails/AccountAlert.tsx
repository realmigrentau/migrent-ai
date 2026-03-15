import {
  Button,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import EmailLayout, { BRAND_COLOR, FRONTEND_URL } from "./EmailLayout";

interface AccountAlertProps {
  userName: string;
  alertType: "listing_views" | "new_match" | "verification_approved" | "verification_rejected";
  listingTitle?: string;
  viewCount?: number;
  message?: string;
}

export default function AccountAlert({
  userName = "Alex",
  alertType = "listing_views",
  listingTitle = "Sunny Room in Bondi",
  viewCount = 5,
  message,
}: AccountAlertProps) {
  const alertContent = getAlertContent(alertType, { listingTitle, viewCount, message });

  return (
    <EmailLayout preview={alertContent.preview}>
      <Text style={heading}>{alertContent.title}</Text>

      <Text style={paragraph}>
        Hi {userName},
      </Text>

      <Text style={paragraph}>
        {alertContent.body}
      </Text>

      {alertContent.highlight && (
        <Section style={highlightBox}>
          <Text style={highlightText}>{alertContent.highlight}</Text>
        </Section>
      )}

      <Section style={{ textAlign: "center", margin: "24px 0" }}>
        <Button style={button} href={alertContent.ctaUrl}>
          {alertContent.ctaText}
        </Button>
      </Section>
    </EmailLayout>
  );
}

function getAlertContent(
  type: string,
  data: { listingTitle?: string; viewCount?: number; message?: string }
) {
  switch (type) {
    case "listing_views":
      return {
        preview: `Your listing got ${data.viewCount} new views!`,
        title: "Your Listing is Getting Attention!",
        body: `Your listing "${data.listingTitle}" received ${data.viewCount} new views recently. Seekers are checking it out!`,
        highlight: `${data.viewCount} new views`,
        ctaText: "View Your Listing",
        ctaUrl: `${FRONTEND_URL}/dashboard/owner`,
      };
    case "new_match":
      return {
        preview: "We found a new match for you!",
        title: "New Match Found!",
        body: "Our AI found a listing that matches your preferences. Check it out before someone else books it!",
        highlight: null,
        ctaText: "View Match",
        ctaUrl: `${FRONTEND_URL}/seeker/search`,
      };
    case "verification_approved":
      return {
        preview: "Your identity verification is approved!",
        title: "Verification Approved!",
        body: "Your identity has been verified. You now have a trust badge on your profile, which helps build confidence with other users.",
        highlight: "Verified",
        ctaText: "View Your Profile",
        ctaUrl: `${FRONTEND_URL}/settings`,
      };
    case "verification_rejected":
      return {
        preview: "Action needed: verification update",
        title: "Verification Update",
        body: data.message || "We were unable to verify your identity with the documents provided. Please try again with clearer photos.",
        highlight: null,
        ctaText: "Try Again",
        ctaUrl: `${FRONTEND_URL}/settings`,
      };
    default:
      return {
        preview: "Account update from MigRent",
        title: "Account Update",
        body: data.message || "You have a new update on your MigRent account.",
        highlight: null,
        ctaText: "Go to Dashboard",
        ctaUrl: FRONTEND_URL,
      };
  }
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

const highlightBox = {
  backgroundColor: "#ecfdf5",
  borderRadius: "8px",
  padding: "16px",
  textAlign: "center" as const,
  margin: "16px 0",
};

const highlightText = {
  fontSize: "20px",
  fontWeight: "700" as const,
  color: "#059669",
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
