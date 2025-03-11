/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.ignoreWarnings = [/Failed to parse source map/];
        }
        return config;
    },
};

export default config;
