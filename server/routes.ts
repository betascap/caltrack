import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProfileSchema, insertFoodSchema, insertExerciseSchema, insertCustomFoodSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // === PROFILES ===
  app.get("/api/profiles", (_req, res) => {
    const profiles = storage.getAllProfiles();
    res.json(profiles);
  });

  app.get("/api/profiles/:id", (req, res) => {
    const profile = storage.getProfile(Number(req.params.id));
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    res.json(profile);
  });

  app.post("/api/profiles", (req, res) => {
    const parsed = insertProfileSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const profile = storage.createProfile(parsed.data);
    res.status(201).json(profile);
  });

  app.delete("/api/profiles/:id", (req, res) => {
    storage.deleteProfile(Number(req.params.id));
    res.status(204).send();
  });

  app.patch("/api/profiles/:id", (req, res) => {
    const id = Number(req.params.id);
    const profile = storage.updateProfile(id, req.body);
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    res.json(profile);
  });

  // === FOOD ENTRIES ===
  app.get("/api/food/:profileId/:date", (req, res) => {
    const entries = storage.getFoodEntries(Number(req.params.profileId), req.params.date);
    res.json(entries);
  });

  app.post("/api/food", (req, res) => {
    const parsed = insertFoodSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const entry = storage.createFoodEntry(parsed.data);
    res.status(201).json(entry);
  });

  app.delete("/api/food/:id", (req, res) => {
    storage.deleteFoodEntry(Number(req.params.id));
    res.status(204).send();
  });

  // === EXERCISE ENTRIES ===
  app.get("/api/exercise/:profileId/:date", (req, res) => {
    const entries = storage.getExerciseEntries(Number(req.params.profileId), req.params.date);
    res.json(entries);
  });

  app.post("/api/exercise", (req, res) => {
    const parsed = insertExerciseSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const entry = storage.createExerciseEntry(parsed.data);
    res.status(201).json(entry);
  });

  app.delete("/api/exercise/:id", (req, res) => {
    storage.deleteExerciseEntry(Number(req.params.id));
    res.status(204).send();
  });

  // === HISTORY ===
  app.get("/api/history/:profileId", (req, res) => {
    const profileId = Number(req.params.profileId);
    const startDate = (req.query.start as string) || "2020-01-01";
    const endDate = (req.query.end as string) || "2099-12-31";
    const totals = storage.getDailyTotals(profileId, startDate, endDate);
    res.json(totals);
  });

  // === CUSTOM FOODS ===
  app.get("/api/custom-foods", (_req, res) => {
    const foods = storage.getAllCustomFoods();
    res.json(foods);
  });

  app.get("/api/custom-foods/search", (req, res) => {
    const q = (req.query.q as string) || "";
    const foods = storage.searchCustomFoods(q);
    res.json(foods);
  });

  app.post("/api/custom-foods", (req, res) => {
    const parsed = insertCustomFoodSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
    const food = storage.createCustomFood(parsed.data);
    res.status(201).json(food);
  });

  return httpServer;
}
