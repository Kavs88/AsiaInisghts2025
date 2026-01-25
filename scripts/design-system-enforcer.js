#!/usr/bin/env node

/**
 * Design System Enforcer (Guardrails Agent)
 * 
 * Purpose: Prevent regressions and layout drift
 * 
 * This script enforces the design system strictly by:
 * - Flagging negative margins
 * - Catching off-grid spacing (e.g., pl-28)
 * - Verifying max-width consistency
 * - Flagging negative transforms
 * - Validating mobile stacking rules
 */

const fs = require('fs');
const path = require('path');

// Design System Rules
const APPROVED_SPACING_VALUES = ['0.5', '1', '1.5', '2', '3', '4', '5', '6', '8', '10', '12', '16', '20'];
const APPROVED_CONTAINER_MAX_WIDTHS = ['max-w-7xl']; // Only max-w-7xl is approved for containers
const SPACING_PATTERNS = ['m', 'p', 'mt', 'mr', 'mb', 'ml', 'mx', 'my', 'pt', 'pr', 'pb', 'pl', 'px', 'py', 'gap', 'space-x', 'space-y'];
const BREAKPOINTS = ['sm', 'md', 'lg', 'xl', '2xl'];

class DesignSystemEnforcer {
  constructor() {
    this.violations = [];
  }

  /**
   * Check if a spacing value is on the 8px grid
   */
  isOnGrid(value) {
    // Allow 0 (zero spacing is valid)
    if (value === '0') return true;
    return APPROVED_SPACING_VALUES.includes(value);
  }

  /**
   * Find the nearest approved spacing value
   */
  suggestSpacing(value) {
    const num = parseFloat(value);
    if (isNaN(num)) return '?';
    
    // 0 is valid, return it
    if (num === 0) return '0';
    
    // Find closest approved value
    const approved = APPROVED_SPACING_VALUES.map(v => parseFloat(v));
    const closest = approved.reduce((prev, curr) => 
      Math.abs(curr - num) < Math.abs(prev - num) ? curr : prev
    );
    
    return closest.toString();
  }

  /**
   * Check for negative margins
   */
  checkNegativeMargins(content, file) {
    const lines = content.split('\n');
    const negativeMarginPattern = /-m[xytrbl]?-\d+|margin:\s*-\d+/g;
    
    lines.forEach((line, index) => {
      const matches = line.match(negativeMarginPattern);
      if (matches) {
        matches.forEach(match => {
          this.violations.push({
            file,
            line: index + 1,
            type: 'NEGATIVE_MARGIN',
            value: match,
            suggestion: `Remove negative margin. Use positive spacing or flexbox/grid gap instead.`
          });
        });
      }
    });
  }

  /**
   * Check for negative transforms
   */
  checkNegativeTransforms(content, file) {
    const lines = content.split('\n');
    const negativeTransformPattern = /-translate-[xy]-\d+|transform:\s*translate[XY]?\(-\d+/g;
    
    lines.forEach((line, index) => {
      const matches = line.match(negativeTransformPattern);
      if (matches) {
        matches.forEach(match => {
          this.violations.push({
            file,
            line: index + 1,
            type: 'NEGATIVE_TRANSFORM',
            value: match,
            suggestion: `Avoid negative transforms. Use flexbox/grid positioning or positive transforms instead.`
          });
        });
      }
    });
  }

  /**
   * Check for off-grid spacing values
   */
  checkOffGridSpacing(content, file) {
    const lines = content.split('\n');
    const spacingPattern = new RegExp(
      `(${SPACING_PATTERNS.join('|')})-(${BREAKPOINTS.join('|')}:)?(\\d+(?:\\.\\d+)?)`,
      'g'
    );
    
    lines.forEach((line, index) => {
      let match;
      const lineCopy = line; // Create a copy for regex matching
      
      while ((match = spacingPattern.exec(lineCopy)) !== null) {
        const [fullMatch, property, breakpoint, value] = match;
        
        // Skip if it's a breakpoint-specific value (we'll check base values)
        if (breakpoint) continue;
        
        if (!this.isOnGrid(value)) {
          const suggested = this.suggestSpacing(value);
          // Don't suggest 0.5 for 0 - 0 is valid
          const finalSuggestion = value === '0' ? '0' : suggested;
          this.violations.push({
            file,
            line: index + 1,
            type: 'OFF_GRID_SPACING',
            value: fullMatch,
            suggestion: `Replace with ${property}-${finalSuggestion} (on 8px grid). Approved values: 0, ${APPROVED_SPACING_VALUES.join(', ')}`
          });
        }
      }
    });
  }

  /**
   * Check for inconsistent max-width values
   */
  checkMaxWidth(content, file) {
    const lines = content.split('\n');
    const maxWidthPattern = /max-w-(?:screen-)?(?:xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|full|none|\d+)/g;
    
    // Files/paths where smaller max-widths are acceptable (forms, auth, modals, etc.)
    const allowedSmallMaxWidth = /(auth|login|signup|reset-password|forgot-password|error|not-found|modal|drawer|dialog)/i;
    const isAllowedContext = allowedSmallMaxWidth.test(file);
    
    lines.forEach((line, index) => {
      const matches = line.match(maxWidthPattern);
      if (matches) {
        matches.forEach(match => {
          // Allow max-w-7xl, max-w-full, max-w-none for all contexts
          if (!match.includes('max-w-7xl') && !match.includes('max-w-full') && !match.includes('max-w-none')) {
            // Check if it's in a main container context (not forms/auth)
            const isMainContainer = (line.includes('container') || 
                                    (line.includes('className') && line.includes('max-w'))) &&
                                    !isAllowedContext;
            
            // Only flag if it's clearly a main content container, not a form/auth page
            if (isMainContainer) {
              this.violations.push({
                file,
                line: index + 1,
                type: 'CONTAINER_MAX_WIDTH_MISMATCH',
                value: match,
                suggestion: `Use max-w-7xl for main content containers (or container-custom utility class). Found: ${match}`
              });
            }
          }
        });
      }
    });
  }

  /**
   * Check mobile stacking rules (grids should start with grid-cols-1)
   */
  checkMobileStacking(content, file) {
    const lines = content.split('\n');
    const gridColsPattern = /grid-cols-(?:sm|md|lg|xl|2xl:)?(\d+)/g;
    
    lines.forEach((line, index) => {
      // Check for grid definitions
      if (line.includes('grid') && line.includes('grid-cols')) {
        const gridColsMatches = Array.from(line.matchAll(gridColsPattern));
        
        // Check if first grid-cols doesn't start with 1 (mobile-first)
        if (gridColsMatches.length > 0) {
          const firstMatch = gridColsMatches[0];
          const firstValue = firstMatch[1];
          
          // If the first grid-cols value is not 1, it's a violation
          if (firstValue !== '1' && !line.includes('grid-cols-1')) {
            this.violations.push({
              file,
              line: index + 1,
              type: 'MOBILE_STACKING_VIOLATION',
              value: line.trim(),
              suggestion: `Grids must start with grid-cols-1 for mobile-first design. Pattern: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
            });
          }
        }
      }
    });
  }

  /**
   * Scan a file for violations
   */
  scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const relativePath = path.relative(process.cwd(), filePath);
      
      this.checkNegativeMargins(content, relativePath);
      this.checkNegativeTransforms(content, relativePath);
      this.checkOffGridSpacing(content, relativePath);
      this.checkMaxWidth(content, relativePath);
      this.checkMobileStacking(content, relativePath);
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
    }
  }

  /**
   * Recursively find all TSX/TS files
   */
  findFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and other build directories
        if (!['node_modules', '.next', 'dist', 'build', '.git'].includes(file)) {
          this.findFiles(filePath, fileList);
        }
      } else if (file.match(/\.(tsx|ts|jsx|js)$/) && !file.includes('.d.ts')) {
        fileList.push(filePath);
      }
    });
    
    return fileList;
  }

  /**
   * Run the enforcer
   */
  run(directories = ['app', 'components']) {
    console.log('🔍 Design System Enforcer - Scanning for violations...\n');
    
    const files = [];
    directories.forEach(dir => {
      if (fs.existsSync(dir)) {
        this.findFiles(dir, files);
      }
    });
    
    console.log(`📁 Scanning ${files.length} files...\n`);
    
    files.forEach(file => {
      this.scanFile(file);
    });
    
    this.report();
  }

  /**
   * Generate violation report
   */
  report() {
    if (this.violations.length === 0) {
      console.log('✅ No design system violations found!');
      return;
    }
    
    console.log(`\n❌ Found ${this.violations.length} violation(s):\n`);
    
    // Group by type
    const grouped = this.violations.reduce((acc, violation) => {
      if (!acc[violation.type]) {
        acc[violation.type] = [];
      }
      acc[violation.type].push(violation);
      return acc;
    }, {});
    
    // Report by type
    Object.entries(grouped).forEach(([type, violations]) => {
      console.log(`\n📋 ${type} (${violations.length} violation(s)):`);
      console.log('─'.repeat(80));
      
      violations.forEach(v => {
        console.log(`\n  📄 ${v.file}:${v.line}`);
        console.log(`     Value: ${v.value}`);
        console.log(`     💡 Fix: ${v.suggestion}`);
      });
    });
    
    console.log(`\n\n📊 Summary:`);
    console.log(`   Total violations: ${this.violations.length}`);
    Object.entries(grouped).forEach(([type, violations]) => {
      console.log(`   ${type}: ${violations.length}`);
    });
    
    console.log('\n');
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  const enforcer = new DesignSystemEnforcer();
  const directories = process.argv.slice(2).length > 0 
    ? process.argv.slice(2) 
    : ['app', 'components'];
  enforcer.run(directories);
}

module.exports = DesignSystemEnforcer;

