import { google } from "googleapis";
import { getGoogleOAuthClient } from "@/lib/google/client";

export function getCalendarClient() {
  return google.calendar({
    version: "v3",
    auth: getGoogleOAuthClient(),
  });
}
