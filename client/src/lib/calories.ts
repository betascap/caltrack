// Common food calorie database (per 100g)
export interface FoodData {
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  category: string;
}

export const foodDatabase: FoodData[] = [
  // Proteínas
  { name: "Frango (peito grelhado)", caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6, category: "Proteínas" },
  { name: "Frango (coxa)", caloriesPer100g: 209, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 11, category: "Proteínas" },
  { name: "Carne bovina (patinho)", caloriesPer100g: 133, proteinPer100g: 22, carbsPer100g: 0, fatPer100g: 5, category: "Proteínas" },
  { name: "Carne bovina (picanha)", caloriesPer100g: 289, proteinPer100g: 21, carbsPer100g: 0, fatPer100g: 22, category: "Proteínas" },
  { name: "Carne bovina (alcatra)", caloriesPer100g: 174, proteinPer100g: 25, carbsPer100g: 0, fatPer100g: 8, category: "Proteínas" },
  { name: "Filet Mignon", caloriesPer100g: 199, proteinPer100g: 28, carbsPer100g: 0, fatPer100g: 9, category: "Proteínas" },
  { name: "Carne suína (lombo)", caloriesPer100g: 143, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 4, category: "Proteínas" },
  { name: "Peixe (tilápia)", caloriesPer100g: 96, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 1.7, category: "Proteínas" },
  { name: "Peixe (salmão)", caloriesPer100g: 208, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 13, category: "Proteínas" },
  { name: "Peixe (atum)", caloriesPer100g: 130, proteinPer100g: 29, carbsPer100g: 0, fatPer100g: 1, category: "Proteínas" },
  { name: "Camarão", caloriesPer100g: 85, proteinPer100g: 20, carbsPer100g: 0.2, fatPer100g: 0.5, category: "Proteínas" },
  { name: "Ovo inteiro", caloriesPer100g: 155, proteinPer100g: 13, carbsPer100g: 1.1, fatPer100g: 11, category: "Proteínas" },
  { name: "Clara de ovo", caloriesPer100g: 52, proteinPer100g: 11, carbsPer100g: 0.7, fatPer100g: 0.2, category: "Proteínas" },
  { name: "Whey Protein", caloriesPer100g: 380, proteinPer100g: 75, carbsPer100g: 8, fatPer100g: 4, category: "Proteínas" },

  // Carboidratos
  { name: "Arroz branco (cozido)", caloriesPer100g: 130, proteinPer100g: 2.7, carbsPer100g: 28, fatPer100g: 0.3, category: "Carboidratos" },
  { name: "Arroz integral (cozido)", caloriesPer100g: 112, proteinPer100g: 2.6, carbsPer100g: 23, fatPer100g: 0.9, category: "Carboidratos" },
  { name: "Feijão (cozido)", caloriesPer100g: 77, proteinPer100g: 5.2, carbsPer100g: 14, fatPer100g: 0.5, category: "Carboidratos" },
  { name: "Macarrão (cozido)", caloriesPer100g: 131, proteinPer100g: 5, carbsPer100g: 25, fatPer100g: 1.1, category: "Carboidratos" },
  { name: "Batata doce (cozida)", caloriesPer100g: 86, proteinPer100g: 1.6, carbsPer100g: 20, fatPer100g: 0.1, category: "Carboidratos" },
  { name: "Batata inglesa (cozida)", caloriesPer100g: 87, proteinPer100g: 1.9, carbsPer100g: 20, fatPer100g: 0.1, category: "Carboidratos" },
  { name: "Pão francês", caloriesPer100g: 289, proteinPer100g: 9.4, carbsPer100g: 55, fatPer100g: 3.1, category: "Carboidratos" },
  { name: "Pão integral", caloriesPer100g: 247, proteinPer100g: 13, carbsPer100g: 41, fatPer100g: 3.4, category: "Carboidratos" },
  { name: "Aveia", caloriesPer100g: 389, proteinPer100g: 17, carbsPer100g: 66, fatPer100g: 7, category: "Carboidratos" },
  { name: "Tapioca", caloriesPer100g: 343, proteinPer100g: 0.5, carbsPer100g: 85, fatPer100g: 0.1, category: "Carboidratos" },
  { name: "Mandioca (cozida)", caloriesPer100g: 125, proteinPer100g: 0.6, carbsPer100g: 30, fatPer100g: 0.2, category: "Carboidratos" },

  // Frutas
  { name: "Banana", caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 23, fatPer100g: 0.3, category: "Frutas" },
  { name: "Maçã", caloriesPer100g: 52, proteinPer100g: 0.3, carbsPer100g: 14, fatPer100g: 0.2, category: "Frutas" },
  { name: "Laranja", caloriesPer100g: 47, proteinPer100g: 0.9, carbsPer100g: 12, fatPer100g: 0.1, category: "Frutas" },
  { name: "Morango", caloriesPer100g: 32, proteinPer100g: 0.7, carbsPer100g: 7.7, fatPer100g: 0.3, category: "Frutas" },
  { name: "Melancia", caloriesPer100g: 30, proteinPer100g: 0.6, carbsPer100g: 7.6, fatPer100g: 0.2, category: "Frutas" },
  { name: "Manga", caloriesPer100g: 60, proteinPer100g: 0.8, carbsPer100g: 15, fatPer100g: 0.4, category: "Frutas" },
  { name: "Abacate", caloriesPer100g: 160, proteinPer100g: 2, carbsPer100g: 8.5, fatPer100g: 15, category: "Frutas" },
  { name: "Uva", caloriesPer100g: 69, proteinPer100g: 0.7, carbsPer100g: 18, fatPer100g: 0.2, category: "Frutas" },

  // Laticínios
  { name: "Leite integral", caloriesPer100g: 61, proteinPer100g: 3.2, carbsPer100g: 4.8, fatPer100g: 3.2, category: "Laticínios" },
  { name: "Leite desnatado", caloriesPer100g: 34, proteinPer100g: 3.4, carbsPer100g: 5, fatPer100g: 0.1, category: "Laticínios" },
  { name: "Iogurte natural", caloriesPer100g: 61, proteinPer100g: 3.5, carbsPer100g: 4.7, fatPer100g: 3.3, category: "Laticínios" },
  { name: "Iogurte grego", caloriesPer100g: 97, proteinPer100g: 9, carbsPer100g: 3.6, fatPer100g: 5, category: "Laticínios" },
  { name: "Queijo mussarela", caloriesPer100g: 280, proteinPer100g: 22, carbsPer100g: 2.2, fatPer100g: 22, category: "Laticínios" },
  { name: "Queijo cottage", caloriesPer100g: 98, proteinPer100g: 11, carbsPer100g: 3.4, fatPer100g: 4.3, category: "Laticínios" },
  { name: "Queijo minas frescal", caloriesPer100g: 264, proteinPer100g: 17, carbsPer100g: 3, fatPer100g: 20, category: "Laticínios" },
  { name: "Requeijão", caloriesPer100g: 257, proteinPer100g: 10, carbsPer100g: 2, fatPer100g: 23, category: "Laticínios" },

  // Gorduras
  { name: "Azeite de oliva", caloriesPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, category: "Gorduras" },
  { name: "Manteiga", caloriesPer100g: 717, proteinPer100g: 0.9, carbsPer100g: 0.1, fatPer100g: 81, category: "Gorduras" },
  { name: "Amendoim", caloriesPer100g: 567, proteinPer100g: 26, carbsPer100g: 16, fatPer100g: 49, category: "Gorduras" },
  { name: "Castanha-do-pará", caloriesPer100g: 656, proteinPer100g: 14, carbsPer100g: 12, fatPer100g: 66, category: "Gorduras" },
  { name: "Pasta de amendoim", caloriesPer100g: 588, proteinPer100g: 25, carbsPer100g: 20, fatPer100g: 50, category: "Gorduras" },

  // Verduras e Legumes
  { name: "Brócolis", caloriesPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 7, fatPer100g: 0.4, category: "Verduras" },
  { name: "Alface", caloriesPer100g: 15, proteinPer100g: 1.4, carbsPer100g: 2.9, fatPer100g: 0.2, category: "Verduras" },
  { name: "Tomate", caloriesPer100g: 18, proteinPer100g: 0.9, carbsPer100g: 3.9, fatPer100g: 0.2, category: "Verduras" },
  { name: "Cenoura", caloriesPer100g: 41, proteinPer100g: 0.9, carbsPer100g: 10, fatPer100g: 0.2, category: "Verduras" },
  { name: "Abobrinha", caloriesPer100g: 17, proteinPer100g: 1.2, carbsPer100g: 3.1, fatPer100g: 0.3, category: "Verduras" },
  { name: "Espinafre", caloriesPer100g: 23, proteinPer100g: 2.9, carbsPer100g: 3.6, fatPer100g: 0.4, category: "Verduras" },

  // Industrializados comuns
  { name: "Açaí (com granola)", caloriesPer100g: 178, proteinPer100g: 2.3, carbsPer100g: 28, fatPer100g: 7, category: "Outros" },
  { name: "Granola", caloriesPer100g: 420, proteinPer100g: 10, carbsPer100g: 66, fatPer100g: 14, category: "Outros" },
  { name: "Chocolate ao leite", caloriesPer100g: 535, proteinPer100g: 7.6, carbsPer100g: 60, fatPer100g: 30, category: "Outros" },
  { name: "Chocolate amargo (70%)", caloriesPer100g: 598, proteinPer100g: 7.8, carbsPer100g: 46, fatPer100g: 43, category: "Outros" },
  { name: "Pipoca (sem óleo)", caloriesPer100g: 375, proteinPer100g: 11, carbsPer100g: 74, fatPer100g: 4.5, category: "Outros" },
  { name: "Coxinha", caloriesPer100g: 263, proteinPer100g: 9, carbsPer100g: 28, fatPer100g: 13, category: "Outros" },
  { name: "Pão de queijo", caloriesPer100g: 363, proteinPer100g: 6, carbsPer100g: 34, fatPer100g: 22, category: "Outros" },
];

// Exercise calorie burn per minute by intensity (per kg bodyweight)
export interface ExerciseData {
  name: string;
  lightPerKgMin: number;
  moderatePerKgMin: number;
  intensePerKgMin: number;
}

export const exerciseDatabase: ExerciseData[] = [
  { name: "Corrida", lightPerKgMin: 0.08, moderatePerKgMin: 0.13, intensePerKgMin: 0.18 },
  { name: "Caminhada", lightPerKgMin: 0.04, moderatePerKgMin: 0.06, intensePerKgMin: 0.09 },
  { name: "Ciclismo", lightPerKgMin: 0.06, moderatePerKgMin: 0.10, intensePerKgMin: 0.15 },
  { name: "Natação", lightPerKgMin: 0.07, moderatePerKgMin: 0.11, intensePerKgMin: 0.16 },
  { name: "Musculação", lightPerKgMin: 0.05, moderatePerKgMin: 0.08, intensePerKgMin: 0.10 },
  { name: "CrossFit", lightPerKgMin: 0.08, moderatePerKgMin: 0.13, intensePerKgMin: 0.18 },
  { name: "Yoga", lightPerKgMin: 0.03, moderatePerKgMin: 0.05, intensePerKgMin: 0.07 },
  { name: "Futebol", lightPerKgMin: 0.07, moderatePerKgMin: 0.11, intensePerKgMin: 0.16 },
  { name: "Basquete", lightPerKgMin: 0.07, moderatePerKgMin: 0.11, intensePerKgMin: 0.15 },
  { name: "Vôlei", lightPerKgMin: 0.05, moderatePerKgMin: 0.07, intensePerKgMin: 0.10 },
  { name: "Tênis", lightPerKgMin: 0.06, moderatePerKgMin: 0.09, intensePerKgMin: 0.13 },
  { name: "Boxe / Muay Thai", lightPerKgMin: 0.08, moderatePerKgMin: 0.13, intensePerKgMin: 0.18 },
  { name: "Jiu-Jitsu", lightPerKgMin: 0.07, moderatePerKgMin: 0.11, intensePerKgMin: 0.15 },
  { name: "Dança", lightPerKgMin: 0.05, moderatePerKgMin: 0.08, intensePerKgMin: 0.12 },
  { name: "Pular corda", lightPerKgMin: 0.09, moderatePerKgMin: 0.14, intensePerKgMin: 0.19 },
  { name: "Escalada", lightPerKgMin: 0.07, moderatePerKgMin: 0.10, intensePerKgMin: 0.14 },
  { name: "Remo", lightPerKgMin: 0.06, moderatePerKgMin: 0.10, intensePerKgMin: 0.15 },
  { name: "HIIT", lightPerKgMin: 0.08, moderatePerKgMin: 0.14, intensePerKgMin: 0.20 },
];

// Calculate BMR using Mifflin-St Jeor equation
export function calculateBMR(weight: number, height: number, age: number, sex: string): number {
  if (sex === "male") {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  }
  return 10 * weight + 6.25 * height - 5 * age - 161;
}

// NEAT multiplier (non-exercise activity thermogenesis)
// Uses a fixed 1.1 factor over BMR to account for basic daily functions
// (digestion, thermoregulation, fidgeting, minimal movement).
// Exercise calories are tracked separately to avoid double-counting.
export function getNEATMultiplier(): number {
  return 1.1;
}

// Goal adjustments
export function getGoalCalories(tdee: number, goal: string): number {
  switch (goal) {
    case "cutting": return Math.round(tdee * 0.80); // -20%
    case "bulking": return Math.round(tdee * 1.15); // +15%
    case "maintenance":
    default: return Math.round(tdee);
  }
}

// Macro targets based on goal, sex, and weight
// Returns { protein (g), carbs (g), fat (g) }
export function calculateMacroTargets(
  weight: number,
  sex: string,
  goal: string,
  targetCalories: number
): { protein: number; carbs: number; fat: number } {
  let proteinPerKg: number;
  let fatPerKg: number;

  switch (goal) {
    case "cutting":
      // High protein to preserve muscle, moderate fat
      proteinPerKg = sex === "male" ? 2.2 : 2.0;
      fatPerKg = sex === "male" ? 0.9 : 1.0; // Women need slightly more fat for hormones
      break;
    case "bulking":
      // Moderate-high protein, moderate fat, high carbs
      proteinPerKg = sex === "male" ? 1.8 : 1.6;
      fatPerKg = sex === "male" ? 0.9 : 1.0;
      break;
    case "maintenance":
    default:
      proteinPerKg = sex === "male" ? 2.0 : 1.8;
      fatPerKg = sex === "male" ? 0.9 : 1.0;
      break;
  }

  const protein = Math.round(proteinPerKg * weight);
  const fat = Math.round(fatPerKg * weight);
  // Remaining calories go to carbs
  const proteinCals = protein * 4;
  const fatCals = fat * 9;
  const carbsCals = Math.max(0, targetCalories - proteinCals - fatCals);
  const carbs = Math.round(carbsCals / 4);

  return { protein, carbs, fat };
}

// Calculate exercise calories
export function calculateExerciseCalories(
  sport: string,
  durationMinutes: number,
  intensity: string,
  bodyWeight: number
): number {
  const exercise = exerciseDatabase.find(e => e.name === sport);
  if (!exercise) return 0;

  let rate: number;
  switch (intensity) {
    case "light": rate = exercise.lightPerKgMin; break;
    case "moderate": rate = exercise.moderatePerKgMin; break;
    case "intense": rate = exercise.intensePerKgMin; break;
    default: rate = exercise.moderatePerKgMin;
  }

  return Math.round(rate * bodyWeight * durationMinutes);
}
