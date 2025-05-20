// A mock interpreter for KDB Q code
// This is a simplified implementation that simulates execution
// of some basic Q commands for learning purposes

type QValue = string | number | boolean | QObject | QTable | QList | QFunction;

interface QObject {
  [key: string]: QValue;
}

interface QTable {
  columns: string[];
  data: QValue[][];
}

type QList = QValue[];

type QFunction = (args: QValue[]) => QValue;

// Global symbol table to store variables
const symbolTable: Record<string, QValue> = {};

// Predefined sample data for demonstration
const sampleTrade: QTable = {
  columns: ['date', 'sym', 'price', 'size'],
  data: [
    ['2023.10.01', 'AAPL', 185.25, 100],
    ['2023.10.01', 'MSFT', 402.15, 200],
    ['2023.10.02', 'AAPL', 186.40, 150]
  ]
};

symbolTable['trade'] = sampleTrade;

// Function to execute Q code
export function executeQ(code: string): string[] {
  const lines = code.split('\n').filter(line => line.trim() && !line.trim().startsWith('//')); 
  const output: string[] = [];
  
  for (const line of lines) {
    try {
      const trimmedLine = line.trim();
      
      // Skip comment lines
      if (trimmedLine.startsWith('//')) {
        continue;
      }
      
      // Handle variable assignment
      if (trimmedLine.includes(':')) {
        const [varName, expression] = trimmedLine.split(':').map(s => s.trim());
        const result = parseExpression(expression);
        symbolTable[varName] = result;
        
        if (varName.includes('{')) {
          output.push(`<div class="text-[#6A9955]">// Function defined: ${varName.split('{')[0].trim()}</div>`);
        } else {
          output.push(`<div class="text-[#6A9955]">// Assigned to variable: ${varName}</div>`);
          
          // Show the result if it's a table or list
          if (typeof result === 'object') {
            output.push(formatResult(result));
          }
        }
      } 
      // Handle function call
      else if (trimmedLine.includes('[') && trimmedLine.includes(']')) {
        const functionName = trimmedLine.split('[')[0].trim();
        output.push(`<div class="text-white"><span class="text-[#0078d4]">q) </span>${trimmedLine}</div>`);
        
        const result = executeBuiltInFunction(functionName, []);
        output.push(formatResult(result));
      }
      // Handle select queries
      else if (trimmedLine.toLowerCase().startsWith('select')) {
        output.push(`<div class="text-white"><span class="text-[#0078d4]">q) </span>${trimmedLine}</div>`);
        
        // Parse the select query
        const result = parseSelectQuery(trimmedLine);
        output.push(formatResult(result));
      }
      // Handle direct value expressions
      else {
        output.push(`<div class="text-white"><span class="text-[#0078d4]">q) </span>${trimmedLine}</div>`);
        
        const result = parseExpression(trimmedLine);
        output.push(formatResult(result));
      }
    } catch (error) {
      if (error instanceof Error) {
        output.push(`<div class="text-[#d83b01]">Error: ${error.message}</div>`);
      } else {
        output.push(`<div class="text-[#d83b01]">Unknown error occurred</div>`);
      }
    }
  }
  
  return output;
}

// Parse and evaluate Q expressions
function parseExpression(expr: string): QValue {
  expr = expr.trim();
  
  // Check if it's a function definition
  if (expr.startsWith('{') && expr.endsWith('}')) {
    return expr; // Just store the function definition as a string for now
  }
  
  // Check if it's accessing a table
  if (expr === 'trade') {
    return symbolTable['trade'] || null;
  }
  
  // Handle table definitions
  if (expr.startsWith('([') || expr.startsWith('([]')) {
    return parseTableDefinition(expr);
  }
  
  // Basic arithmetic - extremely simplified
  if (/^[0-9+\-*\/\s.]+$/.test(expr)) {
    try {
      // eslint-disable-next-line no-eval
      return eval(expr);
    } catch (e) {
      throw new Error(`Cannot evaluate expression: ${expr}`);
    }
  }
  
  // For simplicity, just return the expression as a string for unrecognized patterns
  return expr;
}

// Parse a table definition
function parseTableDefinition(expr: string): QTable {
  // This is a very simplified parser for demo purposes
  // A real implementation would be much more complex
  
  // Mock implementation for the sample trade table
  if (expr.includes('date:') && expr.includes('sym:') && expr.includes('price:') && expr.includes('size:')) {
    return sampleTrade;
  }
  
  // Mock implementation for the employees table from example
  if (expr.includes('name:') && expr.includes('age:') && expr.includes('department:')) {
    return {
      columns: ['name', 'age', 'department'],
      data: [
        ['John', 35, 'IT'],
        ['Emma', 28, 'HR'],
        ['David', 42, 'Finance']
      ]
    };
  }
  
  // Return a generic table for other definitions
  return {
    columns: ['column1', 'column2'],
    data: [
      ['value1', 1],
      ['value2', 2]
    ]
  };
}

// Parse and execute a select query
function parseSelectQuery(query: string): QTable {
  // This is a simplified parser for select queries
  // A real implementation would use proper parsing techniques
  
  query = query.toLowerCase();
  
  // Check for "select from trade where" pattern
  if (query.includes('from trade')) {
    // If query is asking for avg price and sum size by sym
    if (query.includes('avg price') && query.includes('sum size') && query.includes('by sym')) {
      return {
        columns: ['sym', 'avg_price', 'sum_size'],
        data: [
          ['AAPL', 185.825, 250],
          ['MSFT', 402.15, 200]
        ]
      };
    }
    
    // If query is just filtering by price
    if (query.includes('where price >')) {
      return {
        columns: ['date', 'sym', 'price', 'size'],
        data: [
          ['2023.10.01', 'MSFT', 402.15, 200]
        ]
      };
    }
    
    // Default return the whole trade table
    return sampleTrade;
  }
  
  // Check for executeVWAP function call pattern
  if (query.includes('calculatevwap') && query.includes('trade')) {
    return {
      columns: ['sym', 'vwap'],
      data: [
        ['AAPL', 185.965],
        ['MSFT', 402.15]
      ]
    };
  }
  
  // Handle generic select query
  return {
    columns: ['result'],
    data: [['Query result would be shown here']]
  };
}

// Execute built-in functions
function executeBuiltInFunction(name: string, args: QValue[]): QValue {
  // In this mock implementation, just return sample data for specific function calls
  if (name.includes('calculateVWAP') && args.length === 0) {
    return {
      columns: ['sym', 'vwap'],
      data: [
        ['AAPL', 185.965],
        ['MSFT', 402.15]
      ]
    };
  }
  
  return "Function executed";
}

// Format query results for display
function formatResult(result: QValue): string {
  if (typeof result === 'number' || typeof result === 'boolean') {
    return `<div class="text-white">${result}</div>`;
  }
  
  if (typeof result === 'string') {
    return `<div class="text-[#ce9178]">"${result}"</div>`;
  }
  
  // Format tables
  if (typeof result === 'object' && result !== null && 'columns' in result) {
    const table = result as QTable;
    let output = '';
    
    // Header
    output += '<div class="mb-2">';
    for (let i = 0; i < table.columns.length; i++) {
      const isFirst = i === 0;
      const isPrimary = isFirst;
      output += `<span class="${isPrimary ? 'text-[#0078d4]' : 'text-white'}">${isFirst ? table.columns[i] + '   | ' : table.columns[i] + '    '}</span>`;
    }
    output += '</div>';
    
    // Separator
    output += '<div class="mb-2">';
    output += `<span class="text-[#0078d4]">-----| </span>`;
    output += `<span class="text-white">---------------</span>`;
    output += '</div>';
    
    // Data rows
    for (const row of table.data) {
      output += '<div class="mb-2">';
      for (let i = 0; i < row.length; i++) {
        const isFirst = i === 0;
        const isPrimary = isFirst;
        output += `<span class="${isPrimary ? 'text-[#0078d4]' : 'text-white'}">${isFirst ? row[i] + ' | ' : row[i] + '       '}</span>`;
      }
      output += '</div>';
    }
    
    return output;
  }
  
  // Format lists
  if (Array.isArray(result)) {
    return `<div class="text-white">${result.join(' ')}</div>`;
  }
  
  return `<div class="text-white">${JSON.stringify(result)}</div>`;
}
