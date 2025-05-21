import { users, type User, type InsertUser, snippets, type Snippet, type InsertSnippet, examples, type Example, type InsertExample, resources, type Resource, type InsertResource } from "@shared/schema";

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Snippet operations
  getSnippets(userId?: number): Promise<Snippet[]>;
  getSnippet(id: number): Promise<Snippet | undefined>;
  createSnippet(snippet: InsertSnippet): Promise<Snippet>;
  
  // Example operations
  getExamples(): Promise<Example[]>;
  getExample(id: number): Promise<Example | undefined>;
  getExamplesByCategory(category: string): Promise<Example[]>;
  createExample(example: InsertExample): Promise<Example>;
  
  // Resource operations
  getResources(): Promise<Resource[]>;
  getResource(id: number): Promise<Resource | undefined>;
  getResourcesByCategory(category: string): Promise<Resource[]>;
  createResource(resource: InsertResource): Promise<Resource>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private snippets: Map<number, Snippet>;
  private examples: Map<number, Example>;
  private resources: Map<number, Resource>;
  
  private currentUserId: number;
  private currentSnippetId: number;
  private currentExampleId: number;
  private currentResourceId: number;

  constructor() {
    this.users = new Map();
    this.snippets = new Map();
    this.examples = new Map();
    this.resources = new Map();
    
    this.currentUserId = 1;
    this.currentSnippetId = 1;
    this.currentExampleId = 1;
    this.currentResourceId = 1;
    
    // Initialize with sample data
    this.initializeExamples();
    this.initializeResources();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Snippet methods
  async getSnippets(userId?: number): Promise<Snippet[]> {
    const snippets = Array.from(this.snippets.values());
    if (userId !== undefined) {
      return snippets.filter(snippet => snippet.userId === userId);
    }
    return snippets;
  }
  
  async getSnippet(id: number): Promise<Snippet | undefined> {
    return this.snippets.get(id);
  }
  
  async createSnippet(insertSnippet: InsertSnippet): Promise<Snippet> {
    const id = this.currentSnippetId++;
    const snippet: Snippet = { ...insertSnippet, id };
    this.snippets.set(id, snippet);
    return snippet;
  }
  
  // Example methods
  async getExamples(): Promise<Example[]> {
    return Array.from(this.examples.values());
  }
  
  async getExample(id: number): Promise<Example | undefined> {
    return this.examples.get(id);
  }
  
  async getExamplesByCategory(category: string): Promise<Example[]> {
    return Array.from(this.examples.values()).filter(
      example => example.category === category
    );
  }
  
  async createExample(insertExample: InsertExample): Promise<Example> {
    const id = this.currentExampleId++;
    const example: Example = { ...insertExample, id };
    this.examples.set(id, example);
    return example;
  }
  
  // Resource methods
  async getResources(): Promise<Resource[]> {
    return Array.from(this.resources.values());
  }
  
  async getResource(id: number): Promise<Resource | undefined> {
    return this.resources.get(id);
  }
  
  async getResourcesByCategory(category: string): Promise<Resource[]> {
    return Array.from(this.resources.values()).filter(
      resource => resource.category === category
    );
  }
  
  async createResource(insertResource: InsertResource): Promise<Resource> {
    const id = this.currentResourceId++;
    const resource: Resource = { ...insertResource, id };
    this.resources.set(id, resource);
    return resource;
  }
  
  // Helper method to initialize examples
  private initializeExamples() {
    const exampleData: InsertExample[] = [
      // Q Language Examples
      {
        name: "Hello World (Q)",
        code: `"Hello, KDB Q world!"`,
        category: "Q Basic Operations"
      },
      {
        name: "Basic Arithmetic (Q)",
        code: `// Basic math operations
2 + 3 * 4
5 % 2  // division
2 xexp 8  // power`,
        category: "Q Basic Operations"
      },
      {
        name: "Lists (Q)",
        code: `// Creating lists
numbers: 1 2 3 4 5
mixed: (1; "a"; 2.5)
first numbers  // get first element
1 _ numbers    // drop first element`,
        category: "Q Data Structures"
      },
      {
        name: "Dictionaries (Q)",
        code: `// Creating a dictionary
dict: \`a\`b\`c!1 2 3
dict[\`a]  // accessing values
\`d\`e!(4 5) , dict  // joining dictionaries`,
        category: "Q Data Structures"
      },
      {
        name: "Creating Tables (Q)",
        code: `// Simple table creation
employees: ([]
    name: \`John\`Emma\`David;
    age: 35 28 42;
    department: \`IT\`HR\`Finance
)`,
        category: "Q Tables"
      },
      {
        name: "Table Queries (Q)",
        code: `// Basic select query
select from employees where age > 30

// Aggregation
select avg age, count i by department from employees`,
        category: "Q Tables"
      },
      {
        name: "Function Definition (Q)",
        code: `// Define a simple function
add: {[x;y] x + y}
add[3;4]  // returns 7

// Function with implicit parameters
multiply: {x * y}
multiply[5;6]  // returns 30`,
        category: "Q Functions"
      },
      {
        name: "Adverbs (Q)",
        code: `// Each adverb
squares: {x*x} each 1 2 3 4 5

// Scan adverb (running calculations)
sums: (+\\) 1 2 3 4 5  // running sum`,
        category: "Q Functions"
      },
      
      // Python Examples
      {
        name: "Hello World (Python)",
        code: `# Simple print statement
print("Hello, Python world!")`,
        category: "Python Basics"
      },
      {
        name: "Variables & Types (Python)",
        code: `# Variables and basic types
name = "Python"
version = 3.10
is_awesome = True

# Type checking
print(f"Name: {name}, Type: {type(name)}")
print(f"Version: {version}, Type: {type(version)}")
print(f"Is Awesome: {is_awesome}, Type: {type(is_awesome)}")`,
        category: "Python Basics"
      },
      {
        name: "Lists & Dictionaries (Python)",
        code: `# Lists in Python
numbers = [1, 2, 3, 4, 5]
mixed = [1, "hello", 3.14, True]

# List operations
print(numbers[0])  # First element
print(numbers[-1])  # Last element
print(numbers[1:3])  # Slicing

# Dictionaries
person = {
    "name": "Alice",
    "age": 30,
    "skills": ["Python", "Data Science", "Machine Learning"]
}

print(person["name"])
print(person.get("location", "Not specified"))  # With default value`,
        category: "Python Data Structures"
      },
      {
        name: "Loops & Comprehensions (Python)",
        code: `# For loop
for i in range(5):
    print(i)
    
# While loop
count = 0
while count < 5:
    print(f"Count: {count}")
    count += 1
    
# List comprehension
squares = [x**2 for x in range(10)]
print(squares)

# Dictionary comprehension
word_lengths = {word: len(word) for word in ["Python", "is", "awesome"]}
print(word_lengths)`,
        category: "Python Control Flow"
      },
      {
        name: "Functions (Python)",
        code: `# Basic function
def greet(name, greeting="Hello"):
    """Return a greeting for the specified name."""
    return f"{greeting}, {name}!"

print(greet("World"))
print(greet("Python", "Welcome"))

# Lambda functions
square = lambda x: x**2
print(square(5))

# Higher-order functions
numbers = [1, 2, 3, 4, 5]
squared = list(map(square, numbers))
evens = list(filter(lambda x: x % 2 == 0, numbers))
print(squared)
print(evens)`,
        category: "Python Functions"
      },
      {
        name: "Classes & OOP (Python)",
        code: `# Simple class definition
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age
        
    def greet(self):
        return f"Hello, my name is {self.name} and I'm {self.age} years old."
        
    @property
    def is_adult(self):
        return self.age >= 18
        
# Creating instances
alice = Person("Alice", 30)
bob = Person("Bob", 15)

print(alice.greet())
print(f"Is Alice an adult? {alice.is_adult}")
print(f"Is Bob an adult? {bob.is_adult}")`,
        category: "Python OOP"
      },
      {
        name: "Error Handling (Python)",
        code: `# Try-except blocks
try:
    value = 10 / 0
except ZeroDivisionError as e:
    print(f"Caught an error: {e}")
finally:
    print("This always executes")
    
# Raising exceptions
def validate_age(age):
    if age < 0:
        raise ValueError("Age cannot be negative")
    return age
    
try:
    validate_age(-5)
except ValueError as e:
    print(f"Validation error: {e}")`,
        category: "Python Error Handling"
      },
      {
        name: "Data Analysis with Python",
        code: `# Data analysis example
import math

data = [10, 15, 20, 25, 30]

# Basic statistics
mean = sum(data) / len(data)
variance = sum((x - mean) ** 2 for x in data) / len(data)
std_dev = math.sqrt(variance)

print(f"Data: {data}")
print(f"Mean: {mean}")
print(f"Variance: {variance}")
print(f"Standard Deviation: {std_dev}")

# Sorted data and median
sorted_data = sorted(data)
n = len(sorted_data)
median = sorted_data[n//2] if n % 2 != 0 else (sorted_data[n//2 - 1] + sorted_data[n//2]) / 2

print(f"Median: {median}")
print(f"Min: {min(data)}")
print(f"Max: {max(data)}")`,
        category: "Python Data Analysis"
      },
    ];
    
    exampleData.forEach(example => {
      this.createExample(example);
    });
  }
  
  // Helper method to initialize resources
  private initializeResources() {
    const resourceData: InsertResource[] = [
      // Q Language Resources
      {
        name: "KDB+ Reference Manual",
        url: "https://code.kx.com/q/ref/",
        description: "Comprehensive guide to KDB+ and Q language",
        category: "Q Official Documentation"
      },
      {
        name: "Q Language Reference",
        url: "https://code.kx.com/q/ref/card/",
        description: "Official reference for the Q programming language",
        category: "Q Official Documentation"
      },
      {
        name: "KX Systems Documentation",
        url: "https://code.kx.com/q/",
        description: "Official documentation from KX Systems",
        category: "Q Official Documentation"
      },
      {
        name: "Q for Mortals",
        url: "https://code.kx.com/q4m3/",
        description: "Popular introduction to Q programming",
        category: "Q Tutorials & Guides"
      },
      {
        name: "Learn Q",
        url: "https://code.kx.com/q/learn/",
        description: "Step-by-step tutorial for beginners",
        category: "Q Tutorials & Guides"
      },
      {
        name: "AquaQ Analytics Tutorials",
        url: "https://www.aquaq.co.uk/q-for-beginners/",
        description: "Free training resources from AquaQ Analytics",
        category: "Q Tutorials & Guides"
      },
      {
        name: "KDB+ Personal Developers Forum",
        url: "https://community.kx.com/",
        description: "Community forum for KDB+ developers",
        category: "Q Community & Forums"
      },
      {
        name: "Stack Overflow KDB/Q Tag",
        url: "https://stackoverflow.com/questions/tagged/kdb%2B",
        description: "Questions and answers from the Stack Overflow community",
        category: "Q Community & Forums"
      },
      {
        name: "Reddit r/kdb",
        url: "https://www.reddit.com/r/kdb/",
        description: "Reddit community for KDB+ and Q discussions",
        category: "Q Community & Forums"
      },
      {
        name: "KX Systems YouTube Channel",
        url: "https://www.youtube.com/c/KxSystems",
        description: "Official videos and tutorials from KX Systems",
        category: "Q Videos & Courses"
      },
      {
        name: "KDB+ Fundamentals Course",
        url: "https://kx.com/academy/",
        description: "Free introductory course to KDB+ and Q",
        category: "Q Videos & Courses"
      },
      {
        name: "Advanced KDB+ Programming",
        url: "https://kx.com/academy/",
        description: "Advanced techniques and best practices",
        category: "Q Videos & Courses"
      },
      
      // Python Resources
      {
        name: "Python Official Documentation",
        url: "https://docs.python.org/3/",
        description: "Comprehensive official Python language documentation",
        category: "Python Official Documentation"
      },
      {
        name: "Python.org",
        url: "https://www.python.org/",
        description: "Python's official website with downloads, guides and community resources",
        category: "Python Official Documentation"
      },
      {
        name: "Python Package Index (PyPI)",
        url: "https://pypi.org/",
        description: "Repository of software for the Python programming language",
        category: "Python Official Documentation"
      },
      {
        name: "Real Python",
        url: "https://realpython.com/",
        description: "Python tutorials for developers of all skill levels",
        category: "Python Tutorials & Guides"
      },
      {
        name: "W3Schools Python Tutorial",
        url: "https://www.w3schools.com/python/",
        description: "Free Python tutorial with examples and exercises for beginners",
        category: "Python Tutorials & Guides"
      },
      {
        name: "Automate the Boring Stuff",
        url: "https://automatetheboringstuff.com/",
        description: "Practical programming for total beginners",
        category: "Python Tutorials & Guides"
      },
      {
        name: "Python Crash Course",
        url: "https://nostarch.com/pythoncrashcourse2e",
        description: "Popular book for Python beginners with hands-on projects",
        category: "Python Tutorials & Guides"
      },
      {
        name: "Stack Overflow Python Tag",
        url: "https://stackoverflow.com/questions/tagged/python",
        description: "Q&A for Python programmers",
        category: "Python Community & Forums"
      },
      {
        name: "Reddit r/Python",
        url: "https://www.reddit.com/r/Python/",
        description: "Reddit community for Python discussions",
        category: "Python Community & Forums"
      },
      {
        name: "Python Discord",
        url: "https://pythondiscord.com/",
        description: "Community discord server for Python developers",
        category: "Python Community & Forums"
      },
      {
        name: "Corey Schafer's YouTube Channel",
        url: "https://www.youtube.com/user/schafer5",
        description: "In-depth Python tutorial videos",
        category: "Python Videos & Courses"
      },
      {
        name: "Coursera Python Courses",
        url: "https://www.coursera.org/courses?query=python",
        description: "Online Python courses from top universities",
        category: "Python Videos & Courses"
      },
      {
        name: "freeCodeCamp Python Course",
        url: "https://www.freecodecamp.org/learn/scientific-computing-with-python/",
        description: "Free curriculum for learning Python with certifications",
        category: "Python Videos & Courses"
      },
      {
        name: "DataCamp Python Courses",
        url: "https://www.datacamp.com/courses/tech:python",
        description: "Interactive Python courses focusing on data science",
        category: "Python Videos & Courses"
      },
      {
        name: "Kaggle Python Tutorials",
        url: "https://www.kaggle.com/learn/python",
        description: "Free Python courses with a focus on data science",
        category: "Python Data Science"
      },
      {
        name: "PyTorch Documentation",
        url: "https://pytorch.org/docs/stable/index.html",
        description: "Documentation for the popular ML framework",
        category: "Python Machine Learning"
      },
      {
        name: "TensorFlow Documentation",
        url: "https://www.tensorflow.org/api_docs",
        description: "Documentation for Google's ML framework",
        category: "Python Machine Learning"
      },
      {
        name: "Django Documentation",
        url: "https://docs.djangoproject.com/",
        description: "Documentation for the Django web framework",
        category: "Python Web Development"
      },
      {
        name: "Flask Documentation",
        url: "https://flask.palletsprojects.com/",
        description: "Documentation for the Flask web framework",
        category: "Python Web Development"
      }
    ];
    
    resourceData.forEach(resource => {
      this.createResource(resource);
    });
  }
}

export const storage = new MemStorage();
