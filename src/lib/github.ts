import { Octokit } from "octokit";
import { env } from "@/lib/env";

function requireServerEnv(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`${name} is required before using this integration.`);
  }
  return value;
}

export const github = new Octokit({
  auth: requireServerEnv(env.GITHUB_TOKEN, "GITHUB_TOKEN"),
});
