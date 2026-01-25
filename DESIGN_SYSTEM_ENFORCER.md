# Design System Enforcer (Guardrails Agent)

## Purpose

The Design System Enforcer prevents regressions and layout drift by automatically scanning your codebase for design system violations. It acts as a quality gate to ensure consistency across the application.

## What It Checks

### 1. Negative Margins ❌
**Violation:** Any negative margin utilities (e.g., `-m-4`, `-ml-2`)
**Why:** Negative margins can cause layout issues and break the design system's spacing consistency.
**Fix:** Use positive spacing, flexbox gap, or grid gap instead.

### 2. Off-Grid Spacing ❌
**Violation:** Spacing values not on the 8px baseline grid (e.g., `pl-28`, `pt-13`)
**Approved Values:** `0`, `0.5`, `1`, `1.5`, `2`, `3`, `4`, `5`, `6`, `8`, `10`, `12`, `16`, `20`
**Why:** The design system uses an 8px baseline grid for consistent spacing.
**Fix:** Use the nearest approved spacing value.

### 3. Container Max-Width Mismatches ❌
**Violation:** Main content containers using max-width values other than `max-w-7xl`
**Standard:** `max-w-7xl` (1280px) or `container-custom` utility class
**Note:** Forms, auth pages, modals, and error pages are allowed to use smaller max-widths (e.g., `max-w-md`, `max-w-2xl`)
**Why:** Consistent container widths maintain visual hierarchy and layout consistency for main content.
**Fix:** Use `max-w-7xl` or the `container-custom` utility class for main content containers.

### 4. Negative Transforms ❌
**Violation:** Negative transform values (e.g., `-translate-x-4`)
**Why:** Negative transforms can cause layout issues and are harder to maintain.
**Fix:** Use flexbox/grid positioning or positive transforms.

### 5. Mobile Stacking Violations ❌
**Violation:** Grids that don't start with `grid-cols-1` (mobile-first)
**Standard:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
**Why:** Mobile-first design ensures proper stacking on small screens.
**Fix:** Always start grids with `grid-cols-1` for mobile.

## Usage

### Run on All Default Directories
```bash
npm run design-check
```
Scans `app/` and `components/` directories.

### Run on Specific Directory
```bash
npm run design-check:app
npm run design-check:components
```

### Run on Custom Directories
```bash
node scripts/design-system-enforcer.js app components lib
```

## Output

The enforcer provides:
- ✅ **Success message** if no violations found
- ❌ **Detailed report** grouped by violation type
- 📄 **File path and line number** for each violation
- 💡 **Suggested fix** for each violation
- 📊 **Summary** of violations by type

### Example Output

```
🔍 Design System Enforcer - Scanning for violations...

📁 Scanning 45 files...

❌ Found 3 violation(s):

📋 OFF_GRID_SPACING (2 violation(s)):
────────────────────────────────────────────────────────────────────────────────

  📄 app/products/page.tsx:42
     Value: pl-28
     💡 Fix: Replace with pl-16 (on 8px grid). Approved values: 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20

  📄 components/ui/Card.tsx:15
     Value: pt-13
     💡 Fix: Replace with pt-12 (on 8px grid). Approved values: 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20

📋 CONTAINER_MAX_WIDTH_MISMATCH (1 violation(s)):
────────────────────────────────────────────────────────────────────────────────

  📄 app/vendors/page.tsx:28
     Value: max-w-6xl
     💡 Fix: Use max-w-7xl for containers (or container-custom utility class). Found: max-w-6xl

📊 Summary:
   Total violations: 3
   OFF_GRID_SPACING: 2
   CONTAINER_MAX_WIDTH_MISMATCH: 1
```

## Integration

### Pre-commit Hook (Recommended)
Add to `.husky/pre-commit` or use `lint-staged`:

```bash
npm run design-check
```

### CI/CD Pipeline
Add to your CI workflow to fail builds on violations:

```yaml
# .github/workflows/ci.yml
- name: Check Design System
  run: npm run design-check
```

### VS Code Task
Add to `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Design System Check",
      "type": "shell",
      "command": "npm run design-check",
      "problemMatcher": []
    }
  ]
}
```

## Design System Rules Reference

### Spacing (8px Grid)
- `0` = 0px (no spacing)
- `0.5` = 4px
- `1` = 8px
- `1.5` = 12px
- `2` = 16px
- `3` = 24px
- `4` = 32px
- `5` = 40px
- `6` = 48px
- `8` = 64px
- `10` = 80px
- `12` = 96px
- `16` = 128px
- `20` = 160px

### Container Standards
- **Max Width:** `max-w-7xl` (1280px)
- **Utility Class:** `container-custom`
- **Padding:** `px-3 sm:px-4 lg:px-6`

### Grid Patterns
- **Products:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- **Vendors:** `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- **Gap:** `gap-6` (24px)

## Best Practices

1. **Run Before Committing:** Catch violations early
2. **Fix Immediately:** Don't accumulate violations
3. **Review Suggestions:** The enforcer suggests fixes, but review for context
4. **Document Exceptions:** If a violation is intentional, document why

## Troubleshooting

### False Positives
If the enforcer flags something that's intentional:
1. Review the suggestion
2. Consider if the design system rule should be updated
3. Document the exception in code comments

### Performance
The enforcer scans files synchronously. For large codebases:
- Run on specific directories
- Use in CI/CD rather than on every save
- Consider caching results

## Contributing

To add new checks, edit `scripts/design-system-enforcer.js`:
1. Add a new check method (e.g., `checkNewRule`)
2. Call it in `scanFile`
3. Update this documentation

---

**Remember:** The enforcer suggests fixes but does not redesign. Always review suggestions in context.

