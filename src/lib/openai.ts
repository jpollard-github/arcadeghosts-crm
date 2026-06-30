import OpenAI from "openai";
import { env } from "@/lib/env";

function requireServerEnv(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`${name} is required before using this integration.`);
  }
  return value;
}

export const openai = new OpenAI({
  apiKey: requireServerEnv(env.OPENAI_API_KEY, "OPENAI_API_KEY"),
});
