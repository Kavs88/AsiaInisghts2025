# AI Project Context

**Purpose**: This file provides essential context for AI agents working on this codebase. Read this before making changes.

## 1. Project Overview

**Sunday Market** is a vendor-driven marketplace platform where:
- Vendors (sellers) list their products and services
- Customers browse vendors and products, add items to cart, and place orders via messaging (WhatsApp/Zalo/Email)
- Admins manage vendors, products, market days, and orders
- Super users have final authority and full system access

**Technical Stack**: Next.js 14, React, TypeScript, Tailwind CSS, Supabase (PostgreSQL + Storage)

**Status**: Production-ready, mobile-first, layout-stabilised (A- assessment, 90/100)

## 2. Roles & Authority Model

### Vendor
- Can edit own profile via vendor dashboard
- Changes often go through change request workflow (not always immediate)
- Limited to own data only
- Cannot access admin interfaces

### Admin
- Can edit vendor data directly (no change request workflow)
- Can manage products, market days, orders
- Has access to admin dashboard and interfaces
- Cannot access super user-only features

### Super User
- Full control over all data (vendors, market days, products, orders)
- Final authority on all decisions
- May bypass normal workflows when needed
- Can override vendor restrictions
- Implemented via `super_users` table and `is_super_user()` function

**Important**: UI inconsistencies between roles are **intentional** unless explicitly stated otherwise. Different roles have different capabilities and workflows by design.

## 3. Stability First Principle

**The layout and core UI are stabilised. Prevent regressions over optimisation.**

### What This Means
- Layout robustness has been achieved through careful fixes
- Mobile button overlaps, text overflow, sticky positioning, and z-index conflicts have been resolved
- Touch targets meet WCAG 44px minimum
- Container overflow rules are documented and critical

### What NOT to Do
- Do NOT refactor working components unless explicitly requested
- Do NOT change global container behavior (`container-custom` overflow rules)
- Do NOT modify z-index values without checking the documented scale
- Do NOT remove truncation/line-clamp classes
- Do NOT change sticky positioning offsets
- Do NOT move elements that are intentionally outside containers

### What TO Do
- Make minimal, surgical changes
- Preserve existing layout patterns
- Test on mobile (320px-375px) after any UI changes
- Consult guardrail files before touching high-risk components

## 4. How AI Should Think When Making Changes

### Prefer Minimal Changes
- Make the smallest change that achieves the goal
- Avoid "while I'm here" improvements
- Don't refactor code that works

### Avoid Global Changes
- Don't change global CSS classes or utilities
- Don't modify shared components without understanding impact
- Don't update multiple files for a single feature

### Ask Before Restructuring
- If a change requires restructuring, ask first
- If unsure about approach, propose options
- If a change affects multiple user types, flag it

### Flag Risks Instead of Auto-Fixing
- If you see a potential issue, document it rather than fixing it
- If a change might break something, warn before proceeding
- If stability is at risk, stop and ask

## 5. When to STOP and Ask

**Stop and ask the user before proceeding if the change involves:**

### Layout Changes
- Modifying container widths or constraints
- Changing flex/grid layouts
- Adjusting spacing or padding that affects multiple components
- Moving elements between containers

### Permission Logic Changes
- Modifying RLS policies
- Changing role checks (`isAdmin()`, `isSuperUser()`, etc.)
- Updating access control logic
- Adding or removing permission checks

### Role Capability Changes
- Adding new features to a role
- Removing capabilities from a role
- Changing how roles interact with data
- Modifying role-specific workflows

### Multi-User-Type Impact
- Changes that affect vendors, admins, and super users differently
- Changes that might break one role's workflow
- Changes that require coordination across role boundaries

### High-Risk Components
- Components listed in `REGRESSION_GUARDRAILS.md`
- Components with guardrail comments in code
- Components that handle overflow, sticky positioning, or z-index

## 6. Relationship to Other Guardrail Files

### CURSOR_SAFETY_RULES.md
**Consult when**: You need to understand general coding standards, patterns, or safety rules for this project.

**Contains**: General project safety rules, coding patterns, and standards.

### REGRESSION_GUARDRAILS.md
**Consult when**: You're working on or near components that are fragile or high-risk.

**Contains**: 
- List of 7 high-risk components
- Why each component is fragile
- What must NOT be changed
- Testing checklists for each component

**Use this before**: Modifying Header, VendorCard, VendorStripe, vendor profile pages, admin forms, or any component with guardrail comments.

### This File (AI_PROJECT_CONTEXT.md)
**Purpose**: High-level context about project nature, roles, and stability principles.

**Use this**: Before starting any work to understand the project's priorities and constraints.

## Quick Reference: Decision Tree

```
Making a change?
├─ Does it affect layout/UI?
│  ├─ YES → Check REGRESSION_GUARDRAILS.md
│  └─ NO → Continue
├─ Does it change permissions/roles?
│  ├─ YES → STOP and ask
│  └─ NO → Continue
├─ Does it affect multiple user types?
│  ├─ YES → STOP and ask
│  └─ NO → Continue
├─ Is it a high-risk component?
│  ├─ YES → Check REGRESSION_GUARDRAILS.md, then STOP and ask
│  └─ NO → Continue
└─ Proceed with minimal, surgical change
```

## Remember

- **Stability > Optimization**
- **Minimal > Comprehensive**
- **Ask > Assume**
- **Document > Fix**

When in doubt, ask. When unsure, flag. When risky, stop.


