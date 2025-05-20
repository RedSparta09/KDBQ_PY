import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertSnippetSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoints for snippets
  app.get("/api/snippets", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const snippets = await storage.getSnippets(userId);
      res.json(snippets);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve snippets" });
    }
  });

  app.get("/api/snippets/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const snippet = await storage.getSnippet(id);
      
      if (!snippet) {
        return res.status(404).json({ message: "Snippet not found" });
      }
      
      res.json(snippet);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve snippet" });
    }
  });

  app.post("/api/snippets", async (req: Request, res: Response) => {
    try {
      // Add timestamp if not provided
      if (!req.body.timestamp) {
        req.body.timestamp = Date.now();
      }
      
      // Validate request body
      const result = insertSnippetSchema.safeParse(req.body);
      
      if (!result.success) {
        // If userId is the only missing field, we can continue without it
        const simplifiedSchema = insertSnippetSchema.omit({ userId: true });
        const simpleResult = simplifiedSchema.safeParse(req.body);
        
        if (!simpleResult.success) {
          return res.status(400).json({ message: "Invalid snippet data", errors: result.error.errors });
        }
        
        // Continue without userId
        const snippet = await storage.createSnippet({
          ...simpleResult.data,
          userId: null // Explicit null
        });
        
        return res.status(201).json(snippet);
      }
      
      // Otherwise use the full validated data
      const snippet = await storage.createSnippet(result.data);
      res.status(201).json(snippet);
    } catch (error) {
      res.status(500).json({ message: "Failed to create snippet" });
    }
  });

  // API endpoints for examples
  app.get("/api/examples", async (_req: Request, res: Response) => {
    try {
      const examples = await storage.getExamples();
      res.json(examples);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve examples" });
    }
  });

  app.get("/api/examples/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const example = await storage.getExample(id);
      
      if (!example) {
        return res.status(404).json({ message: "Example not found" });
      }
      
      res.json(example);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve example" });
    }
  });

  app.get("/api/examples/category/:category", async (req: Request, res: Response) => {
    try {
      const category = req.params.category;
      const examples = await storage.getExamplesByCategory(category);
      res.json(examples);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve examples by category" });
    }
  });

  // API endpoints for resources
  app.get("/api/resources", async (_req: Request, res: Response) => {
    try {
      const resources = await storage.getResources();
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve resources" });
    }
  });

  app.get("/api/resources/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const resource = await storage.getResource(id);
      
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      
      res.json(resource);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve resource" });
    }
  });

  app.get("/api/resources/category/:category", async (req: Request, res: Response) => {
    try {
      const category = req.params.category;
      const resources = await storage.getResourcesByCategory(category);
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve resources by category" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
