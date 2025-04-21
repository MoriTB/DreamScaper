import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import { z } from "zod";
import { log } from "./vite";
import { transcribeAudio, interpretDream, generateDreamImage } from "./openai";
import { insertDreamSchema, insertUserSchema } from "@shared/schema";
import { jsonb } from "drizzle-orm/pg-core";

// Set up file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage_config = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const randomName = crypto.randomBytes(16).toString("hex");
    cb(null, `${randomName}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage_config,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.wav', '.mp3', '.m4a', '.ogg', '.webm'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type, only audio files are allowed"));
    }
  }
});

// WebSocket clients map
const clients = new Map<number, WebSocket[]>();

// Helper to send message to a specific user's connections
function sendToUser(userId: number, event: string, data: any) {
  const userConnections = clients.get(userId);
  
  if (userConnections && userConnections.length > 0) {
    const message = JSON.stringify({ event, data });
    
    userConnections.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Set up WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws, req) => {
    // Extract user ID from query params
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const userIdParam = url.searchParams.get('userId');
    
    if (!userIdParam) {
      ws.close(1008, 'Missing userId parameter');
      return;
    }
    
    const userId = parseInt(userIdParam, 10);
    
    // Add to clients map
    if (!clients.has(userId)) {
      clients.set(userId, []);
    }
    clients.get(userId)?.push(ws);
    
    log(`WebSocket client connected for user ${userId}`, 'websocket');
    
    ws.on('close', () => {
      const userConnections = clients.get(userId);
      if (userConnections) {
        const index = userConnections.indexOf(ws);
        if (index !== -1) {
          userConnections.splice(index, 1);
        }
        
        // Clean up if no connections left
        if (userConnections.length === 0) {
          clients.delete(userId);
        }
      }
      log(`WebSocket client disconnected for user ${userId}`, 'websocket');
    });
  });
  
  // Registration and authentication routes
  app.post('/api/register', async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      // Create new user
      const user = await storage.createUser(userData);
      res.status(201).json({ id: user.id, username: user.username, email: user.email });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating user" });
    }
  });
  
  app.post('/api/login', async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      res.json({ id: user.id, username: user.username, email: user.email });
    } catch (error) {
      res.status(500).json({ message: "Error during login" });
    }
  });
  
  // Dream CRUD routes
  app.post('/api/dreams', upload.single('audio'), async (req: Request, res: Response) => {
    try {
      const { title, content, userId, style, dreamDate } = req.body;
      
      let audioUrl = null;
      let audioDuration = null;
      let finalContent = content;
      
      // If audio file was uploaded, transcribe it
      if (req.file) {
        const filePath = req.file.path;
        const transcription = await transcribeAudio(filePath);
        
        // If no content was provided, use the transcription
        if (!finalContent) {
          finalContent = transcription.text;
        }
        
        audioUrl = `/uploads/${path.basename(filePath)}`;
        audioDuration = Math.round(transcription.duration);
      }
      
      // Generate AI title if none provided or is date-based default
      let dreamTitle = title;
      if (!dreamTitle || dreamTitle.startsWith('Dream on ')) {
        try {
          // Extract a title from the content - later this will call AI
          const words = finalContent.split(' ');
          const titleLength = Math.min(5, words.length);
          dreamTitle = words.slice(0, titleLength).join(' ') + '...';
          
          // In a real implementation, we'd call OpenAI to generate a title:
          // const titleResponse = await openai.chat.completions.create({
          //   model: "gpt-4o",
          //   messages: [
          //     { role: "system", content: "Generate a short, evocative title for this dream:" },
          //     { role: "user", content: finalContent }
          //   ],
          //   max_tokens: 25
          // });
          // dreamTitle = titleResponse.choices[0].message.content.trim();
        } catch (err) {
          log(`Error generating dream title: ${(err as Error).message}`, 'routes');
          dreamTitle = title || 'Untitled Dream';
        }
      }
      
      // Generate tags from content
      let dreamTags: string[] = [];
      try {
        // In a real implementation, we'd call OpenAI to generate relevant tags:
        // For now, extract some likely tags based on content
        const commonThemes = [
          'flying', 'falling', 'chase', 'water', 'family', 'lost', 
          'animals', 'school', 'work', 'test', 'nightmare'
        ];
        
        dreamTags = commonThemes.filter(theme => 
          finalContent.toLowerCase().includes(theme.toLowerCase())
        );
        
        // If no tags found, add a default one
        if (dreamTags.length === 0) {
          dreamTags = ['miscellaneous'];
        }
      } catch (err) {
        log(`Error generating dream tags: ${(err as Error).message}`, 'routes');
        dreamTags = ['uncategorized'];
      }
      
      // Validate and create dream with the parsed date or current date
      let dreamDateTime: Date;
      try {
        dreamDateTime = dreamDate ? new Date(dreamDate) : new Date();
      } catch (err) {
        dreamDateTime = new Date();
      }
      
      const dreamData = {
        title: dreamTitle,
        content: finalContent,
        userId: parseInt(userId, 10),
        audioUrl,
        audioDuration,
        tags: dreamTags,
        createdAt: dreamDateTime,
        isFavorite: false
      };
      
      const dream = await storage.createDream(dreamData);
      
      // Trigger async interpretation and image generation
      setTimeout(async () => {
        try {
          const interpretation = await interpretDream(finalContent);
          const newInterpretation = await storage.createInterpretation({
            dreamId: dream.id,
            interpretation: interpretation.interpretation,
            insights: interpretation.insights,
          });
          
          sendToUser(dream.userId, 'interpretationComplete', {
            dreamId: dream.id,
            interpretation: newInterpretation
          });
          
          // After interpretation, generate image using selected style
          setTimeout(async () => {
            try {
              const selectedStyle = style || 'realistic';
              
              const imageUrl = await generateDreamImage(finalContent, selectedStyle);
              
              const newImageGeneration = await storage.createImageGeneration({
                dreamId: dream.id,
                imageUrl,
                style: selectedStyle,
                prompt: finalContent,
              });
              
              sendToUser(dream.userId, 'imageReady', {
                dreamId: dream.id,
                imageGeneration: newImageGeneration
              });
            } catch (err) {
              log(`Error generating image for dream ${dream.id}: ${(err as Error).message}`, 'routes');
            }
          }, 1000);
        } catch (err) {
          log(`Error interpreting dream ${dream.id}: ${(err as Error).message}`, 'routes');
        }
      }, 100);
      
      res.status(201).json(dream);
    } catch (error) {
      log(`Error creating dream: ${(error as Error).message}`, 'routes');
      res.status(500).json({ message: "Error creating dream", error: (error as Error).message });
    }
  });
  
  app.get('/api/dreams/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const dream = await storage.getDreamWithRelations(id);
      
      if (!dream) {
        return res.status(404).json({ message: "Dream not found" });
      }
      
      res.json(dream);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving dream" });
    }
  });
  
  app.get('/api/users/:userId/dreams', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      const sortBy = req.query.sortBy as string || 'newest';
      
      const dreams = await storage.getDreamsWithRelationsByUserId(userId, sortBy);
      res.json(dreams);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving dreams" });
    }
  });
  
  app.patch('/api/dreams/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updateData = req.body;
      
      const updated = await storage.updateDream(id, updateData);
      
      if (!updated) {
        return res.status(404).json({ message: "Dream not found" });
      }
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Error updating dream" });
    }
  });
  
  app.patch('/api/dreams/:id/favorite', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      const updated = await storage.toggleFavorite(id);
      
      if (!updated) {
        return res.status(404).json({ message: "Dream not found" });
      }
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Error toggling favorite status" });
    }
  });
  
  app.delete('/api/dreams/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      await storage.deleteDream(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting dream" });
    }
  });
  
  // Serve uploaded files
  app.use('/uploads', express.static(uploadDir));

  return httpServer;
}
