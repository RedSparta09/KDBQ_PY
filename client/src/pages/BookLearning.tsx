import React, { useState, useEffect } from 'react';

// Types for the Book Learning feature
type BookTest = {
  id: string;
  title: string;
  bookName: string;
  chapters: string;
  questions: TestQuestion[];
  timeLimit: number; // in minutes
  currentQuestion: number;
  timeRemaining: number; // in seconds
  isActive: boolean;
  isCompleted: boolean;
  score?: number;
};

type TestQuestion = {
  id: string;
  type: 'multiple-choice' | 'coding' | 'short-answer' | 'math';
  question: string;
  options?: string[];
  correctAnswer?: string;
  userAnswer?: string;
  isCorrect?: boolean;
  feedback?: string;
};

type Book = {
  id: string;
  name: string;
  fileName: string;
  uploadDate: number;
  chapters?: string[];
};

type AIExplanation = {
  title: string;
  explanation: string;
  bookName: string;
  chapter: string;
  timestamp: number;
};

const BookLearning: React.FC = () => {
  // State management
  const [uploadedBooks, setUploadedBooks] = useState<Book[]>(() => {
    const savedBooks = localStorage.getItem('uploaded-books');
    return savedBooks ? JSON.parse(savedBooks) : [];
  });
  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [activeTab, setActiveTab] = useState<'books' | 'tests' | 'explanations'>('books');
  const [tests, setTests] = useState<BookTest[]>(() => {
    const savedTests = localStorage.getItem('book-tests');
    return savedTests ? JSON.parse(savedTests) : [];
  });
  const [explanations, setExplanations] = useState<AIExplanation[]>(() => {
    const savedExplanations = localStorage.getItem('book-explanations');
    return savedExplanations ? JSON.parse(savedExplanations) : [];
  });
  
  // Modals
  const [isCreateTestModalOpen, setIsCreateTestModalOpen] = useState(false);
  const [isExplanationModalOpen, setIsExplanationModalOpen] = useState(false);
  const [isTestViewModalOpen, setIsTestViewModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  
  // Working states
  const [activeTest, setActiveTest] = useState<BookTest | null>(null);
  const [chaptersInput, setChaptersInput] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [testDuration, setTestDuration] = useState(30);
  const [difficultyLevel, setDifficultyLevel] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [explanationQuery, setExplanationQuery] = useState('');
  const [explanationChapter, setExplanationChapter] = useState('');
  const [isGeneratingTest, setIsGeneratingTest] = useState(false);
  const [isGeneratingExplanation, setIsGeneratingExplanation] = useState(false);
  
  // API Key state
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('openai-api-key') || '';
  });

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('uploaded-books', JSON.stringify(uploadedBooks));
  }, [uploadedBooks]);

  useEffect(() => {
    localStorage.setItem('book-tests', JSON.stringify(tests));
  }, [tests]);

  useEffect(() => {
    localStorage.setItem('book-explanations', JSON.stringify(explanations));
  }, [explanations]);

  useEffect(() => {
    localStorage.setItem('openai-api-key', apiKey);
  }, [apiKey]);

  // Test timer functionality
  useEffect(() => {
    let interval: number | undefined;
    
    if (activeTest?.isActive && activeTest?.timeRemaining > 0) {
      interval = window.setInterval(() => {
        setTests(prev => 
          prev.map(test => 
            test.id === activeTest.id 
              ? { ...test, timeRemaining: test.timeRemaining - 1 }
              : test
          )
        );
        
        setActiveTest(prev => 
          prev ? { ...prev, timeRemaining: prev.timeRemaining - 1 } : null
        );
      }, 1000);
    } else if (activeTest?.timeRemaining <= 0 && activeTest?.isActive) {
      setTests(prev => 
        prev.map(test => 
          test.id === activeTest.id 
            ? { ...test, isActive: false, isCompleted: true }
            : test
        )
      );
      
      setActiveTest(prev => 
        prev ? { ...prev, isActive: false, isCompleted: true } : null
      );
      
      alert('Time is up! Your test has been submitted.');
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTest]);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file.');
        return;
      }
      
      // Create new book entry
      const newBook: Book = {
        id: `book-${Date.now()}`,
        name: file.name.replace('.pdf', ''),
        fileName: file.name,
        uploadDate: Date.now()
      };
      
      setUploadedBooks(prev => [...prev, newBook]);
      alert(`Book "${file.name}" uploaded successfully!`);
      
      // In a real implementation, we would upload the file to a server,
      // or process it to extract text for use with the AI
    }
  };

  // Mock function to generate a test (in real implementation, this would call an AI API)
  const generateTest = async () => {
    if (!currentBook) return;
    if (!apiKey) {
      setIsApiKeyModalOpen(true);
      return;
    }
    
    setIsGeneratingTest(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock questions
      const questions: TestQuestion[] = [];
      
      // Multiple choice questions
      for (let i = 0; i < Math.floor(questionCount * 0.5); i++) {
        questions.push({
          id: `q-${Date.now()}-${i}`,
          type: 'multiple-choice',
          question: `Sample multiple choice question ${i+1} about ${currentBook.name} from chapter(s) ${chaptersInput}`,
          options: [
            `Answer option A for question ${i+1}`,
            `Answer option B for question ${i+1}`,
            `Answer option C for question ${i+1}`,
            `Answer option D for question ${i+1}`
          ],
          correctAnswer: `Answer option A for question ${i+1}`
        });
      }
      
      // Short answer questions
      for (let i = 0; i < Math.floor(questionCount * 0.3); i++) {
        questions.push({
          id: `q-${Date.now()}-${i+Math.floor(questionCount * 0.5)}`,
          type: 'short-answer',
          question: `Sample short answer question ${i+1} about ${currentBook.name} from chapter(s) ${chaptersInput}`,
          correctAnswer: `Sample answer for short answer question ${i+1}`
        });
      }
      
      // Coding or math questions
      for (let i = 0; i < Math.floor(questionCount * 0.2); i++) {
        const isCoding = Math.random() > 0.5;
        questions.push({
          id: `q-${Date.now()}-${i+Math.floor(questionCount * 0.8)}`,
          type: isCoding ? 'coding' : 'math',
          question: `Sample ${isCoding ? 'coding' : 'math'} question ${i+1} about ${currentBook.name} from chapter(s) ${chaptersInput}`,
          correctAnswer: isCoding 
            ? `def sample_function():\n    return "This is a sample answer for coding question ${i+1}"`
            : `x = 5 + 7 = 12`
        });
      }
      
      // Create the test
      const newTest: BookTest = {
        id: `test-${Date.now()}`,
        title: `${currentBook.name} - Chapter ${chaptersInput} Test (${difficultyLevel})`,
        bookName: currentBook.name,
        chapters: chaptersInput,
        questions,
        timeLimit: testDuration,
        currentQuestion: 0,
        timeRemaining: testDuration * 60,
        isActive: false,
        isCompleted: false
      };
      
      setTests(prev => [...prev, newTest]);
      setIsCreateTestModalOpen(false);
      setActiveTab('tests');
      
    } catch (error) {
      console.error('Error generating test:', error);
      alert('Failed to generate test. Please try again.');
    } finally {
      setIsGeneratingTest(false);
    }
  };

  // Mock function to generate an explanation (in real implementation, this would call an AI API)
  const generateExplanation = async () => {
    if (!currentBook) return;
    if (!apiKey) {
      setIsApiKeyModalOpen(true);
      return;
    }
    
    setIsGeneratingExplanation(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock explanation
      const newExplanation: AIExplanation = {
        title: `Explanation: ${explanationQuery}`,
        explanation: `This is a sample explanation for "${explanationQuery}" from ${currentBook.name}, chapter ${explanationChapter}.\n\nIn this explanation, the AI would provide a detailed answer based on the content of the book. It would reference specific sections, provide examples, and explain concepts in a clear and concise manner.\n\nFor math or code related questions, it would show step-by-step solutions or code examples.\n\nIf the query was about a specific topic, it would provide all relevant information and context from the book, ensuring the explanation is comprehensive and accurate.`,
        bookName: currentBook.name,
        chapter: explanationChapter,
        timestamp: Date.now()
      };
      
      setExplanations(prev => [...prev, newExplanation]);
      setIsExplanationModalOpen(false);
      setActiveTab('explanations');
      
    } catch (error) {
      console.error('Error generating explanation:', error);
      alert('Failed to generate explanation. Please try again.');
    } finally {
      setIsGeneratingExplanation(false);
    }
  };

  // Start a test
  const startTest = (testId: string) => {
    setTests(prev => 
      prev.map(test => 
        test.id === testId 
          ? { ...test, isActive: true, currentQuestion: 0, timeRemaining: test.timeLimit * 60 }
          : test
      )
    );
    
    const test = tests.find(t => t.id === testId);
    if (test) {
      setActiveTest({ ...test, isActive: true, currentQuestion: 0, timeRemaining: test.timeLimit * 60 });
      setIsTestViewModalOpen(true);
    }
  };

  // Submit an answer to a question
  const submitAnswer = (questionId: string, answer: string) => {
    if (!activeTest) return;
    
    const questionIndex = activeTest.questions.findIndex(q => q.id === questionId);
    if (questionIndex === -1) return;
    
    const question = activeTest.questions[questionIndex];
    const isCorrect = question.type === 'multiple-choice' 
      ? answer === question.correctAnswer 
      : false; // For non-multiple choice, we'll evaluate later
    
    // Update the question with the user's answer
    const updatedQuestions = [...activeTest.questions];
    updatedQuestions[questionIndex] = {
      ...question,
      userAnswer: answer,
      isCorrect: question.type === 'multiple-choice' ? isCorrect : undefined
    };
    
    // Update the active test
    const updatedTest = {
      ...activeTest,
      questions: updatedQuestions,
      currentQuestion: Math.min(activeTest.currentQuestion + 1, activeTest.questions.length - 1)
    };
    
    setActiveTest(updatedTest);
    
    // Update the tests state
    setTests(prev => 
      prev.map(test => 
        test.id === activeTest.id ? updatedTest : test
      )
    );
  };

  // Submit the entire test
  const submitTest = () => {
    if (!activeTest) return;
    
    // Calculate score for multiple choice questions
    const answeredQuestions = activeTest.questions.filter(q => q.userAnswer);
    const correctAnswers = activeTest.questions.filter(q => q.type === 'multiple-choice' && q.isCorrect);
    
    const multipleChoiceTotal = activeTest.questions.filter(q => q.type === 'multiple-choice').length;
    const multipleChoiceScore = correctAnswers.length;
    
    // Calculate a preliminary score as a percentage of multiple choice questions
    const preliminaryScore = multipleChoiceTotal > 0 
      ? Math.round((multipleChoiceScore / multipleChoiceTotal) * 100) 
      : 0;
    
    // Update the test
    const updatedTest = {
      ...activeTest,
      isActive: false,
      isCompleted: true,
      score: preliminaryScore
    };
    
    setActiveTest(updatedTest);
    
    // Update the tests state
    setTests(prev => 
      prev.map(test => 
        test.id === activeTest.id ? updatedTest : test
      )
    );
    
    setIsTestViewModalOpen(false);
    alert(`Test submitted! Your preliminary score is ${preliminaryScore}%. Non-multiple choice questions will be evaluated by AI.`);
  };

  // Format time for display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 overflow-auto p-6 bg-[#1e1e1e]" id="book-learning-panel">
      <h2 className="text-2xl font-semibold mb-6 text-[#0078d4]">Book Learning</h2>
      
      {/* Tab navigation */}
      <div className="flex border-b border-[#333333] mb-6">
        <button 
          className={`px-4 py-2 ${activeTab === 'books' ? 'border-b-2 border-[#0078d4] text-white' : 'text-gray-400'}`}
          onClick={() => setActiveTab('books')}
        >
          My Books
        </button>
        <button 
          className={`px-4 py-2 ${activeTab === 'tests' ? 'border-b-2 border-[#0078d4] text-white' : 'text-gray-400'}`}
          onClick={() => setActiveTab('tests')}
        >
          Tests
        </button>
        <button 
          className={`px-4 py-2 ${activeTab === 'explanations' ? 'border-b-2 border-[#0078d4] text-white' : 'text-gray-400'}`}
          onClick={() => setActiveTab('explanations')}
        >
          Explanations
        </button>
      </div>
      
      {/* Books Tab */}
      {activeTab === 'books' && (
        <div>
          <div className="mb-6 flex items-center">
            <button 
              className="px-4 py-2 bg-[#0078d4] text-white rounded flex items-center hover:bg-opacity-90"
              onClick={() => document.getElementById('book-file-upload')?.click()}
            >
              <i className="ri-upload-line mr-2"></i> Upload Book (PDF)
            </button>
            <input 
              type="file" 
              id="book-file-upload" 
              className="hidden" 
              accept=".pdf"
              onChange={handleFileUpload}
            />
            
            {!apiKey && (
              <button 
                className="ml-4 px-4 py-2 bg-[#d83b01] text-white rounded flex items-center hover:bg-opacity-90"
                onClick={() => setIsApiKeyModalOpen(true)}
              >
                <i className="ri-key-2-line mr-2"></i> Set API Key
              </button>
            )}
          </div>
          
          {uploadedBooks.length === 0 ? (
            <div className="text-center py-12 bg-[#252526] rounded-lg border border-[#333333]">
              <i className="ri-book-open-line text-6xl text-gray-400 mb-4"></i>
              <p className="text-gray-400">No books uploaded yet. Upload a PDF to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {uploadedBooks.map(book => (
                <div 
                  key={book.id} 
                  className={`bg-[#252526] rounded-lg border ${currentBook?.id === book.id ? 'border-[#0078d4]' : 'border-[#333333]'} p-5 flex flex-col`}
                  onClick={() => setCurrentBook(book)}
                >
                  <div className="flex items-center mb-3">
                    <i className="ri-file-pdf-line text-2xl text-red-500 mr-2"></i>
                    <h3 className="text-lg font-medium truncate">{book.name}</h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">Filename: {book.fileName}</p>
                  <p className="text-gray-400 text-sm">Uploaded: {new Date(book.uploadDate).toLocaleDateString()}</p>
                  
                  <div className="mt-auto pt-4 flex justify-between">
                    <button 
                      className="px-3 py-1 bg-[#0078d4] text-white rounded text-sm hover:bg-opacity-90"
                      onClick={() => {
                        setCurrentBook(book);
                        setIsCreateTestModalOpen(true);
                      }}
                    >
                      Create Test
                    </button>
                    <button 
                      className="px-3 py-1 bg-[#0078d4] text-white rounded text-sm hover:bg-opacity-90"
                      onClick={() => {
                        setCurrentBook(book);
                        setIsExplanationModalOpen(true);
                      }}
                    >
                      Get Explanation
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Tests Tab */}
      {activeTab === 'tests' && (
        <div>
          {tests.length === 0 ? (
            <div className="text-center py-12 bg-[#252526] rounded-lg border border-[#333333]">
              <i className="ri-file-list-3-line text-6xl text-gray-400 mb-4"></i>
              <p className="text-gray-400">No tests created yet. Select a book and create a test to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tests.map(test => (
                <div 
                  key={test.id} 
                  className="bg-[#252526] rounded-lg border border-[#333333] p-5"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium">{test.title}</h3>
                      <p className="text-gray-400 text-sm mt-1">Book: {test.bookName}</p>
                      <p className="text-gray-400 text-sm">Chapters: {test.chapters}</p>
                      <p className="text-gray-400 text-sm">Questions: {test.questions.length}</p>
                      <p className="text-gray-400 text-sm">Time limit: {test.timeLimit} minutes</p>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      {test.isCompleted ? (
                        <div className="bg-[#107c10] px-3 py-1 rounded text-white text-sm mb-2">
                          Score: {test.score || 'Pending'}%
                        </div>
                      ) : test.isActive ? (
                        <div className="bg-[#d83b01] px-3 py-1 rounded text-white text-sm mb-2">
                          In Progress
                        </div>
                      ) : (
                        <div className="bg-[#0078d4] px-3 py-1 rounded text-white text-sm mb-2">
                          Ready
                        </div>
                      )}
                      
                      <button 
                        className={`px-3 py-1 ${test.isCompleted ? 'bg-[#333333]' : 'bg-[#107c10]'} text-white rounded mt-2 hover:bg-opacity-90`}
                        onClick={() => startTest(test.id)}
                        disabled={test.isCompleted}
                      >
                        {test.isCompleted ? 'Completed' : test.isActive ? 'Continue' : 'Start Test'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Explanations Tab */}
      {activeTab === 'explanations' && (
        <div>
          {explanations.length === 0 ? (
            <div className="text-center py-12 bg-[#252526] rounded-lg border border-[#333333]">
              <i className="ri-question-answer-line text-6xl text-gray-400 mb-4"></i>
              <p className="text-gray-400">No explanations generated yet. Select a book and ask for an explanation to get started.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {explanations.map(explanation => (
                <div 
                  key={explanation.timestamp} 
                  className="bg-[#252526] rounded-lg border border-[#333333] p-5"
                >
                  <h3 className="text-lg font-medium text-[#0078d4]">{explanation.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">Book: {explanation.bookName}</p>
                  <p className="text-gray-400 text-sm mb-3">Chapter: {explanation.chapter}</p>
                  
                  <div className="bg-[#1e1e1e] rounded p-4 mt-2 whitespace-pre-line">
                    {explanation.explanation}
                  </div>
                  
                  <p className="text-gray-400 text-xs mt-2 text-right">
                    Generated on {new Date(explanation.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Create Test Modal */}
      {isCreateTestModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-[#252526] rounded-lg w-full max-w-md p-6">
            <h3 className="text-xl font-semibold mb-4">Create Test</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Book</label>
                <input 
                  type="text" 
                  value={currentBook?.name || ''} 
                  readOnly 
                  className="w-full p-2 bg-[#333333] rounded border border-[#444444] text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Chapters (comma separated)</label>
                <input 
                  type="text" 
                  placeholder="e.g. 1-3, 5, 7-9" 
                  value={chaptersInput}
                  onChange={(e) => setChaptersInput(e.target.value)}
                  className="w-full p-2 bg-[#1e1e1e] rounded border border-[#444444] text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Number of Questions</label>
                <select 
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  className="w-full p-2 bg-[#1e1e1e] rounded border border-[#444444] text-white"
                >
                  {[5, 10, 15, 20, 25].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Difficulty</label>
                <select 
                  value={difficultyLevel}
                  onChange={(e) => setDifficultyLevel(e.target.value as 'Easy' | 'Medium' | 'Hard')}
                  className="w-full p-2 bg-[#1e1e1e] rounded border border-[#444444] text-white"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Time Limit (minutes)</label>
                <select 
                  value={testDuration}
                  onChange={(e) => setTestDuration(parseInt(e.target.value))}
                  className="w-full p-2 bg-[#1e1e1e] rounded border border-[#444444] text-white"
                >
                  {[15, 30, 45, 60, 90, 120].map(min => (
                    <option key={min} value={min}>{min} minutes</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                className="px-4 py-2 bg-[#333333] text-white rounded hover:bg-opacity-90"
                onClick={() => setIsCreateTestModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-[#0078d4] text-white rounded hover:bg-opacity-90 flex items-center"
                onClick={generateTest}
                disabled={isGeneratingTest || !chaptersInput.trim()}
              >
                {isGeneratingTest ? (
                  <>Generating... <i className="ri-loader-4-line ml-2 animate-spin"></i></>
                ) : (
                  <>Generate Test</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Create Explanation Modal */}
      {isExplanationModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-[#252526] rounded-lg w-full max-w-md p-6">
            <h3 className="text-xl font-semibold mb-4">Get Explanation</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Book</label>
                <input 
                  type="text" 
                  value={currentBook?.name || ''} 
                  readOnly 
                  className="w-full p-2 bg-[#333333] rounded border border-[#444444] text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Chapter</label>
                <input 
                  type="text" 
                  placeholder="e.g. Chapter 3" 
                  value={explanationChapter}
                  onChange={(e) => setExplanationChapter(e.target.value)}
                  className="w-full p-2 bg-[#1e1e1e] rounded border border-[#444444] text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Query</label>
                <textarea 
                  placeholder="What would you like explained?" 
                  value={explanationQuery}
                  onChange={(e) => setExplanationQuery(e.target.value)}
                  className="w-full p-2 bg-[#1e1e1e] rounded border border-[#444444] text-white"
                  rows={4}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                className="px-4 py-2 bg-[#333333] text-white rounded hover:bg-opacity-90"
                onClick={() => setIsExplanationModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-[#0078d4] text-white rounded hover:bg-opacity-90 flex items-center"
                onClick={generateExplanation}
                disabled={isGeneratingExplanation || !explanationQuery.trim() || !explanationChapter.trim()}
              >
                {isGeneratingExplanation ? (
                  <>Generating... <i className="ri-loader-4-line ml-2 animate-spin"></i></>
                ) : (
                  <>Get Explanation</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Test View Modal */}
      {isTestViewModalOpen && activeTest && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-[#252526] rounded-lg w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{activeTest.title}</h3>
              <div className="flex items-center">
                <div className="px-3 py-1 bg-[#333333] rounded mr-3 font-mono">
                  {formatTime(activeTest.timeRemaining)}
                </div>
                <button
                  className="text-gray-400 hover:text-white"
                  onClick={() => {
                    if (confirm('Are you sure you want to exit the test? Your progress will be saved.')) {
                      setIsTestViewModalOpen(false);
                    }
                  }}
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
            </div>
            
            <div className="mb-4 flex justify-between text-sm text-gray-400">
              <div>Question {activeTest.currentQuestion + 1} of {activeTest.questions.length}</div>
              <div>{activeTest.bookName} - Chapter(s) {activeTest.chapters}</div>
            </div>
            
            {/* Current Question */}
            {activeTest.questions[activeTest.currentQuestion] && (
              <div className="bg-[#1e1e1e] rounded-lg p-4 mb-4">
                <div className="mb-4">
                  <p className="text-gray-400 text-sm mb-1">
                    {activeTest.questions[activeTest.currentQuestion].type === 'multiple-choice' ? 'Multiple Choice' : 
                     activeTest.questions[activeTest.currentQuestion].type === 'short-answer' ? 'Short Answer' :
                     activeTest.questions[activeTest.currentQuestion].type === 'coding' ? 'Coding Question' : 'Math Problem'}
                  </p>
                  <h4 className="text-lg font-medium">{activeTest.questions[activeTest.currentQuestion].question}</h4>
                </div>
                
                {/* Question Content based on type */}
                {activeTest.questions[activeTest.currentQuestion].type === 'multiple-choice' && (
                  <div className="space-y-2">
                    {activeTest.questions[activeTest.currentQuestion].options?.map((option, index) => (
                      <div 
                        key={index}
                        className={`p-3 rounded-lg border ${
                          activeTest.questions[activeTest.currentQuestion].userAnswer === option
                            ? 'border-[#0078d4] bg-[#0078d4] bg-opacity-10'
                            : 'border-[#333333] hover:border-[#444444]'
                        } cursor-pointer`}
                        onClick={() => {
                          if (!activeTest.isActive) return;
                          submitAnswer(activeTest.questions[activeTest.currentQuestion].id, option);
                        }}
                      >
                        <div className="flex items-center">
                          <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${
                            activeTest.questions[activeTest.currentQuestion].userAnswer === option
                              ? 'bg-[#0078d4]'
                              : 'border border-[#444444]'
                          }`}>
                            {activeTest.questions[activeTest.currentQuestion].userAnswer === option && (
                              <i className="ri-check-line text-white text-sm"></i>
                            )}
                          </div>
                          <div>{option}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {activeTest.questions[activeTest.currentQuestion].type === 'short-answer' && (
                  <div>
                    <textarea 
                      className="w-full p-3 bg-[#252526] border border-[#333333] rounded-lg text-white"
                      placeholder="Type your answer here"
                      rows={5}
                      value={activeTest.questions[activeTest.currentQuestion].userAnswer || ''}
                      onChange={(e) => {
                        if (!activeTest.isActive) return;
                        
                        // Update only the local state for better UX
                        const updatedQuestions = [...activeTest.questions];
                        updatedQuestions[activeTest.currentQuestion] = {
                          ...updatedQuestions[activeTest.currentQuestion],
                          userAnswer: e.target.value
                        };
                        
                        setActiveTest({
                          ...activeTest,
                          questions: updatedQuestions
                        });
                      }}
                    />
                    <button 
                      className="mt-3 px-3 py-1 bg-[#0078d4] text-white rounded hover:bg-opacity-90"
                      onClick={() => {
                        if (!activeTest.isActive) return;
                        submitAnswer(
                          activeTest.questions[activeTest.currentQuestion].id, 
                          activeTest.questions[activeTest.currentQuestion].userAnswer || ''
                        );
                      }}
                    >
                      Save & Continue
                    </button>
                  </div>
                )}
                
                {(activeTest.questions[activeTest.currentQuestion].type === 'coding' || 
                 activeTest.questions[activeTest.currentQuestion].type === 'math') && (
                  <div>
                    <textarea 
                      className="w-full p-3 bg-[#252526] border border-[#333333] rounded-lg text-white font-mono"
                      placeholder={activeTest.questions[activeTest.currentQuestion].type === 'coding' 
                        ? "Write your code here" 
                        : "Write your solution here"}
                      rows={8}
                      value={activeTest.questions[activeTest.currentQuestion].userAnswer || ''}
                      onChange={(e) => {
                        if (!activeTest.isActive) return;
                        
                        // Update only the local state for better UX
                        const updatedQuestions = [...activeTest.questions];
                        updatedQuestions[activeTest.currentQuestion] = {
                          ...updatedQuestions[activeTest.currentQuestion],
                          userAnswer: e.target.value
                        };
                        
                        setActiveTest({
                          ...activeTest,
                          questions: updatedQuestions
                        });
                      }}
                    />
                    <button 
                      className="mt-3 px-3 py-1 bg-[#0078d4] text-white rounded hover:bg-opacity-90"
                      onClick={() => {
                        if (!activeTest.isActive) return;
                        submitAnswer(
                          activeTest.questions[activeTest.currentQuestion].id, 
                          activeTest.questions[activeTest.currentQuestion].userAnswer || ''
                        );
                      }}
                    >
                      Save & Continue
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Navigation */}
            <div className="flex justify-between">
              <button
                className="px-3 py-1 bg-[#333333] text-white rounded hover:bg-opacity-90"
                onClick={() => {
                  if (activeTest.currentQuestion > 0) {
                    setActiveTest({
                      ...activeTest,
                      currentQuestion: activeTest.currentQuestion - 1
                    });
                  }
                }}
                disabled={activeTest.currentQuestion === 0}
              >
                Previous
              </button>
              
              <div className="flex space-x-2">
                {activeTest.questions.map((_, index) => (
                  <button
                    key={index}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activeTest.currentQuestion === index
                        ? 'bg-[#0078d4] text-white'
                        : activeTest.questions[index].userAnswer
                          ? 'bg-[#107c10] text-white'
                          : 'bg-[#333333] text-white'
                    }`}
                    onClick={() => {
                      setActiveTest({
                        ...activeTest,
                        currentQuestion: index
                      });
                    }}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              {activeTest.currentQuestion === activeTest.questions.length - 1 ? (
                <button
                  className="px-3 py-1 bg-[#d83b01] text-white rounded hover:bg-opacity-90"
                  onClick={() => {
                    if (confirm('Are you sure you want to submit the test? You cannot make changes after submission.')) {
                      submitTest();
                    }
                  }}
                >
                  Submit Test
                </button>
              ) : (
                <button
                  className="px-3 py-1 bg-[#0078d4] text-white rounded hover:bg-opacity-90"
                  onClick={() => {
                    if (activeTest.currentQuestion < activeTest.questions.length - 1) {
                      setActiveTest({
                        ...activeTest,
                        currentQuestion: activeTest.currentQuestion + 1
                      });
                    }
                  }}
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* API Key Modal */}
      {isApiKeyModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-[#252526] rounded-lg w-full max-w-md p-6">
            <h3 className="text-xl font-semibold mb-4">Set API Key</h3>
            <p className="mb-4 text-gray-300">
              An OpenAI API key is required to generate tests and explanations. Your API key will be stored securely in your browser's local storage.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">OpenAI API Key</label>
              <input 
                type="password" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full p-2 bg-[#1e1e1e] border border-[#444444] text-white rounded"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-[#333333] text-white rounded hover:bg-opacity-90"
                onClick={() => setIsApiKeyModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-[#0078d4] text-white rounded hover:bg-opacity-90"
                onClick={() => {
                  if (apiKey.trim()) {
                    localStorage.setItem('openai-api-key', apiKey);
                    setIsApiKeyModalOpen(false);
                  } else {
                    alert('Please enter a valid API key');
                  }
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookLearning;