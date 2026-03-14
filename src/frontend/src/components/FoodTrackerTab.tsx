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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type FoodItem, foodCuisines, foodDatabase } from "@/data/foods";
import { Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

interface LogEntry {
  id: string;
  foodId: string | null;
  name: string;
  serving: string;
  servings: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  sodium: number;
  fiber: number;
  sugar: number;
  meal: string;
  date: string;
}

interface ManualFood {
  name: string;
  serving: string;
  calories: string;
  protein: string;
  fat: string;
  carbs: string;
  sodium: string;
  fiber: string;
  sugar: string;
}

const emptyManual: ManualFood = {
  name: "",
  serving: "",
  calories: "",
  protein: "",
  fat: "",
  carbs: "",
  sodium: "",
  fiber: "",
  sugar: "",
};

const DAILY_GOALS = {
  calories: 2000,
  protein: 50,
  fat: 65,
  carbs: 300,
  sodium: 2300,
  fiber: 28,
  sugar: 50,
};

export function FoodTrackerTab() {
  const todayStr = new Date().toISOString().split("T")[0];
  const [log, setLog] = useState<LogEntry[]>(() => {
    try {
      const saved = localStorage.getItem("food_log");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [search, setSearch] = useState("");
  const [cuisineFilter, setCuisineFilter] = useState("All");
  const [mealFilter, setMealFilter] = useState("Breakfast");
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [servings, setServings] = useState("1");
  const [manual, setManual] = useState<ManualFood>(emptyManual);
  const [manualOpen, setManualOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const saveLog = (newLog: LogEntry[]) => {
    setLog(newLog);
    localStorage.setItem("food_log", JSON.stringify(newLog));
  };

  const todayLog = useMemo(
    () => log.filter((e) => e.date === selectedDate),
    [log, selectedDate],
  );

  const totals = useMemo(
    () =>
      todayLog.reduce(
        (acc, e) => ({
          calories: acc.calories + e.calories,
          protein: acc.protein + e.protein,
          fat: acc.fat + e.fat,
          carbs: acc.carbs + e.carbs,
          sodium: acc.sodium + e.sodium,
          fiber: acc.fiber + e.fiber,
          sugar: acc.sugar + e.sugar,
        }),
        {
          calories: 0,
          protein: 0,
          fat: 0,
          carbs: 0,
          sodium: 0,
          fiber: 0,
          sugar: 0,
        },
      ),
    [todayLog],
  );

  const filteredFoods = useMemo(() => {
    return foodDatabase.filter((f) => {
      const matchSearch = f.name.toLowerCase().includes(search.toLowerCase());
      const matchCuisine =
        cuisineFilter === "All" || f.cuisine === cuisineFilter;
      return matchSearch && matchCuisine;
    });
  }, [search, cuisineFilter]);

  const addFood = () => {
    if (!selectedFood) return;
    const s = Number.parseFloat(servings) || 1;
    const entry: LogEntry = {
      id: Date.now().toString(),
      foodId: selectedFood.id,
      name: selectedFood.name,
      serving: selectedFood.serving,
      servings: s,
      calories: Math.round(selectedFood.calories * s),
      protein: Math.round(selectedFood.protein * s * 10) / 10,
      fat: Math.round(selectedFood.fat * s * 10) / 10,
      carbs: Math.round(selectedFood.carbs * s * 10) / 10,
      sodium: Math.round(selectedFood.sodium * s),
      fiber: Math.round(selectedFood.fiber * s * 10) / 10,
      sugar: Math.round(selectedFood.sugar * s * 10) / 10,
      meal: mealFilter,
      date: selectedDate,
    };
    saveLog([...log, entry]);
    setSelectedFood(null);
    setServings("1");
    setAddOpen(false);
  };

  const addManualFood = () => {
    if (!manual.name || !manual.calories) return;
    const entry: LogEntry = {
      id: Date.now().toString(),
      foodId: null,
      name: manual.name,
      serving: manual.serving || "1 serving",
      servings: 1,
      calories: Number.parseFloat(manual.calories) || 0,
      protein: Number.parseFloat(manual.protein) || 0,
      fat: Number.parseFloat(manual.fat) || 0,
      carbs: Number.parseFloat(manual.carbs) || 0,
      sodium: Number.parseFloat(manual.sodium) || 0,
      fiber: Number.parseFloat(manual.fiber) || 0,
      sugar: Number.parseFloat(manual.sugar) || 0,
      meal: mealFilter,
      date: selectedDate,
    };
    saveLog([...log, entry]);
    setManual(emptyManual);
    setManualOpen(false);
  };

  const removeEntry = (id: string) => saveLog(log.filter((e) => e.id !== id));

  const MacroBar = ({
    label,
    value,
    goal,
    color,
  }: { label: string; value: number; goal: number; color: string }) => (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-foreground font-medium">
          {value.toFixed(0)} / {goal}g
        </span>
      </div>
      <Progress
        value={Math.min((value / goal) * 100, 100)}
        className={`h-2 ${color}`}
      />
    </div>
  );

  const meals = ["Breakfast", "Lunch", "Dinner", "Snacks"];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 items-center">
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-40"
          data-ocid="tracker.date.input"
        />
        <div className="flex gap-1">
          {meals.map((m) => (
            <Button
              key={m}
              size="sm"
              variant={mealFilter === m ? "default" : "outline"}
              className="text-xs"
              onClick={() => setMealFilter(m)}
              data-ocid={`tracker.${m.toLowerCase()}.tab`}
            >
              {m}
            </Button>
          ))}
        </div>
      </div>

      {/* Daily Totals */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-display">
            Daily Nutrition — {selectedDate}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              {
                label: "Calories",
                value: totals.calories,
                goal: DAILY_GOALS.calories,
                unit: "kcal",
              },
              {
                label: "Protein",
                value: totals.protein,
                goal: DAILY_GOALS.protein,
                unit: "g",
              },
              {
                label: "Carbs",
                value: totals.carbs,
                goal: DAILY_GOALS.carbs,
                unit: "g",
              },
              {
                label: "Fat",
                value: totals.fat,
                goal: DAILY_GOALS.fat,
                unit: "g",
              },
            ].map((m) => (
              <div
                key={m.label}
                className="bg-muted/40 rounded-lg p-3 text-center"
              >
                <div className="text-xs text-muted-foreground">{m.label}</div>
                <div className="font-bold text-foreground text-lg">
                  {Math.round(m.value)}
                </div>
                <div className="text-xs text-muted-foreground">
                  / {m.goal} {m.unit}
                </div>
                <Progress
                  value={Math.min((m.value / m.goal) * 100, 100)}
                  className="h-1.5 mt-1"
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <MacroBar
              label="Fiber"
              value={totals.fiber}
              goal={DAILY_GOALS.fiber}
              color=""
            />
            <MacroBar
              label="Sugar"
              value={totals.sugar}
              goal={DAILY_GOALS.sugar}
              color=""
            />
            <MacroBar
              label="Sodium (mg)"
              value={totals.sodium}
              goal={DAILY_GOALS.sodium}
              color=""
            />
          </div>
        </CardContent>
      </Card>

      {/* Add Food Section */}
      <div className="flex gap-2">
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button
              className="flex gap-2"
              data-ocid="tracker.add_food.open_modal_button"
            >
              <Plus className="w-4 h-4" /> Add from Database
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Food</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search foods..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                    data-ocid="tracker.food_search.search_input"
                  />
                </div>
                <Select value={cuisineFilter} onValueChange={setCuisineFilter}>
                  <SelectTrigger
                    className="w-40"
                    data-ocid="tracker.cuisine_filter.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Cuisines</SelectItem>
                    {foodCuisines.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedFood ? (
                <div className="bg-muted/40 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{selectedFood.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {selectedFood.serving}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedFood(null)}
                    >
                      ✕
                    </Button>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs text-center">
                    {[
                      { l: "Cal", v: selectedFood.calories },
                      { l: "Protein", v: `${selectedFood.protein}g` },
                      { l: "Carbs", v: `${selectedFood.carbs}g` },
                      { l: "Fat", v: `${selectedFood.fat}g` },
                    ].map((i) => (
                      <div key={i.l} className="bg-background rounded p-2">
                        <div className="text-muted-foreground">{i.l}</div>
                        <div className="font-medium">{i.v}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="w-20 text-sm">Servings</Label>
                    <Input
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={servings}
                      onChange={(e) => setServings(e.target.value)}
                      className="w-24"
                      data-ocid="tracker.servings.input"
                    />
                    <Button
                      onClick={addFood}
                      data-ocid="tracker.confirm_add.confirm_button"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1 max-h-80 overflow-y-auto">
                  {filteredFoods.slice(0, 50).map((food) => (
                    <button
                      type="button"
                      key={food.id}
                      className="w-full text-left flex justify-between items-center px-3 py-2 rounded hover:bg-muted/60 transition-colors"
                      onClick={() => setSelectedFood(food)}
                    >
                      <div>
                        <div className="text-sm font-medium">{food.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {food.serving} • {food.cuisine}
                        </div>
                      </div>
                      <div className="text-xs text-primary font-medium">
                        {food.calories} kcal
                      </div>
                    </button>
                  ))}
                  {filteredFoods.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-4">
                      No foods found
                    </p>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={manualOpen} onOpenChange={setManualOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="flex gap-2"
              data-ocid="tracker.add_manual.open_modal_button"
            >
              <Plus className="w-4 h-4" /> Add Manually
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Custom Food</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label>Food Name *</Label>
                  <Input
                    placeholder="e.g. Homemade Dal"
                    value={manual.name}
                    onChange={(e) =>
                      setManual((p) => ({ ...p, name: e.target.value }))
                    }
                    data-ocid="tracker.manual_name.input"
                  />
                </div>
                <div>
                  <Label>Serving Size</Label>
                  <Input
                    placeholder="e.g. 1 bowl (200g)"
                    value={manual.serving}
                    onChange={(e) =>
                      setManual((p) => ({ ...p, serving: e.target.value }))
                    }
                    data-ocid="tracker.manual_serving.input"
                  />
                </div>
                <div>
                  <Label>Calories (kcal) *</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={manual.calories}
                    onChange={(e) =>
                      setManual((p) => ({ ...p, calories: e.target.value }))
                    }
                    data-ocid="tracker.manual_calories.input"
                  />
                </div>
                <div>
                  <Label>Protein (g)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={manual.protein}
                    onChange={(e) =>
                      setManual((p) => ({ ...p, protein: e.target.value }))
                    }
                    data-ocid="tracker.manual_protein.input"
                  />
                </div>
                <div>
                  <Label>Fat (g)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={manual.fat}
                    onChange={(e) =>
                      setManual((p) => ({ ...p, fat: e.target.value }))
                    }
                    data-ocid="tracker.manual_fat.input"
                  />
                </div>
                <div>
                  <Label>Carbs (g)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={manual.carbs}
                    onChange={(e) =>
                      setManual((p) => ({ ...p, carbs: e.target.value }))
                    }
                    data-ocid="tracker.manual_carbs.input"
                  />
                </div>
                <div>
                  <Label>Sodium (mg)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={manual.sodium}
                    onChange={(e) =>
                      setManual((p) => ({ ...p, sodium: e.target.value }))
                    }
                    data-ocid="tracker.manual_sodium.input"
                  />
                </div>
                <div>
                  <Label>Fiber (g)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={manual.fiber}
                    onChange={(e) =>
                      setManual((p) => ({ ...p, fiber: e.target.value }))
                    }
                    data-ocid="tracker.manual_fiber.input"
                  />
                </div>
                <div>
                  <Label>Sugar (g)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={manual.sugar}
                    onChange={(e) =>
                      setManual((p) => ({ ...p, sugar: e.target.value }))
                    }
                    data-ocid="tracker.manual_sugar.input"
                  />
                </div>
              </div>
              <Button
                onClick={addManualFood}
                disabled={!manual.name || !manual.calories}
                className="w-full"
                data-ocid="tracker.manual_add.submit_button"
              >
                Add Food
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Log */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-display">
            Food Log — {mealFilter}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayLog.filter((e) => e.meal === mealFilter).length === 0 ? (
            <div
              className="text-center py-6 text-muted-foreground"
              data-ocid="tracker.log.empty_state"
            >
              <div className="text-3xl mb-2">🍽️</div>
              <p className="text-sm">No foods logged for {mealFilter} yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayLog
                .filter((e) => e.meal === mealFilter)
                .map((entry, idx) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    data-ocid={`tracker.log.item.${idx + 1}`}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{entry.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {entry.servings}× {entry.serving}
                      </div>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        {[
                          { l: "Cal", v: entry.calories },
                          { l: "P", v: `${entry.protein}g` },
                          { l: "C", v: `${entry.carbs}g` },
                          { l: "F", v: `${entry.fat}g` },
                          { l: "Na", v: `${entry.sodium}mg` },
                        ].map((m) => (
                          <Badge
                            key={m.l}
                            variant="outline"
                            className="text-xs h-4"
                          >
                            {m.l}: {m.v}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeEntry(entry.id)}
                      data-ocid={`tracker.log.delete_button.${idx + 1}`}
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
