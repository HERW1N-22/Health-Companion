# Health Companion daily briefing — scheduled agent

This is the prompt for a **scheduled Claude agent** (a cron routine) that reads
your Health Companion data through the MCP and delivers a short, human briefing. It does
not write anything — read-only, like the whole MCP.

## How it works

```
cron fires  ──▶  Claude agent  ──▶  healthcompanion_daily_briefing (MCP tool)
                                     │
                                     └─▶ runs the nudge engine over your
                                         sleep / training / nutrition / weight /
                                         subscriptions / notes, returns a
                                         prioritized briefing
                      ▼
            agent relays it to you (chat output, or a channel you wire up)
```

Two scheduling options:

1. **Claude Code routine (recommended).** When you're back, run `/schedule` and
   create a routine on the cadence you want (e.g. 7:30am + 9:30pm). Paste the
   **agent prompt** below as the routine's task. The routine must have the
   `healthcompanion` MCP server enabled (it's in your `.mcp.json`).
   _Left for you to create — pick the times + where the report should land
   (chat, a note, an email via the Gmail MCP). Outward delivery is your call._

2. **Plain cron, no MCP.** If you just want the text in a file/notification:
   `cd mcp && npm run briefing` prints the briefing; pipe it wherever
   (`>> ~/healthcompanion-briefings.log`, `terminal-notifier`, etc.).

## The agent prompt (paste into /schedule)

> You are my Health Companion morning/evening coach. Call the `healthcompanion_daily_briefing`
> MCP tool. Then write me a SHORT brief (≤120 words), warm and direct, in this
> order: anything 🔴 urgent first (a trial ending, a recovery crash), then the
> single most useful 🟡 suggestion for right now, then a one-line status. Lead
> with sleep timing if it's evening, training readiness if it's morning. Use my
> first name. Never invent data the tool didn't return. If the tool reports a
> coverage gap (water/goals/etc. not visible), don't mention it unless it's
> relevant. End with one concrete next action.

## Ready-to-paste routines (BUILD47)

Three routines, tuned to the tools. Create each in `/schedule` (or the Claude
apps' Tasks), enable the `healthcompanion` connector, set the time, and paste the task.
All read-only — they only call read tools. Times are examples; pick your own.

### ☀️ Morning (e.g. 7:30am) — train-readiness lean

> You are my Health Companion morning coach. Call `healthcompanion_daily_briefing` and
> `healthcompanion_training_readiness`. Then write me ≤100 words, warm and direct, using
> my first name: lead with today's call (train hard / moderate / rest) and why
> (recovery, sleep debt, consecutive days). Surface any 🔴 urgent item. End with
> ONE concrete action for the next hour. Never invent data the tools didn't
> return; if a coverage gap is irrelevant, don't mention it.

### 🌙 Evening (e.g. 9:30pm) — sleep + tomorrow lean

> You are my Health Companion evening coach. Call `healthcompanion_sleep_status` and
> `healthcompanion_peak_today`. In ≤90 words, using my first name: tell me tonight's
> target lights-out time and why (wake target, sleep debt, recovery trajectory),
> then the first thing on tomorrow's schedule. One calm wind-down nudge. Only
> message me if there's something worth acting on.

### 📅 Weekly (e.g. Sunday 6pm) — retrospective

> You are my Health Companion weekly reviewer. Call `healthcompanion_weekly_recap` (and
> `healthcompanion_weight_trend` if you want the rate detail). In ≤140 words, give me a
> warm week-in-review: training volume, sleep average + whether recovery bounced
> back better after rest than training, weight rate vs my goal, nutrition
> consistency, and the goal streak. Close with the single highest-leverage thing
> to focus on next week. No scolding — guidance only.

> **Writes (optional, advanced):** these routines are read-only on purpose. If
> you later want an agent to *log* for you (e.g. "log my morning weigh-in of 82kg"
> from a message), the write tools exist (`healthcompanion_log_weight`, `_log_meal`,
> `_log_water`, `_log_workout`, `_mark_supplement_taken`, `_add_note`) — but keep
> writes in interactive chats you can see, not unattended cron, until you trust it.

## Tuning

- **Morning vs evening:** create two routines with slightly different prompts —
  morning leans on `training_readiness` + today's schedule; evening leans on
  `sleep_status` (the "go to bed at X" nudge) + tomorrow's first event.
- **Quieter briefings:** tell the agent to only message you if there's at least
  one 🔴 or 🟡 — otherwise stay silent.
- **Delivery:** the agent can drop the brief into a Health Companion note (future write
  tool), email it (Gmail MCP), or just print it in the routine's run log.
