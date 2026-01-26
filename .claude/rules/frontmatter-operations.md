# Frontmatter Operations Rule

Standard patterns for working with YAML frontmatter in markdown files.

## Reading Frontmatter

Extract frontmatter from any markdown file:
1. Look for content between `---` markers at start of file
2. Parse as YAML
3. If invalid or missing, use sensible defaults

## Updating Frontmatter

When updating existing files:
1. Preserve all user-defined custom fields
2. Update standard fields per current schema (see Standard Fields section)
3. Remove deprecated system fields that conflict with current schema
4. Always update `updated` field with current datetime (see `datetime.md`)

## Standard Fields

### All Files
```yaml
---
name: {identifier}
created: {ISO datetime}      # Never change after creation
updated: {ISO datetime}      # Update on any modification
---
```

### Status Values
All artifact types use consistent status values:
- `backlog` - Not yet started
- `in-progress` - Currently being worked on
- `complete` - Finished

### Progress Tracking
```yaml
progress: {0-100}%           # For epics
completion: {0-100}%         # For progress files
```

## Creating New Files

Always include frontmatter when creating markdown files:
```yaml
---
name: {from_arguments_or_context}
status: {initial_status}
created: {current_datetime}
updated: {current_datetime}
---
```

## Important Notes

- Never modify `created` field after initial creation
- Always use real datetime from system (see `datetime.md`)
- Validate frontmatter exists before trying to parse
- Use consistent field names across all files