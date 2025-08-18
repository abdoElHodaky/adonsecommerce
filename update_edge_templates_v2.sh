#!/bin/bash

# Script to update Edge.js templates
# This script updates the Edge.js templates to use the new layout inheritance system

# Set text colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Updating Edge.js templates...${NC}"

# Update the view provider
echo -e "${YELLOW}Updating view provider...${NC}"
git add app/providers/view_provider.ts
git commit -m "Update view provider to properly handle Edge.js templates

Co-authored-by: AbdElrhman ElHodaky <abdo.arh38@yahoo.com>"

# Update the view middleware
echo -e "${YELLOW}Updating view middleware...${NC}"
git add app/middleware/view_middleware.ts
git commit -m "Update view middleware to handle layout inheritance

Co-authored-by: AbdElrhman ElHodaky <abdo.arh38@yahoo.com>"

# Add test scripts
echo -e "${YELLOW}Adding test scripts...${NC}"
git add test-view.js test-full-page.js test-templates-simple.js test-templates.sh template-testing.md
git commit -m "Add test scripts for Edge.js templates

Co-authored-by: AbdElrhman ElHodaky <abdo.arh38@yahoo.com>"

echo -e "${GREEN}Edge.js templates updated successfully!${NC}"

