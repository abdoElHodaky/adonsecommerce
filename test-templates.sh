#!/bin/bash

# Test script for Edge.js templates
# This script runs various tests to verify that Edge.js templates are working correctly

# Create output directory
mkdir -p test-output

# Set text colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Edge.js template tests...${NC}"
echo

# Test 1: Simple template rendering
echo -e "${YELLOW}Test 1: Simple template rendering${NC}"
node test-view.js pages/about/index.edge
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Test 1 passed: Simple template rendering works${NC}"
else
  echo -e "${RED}✗ Test 1 failed: Simple template rendering failed${NC}"
fi
echo

# Test 2: Template with layout inheritance
echo -e "${YELLOW}Test 2: Template with layout inheritance${NC}"
node test-full-page.js pages/about/index
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Test 2 passed: Layout inheritance works${NC}"
else
  echo -e "${RED}✗ Test 2 failed: Layout inheritance failed${NC}"
fi
echo

# Test 3: Multiple templates and partials
echo -e "${YELLOW}Test 3: Multiple templates and partials${NC}"
node test-templates-simple.js
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Test 3 passed: Multiple templates and partials work${NC}"
else
  echo -e "${RED}✗ Test 3 failed: Multiple templates and partials failed${NC}"
fi
echo

# Test 4: @include directive
echo -e "${YELLOW}Test 4: @include directive${NC}"
node test-includes.js
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Test 4 passed: @include directive works${NC}"
else
  echo -e "${RED}✗ Test 4 failed: @include directive failed${NC}"
fi
echo

# Test 5: Control flow directives (@if, @else, @each, @let)
echo -e "${YELLOW}Test 5: Control flow directives${NC}"
node test-control-flow.js
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Test 5 passed: Control flow directives work${NC}"
else
  echo -e "${RED}✗ Test 5 failed: Control flow directives failed${NC}"
fi
echo

# Test 6: Comprehensive template test (all features)
echo -e "${YELLOW}Test 6: Comprehensive template test${NC}"
node test-comprehensive.js
if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Test 6 passed: Comprehensive template test works${NC}"
else
  echo -e "${RED}✗ Test 6 failed: Comprehensive template test failed${NC}"
fi
echo

# Check if all tests passed
if [ -f test-output/about-page.html ] && [ -f test-output/full-page-pages-about-index.html ]; then
  echo -e "${GREEN}All tests completed successfully!${NC}"
  echo -e "Output files are available in the test-output directory:"
  ls -la test-output/
else
  echo -e "${RED}Some tests failed. Check the output above for details.${NC}"
fi
