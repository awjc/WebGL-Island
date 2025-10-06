# WebGL Island

A simple WebGL application with a Python development server.

## Project Structure

```
.
├── client/          # Client-side WebGL application
│   ├── index.html
│   ├── styles.css
│   └── src/
│       ├── shaders.js
│       ├── renderer.js
│       └── main.js
└── server/          # Development server
    └── server.py
```

## Running the Application

1. Start the server:
   ```bash
   cd server
   python3 server.py
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

## Requirements

- Python 3.x
- Modern web browser with WebGL support
