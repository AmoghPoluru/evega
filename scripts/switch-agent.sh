#!/bin/bash

# Switch between CTO, Architect, and QA agents in Cursor
# Usage: ./scripts/switch-agent.sh [cto|architect|qa]

AGENT=$1

if [ -z "$AGENT" ]; then
    echo "❌ Error: Agent type required"
    echo ""
    echo "Usage: ./scripts/switch-agent.sh [cto|architect|qa]"
    echo ""
    echo "Agents:"
    echo "  cto        - CTO Agent (strategic planning, risk assessment)"
    echo "  architect  - Architect/Developer Agent (implementation, code review)"
    echo "  qa         - QA Agent (testing, quality assurance)"
    exit 1
fi

case $AGENT in
  cto)
    if [ -f ".cursorrules.cto" ]; then
      cp .cursorrules.cto .cursorrules
      echo "✅ Switched to CTO Agent"
      echo "   Role: Chief Technology Officer"
      echo "   Focus: Strategic planning, risk assessment, launch readiness"
    else
      echo "❌ Error: .cursorrules.cto not found"
      exit 1
    fi
    ;;
  architect)
    if [ -f ".cursorrules.architect" ]; then
      cp .cursorrules.architect .cursorrules
      echo "✅ Switched to Architect/Developer Agent"
      echo "   Role: Technical Architect & Senior Developer"
      echo "   Focus: Implementation, architecture, code quality"
    else
      echo "❌ Error: .cursorrules.architect not found"
      exit 1
    fi
    ;;
  qa)
    if [ -f ".cursorrules.qa" ]; then
      cp .cursorrules.qa .cursorrules
      echo "✅ Switched to QA Agent"
      echo "   Role: Quality Assurance Engineer"
      echo "   Focus: Testing, quality assurance, bug detection"
    else
      echo "❌ Error: .cursorrules.qa not found"
      exit 1
    fi
    ;;
  *)
    echo "❌ Error: Unknown agent type: $AGENT"
    echo ""
    echo "Valid agents: cto, architect, qa"
    exit 1
    ;;
esac

echo ""
echo "📝 Next steps:"
echo "   1. Reload Cursor window (Cmd+Shift+P > 'Reload Window')"
echo "   2. Open Cursor Chat (Cmd+L) and verify agent role"
echo "   3. Use agent-specific prompts from .cursor/agents/$AGENT/prompts.md"
