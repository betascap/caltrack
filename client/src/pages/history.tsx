import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { calculateBMR, getNEATMultiplier, getGoalCalories } from "@/lib/calories";
import type { Profile } from "@shared/schema";
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp, Minus, Calendar } from "lucide-react";
import { format, startOfMonth, endOfMonth, addMonths, subMonths, eachDayOfInterval, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

interface HistoryProps {
  profileId: number;
}

interface DailyTotal {
  date: string;
  consumed: number;
  burned: number;
}

export function History({ profileId }: HistoryProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const startDate = format(startOfMonth(currentMonth), "yyyy-MM-dd");
  const endDate = format(endOfMonth(currentMonth), "yyyy-MM-dd");

  const { data: profile } = useQuery<Profile>({
    queryKey: ["/api/profiles", profileId],
  });

  const { data: dailyTotals = [] } = useQuery<DailyTotal[]>({
    queryKey: ["/api/history", profileId, `?start=${startDate}&end=${endDate}`],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/history/${profileId}?start=${startDate}&end=${endDate}`);
      return res.json();
    },
  });

  const bmr = profile ? calculateBMR(profile.weight, profile.height, profile.age, profile.sex) : 0;
  const baseDailyCalories = Math.round(bmr * getNEATMultiplier());
  const targetCalories = profile ? getGoalCalories(baseDailyCalories, profile.goal) : 0;

  // Calculate monthly stats
  const monthStats = useMemo(() => {
    const daysInMonth = eachDayOfInterval({
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth),
    }).length;

    const totalConsumed = dailyTotals.reduce((sum, d) => sum + d.consumed, 0);
    const totalBurned = dailyTotals.reduce((sum, d) => sum + d.burned, 0);
    const daysWithData = dailyTotals.filter(d => d.consumed > 0 || d.burned > 0).length;

    // Balance = target (what you should eat) vs consumed - burned
    // Deficit = you ate less than target (good for cutting)
    // Surplus = you ate more than target (good for bulking)
    const totalTarget = targetCalories * daysWithData;
    const totalBurnedAdj = totalBurned; // exercise calories that extend your budget
    const netConsumed = totalConsumed; // what you actually ate
    const netBudget = totalTarget + totalBurnedAdj; // what you could have eaten
    const balance = netConsumed - netBudget; // positive = surplus, negative = deficit

    const avgConsumed = daysWithData > 0 ? totalConsumed / daysWithData : 0;
    const avgBurned = daysWithData > 0 ? totalBurned / daysWithData : 0;

    return {
      totalConsumed,
      totalBurned,
      daysWithData,
      daysInMonth,
      balance,
      avgConsumed,
      avgBurned,
      totalTarget: netBudget,
    };
  }, [dailyTotals, targetCalories, currentMonth]);

  const isDeficit = monthStats.balance < 0;
  const isSurplus = monthStats.balance > 0;

  // Build daily breakdown with balance
  const dailyBreakdown = useMemo(() => {
    return dailyTotals.map(d => {
      const dayBudget = targetCalories + d.burned;
      const dayBalance = d.consumed - dayBudget;
      return { ...d, dayBalance, dayBudget };
    });
  }, [dailyTotals, targetCalories]);

  return (
    <div className="space-y-4">
      {/* Month selector */}
      <div className="flex items-center justify-center gap-3">
        <Button
          data-testid="button-prev-month"
          variant="ghost"
          size="sm"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm font-semibold min-w-[160px] text-center capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
        </span>
        <Button
          data-testid="button-next-month"
          variant="ghost"
          size="sm"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Monthly summary card */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Resumo do mês
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Balance hero */}
          <div className="text-center py-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              {isDeficit && <TrendingDown className="w-5 h-5 text-green-500" />}
              {isSurplus && <TrendingUp className="w-5 h-5 text-red-500" />}
              {!isDeficit && !isSurplus && <Minus className="w-5 h-5 text-muted-foreground" />}
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                {isDeficit ? "Déficit calórico" : isSurplus ? "Superávit calórico" : "Equilíbrio"}
              </span>
            </div>
            <span className={`text-3xl font-bold tabular-nums ${
              isDeficit ? "text-green-500" : isSurplus ? "text-red-500" : "text-muted-foreground"
            }`}>
              {isDeficit ? "" : "+"}{Math.round(monthStats.balance)}
            </span>
            <span className="text-sm text-muted-foreground ml-1">kcal</span>
            {monthStats.daysWithData > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Em {monthStats.daysWithData} dia{monthStats.daysWithData !== 1 && "s"} com registros
              </p>
            )}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-accent/30 rounded-lg p-3 text-center">
              <span className="text-xs text-muted-foreground block">Total ingerido</span>
              <span className="text-lg font-bold tabular-nums">{Math.round(monthStats.totalConsumed)}</span>
              <span className="text-xs text-muted-foreground"> kcal</span>
            </div>
            <div className="bg-accent/30 rounded-lg p-3 text-center">
              <span className="text-xs text-muted-foreground block">Total queimado</span>
              <span className="text-lg font-bold text-orange-500 tabular-nums">{Math.round(monthStats.totalBurned)}</span>
              <span className="text-xs text-muted-foreground"> kcal</span>
            </div>
            <div className="bg-accent/30 rounded-lg p-3 text-center">
              <span className="text-xs text-muted-foreground block">Média ingerida/dia</span>
              <span className="text-lg font-bold tabular-nums">{Math.round(monthStats.avgConsumed)}</span>
              <span className="text-xs text-muted-foreground"> kcal</span>
            </div>
            <div className="bg-accent/30 rounded-lg p-3 text-center">
              <span className="text-xs text-muted-foreground block">Média queimada/dia</span>
              <span className="text-lg font-bold text-orange-500 tabular-nums">{Math.round(monthStats.avgBurned)}</span>
              <span className="text-xs text-muted-foreground"> kcal</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily breakdown */}
      {dailyBreakdown.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Dia a dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {dailyBreakdown.map((day) => (
                <div
                  key={day.date}
                  className="flex items-center justify-between py-2 px-2.5 rounded-md hover:bg-accent/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium capitalize">
                      {format(new Date(day.date + "T12:00:00"), "EEE, d", { locale: ptBR })}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {Math.round(day.consumed)} ingr. · {Math.round(day.burned)} queim.
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 ml-2">
                    {day.dayBalance < 0 ? (
                      <TrendingDown className="w-3.5 h-3.5 text-green-500" />
                    ) : day.dayBalance > 0 ? (
                      <TrendingUp className="w-3.5 h-3.5 text-red-500" />
                    ) : (
                      <Minus className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                    <span className={`text-sm font-semibold tabular-nums ${
                      day.dayBalance < 0 ? "text-green-500" : day.dayBalance > 0 ? "text-red-500" : "text-muted-foreground"
                    }`}>
                      {day.dayBalance > 0 ? "+" : ""}{Math.round(day.dayBalance)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {dailyBreakdown.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          <p className="text-sm">Nenhum registro neste mês.</p>
        </div>
      )}
    </div>
  );
}
