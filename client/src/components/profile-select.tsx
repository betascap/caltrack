import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Profile } from "@shared/schema";
import { User, Plus, ChevronRight, Trash2 } from "lucide-react";

interface ProfileSelectProps {
  profiles: Profile[];
  onSelect: (id: number) => void;
  onCreateNew: () => void;
}

const goalLabels: Record<string, string> = {
  cutting: "Cutting",
  maintenance: "Manutenção",
  bulking: "Bulking",
};

export function ProfileSelect({ profiles, onSelect, onCreateNew }: ProfileSelectProps) {
  const queryClient = useQueryClient();

  const deleteProfile = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/profiles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md border-border/50">
        <CardHeader className="text-center pb-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <User className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-xl font-semibold">Quem está usando?</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Selecione seu perfil para continuar
          </p>
        </CardHeader>
        <CardContent className="space-y-2 pt-1">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="flex items-center gap-2"
            >
              <button
                data-testid={`profile-select-${profile.id}`}
                onClick={() => onSelect(profile.id)}
                className="flex-1 flex items-center gap-3 p-3.5 rounded-lg border border-border/50 hover:border-primary/40 hover:bg-accent/30 transition-all group text-left"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-base font-bold text-primary">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold block truncate">{profile.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {profile.weight}kg · {profile.height}cm · {profile.age} anos · {goalLabels[profile.goal] || profile.goal}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </button>
              <Button
                data-testid={`delete-profile-${profile.id}`}
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 text-muted-foreground hover:text-destructive shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteProfile.mutate(profile.id);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}

          <div className="pt-2">
            <Button
              data-testid="button-create-new-profile"
              variant="outline"
              className="w-full"
              onClick={onCreateNew}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Novo perfil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
