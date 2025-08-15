# Zen Mode Code Highlighting Page - Implementation Plan

## Project Context

- Fresh/Deno framework with Tailwind CSS
- Existing project structure with routes, islands, and static assets
- Mobile-responsive design requirements

## Implementation Steps

### 1. Create Zen Route (`routes/zen.tsx`)

- **Purpose**: Single page with minimal layout for distraction-free code viewing
- **Features**:
  - No header/footer (Zen mode)
  - Full viewport height layout
  - Centered content container
  - Mobile-responsive design using Tailwind
  - Dark theme background

### 2. Create Code Highlighter Island (`islands/CodeHighlighter.tsx`)

- **Purpose**: Client-side component for syntax highlighting with line numbers
- **Dependencies**:
  - Highlight.js from CDN (esm.sh)
  - Line numbers plugin
- **Functionality**:
  - Load Highlight.js and plugins on mount
  - Apply syntax highlighting to `<pre><code>` blocks
  - Add line numbers using plugin
  - Handle responsive behavior

### 3. Styling Strategy

- **Tailwind Classes**: Responsive layout, typography, spacing
- **Custom CSS**: Line numbers column styling
- **Theme**: Dark background with subtle accent colors
- **Typography**: Fira Code monospace font for code, clean spacing
- **Font Loading**: Load Fira Code from Google Fonts CDN
- **Mobile**: Horizontal scroll for long lines, appropriate font sizes

### 4. Sample Content

- Include a sample TypeScript/JavaScript code block
- Demonstrate syntax highlighting capabilities
- Show line numbers functionality

### 5. Mobile Responsiveness

- **Container**: Max-width with responsive padding
- **Typography**: Scalable font sizes
- **Scrolling**: Horizontal scroll for code overflow
- **Touch**: Optimized for touch interactions

## File Structure

```
routes/
  └── zen.tsx              # Zen mode page route
islands/
  └── CodeHighlighter.tsx  # Client-side highlighting component
static/
  └── styles.css           # Additional custom styles (if needed)
```

## Technical Requirements

- Fresh/Deno compatibility
- Tailwind CSS integration
- Client-side JavaScript execution
- CDN resource loading (Highlight.js, Fira Code font)
- Mobile-first responsive design

## Success Criteria

- Clean, distraction-free interface
- Proper syntax highlighting with line numbers
- Mobile-responsive layout
- Fast loading and smooth interactions
- Zen-like user experience
