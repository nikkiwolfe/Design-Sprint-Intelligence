import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

export const root = process.cwd();
export function loadEnv() {
  for (const filename of ['.env', '.env.local']) {
    const path = resolve(root, filename);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (!m || m[1] in process.env) continue;
      process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
    }
  }
}
export function readConfig() { return JSON.parse(readFileSync(resolve(root, 'sprint.config.json'), 'utf8')); }
export function writeJson(path, value) {
  const { mkdirSync, writeFileSync } = awaitlessFs;
  mkdirSync(resolve(root, path).replace(/\/[^/]+$/, ''), { recursive: true });
  writeFileSync(resolve(root, path), JSON.stringify(value, null, 2) + '\n');
}
import * as awaitlessFs from 'node:fs';
export function safeSlug(s) { return String(s || 'sprint').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'sprint'; }
export async function requestJson(url, headers = {}) {
  const response = await fetch(url, { headers });
  const body = await response.text();
  let data;
  try { data = body ? JSON.parse(body) : {}; } catch { data = { message: body.slice(0, 500) }; }
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}: ${data.message || data.err || response.statusText}`);
  return data;
}
export function figmaKeyFromUrl(url) {
  const match = String(url || '').match(/figma\.com\/(?:design|file|proto)\/([^/?]+)/i);
  return match?.[1] || '';
}
export function flattenFigmaNodes(node, out = []) {
  if (!node) return out;
  out.push({ id: node.id, name: node.name || node.id, type: node.type, visible: node.visible !== false, x: node.absoluteBoundingBox?.x ?? node.x ?? null, y: node.absoluteBoundingBox?.y ?? node.y ?? null, width: node.absoluteBoundingBox?.width ?? node.size?.x ?? null, height: node.absoluteBoundingBox?.height ?? node.size?.y ?? null, characters: node.characters ?? null, componentId: node.componentId ?? null, childrenCount: Array.isArray(node.children) ? node.children.length : 0 });
  for (const child of node.children || []) flattenFigmaNodes(child, out);
  return out;
}
