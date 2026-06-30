import Stripe from "stripe";
import { env } from "@/lib/env";

function requireServerEnv(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`${name} is required before using this integration.`);
  }
  return value;
}

export const stripe = new Stripe(requireServerEnv(env.STRIPE_SECRET_KEY, "STRIPE_SECRET_KEY"), {
  apiVersion: "2025-08-27.basil",
});
