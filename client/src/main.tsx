import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import * as monaco from "monaco-editor";

// Register the Q language
monaco.languages.register({ id: 'q' });

// Define the token rules for Q syntax highlighting
monaco.languages.setMonarchTokensProvider('q', {
  keywords: [
    'do', 'if', 'else', 'while', 'select', 'from', 'where', 'by', 'order', 
    'update', 'delete', 'exec', 'insert', 'function', 'each', 'mmu', 'lsq'
  ],
  operators: [
    '=', '+', '-', '*', '%', '!', '&', '|', '<', '>', '^', '~', '#', '$', 
    '@', '.', ',', ';', ':', '/', '\'', '_', '?'
  ],
  symbols: /[=><!~?:&|+\-*\/\^%]+/,
  
  tokenizer: {
    root: [
      [/\/\/.*$/, 'comment'],
      [/"([^"\\]|\\.)*$/, 'string.invalid'],
      [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],
      [/`[a-zA-Z0-9_]+/, 'variable.name'],
      [/[0-9]+(\.[0-9]+)?([eEdD][\-+]?[0-9]+)?/, 'number'],
      [/[a-zA-Z_][a-zA-Z0-9_]*:/, 'function'],
      [/\b[a-zA-Z0-9_]+\b/, {
        cases: {
          '@keywords': 'keyword',
          '@default': 'identifier'
        }
      }],
      [/@symbols/, {
        cases: {
          '@operators': 'operator',
          '@default': ''
        }
      }],
      [/\s+/, 'white'],
      [/./, 'text']
    ],
    string: [
      [/[^\\"]+/, 'string'],
      [/\\./, 'string.escape'],
      [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }]
    ]
  }
});

monaco.editor.defineTheme('qTheme', {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6A9955' },
    { token: 'string', foreground: 'ce9178' },
    { token: 'keyword', foreground: '569cd6' },
    { token: 'function', foreground: 'dcdcaa' },
    { token: 'variable.name', foreground: '569cd6' },
    { token: 'number', foreground: 'b5cea8' },
    { token: 'operator', foreground: 'd4d4d4' }
  ],
  colors: {
    'editor.background': '#1e1e1e',
    'editor.foreground': '#d4d4d4',
    'editorLineNumber.foreground': '#858585',
    'editor.lineHighlightBackground': '#2a2a2a',
    'editorCursor.foreground': '#d4d4d4',
    'editor.selectionBackground': '#264f78',
    'editor.inactiveSelectionBackground': '#3a3d41'
  }
});

createRoot(document.getElementById("root")!).render(<App />);
