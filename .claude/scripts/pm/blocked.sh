#!/bin/bash
echo "Getting tasks..."
echo ""
echo ""

echo "🚫 Blocked Tasks"
echo "================"
echo ""

found=0

check_blocked_task() {
  local task_file="$1"
  local epic_dir="$2"
  local epic_name="$3"
  local is_synced="$4"

  # Check if task is open
  status=$(grep "^status:" "$task_file" | head -1 | sed 's/^status: *//')
  if [ "$status" != "open" ] && [ -n "$status" ]; then
    return
  fi

  # Check for dependencies
  deps_line=$(grep "^depends_on:" "$task_file" | head -1)
  if [ -n "$deps_line" ]; then
    deps=$(echo "$deps_line" | sed 's/^depends_on: *//')
    deps=$(echo "$deps" | sed 's/^\[//' | sed 's/\]$//')
    deps=$(echo "$deps" | sed 's/,/ /g')
    deps=$(echo "$deps" | sed 's/^[[:space:]]*//' | sed 's/[[:space:]]*$//')
    [ -z "$deps" ] && deps=""
  else
    deps=""
  fi

  if [ -n "$deps" ] && [ "$deps" != "depends_on:" ]; then
    task_name=$(grep "^name:" "$task_file" | head -1 | sed 's/^name: *//')

    if [ "$is_synced" = "true" ]; then
      filename=$(basename "$task_file" .md)
      task_num=$(echo "$filename" | cut -d'-' -f1)
      echo "⏸️ Task #$task_num - $task_name"
    else
      echo "⏸️ Task [unsynced] - $task_name"
    fi
    echo "   Epic: $epic_name"
    echo "   Blocked by: [$deps]"

    # Check status of dependencies (deps can be issue numbers or task names)
    open_deps=""
    for dep in $deps; do
      # Try synced format first
      dep_file=$(ls "$epic_dir"/"$dep"-*.md 2>/dev/null | head -1)
      # Then try unsynced format
      [ -z "$dep_file" ] && dep_file="$epic_dir$dep.md"
      if [ -f "$dep_file" ]; then
        dep_status=$(grep "^status:" "$dep_file" | head -1 | sed 's/^status: *//')
        [ "$dep_status" = "open" ] && open_deps="$open_deps $dep"
      fi
    done

    [ -n "$open_deps" ] && echo "   Waiting for:$open_deps"
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
    check_blocked_task "$task_file" "$epic_dir" "$epic_name" "true"
  done

  # Check unsynced tasks (format: {task-name}.md, no number prefix)
  for task_file in "$epic_dir"/*.md; do
    [ -f "$task_file" ] || continue
    filename=$(basename "$task_file")

    # Skip epic.md, github-mapping.md, and synced files
    [[ "$filename" == "epic.md" ]] && continue
    [[ "$filename" == "github-mapping.md" ]] && continue
    [[ "$filename" =~ ^[0-9]+-.*\.md$ ]] && continue

    check_blocked_task "$task_file" "$epic_dir" "$epic_name" "false"
  done
done

if [ $found -eq 0 ]; then
  echo "No blocked tasks found!"
  echo ""
  echo "💡 All tasks with dependencies are either completed or in progress."
else
  echo "📊 Total blocked: $found tasks"
fi

exit 0
