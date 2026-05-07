import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, Terminal, ShieldCheck, Download, Trash2, Sun, Moon, User, LogOut } from 'lucide-react';
import EditorPane from './components/EditorPane';
import ConsoleOutput from './components/ConsoleOutput';
import AuthModal from './components/AuthModal';

const DEFAULT_CODE = {
  javascript: 'console.log("Hello, GreenShield!");\n\n// Try some math\nconst a = 10;\nconst b = 20;\nconsole.log(`Sum: ${a + b}`);',
  python: 'print("Hello, GreenShield!")\n\n# Try some math\na = 10\nb = 20\nprint(f"Sum: {a + b}")',
  c: '#include <stdio.h>\n\nint main() {\n    printf("Hello, GreenShield!\\n");\n    \n    // Try some math\n    int a = 10;\n    int b = 20;\n    printf("Sum: %d\\n", a + b);\n    return 0;\n}',
  cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, GreenShield!" << std::endl;\n    \n    // Try some math\n    int a = 10;\n    int b = 20;\n    std::cout << "Sum: " << a + b << std::endl;\n    return 0;\n}',
  html: '<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { font-family: sans-serif; color: #16a34a; text-align: center; margin-top: 50px; }\n  </style>\n</head>\n<body>\n  <h1>Hello, GreenShield!</h1>\n  <p>This is a live HTML preview.</p>\n</body>\n</html>',
  mysql: '-- Using SQLite to emulate SQL behavior\nCREATE TABLE users (\n  id INTEGER PRIMARY KEY,\n  name TEXT,\n  role TEXT\n);\n\nINSERT INTO users (name, role) VALUES\n  ("Alice", "Admin"),\n  ("Bob", "User"),\n  ("Charlie", "Moderator");\n\nSELECT * FROM users;'
};

function App() {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(DEFAULT_CODE.javascript);
  const [output, setOutput] = useState('');
  const [errorOutput, setErrorOutput] = useState('');
  const [status, setStatus] = useState('Idle');
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [currentUser, setCurrentUser] = useState(() => localStorage.getItem('username') || null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleLogin = (username, token) => {
    localStorage.setItem('username', username);
    localStorage.setItem('token', token);
    setCurrentUser(username);
  };

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    setCode(DEFAULT_CODE[lang]);
    setOutput('');
    setErrorOutput('');
    setStatus('Idle');
  };

  const runCode = async () => {
    setIsLoading(true);
    setStatus('Running...');
    setOutput('');
    setErrorOutput('');
    
    try {
      const response = await axios.post('http://localhost:3000/api/run', {
        code,
        language
      });
      
      const { success, output: resOutput, error: resError, status: resStatus } = response.data;
      
      setOutput(resOutput || '');
      setErrorOutput(resError || '');
      setStatus(resStatus || (success ? 'Success' : 'Error'));
    } catch (err) {
      setErrorOutput(err.response?.data?.error || err.message);
      setStatus('Error');
    } finally {
      setIsLoading(false);
    }
  };

  const clearConsole = () => {
    setOutput('');
    setErrorOutput('');
    setStatus('Idle');
  };

  const downloadOutput = () => {
    const element = document.createElement('a');
    const file = new Blob([`Status: ${status}\n\nStandard Output:\n${output}\n\nStandard Error:\n${errorOutput}`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = 'execution_output.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex flex-col h-screen bg-greenshield-dark text-[var(--text-main)]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-greenshield-panel border-b border-greenshield-border shadow-md">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/30">
            <ShieldCheck className="w-6 h-6 text-greenshield-neon" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">GreenShield<span className="text-greenshield-neon">Sandbox</span></h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {currentUser ? (
            <div className="flex items-center space-x-3 mr-2 bg-[var(--bg-dark)] px-3 py-1.5 rounded border border-greenshield-border">
              <User className="w-4 h-4 text-greenshield-neon" />
              <span className="text-sm font-medium text-[var(--text-main)]">{currentUser}</span>
              <button 
                onClick={handleLogout}
                className="text-[var(--text-muted)] hover:text-red-400 transition-colors ml-2"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="mr-2 px-4 py-1.5 text-sm font-medium border border-greenshield-neon text-greenshield-neon rounded-md hover:bg-greenshield-neon/10 transition-colors"
            >
              Login / Register
            </button>
          )}

          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 bg-greenshield-dark border border-greenshield-border rounded-md hover:border-greenshield-neon transition-colors text-[var(--text-muted)] hover:text-greenshield-neon"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <select 
            value={language} 
            onChange={handleLanguageChange}
            className="bg-greenshield-dark border border-greenshield-border rounded-md px-3 py-1.5 text-sm outline-none focus:border-greenshield-neon transition-colors text-[var(--text-main)]"
          >
            <option value="javascript">Node.js (JavaScript)</option>
            <option value="python">Python 3</option>
            <option value="c">C (GCC)</option>
            <option value="cpp">C++ (G++)</option>
            <option value="mysql">SQL (MySQL)</option>
            <option value="html">HTML</option>
          </select>
          
          <button 
            onClick={runCode}
            disabled={isLoading}
            className={`flex items-center space-x-2 px-5 py-1.5 rounded-md font-medium transition-all ${
              isLoading 
                ? 'bg-green-500/50 cursor-not-allowed opacity-70' 
                : 'bg-greenshield-neon text-[var(--text-inverse)] hover:bg-greenshield-neon-hover shadow-[0_0_15px_rgba(0,255,102,0.3)] hover:shadow-[0_0_20px_rgba(0,255,102,0.5)]'
            }`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-greenshield-dark border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>{isLoading ? 'Executing...' : 'Run Code'}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex overflow-hidden">
        {/* Editor Pane */}
        <div className="flex-1 border-r border-greenshield-border flex flex-col">
          <div className="px-4 py-2 bg-greenshield-panel text-xs font-semibold tracking-wider text-[var(--text-muted)] uppercase border-b border-greenshield-border">
            Source Code
          </div>
          <div className="flex-1 overflow-hidden">
            <EditorPane code={code} onChange={setCode} language={language} theme={theme} />
          </div>
        </div>

        {/* Console Pane */}
        <div className="w-[45%] flex flex-col bg-greenshield-dark">
          <div className="flex items-center justify-between px-4 py-2 bg-greenshield-panel border-b border-greenshield-border">
            <div className="flex items-center space-x-2 text-xs font-semibold tracking-wider text-[var(--text-muted)] uppercase">
              <Terminal className="w-4 h-4" />
              <span>Console</span>
            </div>
            <div className="flex space-x-2 text-[var(--text-muted)]">
              <button onClick={clearConsole} className="p-1 hover:text-[var(--text-main)] transition-colors" title="Clear Console">
                <Trash2 className="w-4 h-4" />
              </button>
              <button onClick={downloadOutput} className="p-1 hover:text-[var(--text-main)] transition-colors" title="Download Output">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <ConsoleOutput output={output} error={errorOutput} status={status} language={language} />
          </div>
        </div>
      </main>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLogin={handleLogin}
      />
    </div>
  );
}

export default App;
