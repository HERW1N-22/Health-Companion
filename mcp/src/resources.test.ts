import { test } from 'node:test';
import assert from 'node:assert/strict';

import { registerResources } from './resources.js';
import { listSections } from './tileKit.js';

// A fake MCP server that captures registerResource(name, uriOrTemplate, config, read),
// mirroring the fakeServer() pattern in uploadTile.test.ts. registerResources is pure
// and identity-free, so no getVdb is threaded — resources are ambient context only.
type ReadCb = (
  uri: URL,
  vars?: Record<string, string | string[]>,
) => Promise<{ contents: { uri: string; text: string; mimeType?: string }[] }>;

function fakeServer() {
  const res: Record<string, { uriOrTemplate: any; config: any; read: ReadCb }> = {};
  const server = {
    registerResource(name: string, uriOrTemplate: any, config: any, read: ReadCb) {
      res[name] = { uriOrTemplate, config, read };
    },
  };
  return { server: server as never, res };
}

test('registerResources: registers the three engine resources', () => {
  const { server, res } = fakeServer();
  registerResources(server);
  assert.ok(res['healthcompanion-engine'], 'orientation resource');
  assert.ok(res['healthcompanion-dna'], 'dna section template');
  assert.ok(res['healthcompanion-kit'], 'domain kit template');
  assert.equal(res['healthcompanion-engine'].config.mimeType, 'text/markdown');
});

test('healthcompanion://engine returns the orientation brain', async () => {
  const { server, res } = fakeServer();
  registerResources(server);
  const out = await res['healthcompanion-engine'].read(new URL('healthcompanion://engine'));
  assert.match(out.contents[0].text, /HEALTH_COMPANION TILE KIT/); // buildKit orientation header
  assert.equal(out.contents[0].mimeType, 'text/markdown');
});

test('healthcompanion://dna/{name} reads a real section and lists the whole pack', async () => {
  const { server, res } = fakeServer();
  registerResources(server);

  const out = await res['healthcompanion-dna'].read(new URL('healthcompanion://dna/theme'), { name: 'theme' });
  assert.ok(out.contents[0].text.length > 100, 'theme section has real content');

  const listed = await res['healthcompanion-dna'].uriOrTemplate.listCallback({});
  const names = listed.resources.map((r: { name: string }) => r.name).sort();
  assert.deepEqual(names, listSections().map((s) => s.name).sort());
  assert.ok(listed.resources.every((r: { uri: string }) => r.uri.startsWith('healthcompanion://dna/')));
});

test('healthcompanion://dna/{name} unknown name returns a helpful list, never throws', async () => {
  const { server, res } = fakeServer();
  registerResources(server);
  const out = await res['healthcompanion-dna'].read(new URL('healthcompanion://dna/nope'), { name: 'nope' });
  assert.match(out.contents[0].text, /No DNA section "nope"/);
});

test('healthcompanion://kit/{domain} bundles the BASE pack plus the domain reference', async () => {
  const { server, res } = fakeServer();
  registerResources(server);
  const out = await res['healthcompanion-kit'].read(new URL('healthcompanion://kit/vitals'), { domain: 'vitals' });
  const text = out.contents[0].text;
  assert.match(text, /gotchas/); // BASE look/feel/voice is always present
  assert.match(text, /feature-vitals/); // the vitals-specific reference is folded in
});
