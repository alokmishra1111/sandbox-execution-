import React, { useState } from 'react';
import axios from 'axios';
import { Play, Terminal, ShieldCheck, Download, Trash2 } from 'lucide-react';
import EditorPane from './components/EditorPane';
import ConsoleOutput from './components/ConsoleOutput';

const DEFAULT_CODE = {
  javascript: 'console.log("Hello, GreenShield!");\n\n// Try some math\nconst a = 10;\nconst b = 20;\nconsole.log(`Sum: ${a + b}`);',
  python: 'print("Hello, GreenShield!")\n\n# Try some math\na = 10\nb = 20\nprint(f"Sum: {a + b}")',
  c: '#include <stdio.h>\n\nint main() {\n    printf("Hello, GreenShield!\\n");\n    \n    // Try some math\n    int a = 10;\n    int b = 20;\n    printf("Sum: %d\\n", a + b);\n    return 0;\n}'
};

function App() {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(DEFAULT_CODE.javascript);
  const [output, setOutput] = useState('');
  const [errorOutput, setErrorOutput] = useState('');
  const [status, setStatus] = useState('Idle');
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="flex flex-col h-screen bg-greenshield-dark text-slate-200">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-greenshield-panel border-b border-greenshield-border shadow-md">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/30">
            <ShieldCheck className="w-6 h-6 text-greenshield-neon" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">GreenShield<span className="text-greenshield-neon">Sandbox</span></h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <select 
            value={language} 
            onChange={handleLanguageChange}
            className="bg-greenshield-dark border border-greenshield-border rounded-md px-3 py-1.5 text-sm outline-none focus:border-greenshield-neon transition-colors"
          >
            <option value="javascript">Node.js (JavaScript)</option>
            <option value="python">Python 3</option>
            <option value="c">C (GCC)</option>
          </select>
          
          <button 
            onClick={runCode}
            disabled={isLoading}
            className={`flex items-center space-x-2 px-5 py-1.5 rounded-md font-medium transition-all ${
              isLoading 
                ? 'bg-green-500/50 cursor-not-allowed opacity-70' 
                : 'bg-greenshield-neon text-greenshield-dark hover:bg-greenshield-neon-hover shadow-[0_0_15px_rgba(0,255,102,0.3)] hover:shadow-[0_0_20px_rgba(0,255,102,0.5)]'
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
          <div className="px-4 py-2 bg-greenshield-panel text-xs font-semibold tracking-wider text-slate-400 uppercase border-b border-greenshield-border">
            Source Code
          </div>
          <div className="flex-1 overflow-hidden">
            <EditorPane code={code} onChange={setCode} language={language} />
          </div>
        </div>

        {/* Console Pane */}
        <div className="w-[45%] flex flex-col bg-greenshield-dark">
          <div className="flex items-center justify-between px-4 py-2 bg-greenshield-panel border-b border-greenshield-border">
            <div className="flex items-center space-x-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
              <Terminal className="w-4 h-4" />
              <span>Console</span>
            </div>
            <div className="flex space-x-2 text-slate-400">
              <button onClick={clearConsole} className="p-1 hover:text-white transition-colors" title="Clear Console">
                <Trash2 className="w-4 h-4" />
              </button>
              <button onClick={downloadOutput} className="p-1 hover:text-white transition-colors" title="Download Output">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <ConsoleOutput output={output} error={errorOutput} status={status} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
