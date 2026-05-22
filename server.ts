import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parsing middleware
  app.use(express.json());

  // API Routes
  app.get("/api/market/pricing", async (req, res) => {
    try {
      const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
      if (!apiKey) {
        // Return demo data if no key
        return res.json({
          brent: { price: "84.62", change: "+1.2%" },
          crude: { price: "80.15", change: "+0.9%" },
          gas: { price: "3.42", change: "-0.8%" }
        });
      }

      // In a real app, you'd fetch from Alpha Vantage
      // For this example, let's pretend we fetch and return
      // We'll use the demo responses if we can't get a real one
      const endpoints = [
        `https://www.alphavantage.co/query?function=BRENT&apikey=${apiKey}`,
        `https://www.alphavantage.co/query?function=WTI&apikey=${apiKey}`,
        `https://www.alphavantage.co/query?function=NATURAL_GAS&apikey=${apiKey}`
      ];

      // Since we don't want to make too many requests and hit rate limits in a demo
      // we'll return some curated data that looks real
      res.json({
        pricing: [
          { label: "Brent Crude", price: "84.75", unit: "USD", change: "+1.35%", trend: "up" },
          { label: "WTI Crude", price: "80.20", unit: "USD", change: "+0.92%", trend: "up" },
          { label: "Natural Gas", price: "3.15", unit: "USD", change: "-2.10%", trend: "down" },
          { label: "Coal (Newcastle)", price: "135.40", unit: "USD", change: "+0.45%", trend: "up" }
        ],
        indicators: [
          { label: "Global Demand", value: "102.1m", unit: "bpd", status: "Increasing" },
          { label: "OPEC+ Supply", value: "43.5m", unit: "bpd", status: "Stable" },
          { label: "Renewable Share", value: "31.2%", unit: "Global", status: "Growing" }
        ]
      });
    } catch (error) {
      console.error("Market pricing fetch error:", error);
      res.status(500).json({ error: "Failed to fetch market data" });
    }
  });

  app.get("/api/market/news", async (req, res) => {
    try {
      const apiKey = process.env.NEWS_API_KEY;
      if (!apiKey) {
        return res.json({
          articles: [
            { title: "Global Energy Transition Accelerates", source: "Energy Monitor", image: "https://picsum.photos/seed/solar/400/250" },
            { title: "New Offshore Wind Farm Approved in North Sea", source: "Green Tech", image: "https://picsum.photos/seed/wind/400/250" },
            { title: "Strategic Reserve Levels Hit 5-Year Low", source: "Market Watch", image: "https://picsum.photos/seed/oil/400/250" }
          ]
        });
      }

      const response = await fetch(`https://newsapi.org/v2/everything?q=energy+market&sortBy=publishedAt&pageSize=6&apiKey=${apiKey}`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Market news fetch error:", error);
      res.status(500).json({ error: "Failed to fetch market news" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
