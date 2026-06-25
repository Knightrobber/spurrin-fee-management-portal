# Fee Portal Wireframe — status & gaps

## How to run

Node isn't installed system-wide on this machine. A local copy was installed at
`~/.local/node-v24.18.0-darwin-arm64`. To run:

```bash
export PATH="$HOME/.local/node-v24.18.0-darwin-arm64/bin:$PATH"
cd "frontend/Fee Portal MVP Wireframe"
npm install      # already done once
npm run dev      # serves http://localhost:5173
```

To make `node`/`npm` permanent, add the `export PATH=...` line to `~/.zshrc`
(or install Node via nvm/Homebrew instead).

## What was done

- **Login screen added** (`components/auth/Login.tsx`) — single login that lands each
  persona on their default page, with a demo persona picker and a Sign out action in the shell.
- **Every dead-end button is now wired:**
  - Student: Download breakup (CSV), Download receipt (per row), View fee structure (dialog), clickable upcoming-term rows.
  - Admin: Mark dropped out (confirm dialog + status flip), Attach add-on (multi-select dialog), Remove add-on (live list update), Extend deadline (shared dialog, also from the Outstanding-dues worklist), More filters.
  - Finance: New add-on (full create dialog matching §7.3 — recurring / amount / apply-mode / days-to-clear / approval + approver), Edit & View detail on fee structures, Export CSV (real download).
- Verified: all edited files compile through Vite and the dev server serves HTTP 200.

## Gaps vs. the requirements doc (not yet built)

These screens are named in the requirements (§8) but have no UI yet. They're scoped, not blocking — flagging for a decision on what to build next:

1. **Finance → Student information** (§8.3) and **Finance → Outstanding dues** (§8.3, record payments from the worklist). Today only Admin has the student list / dues worklist; Finance nav has neither. The components (`AdminStudents`, `OutstandingDues`) are reusable but currently wired Admin-only (the student list has an "Enroll" button that's Admin-specific).
2. **Finance Approver → Student information** (§8.4, read-only search/view). Approver nav has only Approvals + Reports.
3. **Admin → Extensions & requests** (§8.2) — tracking status of raised extension requests, and batch extensions. Single-student extend works; the tracking/batch view doesn't exist.
4. **Re-enroll** tab collects student + failed term but doesn't show the regenerated fee preview.
5. Everything is **mock/local state** — actions show toasts and update in-memory state but don't persist or talk to a backend (expected for a wireframe). E.g. enrolling a student doesn't add them to the list.

## Known intentionally-future items (per §13, correctly omitted)

Online payments, partial payments, percentage discounts, notifications, fee-structure
versioning, report authoring, custom roles. The UI already labels these "coming soon" where relevant.
