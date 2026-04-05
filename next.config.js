const fs = require("fs");
const path = require("path");

/**
 * Next loads .env* before next.config.js and never overwrites keys that already
 * exist in process.env (e.g. from your shell). Re-apply .env.local here in
 * non-production so project-local values win over global exports.
 */
function applyEnvLocalOverride() {
    if (process.env.NODE_ENV === "production") return;
    const envPath = path.join(__dirname, ".env.local");
    if (!fs.existsSync(envPath)) return;
    const text = fs.readFileSync(envPath, "utf8");
    for (const line of text.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const noExport = trimmed.replace(/^export\s+/, "");
        const eq = noExport.indexOf("=");
        if (eq <= 0) continue;
        const key = noExport.slice(0, eq).trim();
        if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
        let val = noExport.slice(eq + 1).trim();
        if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
        ) {
            val = val.slice(1, -1);
        }
        process.env[key] = val;
    }
}

applyEnvLocalOverride();

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        qualities: [25, 50, 75, 90, 100],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'm.media-amazon.com',
                port: '',
                pathname: '/images/**',
            },
        ],
    }
}

module.exports = nextConfig
