import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { FoodEntry, ExerciseEntry } from "@shared/schema";
import { Trash2, UtensilsCrossed, Flame } from "lucide-react";

const mealLabels: Record<string, string> = {
  breakfast: "Café da manhã",
  lunch: "Almoço",
  dinner: "Jantar",
  snack: "Lanche",
};

const intensityLabels: Record<string, string> = {
  light: "Leve",
  moderate: "Moderada",
  intense: "Intensa",
};

interface DailyLogProps {
  foods: FoodEntry[];
  exercises: ExerciseEntry[];
  profileId: number;
  date: string;
}

export function DailyLog({ foods, exercises, profileId, date }: DailyLogProps) {
  const queryClient = useQueryClient();

  const deleteFood = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/food/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/food", profileId, date] });
    },
  });

  const deleteExercise = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/exercise/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exercise", profileId, date] });
    },
  });

  // Group foods by meal type
  const mealOrder = ["breakfast", "lunch", "dinner", "snack"];
  const groupedFoods = mealOrder
    .map((meal) => ({
      meal,
      label: mealLabels[meal],
      items: foods.filter((f) => f.mealType === meal),
      total: foods.filter((f) => f.mealType === meal).reduce((sum, f) => sum + f.calories, 0),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="space-y-3">
      {/* Food log */}
      {groupedFoods.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-primary" />
              Refeições do dia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {groupedFoods.map((group) => (
              <div key={group.meal}>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-sm font-semibold text-foreground">{group.label}</h4>
                  <span className="text-xs font-medium text-primary tabular-nums">{Math.round(group.total)} kcal</span>
                </div>
                <div className="space-y-1">
                  {group.items.map((food) => (
                    <div
                      key={food.id}
                      data-testid={`food-entry-${food.id}`}
                      className="flex items-center justify-between py-1.5 px-2.5 rounded-md hover:bg-accent/30 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium truncate block">{food.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {food.weightGrams}g
                          {food.brand && ` · ${food.brand}`}
                          {food.protein != null && ` · P:${food.protein}g`}
                          {food.carbs != null && ` C:${food.carbs}g`}
                          {food.fat != null && ` G:${food.fat}g`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <span className="text-sm font-semibold tabular-nums">{Math.round(food.calories)}</span>
                        <Button
                          data-testid={`delete-food-${food.id}`}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                          onClick={() => deleteFood.mutate(food.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Exercise log */}
      {exercises.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              Exercícios do dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {exercises.map((ex) => (
                <div
                  key={ex.id}
                  data-testid={`exercise-entry-${ex.id}`}
                  className="flex items-center justify-between py-1.5 px-2.5 rounded-md hover:bg-accent/30 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium truncate block">{ex.sport}</span>
                    <span className="text-xs text-muted-foreground">
                      {ex.durationMinutes} min · {intensityLabels[ex.intensity] || ex.intensity}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-sm font-semibold text-orange-500 tabular-nums">
                      -{Math.round(ex.caloriesBurned)}
                    </span>
                    <Button
                      data-testid={`delete-exercise-${ex.id}`}
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                      onClick={() => deleteExercise.mutate(ex.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {groupedFoods.length === 0 && exercises.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          <p className="text-sm">Nenhum registro hoje.</p>
          <p className="text-xs mt-1">Adicione alimentos ou exercícios acima.</p>
        </div>
      )}
    </div>
  );
}
