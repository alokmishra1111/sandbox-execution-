import React from 'react';

function ConsoleOutput({ output, error, status, language }) {
  const getStatusColor = () => {
    switch (status) {
      case 'Success': return 'status-success';
      case 'Error': return 'status-error';
      case 'Timeout': return 'status-timeout';
      case 'Running...': return 'status-running';
      default: return 'status-default';
    }
  };

  return (
    <div className="console-container">
      {/* Status Bar */}
      <div className={`status-bar ${getStatusColor()}`}>
        <span className="status-indicator-container">
          {status === 'Running...' && (
             <span className="status-indicator-ping"></span>
          )}
          <span className={`status-indicator ${status === 'Success' ? 'bg-success' : status === 'Error' ? 'bg-error' : status === 'Timeout' ? 'bg-timeout' : status === 'Running...' ? 'bg-running' : 'bg-default'}`}></span>
        </span>
        {status}
      </div>

      {/* Output Area */}
      <div className="output-area">
        {(!output && !error && status === 'Idle') && (
          <div className="output-placeholder">Ready for execution. Click "Run Code" to start.</div>
        )}

        {output && language === 'html' ? (
          <div className="html-preview-container">
            <div className="output-label">Live Preview:</div>
            <iframe 
              srcDoc={output} 
              className="html-preview-iframe"
              title="HTML Preview"
              sandbox="allow-scripts"
            />
          </div>
        ) : output && (
          <div>
            <div className="output-label">Standard Output:</div>
            <pre className="standard-output">{output}</pre>
          </div>
        )}

        {error && (
          <div className="error-container">
            <div className="error-label">Standard Error / Exceptions:</div>
            <pre className="standard-error">{error}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConsoleOutput;
