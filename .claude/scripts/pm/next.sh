#!/bin/bash
echo "Getting status..."
echo ""
echo ""

echo "📋 Next Available Tasks"
echo "======================="
echo ""

# Find tasks that are open and have no dependencies or whose dependencies are closed
found=0

check_task() {
  local task_file="$1"
  local epic_name="$2"
  local is_synced="$3"

  # Check if task is open
  status=$(grep "^status:" "$task_file" | head -1 | sed 's/^status: *//')
  if [ "$status" != "open" ] && [ -n "$status" ]; then
    return
  fi

  # Check dependencies
  deps_line=$(grep "^depends_on:" "$task_file" | head -1)
  if [ -n "$deps_line" ]; then
    deps=$(echo "$deps_line" | sed 's/^depends_on: *//')
    deps=$(echo "$deps" | sed 's/^\[//' | sed 's/\]$//')
    deps=$(echo "$deps" | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//')
    [ -z "$deps" ] && deps=""
  else
    deps=""
  fi

  # If no dependencies or empty, task is available
  if [ -z "$deps" ] || [ "$deps" = "depends_on:" ]; then
    task_name=$(grep "^name:" "$task_file" | head -1 | sed 's/^name: *//')
    parallel=$(grep "^parallel:" "$task_file" | head -1 | sed 's/^parallel: *//')

    if [ "$is_synced" = "true" ]; then
      filename=$(basename "$task_file" .md)
      task_num=$(echo "$filename" | cut -d'-' -f1)
      echo "✅ Ready: #$task_num - $task_name"
    else
      echo "✅ Ready: [unsynced] $task_name"
    fi
    echo "   Epic: $epic_name"
    [ "$parallel" = "true" ] && echo "   🔄 Can run in parallel"
    echo ""
    ((found++))
  fi
}

for epic_dir in .claude/epics/*/; do
  [ -d "$epic_dir" ] || continue
  epic_name=$(basename "$epic_dir")

  # Check synced tasks (format: {issue-number}-{task-name}.md)
  for task_file in "$epic_dir"/[0-9]*-*.md; do
    [ -f "$task_file" ] || continue
    check_task "$task_file" "$epic_name" "true"
  done

  # Check unsynced tasks (format: {task-name}.md, no number prefix)
  for task_file in "$epic_dir"/*.md; do
    [ -f "$task_file" ] || continue
    filename=$(basename "$task_file")

    # Skip epic.md, github-mapping.md, and synced files
    [[ "$filename" == "epic.md" ]] && continue
    [[ "$filename" == "github-mapping.md" ]] && continue
    [[ "$filename" =~ ^[0-9]+-.*\.md$ ]] && continue

    check_task "$task_file" "$epic_name" "false"
  done
done

if [ $found -eq 0 ]; then
  echo "No available tasks found."
  echo ""
  echo "💡 Suggestions:"
  echo "  • Check blocked tasks: /pm:blocked"
  echo "  • View all tasks: /pm:epic-list"
fi

echo ""
echo "📊 Summary: $found tasks ready to start"

exit 0
