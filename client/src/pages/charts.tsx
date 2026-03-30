import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { calculateBMR, getNEATMultiplier, getGoalCalories } from "@/lib/calories";
import type { Profile } from "@shared/schema";
import { BarChart3 } from "lucide-react";
import { format, subDays, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from "recharts";

interface ChartsProps {
  profileId: number;
}

interface DailyTotal {
  date: string;
  consumed: number;
  burned: number;
}

type Period = "week" | "month" | "all";

export function Charts({ profileId }: ChartsProps) {
  const [period, setPeriod] = useState<Period>("week");

  const today = new Date();
  const dateRanges = useMemo(() => {
    const todayStr = format(today, "yyyy-MM-dd");
    switch (period) {
      case "week": {
        const start = format(subDays(today, 6), "yyyy-MM-dd");
        return { start, end: todayStr };
      }
      case "month": {
        const start = format(subDays(today, 29), "yyyy-MM-dd");
        return { start, end: todayStr };
      }
      case "all": {
        return { start: "2020-01-01", end: todayStr };
      }
    }
  }, [period]);

  const { data: profile } = useQuery<Profile>({
    queryKey: ["/api/profiles", profileId],
  });

  const { data: dailyTotals = [] } = useQuery<DailyTotal[]>({
    queryKey: ["/api/history", profileId, `?start=${dateRanges.start}&end=${dateRanges.end}`],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/history/${profileId}?start=${dateRanges.start}&end=${dateRanges.end}`);
      return res.json();
    },
  });

  const bmr = profile ? calculateBMR(profile.weight, profile.height, profile.age, profile.sex) : 0;
  const baseDailyCalories = Math.round(bmr * getNEATMultiplier());
  const targetCalories = profile ? getGoalCalories(baseDailyCalories, profile.goal) : 0;

  // Chart data
  const chartData = useMemo(() => {
    return dailyTotals.map(d => ({
      date: d.date,
      label: format(new Date(d.date + "T12:00:00"), period === "all" ? "dd/MM" : "EEE d", { locale: ptBR }),
      consumed: Math.round(d.consumed),
      burned: Math.round(d.burned),
      balance: Math.round(d.consumed - targetCalories - d.burned),
    }));
  }, [dailyTotals, targetCalories, period]);

  // Balance chart data
  const balanceData = useMemo(() => {
    return dailyTotals.map(d => {
      const bal = Math.round(d.consumed - targetCalories - d.burned);
      return {
        date: d.date,
        label: format(new Date(d.date + "T12:00:00"), period === "all" ? "dd/MM" : "EEE d", { locale: ptBR }),
        balance: bal,
        fill: bal > 0 ? "hsl(0, 72%, 50%)" : "hsl(142, 60%, 45%)",
      };
    });
  }, [dailyTotals, targetCalories, period]);

  // Summary
  const summary = useMemo(() => {
    const totalConsumed = dailyTotals.reduce((s, d) => s + d.consumed, 0);
    const totalBurned = dailyTotals.reduce((s, d) => s + d.burned, 0);
    const daysWithData = dailyTotals.filter(d => d.consumed > 0).length;
    const totalBudget = targetCalories * daysWithData + totalBurned;
    const totalBalance = totalConsumed - totalBudget;
    return { totalConsumed, totalBurned, daysWithData, totalBalance };
  }, [dailyTotals, targetCalories]);

  const periodLabels: Record<Period, string> = {
    week: "Últimos 7 dias",
    month: "Últimos 30 dias",
    all: "Todo o período",
  };

  return (
    <div className="space-y-4">
      {/* Period selector */}
      <div className="flex gap-2 justify-center">
        {(["week", "month", "all"] as Period[]).map((p) => (
          <Button
            key={p}
            data-testid={`period-${p}`}
            variant={period === p ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod(p)}
            className="text-xs"
          >
            {p === "week" ? "Semana" : p === "month" ? "Mês" : "Total"}
          </Button>
        ))}
      </div>

      {/* Summary */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            {periodLabels[period]}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <span className="text-xs text-muted-foreground block">Ingerido</span>
              <span className="text-base font-bold tabular-nums">{Math.round(summary.totalConsumed)}</span>
            </div>
            <div className="text-center">
              <span className="text-xs text-muted-foreground block">Queimado</span>
              <span className="text-base font-bold text-orange-500 tabular-nums">{Math.round(summary.totalBurned)}</span>
            </div>
            <div className="text-center">
              <span className="text-xs text-muted-foreground block">Balanço</span>
              <span className={`text-base font-bold tabular-nums ${
                summary.totalBalance < 0 ? "text-green-500" : summary.totalBalance > 0 ? "text-red-500" : "text-muted-foreground"
              }`}>
                {summary.totalBalance > 0 ? "+" : ""}{Math.round(summary.totalBalance)}
              </span>
            </div>
          </div>
          {summary.daysWithData > 0 && (
            <p className="text-xs text-muted-foreground text-center">
              {summary.daysWithData} dia{summary.daysWithData !== 1 && "s"} com registros
            </p>
          )}
        </CardContent>
      </Card>

      {/* Consumed vs Burned chart */}
      {chartData.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Calorias ingeridas vs queimadas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Legend
                  iconSize={10}
                  wrapperStyle={{ fontSize: "11px" }}
                />
                <ReferenceLine y={targetCalories} stroke="hsl(var(--primary))" strokeDasharray="4 4" label={{ value: "Meta", position: "right", fontSize: 10, fill: "hsl(var(--primary))" }} />
                <Bar dataKey="consumed" name="Ingeridas" fill="hsl(var(--chart-1))" radius={[3, 3, 0, 0]} />
                <Bar dataKey="burned" name="Queimadas" fill="hsl(var(--chart-5))" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Balance chart */}
      {balanceData.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Balanço diário (déficit / superávit)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={balanceData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`${value > 0 ? "+" : ""}${value} kcal`, value > 0 ? "Superávit" : "Déficit"]}
                />
                <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" />
                <Bar dataKey="balance" name="Balanço" radius={[3, 3, 0, 0]}>
                  {balanceData.map((entry, index) => (
                    <rect key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-green-500 inline-block" /> Déficit
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" /> Superávit
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {chartData.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          <p className="text-sm">Nenhum dado neste período.</p>
          <p className="text-xs mt-1">Registre alimentos e exercícios para ver os gráficos.</p>
        </div>
      )}
    </div>
  );
}
