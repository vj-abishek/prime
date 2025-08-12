FROM denoland/deno:latest

# Create working directory
WORKDIR /app

# Copy deno configuration files first for better caching
COPY deno.json deno.lock* ./

# Copy source code
COPY . .

# Cache dependencies and compile the main app
RUN deno cache main.ts

RUN deno task build

# Expose port (adjust if your app uses a different port)
EXPOSE 8000

# Run the app with necessary permissions
CMD ["deno", "run", "-A", "main.ts"] 