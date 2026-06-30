import { google } from "googleapis";
import { env } from "@/lib/env";

function requireServerEnv(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`${name} is required before using this integration.`);
  }
  return value;
}

export function getGoogleOAuthClient() {
  return new google.auth.OAuth2(
    requireServerEnv(env.GOOGLE_CLIENT_ID, "GOOGLE_CLIENT_ID"),
    requireServerEnv(env.GOOGLE_CLIENT_SECRET, "GOOGLE_CLIENT_SECRET"),
    requireServerEnv(env.GOOGLE_REDIRECT_URI, "GOOGLE_REDIRECT_URI"),
  );
}
