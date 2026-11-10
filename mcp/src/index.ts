#!/usr/bin/env node
// HealthCompanion MCP — stdio server.
//
// Exposes a single HealthCompanion user's data (sleep, training, nutrition, weight,
// finances, notes, durable facts) to an MCP client (Claude Code / Desktop), plus
// a `healthcompanion_daily_briefing` tool that runs the nudge engine, plus the tile
// builder (scaffold_tile / check_tile / healthcompanion_tile_kit / upload_tile). Reads
// are the default; there are also 7 WRITE tools (healthcompanion_log_weight,
// healthcompanion_log_meal, healthcompanion_log_water, healthcompanion_log_workout,
// healthcompanion_mark_supplement_taken, healthcompanion_log_business_metric, healthcompanion_add_note), each gated
// behind the mcp:write scope, so a read-only connection cannot mutate anything.
//
// The tools themselves live in src/tools.ts (transport-agnostic). This entry
// point wires them to stdio with the cached single-user session (`getDb`); the
// hosted route reuses the SAME registerTools with a per-request provider.
//
// stdout is the protocol channel — all human logging goes to stderr.

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { getDb } from './supabase.js';
import { registerTools } from './tools.js';
import { registerResources } from './resources.js';

const server = new McpServer({ name: 'healthcompanion', version: '0.1.0' });
registerTools(server, getDb);
registerResources(server); // ambient tile-engine context (dna + kits), identity-free

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[healthcompanion-mcp] ready (reads + gated writes + tile builder + engine resources). Waiting on stdio…');
}

main().catch((err) => {
  console.error('[healthcompanion-mcp] fatal:', err);
  process.exit(1);
});
