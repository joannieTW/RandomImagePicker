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
  updateImage(id: number, selected: boolean, group_id?: number): Promise<Image | undefined>;
  resetAllImages(): Promise<void>;
  deleteImage(id: number): Promise<void>;
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
    const image: Image = { 
      ...insertImage, 
      id, 
      selected: false,
      selected_count: 0,
      group_id: 0
    };
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

  async updateImage(id: number, selected: boolean, group_id: number = 0): Promise<Image | undefined> {
    const image = this.imageStore.get(id);
    if (!image) return undefined;
    
    // 如果取消選擇 (重置)，就將 selected 設為 false
    if (!selected) {
      const updatedImage: Image = { 
        ...image, 
        selected: false,
        selected_count: 0,
        group_id: 0
      };
      this.imageStore.set(id, updatedImage);
      return updatedImage;
    }
    
    // 如果已經選取一次，就不允許再選
    if (image.selected_count != null && image.selected_count >= 1) {
      return image;
    }
    
    // 增加選取次數
    const updatedImage: Image = { 
      ...image, 
      selected: true,
      selected_count: (image.selected_count || 0) + 1,
      group_id
    };
    this.imageStore.set(id, updatedImage);
    return updatedImage;
  }

  async resetAllImages(): Promise<void> {
    const allImages = Array.from(this.imageStore.values());
    
    for (const image of allImages) {
      const resetImage: Image = { 
        ...image, 
        selected: false,
        selected_count: 0,
        group_id: 0
      };
      this.imageStore.set(image.id, resetImage);
    }
  }
  
  async deleteImage(id: number): Promise<void> {
    this.imageStore.delete(id);
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
      .values({ 
        ...insertImage, 
        selected: false,
        selected_count: 0,
        group_id: 0
      })
      .returning();
    return image;
  }

  async createImages(insertImages: InsertImage[]): Promise<Image[]> {
    if (insertImages.length === 0) return [];
    
    const results = await db
      .insert(images)
      .values(insertImages.map(img => ({ 
        ...img, 
        selected: false, 
        selected_count: 0,
        group_id: 0
      })))
      .returning();
    
    return results;
  }

  async updateImage(id: number, selected: boolean, group_id: number = 0): Promise<Image | undefined> {
    // Get the current image to check selected count
    const [currentImage] = await db.select().from(images).where(eq(images.id, id));
    
    if (!currentImage) return undefined;
    
    // If deselecting (resetting), just set selected to false
    if (!selected) {
      const [image] = await db
        .update(images)
        .set({ 
          selected, 
          selected_count: 0,
          group_id: 0,
          timestamp: new Date().toISOString() 
        })
        .where(eq(images.id, id))
        .returning();
      
      return image || undefined;
    }
    
    // If selecting and count is already 1, don't allow more selections
    if (currentImage.selected_count != null && currentImage.selected_count >= 1) {
      return currentImage;
    }
    
    // Increment selected_count when selecting
    const [image] = await db
      .update(images)
      .set({ 
        selected, 
        selected_count: (currentImage.selected_count || 0) + 1,
        group_id,
        timestamp: new Date().toISOString() 
      })
      .where(eq(images.id, id))
      .returning();
    
    return image || undefined;
  }

  async resetAllImages(): Promise<void> {
    // 清空所有圖片
    await db.delete(images);
  }
  
  async deleteImage(id: number): Promise<void> {
    // 刪除單張圖片
    await db
      .delete(images)
      .where(eq(images.id, id));
  }
}

export const storage = new DatabaseStorage();
