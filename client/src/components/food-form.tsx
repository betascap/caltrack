import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { foodDatabase, FoodData } from "@/lib/calories";
import type { CustomFood } from "@shared/schema";
import { UtensilsCrossed, Plus, Search, Globe } from "lucide-react";

interface FoodFormProps {
  profileId: number;
  date: string;
}

// Unified food item for display
interface UnifiedFood {
  name: string;
  brand?: string | null;
  caloriesPer100g: number;
  proteinPer100g: number | null;
  carbsPer100g: number | null;
  fatPer100g: number | null;
  source: "builtin" | "community";
}

export function FoodForm({ profileId, date }: FoodFormProps) {
  const [search, setSearch] = useState("");
  const [selectedFood, setSelectedFood] = useState<UnifiedFood | null>(null);
  const [customName, setCustomName] = useState("");
  const [brand, setBrand] = useState("");
  const [weight, setWeight] = useState("");
  const [customCalPer100, setCustomCalPer100] = useState("");
  const [customProtPer100, setCustomProtPer100] = useState("");
  const [customCarbsPer100, setCustomCarbsPer100] = useState("");
  const [customFatPer100, setCustomFatPer100] = useState("");
  const [mealType, setMealType] = useState("lunch");
  const [isCustom, setIsCustom] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch community foods from server
  const { data: communityFoods = [] } = useQuery<CustomFood[]>({
    queryKey: ["/api/custom-foods"],
  });

  // Merge built-in + community foods for search
  const filteredFoods = useMemo(() => {
    if (!search.trim()) return [];
    const query = search.toLowerCase();

    // Built-in results
    const builtinResults: UnifiedFood[] = foodDatabase
      .filter(f => f.name.toLowerCase().includes(query) || f.category.toLowerCase().includes(query))
      .map(f => ({
        name: f.name,
        brand: null,
        caloriesPer100g: f.caloriesPer100g,
        proteinPer100g: f.proteinPer100g,
        carbsPer100g: f.carbsPer100g,
        fatPer100g: f.fatPer100g,
        source: "builtin" as const,
      }));

    // Community results
    const communityResults: UnifiedFood[] = communityFoods
      .filter(f => f.name.toLowerCase().includes(query) || (f.brand && f.brand.toLowerCase().includes(query)))
      .map(f => ({
        name: f.name,
        brand: f.brand,
        caloriesPer100g: f.caloriesPer100g,
        proteinPer100g: f.proteinPer100g,
        carbsPer100g: f.carbsPer100g,
        fatPer100g: f.fatPer100g,
        source: "community" as const,
      }));

    // Community first (user-added), then built-in
    return [...communityResults, ...builtinResults].slice(0, 10);
  }, [search, communityFoods]);

  const currentCalPer100 = isCustom
    ? parseFloat(customCalPer100) || 0
    : selectedFood?.caloriesPer100g || 0;

  const calculatedCalories = currentCalPer100 * (parseFloat(weight) || 0) / 100;

  // Save custom food to shared database
  const saveCustomFood = useMutation({
    mutationFn: async (food: { name: string; brand: string | null; caloriesPer100g: number; proteinPer100g: number | null; carbsPer100g: number | null; fatPer100g: number | null }) => {
      const res = await apiRequest("POST", "/api/custom-foods", food);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-foods"] });
    },
  });

  const addFood = useMutation({
    mutationFn: async () => {
      const name = isCustom ? customName : selectedFood!.name;
      const weightG = parseFloat(weight);

      let protein: number | null = null;
      let carbs: number | null = null;
      let fat: number | null = null;

      if (isCustom) {
        protein = customProtPer100 ? parseFloat(customProtPer100) * weightG / 100 : null;
        carbs = customCarbsPer100 ? parseFloat(customCarbsPer100) * weightG / 100 : null;
        fat = customFatPer100 ? parseFloat(customFatPer100) * weightG / 100 : null;
      } else {
        protein = selectedFood!.proteinPer100g != null ? selectedFood!.proteinPer100g * weightG / 100 : null;
        carbs = selectedFood!.carbsPer100g != null ? selectedFood!.carbsPer100g * weightG / 100 : null;
        fat = selectedFood!.fatPer100g != null ? selectedFood!.fatPer100g * weightG / 100 : null;
      }

      const res = await apiRequest("POST", "/api/food", {
        profileId,
        name,
        brand: brand || null,
        weightGrams: weightG,
        calories: Math.round(calculatedCalories),
        protein: protein ? Math.round(protein * 10) / 10 : null,
        carbs: carbs ? Math.round(carbs * 10) / 10 : null,
        fat: fat ? Math.round(fat * 10) / 10 : null,
        mealType,
        date,
      });

      // If custom food, also save to shared database
      if (isCustom && customName) {
        saveCustomFood.mutate({
          name: customName,
          brand: brand || null,
          caloriesPer100g: parseFloat(customCalPer100),
          proteinPer100g: customProtPer100 ? parseFloat(customProtPer100) : null,
          carbsPer100g: customCarbsPer100 ? parseFloat(customCarbsPer100) : null,
          fatPer100g: customFatPer100 ? parseFloat(customFatPer100) : null,
        });
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/food", profileId, date] });
      setSearch("");
      setSelectedFood(null);
      setCustomName("");
      setBrand("");
      setWeight("");
      setCustomCalPer100("");
      setCustomProtPer100("");
      setCustomCarbsPer100("");
      setCustomFatPer100("");
      toast({ title: "Alimento adicionado", description: `${Math.round(calculatedCalories)} kcal registradas.` });
    },
  });

  const canSubmit = (isCustom ? customName && customCalPer100 : selectedFood) && weight && parseFloat(weight) > 0;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <UtensilsCrossed className="w-4 h-4 text-primary" />
          Registrar Alimento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Toggle between database and custom */}
        <div className="flex gap-2">
          <Button
            data-testid="button-db-food"
            variant={!isCustom ? "default" : "outline"}
            size="sm"
            onClick={() => { setIsCustom(false); setSelectedFood(null); }}
            className="flex-1 text-xs"
          >
            Buscar
          </Button>
          <Button
            data-testid="button-custom-food"
            variant={isCustom ? "default" : "outline"}
            size="sm"
            onClick={() => { setIsCustom(true); setSearch(""); setSelectedFood(null); }}
            className="flex-1 text-xs"
          >
            Novo alimento
          </Button>
        </div>

        {!isCustom ? (
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                data-testid="input-food-search"
                placeholder="Buscar alimento..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setSelectedFood(null); }}
                className="pl-9"
              />
            </div>
            {filteredFoods.length > 0 && !selectedFood && (
              <div className="border rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                {filteredFoods.map((food, i) => (
                  <button
                    key={`${food.source}-${food.name}-${i}`}
                    data-testid={`food-option-${i}`}
                    onClick={() => { setSelectedFood(food); setSearch(food.name); if (food.brand) setBrand(food.brand); }}
                    className="w-full text-left px-3 py-2 hover:bg-accent/50 border-b last:border-b-0 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      {food.source === "community" && (
                        <Globe className="w-3 h-3 text-primary shrink-0" />
                      )}
                      <span className="text-sm font-medium">{food.name}</span>
                      {food.brand && <span className="text-xs text-muted-foreground">({food.brand})</span>}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {food.caloriesPer100g} kcal/100g
                      {food.source === "community" && " · adicionado por usuário"}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {selectedFood && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-2.5 text-sm">
                <div className="flex items-center gap-1.5">
                  {selectedFood.source === "community" && <Globe className="w-3 h-3 text-primary" />}
                  <span className="font-medium">{selectedFood.name}</span>
                  {selectedFood.brand && <span className="text-muted-foreground text-xs">({selectedFood.brand})</span>}
                </div>
                <span className="text-muted-foreground"> {selectedFood.caloriesPer100g} kcal/100g</span>
                <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                  {selectedFood.proteinPer100g != null && <span>P: {selectedFood.proteinPer100g}g</span>}
                  {selectedFood.carbsPer100g != null && <span>C: {selectedFood.carbsPer100g}g</span>}
                  {selectedFood.fatPer100g != null && <span>G: {selectedFood.fatPer100g}g</span>}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Input
              data-testid="input-custom-food-name"
              placeholder="Nome do alimento"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
            />
            <Input
              data-testid="input-custom-cal"
              type="number"
              placeholder="Calorias por 100g"
              value={customCalPer100}
              onChange={(e) => setCustomCalPer100(e.target.value)}
            />
            <div className="grid grid-cols-3 gap-2">
              <Input
                data-testid="input-custom-protein"
                type="number"
                placeholder="Prot/100g"
                value={customProtPer100}
                onChange={(e) => setCustomProtPer100(e.target.value)}
              />
              <Input
                data-testid="input-custom-carbs"
                type="number"
                placeholder="Carb/100g"
                value={customCarbsPer100}
                onChange={(e) => setCustomCarbsPer100(e.target.value)}
              />
              <Input
                data-testid="input-custom-fat"
                type="number"
                placeholder="Gord/100g"
                value={customFatPer100}
                onChange={(e) => setCustomFatPer100(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Globe className="w-3 h-3" />
              Alimentos novos ficam salvos para todos os usuários.
            </p>
          </div>
        )}

        <Input
          data-testid="input-food-brand"
          placeholder="Marca (opcional)"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Peso (g)</Label>
            <Input
              data-testid="input-food-weight"
              type="number"
              placeholder="150"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Refeição</Label>
            <Select value={mealType} onValueChange={setMealType}>
              <SelectTrigger data-testid="select-meal-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Café da manhã</SelectItem>
                <SelectItem value="lunch">Almoço</SelectItem>
                <SelectItem value="dinner">Jantar</SelectItem>
                <SelectItem value="snack">Lanche</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {weight && currentCalPer100 > 0 && (
          <div className="text-center py-2 bg-accent/30 rounded-lg">
            <span className="text-2xl font-bold text-primary tabular-nums">
              {Math.round(calculatedCalories)}
            </span>
            <span className="text-sm text-muted-foreground ml-1">kcal</span>
          </div>
        )}

        <Button
          data-testid="button-add-food"
          className="w-full"
          disabled={!canSubmit || addFood.isPending}
          onClick={() => addFood.mutate()}
        >
          <Plus className="w-4 h-4 mr-1" />
          {addFood.isPending ? "Adicionando..." : "Adicionar"}
        </Button>
      </CardContent>
    </Card>
  );
}
