import React from 'react';
import Editor from '@monaco-editor/react';

function EditorPane({ code, onChange, language }) {
  const handleEditorChange = (value) => {
    if (value !== undefined) {
      onChange(value);
    }
  };

  return (
    <Editor
      height="100%"
      language={language}
      theme="vs-dark"
      value={code}
      onChange={handleEditorChange}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
        padding: { top: 16 },
        scrollBeyondLastLine: false,
        smoothScrolling: true,
        cursorBlinking: "smooth",
        cursorSmoothCaretAnimation: "on",
      }}
      loading={
        <div className="flex items-center justify-center h-full text-greenshield-neon">
          Loading editor...
        </div>
      }
    />
  );
}

export default EditorPane;
