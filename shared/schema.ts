import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User profile with physical data and goal
export const userProfiles = sqliteTable("user_profiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  weight: real("weight").notNull(), // kg
  height: real("height").notNull(), // cm
  sex: text("sex").notNull(), // "male" | "female"
  goal: text("goal").notNull().default("maintenance"), // "maintenance" | "cutting" | "bulking"
  activityLevel: text("activity_level").notNull().default("sedentary"), // sedentary, light, moderate, active, very_active
});

// Food entries
export const foodEntries = sqliteTable("food_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  profileId: integer("profile_id").notNull(),
  name: text("name").notNull(),
  brand: text("brand"),
  weightGrams: real("weight_grams").notNull(),
  calories: real("calories").notNull(),
  protein: real("protein"),
  carbs: real("carbs"),
  fat: real("fat"),
  mealType: text("meal_type").notNull(), // "breakfast" | "lunch" | "dinner" | "snack"
  date: text("date").notNull(), // YYYY-MM-DD
});

// Exercise entries
export const exerciseEntries = sqliteTable("exercise_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  profileId: integer("profile_id").notNull(),
  sport: text("sport").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  intensity: text("intensity").notNull(), // "light" | "moderate" | "intense"
  caloriesBurned: real("calories_burned").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD
});

// Custom foods shared across all users
export const customFoods = sqliteTable("custom_foods", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  brand: text("brand"),
  caloriesPer100g: real("calories_per_100g").notNull(),
  proteinPer100g: real("protein_per_100g"),
  carbsPer100g: real("carbs_per_100g"),
  fatPer100g: real("fat_per_100g"),
});

// Insert schemas
export const insertCustomFoodSchema = createInsertSchema(customFoods).omit({ id: true });
export const insertProfileSchema = createInsertSchema(userProfiles).omit({ id: true });
export const insertFoodSchema = createInsertSchema(foodEntries).omit({ id: true });
export const insertExerciseSchema = createInsertSchema(exerciseEntries).omit({ id: true });

// Types
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof userProfiles.$inferSelect;
export type InsertFood = z.infer<typeof insertFoodSchema>;
export type FoodEntry = typeof foodEntries.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type ExerciseEntry = typeof exerciseEntries.$inferSelect;
export type InsertCustomFood = z.infer<typeof insertCustomFoodSchema>;
export type CustomFood = typeof customFoods.$inferSelect;
