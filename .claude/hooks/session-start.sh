#!/bin/bash
set -euo pipefail

# Only run in Claude Code remote (web) environment
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# Install GitHub CLI if not present
if ! command -v gh &> /dev/null; then
  echo "Installing GitHub CLI..."
  curl -sL -o /tmp/gh.tar.gz https://github.com/cli/cli/releases/download/v2.63.2/gh_2.63.2_linux_amd64.tar.gz
  tar -xzf /tmp/gh.tar.gz -C /tmp
  sudo mv /tmp/gh_2.63.2_linux_amd64/bin/gh /usr/local/bin/
  rm -rf /tmp/gh*
  echo "GitHub CLI installed: $(gh --version | head -1)"
fi

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -e ".[dev]" --quiet

# Install Node.js dependencies for web app
echo "Installing Node.js dependencies..."
cd "$CLAUDE_PROJECT_DIR/web"
npm install --silent

echo "Session setup complete!"
