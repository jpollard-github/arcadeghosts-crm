import { Resend } from "resend";
import { env } from "@/lib/env";

function requireServerEnv(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`${name} is required before using this integration.`);
  }
  return value;
}

export const resend = new Resend(requireServerEnv(env.RESEND_API_KEY, "RESEND_API_KEY"));
export const resendFromEmail = requireServerEnv(env.RESEND_FROM_EMAIL, "RESEND_FROM_EMAIL");
