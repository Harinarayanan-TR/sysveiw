const http = require('http');
const https = require('https');
const { URL } = require('url');

const fs = require('fs');
const path = require('path');

const API_KEY = process.env.SYSVEIW_API_KEY || 'sv-c1-3a8f2d9e';

let configUrl = null;
try {
  const configPath = path.join(__dirname, '..', 'config.json');
  if (fs.existsSync(configPath)) {
    const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    configUrl = cfg.cloudUrl || null;
  }
} catch {}

const DEFAULT_BACKEND_URL = process.env.SYSVEIW_CLOUD_URL || configUrl || 'http://localhost:3000';
let backendUrl = DEFAULT_BACKEND_URL;
let lastConnectionState = { connected: false, checkedAt: 0, backendUrl };

function normalizeUrl(rawUrl) {
  if (!rawUrl) return DEFAULT_BACKEND_URL;
  if (/^https?:\/\//i.test(rawUrl)) return rawUrl;
  return `http://${rawUrl}`;
}

function request(targetUrl, payload) {
  const url = new URL(targetUrl);
  const isHttps = url.protocol === 'https:';
  const mod = isHttps ? https : http;

  return new Promise((resolve, reject) => {
    const body = payload ? JSON.stringify(payload) : null;
    const req = mod.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + (url.search || ''),
        method: body ? 'POST' : 'GET',
        headers: {
          'User-Agent': 'sysveiw-client/1.1.3',
          'X-Api-Key': API_KEY,
          ...(body ? { 'Content-Type': 'application/json' } : {})
        }
      },
      (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, body: data ? JSON.parse(data) : {} });
          } catch {
            resolve({ statusCode: res.statusCode, body: { error: 'Invalid JSON response' } });
          }
        });
      }
    );

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function checkConnection() {
  const targetUrl = normalizeUrl(backendUrl);
  try {
    const result = await request(`${targetUrl}/health`, null);
    const connected = result.statusCode >= 200 && result.statusCode < 500;
    lastConnectionState = { connected, checkedAt: Date.now(), backendUrl, statusCode: result.statusCode, body: result.body };
    return lastConnectionState;
  } catch (err) {
    lastConnectionState = { connected: false, checkedAt: Date.now(), backendUrl, error: err.message };
    return lastConnectionState;
  }
}

async function run(command, args) {
  const targetUrl = normalizeUrl(backendUrl);
  try {
    const result = await request(`${targetUrl}/api/command`, { command, args, apiKey: API_KEY });
    if (result.body && result.body.error) {
      return { error: result.body.error };
    }
    return result.body && Object.keys(result.body).length ? result.body : { ok: true };
  } catch {
    return { error: 'COULD NOT CONNECT TO SERVER' };
  }
}

function getBackendUrl() { return backendUrl; }

function setBackendUrl(url) { backendUrl = normalizeUrl(url); return backendUrl; }

function getLastConnectionState() { return lastConnectionState; }

module.exports = { checkConnection, run, getBackendUrl, setBackendUrl, getLastConnectionState };
