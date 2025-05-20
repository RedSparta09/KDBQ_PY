import React from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';
import { Example } from '@shared/schema';

const Examples: React.FC = () => {
  const { data: examples, isLoading } = useQuery<Example[]>({
    queryKey: ['/api/examples'],
  });

  const loadIntoEditor = async (code: string) => {
    // Create a custom event to load example into editor
    const event = new CustomEvent('load-snippet', { detail: { code } });
    window.dispatchEvent(event);
    
    // Navigate to editor
    const navEvent = new CustomEvent('navigate', { detail: { panel: 'editor' } });
    window.dispatchEvent(navEvent);
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto p-6">
        <h2 className="text-2xl font-semibold mb-6 text-[#0078d4]">Loading examples...</h2>
      </div>
    );
  }

  // Examples are grouped by category
  const groupedExamples = examples?.reduce<Record<string, Example[]>>((acc, example) => {
    if (!acc[example.category]) {
      acc[example.category] = [];
    }
    acc[example.category].push(example);
    return acc;
  }, {}) || {
    // Default examples if API fails to load
    "Basic Operations": [
      {
        id: 1,
        name: "Hello World",
        code: `"Hello, KDB Q world!"`,
        category: "Basic Operations"
      },
      {
        id: 2,
        name: "Basic Arithmetic",
        code: `// Basic math operations
2 + 3 * 4
5 % 2  // division
2 xexp 8  // power`,
        category: "Basic Operations"
      }
    ],
    "Data Structures": [
      {
        id: 3,
        name: "Lists",
        code: `// Creating lists
numbers: 1 2 3 4 5
mixed: (1; "a"; 2.5)
first numbers  // get first element
1 _ numbers    // drop first element`,
        category: "Data Structures"
      },
      {
        id: 4,
        name: "Dictionaries",
        code: `// Creating a dictionary
dict: \`a\`b\`c!1 2 3
dict[\`a]  // accessing values
\`d\`e!(4 5) , dict  // joining dictionaries`,
        category: "Data Structures"
      }
    ],
    "Tables": [
      {
        id: 5,
        name: "Creating Tables",
        code: `// Simple table creation
employees: ([]
    name: \`John\`Emma\`David;
    age: 35 28 42;
    department: \`IT\`HR\`Finance
)`,
        category: "Tables"
      },
      {
        id: 6,
        name: "Table Queries",
        code: `// Basic select query
select from employees where age > 30

// Aggregation
select avg age, count i by department from employees`,
        category: "Tables"
      }
    ],
    "Functions": [
      {
        id: 7,
        name: "Function Definition",
        code: `// Define a simple function
add: {[x;y] x + y}
add[3;4]  // returns 7

// Function with implicit parameters
multiply: {x * y}
multiply[5;6]  // returns 30`,
        category: "Functions"
      },
      {
        id: 8,
        name: "Adverbs",
        code: `// Each adverb
squares: {x*x} each 1 2 3 4 5

// Scan adverb (running calculations)
sums: (+\\) 1 2 3 4 5  // running sum`,
        category: "Functions"
      }
    ]
  };

  return (
    <div className="flex-1 overflow-auto p-6" id="examples-panel">
      <h2 className="text-2xl font-semibold mb-6 text-[#0078d4]">KDB Q Examples</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(groupedExamples).map(([category, categoryExamples]) => (
          <div key={category} className="bg-[#252526] rounded-lg p-5 border border-[#333333]">
            <h3 className="text-lg font-medium mb-3">{category}</h3>
            <div className="space-y-4">
              {categoryExamples.map(example => (
                <div key={example.id} className="bg-[#1e1e1e] p-3 rounded">
                  <h4 className="text-sm font-medium mb-2 text-[#569cd6]">{example.name}</h4>
                  <pre className="overflow-x-auto">
                    <code className="language-q text-sm">{example.code}</code>
                  </pre>
                  <button 
                    className="mt-2 text-xs text-[#0078d4] hover:underline"
                    onClick={() => loadIntoEditor(example.code)}
                  >
                    Load into editor
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Examples;
