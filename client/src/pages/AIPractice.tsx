import React, { useState, useEffect } from 'react';
import { useCodeStorage } from '../hooks/useCodeStorage';

type ApiProvider = 'openai' | 'gemini' | 'deepseek' | 'mistral';
type Difficulty = 'Easy' | 'Medium' | 'Hard';

interface AIQuestion {
  title: string;
  description: string;
  language: 'q' | 'python';
  difficulty: Difficulty;
  examples: { input: string; output: string }[];
}

interface TestConfig {
  language: 'q' | 'python';
  difficulty: Difficulty;
  questionCount: number;
  duration: number; // minutes
}

const AIPractice: React.FC = () => {
  // Single question generator state
  const [language, setLanguage] = useState<'q' | 'python'>(() => {
    const savedLanguage = localStorage.getItem('preferred-language');
    return (savedLanguage === 'python' ? 'python' : 'q') as 'q' | 'python';
  });
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [apiProvider, setApiProvider] = useState<ApiProvider>('openai');
  const [generatingQuestion, setGeneratingQuestion] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<AIQuestion | null>(null);
  
  // Test generator state
  const [testConfig, setTestConfig] = useState<TestConfig>({
    language,
    difficulty: 'Medium',
    questionCount: 3,
    duration: 30
  });
  const [generatingTest, setGeneratingTest] = useState(false);
  const [testQuestions, setTestQuestions] = useState<AIQuestion[]>([]);
  const [testActive, setTestActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  // API key state
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [apiKeys, setApiKeys] = useState<Record<ApiProvider, string>>(() => {
    const keys = localStorage.getItem('api-keys');
    return keys ? JSON.parse(keys) : { 
      openai: '', 
      gemini: '', 
      deepseek: '', 
      mistral: '' 
    };
  });

  useEffect(() => {
    localStorage.setItem('api-keys', JSON.stringify(apiKeys));
  }, [apiKeys]);

  const generatePrompt = (lang: 'q' | 'python', diff: Difficulty): string => {
    return `Create a ${diff.toLowerCase()} difficulty coding question for ${lang === 'q' ? 'KDB Q' : 'Python'} programming language. 
    Format the response as JSON with the following structure:
    {
      "title": "Short descriptive title",
      "description": "Detailed problem description including constraints and requirements",
      "language": "${lang}",
      "difficulty": "${diff}",
      "examples": [
        { "input": "Example input", "output": "Expected output" }
      ]
    }
    
    For ${lang === 'q' ? 'KDB Q' : 'Python'} ${diff.toLowerCase()} level:
    ${
      lang === 'q' 
        ? (diff === 'Easy' 
          ? 'Focus on basic Q syntax, simple variable assignments, list operations, or basic table creation.' 
          : diff === 'Medium' 
            ? 'Include select queries, table joins, or simple function definitions.' 
            : 'Include complex data analysis, advanced table operations, or optimizing query performance.')
        : (diff === 'Easy' 
          ? 'Focus on basic Python syntax, loops, conditionals, or simple data structures.' 
          : diff === 'Medium' 
            ? 'Include classes, file operations, or intermediate algorithms.' 
            : 'Include complex algorithms, optimization problems, or system design questions.')
    }`;
  };

  const mockGenerateQuestion = async (lang: 'q' | 'python', diff: Difficulty): Promise<AIQuestion> => {
    // For development only - this would be replaced with real API calls
    const exampleQuestions: Record<string, AIQuestion> = {
      'q-Easy': {
        title: "Calculate Average of List",
        description: "Write a Q function that calculates the average value of a list of numbers.",
        language: "q",
        difficulty: "Easy",
        examples: [
          { input: "avg 1 2 3 4 5", output: "3.0" },
          { input: "avg 10 20 30", output: "20.0" }
        ]
      },
      'q-Medium': {
        title: "Filter Records by Date Range",
        description: "Given a table 'trades' with columns (date, sym, price, size), write a query to select all trades for a specific symbol within a date range.",
        language: "q",
        difficulty: "Medium",
        examples: [
          { input: "select from trades where sym=`AAPL, date within 2023.01.01 2023.01.31", output: "(table with filtered records)" }
        ]
      },
      'q-Hard': {
        title: "Optimize VWAP Calculation",
        description: "Write an optimized function to calculate Volume-Weighted Average Price (VWAP) for each symbol in a large trade table.",
        language: "q",
        difficulty: "Hard",
        examples: [
          { input: "calculateVWAP trades", output: "(table with sym and vwap columns)" }
        ]
      },
      'python-Easy': {
        title: "Reverse a String",
        description: "Write a Python function that takes a string and returns it reversed.",
        language: "python",
        difficulty: "Easy",
        examples: [
          { input: "reverse_string('hello')", output: "'olleh'" },
          { input: "reverse_string('python')", output: "'nohtyp'" }
        ]
      },
      'python-Medium': {
        title: "Count Word Frequency",
        description: "Write a Python function that counts the frequency of words in a given string and returns a dictionary with word counts.",
        language: "python",
        difficulty: "Medium",
        examples: [
          { input: "word_frequency('hello world hello')", output: "{'hello': 2, 'world': 1}" }
        ]
      },
      'python-Hard': {
        title: "Implement LRU Cache",
        description: "Implement a Least Recently Used (LRU) cache with get and put operations in O(1) time complexity.",
        language: "python",
        difficulty: "Hard",
        examples: [
          { input: "cache = LRUCache(2); cache.put(1, 1); cache.put(2, 2); cache.get(1);", output: "1" }
        ]
      }
    };
    
    // Simulate API latency
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return exampleQuestions[`${lang}-${diff}`];
  };

  // This function would be replaced with actual API calls
  const generateQuestion = async () => {
    setGeneratingQuestion(true);
    
    try {
      // In production, we would check for API keys and call the appropriate API
      // const prompt = generatePrompt(language, difficulty);
      
      // For now, use mock data
      const question = await mockGenerateQuestion(language, difficulty);
      setCurrentQuestion(question);
    } catch (error) {
      console.error('Error generating question:', error);
    } finally {
      setGeneratingQuestion(false);
    }
  };

  const generateTest = async () => {
    setGeneratingTest(true);
    
    try {
      const questions: AIQuestion[] = [];
      
      // Generate the requested number of questions
      for (let i = 0; i < testConfig.questionCount; i++) {
        const question = await mockGenerateQuestion(testConfig.language, testConfig.difficulty);
        questions.push(question);
      }
      
      setTestQuestions(questions);
      setTimeRemaining(testConfig.duration * 60); // convert to seconds
      setTestActive(true);
    } catch (error) {
      console.error('Error generating test:', error);
    } finally {
      setGeneratingTest(false);
    }
  };

  // Timer for the test
  useEffect(() => {
    let interval: number | undefined;
    
    if (testActive && timeRemaining > 0) {
      interval = window.setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining <= 0 && testActive) {
      setTestActive(false);
      alert('Time is up!');
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [testActive, timeRemaining]);

  // Format time remaining as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLoadQuestion = (question: AIQuestion) => {
    // Create a custom event to load this question into the editor
    const event = new CustomEvent('load-snippet', { 
      detail: { 
        code: `// ${question.title}\n// ${question.description}\n\n// Example Input: ${question.examples[0].input}\n// Expected Output: ${question.examples[0].output}\n\n// Write your solution below:\n`
      } 
    });
    window.dispatchEvent(event);
    
    // Navigate to editor
    const navEvent = new CustomEvent('navigate', { detail: { panel: 'editor' } });
    window.dispatchEvent(navEvent);
  };

  const handleApiKeyUpdate = (provider: ApiProvider, key: string) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: key
    }));
    setApiKeyModalOpen(false);
  };

  return (
    <div className="flex-1 overflow-auto p-6 bg-[#1e1e1e]" id="ai-practice-panel">
      <h2 className="text-2xl font-semibold mb-6 text-[#0078d4]">AI Practice</h2>
      
      {/* API Provider Selection */}
      <div className="mb-6 bg-[#252526] rounded-lg p-5 border border-[#333333]">
        <h3 className="text-lg font-medium mb-3">API Provider</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(['openai', 'gemini', 'deepseek', 'mistral'] as ApiProvider[]).map(provider => (
            <button
              key={provider}
              className={`p-3 rounded text-center ${apiProvider === provider ? 'bg-[#0078d4] text-white' : 'bg-[#333333] text-gray-300'}`}
              onClick={() => setApiProvider(provider)}
            >
              {provider.charAt(0).toUpperCase() + provider.slice(1)}
              {apiKeys[provider] ? ' ✓' : ' ⚠'}
            </button>
          ))}
        </div>
        <button
          className="mt-3 px-4 py-2 bg-[#333333] text-white rounded hover:bg-opacity-90"
          onClick={() => setApiKeyModalOpen(true)}
        >
          Configure API Keys
        </button>
      </div>
      
      {/* API Key Modal */}
      {apiKeyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#252526] rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Configure API Keys</h3>
            <p className="mb-4 text-gray-300">Enter your API keys for the AI providers. These will be stored securely in your browser's local storage.</p>
            
            {(['openai', 'gemini', 'deepseek', 'mistral'] as ApiProvider[]).map(provider => (
              <div key={provider} className="mb-4">
                <label className="block text-sm font-medium mb-1">{provider.charAt(0).toUpperCase() + provider.slice(1)} API Key</label>
                <input
                  type="password"
                  value={apiKeys[provider]}
                  onChange={(e) => setApiKeys(prev => ({ ...prev, [provider]: e.target.value }))}
                  className="w-full p-2 bg-[#1e1e1e] border border-[#333333] rounded text-white"
                />
              </div>
            ))}
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                className="px-4 py-2 bg-[#333333] text-white rounded hover:bg-opacity-90"
                onClick={() => setApiKeyModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-[#0078d4] text-white rounded hover:bg-opacity-90"
                onClick={() => setApiKeyModalOpen(false)}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Single Question Generator */}
        <div className="bg-[#252526] rounded-lg p-5 border border-[#333333]">
          <h3 className="text-lg font-medium mb-3">Generate Single Question</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Language</label>
              <select 
                className="w-full p-2 bg-[#1e1e1e] border border-[#333333] rounded text-white"
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'q' | 'python')}
              >
                <option value="q">Q</option>
                <option value="python">Python</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Difficulty</label>
              <select 
                className="w-full p-2 bg-[#1e1e1e] border border-[#333333] rounded text-white"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            
            <button 
              className="w-full px-4 py-2 bg-[#0078d4] text-white rounded hover:bg-opacity-90 flex items-center justify-center"
              onClick={generateQuestion}
              disabled={generatingQuestion}
            >
              {generatingQuestion ? (
                <>Generating... <i className="ri-loader-4-line ml-2 animate-spin"></i></>
              ) : (
                <>Generate Question <i className="ri-magic-line ml-2"></i></>
              )}
            </button>
          </div>
          
          {currentQuestion && (
            <div className="mt-6 bg-[#1e1e1e] p-4 rounded border border-[#333333]">
              <h4 className="text-[#0078d4] text-lg font-medium">{currentQuestion.title}</h4>
              <p className="my-2 text-gray-300">{currentQuestion.description}</p>
              
              <div className="mt-3">
                <h5 className="font-medium">Examples:</h5>
                {currentQuestion.examples.map((example, idx) => (
                  <div key={idx} className="bg-[#252526] p-2 rounded mt-2">
                    <div className="text-gray-300"><span className="text-[#569cd6]">Input:</span> {example.input}</div>
                    <div className="text-gray-300"><span className="text-[#569cd6]">Output:</span> {example.output}</div>
                  </div>
                ))}
              </div>
              
              <button 
                className="mt-4 px-4 py-2 bg-[#107c10] text-white rounded hover:bg-opacity-90"
                onClick={() => handleLoadQuestion(currentQuestion)}
              >
                Load to Editor <i className="ri-code-line ml-1"></i>
              </button>
            </div>
          )}
        </div>
        
        {/* Section 2: Test Generator */}
        <div className="bg-[#252526] rounded-lg p-5 border border-[#333333]">
          <h3 className="text-lg font-medium mb-3">Generate Test</h3>
          
          {!testActive ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Language</label>
                <select 
                  className="w-full p-2 bg-[#1e1e1e] border border-[#333333] rounded text-white"
                  value={testConfig.language}
                  onChange={(e) => setTestConfig({...testConfig, language: e.target.value as 'q' | 'python'})}
                  disabled={generatingTest}
                >
                  <option value="q">Q</option>
                  <option value="python">Python</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Difficulty</label>
                <select 
                  className="w-full p-2 bg-[#1e1e1e] border border-[#333333] rounded text-white"
                  value={testConfig.difficulty}
                  onChange={(e) => setTestConfig({...testConfig, difficulty: e.target.value as Difficulty})}
                  disabled={generatingTest}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Number of Questions</label>
                <select 
                  className="w-full p-2 bg-[#1e1e1e] border border-[#333333] rounded text-white"
                  value={testConfig.questionCount}
                  onChange={(e) => setTestConfig({...testConfig, questionCount: parseInt(e.target.value)})}
                  disabled={generatingTest}
                >
                  {[1, 2, 3, 5, 10].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Time Duration (minutes)</label>
                <select 
                  className="w-full p-2 bg-[#1e1e1e] border border-[#333333] rounded text-white"
                  value={testConfig.duration}
                  onChange={(e) => setTestConfig({...testConfig, duration: parseInt(e.target.value)})}
                  disabled={generatingTest}
                >
                  {[5, 10, 15, 30, 45, 60, 90].map(mins => (
                    <option key={mins} value={mins}>{mins} minutes</option>
                  ))}
                </select>
              </div>
              
              <button 
                className="w-full px-4 py-2 bg-[#0078d4] text-white rounded hover:bg-opacity-90 flex items-center justify-center"
                onClick={generateTest}
                disabled={generatingTest}
              >
                {generatingTest ? (
                  <>Generating Test... <i className="ri-loader-4-line ml-2 animate-spin"></i></>
                ) : (
                  <>Generate Test <i className="ri-file-list-3-line ml-2"></i></>
                )}
              </button>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium">{testConfig.language.toUpperCase()} {testConfig.difficulty} Test</h4>
                <div className="text-xl font-mono bg-[#1e1e1e] px-3 py-1 rounded">
                  {formatTime(timeRemaining)}
                </div>
              </div>
              
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {testQuestions.map((question, idx) => (
                  <div key={idx} className="bg-[#1e1e1e] p-4 rounded border border-[#333333]">
                    <h4 className="text-[#0078d4] font-medium">Question {idx + 1}: {question.title}</h4>
                    <p className="my-2 text-sm text-gray-300">{question.description}</p>
                    
                    <div className="mt-2 text-xs">
                      <div className="text-gray-400"><span className="text-[#569cd6]">Example Input:</span> {question.examples[0].input}</div>
                      <div className="text-gray-400"><span className="text-[#569cd6]">Example Output:</span> {question.examples[0].output}</div>
                    </div>
                    
                    <button 
                      className="mt-3 px-3 py-1 text-sm bg-[#107c10] text-white rounded hover:bg-opacity-90"
                      onClick={() => handleLoadQuestion(question)}
                    >
                      Solve <i className="ri-code-line ml-1"></i>
                    </button>
                  </div>
                ))}
              </div>
              
              <button 
                className="mt-4 px-4 py-2 bg-[#d83b01] text-white rounded hover:bg-opacity-90"
                onClick={() => {
                  if (confirm('Are you sure you want to end the test?')) {
                    setTestActive(false);
                  }
                }}
              >
                End Test
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIPractice;