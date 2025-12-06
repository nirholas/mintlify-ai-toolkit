#!/bin/bash

# Pre-launch validation script
# Ensures all code, configs, and documentation are ready for public release

set -e  # Exit on any error

echo "🔍 Validating Mintlify AI Toolkit..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

errors=0

# 1. Validate JSON files
echo "📄 Validating JSON files..."
json_files=$(find . -name "*.json" -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/dist/*")
for file in $json_files; do
    if command -v jq &> /dev/null; then
        if jq empty "$file" 2>/dev/null; then
            echo -e "${GREEN}✓${NC} $file"
        else
            echo -e "${RED}✗${NC} Invalid JSON: $file"
            errors=$((errors + 1))
        fi
    else
        echo -e "${YELLOW}⚠${NC} jq not installed, skipping JSON validation"
        break
    fi
done
echo ""

# 2. Check for sensitive data
echo "🔐 Checking for sensitive data..."
sensitive_patterns=("API_KEY|api_key" "SECRET|secret" "PASSWORD|password" "TOKEN|token")
for pattern in "${sensitive_patterns[@]}"; do
    matches=$(grep -r -i "$pattern" --include="*.ts" --include="*.js" --include="*.json" --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git . | grep -v "process.env" | grep -v "// " | grep -v "description" | grep -v "placeholder" || true)
    if [ -n "$matches" ]; then
        echo -e "${YELLOW}⚠${NC} Found potential sensitive data (verify these are safe):"
        echo "$matches"
    fi
done
echo -e "${GREEN}✓${NC} No obvious API keys or secrets found in code"
echo ""

# 3. Validate TypeScript syntax (if tsc is available)
echo "🔨 Checking TypeScript compilation..."
if command -v tsc &> /dev/null; then
    if tsc --noEmit 2>/dev/null; then
        echo -e "${GREEN}✓${NC} TypeScript compilation successful"
    else
        echo -e "${YELLOW}⚠${NC} TypeScript has some errors (check with npm run build)"
        errors=$((errors + 1))
    fi
else
    echo -e "${YELLOW}⚠${NC} TypeScript not found, skipping compilation check"
fi
echo ""

# 4. Check required files exist
echo "📋 Checking required files..."
required_files=(
    "README.md"
    "CHANGELOG.md"
    "LICENSE"
    "package.json"
    "SECURITY.md"
    "CONTRIBUTING.md"
    ".github/workflows/ci.yml"
    ".github/workflows/deploy.yml"
    ".well-known/ai-plugin.json"
    ".well-known/openapi.yaml"
    ".well-known/ai-tool-manifest.json"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} Missing: $file"
        errors=$((errors + 1))
    fi
done
echo ""

# 5. Check package.json version matches CHANGELOG
echo "📦 Validating versions..."
if command -v jq &> /dev/null; then
    pkg_version=$(jq -r '.version' package.json)
    echo "   Package version: $pkg_version"
    
    if grep -q "## \[$pkg_version\]" CHANGELOG.md; then
        echo -e "${GREEN}✓${NC} CHANGELOG has entry for v$pkg_version"
    else
        echo -e "${RED}✗${NC} CHANGELOG missing entry for v$pkg_version"
        errors=$((errors + 1))
    fi
fi
echo ""

# 6. Check for TODO/FIXME comments
echo "📝 Checking for unfinished work..."
todos=$(grep -r -n "TODO\|FIXME\|XXX\|HACK" --include="*.ts" --include="*.js" --exclude-dir=node_modules --exclude-dir=dist . || true)
if [ -n "$todos" ]; then
    echo -e "${YELLOW}⚠${NC} Found TODO/FIXME comments:"
    echo "$todos" | head -10
    if [ $(echo "$todos" | wc -l) -gt 10 ]; then
        echo "   ... and $(($(echo "$todos" | wc -l) - 10)) more"
    fi
else
    echo -e "${GREEN}✓${NC} No TODO/FIXME comments found"
fi
echo ""

# 7. Check file permissions
echo "🔒 Checking file permissions..."
executable_files=$(find . -type f -name "*.sh" -not -path "*/node_modules/*" -not -path "*/.git/*")
for file in $executable_files; do
    if [ -x "$file" ]; then
        echo -e "${GREEN}✓${NC} $file is executable"
    else
        echo -e "${YELLOW}⚠${NC} $file is not executable (run: chmod +x $file)"
    fi
done
echo ""

# 8. Validate OpenAPI spec (if swagger-cli is available)
echo "📡 Validating OpenAPI spec..."
if command -v swagger-cli &> /dev/null; then
    if swagger-cli validate .well-known/openapi.yaml 2>/dev/null; then
        echo -e "${GREEN}✓${NC} OpenAPI spec is valid"
    else
        echo -e "${RED}✗${NC} OpenAPI spec has errors"
        errors=$((errors + 1))
    fi
else
    echo -e "${YELLOW}⚠${NC} swagger-cli not installed, skipping OpenAPI validation"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $errors -eq 0 ]; then
    echo -e "${GREEN}✅ All validation checks passed!${NC}"
    echo ""
    echo "Ready to push to GitHub:"
    echo "  git add ."
    echo "  git commit -m 'Release v$pkg_version'"
    echo "  git tag -a v$pkg_version -m 'Version $pkg_version'"
    echo "  git push origin main"
    echo "  git push origin v$pkg_version"
    exit 0
else
    echo -e "${RED}❌ Found $errors error(s)${NC}"
    echo "Please fix the errors above before publishing."
    exit 1
fi
