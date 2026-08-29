const { spawn } = require('child_process');

console.log('\x1b[36m%s\x1b[0m', '🚀 Starting CredLink Development Environment...');
console.log('\x1b[33m%s\x1b[0m', 'Press Ctrl+C to stop both backend and frontend servers.\n');

// Start backend server
const server = spawn('npm', ['run', 'dev'], { 
  cwd: 'server', 
  shell: true, 
  stdio: 'inherit' 
});

// Start frontend client
const client = spawn('npm', ['run', 'dev'], { 
  cwd: 'client', 
  shell: true, 
  stdio: 'inherit' 
});

// Handle termination gracefully
process.on('SIGINT', () => {
  console.log('\n\x1b[31m%s\x1b[0m', '🛑 Stopping development servers...');
  server.kill();
  client.kill();
  process.exit();
});

process.on('exit', () => {
  server.kill();
  client.kill();
});
