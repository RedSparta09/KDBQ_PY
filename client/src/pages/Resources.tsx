import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Resource } from '@shared/schema';

const Resources: React.FC = () => {
  const { data: resources, isLoading } = useQuery<Resource[]>({
    queryKey: ['/api/resources'],
  });

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto p-6">
        <h2 className="text-2xl font-semibold mb-6 text-[#0078d4]">Loading resources...</h2>
      </div>
    );
  }

  // Resources are grouped by category
  const groupedResources = resources?.reduce<Record<string, Resource[]>>((acc, resource) => {
    if (!acc[resource.category]) {
      acc[resource.category] = [];
    }
    acc[resource.category].push(resource);
    return acc;
  }, {}) || {
    // Default resources if API fails to load
    "Official Documentation": [
      {
        id: 1,
        name: "KDB+ Reference Manual",
        url: "https://code.kx.com/q/ref/",
        description: "Comprehensive guide to KDB+ and Q language",
        category: "Official Documentation"
      },
      {
        id: 2,
        name: "Q Language Reference",
        url: "https://code.kx.com/q/ref/card/",
        description: "Official reference for the Q programming language",
        category: "Official Documentation"
      },
      {
        id: 3,
        name: "KX Systems Documentation",
        url: "https://code.kx.com/q/",
        description: "Official documentation from KX Systems",
        category: "Official Documentation"
      }
    ],
    "Tutorials & Guides": [
      {
        id: 4,
        name: "Q for Mortals",
        url: "https://code.kx.com/q4m3/",
        description: "Popular introduction to Q programming",
        category: "Tutorials & Guides"
      },
      {
        id: 5,
        name: "Learn Q",
        url: "https://code.kx.com/q/learn/",
        description: "Step-by-step tutorial for beginners",
        category: "Tutorials & Guides"
      },
      {
        id: 6,
        name: "AquaQ Analytics Tutorials",
        url: "https://www.aquaq.co.uk/q-for-beginners/",
        description: "Free training resources from AquaQ Analytics",
        category: "Tutorials & Guides"
      }
    ],
    "Community & Forums": [
      {
        id: 7,
        name: "KDB+ Personal Developers Forum",
        url: "https://community.kx.com/",
        description: "Community forum for KDB+ developers",
        category: "Community & Forums"
      },
      {
        id: 8,
        name: "Stack Overflow KDB/Q Tag",
        url: "https://stackoverflow.com/questions/tagged/kdb%2B",
        description: "Questions and answers from the Stack Overflow community",
        category: "Community & Forums"
      },
      {
        id: 9,
        name: "Reddit r/kdb",
        url: "https://www.reddit.com/r/kdb/",
        description: "Reddit community for KDB+ and Q discussions",
        category: "Community & Forums"
      }
    ],
    "Videos & Courses": [
      {
        id: 10,
        name: "KX Systems YouTube Channel",
        url: "https://www.youtube.com/c/KxSystems",
        description: "Official videos and tutorials from KX Systems",
        category: "Videos & Courses"
      },
      {
        id: 11,
        name: "KDB+ Fundamentals Course",
        url: "https://kx.com/academy/",
        description: "Free introductory course to KDB+ and Q",
        category: "Videos & Courses"
      },
      {
        id: 12,
        name: "Advanced KDB+ Programming",
        url: "https://kx.com/academy/",
        description: "Advanced techniques and best practices",
        category: "Videos & Courses"
      }
    ]
  };

  // Key concepts to show at the bottom
  const keyConcepts = [
    {
      id: 1,
      title: "Atoms vs Lists",
      description: "Understanding the fundamental data structures in Q and how they differ from other languages."
    },
    {
      id: 2,
      title: "Tables and Keyed Tables",
      description: "How Q represents tabular data and the difference between regular and keyed tables."
    },
    {
      id: 3,
      title: "Functional Programming",
      description: "Q follows a functional programming paradigm with first-class functions."
    },
    {
      id: 4,
      title: "Time-Series Data",
      description: "KDB+ is optimized for time-series data with specialized date/time types."
    }
  ];

  return (
    <div className="flex-1 overflow-auto p-6" id="resources-panel">
      <h2 className="text-2xl font-semibold mb-6 text-[#0078d4]">Learning Resources</h2>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {Object.entries(groupedResources).map(([category, categoryResources]) => (
          <div key={category} className="bg-[#252526] rounded-lg p-5 border border-[#333333]">
            <h3 className="text-lg font-medium mb-4">{category}</h3>
            <div className="space-y-3">
              {categoryResources.map(resource => (
                <a 
                  key={resource.id} 
                  href={resource.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block p-3 bg-[#1e1e1e] rounded hover:bg-[#333333]"
                >
                  <h4 className="text-[#0078d4] font-medium">{resource.name}</h4>
                  <p className="text-sm text-gray-300 mt-1">{resource.description}</p>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Key Concepts Section */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4 text-white">Key Concepts</h3>
        
        <div className="bg-[#252526] rounded-lg p-5 border border-[#333333]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {keyConcepts.map(concept => (
              <div key={concept.id} className="p-3 bg-[#1e1e1e] rounded">
                <h4 className="font-medium text-[#0078d4]">{concept.title}</h4>
                <p className="text-sm mt-1">{concept.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resources;
