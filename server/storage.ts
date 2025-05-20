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
      {
        name: "Hello World",
        code: `"Hello, KDB Q world!"`,
        category: "Basic Operations"
      },
      {
        name: "Basic Arithmetic",
        code: `// Basic math operations
2 + 3 * 4
5 % 2  // division
2 xexp 8  // power`,
        category: "Basic Operations"
      },
      {
        name: "Lists",
        code: `// Creating lists
numbers: 1 2 3 4 5
mixed: (1; "a"; 2.5)
first numbers  // get first element
1 _ numbers    // drop first element`,
        category: "Data Structures"
      },
      {
        name: "Dictionaries",
        code: `// Creating a dictionary
dict: \`a\`b\`c!1 2 3
dict[\`a]  // accessing values
\`d\`e!(4 5) , dict  // joining dictionaries`,
        category: "Data Structures"
      },
      {
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
        name: "Table Queries",
        code: `// Basic select query
select from employees where age > 30

// Aggregation
select avg age, count i by department from employees`,
        category: "Tables"
      },
      {
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
        name: "Adverbs",
        code: `// Each adverb
squares: {x*x} each 1 2 3 4 5

// Scan adverb (running calculations)
sums: (+\\) 1 2 3 4 5  // running sum`,
        category: "Functions"
      }
    ];
    
    exampleData.forEach(example => {
      this.createExample(example);
    });
  }
  
  // Helper method to initialize resources
  private initializeResources() {
    const resourceData: InsertResource[] = [
      {
        name: "KDB+ Reference Manual",
        url: "https://code.kx.com/q/ref/",
        description: "Comprehensive guide to KDB+ and Q language",
        category: "Official Documentation"
      },
      {
        name: "Q Language Reference",
        url: "https://code.kx.com/q/ref/card/",
        description: "Official reference for the Q programming language",
        category: "Official Documentation"
      },
      {
        name: "KX Systems Documentation",
        url: "https://code.kx.com/q/",
        description: "Official documentation from KX Systems",
        category: "Official Documentation"
      },
      {
        name: "Q for Mortals",
        url: "https://code.kx.com/q4m3/",
        description: "Popular introduction to Q programming",
        category: "Tutorials & Guides"
      },
      {
        name: "Learn Q",
        url: "https://code.kx.com/q/learn/",
        description: "Step-by-step tutorial for beginners",
        category: "Tutorials & Guides"
      },
      {
        name: "AquaQ Analytics Tutorials",
        url: "https://www.aquaq.co.uk/q-for-beginners/",
        description: "Free training resources from AquaQ Analytics",
        category: "Tutorials & Guides"
      },
      {
        name: "KDB+ Personal Developers Forum",
        url: "https://community.kx.com/",
        description: "Community forum for KDB+ developers",
        category: "Community & Forums"
      },
      {
        name: "Stack Overflow KDB/Q Tag",
        url: "https://stackoverflow.com/questions/tagged/kdb%2B",
        description: "Questions and answers from the Stack Overflow community",
        category: "Community & Forums"
      },
      {
        name: "Reddit r/kdb",
        url: "https://www.reddit.com/r/kdb/",
        description: "Reddit community for KDB+ and Q discussions",
        category: "Community & Forums"
      },
      {
        name: "KX Systems YouTube Channel",
        url: "https://www.youtube.com/c/KxSystems",
        description: "Official videos and tutorials from KX Systems",
        category: "Videos & Courses"
      },
      {
        name: "KDB+ Fundamentals Course",
        url: "https://kx.com/academy/",
        description: "Free introductory course to KDB+ and Q",
        category: "Videos & Courses"
      },
      {
        name: "Advanced KDB+ Programming",
        url: "https://kx.com/academy/",
        description: "Advanced techniques and best practices",
        category: "Videos & Courses"
      }
    ];
    
    resourceData.forEach(resource => {
      this.createResource(resource);
    });
  }
}

export const storage = new MemStorage();
