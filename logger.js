const fetch = require("node-fetch");

async function Log(stack, level, package, message) {
  const API_ENDPOINT = "http://2.244.56.144/evaluation-service/logs";
  const BEARER_TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiIyMjE1MDQzQG5lYy5lZHUuaW4iLCJleHAiOjE3NTU2NzA1ODAsImlhdCI6MTc1NTY2OTY4MCwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6ImRlYWYxNDUzLTIyM2MtNDUwMi04MzAyLWU4MDI3MTQ4YTkzMyIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6InJhamVzaCBtIiwic3ViIjoiNDk0ZTkyZDEtNTI0Yy00YTE1LThmNWMtYjA3MzgzM2EyN2QyIn0sImVtYWlsIjoiMjIxNTA0M0BuZWMuZWR1LmluIiwibmFtZSI6InJhamVzaCBtIiwicm9sbE5vIjoiMjIxNTA0MyIsImFjY2Vzc0NvZGUiOiJ4c1pUVG4iLCJjbGllbnRJRCI6IjQ5NGU5MmQxLTUyNGMtNGExNS04ZjVjLWIwNzM4MzNhMjdkMiIsImNsaWVudFNlY3JldCI6InZtclRuRnJ2TlJZUUpXV1EifQ.g2KteOBxTbD1gz6luhabL05U7-b9_oICQhQ4_KOo2vc";

  if (!BEARER_TOKEN || BEARER_TOKEN.trim() === "") {
    console.error(
      "🚨 FATAL: Bearer token is not set in logger.js. Logging is disabled."
    );
    return;
  }

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BEARER_TOKEN}`,
      },
      body: JSON.stringify({ stack, level, package, message }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("Logged to API successfully:", result.logID);
    } else {
      console.error(
        "Failed to send log to API:",
        response.status,
        await response.text()
      );
    }
  } catch (error) {
    console.error("🚨 Error in Log function:", error.message);
  }
}

module.exports = { Log };
