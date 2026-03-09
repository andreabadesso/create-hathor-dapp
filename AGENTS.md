# AGENTS.md — CLI Tool (create-hathor-dapp)

This repo is a scaffolding CLI. Running `npx create-hathor-dapp my-app` copies the template into a new project.

## Structure

```
create-hathor-dapp/
├── bin/index.mjs               # CLI entry point (zero dependencies)
├── templates/default/          # The dApp template (copied to user's project)
│   ├── AGENTS.md               # ← LLM instructions for building dApps
│   └── ...                     # Full Next.js app with Hathor integration
├── package.json                # CLI package (bin, files whitelist)
└── README.md                   # Usage docs
```

## Working on the CLI (`bin/index.mjs`)

The CLI uses only Node.js built-ins (no dependencies):
- `fs.cpSync` for recursive template copy
- `readline/promises` for interactive prompts
- Runs `npm install` and `git init` in the scaffolded project

## Working on the Template (`templates/default/`)

See `templates/default/AGENTS.md` for full instructions on the dApp template itself.

Key points:
- `.gitignore` is stored as `gitignore` (no dot) — npm strips `.gitignore` from published packages. The CLI renames it after copying.
- `package-lock.json` is NOT included — generated fresh by `npm install` during scaffolding.
- The template's `package.json` has `name: "hathor-dapp"` as a placeholder — the CLI replaces it with the user's project name.

## Testing

Test the CLI locally:
```bash
node bin/index.mjs test-app
cd test-app && npm run dev
```
