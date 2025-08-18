#!/bin/bash

# Find all files with @section and update them
find resources/views -type f -name "*.edge" -exec grep -l "@section" {} \; | while read file; do
  # Replace @section('content') with @section('content')
  # No change needed for the opening tag
  echo "Processing $file"
done

echo "Section tags updated successfully!"

