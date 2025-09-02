import express from "express";
import morgan from "morgan";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(morgan("dev"));
app.use(express.json())

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const routesPath = path.join(__dirname, "routes");

const routeFiles = fs.readdirSync(routesPath);

for (const file of routeFiles) {
  const routeFileUrl = pathToFileURL(path.join(routesPath, file)).href;
  const routeModule = await import(routeFileUrl);
  app.use("/api/v1", routeModule.default);
}
const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
