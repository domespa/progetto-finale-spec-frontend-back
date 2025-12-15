import express from "express";
import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import morgan from "morgan";
import { validators } from "./schema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  morgan("dev", {
    skip: (req) => req.method === "OPTIONS",
  })
);
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.json({ limit: "Infinity" }));

// **CACHE in memoria** for each resource type
const cache = {};

// Helper to get plural form (basic pluralization rules)
function getPlural(singular) {
  if (singular.endsWith("y")) {
    return singular.slice(0, -1) + "ies";
  } else if (
    singular.endsWith("s") ||
    singular.endsWith("x") ||
    singular.endsWith("z") ||
    singular.endsWith("ch") ||
    singular.endsWith("sh")
  ) {
    return singular + "es";
  } else {
    return singular + "s";
  }
}

// Extract resource types from validators
const resourceTypes = Object.keys(validators);

// Initialize cache for each resource type
resourceTypes.forEach((type) => {
  cache[type] = [];
});

// **Caricare i dati all'avvio**
const loadData = async (type) => {
  const dbDir = path.join(__dirname, "database");
  const dataFile = path.join(dbDir, `${type}.json`);
  try {
    if (existsSync(dataFile)) {
      const data = await fs.readFile(dataFile, "utf-8");
      if (data.trim()) {
        const loadedData = JSON.parse(data);

        if (!Array.isArray(loadedData)) {
          throw new Error(
            `Errore di struttura nel file ${type}.json: il file deve contenere un array.`
          );
        }

        cache[type] = loadedData;
        console.log(`✅ Caricati ${loadedData.length} elementi per ${type}`);
      } else {
        cache[type] = [];
      }
    } else {
      console.log(`⚠️ File ${type}.json non trovato, cache vuota.`);
      cache[type] = [];
    }
  } catch (error) {
    console.error(`❌ Errore nel caricare ${type}:`, error.message);
    throw error;
  }
};

// Dynamically create routes for each resource type
const loadPromises = resourceTypes.map((type) => {
  const pluralType = getPlural(type);

  // 📌 **POST /:resource - DISABLED (read-only)**
  app.post(`/${pluralType}`, (req, res) => {
    res.status(405).json({
      error: "Metodo non supportato",
      message: "Il backend è in modalità read-only su Vercel",
    });
  });

  // 📌 **GET /:resource/:id - Get a specific resource**
  app.get(`/${pluralType}/:id`, (req, res) => {
    const itemId = parseInt(req.params.id);
    const item = cache[type].find((p) => p.id === itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: `${type} with id '${itemId}' not found.`,
      });
    }
    res.json({ success: true, [type]: item });
  });

  // 📌 **PUT /:resource/:id - DISABLED (read-only)**
  app.put(`/${pluralType}/:id`, (req, res) => {
    res.status(405).json({
      error: "Metodo non supportato",
      message: "Il backend è in modalità read-only su Vercel",
    });
  });

  // 📌 **DELETE /:resource/:id - DISABLED (read-only)**
  app.delete(`/${pluralType}/:id`, (req, res) => {
    res.status(405).json({
      error: "Metodo non supportato",
      message: "Il backend è in modalità read-only su Vercel",
    });
  });

  // 📌 **GET /:resource - Get all resources**
  app.get(`/${pluralType}`, (req, res) => {
    const { search, category } = req.query;
    let filteredItems = [...cache[type]];

    // Filter by category if provided
    if (category) {
      filteredItems = filteredItems.filter(
        (item) =>
          item.category &&
          item.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Search in title if search parameter is provided
    if (search) {
      filteredItems = filteredItems.filter(
        (item) =>
          item.title && item.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json(
      filteredItems.map(
        ({ id, createdAt, updatedAt, title, category, image }) => ({
          id,
          createdAt,
          updatedAt,
          title,
          category,
          image,
        })
      )
    );
  });

  // Load data for this resource type
  return loadData(type);
});

Promise.all(loadPromises)
  .then(() => {
    // **Avvio del server**
    app.listen(PORT, () => {
      console.log(`🔌 API Disponibili (READ-ONLY):`);
      resourceTypes.forEach((type) => {
        console.log(`   - GET /${getPlural(type)} (lista ${type})`);
        console.log(`   - GET /${getPlural(type)}/:id (dettaglio ${type})`);
      });
      console.log(`✅ Server in ascolto su http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error(`\n${error.message}`);
    console.error(
      "\n⚠️ Il server non è stato avviato a causa degli errori sopra indicati."
    );
    process.exit(1);
  });

export default app;
