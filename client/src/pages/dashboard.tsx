import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalorieRing } from "@/components/calorie-ring";
import { FoodForm } from "@/components/food-form";
import { ExerciseForm } from "@/components/exercise-form";
import { DailyLog } from "@/components/daily-log";
import { useTheme } from "@/components/theme-provider";
import { calculateBMR, getNEATMultiplier, getGoalCalories, calculateMacroTargets } from "@/lib/calories";
import type { Profile, FoodEntry, ExerciseEntry } from "@shared/schema";
import { Sun, Moon, ChevronLeft, ChevronRight, Settings, Flame, Target, Zap, UtensilsCrossed, Calendar, BarChart3, Pencil, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { History } from "./history";
import { Charts } from "./charts";
import { format, addDays, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";

type Tab = "today" | "history" | "charts";

interface DashboardProps {
  profileId: number;
  onReset: () => void;
}

const goalLabels: Record<string, string> = {
  cutting: "Cutting",
  maintenance: "Manutenção",
  bulking: "Bulking",
};

const goalColors: Record<string, string> = {
  cutting: "text-red-500",
  maintenance: "text-primary",
  bulking: "text-blue-500",
};

export function Dashboard({ profileId, onReset }: DashboardProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("today");
  const [editingWeight, setEditingWeight] = useState(false);
  const [newWeight, setNewWeight] = useState("");
  const { theme, toggleTheme } = useTheme();
  const queryClient = useQueryClient();
  const dateStr = format(selectedDate, "yyyy-MM-dd");

  const { data: profile } = useQuery<Profile>({
    queryKey: ["/api/profiles", profileId],
  });

  const { data: foods = [] } = useQuery<FoodEntry[]>({
    queryKey: ["/api/food", profileId, dateStr],
  });

  const { data: exercises = [] } = useQuery<ExerciseEntry[]>({
    queryKey: ["/api/exercise", profileId, dateStr],
  });

  const updateGoal = useMutation({
    mutationFn: async (goal: string) => {
      await apiRequest("PATCH", `/api/profiles/${profileId}`, { goal });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles", profileId] });
    },
  });

  const updateWeight = useMutation({
    mutationFn: async (weight: number) => {
      await apiRequest("PATCH", `/api/profiles/${profileId}`, { weight });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles", profileId] });
      setEditingWeight(false);
    },
  });

  // Calorie calculations
  // BMR = base metabolic rate (rest only)
  // Base daily = BMR × 1.1 (NEAT factor for basic daily functions)
  // Exercise calories are added separately to avoid double-counting
  const bmr = profile ? calculateBMR(profile.weight, profile.height, profile.age, profile.sex) : 0;
  const baseDailyCalories = Math.round(bmr * getNEATMultiplier());
  const targetCalories = profile ? getGoalCalories(baseDailyCalories, profile.goal) : 0;
  const macroTargets = profile ? calculateMacroTargets(profile.weight, profile.sex, profile.goal, targetCalories) : { protein: 0, carbs: 0, fat: 0 };

  const totalConsumed = useMemo(() =>
    foods.reduce((sum, f) => sum + f.calories, 0), [foods]
  );
  const totalBurned = useMemo(() =>
    exercises.reduce((sum, e) => sum + e.caloriesBurned, 0), [exercises]
  );
  const totalProtein = useMemo(() =>
    foods.reduce((sum, f) => sum + (f.protein || 0), 0), [foods]
  );
  const totalCarbs = useMemo(() =>
    foods.reduce((sum, f) => sum + (f.carbs || 0), 0), [foods]
  );
  const totalFat = useMemo(() =>
    foods.reduce((sum, f) => sum + (f.fat || 0), 0), [foods]
  );

  const remaining = Math.max(0, targetCalories + totalBurned - totalConsumed);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-label="CalTrack">
              <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2.5" className="text-primary" />
              <path d="M16 6 L16 16 L24 16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-primary" />
              <circle cx="16" cy="16" r="3" fill="currentColor" className="text-primary" />
            </svg>
            <span className="text-base font-bold">CalTrack</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              data-testid="button-toggle-theme"
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-8 w-8 p-0"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button
              data-testid="button-settings"
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="h-8 w-8 p-0"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4 pb-24">
        {/* Settings panel */}
        {showSettings && (
          <Card className="border-border/50 bg-card">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Perfil: {profile.name}</span>
                <Button data-testid="button-reset-profile" variant="ghost" size="sm" onClick={onReset} className="text-xs text-primary">
                  Trocar perfil
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span>Idade: {profile.age} anos</span>
                <span>Sexo: {profile.sex === "male" ? "Masculino" : "Feminino"}</span>
                <span className="flex items-center gap-1">
                  {editingWeight ? (
                    <span className="flex items-center gap-1">
                      Peso:
                      <Input
                        data-testid="input-edit-weight"
                        type="number"
                        step="0.1"
                        value={newWeight}
                        onChange={(e) => setNewWeight(e.target.value)}
                        className="h-6 w-16 text-sm px-1.5 py-0"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && newWeight) {
                            updateWeight.mutate(parseFloat(newWeight));
                          }
                          if (e.key === "Escape") setEditingWeight(false);
                        }}
                      />
                      kg
                      <Button
                        data-testid="button-save-weight"
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 text-primary"
                        onClick={() => newWeight && updateWeight.mutate(parseFloat(newWeight))}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      Peso: {profile.weight} kg
                      <Button
                        data-testid="button-edit-weight"
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 text-muted-foreground hover:text-primary"
                        onClick={() => { setNewWeight(String(profile.weight)); setEditingWeight(true); }}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                    </span>
                  )}
                </span>
                <span>Altura: {profile.height} cm</span>
              </div>
              <div className="pt-2 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">TMB: {Math.round(bmr)} kcal</span>
                  <span className="text-sm font-medium">Base diária: {baseDailyCalories} kcal</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Base = TMB × 1.1 (NEAT). Exercícios são somados à parte.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "today" && (
        <>
        {/* Date picker */}
        <div className="flex items-center justify-center gap-3">
          <Button
            data-testid="button-prev-day"
            variant="ghost"
            size="sm"
            onClick={() => setSelectedDate(subDays(selectedDate, 1))}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-semibold min-w-[180px] text-center capitalize">
            {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </span>
          <Button
            data-testid="button-next-day"
            variant="ghost"
            size="sm"
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Main calorie dashboard */}
        <Card className="border-border/50">
          <CardContent className="p-5">
            <div className="flex flex-col items-center">
              {/* Goal selector */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-muted-foreground">Objetivo:</span>
                <Select value={profile.goal} onValueChange={(v) => updateGoal.mutate(v)}>
                  <SelectTrigger data-testid="select-goal" className="h-7 w-auto min-w-[120px] text-xs font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cutting">Cutting (-20%)</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                    <SelectItem value="bulking">Bulking (+15%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <CalorieRing
                consumed={totalConsumed}
                target={targetCalories}
                burned={totalBurned}
                size={180}
              />

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4 mt-5 w-full">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <Target className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs text-muted-foreground">Meta</span>
                  </div>
                  <span className={`text-lg font-bold tabular-nums ${goalColors[profile.goal] || "text-foreground"}`}>
                    {targetCalories}
                  </span>
                  <span className="text-xs text-muted-foreground block">kcal</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <Zap className="w-3.5 h-3.5 text-yellow-500" />
                    <span className="text-xs text-muted-foreground">Ingeridas</span>
                  </div>
                  <span className="text-lg font-bold tabular-nums">
                    {Math.round(totalConsumed)}
                  </span>
                  <span className="text-xs text-muted-foreground block">kcal</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                    <span className="text-xs text-muted-foreground">Queimadas</span>
                  </div>
                  <span className="text-lg font-bold text-orange-500 tabular-nums">
                    {Math.round(totalBurned)}
                  </span>
                  <span className="text-xs text-muted-foreground block">kcal</span>
                </div>
              </div>

              {/* Macro targets with progress bars */}
              <div className="mt-4 pt-4 border-t border-border/50 w-full space-y-2.5">
                {[
                  { label: "Proteína", current: totalProtein, target: macroTargets.protein, color: "bg-blue-500", bgColor: "bg-blue-500/15" },
                  { label: "Carboidratos", current: totalCarbs, target: macroTargets.carbs, color: "bg-amber-500", bgColor: "bg-amber-500/15" },
                  { label: "Gordura", current: totalFat, target: macroTargets.fat, color: "bg-rose-400", bgColor: "bg-rose-400/15" },
                ].map(({ label, current, target, color, bgColor }) => {
                  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
                  const isOver = current > target;
                  return (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-medium text-muted-foreground">{label}</span>
                        <span className={`text-xs font-semibold tabular-nums ${isOver ? "text-destructive" : "text-foreground"}`}>
                          {Math.round(current)}g / {target}g
                        </span>
                      </div>
                      <div className={`h-2 rounded-full ${bgColor} overflow-hidden`}>
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${isOver ? "bg-destructive" : color}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Remaining message */}
              <div className="mt-4 text-center">
                {totalConsumed > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {totalConsumed <= targetCalories + totalBurned ? (
                      <>Você ainda pode consumir <span className="font-semibold text-primary">{Math.round(remaining)} kcal</span> hoje.</>
                    ) : (
                      <>Você excedeu sua meta em <span className="font-semibold text-destructive">{Math.round(totalConsumed - targetCalories - totalBurned)} kcal</span>.</>
                    )}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Forms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FoodForm profileId={profileId} date={dateStr} />
          <ExerciseForm profileId={profileId} date={dateStr} bodyWeight={profile.weight} />
        </div>

        {/* Daily log */}
        <DailyLog foods={foods} exercises={exercises} profileId={profileId} date={dateStr} />
        </>
        )}

        {activeTab === "history" && <History profileId={profileId} />}
        {activeTab === "charts" && <Charts profileId={profileId} />}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-10 bg-background/90 backdrop-blur-md border-t border-border/40">
        <div className="max-w-2xl mx-auto flex">
          {[
            { key: "today" as Tab, label: "Hoje", icon: UtensilsCrossed },
            { key: "history" as Tab, label: "Histórico", icon: Calendar },
            { key: "charts" as Tab, label: "Gráficos", icon: BarChart3 },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              data-testid={`tab-${key}`}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-3 transition-colors ${
                activeTab === key
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
