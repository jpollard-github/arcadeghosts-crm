import { google } from "googleapis";
import { getGoogleOAuthClient } from "@/lib/google/client";

export function getPeopleClient() {
  return google.people({
    version: "v1",
    auth: getGoogleOAuthClient(),
  });
}
