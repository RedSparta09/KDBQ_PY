// Python interpreter using Pyodide
import { loadPyodide, type PyodideInterface } from 'pyodide';

let pyodideInstance: PyodideInterface | null = null;
let isLoading = false;
let loadingPromise: Promise<PyodideInterface> | null = null;

// Initialize Pyodide
export const initPyodide = async (): Promise<PyodideInterface> => {
  if (pyodideInstance) {
    return pyodideInstance;
  }

  if (isLoading && loadingPromise) {
    return loadingPromise;
  }

  isLoading = true;
  
  // Create a promise to load Pyodide
  loadingPromise = (async () => {
    try {
      console.log('Loading Pyodide...');
      const pyodide = await loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/',
      });
      
      console.log('Pyodide loaded successfully');
      pyodideInstance = pyodide;
      isLoading = false;
      return pyodide;
    } catch (error) {
      console.error('Failed to load Pyodide:', error);
      isLoading = false;
      throw error;
    }
  })();

  return loadingPromise;
};

// Run Python code
export const executePython = async (code: string): Promise<string[]> => {
  const output: string[] = [];
  let pyodide: PyodideInterface;

  try {
    // Add output redirection
    const redirectCode = `
import sys
import io

class CaptureOutput:
    def __init__(self):
        self.stdout = io.StringIO()
        self.stderr = io.StringIO()
        self.old_stdout = sys.stdout
        self.old_stderr = sys.stderr
    
    def __enter__(self):
        sys.stdout = self.stdout
        sys.stderr = self.stderr
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        sys.stdout = self.old_stdout
        sys.stderr = self.old_stderr
    
    def get_output(self):
        return self.stdout.getvalue(), self.stderr.getvalue()

capture = CaptureOutput()
`;

    output.push('<div class="text-[#6A9955]">// Loading Python interpreter...</div>');
    
    try {
      pyodide = await initPyodide();
    } catch (error) {
      output.push(`<div class="text-[#d83b01]">Error: Failed to load Python interpreter. ${error}</div>`);
      return output;
    }

    // Add the redirection code
    await pyodide.runPythonAsync(redirectCode);
    
    output.push('<div class="text-[#6A9955]">// Executing Python code...</div>');
    
    // Run the user code with output capture
    const fullCode = `
with capture:
    try:
${code.split('\n').map(line => '        ' + line).join('\n')}
    except Exception as e:
        print(f"Error: {type(e).__name__}: {str(e)}")
    
stdout, stderr = capture.get_output()
`;

    await pyodide.runPythonAsync(fullCode);
    
    // Get the output
    const stdout = pyodide.globals.get('stdout');
    const stderr = pyodide.globals.get('stderr');
    
    if (stdout) {
      const stdoutLines = stdout.toString().split('\n');
      stdoutLines.forEach((line: string) => {
        if (line.trim()) {
          output.push(`<div class="text-white">${line}</div>`);
        }
      });
    }
    
    if (stderr) {
      const stderrLines = stderr.toString().split('\n');
      stderrLines.forEach((line: string) => {
        if (line.trim()) {
          output.push(`<div class="text-[#d83b01]">${line}</div>`);
        }
      });
    }
    
  } catch (error) {
    output.push(`<div class="text-[#d83b01]">Error: ${error}</div>`);
  }
  
  return output;
};

// Check if Pyodide is loaded
export const isPyodideLoaded = (): boolean => {
  return pyodideInstance !== null;
};