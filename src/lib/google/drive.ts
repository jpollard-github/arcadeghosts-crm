import { google } from "googleapis";
import { getGoogleOAuthClient } from "@/lib/google/client";

export function getDriveClient() {
  return google.drive({
    version: "v3",
    auth: getGoogleOAuthClient(),
  });
}
