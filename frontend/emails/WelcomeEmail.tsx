import {
  Button,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import EmailLayout, { BRAND_COLOR, FRONTEND_URL } from "./EmailLayout";

interface WelcomeEmailProps {
  userName: string;
  userRole: "seeker" | "owner";
  day?: 1 | 3 | 7;
}

export default function WelcomeEmail({
  userName = "Alex",
  userRole = "seeker",
  day = 1,
}: WelcomeEmailProps) {
  if (day === 1) {
    return (
      <EmailLayout preview={`Welcome to MigRent, ${userName}!`}>
        <Text style={heading}>Welcome to MigRent!</Text>

        <Text style={paragraph}>
          Hi {userName},
        </Text>

        <Text style={paragraph}>
          Thanks for joining MigRent - Australia's platform for international
          students and migrants finding shared accommodation.
        </Text>

        {userRole === "seeker" ? (
          <>
            <Section style={tipBox}>
              <Text style={tipTitle}>Get started in 3 steps:</Text>
              <Text style={tipText}>1. Complete your profile - hosts love knowing who you are</Text>
              <Text style={tipText}>2. Browse listings in your preferred area</Text>
              <Text style={tipText}>3. Send a booking request to your favourite room</Text>
            </Section>

            <Section style={{ textAlign: "center", margin: "24px 0" }}>
              <Button style={button} href={`${FRONTEND_URL}/seeker/search`}>
                Start Browsing
              </Button>
            </Section>
          </>
        ) : (
          <>
            <Section style={tipBox}>
              <Text style={tipTitle}>Get started in 3 steps:</Text>
              <Text style={tipText}>1. Create your first listing with photos</Text>
              <Text style={tipText}>2. Set your weekly price and availability</Text>
              <Text style={tipText}>3. Wait for booking requests to come in</Text>
            </Section>

            <Section style={{ textAlign: "center", margin: "24px 0" }}>
              <Button style={button} href={`${FRONTEND_URL}/owner/create-listing`}>
                Create Your Listing
              </Button>
            </Section>
          </>
        )}

        <Text style={muted}>
          Need help? Visit our support page or reply to this email.
        </Text>
      </EmailLayout>
    );
  }

  if (day === 3) {
    return (
      <EmailLayout preview={`Complete your MigRent profile, ${userName}`}>
        <Text style={heading}>Complete Your Profile</Text>

        <Text style={paragraph}>
          Hi {userName},
        </Text>

        <Text style={paragraph}>
          Profiles with a photo and bio get <strong>3x more responses</strong> on MigRent.
          Take a minute to complete yours!
        </Text>

        <Section style={tipBox}>
          <Text style={tipTitle}>Profile checklist:</Text>
          <Text style={tipText}>- Add a profile photo</Text>
          <Text style={tipText}>- Write a short bio about yourself</Text>
          <Text style={tipText}>- Add your occupation or study details</Text>
          <Text style={tipText}>- Verify your identity for a trust badge</Text>
        </Section>

        <Section style={{ textAlign: "center", margin: "24px 0" }}>
          <Button style={button} href={`${FRONTEND_URL}/settings`}>
            Complete Your Profile
          </Button>
        </Section>
      </EmailLayout>
    );
  }

  // Day 7
  return (
    <EmailLayout preview={`How's your search going, ${userName}?`}>
      <Text style={heading}>How's It Going?</Text>

      <Text style={paragraph}>
        Hi {userName},
      </Text>

      <Text style={paragraph}>
        You've been on MigRent for a week now. {userRole === "seeker"
          ? "Have you found a room you like? Remember, the best listings go fast!"
          : "Have you listed your room yet? Seekers are actively searching for accommodation."
        }
      </Text>

      <Section style={{ textAlign: "center", margin: "24px 0" }}>
        <Button style={button} href={FRONTEND_URL}>
          Check Out MigRent
        </Button>
      </Section>

      <Text style={muted}>
        If you have any questions, our support team is here to help.
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
  backgroundColor: "#eff6ff",
  borderRadius: "8px",
  padding: "16px 20px",
  margin: "16px 0",
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
