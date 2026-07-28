#!/bin/bash
echo "=== Node test suite (non-DOM) ==="
node --test tests/*.test.mjs 2>&1
echo ""
echo "=== Vitest suite (requires jsdom - run on desktop) ==="
echo "npm run test"
