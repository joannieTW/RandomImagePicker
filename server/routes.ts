import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { uploadImagesSchema, insertImageSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  const router = express.Router();

  // Get all images
  router.get("/images", async (req, res) => {
    try {
      const images = await storage.getAllImages();
      res.json(images);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve images" });
    }
  });

  // Upload multiple images
  router.post("/images", async (req, res) => {
    try {
      const { images } = uploadImagesSchema.parse(req.body);
      
      const imagesToInsert = images.map(img => ({
        name: img.name,
        data: img.data,
        timestamp: new Date().toISOString(),
      }));
      
      const createdImages = await storage.createImages(imagesToInsert);
      res.status(201).json(createdImages);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "Failed to upload images" });
      }
    }
  });

  // Select image (mark as selected)
  router.patch("/images/:id/select", async (req, res) => {
    try {
      const id = z.coerce.number().parse(req.params.id);
      const groupId = req.query.groupId ? z.coerce.number().parse(req.query.groupId) : 0;
      
      const image = await storage.getImage(id);
      if (!image) {
        return res.status(404).json({ message: "Image not found" });
      }
      
      const updatedImage = await storage.updateImage(id, true, groupId);
      res.json(updatedImage);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "Failed to select image" });
      }
    }
  });

  // Reset all images (unselect all)
  router.post("/images/reset", async (req, res) => {
    try {
      await storage.resetAllImages();
      const resetImages = await storage.getAllImages();
      res.json(resetImages);
    } catch (error) {
      res.status(500).json({ message: "Failed to reset images" });
    }
  });

  // Use router middleware
  app.use("/api", router);

  const httpServer = createServer(app);
  
  return httpServer;
}
