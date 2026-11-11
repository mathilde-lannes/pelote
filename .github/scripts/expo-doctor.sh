#!/bin/bash

set -euo pipefail

mkdir -p .expo

# Pin a known-good doctor release. expo-doctor@>=1.21 crashes under npx with
# "Cannot find module '@expo/env'" even on supported Node versions.
output=$(npx --yes expo-doctor@1.13.1 2>&1)
exit_code=$?

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
