# Ahmedabad Flight 113 Simulation

This project is a small demonstration of Flight 113's final approach.
It relies on ES modules fetched from a CDN, so you need to open the
`index.html` file via a local web server. Running `node js/main.js`
will not work because the dependencies are loaded in the browser.

## Quick start

1. Start a local server from the repository directory:
   ```
   python3 -m http.server 8000
   ```
2. Open `http://localhost:8000/index.html` in a web browser that
   supports ES modules.

You should see the simulation with the plane following its path.
