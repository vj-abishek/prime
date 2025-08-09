# merge.cc - Prime

A modern code editor with syntax highlighting and code sharing capabilities built with Fresh and Deno.

## Features

- **Syntax Highlighting**: Supports JavaScript, TypeScript, JSX, TSX, Python, CSS, and JSON
- **Code Sharing**: Share code snippets with unique URLs
- **Gzip Compression**: Code is compressed before storage to save space
- **Redis Storage**: Uses Upstash Redis for reliable code storage
- **Modern UI**: Clean, dark theme with responsive design

## Setup

1. Install Deno: https://deno.land/manual/getting_started/installation

2. Set up Upstash Redis:
   - Create an account at [Upstash](https://upstash.com/)
   - Create a Redis database
   - Get your REST token

3. Set environment variables:
   ```bash
   export UPSTASH_REDIS_REST_TOKEN="your_upstash_redis_token_here"
   ```

4. Start the project:
   ```bash
   deno task start
   ```

## Usage

- **Paste Code**: Use Ctrl+V (or Cmd+V on Mac) to paste code from clipboard
- **Copy Code**: Click the "Copy" button to copy code to clipboard
- **Share Code**: Click the "Share" button to generate a shareable URL
- **View Shared Code**: Visit `/share/[id]` to view shared code snippets

## API Endpoints

- `POST /api/store` - Store code and get share URL
- `GET /share/[id]` - View shared code by ID

## Architecture

- **Frontend**: Fresh framework with Preact
- **Code Editor**: CodeMirror 6 with syntax highlighting
- **Storage**: Upstash Redis with gzip compression
- **Styling**: Tailwind CSS
