# AGENT INSTRUCTIONS

## 0. About this file

This file is the **procedural source of truth** for any AI agent or human engineer working on
the **Challenger Page** platform. It establishes:

- What `/main-docs/` contains and what each folder/file is for.
- Who can read and write what.
- The conventions for initiating, executing, and completing an implementation stage.
- The conventions for stage-specific init prompts.
- How decisions, tasks, and project state are recorded.

If something in this file contradicts `challenger-page-prd.md`
(the technical source of truth), treat this file as authoritative on *procedure* and `challenger-page-prd.md` as authoritative on *system and functional behavior*, then write a `memory/decisions/` entry reconciling the contradiction.

## 1. Folder layout — the canonical inventory
AGENTS.md <-- you are here (procedural rules)
main-docs/
├── challenger-page-prd.md <-- technical source of truth; full project spec
├── prompts/ <-- READ-ONLY (humans write, agents execute)
│ ├── stage-1-init-prompt.md <-- Stage 1 entry point
│ ├── stage-2-init-prompt.md <-- Stage 2 entry point
│ ├── stage-3-init-prompt.md <-- Stage 3 entry point
│ ├── stage-4-init-prompt.md <-- Stage 4 entry point
│ └── stage-5-init-prompt.md <-- Stage 5 entry point (archived upon completion)
└── memory/ <-- READ + WRITE permitted (agents maintain)
├── running-doc.md <-- current project state; update on prompt completion
├── decisions/ <-- one .md per major project architecture decision
└── tasks/ <-- working scratchpad for next-action items


**`prompts/` is read-only.** When a stage's work is complete, its prompt file stays in `prompts/` as an archive of what was executed. New stage prompts are written **into `prompts/` by the human operator**, never by an agent.

## 2. File responsibilities

| File / folder | Source of truth for | Read by | Writable by |
|---|---|---|---|
| `AGENTS.md` | procedure, permissions, layout | always | humans (rarely) |
| `challenger-page-prd.md` | technical application behavior & PRD specs | always | humans (rarely) |
| `prompts/stage-N-init-prompt.md` | the *current* stage's scope, inputs, outputs, DoD | the agent executing stage N | humans only |
| `memory/running-doc.md` | current project state across all stages | always | the agent finishing a stage |
| `memory/decisions/` | archived architectural choices overriding/amending the PRD | any agent about to make a related choice | any agent, when a non-obvious decision is made |
| `memory/tasks/` | short-lived next-action items | the agent currently working | the agent currently working |

## 3. State conventions

### 3.1 `running-doc.md`
- **Always up to date.** When you finish a stage, you update `running-doc.md` before stopping. Period. If `running-doc.md` is stale at the start of a new stage prompt, that is itself a finding the new agent must record and resolve.
- The "Authority reminder" block at the top must list every active
  override of `DropPitch_AI_PRD.md`, linked to its `memory/decisions/` entry.
- A "Files implemented vs planned" table is mandatory.
- A "Known limitations / TODOs" section is mandatory.

### 3.2 `memory/decisions/`
- One `.md` file per decision, named `YYYY-MM-DD-[decision-topic].md`.
- Decisions are written when **a non-obvious architectural choice is made** that contradicts, supplements, or supersedes `challenger-page-prd.md` or a prior prompt. Examples of valid decision filenames for this project:
  - `YYYY-MM-DD-audio-buffer-inline-vs-cloud-storage.md` — memory limits on Cloud Run vs direct base64.
  - `YYYY-MM-DD-wavesurfer-ssr-hydration-handling.md` — React dynamic import for client-only audio canvas.
  - `YYYY-MM-DD-spotify-pitch-truncation-safety.md` — deterministic token limit checks for 500 characters.
- A new agent making a related choice must link to (not re-litigate) the existing decision file. If the existing decision must change, write a new decision file that *cites* the old one and *reverses* it explicitly.

### 3.3 `memory/tasks/`
- Working scratchpad. Move completed items out (or mark them done) so the folder doesn't accumulate noise.
- Items here are ephemeral. Anything that survives more than one stage must be promoted to a `memory/decisions/` file.

## 4. Stage execution loop

For any active stage, the loop is:

1. **Read the pre-flight list at the top of `prompts/stage-N-init-prompt.md`.** This includes `AGENTS.md`, `challenger-page-prd.md` (Stage N section), all prior stage prompts,
   all decisions in `memory/decisions/`, and `memory/running-doc.md`.
2. **Confirm the stage in flight matches `memory/running-doc.md`.** If `running-doc.md` says Stage N is the active stage but the prompt opened says Stage M,
   stop and ask the human operator.
3. **Build the stage** per the prompt's inputs, outputs, Definition of Done (DoD), and "out of scope" sections.
4. **Run the verification checklist** specified at the bottom of the prompt.
5. **Update `memory/running-doc.md`** before stopping. The "Authority reminder” and "Decisions" sections must reference any new `memory/decisions/` files written during the stage.
6. **Stop.** Do not start the next stage until prompted by the human operator.

## 5. Stage init prompts — conventions

- One file per stage: `prompts/stage-N-init-prompt.md`.
- The prompt is the **canonical entry point** for that stage's work. If an agent reads `DropPitch_AI_PRD.md` and the prompt for the same stage, and they disagree, the prompt wins for *scope* (acceptance criteria, out-of-scope items) and the PRD wins for *technical behavior* (what the system is supposed to accomplish in the abstract).
- The prompt's pre-flight list must include `AGENTS.md` so future agents stay consistent with the procedure here.
- The prompt's "Reference" section must link to every active `memory/decisions/` entry that affects the stage.
- **Prompts are written by humans.** Agents do NOT write stage init
  prompts. If you, the agent, discover that a stage's prompt is missing or stale, the correct action is to flag it back to the operator — not to draft a replacement.

## 6. Cross-document rule of precedence (tie-breaks)

When two documents disagree, precedence is:

1. Active `memory/decisions/` files override everything.
2. The `prompts/stage-N-init-prompt.md` overrides the PRD for that stage’s scope, inputs, outputs, and DoD.
3. `challenger-page-prd.md` overrides everything else for technical system and functional behavior.
4. `AGENTS.md` (this file) overrides everything else for procedure.
5. `memory/running-doc.md` is descriptive, not prescriptive — it does not override anything; it summarizes current state.

If two documents in the same precedence level disagree, write a
`memory/decisions/` file declaring which one wins and why.

## 7. Reference

- Technical source of truth: `challenger-page-prd.md`
- Currently active prompt: `prompts/stage-N-init-prompt.md` (where N is the current stage per `memory/running-doc.md`)
- Current project state: `memory/running-doc.md`
- Architectural decisions: `memory/decisions/`
- Open tasks: `memory/tasks/`

## 8. Markdown Search & Token Efficiency Convention

To preserve agent context windows, prevent runaway token consumption, and avoid polluting agent scratchpads with multi-megabyte raw text streams:

- **Agents MUST prefer using `qmd` (quick markdown search) to query, index, or retrieve information across `.md` files in `/main-docs/` instead of executing broad recursive `grep` or `glob` commands.**
- Use `qmd` with targeted keyword queries (e.g., `qmd search "spotifyPitch"` or `qmd section "Auth & Billing"`) to read only the specific sections required for the active task.
- Only fall back to `grep` if `qmd` is unavailable in the environment, and always constrain grep searches to explicit file paths rather than root directory scans.