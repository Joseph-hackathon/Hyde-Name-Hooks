#!/usr/bin/env bash
git commit -m "$(cat <<'EOF'
fix: enforce fredoka fonts globally

Apply font variables at html/body and inherit for form controls
to ensure consistent typography in production.
EOF
)"
