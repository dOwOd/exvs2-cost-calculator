#!/bin/sh
set -e

export COREPACK_ENABLE_DOWNLOAD_PROMPT=0

echo "Enabling corepack and preparing pnpm..."
corepack enable
corepack prepare pnpm@latest --activate

echo "Installing dependencies with pnpm..."
pnpm install

echo "Starting Astro dev server..."
exec pnpm dev
