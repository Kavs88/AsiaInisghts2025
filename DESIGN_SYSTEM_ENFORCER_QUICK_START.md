# Design System Enforcer - Quick Start

## What It Does

The Design System Enforcer is your quality gate that prevents design regressions by automatically checking for:

- ❌ **Negative margins** (e.g., `-m-4`)
- ❌ **Off-grid spacing** (e.g., `pl-28` - not on 8px grid)
- ❌ **Container width mismatches** (main containers should use `max-w-7xl`)
- ❌ **Negative transforms** (e.g., `-translate-x-4`)
- ❌ **Mobile stacking violations** (grids must start with `grid-cols-1`)

## Quick Usage

```bash
# Check all default directories (app, components)
npm run design-check

# Check specific directory
npm run design-check:app
npm run design-check:components

# Custom directories
node scripts/design-system-enforcer.js app components lib
```

## Example Output

```
🔍 Design System Enforcer - Scanning for violations...

📁 Scanning 82 files...

❌ Found 3 violation(s):

📋 OFF_GRID_SPACING (2 violation(s)):
────────────────────────────────────────────────────────────────────────────────

  📄 app/products/page.tsx:42
     Value: pl-28
     💡 Fix: Replace with pl-16 (on 8px grid). Approved values: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20
```

## Integration

### Pre-commit (Recommended)
Add to `.husky/pre-commit`:
```bash
npm run design-check
```

### CI/CD
Add to your CI workflow:
```yaml
- name: Check Design System
  run: npm run design-check
```

## Files Created

- `scripts/design-system-enforcer.js` - Main enforcer script
- `scripts/design-system-enforcer.ts` - TypeScript version (optional)
- `DESIGN_SYSTEM_ENFORCER.md` - Full documentation
- `DESIGN_SYSTEM_ENFORCER_QUICK_START.md` - This file

## Design System Rules

- **Spacing:** Must be on 8px grid: `0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20`
- **Containers:** Main content uses `max-w-7xl` or `container-custom`
- **Grids:** Must start with `grid-cols-1` (mobile-first)
- **No negatives:** Avoid negative margins and transforms

---

**Remember:** The enforcer suggests fixes but does not redesign. Always review suggestions in context.


