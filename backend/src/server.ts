import { createApp } from "./app.js";
import { createEnv, type AppBindings } from "./config/env.js";
import type { ExecutionContext } from "@cloudflare/workers-types";

export default {
    fetch(
        request: Request,
        env: AppBindings,
        ctx: ExecutionContext
    ) {
        const appEnv = createEnv(env);
        const app = createApp(appEnv);

        return app.fetch(request, appEnv, ctx);
    },
};