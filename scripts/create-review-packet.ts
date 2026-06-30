import { execFile, spawn, type ChildProcess } from "node:child_process";
import { promises as fs } from "node:fs";
import http from "node:http";
import net from "node:net";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const repoRoot = process.cwd();
const reviewPacketsRoot = path.join(repoRoot, "review-packets");
const packetTimestamp = new Date();
const packetDate = formatDate(packetTimestamp);
const packetTime = formatTime(packetTimestamp);

const defaultRoutes = [
  "/",
  "/leads",
  "/companies",
  "/contacts",
  "/interactions",
  "/proposals",
  "/projects",
  "/settings",
];

const defaultSourceEntries = [
  "README.md",
  "package.json",
  "package-lock.json",
  "next.config.ts",
  "next.config.mjs",
  "tsconfig.json",
  "eslint.config.mjs",
  "drizzle.config.ts",
  ".env.example",
  "src/app",
  "src/components",
  "src/db",
  "src/lib",
  "src/server",
  "src/types",
];

const defaultDocsEntries = [
  "docs/leads.md",
  "docs/crm-todo.md",
  "docs/architecture.md",
  "docs/data-model.md",
  "docs/integrations.md",
  "docs/example-leads.md",
  "private/README.md",
];

const defaultReportEntries = ["playwright-report", "test-results", "coverage"];

const defaultSchemaEntries = ["src/db/schema.ts", "src/db/index.ts"];

const defaultConfigEntries = [
  "package.json",
  "package-lock.json",
  "next.config.ts",
  "next.config.mjs",
  "tsconfig.json",
  "eslint.config.mjs",
  "drizzle.config.ts",
  ".env.example",
];

type CheckStatus = "pass" | "fail" | "unknown" | "skipped";
type ScreenshotMode = "desktop" | "mobile";
type ScreenshotVariant = "full-page" | "viewport";
type ScreenshotStatus = "generated" | "failed" | "skipped";

type CommandResult = {
  command: string;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  error?: string;
  status: CheckStatus;
};

type PacketOptions = {
  includePaths: string[];
  note?: string;
  summaryFile?: string;
  reportFile?: string;
  screenshotBaseUrl?: string;
  includeScript: boolean;
  focus?: string;
  routes: string[];
  skipTests: boolean;
  skipScreenshots: boolean;
  viewportOnly: boolean;
  mobile: boolean;
  skipBuild: boolean;
};

type ScreenshotSummaryEntry = {
  route: string;
  mode: ScreenshotMode;
  variant: ScreenshotVariant;
  filePath: string;
  status: ScreenshotStatus;
  sizeBytes: number;
  baseUrl: string;
  error?: string;
};

type RouteStatusEntry = {
  route: string;
  mode: ScreenshotMode;
  baseUrl: string;
  httpStatus?: number;
  error?: string;
};

type ScreenshotResult = {
  generated: string[];
  skippedReason?: string;
  summary: ScreenshotSummaryEntry[];
  routeStatuses: RouteStatusEntry[];
};

type PacketContext = {
  missingOptionalPaths: string[];
  copiedSources: string[];
  copiedDocs: string[];
  copiedSchema: string[];
  copiedConfig: string[];
  copiedReports: string[];
  copiedExtraFiles: string[];
  sensitiveWarnings: string[];
  checkSummaries: string[];
  checkStatus: CheckStatus;
};

type ServerHandle = {
  baseUrl?: string;
  child?: ChildProcess;
  reason?: string;
};

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const datedDir = path.join(reviewPacketsRoot, packetDate);
  const packetDir = await ensureUniquePath(path.join(datedDir, `crm-review-${packetTime}`));
  const latestDir = path.join(reviewPacketsRoot, "latest-crm-review");
  const zipPath = await ensureUniquePath(
    path.join(reviewPacketsRoot, `arcadeghosts-crm-review-${packetDate}-${packetTime}.zip`),
  );

  const context: PacketContext = {
    missingOptionalPaths: [],
    copiedSources: [],
    copiedDocs: [],
    copiedSchema: [],
    copiedConfig: [],
    copiedReports: [],
    copiedExtraFiles: [],
    sensitiveWarnings: [],
    checkSummaries: [],
    checkStatus: "unknown",
  };

  await ensureDir(packetDir);
  await Promise.all([
    ensureDir(path.join(packetDir, "source")),
    ensureDir(path.join(packetDir, "docs")),
    ensureDir(path.join(packetDir, "schema")),
    ensureDir(path.join(packetDir, "config")),
    ensureDir(path.join(packetDir, "reports")),
    ensureDir(path.join(packetDir, "screenshots")),
    ensureDir(path.join(packetDir, "extra")),
  ]);

  logStep(`Creating CRM review packet in ${packetDir}`);

  await copyEntries(defaultSourceEntries, "source", packetDir, context.copiedSources, context.missingOptionalPaths);
  await copyDocs(packetDir, context);
  await copySchema(packetDir, context);
  await copyConfig(packetDir, context);
  await copyEntries(defaultReportEntries, "reports", packetDir, context.copiedReports, context.missingOptionalPaths);

  if (options.includeScript) {
    await copyEntry("scripts/create-review-packet.ts", path.join(packetDir, "extra", "scripts", "create-review-packet.ts"));
    context.copiedExtraFiles.push("scripts/create-review-packet.ts");
  }

  await copyOptionalReportFile(options.summaryFile, path.join(packetDir, "reports", "codex-summary.md"), context);
  await copyOptionalReportFile(options.reportFile, path.join(packetDir, "reports", "codex-report.md"), context);
  await copyIncludedPaths(options.includePaths, packetDir, context);

  const checkResults = options.skipTests ? [] : await runChecks(options);
  await writeChecksReport(path.join(packetDir, "reports", "checks.txt"), checkResults, context, options);

  const screenshotResult = options.skipScreenshots
    ? {
        generated: [],
        skippedReason: "Skipped via --skip-screenshots.",
        summary: [],
        routeStatuses: [],
      }
    : await generateScreenshots(packetDir, options);

  await fs.writeFile(
    path.join(packetDir, "reports", "screenshot-summary.json"),
    `${JSON.stringify(screenshotResult.summary, null, 2)}\n`,
    "utf8",
  );
  await fs.writeFile(
    path.join(packetDir, "reports", "route-status.json"),
    `${JSON.stringify(screenshotResult.routeStatuses, null, 2)}\n`,
    "utf8",
  );

  await writePacketInfo({
    packetDir,
    latestDir,
    zipPath,
    options,
    context,
    checkResults,
    screenshotResult,
  });

  await writeReview({
    packetDir,
    options,
    context,
    checkResults,
    screenshotResult,
  });

  await refreshLatestCopy(packetDir, latestDir);
  const createdZip = await zipPacketDirectory(packetDir, zipPath);

  console.log(`Packet folder: ${packetDir}`);
  console.log(`Latest packet: ${latestDir}`);
  if (createdZip) {
    console.log(`Zip archive: ${zipPath}`);
  } else {
    console.log("Zip archive: skipped (the `zip` command was unavailable)");
  }
}

function parseArgs(argv: string[]): PacketOptions {
  const options: PacketOptions = {
    includePaths: [],
    includeScript: false,
    routes: defaultRoutes,
    skipTests: false,
    skipScreenshots: false,
    viewportOnly: false,
    mobile: false,
    skipBuild: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--include" && argv[index + 1]) {
      options.includePaths = splitCsv(argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg === "--note" && argv[index + 1]) {
      options.note = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--summary-file" && argv[index + 1]) {
      options.summaryFile = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--report-file" && argv[index + 1]) {
      options.reportFile = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--focus" && argv[index + 1]) {
      options.focus = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--routes" && argv[index + 1]) {
      options.routes = splitCsv(argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg === "--screenshot-base-url" && argv[index + 1]) {
      options.screenshotBaseUrl = argv[index + 1];
      index += 1;
      continue;
    }
    if (arg === "--skip-tests") {
      options.skipTests = true;
      continue;
    }
    if (arg === "--skip-screenshots") {
      options.skipScreenshots = true;
      continue;
    }
    if (arg === "--viewport-only") {
      options.viewportOnly = true;
      continue;
    }
    if (arg === "--mobile") {
      options.mobile = true;
      continue;
    }
    if (arg === "--include-script") {
      options.includeScript = true;
      continue;
    }
    if (arg === "--skip-build") {
      options.skipBuild = true;
    }
  }

  return options;
}

function splitCsv(value: string) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

async function copyDocs(packetDir: string, context: PacketContext) {
  for (const entry of defaultDocsEntries) {
    const destination = path.join(packetDir, "docs", trimDocsTarget(entry));
    await copyKnownOptionalEntry(entry, destination, context.copiedDocs, context.missingOptionalPaths);
  }
}

async function copySchema(packetDir: string, context: PacketContext) {
  for (const entry of defaultSchemaEntries) {
    const destination = path.join(packetDir, "schema", path.basename(entry));
    await copyKnownOptionalEntry(entry, destination, context.copiedSchema, context.missingOptionalPaths);
  }
}

async function copyConfig(packetDir: string, context: PacketContext) {
  for (const entry of defaultConfigEntries) {
    const destination = path.join(packetDir, "config", path.basename(entry));
    await copyKnownOptionalEntry(entry, destination, context.copiedConfig, context.missingOptionalPaths);
  }
}

async function copyEntries(
  entries: string[],
  packetSubdir: string,
  packetDir: string,
  copiedPaths: string[],
  missingPaths: string[],
) {
  for (const entry of entries) {
    const sourcePath = path.join(repoRoot, entry);
    if (!(await pathExists(sourcePath))) {
      missingPaths.push(entry);
      continue;
    }

    const targetPath = path.join(packetDir, packetSubdir, entry);
    await copyPath(sourcePath, targetPath);
    copiedPaths.push(entry);
  }
}

async function copyKnownOptionalEntry(
  entry: string,
  destination: string,
  copiedPaths: string[],
  missingPaths: string[],
) {
  const sourcePath = path.join(repoRoot, entry);
  if (!(await pathExists(sourcePath))) {
    missingPaths.push(entry);
    return;
  }
  await copyPath(sourcePath, destination);
  copiedPaths.push(entry);
}

async function copyOptionalReportFile(
  sourceRelativePath: string | undefined,
  destination: string,
  context: PacketContext,
) {
  if (!sourceRelativePath) {
    return;
  }

  const sourcePath = path.resolve(repoRoot, sourceRelativePath);
  if (!(await pathExists(sourcePath))) {
    context.missingOptionalPaths.push(sourceRelativePath);
    return;
  }

  await copyPath(sourcePath, destination);
}

async function copyIncludedPaths(optionsIncludePaths: string[], packetDir: string, context: PacketContext) {
  for (const includePath of optionsIncludePaths) {
    const sourcePath = path.resolve(repoRoot, includePath);
    if (!(await pathExists(sourcePath))) {
      context.missingOptionalPaths.push(includePath);
      continue;
    }

    const relativeTarget = sanitizeIncludePath(includePath);
    await copyPath(sourcePath, path.join(packetDir, "extra", relativeTarget));
    context.copiedExtraFiles.push(includePath);

    const warning = detectSensitiveInclude(includePath);
    if (warning) {
      context.sensitiveWarnings.push(warning);
    }
  }
}

function detectSensitiveInclude(includePath: string) {
  const normalized = includePath.replace(/\\/g, "/").toLowerCase();
  if (normalized.startsWith("private/")) {
    return `Sensitive include warning: ${includePath} came from private/.`;
  }
  if (/\b(lead|leads|prospect|prospects|contact|contacts)\b/.test(normalized) && /\.(csv|xlsx|xls|tsv|json)$/i.test(normalized)) {
    return `Sensitive include warning: ${includePath} looks like real lead, prospect, or contact data.`;
  }
  if (/\.env($|\.)/.test(normalized)) {
    return `Sensitive include warning: ${includePath} looks like an environment file and should not be shared broadly.`;
  }
  return undefined;
}

async function runChecks(options: PacketOptions) {
  const packageJson = JSON.parse(await fs.readFile(path.join(repoRoot, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  const scripts = packageJson.scripts ?? {};
  const commands: string[][] = [];

  if (scripts.lint) {
    commands.push(["run", "lint"]);
  }
  if (scripts.typecheck) {
    commands.push(["run", "typecheck"]);
  }
  if (scripts.build && !options.skipBuild) {
    commands.push(["run", "build"]);
  }

  const results: CommandResult[] = [];
  for (const args of commands) {
    results.push(await runCommandCapture("npm", args));
  }
  return results;
}

async function runCommandCapture(command: string, args: string[]): Promise<CommandResult> {
  const commandLabel = [command, ...args].join(" ");
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: repoRoot,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr?.on("data", (chunk) => {
      stderr += String(chunk);
    });

    child.on("error", (error) => {
      resolve({
        command: commandLabel,
        exitCode: null,
        stdout,
        stderr,
        error: error.message,
        status: "unknown",
      });
    });

    child.on("close", (exitCode) => {
      resolve({
        command: commandLabel,
        exitCode,
        stdout,
        stderr,
        status: exitCode === 0 ? "pass" : "fail",
      });
    });
  });
}

async function writeChecksReport(
  outputPath: string,
  checkResults: CommandResult[],
  context: PacketContext,
  options: PacketOptions,
) {
  if (options.skipTests) {
    context.checkStatus = "skipped";
    context.checkSummaries = ["Checks skipped via --skip-tests."];
    await fs.writeFile(outputPath, "Checks skipped via --skip-tests.\n", "utf8");
    return;
  }

  if (checkResults.length === 0) {
    context.checkStatus = "skipped";
    context.checkSummaries = ["No matching scripts were available for lint, typecheck, or build."];
    await fs.writeFile(outputPath, "No matching check scripts were available.\n", "utf8");
    return;
  }

  let overall: CheckStatus = "pass";
  const blocks: string[] = [];
  const summaries: string[] = [];

  for (const result of checkResults) {
    if (result.status === "fail") {
      overall = "fail";
    } else if (result.status === "unknown" && overall !== "fail") {
      overall = "unknown";
    }

    summaries.push(
      `${result.command}: ${result.status}${result.exitCode === null ? "" : ` (exit ${result.exitCode})`}`,
    );

    blocks.push(
      [
        `$ ${result.command}`,
        result.error ? `Error: ${result.error}` : `Exit code: ${result.exitCode ?? "unknown"}`,
        "",
        "STDOUT",
        result.stdout.trim() || "(no stdout)",
        "",
        "STDERR",
        result.stderr.trim() || "(no stderr)",
        "",
      ].join("\n"),
    );
  }

  context.checkStatus = overall;
  context.checkSummaries = summaries;
  await fs.writeFile(outputPath, `${blocks.join("\n")}\n`, "utf8");
}

async function generateScreenshots(packetDir: string, options: PacketOptions): Promise<ScreenshotResult> {
  let playwright: {
    chromium: {
      launch: () => Promise<{
        newContext: (options: Record<string, unknown>) => Promise<{
          newPage: () => Promise<{
            goto: (url: string, options: { waitUntil: string; timeout: number }) => Promise<{ status: () => number } | null>;
            waitForLoadState: (state: string, options: { timeout: number }) => Promise<void>;
            screenshot: (options: { path: string; type: "jpeg"; quality: number; fullPage?: boolean }) => Promise<Buffer>;
          }>;
          close: () => Promise<void>;
        }>;
        close: () => Promise<void>;
      }>;
    };
    devices: Record<string, Record<string, unknown>>;
  };
  try {
    const loadPlaywright = new Function("modulePath", "return import(modulePath);") as (
      modulePath: string,
    ) => Promise<unknown>;
    playwright = (await loadPlaywright("@playwright/test")) as typeof playwright;
  } catch (error) {
    return {
      generated: [],
      skippedReason: `Playwright is not installed: ${(error as Error).message}`,
      summary: [],
      routeStatuses: [],
    };
  }

  const serverHandle = await resolveBaseUrlForScreenshots(options);
  if (!serverHandle.baseUrl) {
    return {
      generated: [],
      skippedReason: serverHandle.reason ?? "No base URL was available for screenshots.",
      summary: [],
      routeStatuses: [],
    };
  }

  const summary: ScreenshotSummaryEntry[] = [];
  const routeStatuses: RouteStatusEntry[] = [];
  const generated: string[] = [];
  const screenshotsDir = path.join(packetDir, "screenshots");
  const viewportDir = path.join(screenshotsDir, "viewport");
  await ensureDir(viewportDir);

  const browser = await playwright.chromium.launch();
  try {
    const modes: ScreenshotMode[] = options.mobile ? ["desktop", "mobile"] : ["desktop"];
    for (const mode of modes) {
      const context =
        mode === "mobile"
          ? await browser.newContext({ ...playwright.devices["iPhone 13"] })
          : await browser.newContext({ viewport: { width: 1440, height: 1080 } });
      const page = await context.newPage();

      for (const route of options.routes) {
        const targetUrl = new URL(route, serverHandle.baseUrl).toString();
        const slug = routeToSlug(route);
        try {
          const response = await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 45000 });
          routeStatuses.push({
            route,
            mode,
            baseUrl: serverHandle.baseUrl,
            httpStatus: response?.status(),
            error: response && response.status() >= 400 ? `HTTP ${response.status()}` : undefined,
          });

          try {
            await page.waitForLoadState("networkidle", { timeout: 5000 });
          } catch {
            // Keep going; app pages can still be reviewable.
          }

          const fullPagePath = path.join(screenshotsDir, `${mode}-${slug}.jpg`);
          const fullPageOk = await takeScreenshot(page, fullPagePath, summary, {
            route,
            mode,
            variant: "full-page",
            baseUrl: serverHandle.baseUrl,
          });
          if (fullPageOk) {
            generated.push(path.relative(packetDir, fullPagePath));
          }

          if (options.viewportOnly || options.mobile) {
            const viewportPath = path.join(viewportDir, `${mode}-${slug}.jpg`);
            const viewportOk = await takeScreenshot(page, viewportPath, summary, {
              route,
              mode,
              variant: "viewport",
              baseUrl: serverHandle.baseUrl,
              fullPage: false,
            });
            if (viewportOk) {
              generated.push(path.relative(packetDir, viewportPath));
            }
          }
        } catch (error) {
          routeStatuses.push({
            route,
            mode,
            baseUrl: serverHandle.baseUrl,
            error: (error as Error).message,
          });
          summary.push({
            route,
            mode,
            variant: "full-page",
            filePath: path.join("screenshots", `${mode}-${slug}.jpg`),
            status: "failed",
            sizeBytes: 0,
            baseUrl: serverHandle.baseUrl,
            error: (error as Error).message,
          });
        }
      }

      await context.close();
    }
  } finally {
    await browser.close();
    if (serverHandle.child) {
      serverHandle.child.kill("SIGTERM");
    }
  }

  return { generated, summary, routeStatuses };
}

async function resolveBaseUrlForScreenshots(options: PacketOptions): Promise<ServerHandle> {
  if (options.screenshotBaseUrl) {
    return {
      baseUrl: options.screenshotBaseUrl.endsWith("/")
        ? options.screenshotBaseUrl
        : `${options.screenshotBaseUrl}/`,
    };
  }

  const freePort = await findFreePort();
  const child = spawn("npm", ["run", "dev", "--", "--hostname", "127.0.0.1", "--port", String(freePort)], {
    cwd: repoRoot,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"],
  });

  let recentOutput = "";
  child.stdout?.on("data", (chunk) => {
    recentOutput += String(chunk);
  });
  child.stderr?.on("data", (chunk) => {
    recentOutput += String(chunk);
  });

  const baseUrl = `http://127.0.0.1:${freePort}/`;
  const ready = await waitForHttpOk(baseUrl, 45000).catch(() => false);
  if (!ready) {
    child.kill("SIGTERM");
    return {
      reason: `Could not start local dev server for screenshots. Recent output:\n${recentOutput.trim() || "(no server output)"}`,
    };
  }

  return { baseUrl, child };
}

async function takeScreenshot(
  page: { screenshot: (options: { path: string; type: "jpeg"; quality: number; fullPage?: boolean }) => Promise<Buffer> },
  absolutePath: string,
  summary: ScreenshotSummaryEntry[],
  details: {
    route: string;
    mode: ScreenshotMode;
    variant: ScreenshotVariant;
    baseUrl: string;
    fullPage?: boolean;
  },
) {
  try {
    await ensureDir(path.dirname(absolutePath));
    const data = await page.screenshot({
      path: absolutePath,
      type: "jpeg",
      quality: 82,
      fullPage: details.fullPage ?? true,
    });
    summary.push({
      route: details.route,
      mode: details.mode,
      variant: details.variant,
      filePath: path.relative(repoRoot, absolutePath),
      status: "generated",
      sizeBytes: data.byteLength,
      baseUrl: details.baseUrl,
    });
    return true;
  } catch (error) {
    summary.push({
      route: details.route,
      mode: details.mode,
      variant: details.variant,
      filePath: path.relative(repoRoot, absolutePath),
      status: "failed",
      sizeBytes: 0,
      baseUrl: details.baseUrl,
      error: (error as Error).message,
    });
    return false;
  }
}

async function writePacketInfo(input: {
  packetDir: string;
  latestDir: string;
  zipPath: string;
  options: PacketOptions;
  context: PacketContext;
  checkResults: CommandResult[];
  screenshotResult: ScreenshotResult;
}) {
  const { packetDir, latestDir, zipPath, options, context, checkResults, screenshotResult } = input;
  const missingOptionalPaths = [...new Set(context.missingOptionalPaths)];
  const copiedExtraFiles = [...new Set(context.copiedExtraFiles)];
  const sensitiveWarnings = [...new Set(context.sensitiveWarnings)];
  const content = [
    `Created: ${packetTimestamp.toISOString()}`,
    `Packet folder: ${packetDir}`,
    `Zip path: ${zipPath}`,
    `Latest folder: ${latestDir}`,
    "",
    "Options used:",
    `  focus: ${options.focus ?? "(none)"}`,
    `  note: ${options.note ?? "(none)"}`,
    `  include-script: ${options.includeScript ? "yes" : "no"}`,
    `  skip-tests: ${options.skipTests ? "yes" : "no"}`,
    `  skip-screenshots: ${options.skipScreenshots ? "yes" : "no"}`,
    `  mobile: ${options.mobile ? "yes" : "no"}`,
    `  viewport-only: ${options.viewportOnly ? "yes" : "no"}`,
    `  screenshot-base-url: ${options.screenshotBaseUrl ?? "(auto)"}`,
    "",
    "Routes captured:",
    ...options.routes.map((route) => `  - ${route}`),
    "",
    "Checks run:",
    ...(checkResults.length > 0
      ? checkResults.map((result) => `  - ${result.command}`)
      : [`  - ${options.skipTests ? "skipped via --skip-tests" : "none available"}`]),
    "",
    `Check status: ${context.checkStatus}`,
    ...context.checkSummaries.map((summary) => `  - ${summary}`),
    "",
    `Screenshots generated: ${screenshotResult.generated.length}`,
    ...(screenshotResult.skippedReason ? [`  skipped reason: ${screenshotResult.skippedReason}`] : []),
    ...screenshotResult.generated.map((filePath) => `  - ${filePath}`),
    "",
    "Missing optional paths:",
    ...(missingOptionalPaths.length > 0
      ? missingOptionalPaths.map((entry) => `  - ${entry}`)
      : ["  - (none)"]),
    "",
    "Extra included paths:",
    ...(copiedExtraFiles.length > 0
      ? copiedExtraFiles.map((entry) => `  - ${entry}`)
      : ["  - (none)"]),
    "",
    "Sensitive include warnings:",
    ...(sensitiveWarnings.length > 0
      ? sensitiveWarnings.map((entry) => `  - ${entry}`)
      : ["  - (none)"]),
    "",
    `Note: ${options.note ?? "(none)"}`,
    "",
  ].join("\n");

  await fs.writeFile(path.join(packetDir, "PACKET-INFO.txt"), content, "utf8");
}

async function writeReview(input: {
  packetDir: string;
  options: PacketOptions;
  context: PacketContext;
  checkResults: CommandResult[];
  screenshotResult: ScreenshotResult;
}) {
  const { packetDir, options, context, screenshotResult } = input;
  const missingOptionalPaths = [...new Set(context.missingOptionalPaths)];
  const copiedExtraFiles = [...new Set(context.copiedExtraFiles)];
  const sensitiveWarnings = [...new Set(context.sensitiveWarnings)];
  const lines = [
    "# ArcadeGhosts CRM Review Packet",
    "",
    "## Start Here",
    "This packet is a local review bundle for the ArcadeGhosts CRM repo. It pulls together the core docs, source, config, schema, checks, and optional screenshots so the current state can be reviewed without opening the full working tree.",
    "",
    "Start with the docs and schema, then compare those intentions against the current routes and integration placeholders.",
    "",
    "## Current Focus",
    options.focus ?? "(none provided)",
    "",
    "## Suggested Review Order",
    "1. README and docs",
    "2. docs/crm-todo.md",
    "3. src/db/schema.ts",
    "4. Dashboard",
    "5. Leads",
    "6. Companies",
    "7. Contacts",
    "8. Proposals / Projects",
    "9. Integration placeholders",
    "10. Env/config/security",
    "",
    "## Review Questions",
    "- Does the CRM still feel simple enough for an MVP?",
    "- Is the lead workflow clear?",
    "- Are companies, contacts, leads, interactions, follow-ups, proposals, and projects separated cleanly?",
    "- Does the data model support importing the enriched leads workbook later?",
    "- Are private leads and real prospect data protected?",
    "- Are Google/Stripe/OpenAI/Resend/GitHub integrations represented without being overbuilt?",
    "- Is the next implementation phase obvious from docs/crm-todo.md?",
    "- Are there security/privacy risks around contact data?",
    "- Is this useful as both an internal operating system and a future client demo?",
    "",
    "## Codex Review Prompt",
    "```text",
    "Review this ArcadeGhosts CRM packet as an early-stage internal business app. Focus first on product clarity, schema/design risks, privacy concerns, workflow gaps, and overbuilding risk. Read the docs, schema, and config first, then inspect the current routes and integration placeholders. Recommend the smallest high-value next changes.",
    "```",
    "",
    "## Codex Follow-Up Prompt Template",
    "```text",
    "Using this ArcadeGhosts CRM review packet and the identified findings, implement the top fixes without overbuilding. Prioritize privacy safety, lead workflow clarity, schema correctness, and the smallest useful UI/data-model improvements. Explain what changed and what remains intentionally deferred.",
    "```",
    "",
    "## Checks",
    `Status: ${context.checkStatus}`,
    ...context.checkSummaries.map((summary) => `- ${summary}`),
    "",
    "## Screenshots",
    ...(screenshotResult.generated.length > 0
      ? screenshotResult.generated.map((filePath) => `- ${filePath}`)
      : [`- ${screenshotResult.skippedReason ?? "No screenshots were generated."}`]),
    "",
    "## Missing Optional Files",
    ...(missingOptionalPaths.length > 0
      ? missingOptionalPaths.map((entry) => `- ${entry}`)
      : ["- (none)"]),
    "",
    "## Extra Included Files",
    ...(copiedExtraFiles.length > 0
      ? copiedExtraFiles.map((entry) => `- ${entry}`)
      : ["- (none)"]),
    "",
    "## Sensitive Include Warnings",
    ...(sensitiveWarnings.length > 0
      ? sensitiveWarnings.map((entry) => `- ${entry}`)
      : ["- (none)"]),
    "",
  ];

  await fs.writeFile(path.join(packetDir, "REVIEW.md"), `${lines.join("\n")}\n`, "utf8");
}

async function refreshLatestCopy(packetDir: string, latestDir: string) {
  await fs.rm(latestDir, { recursive: true, force: true });
  await fs.cp(packetDir, latestDir, { recursive: true });
}

async function zipPacketDirectory(packetDir: string, zipPath: string) {
  try {
    await execFileAsync("zip", ["-qr", zipPath, path.basename(packetDir)], {
      cwd: path.dirname(packetDir),
    });
    return true;
  } catch {
    return false;
  }
}

async function copyEntry(sourceRelativePath: string, destinationPath: string) {
  const sourcePath = path.join(repoRoot, sourceRelativePath);
  await copyPath(sourcePath, destinationPath);
}

async function copyPath(sourcePath: string, destinationPath: string) {
  const stats = await fs.stat(sourcePath);
  await ensureDir(path.dirname(destinationPath));
  if (stats.isDirectory()) {
    await fs.cp(sourcePath, destinationPath, { recursive: true });
    return;
  }
  await fs.copyFile(sourcePath, destinationPath);
}

function trimDocsTarget(entry: string) {
  if (entry === "private/README.md") {
    return "private-README.md";
  }
  return entry.replace(/^docs\//, "");
}

function sanitizeIncludePath(value: string) {
  return value.replace(/^(\.\.\/)+/, "").replace(/^\/+/, "");
}

function routeToSlug(route: string) {
  if (route === "/") {
    return "home";
  }
  return route.replace(/^\//, "").replace(/[\/:?&=#]+/g, "-");
}

async function findFreePort() {
  return new Promise<number>((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close();
        reject(new Error("Could not determine a free port."));
        return;
      }
      const { port } = address;
      server.close(() => resolve(port));
    });
    server.on("error", reject);
  });
}

async function waitForHttpOk(baseUrl: string, timeoutMs: number) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const ok = await pingUrl(baseUrl);
    if (ok) {
      return true;
    }
    await sleep(1000);
  }

  return false;
}

async function pingUrl(targetUrl: string) {
  return new Promise<boolean>((resolve) => {
    const request = http.get(targetUrl, (response) => {
      response.resume();
      resolve(Boolean(response.statusCode && response.statusCode < 500));
    });

    request.on("error", () => resolve(false));
    request.setTimeout(1500, () => {
      request.destroy();
      resolve(false);
    });
  });
}

async function ensureDir(targetDir: string) {
  await fs.mkdir(targetDir, { recursive: true });
}

async function pathExists(targetPath: string) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function ensureUniquePath(targetPath: string) {
  if (!(await pathExists(targetPath))) {
    return targetPath;
  }

  const extension = path.extname(targetPath);
  const base = extension ? targetPath.slice(0, -extension.length) : targetPath;
  let index = 2;
  while (await pathExists(`${base}-${index}${extension}`)) {
    index += 1;
  }
  return `${base}-${index}${extension}`;
}

function formatDate(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}

function formatTime(value: Date) {
  return `${String(value.getHours()).padStart(2, "0")}${String(value.getMinutes()).padStart(2, "0")}`;
}

function logStep(message: string) {
  console.log(`[crm:review-packet] ${message}`);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => {
  console.error(`[crm:review-packet] Failed: ${(error as Error).stack ?? (error as Error).message}`);
  process.exitCode = 1;
});
