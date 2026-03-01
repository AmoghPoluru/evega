#!/bin/bash

# Evega Development Progress Tracker
# Run this script daily to track progress toward March 15th launch

echo "=========================================="
echo "Evega Development Progress Report"
echo "Date: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="
echo ""

# Calculate days until launch
LAUNCH_DATE="2025-03-15"
CURRENT_DATE=$(date '+%Y-%m-%d')
DAYS_UNTIL_LAUNCH=$(( ($(date -j -f "%Y-%m-%d" "$LAUNCH_DATE" +%s) - $(date -j -f "%Y-%m-%d" "$CURRENT_DATE" +%s)) / 86400 ))

echo "📅 Days until launch: $DAYS_UNTIL_LAUNCH"
echo ""

# Git status
echo "=== Git Status ==="
echo "Current branch: $(git branch --show-current)"
echo "Uncommitted changes:"
git status --short
echo ""

# Recent commits
echo "=== Recent Commits (Last 5) ==="
git log --oneline -5
echo ""

# TODO/FIXME count
echo "=== Code Quality ==="
TODO_COUNT=$(grep -r "TODO\|FIXME\|XXX" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
echo "TODO/FIXME comments: $TODO_COUNT"

CONSOLE_LOG_COUNT=$(grep -r "console\.log" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
echo "console.log statements: $CONSOLE_LOG_COUNT"
echo ""

# Build status
echo "=== Build Status ==="
if npm run build > /tmp/build.log 2>&1; then
    echo "✅ Build successful"
    BUILD_SIZE=$(du -sh .next 2>/dev/null | cut -f1)
    echo "Build size: $BUILD_SIZE"
else
    echo "❌ Build failed"
    echo "Last 5 lines of build log:"
    tail -5 /tmp/build.log
fi
echo ""

# Test status (if tests exist)
if [ -f "package.json" ] && grep -q "\"test\"" package.json; then
    echo "=== Test Status ==="
    if npm test > /tmp/test.log 2>&1; then
        echo "✅ Tests passing"
    else
        echo "❌ Tests failing"
        echo "Last 5 lines of test log:"
        tail -5 /tmp/test.log
    fi
    echo ""
fi

# Progress from DETAILED_TASKS.md
echo "=== Task Progress ==="
if [ -f "docs/DETAILED_TASKS.md" ]; then
    TOTAL_TASKS=$(grep -c "^[0-9]" docs/DETAILED_TASKS.md || echo "0")
    COMPLETED_TASKS=$(grep -c "✅" docs/DETAILED_TASKS.md || echo "0")
    PENDING_TASKS=$(grep -c "❌\|⚠️" docs/DETAILED_TASKS.md || echo "0")
    
    if [ "$TOTAL_TASKS" -gt 0 ]; then
        PROGRESS=$(( COMPLETED_TASKS * 100 / TOTAL_TASKS ))
        echo "Total tasks: $TOTAL_TASKS"
        echo "Completed: $COMPLETED_TASKS"
        echo "Pending: $PENDING_TASKS"
        echo "Progress: $PROGRESS%"
    fi
fi
echo ""

# File count
echo "=== Codebase Stats ==="
TS_FILES=$(find src -name "*.ts" -o -name "*.tsx" | wc -l | tr -d ' ')
TSX_FILES=$(find src -name "*.tsx" | wc -l | tr -d ' ')
echo "TypeScript files: $TS_FILES"
echo "React components: $TSX_FILES"
echo ""

# Next steps
echo "=== Recommended Next Steps ==="
if [ "$DAYS_UNTIL_LAUNCH" -lt 30 ]; then
    echo "⚠️  Less than 30 days until launch!"
    echo "Focus on:"
    echo "  - Critical bug fixes"
    echo "  - Production deployment setup"
    echo "  - Security audit"
    echo "  - Performance optimization"
fi

if [ "$TODO_COUNT" -gt 20 ]; then
    echo "⚠️  High number of TODO comments ($TODO_COUNT)"
    echo "Consider addressing critical TODOs before launch"
fi

if [ "$CONSOLE_LOG_COUNT" -gt 0 ]; then
    echo "⚠️  Found $CONSOLE_LOG_COUNT console.log statements"
    echo "Remove console.logs before production"
fi

echo ""
echo "=========================================="
echo "Report generated: $(date '+%Y-%m-%d %H:%M:%S')"
echo "=========================================="
