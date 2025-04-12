import { images, type Image, type InsertImage, users, type User, type InsertUser } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Image related storage methods
  getAllImages(): Promise<Image[]>;
  getImage(id: number): Promise<Image | undefined>;
  createImage(image: InsertImage): Promise<Image>;
  createImages(images: InsertImage[]): Promise<Image[]>;
  updateImage(id: number, selected: boolean): Promise<Image | undefined>;
  resetAllImages(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private imageStore: Map<number, Image>;
  currentUserId: number;
  currentImageId: number;

  constructor() {
    this.users = new Map();
    this.imageStore = new Map();
    this.currentUserId = 1;
    this.currentImageId = 1;
  }

  // User related methods
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

  // Image related methods
  async getAllImages(): Promise<Image[]> {
    return Array.from(this.imageStore.values());
  }

  async getImage(id: number): Promise<Image | undefined> {
    return this.imageStore.get(id);
  }

  async createImage(insertImage: InsertImage): Promise<Image> {
    const id = this.currentImageId++;
    const image: Image = { ...insertImage, id, selected: false };
    this.imageStore.set(id, image);
    return image;
  }

  async createImages(insertImages: InsertImage[]): Promise<Image[]> {
    const createdImages: Image[] = [];
    
    for (const insertImage of insertImages) {
      const image = await this.createImage(insertImage);
      createdImages.push(image);
    }
    
    return createdImages;
  }

  async updateImage(id: number, selected: boolean): Promise<Image | undefined> {
    const image = this.imageStore.get(id);
    if (!image) return undefined;
    
    const updatedImage: Image = { ...image, selected };
    this.imageStore.set(id, updatedImage);
    return updatedImage;
  }

  async resetAllImages(): Promise<void> {
    const allImages = Array.from(this.imageStore.values());
    
    for (const image of allImages) {
      const resetImage: Image = { ...image, selected: false };
      this.imageStore.set(image.id, resetImage);
    }
  }
}

// Comment out memory storage
// export const storage = new MemStorage();

// Use DatabaseStorage instead
import { db } from "./db";
import { eq } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllImages(): Promise<Image[]> {
    return await db.select().from(images);
  }

  async getImage(id: number): Promise<Image | undefined> {
    const [image] = await db.select().from(images).where(eq(images.id, id));
    return image || undefined;
  }

  async createImage(insertImage: InsertImage): Promise<Image> {
    const [image] = await db
      .insert(images)
      .values({ ...insertImage, selected: false })
      .returning();
    return image;
  }

  async createImages(insertImages: InsertImage[]): Promise<Image[]> {
    if (insertImages.length === 0) return [];
    
    const results = await db
      .insert(images)
      .values(insertImages.map(img => ({ ...img, selected: false })))
      .returning();
    
    return results;
  }

  async updateImage(id: number, selected: boolean): Promise<Image | undefined> {
    const [image] = await db
      .update(images)
      .set({ selected, timestamp: new Date().toISOString() })
      .where(eq(images.id, id))
      .returning();
    
    return image || undefined;
  }

  async resetAllImages(): Promise<void> {
    await db
      .update(images)
      .set({ selected: false })
      .returning();
  }
}

export const storage = new DatabaseStorage();
