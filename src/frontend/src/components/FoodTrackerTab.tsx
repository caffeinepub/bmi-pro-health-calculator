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
import { Camera, Plus, Search, Trash2, Zap } from "lucide-react";
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

interface BarcodeFood {
  name: string;
  brand: string;
  serving: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  sodium: number;
  fiber: number;
  sugar: number;
}

const BARCODE_DB: Record<string, BarcodeFood> = {
  "8901058000011": {
    name: "Maggi 2-Minute Noodles",
    brand: "Nestle",
    serving: "1 pack (70g)",
    calories: 312,
    protein: 7.6,
    fat: 13.2,
    carbs: 41.2,
    sodium: 950,
    fiber: 2.1,
    sugar: 1.4,
  },
  "8901058000012": {
    name: "Amul Butter",
    brand: "Amul",
    serving: "1 tbsp (10g)",
    calories: 74,
    protein: 0.1,
    fat: 8.2,
    carbs: 0.1,
    sodium: 65,
    fiber: 0,
    sugar: 0.1,
  },
  "8901058000013": {
    name: "Britannia Good Day Biscuits",
    brand: "Britannia",
    serving: "4 biscuits (40g)",
    calories: 182,
    protein: 2.8,
    fat: 7.8,
    carbs: 25.4,
    sodium: 175,
    fiber: 0.5,
    sugar: 8.2,
  },
  "8901058000014": {
    name: "Parle-G Glucose Biscuits",
    brand: "Parle",
    serving: "4 biscuits (40g)",
    calories: 167,
    protein: 2.7,
    fat: 5.5,
    carbs: 27.2,
    sodium: 150,
    fiber: 0.4,
    sugar: 9.8,
  },
  "8901058000015": {
    name: "Kurkure Masala Munch",
    brand: "PepsiCo",
    serving: "1 pack (30g)",
    calories: 153,
    protein: 1.8,
    fat: 9.0,
    carbs: 16.5,
    sodium: 310,
    fiber: 0.3,
    sugar: 1.1,
  },
  "8901058000016": {
    name: "Lay's Classic Salted Chips",
    brand: "PepsiCo",
    serving: "1 pack (26g)",
    calories: 133,
    protein: 1.8,
    fat: 7.3,
    carbs: 15.6,
    sodium: 149,
    fiber: 0.9,
    sugar: 0.1,
  },
  "8901058000017": {
    name: "Bournvita Chocolate Drink",
    brand: "Cadbury",
    serving: "2 tbsp in 200ml milk (20g)",
    calories: 76,
    protein: 1.2,
    fat: 0.7,
    carbs: 16.5,
    sodium: 40,
    fiber: 0.5,
    sugar: 13.2,
  },
  "8901058000018": {
    name: "Horlicks Classic Malt",
    brand: "Horlicks",
    serving: "3 tbsp in 200ml milk (27g)",
    calories: 99,
    protein: 3.0,
    fat: 0.9,
    carbs: 20.1,
    sodium: 55,
    fiber: 0.2,
    sugar: 10.5,
  },
  "8901058000019": {
    name: "Nescafe Classic Instant Coffee",
    brand: "Nestle",
    serving: "1 tsp (2g) in 150ml water",
    calories: 4,
    protein: 0.5,
    fat: 0.1,
    carbs: 0.5,
    sodium: 5,
    fiber: 0,
    sugar: 0,
  },
  "8901058000020": {
    name: "Tropicana Orange Juice",
    brand: "PepsiCo",
    serving: "1 glass (200ml)",
    calories: 86,
    protein: 1.2,
    fat: 0.2,
    carbs: 20.2,
    sodium: 10,
    fiber: 0.4,
    sugar: 17.8,
  },
  "8901058000021": {
    name: "Amul Full Cream Milk",
    brand: "Amul",
    serving: "1 glass (200ml)",
    calories: 128,
    protein: 6.4,
    fat: 7.4,
    carbs: 9.2,
    sodium: 100,
    fiber: 0,
    sugar: 9.2,
  },
  "8901058000022": {
    name: "KitKat Chocolate Bar",
    brand: "Nestle",
    serving: "1 bar (41.5g)",
    calories: 216,
    protein: 2.8,
    fat: 11.1,
    carbs: 27.2,
    sodium: 42,
    fiber: 0.6,
    sugar: 22.0,
  },
  "8901058000023": {
    name: "Cadbury Dairy Milk",
    brand: "Cadbury",
    serving: "1 bar (40g)",
    calories: 209,
    protein: 3.2,
    fat: 11.6,
    carbs: 24.2,
    sodium: 58,
    fiber: 0.5,
    sugar: 23.1,
  },
  "8901058000024": {
    name: "Red Bull Energy Drink",
    brand: "Red Bull",
    serving: "1 can (250ml)",
    calories: 113,
    protein: 1.0,
    fat: 0,
    carbs: 27.5,
    sodium: 200,
    fiber: 0,
    sugar: 27.5,
  },
  "8901058000025": {
    name: "Coca-Cola",
    brand: "Coca-Cola",
    serving: "1 can (330ml)",
    calories: 139,
    protein: 0,
    fat: 0,
    carbs: 35.0,
    sodium: 45,
    fiber: 0,
    sugar: 35.0,
  },
  "8901058000026": {
    name: "Sunfeast Dark Fantasy Choco Fills",
    brand: "ITC",
    serving: "2 pieces (40g)",
    calories: 195,
    protein: 2.8,
    fat: 9.5,
    carbs: 25.8,
    sodium: 95,
    fiber: 0.7,
    sugar: 12.4,
  },
};

interface NutritionEstimate {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  sodium: number;
  fiber: number;
  sugar: number;
  category: string;
}

const SERVING_MULTIPLIERS: Record<string, number> = {
  small: 0.7,
  medium: 1.0,
  large: 1.4,
};

function estimateNutrition(query: string): NutritionEstimate {
  const q = query.toLowerCase();
  if (
    /\b(rice|dal|roti|chapati|paratha|biryani|curry|sabzi|pulao|khichdi|idli|dosa|upma|poha|pav|bhaji|sambar|rasam)\b/.test(
      q,
    )
  ) {
    return {
      calories: 210,
      protein: 6,
      fat: 5,
      carbs: 35,
      sodium: 320,
      fiber: 3,
      sugar: 2,
      category: "Indian Staple",
    };
  }
  if (
    /\b(chicken|fish|egg|paneer|tofu|mutton|prawn|tuna|salmon|turkey|beef|pork|legume|lentil)\b/.test(
      q,
    )
  ) {
    return {
      calories: 185,
      protein: 22,
      fat: 8,
      carbs: 4,
      sodium: 280,
      fiber: 0.5,
      sugar: 0.5,
      category: "Protein-Rich",
    };
  }
  if (
    /\b(cake|sweet|mithai|ladoo|halwa|barfi|gulab|jamun|kheer|ice cream|chocolate|brownie|pastry|pudding|jalebi|rasgulla)\b/.test(
      q,
    )
  ) {
    return {
      calories: 280,
      protein: 4,
      fat: 10,
      carbs: 44,
      sodium: 120,
      fiber: 0.5,
      sugar: 32,
      category: "Sweet / Dessert",
    };
  }
  if (
    /\b(salad|vegetable|veg|greens|spinach|broccoli|cucumber|lettuce|kale|cabbage|carrot|celery|sprout)\b/.test(
      q,
    )
  ) {
    return {
      calories: 65,
      protein: 3,
      fat: 1.5,
      carbs: 10,
      sodium: 85,
      fiber: 4,
      sugar: 5,
      category: "Vegetable / Salad",
    };
  }
  if (
    /\b(snack|chips|fry|fried|pakora|samosa|bhatura|puri|namkeen|farsan|mixture|chiwda|popcorn|wafer)\b/.test(
      q,
    )
  ) {
    return {
      calories: 240,
      protein: 4,
      fat: 13,
      carbs: 28,
      sodium: 380,
      fiber: 1.5,
      sugar: 1,
      category: "Snack / Fried",
    };
  }
  if (
    /\b(juice|drink|shake|smoothie|lassi|chaas|tea|coffee|milk|water|soda|cola|lemonade|nimbu)\b/.test(
      q,
    )
  ) {
    return {
      calories: 95,
      protein: 1.5,
      fat: 1,
      carbs: 20,
      sodium: 55,
      fiber: 0.2,
      sugar: 18,
      category: "Beverage",
    };
  }
  return {
    calories: 200,
    protein: 7,
    fat: 7,
    carbs: 27,
    sodium: 250,
    fiber: 2,
    sugar: 5,
    category: "General Food",
  };
}

// Reusable smart estimator panel
function SmartEstimatorPanel({
  foodName,
  servingSize,
  onServingSizeChange,
  onAdd,
  ocidPrefix,
}: {
  foodName: string;
  servingSize: "small" | "medium" | "large";
  onServingSizeChange: (s: "small" | "medium" | "large") => void;
  onAdd: () => void;
  ocidPrefix: string;
}) {
  const est = estimateNutrition(foodName);
  const mult = SERVING_MULTIPLIERS[servingSize];
  return (
    <div className="border border-primary/30 rounded-lg p-4 bg-primary/5 space-y-3">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-primary">
          Smart Nutrition Estimate
        </span>
      </div>
      <div className="text-xs text-muted-foreground">
        Estimate for:{" "}
        <span className="font-medium text-foreground">"{foodName}"</span>
        <span className="ml-2 text-amber-500 font-medium">
          ({est.category})
        </span>
      </div>
      <div className="grid grid-cols-4 gap-1.5 text-xs text-center">
        {[
          { l: "Cal", v: `${Math.round(est.calories * mult)}` },
          { l: "Protein", v: `${Math.round(est.protein * mult)}g` },
          { l: "Carbs", v: `${Math.round(est.carbs * mult)}g` },
          { l: "Fat", v: `${Math.round(est.fat * mult)}g` },
        ].map((i) => (
          <div
            key={i.l}
            className="bg-background rounded p-1.5 border border-border"
          >
            <div className="text-muted-foreground">{i.l}</div>
            <div className="font-semibold text-foreground">{i.v}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1.5 text-xs text-center">
        {[
          { l: "Sodium", v: `${Math.round(est.sodium * mult)}mg` },
          { l: "Fiber", v: `${Math.round(est.fiber * mult * 10) / 10}g` },
          { l: "Sugar", v: `${Math.round(est.sugar * mult)}g` },
        ].map((i) => (
          <div
            key={i.l}
            className="bg-background rounded p-1.5 border border-border"
          >
            <div className="text-muted-foreground">{i.l}</div>
            <div className="font-semibold">{i.v}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Label className="text-xs">Portion size:</Label>
        <div className="flex gap-1">
          {(["small", "medium", "large"] as const).map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => onServingSizeChange(s)}
              className={`px-2 py-0.5 rounded text-xs border transition-colors ${
                servingSize === s
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border hover:bg-muted"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <p className="text-[10px] text-amber-600 dark:text-amber-400 italic">
        ⚠️ These are approximate values. Actual nutrition may vary.
      </p>
      <Button
        size="sm"
        className="w-full"
        onClick={onAdd}
        data-ocid={`${ocidPrefix}.button`}
      >
        <Zap className="w-3 h-3 mr-1" /> Add Estimated Food
      </Button>
    </div>
  );
}

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

  // Barcode scanner state
  const [barcodeOpen, setBarcodeOpen] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [barcodeResult, setBarcodeResult] = useState<BarcodeFood | null>(null);
  const [barcodeNotFound, setBarcodeNotFound] = useState(false);
  const [unknownBarcodeMode, setUnknownBarcodeMode] = useState(false);
  const [unknownBarcodeName, setUnknownBarcodeName] = useState("");

  // Smart estimate state (shared across add-from-db and barcode unknown)
  const [estimateServingSize, setEstimateServingSize] = useState<
    "small" | "medium" | "large"
  >("medium");
  const [barcodeEstimateServingSize, setBarcodeEstimateServingSize] = useState<
    "small" | "medium" | "large"
  >("medium");

  // Smart Search dialog state
  const [smartSearchOpen, setSmartSearchOpen] = useState(false);
  const [smartSearchQuery, setSmartSearchQuery] = useState("");
  const [smartSearchCuisine, setSmartSearchCuisine] = useState("All");
  const [smartSearchSelected, setSmartSearchSelected] =
    useState<FoodItem | null>(null);
  const [smartSearchServings, setSmartSearchServings] = useState("1");
  const [smartSearchEstimateSize, setSmartSearchEstimateSize] = useState<
    "small" | "medium" | "large"
  >("medium");

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

  const smartSearchFoods = useMemo(() => {
    return foodDatabase.filter((f) => {
      const matchSearch = f.name
        .toLowerCase()
        .includes(smartSearchQuery.toLowerCase());
      const matchCuisine =
        smartSearchCuisine === "All" || f.cuisine === smartSearchCuisine;
      return matchSearch && matchCuisine;
    });
  }, [smartSearchQuery, smartSearchCuisine]);

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

  // Barcode lookup
  const lookupBarcode = () => {
    const code = barcodeInput.trim();
    if (!code) return;
    const found = BARCODE_DB[code];
    if (found) {
      setBarcodeResult(found);
      setBarcodeNotFound(false);
      setUnknownBarcodeMode(false);
      setUnknownBarcodeName("");
    } else {
      setBarcodeResult(null);
      setBarcodeNotFound(false);
      setUnknownBarcodeMode(true);
      setUnknownBarcodeName("");
    }
  };

  const addBarcodeFood = () => {
    if (!barcodeResult) return;
    const entry: LogEntry = {
      id: Date.now().toString(),
      foodId: null,
      name: `${barcodeResult.name} (${barcodeResult.brand})`,
      serving: barcodeResult.serving,
      servings: 1,
      calories: barcodeResult.calories,
      protein: barcodeResult.protein,
      fat: barcodeResult.fat,
      carbs: barcodeResult.carbs,
      sodium: barcodeResult.sodium,
      fiber: barcodeResult.fiber,
      sugar: barcodeResult.sugar,
      meal: mealFilter,
      date: selectedDate,
    };
    saveLog([...log, entry]);
    setBarcodeOpen(false);
    setBarcodeInput("");
    setBarcodeResult(null);
    setBarcodeNotFound(false);
    setUnknownBarcodeMode(false);
    setUnknownBarcodeName("");
  };

  const addBarcodeEstimatedFood = () => {
    if (!unknownBarcodeName.trim()) return;
    const est = estimateNutrition(unknownBarcodeName);
    const mult = SERVING_MULTIPLIERS[barcodeEstimateServingSize];
    const entry: LogEntry = {
      id: Date.now().toString(),
      foodId: null,
      name: `${unknownBarcodeName} (approx.)`,
      serving: `1 ${barcodeEstimateServingSize} serving`,
      servings: 1,
      calories: Math.round(est.calories * mult),
      protein: Math.round(est.protein * mult * 10) / 10,
      fat: Math.round(est.fat * mult * 10) / 10,
      carbs: Math.round(est.carbs * mult * 10) / 10,
      sodium: Math.round(est.sodium * mult),
      fiber: Math.round(est.fiber * mult * 10) / 10,
      sugar: Math.round(est.sugar * mult * 10) / 10,
      meal: mealFilter,
      date: selectedDate,
    };
    saveLog([...log, entry]);
    setBarcodeOpen(false);
    setBarcodeInput("");
    setUnknownBarcodeMode(false);
    setUnknownBarcodeName("");
  };

  // Add estimated food from Add-from-DB dialog
  const addEstimatedFood = () => {
    if (!search.trim()) return;
    const est = estimateNutrition(search);
    const mult = SERVING_MULTIPLIERS[estimateServingSize];
    const entry: LogEntry = {
      id: Date.now().toString(),
      foodId: null,
      name: `${search} (approx.)`,
      serving: `1 ${estimateServingSize} serving`,
      servings: 1,
      calories: Math.round(est.calories * mult),
      protein: Math.round(est.protein * mult * 10) / 10,
      fat: Math.round(est.fat * mult * 10) / 10,
      carbs: Math.round(est.carbs * mult * 10) / 10,
      sodium: Math.round(est.sodium * mult),
      fiber: Math.round(est.fiber * mult * 10) / 10,
      sugar: Math.round(est.sugar * mult * 10) / 10,
      meal: mealFilter,
      date: selectedDate,
    };
    saveLog([...log, entry]);
    setSearch("");
    setAddOpen(false);
  };

  // Smart Search: add from DB
  const addSmartSearchFood = () => {
    if (!smartSearchSelected) return;
    const s = Number.parseFloat(smartSearchServings) || 1;
    const entry: LogEntry = {
      id: Date.now().toString(),
      foodId: smartSearchSelected.id,
      name: smartSearchSelected.name,
      serving: smartSearchSelected.serving,
      servings: s,
      calories: Math.round(smartSearchSelected.calories * s),
      protein: Math.round(smartSearchSelected.protein * s * 10) / 10,
      fat: Math.round(smartSearchSelected.fat * s * 10) / 10,
      carbs: Math.round(smartSearchSelected.carbs * s * 10) / 10,
      sodium: Math.round(smartSearchSelected.sodium * s),
      fiber: Math.round(smartSearchSelected.fiber * s * 10) / 10,
      sugar: Math.round(smartSearchSelected.sugar * s * 10) / 10,
      meal: mealFilter,
      date: selectedDate,
    };
    saveLog([...log, entry]);
    setSmartSearchSelected(null);
    setSmartSearchServings("1");
    setSmartSearchOpen(false);
  };

  // Smart Search: add estimated
  const addSmartSearchEstimated = () => {
    if (!smartSearchQuery.trim()) return;
    const est = estimateNutrition(smartSearchQuery);
    const mult = SERVING_MULTIPLIERS[smartSearchEstimateSize];
    const entry: LogEntry = {
      id: Date.now().toString(),
      foodId: null,
      name: `${smartSearchQuery} (approx.)`,
      serving: `1 ${smartSearchEstimateSize} serving`,
      servings: 1,
      calories: Math.round(est.calories * mult),
      protein: Math.round(est.protein * mult * 10) / 10,
      fat: Math.round(est.fat * mult * 10) / 10,
      carbs: Math.round(est.carbs * mult * 10) / 10,
      sodium: Math.round(est.sodium * mult),
      fiber: Math.round(est.fiber * mult * 10) / 10,
      sugar: Math.round(est.sugar * mult * 10) / 10,
      meal: mealFilter,
      date: selectedDate,
    };
    saveLog([...log, entry]);
    setSmartSearchQuery("");
    setSmartSearchOpen(false);
  };

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
      <div className="flex flex-wrap gap-2">
        {/* Add from Database */}
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
                    <div className="space-y-4">
                      <p className="text-center text-muted-foreground text-sm py-2">
                        No foods found in database
                      </p>
                      {search.trim() && (
                        <SmartEstimatorPanel
                          foodName={search}
                          servingSize={estimateServingSize}
                          onServingSizeChange={setEstimateServingSize}
                          onAdd={addEstimatedFood}
                          ocidPrefix="tracker.smart_estimate"
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Barcode Scanner */}
        <Dialog
          open={barcodeOpen}
          onOpenChange={(open) => {
            setBarcodeOpen(open);
            if (!open) {
              setBarcodeInput("");
              setBarcodeResult(null);
              setBarcodeNotFound(false);
              setUnknownBarcodeMode(false);
              setUnknownBarcodeName("");
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="flex gap-2"
              data-ocid="tracker.barcode.open_modal_button"
            >
              <Camera className="w-4 h-4" /> Scan Barcode
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Camera className="w-4 h-4" /> Barcode Scanner
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter the barcode number from the packaged food. The barcode is
                usually printed below the stripes on the packaging.
              </p>

              <div className="flex gap-2">
                <Input
                  placeholder="e.g. 8901058000011"
                  value={barcodeInput}
                  onChange={(e) => {
                    setBarcodeInput(e.target.value);
                    setBarcodeResult(null);
                    setBarcodeNotFound(false);
                    setUnknownBarcodeMode(false);
                    setUnknownBarcodeName("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && lookupBarcode()}
                  data-ocid="tracker.barcode.input"
                />
                <Button
                  onClick={lookupBarcode}
                  data-ocid="tracker.barcode.submit_button"
                >
                  Look Up
                </Button>
              </div>

              {/* Sample barcodes hint */}
              <div className="text-xs text-muted-foreground bg-muted/40 rounded p-2 space-y-1">
                <div className="font-medium">Try these sample barcodes:</div>
                <div className="grid grid-cols-1 gap-0.5">
                  {Object.entries(BARCODE_DB)
                    .slice(0, 6)
                    .map(([code, food]) => (
                      <button
                        type="button"
                        key={code}
                        className="text-left hover:text-primary transition-colors"
                        onClick={() => {
                          setBarcodeInput(code);
                          setBarcodeResult(BARCODE_DB[code]);
                          setBarcodeNotFound(false);
                          setUnknownBarcodeMode(false);
                          setUnknownBarcodeName("");
                        }}
                      >
                        <span className="font-mono">{code}</span> — {food.name}
                      </button>
                    ))}
                </div>
              </div>

              {/* Barcode found result */}
              {barcodeResult && (
                <div className="border border-green-500/30 rounded-lg p-4 bg-green-500/5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-sm">
                        {barcodeResult.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {barcodeResult.brand}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Serving: {barcodeResult.serving}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-500 text-xs"
                    >
                      Found ✓
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 text-xs text-center">
                    {[
                      { l: "Calories", v: `${barcodeResult.calories}` },
                      { l: "Protein", v: `${barcodeResult.protein}g` },
                      { l: "Carbs", v: `${barcodeResult.carbs}g` },
                      { l: "Fat", v: `${barcodeResult.fat}g` },
                    ].map((i) => (
                      <div
                        key={i.l}
                        className="bg-background rounded p-1.5 border border-border"
                      >
                        <div className="text-muted-foreground">{i.l}</div>
                        <div className="font-semibold">{i.v}</div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-xs text-center">
                    {[
                      { l: "Sodium", v: `${barcodeResult.sodium}mg` },
                      { l: "Fiber", v: `${barcodeResult.fiber}g` },
                      { l: "Sugar", v: `${barcodeResult.sugar}g` },
                    ].map((i) => (
                      <div
                        key={i.l}
                        className="bg-background rounded p-1.5 border border-border"
                      >
                        <div className="text-muted-foreground">{i.l}</div>
                        <div className="font-semibold">{i.v}</div>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full"
                    onClick={addBarcodeFood}
                    data-ocid="tracker.barcode.confirm_button"
                  >
                    Add to {mealFilter}
                  </Button>
                </div>
              )}

              {/* Unknown barcode — ask for food name then smart estimate */}
              {unknownBarcodeMode && (
                <div className="space-y-3">
                  <div className="border border-amber-500/30 rounded-lg p-3 bg-amber-500/5">
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                      Barcode not recognized
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Please enter the food name below to get estimated
                      nutrition.
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Food name</Label>
                    <Input
                      placeholder="e.g. Aashirvaad Atta"
                      value={unknownBarcodeName}
                      onChange={(e) => setUnknownBarcodeName(e.target.value)}
                      data-ocid="tracker.barcode_unknown.input"
                    />
                  </div>
                  {unknownBarcodeName.trim().length > 0 && (
                    <SmartEstimatorPanel
                      foodName={unknownBarcodeName}
                      servingSize={barcodeEstimateServingSize}
                      onServingSizeChange={setBarcodeEstimateServingSize}
                      onAdd={addBarcodeEstimatedFood}
                      ocidPrefix="tracker.barcode_unknown_estimate"
                    />
                  )}
                </div>
              )}

              {/* Legacy not-found fallback (no longer triggered but kept for safety) */}
              {barcodeNotFound && (
                <div
                  className="border border-destructive/30 rounded-lg p-4 bg-destructive/5 space-y-2"
                  data-ocid="tracker.barcode.error_state"
                >
                  <p className="text-sm font-medium text-destructive">
                    Barcode not found
                  </p>
                  <p className="text-xs text-muted-foreground">
                    This barcode is not in our database yet.
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Smart Search */}
        <Dialog
          open={smartSearchOpen}
          onOpenChange={(open) => {
            setSmartSearchOpen(open);
            if (!open) {
              setSmartSearchQuery("");
              setSmartSearchSelected(null);
              setSmartSearchServings("1");
              setSmartSearchEstimateSize("medium");
              setSmartSearchCuisine("All");
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="flex gap-2"
              data-ocid="tracker.smart_search.open_modal_button"
            >
              <Zap className="w-4 h-4" /> Smart Search
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" /> Smart Food Search
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Search our full food database by name, or get an instant smart
                estimate for any food — even if it's not in the database.
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Type any food name..."
                    value={smartSearchQuery}
                    onChange={(e) => {
                      setSmartSearchQuery(e.target.value);
                      setSmartSearchSelected(null);
                    }}
                    className="pl-9"
                    data-ocid="tracker.smart_search.search_input"
                    autoFocus
                  />
                </div>
                <Select
                  value={smartSearchCuisine}
                  onValueChange={setSmartSearchCuisine}
                >
                  <SelectTrigger
                    className="w-36"
                    data-ocid="tracker.smart_search_cuisine.select"
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

              {/* Selected food from DB */}
              {smartSearchSelected ? (
                <div className="bg-muted/40 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">
                        {smartSearchSelected.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {smartSearchSelected.serving}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSmartSearchSelected(null)}
                    >
                      ✕
                    </Button>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs text-center">
                    {[
                      { l: "Cal", v: smartSearchSelected.calories },
                      { l: "Protein", v: `${smartSearchSelected.protein}g` },
                      { l: "Carbs", v: `${smartSearchSelected.carbs}g` },
                      { l: "Fat", v: `${smartSearchSelected.fat}g` },
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
                      value={smartSearchServings}
                      onChange={(e) => setSmartSearchServings(e.target.value)}
                      className="w-24"
                      data-ocid="tracker.smart_search_servings.input"
                    />
                    <Button
                      onClick={addSmartSearchFood}
                      data-ocid="tracker.smart_search_add.confirm_button"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* DB results list */}
                  {smartSearchFoods.length > 0 && (
                    <div className="space-y-1 max-h-52 overflow-y-auto border border-border rounded-lg">
                      <div className="px-3 py-1.5 text-xs text-muted-foreground bg-muted/40 font-medium">
                        {smartSearchFoods.length} food
                        {smartSearchFoods.length !== 1 ? "s" : ""} found in
                        database
                      </div>
                      {smartSearchFoods.slice(0, 50).map((food) => (
                        <button
                          type="button"
                          key={food.id}
                          className="w-full text-left flex justify-between items-center px-3 py-2 hover:bg-muted/60 transition-colors border-t border-border first:border-0"
                          onClick={() => setSmartSearchSelected(food)}
                        >
                          <div>
                            <div className="text-sm font-medium">
                              {food.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {food.serving} • {food.cuisine}
                            </div>
                          </div>
                          <div className="text-xs text-primary font-medium">
                            {food.calories} kcal
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {smartSearchFoods.length === 0 && smartSearchQuery.trim() && (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      No exact matches in database — use Smart Estimate below
                    </p>
                  )}

                  {/* Smart estimate — always visible when query is non-empty */}
                  {smartSearchQuery.trim().length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <div className="flex-1 h-px bg-border" />
                        <span>Smart Estimate</span>
                        <div className="flex-1 h-px bg-border" />
                      </div>
                      <SmartEstimatorPanel
                        foodName={smartSearchQuery}
                        servingSize={smartSearchEstimateSize}
                        onServingSizeChange={setSmartSearchEstimateSize}
                        onAdd={addSmartSearchEstimated}
                        ocidPrefix="tracker.smart_search_estimate"
                      />
                    </div>
                  )}

                  {!smartSearchQuery.trim() && (
                    <div
                      className="text-center py-8 text-muted-foreground"
                      data-ocid="tracker.smart_search.empty_state"
                    >
                      <Zap className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">
                        Start typing to search foods or get a smart estimate
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Manually */}
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
