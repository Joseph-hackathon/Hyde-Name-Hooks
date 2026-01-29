#!/usr/bin/env bash
git commit -m "$(cat <<'EOF'
fix: prevent gsap from hiding content

Disable immediate rendering for GSAP reveals so pages stay visible
before scroll triggers fire.
EOF
)"
