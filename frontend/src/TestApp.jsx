import React from 'react';

// Simple test component to verify the app works
function TestApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#0066cc' }}>✅ VCAI Marketing Dashboard</h1>
      <p><strong>Status:</strong> Frontend is working correctly!</p>
      <p><strong>Mode:</strong> Test Mode</p>
      <p><strong>URL:</strong> http://localhost:5173</p>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f8ff', border: '1px solid #0066cc', borderRadius: '5px' }}>
        <h3>System Check</h3>
        <ul>
          <li>✅ Vite server running</li>
          <li>✅ React components loading</li>
          <li>✅ CSS styles applied</li>
          <li>✅ JavaScript executing</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f8f8', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h3>Next Steps</h3>
        <p>If you see this page, the frontend is working correctly. To load the full marketing dashboard:</p>
        <ol>
          <li>Stop this server (Ctrl+C)</li>
          <li>Rename <code>src/App.jsx</code> to <code>src/App.jsx.backup</code></li>
          <li>Rename <code>src/TestApp.jsx</code> to <code>src/App.jsx</code> (this file)</li>
          <li>Restart the server with <code>npm run dev</code></li>
        </ol>
      </div>
    </div>
  );
}

export default TestApp;