import { app } from './app.js';
import { env } from './config/env.js';
import { connectRedis } from "./shared/middleware/rateLimit/redis.js";

const PORT = process.env.PORT || 5000

async function startServer() {
    console.log("[Server] Starting...");

    await connectRedis();

    console.log("[Server] Redis connected.");

    app.listen(PORT, () => {
        console.log(`API listening on http://localhost:${PORT}`);
    });
}

startServer().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
});