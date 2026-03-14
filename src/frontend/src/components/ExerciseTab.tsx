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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  bodyParts,
  exerciseCategories,
  exerciseGoals,
  exerciseLevels,
  exercises,
} from "@/data/exercises";
import type { Exercise } from "@/data/exercises";
import { Clock, Dumbbell, Flame, Target } from "lucide-react";
import { useMemo, useState } from "react";

const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function ExerciseTab() {
  const [selectedLevel, setSelectedLevel] = useState<string>("All");
  const [selectedGoal, setSelectedGoal] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>("All");
  const [showPlanner, setShowPlanner] = useState(false);
  const [viewExercise, setViewExercise] = useState<Exercise | null>(null);
  const [weekPlan, setWeekPlan] = useState<Record<string, string[]>>(() => {
    try {
      const saved = localStorage.getItem("week_plan");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const filtered = useMemo(
    () =>
      exercises.filter((e) => {
        const matchL = selectedLevel === "All" || e.level === selectedLevel;
        const matchG = selectedGoal === "All" || e.goals.includes(selectedGoal);
        const matchC =
          selectedCategory === "All" || e.category === selectedCategory;
        const matchBP =
          selectedBodyPart === "All" || e.bodyPart === selectedBodyPart;
        return matchL && matchG && matchC && matchBP;
      }),
    [selectedLevel, selectedGoal, selectedCategory, selectedBodyPart],
  );

  const togglePlanExercise = (day: string, exId: string) => {
    setWeekPlan((prev) => {
      const dayList = prev[day] || [];
      const updated = dayList.includes(exId)
        ? dayList.filter((id) => id !== exId)
        : [...dayList, exId];
      const newPlan = { ...prev, [day]: updated };
      localStorage.setItem("week_plan", JSON.stringify(newPlan));
      return newPlan;
    });
  };

  const levelColors: Record<string, string> = {
    Beginner: "bg-primary/10 text-primary border-primary/30",
    Intermediate: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30",
    Advanced: "bg-red-500/10 text-red-300 border-red-500/30",
  };

  return (
    <div className="space-y-5">
      {/* Quick Body Part Fat Burn Shortcuts */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Targeted Fat Burn</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              selectedBodyPart === "All"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted/40 text-muted-foreground border-border hover:border-primary/50"
            }`}
            onClick={() => {
              setSelectedBodyPart("All");
              setSelectedGoal("All");
            }}
            data-ocid="exercise.bodypart.all.button"
          >
            All
          </button>
          {bodyParts.map((bp) => (
            <button
              key={bp}
              type="button"
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                selectedBodyPart === bp
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/40 text-muted-foreground border-border hover:border-primary/50"
              }`}
              onClick={() => {
                setSelectedBodyPart(bp);
                setSelectedGoal("Fat Burn");
              }}
              data-ocid={`exercise.bodypart.${bp.toLowerCase().replace(/[^a-z0-9]/g, "_")}.button`}
            >
              {bp}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Select value={selectedLevel} onValueChange={setSelectedLevel}>
          <SelectTrigger className="w-36" data-ocid="exercise.level.select">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Levels</SelectItem>
            {exerciseLevels.map((l) => (
              <SelectItem key={l} value={l}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedGoal} onValueChange={setSelectedGoal}>
          <SelectTrigger className="w-40" data-ocid="exercise.goal.select">
            <SelectValue placeholder="Goal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Goals</SelectItem>
            {exerciseGoals.map((g) => (
              <SelectItem key={g} value={g}>
                {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-36" data-ocid="exercise.category.select">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Types</SelectItem>
            {exerciseCategories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 ml-auto">
          <Label className="text-sm">Weekly Planner</Label>
          <Switch
            checked={showPlanner}
            onCheckedChange={setShowPlanner}
            data-ocid="exercise.planner.switch"
          />
        </div>
      </div>

      {selectedBodyPart !== "All" && (
        <div className="flex items-center gap-2 text-sm text-primary">
          <Target className="w-3 h-3" />
          <span>
            Showing fat burn exercises for: <strong>{selectedBodyPart}</strong>
          </span>
          <button
            type="button"
            className="text-xs text-muted-foreground underline"
            onClick={() => {
              setSelectedBodyPart("All");
              setSelectedGoal("All");
            }}
          >
            Clear
          </button>
        </div>
      )}

      {showPlanner && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display">
              Weekly Workout Planner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weekDays.map((day) => (
                <div key={day}>
                  <div className="text-sm font-medium mb-1 text-muted-foreground">
                    {day}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {exercises.map((ex) => {
                      const isSelected = (weekPlan[day] || []).includes(ex.id);
                      return (
                        <button
                          type="button"
                          key={ex.id}
                          className={`text-xs px-2 py-1 rounded border transition-colors ${
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-muted/40 text-muted-foreground border-border hover:border-primary/50"
                          }`}
                          onClick={() => togglePlanExercise(day, ex.id)}
                        >
                          {ex.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((ex, idx) => (
          <Card
            key={ex.id}
            className="bg-card border-border card-hover"
            data-ocid={`exercise.item.${idx + 1}`}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-sm font-display">
                  {ex.name}
                </CardTitle>
                <Badge className={`text-xs border ${levelColors[ex.level]}`}>
                  {ex.level}
                </Badge>
              </div>
              <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {ex.duration} min
                </span>
                <span className="flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  {ex.caloriesBurn} kcal
                </span>
                <span className="flex items-center gap-1">
                  <Dumbbell className="w-3 h-3" />
                  {ex.category}
                </span>
              </div>
              {ex.bodyPart && (
                <div className="flex items-center gap-1 mt-1">
                  <Target className="w-3 h-3 text-primary" />
                  <span className="text-xs text-primary">{ex.bodyPart}</span>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                {ex.description}
              </p>
              <div className="flex flex-wrap gap-1 mb-3">
                {ex.goals.map((g) => (
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
                    onClick={() => setViewExercise(ex)}
                    data-ocid={`exercise.view.open_modal_button.${idx + 1}`}
                  >
                    View Details
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{viewExercise?.name}</DialogTitle>
                  </DialogHeader>
                  {viewExercise && (
                    <div className="space-y-4">
                      <div className="flex gap-2 flex-wrap">
                        <Badge
                          className={`border ${levelColors[viewExercise.level]}`}
                        >
                          {viewExercise.level}
                        </Badge>
                        <Badge variant="outline">{viewExercise.category}</Badge>
                        <Badge variant="outline">
                          {viewExercise.duration} min
                        </Badge>
                        <Badge variant="outline" className="text-primary">
                          {viewExercise.caloriesBurn} kcal
                        </Badge>
                        {viewExercise.bodyPart && (
                          <Badge
                            variant="outline"
                            className="text-primary border-primary/40"
                          >
                            <Target className="w-3 h-3 mr-1" />
                            {viewExercise.bodyPart}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {viewExercise.description}
                      </p>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">
                          Equipment:{" "}
                          <span className="text-foreground">
                            {viewExercise.equipment}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Muscles:{" "}
                          <span className="text-foreground">
                            {viewExercise.muscleGroups.join(", ")}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-display font-semibold mb-2">
                          Instructions
                        </h4>
                        <ol className="space-y-2">
                          {viewExercise.instructions.map((step, i) => (
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
          data-ocid="exercise.list.empty_state"
        >
          <div className="text-4xl mb-3">🏋️</div>
          <p>No exercises match your filters.</p>
        </div>
      )}
    </div>
  );
}
