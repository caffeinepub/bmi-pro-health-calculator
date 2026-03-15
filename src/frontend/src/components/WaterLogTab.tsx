import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Droplets, Plus, Target, Trophy } from "lucide-react";
import { useCallback, useState } from "react";

interface WaterEntry {
  date: string;
  ml: number;
}

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function getStorageKey(username: string) {
  return `bmi_pro_${username}_water_logs`;
}

function loadWaterLogs(username: string): WaterEntry[] {
  try {
    const raw = localStorage.getItem(getStorageKey(username));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveWaterLogs(username: string, logs: WaterEntry[]) {
  localStorage.setItem(getStorageKey(username), JSON.stringify(logs));
}

const DAILY_GOAL_ML = 2000;
const GLASS_ML = 250;

export function WaterLogTab({ username }: { username: string }) {
  const [logs, setLogs] = useState<WaterEntry[]>(() => loadWaterLogs(username));
  const [customMl, setCustomMl] = useState("");
  const today = getTodayKey();

  const todayTotal = logs
    .filter((e) => e.date === today)
    .reduce((sum, e) => sum + e.ml, 0);

  const percentDone = Math.min(100, (todayTotal / DAILY_GOAL_ML) * 100);
  const glassesTotal = Math.floor(todayTotal / GLASS_ML);
  const goalReached = todayTotal >= DAILY_GOAL_ML;

  const addWater = useCallback(
    (ml: number) => {
      const newLogs = [...logs, { date: today, ml }];
      setLogs(newLogs);
      saveWaterLogs(username, newLogs);
    },
    [logs, today, username],
  );

  function handleCustomAdd() {
    const ml = Number.parseInt(customMl);
    if (ml > 0 && ml <= 5000) {
      addWater(ml);
      setCustomMl("");
    }
  }

  // Last 7 days history
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split("T")[0];
    const total = logs
      .filter((e) => e.date === key)
      .reduce((sum, e) => sum + e.ml, 0);
    return {
      key,
      label: d.toLocaleDateString("en", { weekday: "short" }),
      total,
    };
  });

  const maxHistory = Math.max(...last7Days.map((d) => d.total), DAILY_GOAL_ML);

  return (
    <div className="space-y-5">
      {/* Hero Image */}
      <div className="rounded-xl overflow-hidden relative h-32 sm:h-40">
        <img
          src="/assets/generated/water-hero.dim_400x300.jpg"
          alt="Hydration"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end p-4">
          <div>
            <h2 className="font-display font-bold text-2xl text-white">
              Stay Hydrated 💧
            </h2>
            <p className="text-white/80 text-sm">
              Track your daily water intake
            </p>
          </div>
        </div>
      </div>

      {/* Today's Progress */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="font-display flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-400" />
            Today's Water Intake
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Big number display */}
          <div className="text-center">
            <div className="text-5xl font-display font-bold text-blue-400">
              {todayTotal}
              <span className="text-xl text-muted-foreground">ml</span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {glassesTotal} glasses · Goal:{" "}
              <span className="text-primary">
                {DAILY_GOAL_ML}ml ({DAILY_GOAL_ML / GLASS_ML} glasses)
              </span>
            </div>
          </div>

          {/* Animated progress bar */}
          <div className="relative">
            <Progress value={percentDone} className="h-6 rounded-full" />
            <div
              className="absolute inset-0 flex items-center justify-center text-xs font-semibold"
              style={{ color: percentDone > 50 ? "white" : undefined }}
            >
              {Math.round(percentDone)}%
            </div>
          </div>

          {goalReached && (
            <div
              className="flex items-center gap-2 text-primary bg-primary/10 border border-primary/20 rounded-lg p-3"
              data-ocid="water.success_state"
            >
              <Trophy className="w-5 h-5" />
              <div>
                <div className="font-semibold text-sm">
                  Daily Goal Reached! 🎉
                </div>
                <div className="text-xs text-muted-foreground">
                  Great job staying hydrated today!
                </div>
              </div>
            </div>
          )}

          {/* Quick add buttons */}
          <div>
            <div className="text-sm font-medium mb-2 flex items-center gap-1">
              <Plus className="w-4 h-4" /> Quick Add
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => addWater(250)}
                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                data-ocid="water.add_glass.button"
              >
                +1 Glass (250ml)
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addWater(500)}
                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                data-ocid="water.add_500ml.button"
              >
                +500ml
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addWater(1000)}
                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                data-ocid="water.add_1l.button"
              >
                +1 Litre
              </Button>
            </div>
          </div>

          {/* Custom add */}
          <div>
            <div className="text-sm font-medium mb-2">Custom Amount</div>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Enter ml (e.g. 350)"
                value={customMl}
                onChange={(e) => setCustomMl(e.target.value)}
                className="flex-1"
                min={1}
                max={5000}
                data-ocid="water.custom_amount.input"
              />
              <Button
                onClick={handleCustomAdd}
                disabled={!customMl || Number(customMl) <= 0}
                data-ocid="water.custom.submit_button"
              >
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 7-Day History */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            7-Day History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {last7Days.every((d) => d.total === 0) ? (
            <div
              className="text-center py-6 text-muted-foreground text-sm"
              data-ocid="water.history.empty_state"
            >
              No water logs yet. Start tracking!
            </div>
          ) : (
            <div className="space-y-2">
              {last7Days.map((day) => (
                <div key={day.key} className="flex items-center gap-3">
                  <div className="w-10 text-xs text-muted-foreground shrink-0">
                    {day.label}
                  </div>
                  <div className="flex-1 relative h-6 bg-muted/20 rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full rounded-full transition-all"
                      style={{
                        width: `${(day.total / maxHistory) * 100}%`,
                        background:
                          day.total >= DAILY_GOAL_ML
                            ? "oklch(0.78 0.22 145)"
                            : "oklch(0.65 0.18 220)",
                      }}
                    />
                    <div
                      className="absolute inset-0 flex items-center justify-center text-xs font-medium"
                      style={{
                        color:
                          (day.total / maxHistory) * 100 > 40
                            ? "white"
                            : undefined,
                      }}
                    >
                      {day.total > 0 ? `${day.total}ml` : ""}
                    </div>
                  </div>
                  {day.total >= DAILY_GOAL_ML && (
                    <span className="text-primary text-xs">✓</span>
                  )}
                </div>
              ))}
              <div className="text-xs text-muted-foreground mt-2">
                Goal line: {DAILY_GOAL_ML}ml
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
