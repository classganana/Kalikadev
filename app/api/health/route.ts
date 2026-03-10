/**
 * Health check endpoint for monitoring and deployments.
 * Lightweight, no DB dependency - use for liveness probes.
 */
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? "0.0.1",
  });
}
