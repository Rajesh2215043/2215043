const express = require("express");
const crypto = require("crypto");
const { Log } = require("../logger.js");

const app = express();
app.use(express.json({ limit: "10kb" }));
function requestLogger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const logMessage = `${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`;
    Log("backend", "info", "http", logMessage).catch((err) => {
      console.error("Logging failed:", err.message);
    });
  });
  next();
}
app.use(requestLogger);
const links = new Map();
const DEFAULT_VALIDITY_MINUTES = 30;
const HOST_BASE = process.env.HOST_BASE || "http://localhost:3000";
function isValidUrl(u) {
  try {
    new URL(u);
    return true;
  } catch {
    return false;
  }
}
function generateCode(len = 6) {
  for (let i = 0; i < 5; i++) {
    const code = crypto
      .randomBytes(4)
      .toString("base64")
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, len);
    if (code && !links.has(code)) return code.toLowerCase();
  }
  return crypto.randomBytes(4).toString("hex");
}

function buildShortLink(code) {
  return `${HOST_BASE}/${code}`;
}
app.post("/shorturls", (req, res) => {
  const { url, validity, shortcode } = req.body || {};

  if (!url || typeof url !== "string" || !isValidUrl(url)) {
    return res.status(400).json({ error: "Invalid or missing url" });
  }

  let minutes = DEFAULT_VALIDITY_MINUTES;
  if (validity !== undefined) {
    if (
      typeof validity !== "number" ||
      !Number.isInteger(validity) ||
      validity <= 0
    ) {
      return res
        .status(400)
        .json({ error: "validity must be a positive integer (minutes)" });
    }
    minutes = validity;
  }

  let code = undefined;
  if (shortcode) {
    if (
      typeof shortcode !== "string" ||
      !/^[a-zA-Z0-9]{3,32}$/.test(shortcode)
    ) {
      return res
        .status(400)
        .json({ error: "shortcode must be alphanumeric length 3-32" });
    }
    const lower = shortcode.toLowerCase();
    if (links.has(lower)) {
      return res.status(409).json({ error: "shortcode already in use" });
    }
    code = lower;
  } else {
    code = generateCode();
    while (links.has(code)) code = generateCode();
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + minutes * 60 * 1000);
  links.set(code, { originalUrl: url, createdAt: now, expiresAt, clicks: [] });

  return res
    .status(201)
    .json({ shortLink: buildShortLink(code), expiry: expiresAt.toISOString() });
});
app.get("/:code", (req, res, next) => {
  if (req.params.code === "shorturls") return next();
  const code = req.params.code.toLowerCase();
  const record = links.get(code);
  if (!record) return res.status(404).json({ error: "Shortcode not found" });
  if (record.expiresAt < new Date())
    return res.status(410).json({ error: "Link expired" });

  record.clicks.push({
    ts: new Date(),
    referer: req.get("referer") || null,
    ip: req.ip,
  });
  return res.redirect(record.originalUrl);
});

app.get("/shorturls/:code", (req, res) => {
  const code = req.params.code.toLowerCase();
  const record = links.get(code);
  if (!record) return res.status(404).json({ error: "Shortcode not found" });

  const { originalUrl, createdAt, expiresAt, clicks } = record;
  res.json({
    shortcode: code,
    originalUrl,
    createdAt: createdAt.toISOString(),
    expiry: expiresAt.toISOString(),
    totalClicks: clicks.length,
    clicks: clicks.map((c) => ({
      ts: c.ts.toISOString(),
      referer: c.referer,
      ip: c.ip,
    })),
  });
});

app.use((err, req, res, next) => {
  Log("backend", "error", "http", `Error: ${err.message}`).catch(() => {});
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 URL Shortener running on http://localhost:${PORT}`);
    Log("backend", "info", "startup", `Server started on port ${PORT}`).catch(
      () => {}
    );
  });
}

module.exports = app;
