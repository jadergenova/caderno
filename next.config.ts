import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",
  agentRules: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
  },
}

export default nextConfig
