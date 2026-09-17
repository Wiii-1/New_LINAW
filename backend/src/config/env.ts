export type AppBindings = {
    JWT_ACCESS_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_ACCESS_EXPIRES?: string;
    JWT_REFRESH_EXPIRES?: string;

    REDIS_URL: string;
    REDIS_TOKEN: string;

    BLOCKCHAIN_RPC_URL: string;
    AUDIT_CONTRACT_ADDRESS: string;
    BLOCKCHAIN_PRIVATE_KEY: string;

    FRONTEND_APP_URL?: string;
    APP_URL?: string;

    DATABASE_URL: string;
    TEST_DATABASE_URL: string;

    NODE_ENV?: string;
};

export type AppEnv = {
    JWT_ACCESS_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_ACCESS_EXPIRES: string;
    JWT_REFRESH_EXPIRES: string;

    REDIS_URL: string;
    REDIS_TOKEN: string;

    BLOCKCHAIN_RPC_URL: string;
    AUDIT_CONTRACT_ADDRESS: string;
    BLOCKCHAIN_PRIVATE_KEY: string;

    APP_URL: string;

    DATABASE_URL: string;
    TEST_DATABASE_URL: string;

    NODE_ENV: string;
};

export function createEnv(bindings: AppBindings): AppEnv {
    if (!bindings.REDIS_URL) {
        throw new Error("REDIS_URL is required");
    }

    if (!bindings.REDIS_TOKEN) {
        throw new Error("REDIS_TOKEN is required");
    }

    if (!bindings.JWT_ACCESS_SECRET) {
        throw new Error("JWT_ACCESS_SECRET is required");
    }

    if (!bindings.JWT_REFRESH_SECRET) {
        throw new Error("JWT_REFRESH_SECRET is required");
    }

    if (!bindings.BLOCKCHAIN_RPC_URL) {
        throw new Error("BLOCKCHAIN_RPC_URL is required");
    }

    if (!bindings.AUDIT_CONTRACT_ADDRESS) {
        throw new Error("AUDIT_CONTRACT_ADDRESS is required");
    }

    if (!bindings.BLOCKCHAIN_PRIVATE_KEY) {
        throw new Error("BLOCKCHAIN_PRIVATE_KEY is required");
    }

    if (!bindings.DATABASE_URL) {
        throw new Error("DATABASE_URL is required");
    }

    if (!bindings.TEST_DATABASE_URL) {
        throw new Error("TEST_DATABASE_URL is required");
    }

    const jwtAccessExpires =
        bindings.JWT_ACCESS_EXPIRES ?? "60m";

    const jwtRefreshExpires =
        bindings.JWT_REFRESH_EXPIRES ?? "7d";

    const appUrl =
        bindings.FRONTEND_APP_URL ??
        bindings.APP_URL ??
        "http://localhost:3000";

    return {
        JWT_ACCESS_SECRET: bindings.JWT_ACCESS_SECRET,
        JWT_REFRESH_SECRET: bindings.JWT_REFRESH_SECRET,

        JWT_ACCESS_EXPIRES: jwtAccessExpires as string,
        JWT_REFRESH_EXPIRES: jwtRefreshExpires as string,

        REDIS_URL: bindings.REDIS_URL,
        REDIS_TOKEN: bindings.REDIS_TOKEN,

        BLOCKCHAIN_RPC_URL: bindings.BLOCKCHAIN_RPC_URL,
        AUDIT_CONTRACT_ADDRESS: bindings.AUDIT_CONTRACT_ADDRESS,
        BLOCKCHAIN_PRIVATE_KEY: bindings.BLOCKCHAIN_PRIVATE_KEY,

        APP_URL: appUrl,

        DATABASE_URL: bindings.DATABASE_URL,
        TEST_DATABASE_URL: bindings.TEST_DATABASE_URL,

        NODE_ENV: bindings.NODE_ENV ?? "development",
    };
}