#!/bin/bash

echo "Getting status..."
echo ""
echo ""


echo "📊 Project Status"
echo "================"
echo ""

echo "📄 PRDs:"
if [ -d ".claude/prds" ]; then
  total=$(ls .claude/prds/*.md 2>/dev/null | wc -l)
  echo "  Total: $total"
else
  echo "  No PRDs found"
fi

echo ""
echo "📚 Epics:"
if [ -d ".claude/epics" ]; then
  total=$(ls -d .claude/epics/*/ 2>/dev/null | wc -l)
  echo "  Total: $total"
else
  echo "  No epics found"
fi

echo ""
echo "📝 Tasks:"
if [ -d ".claude/epics" ]; then
  # Count synced tasks (format: {issue-number}-{task-name}.md)
  synced_total=$(find .claude/epics -name "[0-9]*-*.md" 2>/dev/null | wc -l)
  synced_open=$(find .claude/epics -name "[0-9]*-*.md" -exec grep -l "^status: *open" {} \; 2>/dev/null | wc -l)
  synced_closed=$(find .claude/epics -name "[0-9]*-*.md" -exec grep -l "^status: *closed" {} \; 2>/dev/null | wc -l)

  # Count unsynced tasks (*.md files that aren't epic.md, github-mapping.md, or synced files)
  unsynced_total=0
  unsynced_open=0
  unsynced_closed=0
  for task_file in .claude/epics/*/*.md; do
    [ -f "$task_file" ] || continue
    filename=$(basename "$task_file")
    [[ "$filename" == "epic.md" ]] && continue
    [[ "$filename" == "github-mapping.md" ]] && continue
    [[ "$filename" =~ ^[0-9]+-.*\.md$ ]] && continue

    ((unsynced_total++))
    status=$(grep "^status:" "$task_file" | head -1 | sed 's/^status: *//')
    [ "$status" = "open" ] && ((unsynced_open++))
    [ "$status" = "closed" ] && ((unsynced_closed++))
  done

  total=$((synced_total + unsynced_total))
  open=$((synced_open + unsynced_open))
  closed=$((synced_closed + unsynced_closed))

  echo "  Open: $open"
  echo "  Closed: $closed"
  echo "  Total: $total"
  [ $unsynced_total -gt 0 ] && echo "  Unsynced: $unsynced_total"
else
  echo "  No tasks found"
fi

exit 0
