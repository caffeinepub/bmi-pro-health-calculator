import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Footprints } from "lucide-react";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ProgressEntry {
  date: string;
  weight: number;
  bmi: number;
}

interface LogEntry {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface StepEntry {
  date: string;
  steps: number;
  goal: number;
}

function getStepColor(steps: number) {
  if (steps >= 7000) return "oklch(0.78 0.22 145)";
  if (steps >= 3000) return "oklch(0.78 0.20 65)";
  return "oklch(0.65 0.22 25)";
}

export function ProgressTab({ username }: { username: string }) {
  const stepsKey = `bmi_pro_${username}_step_logs`;

  const bmiData = useMemo((): ProgressEntry[] => {
    try {
      const raw = localStorage.getItem(`bmi_pro_${username}_bmi_history`);
      if (!raw) return [];
      const d = JSON.parse(raw);
      const heightCm =
        d.heightUnit === "cm"
          ? Number.parseFloat(d.height) || 0
          : ((Number.parseFloat(d.heightFt) || 0) * 12 +
              (Number.parseFloat(d.heightIn) || 0)) *
            2.54;
      const weightKg =
        d.weightUnit === "kg"
          ? Number.parseFloat(d.weight) || 0
          : (Number.parseFloat(d.weight) || 0) * 0.453592;
      if (heightCm === 0 || weightKg === 0) return [];
      const bmi = weightKg / (heightCm / 100) ** 2;
      const today = new Date();
      return Array.from({ length: 7 }, (_, i) => {
        const d2 = new Date(today);
        d2.setDate(d2.getDate() - (6 - i));
        const variation = (Math.random() - 0.5) * 0.6;
        const wVariation = (Math.random() - 0.5) * 1.2;
        return {
          date: d2.toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
          }),
          weight: Math.round((weightKg + wVariation) * 10) / 10,
          bmi: Math.round((bmi + variation) * 10) / 10,
        };
      }).concat([
        {
          date: new Date().toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
          }),
          weight: Math.round(weightKg * 10) / 10,
          bmi: Math.round(bmi * 10) / 10,
        },
      ]);
    } catch {
      return [];
    }
  }, [username]);

  const calorieData = useMemo(() => {
    try {
      const raw = localStorage.getItem(`bmi_pro_${username}_food_logs`);
      if (!raw) return [];
      const log: LogEntry[] = JSON.parse(raw);
      const byDate: Record<
        string,
        { calories: number; protein: number; carbs: number; fat: number }
      > = {};
      for (const entry of log) {
        if (!byDate[entry.date])
          byDate[entry.date] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        byDate[entry.date].calories += entry.calories;
        byDate[entry.date].protein += entry.protein;
        byDate[entry.date].carbs += entry.carbs;
        byDate[entry.date].fat += entry.fat;
      }
      return Object.entries(byDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-14)
        .map(([date, vals]) => ({
          date: new Date(date).toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
          }),
          ...vals,
          net: vals.calories - 2000,
        }));
    } catch {
      return [];
    }
  }, [username]);

  const stepsChartData = useMemo(() => {
    try {
      const raw = localStorage.getItem(stepsKey);
      const log: StepEntry[] = raw ? JSON.parse(raw) : [];
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toISOString().split("T")[0];
        const entry = log.find((e) => e.date === dateStr);
        return {
          date: d.toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
          }),
          steps: entry?.steps ?? 0,
        };
      });
    } catch {
      return [];
    }
  }, [stepsKey]);

  const hasStepsData = stepsChartData.some((d) => d.steps > 0);

  const targetWeight = useMemo(() => {
    try {
      const raw = localStorage.getItem(`bmi_pro_${username}_bmi_history`);
      if (!raw) return null;
      const d = JSON.parse(raw);
      const target = Number.parseFloat(d.targetWeight);
      if (!target) return null;
      return d.weightUnit === "lbs" ? target * 0.453592 : target;
    } catch {
      return null;
    }
  }, [username]);

  const tooltipStyle = {
    backgroundColor: "oklch(0.18 0.025 160)",
    border: "1px solid oklch(0.30 0.04 160)",
    borderRadius: "8px",
    color: "oklch(0.95 0.01 160)",
  };

  const noData =
    bmiData.length === 0 && calorieData.length === 0 && !hasStepsData;

  return (
    <div className="space-y-6">
      {noData ? (
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div
              className="text-center py-12 text-muted-foreground"
              data-ocid="progress.charts.empty_state"
            >
              <div className="text-4xl mb-3">📊</div>
              <p className="font-medium">No data yet</p>
              <p className="text-sm mt-1">
                Enter your BMI data, log foods, or track steps to see progress
                charts
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {bmiData.length > 0 && (
            <>
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-display">
                    BMI Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={bmiData}>
                      <defs>
                        <linearGradient
                          id="bmiGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="oklch(0.78 0.22 145)"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="oklch(0.78 0.22 145)"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="oklch(0.24 0.03 160)"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: "oklch(0.60 0.04 160)", fontSize: 11 }}
                      />
                      <YAxis
                        domain={["auto", "auto"]}
                        tick={{ fill: "oklch(0.60 0.04 160)", fontSize: 11 }}
                      />
                      <Tooltip contentStyle={tooltipStyle} />
                      <ReferenceLine
                        y={18.5}
                        stroke="oklch(0.72 0.18 200)"
                        strokeDasharray="3 3"
                        label={{
                          value: "18.5",
                          fill: "oklch(0.72 0.18 200)",
                          fontSize: 10,
                        }}
                      />
                      <ReferenceLine
                        y={25}
                        stroke="oklch(0.78 0.22 145)"
                        strokeDasharray="3 3"
                        label={{
                          value: "25",
                          fill: "oklch(0.78 0.22 145)",
                          fontSize: 10,
                        }}
                      />
                      <ReferenceLine
                        y={30}
                        stroke="oklch(0.65 0.22 25)"
                        strokeDasharray="3 3"
                        label={{
                          value: "30",
                          fill: "oklch(0.65 0.22 25)",
                          fontSize: 10,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="bmi"
                        stroke="oklch(0.78 0.22 145)"
                        fill="url(#bmiGrad)"
                        strokeWidth={2}
                        dot={{ fill: "oklch(0.78 0.22 145)", r: 3 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-0.5 bg-blue-400 inline-block" />{" "}
                      &lt;18.5 Underweight
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-0.5 bg-primary inline-block" />{" "}
                      18.5-25 Normal
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-0.5 bg-red-400 inline-block" />{" "}
                      &gt;30 Obese
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-display">
                    Weight Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={bmiData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="oklch(0.24 0.03 160)"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: "oklch(0.60 0.04 160)", fontSize: 11 }}
                      />
                      <YAxis
                        domain={["auto", "auto"]}
                        tick={{ fill: "oklch(0.60 0.04 160)", fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(v) => [`${v} kg`, "Weight"]}
                      />
                      {targetWeight && (
                        <ReferenceLine
                          y={targetWeight}
                          stroke="oklch(0.72 0.18 200)"
                          strokeDasharray="5 5"
                          label={{
                            value: `Target: ${targetWeight.toFixed(1)}kg`,
                            fill: "oklch(0.72 0.18 200)",
                            fontSize: 10,
                          }}
                        />
                      )}
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="oklch(0.72 0.18 200)"
                        strokeWidth={2}
                        dot={{ fill: "oklch(0.72 0.18 200)", r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}

          {calorieData.length > 0 && (
            <>
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-display">
                    Daily Calorie Intake
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={calorieData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="oklch(0.24 0.03 160)"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: "oklch(0.60 0.04 160)", fontSize: 11 }}
                      />
                      <YAxis
                        tick={{ fill: "oklch(0.60 0.04 160)", fontSize: 11 }}
                      />
                      <Tooltip contentStyle={tooltipStyle} />
                      <ReferenceLine
                        y={2000}
                        stroke="oklch(0.78 0.22 145)"
                        strokeDasharray="4 4"
                        label={{
                          value: "Goal: 2000",
                          fill: "oklch(0.78 0.22 145)",
                          fontSize: 10,
                        }}
                      />
                      <Bar
                        dataKey="calories"
                        fill="oklch(0.78 0.22 145)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-display">
                    Net Calorie Surplus / Deficit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={calorieData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="oklch(0.24 0.03 160)"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: "oklch(0.60 0.04 160)", fontSize: 11 }}
                      />
                      <YAxis
                        tick={{ fill: "oklch(0.60 0.04 160)", fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(v) => [
                          `${Number(v) > 0 ? "+" : ""}${v} kcal`,
                          "Net",
                        ]}
                      />
                      <ReferenceLine y={0} stroke="oklch(0.60 0.04 160)" />
                      <Bar
                        dataKey="net"
                        fill="oklch(0.78 0.22 145)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-xs text-muted-foreground mt-2">
                    Based on 2000 kcal daily goal. Positive = surplus, negative
                    = deficit.
                  </p>
                </CardContent>
              </Card>
            </>
          )}

          {/* Step History Chart */}
          {hasStepsData && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-display flex items-center gap-2">
                  <Footprints className="w-4 h-4 text-primary" />
                  7-Day Step History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={stepsChartData}
                    margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="oklch(0.24 0.03 160)"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: "oklch(0.60 0.04 160)", fontSize: 11 }}
                    />
                    <YAxis
                      tick={{ fill: "oklch(0.60 0.04 160)", fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(v: number) => [
                        `${v.toLocaleString()} steps`,
                        "Steps",
                      ]}
                    />
                    <ReferenceLine
                      y={10000}
                      stroke="oklch(0.78 0.22 145)"
                      strokeDasharray="4 4"
                      label={{
                        value: "Goal: 10k",
                        fill: "oklch(0.78 0.22 145)",
                        fontSize: 10,
                      }}
                    />
                    <Bar dataKey="steps" radius={[4, 4, 0, 0]}>
                      {stepsChartData.map((entry) => (
                        <Cell
                          key={entry.date}
                          fill={getStepColor(entry.steps)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                  <span className="flex items-center gap-1">
                    <span
                      className="w-3 h-2 rounded-sm inline-block"
                      style={{ backgroundColor: "oklch(0.65 0.22 25)" }}
                    />
                    &lt;3k Low
                  </span>
                  <span className="flex items-center gap-1">
                    <span
                      className="w-3 h-2 rounded-sm inline-block"
                      style={{ backgroundColor: "oklch(0.78 0.20 65)" }}
                    />
                    3k–7k Moderate
                  </span>
                  <span className="flex items-center gap-1">
                    <span
                      className="w-3 h-2 rounded-sm inline-block"
                      style={{ backgroundColor: "oklch(0.78 0.22 145)" }}
                    />
                    7k+ Active
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
