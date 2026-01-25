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

import * as fs from 'fs';
import * as path from 'path';

interface Violation {
  file: string;
  line: number;
  type: string;
  value: string;
  suggestion: string;
}

// Design System Rules
const APPROVED_SPACING_VALUES = ['0.5', '1', '1.5', '2', '3', '4', '5', '6', '8', '10', '12', '16', '20'];
const APPROVED_CONTAINER_MAX_WIDTHS = ['max-w-7xl']; // Only max-w-7xl is approved for containers
const SPACING_PATTERNS = ['m', 'p', 'mt', 'mr', 'mb', 'ml', 'mx', 'my', 'pt', 'pr', 'pb', 'pl', 'px', 'py', 'gap', 'space-x', 'space-y'];
const BREAKPOINTS = ['sm', 'md', 'lg', 'xl', '2xl'];

// Violation patterns
const NEGATIVE_MARGIN_PATTERN = /-m[xytrbl]?-\d+|margin:\s*-\d+/g;
const NEGATIVE_TRANSFORM_PATTERN = /-translate-[xy]-\d+|transform:\s*translate[XY]?\(-\d+/g;
const SPACING_PATTERN = new RegExp(
  `(${SPACING_PATTERNS.join('|')})-(${BREAKPOINTS.join('|')}:)?(\\d+(?:\\.\\d+)?)`,
  'g'
);
const MAX_WIDTH_PATTERN = /max-w-(?:screen-)?(?:xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|full|none|\d+)/g;
const GRID_COLS_PATTERN = /grid-cols-(?:sm|md|lg|xl|2xl:)?(\d+)/g;

class DesignSystemEnforcer {
  private violations: Violation[] = [];

  /**
   * Check if a spacing value is on the 8px grid
   */
  private isOnGrid(value: string): boolean {
    return APPROVED_SPACING_VALUES.includes(value);
  }

  /**
   * Find the nearest approved spacing value
   */
  private suggestSpacing(value: string): string {
    const num = parseFloat(value);
    if (isNaN(num)) return '?';
    
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
  private checkNegativeMargins(content: string, file: string): void {
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      const matches = line.match(NEGATIVE_MARGIN_PATTERN);
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
  private checkNegativeTransforms(content: string, file: string): void {
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      const matches = line.match(NEGATIVE_TRANSFORM_PATTERN);
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
  private checkOffGridSpacing(content: string, file: string): void {
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      let match;
      while ((match = SPACING_PATTERN.exec(line)) !== null) {
        const [fullMatch, property, breakpoint, value] = match;
        
        // Skip if it's a breakpoint-specific value (we'll check base values)
        if (breakpoint) continue;
        
        if (!this.isOnGrid(value)) {
          const suggested = this.suggestSpacing(value);
          this.violations.push({
            file,
            line: index + 1,
            type: 'OFF_GRID_SPACING',
            value: fullMatch,
            suggestion: `Replace with ${property}-${suggested} (on 8px grid). Approved values: ${APPROVED_SPACING_VALUES.join(', ')}`
          });
        }
      }
    });
  }

  /**
   * Check for inconsistent max-width values
   */
  private checkMaxWidth(content: string, file: string): void {
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      const matches = line.match(MAX_WIDTH_PATTERN);
      if (matches) {
        matches.forEach(match => {
          // Allow max-w-7xl for containers, but flag others
          if (!match.includes('max-w-7xl') && !match.includes('max-w-full') && !match.includes('max-w-none')) {
            // Check if it's in a container context
            const isContainerContext = line.includes('container') || 
                                     line.includes('className') && 
                                     (line.includes('container') || line.includes('max-w'));
            
            if (isContainerContext) {
              this.violations.push({
                file,
                line: index + 1,
                type: 'CONTAINER_MAX_WIDTH_MISMATCH',
                value: match,
                suggestion: `Use max-w-7xl for containers (or container-custom utility class). Found: ${match}`
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
  private checkMobileStacking(content: string, file: string): void {
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      // Check for grid definitions
      if (line.includes('grid') && line.includes('grid-cols')) {
        const gridColsMatches = Array.from(line.matchAll(GRID_COLS_PATTERN));
        
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
  private scanFile(filePath: string): void {
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
  private findFiles(dir: string, fileList: string[] = []): string[] {
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
  public run(directories: string[] = ['app', 'components']): void {
    console.log('🔍 Design System Enforcer - Scanning for violations...\n');
    
    const files: string[] = [];
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
  private report(): void {
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
    }, {} as Record<string, Violation[]>);
    
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

export default DesignSystemEnforcer;


