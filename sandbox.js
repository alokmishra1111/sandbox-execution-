const { spawn, exec } = require('child_process');
const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

const TEMP_DIR = path.join(os.tmpdir(), 'greenshield_sandbox');

// Ensure temp directory exists
if (!fsSync.existsSync(TEMP_DIR)) {
  fsSync.mkdirSync(TEMP_DIR, { recursive: true });
}

// Basic blocklist for security in restricted subprocess environment
const BLOCKLIST = {
  python: ['import os', 'import subprocess', 'import sys', 'open(', 'eval(', 'exec('],
  javascript: ['require("child_process")', 'require("fs")', 'process.exit', 'eval('],
  c: ['system(', 'exec', 'fork(', 'fopen(']
};

const checkBlocklist = (code, language) => {
  const list = BLOCKLIST[language] || [];
  for (const term of list) {
    if (code.includes(term)) {
      return `Security Policy Violation: Use of '${term}' is blocked in this environment.`;
    }
  }
  return null;
};

const executeCode = async (code, language) => {
  // Validate against blocklist
  const violation = checkBlocklist(code, language);
  if (violation) {
    return { success: false, error: violation, status: 'Error' };
  }

  const fileId = crypto.randomUUID();
  let filePath = '';
  let executablePath = '';
  let command = '';
  let args = [];

  try {
    if (language === 'python') {
      filePath = path.join(TEMP_DIR, `${fileId}.py`);
      await fs.writeFile(filePath, code);
      command = 'python3';
      args = [filePath];
    } else if (language === 'javascript') {
      filePath = path.join(TEMP_DIR, `${fileId}.js`);
      await fs.writeFile(filePath, code);
      command = 'node';
      args = [filePath];
    } else if (language === 'c') {
      filePath = path.join(TEMP_DIR, `${fileId}.c`);
      executablePath = path.join(TEMP_DIR, `${fileId}.out`);
      await fs.writeFile(filePath, code);
      
      // Compile C code first
      await new Promise((resolve, reject) => {
        exec(`gcc "${filePath}" -o "${executablePath}"`, (error, stdout, stderr) => {
          if (error) {
            reject(`Compilation Error:\n${stderr}`);
          } else {
            resolve();
          }
        });
      });
      
      command = executablePath;
      args = [];
    }

    // Run the code with timeout and buffer limits
    return await new Promise((resolve) => {
      const child = spawn(command, args);

      let stdoutData = '';
      let stderrData = '';
      const TIMEOUT_MS = 5000; // 5 seconds max
      const MAX_BUFFER = 1024 * 1024; // 1 MB

      const timer = setTimeout(() => {
        child.kill('SIGKILL');
        resolve({ success: false, error: 'Execution Timeout (exceeded 5 seconds)', status: 'Timeout' });
      }, TIMEOUT_MS);

      child.stdout.on('data', (data) => {
        stdoutData += data.toString();
        if (stdoutData.length > MAX_BUFFER) {
          child.kill('SIGKILL');
          resolve({ success: false, error: 'Output size limit exceeded (1MB)', status: 'Error' });
        }
      });

      child.stderr.on('data', (data) => {
        stderrData += data.toString();
        if (stderrData.length > MAX_BUFFER) {
          child.kill('SIGKILL');
          resolve({ success: false, error: 'Error output size limit exceeded (1MB)', status: 'Error' });
        }
      });

      child.on('close', (code) => {
        clearTimeout(timer);
        if (code !== 0 && code !== null) {
          resolve({ success: false, error: stderrData || `Process exited with code ${code}`, output: stdoutData, status: 'Error' });
        } else {
          resolve({ success: true, output: stdoutData, error: stderrData, status: 'Success' });
        }
      });
    });
  } catch (err) {
    return { success: false, error: err.toString(), status: 'Error' };
  } finally {
    // Cleanup temporary files
    if (filePath) fs.unlink(filePath).catch(() => {});
    if (executablePath) fs.unlink(executablePath).catch(() => {});
  }
};

module.exports = { executeCode };
