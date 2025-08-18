#!/bin/bash

# Update @endif to @end
find resources/views -type f -name "*.edge" -exec sed -i 's/@endif/@end/g' {} \;

# Update @endsection to @end
find resources/views -type f -name "*.edge" -exec sed -i 's/@endsection/@end/g' {} \;

# Update @endeach to @end
find resources/views -type f -name "*.edge" -exec sed -i 's/@endeach/@end/g' {} \;

echo "Edge template syntax updated successfully!"

