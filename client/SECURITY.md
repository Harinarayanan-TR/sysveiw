# Security Policy

## Authentication

Sysveiw uses API key authentication between the client and cloud backend.

- Every HTTP request to the cloud backend includes an `X-Api-Key` header
- POST requests to `/api/command` also include the key in the JSON body (`apiKey`)
- The cloud backend validates the key before executing any command
- Default key: `sv-c1-3a8f2d9e` (override via `SYSVEIW_API_KEY` env var)

## Sandbox

The local sandbox (`sandbox.js`) restricts commands to an allowlist of ~40
safe utilities (ls, ping, curl, uptime, etc.). Dangerous characters
(`;&|<>$``) and destructive flags (`--rm-rf`, `--force`) are denied.

## Transport

In production, deploy the cloud backend behind HTTPS (Render does this
automatically). The client sends API keys and command payloads over TLS.

## Reporting

Report security issues to: error40404.github@gmail.com
