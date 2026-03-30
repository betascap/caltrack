import {
  type Profile, type InsertProfile, userProfiles,
  type FoodEntry, type InsertFood, foodEntries,
  type ExerciseEntry, type InsertExercise, exerciseEntries,
  type CustomFood, type InsertCustomFood, customFoods,
} from "@shared/schema";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, and, gte, lte, sql } from "drizzle-orm";

const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite);

export interface IStorage {
  // Profiles
  getProfile(id: number): Profile | undefined;
  getAllProfiles(): Profile[];
  createProfile(profile: InsertProfile): Profile;
  updateProfile(id: number, profile: Partial<InsertProfile>): Profile | undefined;

  // Food entries
  getFoodEntries(profileId: number, date: string): FoodEntry[];
  createFoodEntry(entry: InsertFood): FoodEntry;
  deleteFoodEntry(id: number): void;

  // Exercise entries
  getExerciseEntries(profileId: number, date: string): ExerciseEntry[];
  createExerciseEntry(entry: InsertExercise): ExerciseEntry;
  deleteExerciseEntry(id: number): void;

  // Custom foods
  getAllCustomFoods(): CustomFood[];
  searchCustomFoods(query: string): CustomFood[];
  createCustomFood(food: InsertCustomFood): CustomFood;

  // Profile management
  deleteProfile(id: number): void;

  // History
  getDailyTotals(profileId: number, startDate: string, endDate: string): { date: string; consumed: number; burned: number }[];
}

export class DatabaseStorage implements IStorage {
  getProfile(id: number): Profile | undefined {
    return db.select().from(userProfiles).where(eq(userProfiles.id, id)).get();
  }

  getAllProfiles(): Profile[] {
    return db.select().from(userProfiles).all();
  }

  createProfile(profile: InsertProfile): Profile {
    return db.insert(userProfiles).values(profile).returning().get();
  }

  updateProfile(id: number, profile: Partial<InsertProfile>): Profile | undefined {
    return db.update(userProfiles).set(profile).where(eq(userProfiles.id, id)).returning().get();
  }

  deleteProfile(id: number): void {
    // Delete all related data first
    db.delete(foodEntries).where(eq(foodEntries.profileId, id)).run();
    db.delete(exerciseEntries).where(eq(exerciseEntries.profileId, id)).run();
    db.delete(userProfiles).where(eq(userProfiles.id, id)).run();
  }

  getFoodEntries(profileId: number, date: string): FoodEntry[] {
    return db.select().from(foodEntries)
      .where(and(eq(foodEntries.profileId, profileId), eq(foodEntries.date, date)))
      .all();
  }

  createFoodEntry(entry: InsertFood): FoodEntry {
    return db.insert(foodEntries).values(entry).returning().get();
  }

  deleteFoodEntry(id: number): void {
    db.delete(foodEntries).where(eq(foodEntries.id, id)).run();
  }

  getExerciseEntries(profileId: number, date: string): ExerciseEntry[] {
    return db.select().from(exerciseEntries)
      .where(and(eq(exerciseEntries.profileId, profileId), eq(exerciseEntries.date, date)))
      .all();
  }

  createExerciseEntry(entry: InsertExercise): ExerciseEntry {
    return db.insert(exerciseEntries).values(entry).returning().get();
  }

  deleteExerciseEntry(id: number): void {
    db.delete(exerciseEntries).where(eq(exerciseEntries.id, id)).run();
  }

  getAllCustomFoods(): CustomFood[] {
    return db.select().from(customFoods).all();
  }

  searchCustomFoods(query: string): CustomFood[] {
    const all = db.select().from(customFoods).all();
    const q = query.toLowerCase();
    return all.filter(f => f.name.toLowerCase().includes(q) || (f.brand && f.brand.toLowerCase().includes(q)));
  }

  createCustomFood(food: InsertCustomFood): CustomFood {
    return db.insert(customFoods).values(food).returning().get();
  }

  getDailyTotals(profileId: number, startDate: string, endDate: string): { date: string; consumed: number; burned: number }[] {
    // Get all food entries in range
    const foods = db.select({
      date: foodEntries.date,
      total: sql<number>`sum(${foodEntries.calories})`,
    })
      .from(foodEntries)
      .where(and(
        eq(foodEntries.profileId, profileId),
        gte(foodEntries.date, startDate),
        lte(foodEntries.date, endDate),
      ))
      .groupBy(foodEntries.date)
      .all();

    // Get all exercise entries in range
    const exercises = db.select({
      date: exerciseEntries.date,
      total: sql<number>`sum(${exerciseEntries.caloriesBurned})`,
    })
      .from(exerciseEntries)
      .where(and(
        eq(exerciseEntries.profileId, profileId),
        gte(exerciseEntries.date, startDate),
        lte(exerciseEntries.date, endDate),
      ))
      .groupBy(exerciseEntries.date)
      .all();

    // Merge into a map by date
    const map = new Map<string, { date: string; consumed: number; burned: number }>();

    for (const f of foods) {
      map.set(f.date, { date: f.date, consumed: f.total || 0, burned: 0 });
    }
    for (const e of exercises) {
      const existing = map.get(e.date);
      if (existing) {
        existing.burned = e.total || 0;
      } else {
        map.set(e.date, { date: e.date, consumed: 0, burned: e.total || 0 });
      }
    }

    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }
}

export const storage = new DatabaseStorage();
