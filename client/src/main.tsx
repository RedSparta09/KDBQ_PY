import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import * as monaco from "monaco-editor";

// Register the Q language
monaco.languages.register({ id: 'q' });

// Register Python language if not already registered
if (!monaco.languages.getLanguages().some(lang => lang.id === 'python')) {
  monaco.languages.register({ id: 'python' });
  
  // Define Python language syntax highlighting
  monaco.languages.setMonarchTokensProvider('python', {
    defaultToken: 'invalid',
    tokenPostfix: '.python',
    keywords: [
      'and', 'as', 'assert', 'break', 'class', 'continue', 'def', 'del', 'elif', 'else',
      'except', 'exec', 'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is',
      'lambda', 'not', 'or', 'pass', 'print', 'raise', 'return', 'try', 'while', 'with',
      'yield', 'True', 'False', 'None'
    ],
    
    builtins: [
      'abs', 'all', 'any', 'bin', 'bool', 'bytearray', 'callable', 'chr', 'classmethod',
      'compile', 'complex', 'delattr', 'dict', 'dir', 'divmod', 'enumerate', 'eval', 'filter',
      'float', 'format', 'frozenset', 'getattr', 'globals', 'hasattr', 'hash', 'help',
      'hex', 'id', 'input', 'int', 'isinstance', 'issubclass', 'iter', 'len', 'list',
      'locals', 'map', 'max', 'memoryview', 'min', 'next', 'object', 'oct', 'open',
      'ord', 'pow', 'property', 'range', 'repr', 'reversed', 'round', 'set', 'setattr',
      'slice', 'sorted', 'staticmethod', 'str', 'sum', 'super', 'tuple', 'type', 'vars',
      'zip', '__import__', 'NotImplemented', 'Ellipsis', '__debug__'
    ],
  
    brackets: [
      { open: '{', close: '}', token: 'delimiter.curly' },
      { open: '[', close: ']', token: 'delimiter.bracket' },
      { open: '(', close: ')', token: 'delimiter.parenthesis' }
    ],
    
    tokenizer: {
      root: [
        { include: '@whitespace' },
        { include: '@numbers' },
        { include: '@strings' },
        
        [/[,:;]/, 'delimiter'],
        [/[{}\[\]()]/, '@brackets'],
        
        [/@[a-zA-Z_]\w*/, 'tag'],
        [/[a-zA-Z_]\w*/, {
          cases: {
            '@keywords': 'keyword',
            '@builtins': 'type.identifier',
            '@default': 'identifier'
          }
        }]
      ],
      
      // Deal with white space, including single and multi-line comments
      whitespace: [
        [/\s+/, 'white'],
        [/(^#.*$)/, 'comment'],
        [/'''/, 'string', '@endDocString'],
        [/"""/, 'string', '@endDblDocString']
      ],
      endDocString: [
        [/[^']+/, 'string'],
        [/\\'/, 'string'],
        [/'''/, 'string', '@popall'],
        [/'/, 'string']
      ],
      endDblDocString: [
        [/[^"]+/, 'string'],
        [/\\"/, 'string'],
        [/"""/, 'string', '@popall'],
        [/"/, 'string']
      ],
      
      // Recognize hex, negatives, decimals, imaginaries, longs, and scientific notation
      numbers: [
        [/-?0x([abcdef]|[ABCDEF]|\d)+[lL]?/, 'number.hex'],
        [/-?(\d*\.)?\d+([eE][+\-]?\d+)?[jJ]?[lL]?/, 'number']
      ],
      
      // Recognize strings, including those broken across lines with \ (but not without)
      strings: [
        [/'$/, 'string.escape', '@popall'],
        [/'/, 'string.escape', '@stringBody'],
        [/"$/, 'string.escape', '@popall'],
        [/"/, 'string.escape', '@dblStringBody']
      ],
      stringBody: [
        [/[^\\']+$/, 'string', '@popall'],
        [/[^\\']+/, 'string'],
        [/\\./, 'string'],
        [/'/, 'string.escape', '@popall'],
        [/\\$/, 'string']
      ],
      dblStringBody: [
        [/[^\\"]+$/, 'string', '@popall'],
        [/[^\\"]+/, 'string'],
        [/\\./, 'string'],
        [/"/, 'string.escape', '@popall'],
        [/\\$/, 'string']
      ]
    }
  });
}

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
