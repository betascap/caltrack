import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User, Ruler, Calendar, Target, ArrowLeft } from "lucide-react";

interface ProfileSetupProps {
  onProfileCreated: (id: number) => void;
  onBack?: () => void;
}

export function ProfileSetup({ onProfileCreated, onBack }: ProfileSetupProps) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [sex, setSex] = useState("male");
  const [goal, setGoal] = useState("maintenance");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createProfile = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/profiles", {
        name,
        age: parseInt(age),
        weight: parseFloat(weight),
        height: parseFloat(height),
        sex,
        goal,
        activityLevel: "sedentary",
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      onProfileCreated(data.id);
      toast({ title: "Perfil criado", description: "Seus dados foram salvos." });
    },
    onError: () => {
      toast({ title: "Erro", description: "Não foi possível criar o perfil.", variant: "destructive" });
    },
  });

  const isValid = name && age && weight && height && parseInt(age) > 0 && parseFloat(weight) > 0 && parseFloat(height) > 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-lg border-border/50">
        <CardHeader className="text-center pb-2">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="absolute left-4 top-4 h-8 w-8 p-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <User className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-xl font-semibold">Novo Perfil</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Insira seus dados para calcular suas necessidades calóricas
          </p>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-medium">Nome</Label>
            <Input
              id="name"
              data-testid="input-name"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="age" className="text-sm font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Idade
              </Label>
              <Input
                id="age"
                data-testid="input-age"
                type="number"
                placeholder="25"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sex" className="text-sm font-medium">Sexo</Label>
              <Select value={sex} onValueChange={setSex}>
                <SelectTrigger data-testid="select-sex">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="female">Feminino</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="weight" className="text-sm font-medium flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" /> Peso (kg)
              </Label>
              <Input
                id="weight"
                data-testid="input-weight"
                type="number"
                step="0.1"
                placeholder="75"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="height" className="text-sm font-medium flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5" /> Altura (cm)
              </Label>
              <Input
                id="height"
                data-testid="input-height"
                type="number"
                step="0.1"
                placeholder="175"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Objetivo</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "cutting", label: "Cutting", desc: "-20% cal" },
                { value: "maintenance", label: "Manutenção", desc: "TDEE base" },
                { value: "bulking", label: "Bulking", desc: "+15% cal" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  data-testid={`goal-${opt.value}`}
                  onClick={() => setGoal(opt.value)}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    goal === opt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <span className="text-sm font-semibold block">{opt.label}</span>
                  <span className="text-xs text-muted-foreground">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <Button
            data-testid="button-create-profile"
            className="w-full mt-2"
            disabled={!isValid || createProfile.isPending}
            onClick={() => createProfile.mutate()}
          >
            {createProfile.isPending ? "Salvando..." : "Começar"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
