#!/bin/bash

# Update @endif to @end
find resources/views -type f -name "*.edge" -exec sed -i 's/@endif/@end/g' {} \;

# Update @endsection to @end
find resources/views -type f -name "*.edge" -exec sed -i 's/@endsection/@end/g' {} \;

# Update @endeach to @end
find resources/views -type f -name "*.edge" -exec sed -i 's/@endeach/@end/g' {} \;

# Update @endcomponent to @end
find resources/views -type f -name "*.edge" -exec sed -i 's/@endcomponent/@end/g' {} \;

# Update @endunless to @end
find resources/views -type f -name "*.edge" -exec sed -i 's/@endunless/@end/g' {} \;

# Update @endfor to @end
find resources/views -type f -name "*.edge" -exec sed -i 's/@endfor/@end/g' {} \;

# Update @endforelse to @end
find resources/views -type f -name "*.edge" -exec sed -i 's/@endforelse/@end/g' {} \;

# Update @endwhile to @end
find resources/views -type f -name "*.edge" -exec sed -i 's/@endwhile/@end/g' {} \;

echo "Edge template syntax updated successfully!"

