const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();

const TARGET = "https://royal-clip-studio.base44.app";

// 🔥 Proxy EVERYTHING (assets, js, css, api, etc.)
app.use(async (req, res) => {
  try {
    const url = TARGET + req.url;

    const response = await axios.get(url, {
      responseType: "arraybuffer"
    });

    const contentType = response.headers["content-type"];

    // If HTML → modify it
    if (contentType && contentType.includes("text/html")) {
      const html = response.data.toString("utf8");
      const $ = cheerio.load(html);

      // remove badge
      $("#base44-edit-badge").remove();

      // inject CSS safety
      $("head").append(`
        <style>
          #base44-edit-badge {
            display: none !important;
          }
        </style>
      `);

      res.setHeader("content-type", "text/html");
      return res.send($.html());
    }

    // Otherwise (JS/CSS/IMG/etc) → pass raw through
    res.setHeader("content-type", contentType || "application/octet-stream");
    res.send(response.data);

  } catch (err) {
    res.status(500).send("Proxy error: " + err.message);
  }
});

app.listen(3000, () => {
  console.log("Proxy running at http://localhost:3000");
});
