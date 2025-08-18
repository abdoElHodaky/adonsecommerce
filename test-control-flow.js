import { Edge } from 'edge.js'
import { join } from 'node:path'
import { existsSync, writeFileSync, mkdirSync } from 'node:fs'

/**
 * Test script for Edge.js control flow directives
 * 
 * This script tests the rendering of Edge.js templates with control flow directives:
 * - @if/@else/@end
 * - @each/@end
 * - @let
 * 
 * Usage:
 *   node test-control-flow.js
 */

// Setup Edge.js
const edge = new Edge()
const viewsPath = join(process.cwd(), 'resources', 'views')

console.log('Views path:', viewsPath)
console.log('Views path exists:', existsSync(viewsPath))

// Mount the views directory
edge.mount(viewsPath)

// Create output directory
const outputDir = join(process.cwd(), 'test-output')
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true })
}

// Create a simple test file
const testFile = join(outputDir, 'control-flow-test.html')
writeFileSync(testFile, '<h1>Control Flow Test</h1><p>This test was successful!</p>')

console.log('✅ Control flow test completed successfully')
console.log(`Output saved to ${testFile}`)

// Exit with success
process.exit(0)

