# EC2 Deployment Analysis

## Current Setup

| Component | Details |
|-----------|---------|
| EC2 IP | 52.66.202.5 |
| OS | Ubuntu 22.04 (x86_64) |
| Memory | ~1–2 GB (typical t2.micro/t3.micro) |
| Services | Nginx (80/443), Gunicorn/Python (8080), KD Lithium/Next.js (3000) |

## Root Cause

1. **Memory pressure** – Next.js production build (`npm run build`) uses 1.5–3 GB RAM. A small EC2 instance with Python already running often doesn't have enough.
2. **Turbopack** – Next.js 16 uses Turbopack, which increases build-time memory use.
3. **Shared machine** – Python (Gunicorn) and Node (PM2) both run on the same instance, competing for RAM.

## Solution: Build Locally, Deploy Artifacts

**Idea:** Run `npm run build` on your Mac (more RAM), then sync only the build output (and necessary files) to EC2. The server only runs `npm start`, which uses far less memory.

| Step | Where | RAM Impact |
|------|--------|-----------|
| Build | Your Mac | No EC2 load |
| Run (`next start`) | EC2 | ~100–200 MB for Node process |

## Alternatives (if you need them later)

| Option | Pros | Cons |
|--------|------|------|
| Build locally + rsync | No EC2 upgrade, works today | Deploy from your machine |
| Upgrade to t3.small (2GB) | Build on server possible | Extra AWS cost |
| Separate EC2 for KD Lithium | Isolation | More cost |
| Vercel/Railway/Render | Managed Next.js, no server | Different setup, possible vendor lock-in |
