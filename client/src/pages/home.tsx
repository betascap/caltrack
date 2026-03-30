import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ProfileSetup } from "@/components/profile-setup";
import { ProfileSelect } from "@/components/profile-select";
import { Dashboard } from "./dashboard";
import type { Profile } from "@shared/schema";

type View = "select" | "create" | "dashboard";

export default function Home() {
  const [profileId, setProfileId] = useState<number | null>(null);
  const [view, setView] = useState<View>("select");
  const queryClient = useQueryClient();

  const { data: profiles = [], isLoading } = useQuery<Profile[]>({
    queryKey: ["/api/profiles"],
  });

  const handleSelectProfile = (id: number) => {
    setProfileId(id);
    setView("dashboard");
  };

  const handleCreateNew = () => {
    setView("create");
  };

  const handleProfileCreated = (id: number) => {
    setProfileId(id);
    setView("dashboard");
    queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
  };

  const handleSwitchProfile = () => {
    setProfileId(null);
    setView("select");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground text-sm">Carregando...</div>
      </div>
    );
  }

  // No profiles exist → go straight to create
  if (profiles.length === 0 && view === "select") {
    return <ProfileSetup onProfileCreated={handleProfileCreated} />;
  }

  if (view === "create") {
    return (
      <ProfileSetup
        onProfileCreated={handleProfileCreated}
        onBack={profiles.length > 0 ? () => setView("select") : undefined}
      />
    );
  }

  if (view === "dashboard" && profileId !== null) {
    return <Dashboard profileId={profileId} onReset={handleSwitchProfile} />;
  }

  // Default: profile selection screen
  return (
    <ProfileSelect
      profiles={profiles}
      onSelect={handleSelectProfile}
      onCreateNew={handleCreateNew}
    />
  );
}
