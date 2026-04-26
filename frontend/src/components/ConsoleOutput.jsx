import React from 'react';

function ConsoleOutput({ output, error, status }) {
  const getStatusColor = () => {
    switch (status) {
      case 'Success': return 'text-greenshield-neon border-greenshield-neon bg-greenshield-neon/10';
      case 'Error': return 'text-red-400 border-red-500/50 bg-red-500/10';
      case 'Timeout': return 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10';
      case 'Running...': return 'text-blue-400 border-blue-500/50 bg-blue-500/10';
      default: return 'text-slate-400 border-slate-700 bg-slate-800/50';
    }
  };

  return (
    <div className="h-full flex flex-col font-mono text-sm">
      {/* Status Bar */}
      <div className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border-b border-t-0 flex items-center ${getStatusColor()}`}>
        <span className="relative flex h-2 w-2 mr-2">
          {status === 'Running...' && (
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${status === 'Success' ? 'bg-greenshield-neon' : status === 'Error' ? 'bg-red-500' : status === 'Timeout' ? 'bg-yellow-500' : status === 'Running...' ? 'bg-blue-500' : 'bg-slate-500'}`}></span>
        </span>
        {status}
      </div>

      {/* Output Area */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {(!output && !error && status === 'Idle') && (
          <div className="text-slate-500 italic">Ready for execution. Click "Run Code" to start.</div>
        )}

        {output && (
          <div>
            <div className="text-slate-500 text-xs mb-1 uppercase">Standard Output:</div>
            <pre className="text-slate-300 whitespace-pre-wrap break-all">{output}</pre>
          </div>
        )}

        {error && (
          <div className="mt-4">
            <div className="text-red-400/70 text-xs mb-1 uppercase">Standard Error / Exceptions:</div>
            <pre className="text-red-400 whitespace-pre-wrap break-all bg-red-500/5 p-3 rounded border border-red-500/20">{error}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConsoleOutput;
