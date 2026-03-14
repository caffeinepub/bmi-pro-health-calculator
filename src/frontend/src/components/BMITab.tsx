import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";

interface BMIData {
  height: string;
  heightUnit: "cm" | "ft";
  heightFt: string;
  heightIn: string;
  weight: string;
  weightUnit: "kg" | "lbs";
  age: string;
  gender: "male" | "female";
  activityLevel: string;
  targetWeight: string;
}

const defaultBMIData: BMIData = {
  height: "",
  heightUnit: "cm",
  heightFt: "",
  heightIn: "",
  weight: "",
  weightUnit: "kg",
  age: "",
  gender: "male",
  activityLevel: "sedentary",
  targetWeight: "",
};

const activityMultipliers: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
};

const activityLabels: Record<string, string> = {
  sedentary: "Sedentary (little or no exercise)",
  light: "Lightly Active (1-3 days/week)",
  moderate: "Moderately Active (3-5 days/week)",
  active: "Very Active (6-7 days/week)",
  veryActive: "Extra Active (athlete / physical job)",
};

export function BMITab() {
  const [data, setData] = useState<BMIData>(() => {
    try {
      const saved = localStorage.getItem("bmi_data");
      return saved
        ? { ...defaultBMIData, ...JSON.parse(saved) }
        : defaultBMIData;
    } catch {
      return defaultBMIData;
    }
  });

  useEffect(() => {
    localStorage.setItem("bmi_data", JSON.stringify(data));
  }, [data]);

  const getHeightInCm = (): number => {
    if (data.heightUnit === "cm") return Number.parseFloat(data.height) || 0;
    const ft = Number.parseFloat(data.heightFt) || 0;
    const inches = Number.parseFloat(data.heightIn) || 0;
    return (ft * 12 + inches) * 2.54;
  };

  const getWeightInKg = (): number => {
    const w = Number.parseFloat(data.weight) || 0;
    return data.weightUnit === "kg" ? w : w * 0.453592;
  };

  const heightCm = getHeightInCm();
  const weightKg = getWeightInKg();
  const bmi =
    heightCm > 0 && weightKg > 0 ? weightKg / (heightCm / 100) ** 2 : 0;

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5)
      return {
        label: "Underweight",
        color: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      };
    if (bmi < 25)
      return {
        label: "Normal Weight",
        color: "bg-primary/20 text-primary border-primary/30",
      };
    if (bmi < 30)
      return {
        label: "Overweight",
        color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
      };
    return {
      label: "Obese",
      color: "bg-destructive/20 text-red-300 border-destructive/30",
    };
  };

  const age = Number.parseInt(data.age) || 30;
  const bmr =
    data.gender === "male"
      ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  const tdee = bmr * activityMultipliers[data.activityLevel];

  const cat = bmi > 0 ? getBMICategory(bmi) : null;

  const handleHeightUnitChange = (unit: "cm" | "ft") => {
    if (unit === data.heightUnit) return;
    if (unit === "ft" && data.height) {
      const totalIn = (Number.parseFloat(data.height) || 0) / 2.54;
      const ft = Math.floor(totalIn / 12);
      const inches = Math.round(totalIn % 12);
      setData((prev) => ({
        ...prev,
        heightUnit: unit,
        heightFt: String(ft),
        heightIn: String(inches),
        height: "",
      }));
    } else if (unit === "cm" && (data.heightFt || data.heightIn)) {
      const ft = Number.parseFloat(data.heightFt) || 0;
      const inches = Number.parseFloat(data.heightIn) || 0;
      const cm = Math.round((ft * 12 + inches) * 2.54);
      setData((prev) => ({
        ...prev,
        heightUnit: unit,
        height: String(cm),
        heightFt: "",
        heightIn: "",
      }));
    } else {
      setData((prev) => ({ ...prev, heightUnit: unit }));
    }
  };

  const handleWeightUnitChange = (unit: "kg" | "lbs") => {
    if (unit === data.weightUnit) return;
    if (data.weight) {
      const w = Number.parseFloat(data.weight) || 0;
      const converted =
        unit === "lbs" ? Math.round(w * 2.20462) : Math.round(w / 2.20462);
      setData((prev) => ({
        ...prev,
        weightUnit: unit,
        weight: String(converted),
      }));
    } else {
      setData((prev) => ({ ...prev, weightUnit: unit }));
    }
  };

  const tips = cat
    ? ({
        Underweight: [
          "Increase calorie intake by 300-500 kcal/day",
          "Focus on protein-rich foods (eggs, paneer, dal)",
          "Do strength training 3x/week",
          "Include healthy fats (nuts, avocado, ghee)",
          "Eat frequent small meals throughout the day",
        ],
        "Normal Weight": [
          "Maintain current balanced diet",
          "Continue regular exercise 150 min/week",
          "Monitor weight weekly",
          "Stay hydrated — 2-3 liters daily",
          "Include variety of vegetables and fruits",
        ],
        Overweight: [
          "Reduce daily calorie intake by 300-500 kcal",
          "Increase cardio — aim for 200 min/week",
          "Cut sugary drinks and processed snacks",
          "Eat more fiber-rich vegetables and pulses",
          "Walk after every meal for 10-15 mins",
        ],
        Obese: [
          "Consult a dietitian for a personalized plan",
          "Start with walking 30 mins daily",
          "Reduce refined carbs and sugar completely",
          "Prioritize sleep — poor sleep raises cortisol",
          "Track every meal using food diary",
        ],
      }[cat.label] ?? [])
    : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-display">
              Your Measurements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Height */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Height</Label>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={data.heightUnit === "cm" ? "default" : "outline"}
                    className="h-7 px-2 text-xs"
                    onClick={() => handleHeightUnitChange("cm")}
                    data-ocid="bmi.height_unit_cm.toggle"
                  >
                    cm
                  </Button>
                  <Button
                    size="sm"
                    variant={data.heightUnit === "ft" ? "default" : "outline"}
                    className="h-7 px-2 text-xs"
                    onClick={() => handleHeightUnitChange("ft")}
                    data-ocid="bmi.height_unit_ft.toggle"
                  >
                    ft/in
                  </Button>
                </div>
              </div>
              {data.heightUnit === "cm" ? (
                <Input
                  placeholder="e.g. 170"
                  value={data.height}
                  onChange={(e) =>
                    setData((p) => ({ ...p, height: e.target.value }))
                  }
                  data-ocid="bmi.height.input"
                />
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="ft"
                    value={data.heightFt}
                    onChange={(e) =>
                      setData((p) => ({ ...p, heightFt: e.target.value }))
                    }
                    data-ocid="bmi.height_ft.input"
                  />
                  <Input
                    placeholder="in"
                    value={data.heightIn}
                    onChange={(e) =>
                      setData((p) => ({ ...p, heightIn: e.target.value }))
                    }
                    data-ocid="bmi.height_in.input"
                  />
                </div>
              )}
            </div>

            {/* Weight */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Weight</Label>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={data.weightUnit === "kg" ? "default" : "outline"}
                    className="h-7 px-2 text-xs"
                    onClick={() => handleWeightUnitChange("kg")}
                    data-ocid="bmi.weight_unit_kg.toggle"
                  >
                    kg
                  </Button>
                  <Button
                    size="sm"
                    variant={data.weightUnit === "lbs" ? "default" : "outline"}
                    className="h-7 px-2 text-xs"
                    onClick={() => handleWeightUnitChange("lbs")}
                    data-ocid="bmi.weight_unit_lbs.toggle"
                  >
                    lbs
                  </Button>
                </div>
              </div>
              <Input
                placeholder={data.weightUnit === "kg" ? "e.g. 70" : "e.g. 154"}
                value={data.weight}
                onChange={(e) =>
                  setData((p) => ({ ...p, weight: e.target.value }))
                }
                data-ocid="bmi.weight.input"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Age</Label>
                <Input
                  placeholder="e.g. 28"
                  value={data.age}
                  onChange={(e) =>
                    setData((p) => ({ ...p, age: e.target.value }))
                  }
                  data-ocid="bmi.age.input"
                />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  value={data.gender}
                  onValueChange={(v) =>
                    setData((p) => ({ ...p, gender: v as "male" | "female" }))
                  }
                >
                  <SelectTrigger data-ocid="bmi.gender.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Activity Level</Label>
              <Select
                value={data.activityLevel}
                onValueChange={(v) =>
                  setData((p) => ({ ...p, activityLevel: v }))
                }
              >
                <SelectTrigger data-ocid="bmi.activity.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(activityLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Target Weight ({data.weightUnit})</Label>
              <Input
                placeholder="Goal weight"
                value={data.targetWeight}
                onChange={(e) =>
                  setData((p) => ({ ...p, targetWeight: e.target.value }))
                }
                data-ocid="bmi.target_weight.input"
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {bmi > 0 ? (
            <>
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="text-center mb-4">
                    <div className="text-6xl font-display font-bold neon-text">
                      {bmi.toFixed(1)}
                    </div>
                    <div className="text-muted-foreground text-sm mt-1">
                      Body Mass Index
                    </div>
                    {cat && (
                      <Badge className={`mt-2 ${cat.color} border`}>
                        {cat.label}
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-muted/40 rounded-lg p-3 text-center">
                      <div className="text-sm text-muted-foreground">BMR</div>
                      <div className="font-bold text-foreground">
                        {Math.round(bmr)} kcal
                      </div>
                    </div>
                    <div className="bg-muted/40 rounded-lg p-3 text-center">
                      <div className="text-sm text-muted-foreground">
                        Daily TDEE
                      </div>
                      <div className="font-bold text-primary">
                        {Math.round(tdee)} kcal
                      </div>
                    </div>
                  </div>
                  {data.targetWeight && (
                    <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                      <div className="text-sm text-muted-foreground">
                        To reach target weight
                      </div>
                      <div className="font-medium text-foreground mt-1">
                        {(() => {
                          const target = Number.parseFloat(data.targetWeight);
                          const targetKg =
                            data.weightUnit === "lbs"
                              ? target * 0.453592
                              : target;
                          const diff = weightKg - targetKg;
                          if (Math.abs(diff) < 0.5)
                            return "You are at your target weight! 🎉";
                          const weeksNeeded = Math.abs(diff) / 0.5;
                          return diff > 0
                            ? `Lose ${diff.toFixed(1)} kg (~${Math.ceil(weeksNeeded)} weeks at 0.5kg/week)`
                            : `Gain ${Math.abs(diff).toFixed(1)} kg (~${Math.ceil(weeksNeeded)} weeks at 0.5kg/week)`;
                        })()}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-sm font-display">
                    BMI Scale Reference
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[
                      {
                        label: "Underweight",
                        range: "< 18.5",
                        color: "bg-blue-500",
                      },
                      {
                        label: "Normal",
                        range: "18.5 – 24.9",
                        color: "bg-primary",
                      },
                      {
                        label: "Overweight",
                        range: "25 – 29.9",
                        color: "bg-yellow-500",
                      },
                      { label: "Obese", range: "≥ 30", color: "bg-red-500" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`flex items-center justify-between p-2 rounded ${
                          cat?.label === item.label ||
                          (
                            item.label === "Normal" &&
                              cat?.label === "Normal Weight"
                          )
                            ? "bg-muted/60"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${item.color}`}
                          />
                          <span className="text-sm">{item.label}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {item.range}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-5xl mb-3">📊</div>
                  <p className="text-sm">
                    Enter your height and weight to see your BMI result
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {tips.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base font-display">
              Personalized Health Tips for {cat?.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {tips.map((tip) => (
                <li key={tip} className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-0.5">✓</span>
                  <span className="text-muted-foreground">{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
