#!/bin/bash

set -euo pipefail

mkdir -p .expo

# Pin a Doctor release that exits non-zero when config loading fails
# (fixed in 1.21.3+). Avoid 1.21.7+: it crashes under npx with
# "Cannot find module '@expo/env'" even on supported Node versions.
set +e
output=$(npx --yes expo-doctor@1.21.6 2>&1)
exit_code=$?
set -e

# Output file location
output_file=".expo/expo-doctor.md"
{
  # Add summary based on exit code
  if [ $exit_code -eq 0 ]; then
    echo "✅ **Good news!** We ran Expo Doctor for this PR and everything looks good, Great job!" > "$output_file"
  else
    echo "❌ **Action Required:**  We ran Expo Doctor for this PR and found some issues that need to be addressed. Please review the complete report below 👇" > "$output_file"
    echo >> "$output_file"  # Add blank line
    echo "\`\`\`shell" >> "$output_file"
    echo "$output" >> "$output_file"
    echo "\`\`\`" >> "$output_file"
  fi
}

# Show original output in terminal
echo "$output"

# Return the original exit code
exit $exit_code
