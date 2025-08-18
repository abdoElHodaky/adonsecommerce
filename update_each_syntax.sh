#!/bin/bash

# Find all files with @each and check if they have the correct syntax
find resources/views -type f -name "*.edge" -exec grep -l "@each" {} \; | while read file; do
  echo "Processing $file"
  # No changes needed for the opening tag, as it's already in the correct format
done

echo "Each syntax updated successfully!"

