#!/bin/bash

# Test Templates Script
# This script runs the test-view.js script to test Edge.js templates

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Edge.js Template Testing Tool${NC}"
echo "==============================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed. Please install Node.js to run this script.${NC}"
    exit 1
fi

# Function to test a template or directory
test_template() {
    local template_path=$1
    echo -e "\n${YELLOW}Testing: ${template_path}${NC}"
    node test-view.js "$template_path"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Test passed for ${template_path}${NC}"
        return 0
    else
        echo -e "${RED}✗ Test failed for ${template_path}${NC}"
        return 1
    fi
}

# If no arguments provided, show usage
if [ $# -eq 0 ]; then
    echo -e "\n${YELLOW}Usage:${NC}"
    echo "  ./test-templates.sh [template-path]"
    echo "  ./test-templates.sh all            # Test all templates"
    echo "  ./test-templates.sh critical       # Test critical templates"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  ./test-templates.sh pages/home     # Test home page template"
    echo "  ./test-templates.sh partials       # Test all partials"
    echo "  ./test-templates.sh components     # Test all components"
    exit 0
fi

# Make the script executable
chmod +x test-view.js

# Test based on argument
case "$1" in
    "all")
        echo -e "\n${YELLOW}Testing all templates...${NC}"
        node test-view.js
        ;;
    "critical")
        echo -e "\n${YELLOW}Testing critical templates...${NC}"
        
        # Define critical templates to test
        critical_templates=(
            "layouts/main.edge"
            "pages/home.edge"
            "partials/header.edge"
            "partials/footer.edge"
            "partials/flash-messages.edge"
            "components/product-card.edge"
            "helpers/index.edge"
        )
        
        failures=0
        
        for template in "${critical_templates[@]}"; do
            test_template "$template"
            if [ $? -ne 0 ]; then
                ((failures++))
            fi
        done
        
        if [ $failures -eq 0 ]; then
            echo -e "\n${GREEN}All critical templates passed!${NC}"
            exit 0
        else
            echo -e "\n${RED}${failures} critical template(s) failed.${NC}"
            exit 1
        fi
        ;;
    *)
        test_template "$1"
        exit $?
        ;;
esac
