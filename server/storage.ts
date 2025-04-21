import { 
  users, dreams, interpretations, imageGenerations,
  type User, type InsertUser, 
  type Dream, type InsertDream,
  type Interpretation, type InsertInterpretation,
  type ImageGeneration, type InsertImageGeneration,
  type DreamWithRelations
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, asc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Dream methods
  createDream(dream: InsertDream): Promise<Dream>;
  getDream(id: number): Promise<Dream | undefined>;
  getDreamWithRelations(id: number): Promise<DreamWithRelations | undefined>;
  getDreamsByUserId(userId: number): Promise<Dream[]>;
  getDreamsWithRelationsByUserId(userId: number, sortBy?: string): Promise<DreamWithRelations[]>;
  updateDream(id: number, dream: Partial<InsertDream>): Promise<Dream | undefined>;
  toggleFavorite(id: number): Promise<Dream | undefined>;
  deleteDream(id: number): Promise<void>;
  
  // Interpretation methods
  createInterpretation(interpretation: InsertInterpretation): Promise<Interpretation>;
  getInterpretation(id: number): Promise<Interpretation | undefined>;
  getInterpretationByDreamId(dreamId: number): Promise<Interpretation | undefined>;
  
  // Image generation methods
  createImageGeneration(imageGeneration: InsertImageGeneration): Promise<ImageGeneration>;
  getImageGeneration(id: number): Promise<ImageGeneration | undefined>;
  getImageGenerationByDreamId(dreamId: number): Promise<ImageGeneration | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }
  
  // Dream methods
  async createDream(dreamData: InsertDream): Promise<Dream> {
    const [dream] = await db.insert(dreams).values(dreamData).returning();
    return dream;
  }
  
  async getDream(id: number): Promise<Dream | undefined> {
    const [dream] = await db.select().from(dreams).where(eq(dreams.id, id));
    return dream;
  }
  
  async getDreamWithRelations(id: number): Promise<DreamWithRelations | undefined> {
    const dream = await this.getDream(id);
    if (!dream) return undefined;
    
    const dreamInterpretation = await this.getInterpretationByDreamId(id);
    const dreamImageGeneration = await this.getImageGenerationByDreamId(id);
    
    return {
      dream,
      interpretation: dreamInterpretation || null,
      imageGeneration: dreamImageGeneration || null
    };
  }
  
  async getDreamsByUserId(userId: number): Promise<Dream[]> {
    return db.select().from(dreams)
      .where(eq(dreams.userId, userId))
      .orderBy(desc(dreams.createdAt));
  }
  
  async getDreamsWithRelationsByUserId(userId: number, sortBy: string = 'newest'): Promise<DreamWithRelations[]> {
    const userDreams = await db.select()
      .from(dreams)
      .where(eq(dreams.userId, userId))
      .orderBy(sortBy === 'oldest' ? asc(dreams.createdAt) : desc(dreams.createdAt));
    
    const results: DreamWithRelations[] = [];
    
    for (const dream of userDreams) {
      const dreamInterpretation = await this.getInterpretationByDreamId(dream.id);
      const dreamImageGeneration = await this.getImageGenerationByDreamId(dream.id);
      
      results.push({
        dream,
        interpretation: dreamInterpretation || null,
        imageGeneration: dreamImageGeneration || null
      });
    }
    
    return results;
  }
  
  async updateDream(id: number, dreamUpdate: Partial<InsertDream>): Promise<Dream | undefined> {
    const [updated] = await db.update(dreams)
      .set(dreamUpdate)
      .where(eq(dreams.id, id))
      .returning();
    
    return updated;
  }
  
  async toggleFavorite(id: number): Promise<Dream | undefined> {
    const dream = await this.getDream(id);
    if (!dream) return undefined;
    
    const [updated] = await db.update(dreams)
      .set({ isFavorite: !dream.isFavorite })
      .where(eq(dreams.id, id))
      .returning();
    
    return updated;
  }
  
  async deleteDream(id: number): Promise<void> {
    await db.delete(dreams).where(eq(dreams.id, id));
  }
  
  // Interpretation methods
  async createInterpretation(interpretationData: InsertInterpretation): Promise<Interpretation> {
    const [interpretation] = await db.insert(interpretations)
      .values(interpretationData)
      .returning();
    
    return interpretation;
  }
  
  async getInterpretation(id: number): Promise<Interpretation | undefined> {
    const [interpretation] = await db.select()
      .from(interpretations)
      .where(eq(interpretations.id, id));
    
    return interpretation;
  }
  
  async getInterpretationByDreamId(dreamId: number): Promise<Interpretation | undefined> {
    const [interpretation] = await db.select()
      .from(interpretations)
      .where(eq(interpretations.dreamId, dreamId));
    
    return interpretation;
  }
  
  // Image generation methods
  async createImageGeneration(imageGenerationData: InsertImageGeneration): Promise<ImageGeneration> {
    const [imageGeneration] = await db.insert(imageGenerations)
      .values(imageGenerationData)
      .returning();
    
    return imageGeneration;
  }
  
  async getImageGeneration(id: number): Promise<ImageGeneration | undefined> {
    const [imageGeneration] = await db.select()
      .from(imageGenerations)
      .where(eq(imageGenerations.id, id));
    
    return imageGeneration;
  }
  
  async getImageGenerationByDreamId(dreamId: number): Promise<ImageGeneration | undefined> {
    const [imageGeneration] = await db.select()
      .from(imageGenerations)
      .where(eq(imageGenerations.dreamId, dreamId));
    
    return imageGeneration;
  }
}

export const storage = new DatabaseStorage();
