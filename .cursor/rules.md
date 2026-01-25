# Asia Insights AI Agent Rules

**Purpose**: Non-negotiable structural, architectural, and behavioural guardrails for all AI agents working on this codebase.

**Authority**: These rules override any assumptions, "helpful improvements," or refactoring suggestions. When in conflict, these rules take precedence.

---

## 1. Project Identity

**Asia Insights** is the master platform and homepage hub. It is NOT a collection of separate products.

**Markets** is a section within Asia Insights, accessed via `/markets/*`. It is NOT a standalone product.

**Sunday Market** is the implementation name for the Markets section. All Sunday Market code lives inside `/markets` routes.

**DO NOT**:
- Treat Markets as independent from Asia Insights
- Create separate branding or identity for Markets
- Suggest splitting Markets into a separate application
- Refer to "Sunday Market" as the primary product name

---

## 2. Structural Guardrails (DO NOT BREAK)

### Explicitly FORBIDDEN Actions

AI agents **MUST NOT**:

- **Change the site hierarchy** - The six-section structure (Markets, Property, Community, Business, Lifestyle, Resources) is fixed
- **Collapse or merge sections** - Each section maintains independent boundaries
- **Move Markets outside `/markets`** - Markets routes must remain under `/markets/*`
- **Introduce subdomains** - No subdomain architecture without explicit written instruction
- **Rename core sections** - Markets, Property, Community, Business, Lifestyle, Resources are fixed names
- **Change routing assumptions** - URL structures documented in `ASIA_INSIGHTS_SITE_STRUCTURE_PROPOSAL.md` are authoritative
- **Create cross-section dependencies** - Sections remain independent unless explicitly documented
- **Modify section boundaries** - Each section's scope is defined and fixed

### What This Means

If a change would:
- Move routes between sections
- Combine section functionality
- Create dependencies between sections
- Change the fundamental structure

**STOP. DO NOT PROCEED. FLAG THE REQUEST.**

---

## 3. Documentation Authority

### Document Precedence

1. **Backup Files** (`*_BACKUP_*.md`)
   - Status: **READ-ONLY**
   - Purpose: Authoritative rollback points
   - Action: **NEVER MODIFY**
   - If backup is needed: Create new backup, do not edit existing

2. **Working Documents** (`ASIA_INSIGHTS_SITE_STRUCTURE_PROPOSAL.md`)
   - Status: **EDITABLE BUT CONSTRAINED**
   - Purpose: Active planning and iteration
   - Action: May add comments, proposals, clarifications
   - Constraint: Must preserve original structure and hierarchy

3. **Code Implementation**
   - Status: **MUST FOLLOW DOCUMENTATION**
   - Purpose: Implementation of documented structure
   - Action: Code reflects documentation, not reinterpretation
   - Constraint: If documentation says `/markets/*`, code uses `/markets/*`

### Rule of Thumb

**Documentation defines structure. Code implements structure. Code does NOT redefine structure.**

---

## 4. Editing Rules

### What AI Agents MAY Do

- Add comments and annotations to code
- Propose structural changes in documentation (marked as proposals)
- Add clarifications and examples
- Suggest improvements (as proposals, not implementations)
- Add TODO comments when unsure

### What AI Agents MUST Do

- **Propose structural changes before implementing** - No structural changes without explicit approval
- **Preserve section independence** - Each section remains self-contained
- **Follow documented routing** - Use routes as documented, do not invent new patterns
- **Respect backup files** - Never modify backup files, even if they seem outdated

### What AI Agents MUST NOT Do

- **"Helpful refactors"** - Do not refactor code "while you're here"
- **Scope creep** - Do not add features beyond the explicit request
- **Structural assumptions** - Do not assume structure can be improved
- **Delete without justification** - Every deletion requires explicit reason and comment
- **Modify backups** - Backup files are immutable rollback points

---

## 5. Markets-Specific Rules

### Markets Section Ownership

**Vendors, sellers, and market days belong ONLY to Markets.**

- Vendor/seller data tables are Markets-specific
- Market day schedules are Markets-specific
- Product catalogs are Markets-specific
- Order management is Markets-specific

### Cross-Section Boundaries

**Other sections MUST NOT:**
- Reuse Markets tables (vendors, products, market_days)
- Share business logic with Markets
- Access Markets-specific data
- Depend on Markets functionality

**Shared components ARE allowed:**
- UI components (buttons, cards, forms)
- Utility functions (date formatting, validation)
- Design system elements
- Infrastructure (auth, storage, database connection)

**Shared responsibility is NOT allowed:**
- Business logic specific to Markets
- Data models specific to Markets
- Workflows specific to Markets

### Rule of Thumb

**If it's about vendors, sellers, products, or market days, it belongs to Markets. Other sections create their own equivalents.**

---

## 6. Safety Behaviour

### When Unsure

**If an AI agent is uncertain about:**
- Whether a change affects structure
- Whether a change crosses section boundaries
- Whether a change requires documentation update
- Whether a change is safe

**Action**: Leave a TODO comment with:
- What the uncertainty is
- Why it's uncertain
- What information is needed
- Where to find relevant documentation

**DO NOT**: Proceed with assumptions. DO NOT: Make "safe" guesses.

### Change Philosophy

**Prefer additive changes over destructive ones:**
- Add new code rather than modifying existing
- Extend functionality rather than replacing
- Create new routes rather than changing existing
- Add new sections rather than merging existing

**Never delete without:**
- Explicit justification in comments
- Reference to why deletion is necessary
- Confirmation that deletion doesn't break structure
- Documentation of what was removed and why

**Never modify backups:**
- Backup files are historical records
- If a new backup is needed, create a new file
- Do not "update" existing backups

---

## 7. Code vs Documentation Consistency

### Documentation is Source of Truth

If code and documentation conflict:
- **Documentation wins**
- Update code to match documentation
- Do NOT update documentation to match code (unless explicitly instructed)

### Implementation Must Follow Structure

If documentation says:
- Markets is at `/markets/*` → Code must use `/markets/*`
- Sections are independent → Code must maintain independence
- Markets owns vendors → Code must not share vendor logic with other sections

**Code does NOT get to reinterpret the structure.**

---

## 8. Request Interpretation

### Explicit Instructions

When user says:
- "Add a feature to Markets" → Add to Markets section only
- "Create a new section" → Follow documented section structure
- "Modify routing" → Check documentation first, flag if it changes structure
- "Refactor code" → Check if refactor affects structure, flag if yes

### Implicit Assumptions (DO NOT MAKE)

**DO NOT assume:**
- "This would be better as..." → Flag as proposal, do not implement
- "We should probably..." → Flag as suggestion, do not implement
- "It makes sense to..." → Flag as proposal, do not implement

**DO assume:**
- User requests are explicit and complete
- Structure is fixed unless explicitly changed
- Documentation is authoritative
- Backups are immutable

---

## 9. Violation Consequences

If an AI agent violates these rules:

1. **Stop immediately** - Do not continue with the violating change
2. **Revert if possible** - Undo the violating change
3. **Flag the violation** - Document what was attempted and why it violated rules
4. **Consult documentation** - Review relevant documentation files
5. **Propose correct approach** - Suggest the correct way to achieve the goal

---

## 10. Quick Reference: Decision Tree

```
User Request Received
│
├─ Does it change site hierarchy?
│  └─ YES → STOP. Flag as structural change requiring approval.
│
├─ Does it modify section boundaries?
│  └─ YES → STOP. Flag as structural change requiring approval.
│
├─ Does it move Markets outside /markets?
│  └─ YES → STOP. This violates core structure.
│
├─ Does it modify a backup file?
│  └─ YES → STOP. Backups are read-only.
│
├─ Does it share Markets data/logic with other sections?
│  └─ YES → STOP. Markets maintains independence.
│
├─ Does it require routing changes?
│  └─ YES → Check documentation. Flag if it changes documented structure.
│
└─ Proceed with implementation, following documented structure.
```

---

## Summary

**These rules exist to prevent:**
- Accidental structural changes
- Scope creep and "helpful" refactors
- Cross-section dependencies
- Documentation drift
- Loss of rollback points

**These rules ensure:**
- Structure remains stable
- Sections remain independent
- Documentation remains authoritative
- Changes are explicit and approved
- Rollback points are preserved

**When in doubt: Flag, don't assume. Propose, don't implement. Preserve, don't refactor.**


