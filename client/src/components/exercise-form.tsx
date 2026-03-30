import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { exerciseDatabase, calculateExerciseCalories } from "@/lib/calories";
import { Flame, Plus } from "lucide-react";

interface ExerciseFormProps {
  profileId: number;
  date: string;
  bodyWeight: number;
}

export function ExerciseForm({ profileId, date, bodyWeight }: ExerciseFormProps) {
  const [sport, setSport] = useState("");
  const [duration, setDuration] = useState("");
  const [intensity, setIntensity] = useState("moderate");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const caloriesBurned = sport && duration
    ? calculateExerciseCalories(sport, parseInt(duration), intensity, bodyWeight)
    : 0;

  const addExercise = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/exercise", {
        profileId,
        sport,
        durationMinutes: parseInt(duration),
        intensity,
        caloriesBurned,
        date,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exercise", profileId, date] });
      setSport("");
      setDuration("");
      setIntensity("moderate");
      toast({ title: "Exercício registrado", description: `${caloriesBurned} kcal queimadas.` });
    },
  });

  const canSubmit = sport && duration && parseInt(duration) > 0;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" />
          Registrar Exercício
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs">Esporte / Atividade</Label>
          <Select value={sport} onValueChange={setSport}>
            <SelectTrigger data-testid="select-sport">
              <SelectValue placeholder="Escolha um exercício" />
            </SelectTrigger>
            <SelectContent>
              {exerciseDatabase.map((ex) => (
                <SelectItem key={ex.name} value={ex.name}>
                  {ex.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Duração (min)</Label>
            <Input
              data-testid="input-exercise-duration"
              type="number"
              placeholder="45"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Intensidade</Label>
            <Select value={intensity} onValueChange={setIntensity}>
              <SelectTrigger data-testid="select-intensity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Leve</SelectItem>
                <SelectItem value="moderate">Moderada</SelectItem>
                <SelectItem value="intense">Intensa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {caloriesBurned > 0 && (
          <div className="text-center py-2 bg-orange-500/10 rounded-lg">
            <span className="text-2xl font-bold text-orange-500 tabular-nums">
              -{caloriesBurned}
            </span>
            <span className="text-sm text-muted-foreground ml-1">kcal</span>
          </div>
        )}

        <Button
          data-testid="button-add-exercise"
          className="w-full"
          disabled={!canSubmit || addExercise.isPending}
          onClick={() => addExercise.mutate()}
        >
          <Plus className="w-4 h-4 mr-1" />
          {addExercise.isPending ? "Registrando..." : "Registrar"}
        </Button>
      </CardContent>
    </Card>
  );
}
