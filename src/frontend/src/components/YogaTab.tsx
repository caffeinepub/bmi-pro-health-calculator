import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { yogaGoals, yogaLevels, yogaPoses, yogaTypes } from "@/data/yoga";
import type { YogaPose } from "@/data/yoga";
import { AlertTriangle, Timer, Wind } from "lucide-react";
import { useMemo, useState } from "react";

export function YogaTab() {
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedLevel, setSelectedLevel] = useState<string>("All");
  const [selectedGoal, setSelectedGoal] = useState<string>("All");
  const [viewPose, setViewPose] = useState<YogaPose | null>(null);

  const filtered = useMemo(
    () =>
      yogaPoses.filter((p) => {
        const matchT = selectedType === "All" || p.type === selectedType;
        const matchL = selectedLevel === "All" || p.level === selectedLevel;
        const matchG = selectedGoal === "All" || p.goals.includes(selectedGoal);
        return matchT && matchL && matchG;
      }),
    [selectedType, selectedLevel, selectedGoal],
  );

  const levelColors: Record<string, string> = {
    Beginner: "bg-primary/10 text-primary border-primary/30",
    Intermediate: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30",
    Advanced: "bg-red-500/10 text-red-300 border-red-500/30",
  };

  const typeIcons: Record<string, string> = {
    Pose: "🧘",
    Pranayama: "💨",
    Meditation: "🧠",
  };

  return (
    <div className="space-y-5">
      {/* Hero Image */}
      <div className="rounded-xl overflow-hidden relative h-36 sm:h-48 mb-2">
        <img
          src="/assets/generated/yoga-hero.dim_800x400.jpg"
          alt="Yoga"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end p-4">
          <div>
            <h2 className="font-display font-bold text-2xl text-white">
              Yoga &amp; Pranayama 🧘
            </h2>
            <p className="text-white/80 text-sm">
              Poses, breathing exercises, and mindful practice
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-36" data-ocid="yoga.type.select">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Types</SelectItem>
            {yogaTypes.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedLevel} onValueChange={setSelectedLevel}>
          <SelectTrigger className="w-36" data-ocid="yoga.level.select">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Levels</SelectItem>
            {yogaLevels.map((l) => (
              <SelectItem key={l} value={l}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedGoal} onValueChange={setSelectedGoal}>
          <SelectTrigger className="w-40" data-ocid="yoga.goal.select">
            <SelectValue placeholder="Goal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Goals</SelectItem>
            {yogaGoals.map((g) => (
              <SelectItem key={g} value={g}>
                {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((pose, idx) => (
          <Card
            key={pose.id}
            className="bg-card border-border card-hover"
            data-ocid={`yoga.item.${idx + 1}`}
          >
            <div className="relative h-28 overflow-hidden rounded-t-lg">
              <img
                src={pose.image}
                alt={pose.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
            </div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{typeIcons[pose.type]}</span>
                    <CardTitle className="text-sm font-display">
                      {pose.name}
                    </CardTitle>
                  </div>
                  <div className="text-xs text-muted-foreground italic mt-0.5">
                    {pose.sanskritName}
                  </div>
                </div>
                <Badge className={`text-xs border ${levelColors[pose.level]}`}>
                  {pose.level}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                <span className="flex items-center gap-1">
                  <Timer className="w-3 h-3" />
                  {pose.duration}
                </span>
                {pose.type === "Pranayama" && (
                  <span className="flex items-center gap-1">
                    <Wind className="w-3 h-3" />
                    Breathing
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                {pose.description}
              </p>
              <div className="flex flex-wrap gap-1 mb-3">
                {pose.goals.slice(0, 3).map((g) => (
                  <Badge key={g} variant="outline" className="text-xs">
                    {g}
                  </Badge>
                ))}
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => setViewPose(pose)}
                    data-ocid={`yoga.view.open_modal_button.${idx + 1}`}
                  >
                    View Details
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <span>{typeIcons[viewPose?.type || "Pose"]}</span>
                      {viewPose?.name}
                    </DialogTitle>
                  </DialogHeader>
                  {viewPose && (
                    <div className="space-y-4">
                      <div className="text-sm text-muted-foreground italic">
                        {viewPose.sanskritName}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Badge
                          className={`border ${levelColors[viewPose.level]}`}
                        >
                          {viewPose.level}
                        </Badge>
                        <Badge variant="outline">{viewPose.type}</Badge>
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <Timer className="w-3 h-3" />
                          {viewPose.duration}
                        </Badge>
                      </div>
                      {viewPose.cautions && (
                        <Alert className="border-yellow-500/30 bg-yellow-500/10">
                          <AlertTriangle className="h-4 w-4 text-yellow-400" />
                          <AlertDescription className="text-yellow-300 text-xs">
                            {viewPose.cautions}
                          </AlertDescription>
                        </Alert>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {viewPose.description}
                      </p>
                      <div>
                        <h4 className="font-display font-semibold mb-2">
                          Benefits
                        </h4>
                        <ul className="space-y-1">
                          {viewPose.benefits.map((b) => (
                            <li
                              key={b}
                              className="flex items-start gap-2 text-sm"
                            >
                              <span className="text-primary">✓</span>
                              <span className="text-muted-foreground">{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-display font-semibold mb-2">
                          How to Practice
                        </h4>
                        <ol className="space-y-2">
                          {viewPose.instructions.map((step, i) => (
                            <li
                              key={step}
                              className="flex items-start gap-2 text-sm"
                            >
                              <span className="bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5">
                                {i + 1}
                              </span>
                              <span className="text-muted-foreground">
                                {step}
                              </span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="yoga.list.empty_state"
        >
          <div className="text-4xl mb-3">🧘</div>
          <p>No poses match your filters.</p>
        </div>
      )}
    </div>
  );
}
