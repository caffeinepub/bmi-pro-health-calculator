import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  Footprints,
  RotateCcw,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface StepEntry {
  date: string;
  steps: number;
  goal: number;
}

const DAILY_GOAL = 10000;
const STEP_LENGTH_M = 0.762;
const STEP_KCAL = 0.04;

function getStorageKey(uname: string) {
  return `bmi_pro_${uname}_step_logs`;
}

function loadStepsLog(uname: string): StepEntry[] {
  try {
    const raw = localStorage.getItem(getStorageKey(uname));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStepsLog(uname: string, log: StepEntry[]) {
  localStorage.setItem(getStorageKey(uname), JSON.stringify(log));
}

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
}

function getStepColor(steps: number) {
  if (steps >= 7000) return "oklch(0.78 0.22 145)";
  if (steps >= 3000) return "oklch(0.78 0.20 65)";
  return "oklch(0.65 0.22 25)";
}

function getStepBadgeClass(steps: number) {
  if (steps >= 7000) return "bg-primary/10 text-primary border-primary/30";
  if (steps >= 3000)
    return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
  return "bg-red-500/10 text-red-400 border-red-500/30";
}

// Check if DeviceMotionEvent is available
function hasDeviceMotion(): boolean {
  return typeof window !== "undefined" && "DeviceMotionEvent" in window;
}

// Check if iOS permission API exists
function needsIOSPermission(): boolean {
  return (
    hasDeviceMotion() &&
    typeof (DeviceMotionEvent as any).requestPermission === "function"
  );
}

export function StepsTab({ username }: { username: string }) {
  const [log, setLog] = useState<StepEntry[]>(() => loadStepsLog(username));
  const [sessionSteps, setSessionSteps] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [permissionState, setPermissionState] = useState<
    "unknown" | "granted" | "denied" | "unsupported"
  >(hasDeviceMotion() ? "unknown" : "unsupported");
  const [manualInput, setManualInput] = useState("");
  const [goal, setGoal] = useState(DAILY_GOAL);
  const [goalInput, setGoalInput] = useState(String(DAILY_GOAL));

  const lastStepTime = useRef(0);
  const prevMag = useRef(0);
  const rising = useRef(false);

  // Reload log when principal changes
  useEffect(() => {
    setLog(loadStepsLog(username));
  }, [username]);

  const today = getTodayStr();
  const todayEntry = log.find((e) => e.date === today);
  const savedSteps = todayEntry?.steps ?? 0;
  const totalSteps = savedSteps + sessionSteps;

  const distance = (totalSteps * STEP_LENGTH_M) / 1000; // km
  const calories = Math.round(totalSteps * STEP_KCAL);
  const progressPct = Math.min(100, Math.round((totalSteps / goal) * 100));

  // Last 7 days for chart
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const entry = log.find((e) => e.date === dateStr);
    const steps = entry
      ? entry.steps + (dateStr === today ? sessionSteps : 0)
      : dateStr === today
        ? sessionSteps
        : 0;
    return {
      date: formatDate(dateStr),
      steps,
      goal: entry?.goal ?? goal,
      isToday: dateStr === today,
    };
  });

  const handleMotion = useCallback((e: DeviceMotionEvent) => {
    const acc = e.accelerationIncludingGravity;
    if (!acc) return;
    const x = acc.x ?? 0;
    const y = acc.y ?? 0;
    const z = acc.z ?? 0;
    const mag = Math.sqrt(x * x + y * y + z * z);

    const THRESHOLD = 12;
    const MIN_INTERVAL = 300;

    if (!rising.current && mag > prevMag.current) {
      rising.current = true;
    } else if (rising.current && mag < prevMag.current) {
      rising.current = false;
      // Peak detected — check threshold and debounce
      if (prevMag.current > THRESHOLD) {
        const now = Date.now();
        if (now - lastStepTime.current > MIN_INTERVAL) {
          lastStepTime.current = now;
          setSessionSteps((prev) => prev + 1);
        }
      }
    }
    prevMag.current = mag;
  }, []);

  const startTracking = useCallback(async () => {
    if (needsIOSPermission()) {
      try {
        const result = await (DeviceMotionEvent as any).requestPermission();
        if (result !== "granted") {
          setPermissionState("denied");
          return;
        }
        setPermissionState("granted");
      } catch {
        setPermissionState("denied");
        return;
      }
    } else {
      setPermissionState("granted");
    }
    window.addEventListener("devicemotion", handleMotion);
    setIsTracking(true);
  }, [handleMotion]);

  const stopTracking = useCallback(() => {
    window.removeEventListener("devicemotion", handleMotion);
    setIsTracking(false);
  }, [handleMotion]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener("devicemotion", handleMotion);
    };
  }, [handleMotion]);

  const saveToday = useCallback(
    (steps: number) => {
      setLog((prev) => {
        const updated = prev.filter((e) => e.date !== today);
        const entry: StepEntry = { date: today, steps, goal };
        const newLog = [...updated, entry].sort((a, b) =>
          a.date.localeCompare(b.date),
        );
        saveStepsLog(username, newLog);
        return newLog;
      });
    },
    [today, goal, username],
  );

  const handleLogSession = () => {
    if (sessionSteps === 0) return;
    const newTotal = savedSteps + sessionSteps;
    saveToday(newTotal);
    setSessionSteps(0);
    stopTracking();
  };

  const handleResetSession = () => {
    stopTracking();
    setSessionSteps(0);
  };

  const handleManualLog = () => {
    const steps = Number.parseInt(manualInput, 10);
    if (Number.isNaN(steps) || steps < 0) return;
    saveToday(steps);
    setManualInput("");
  };

  const handleGoalUpdate = () => {
    const g = Number.parseInt(goalInput, 10);
    if (Number.isNaN(g) || g < 100) return;
    setGoal(g);
  };

  const tooltipStyle = {
    backgroundColor: "oklch(0.18 0.025 160)",
    border: "1px solid oklch(0.30 0.04 160)",
    borderRadius: "8px",
    color: "oklch(0.95 0.01 160)",
  };

  return (
    <div className="space-y-5">
      {/* Hero Step Count */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-2 mb-5">
            <div
              className="text-7xl font-display font-bold tabular-nums"
              style={{ color: getStepColor(totalSteps) }}
              data-ocid="steps.count.panel"
            >
              {totalSteps.toLocaleString()}
            </div>
            <div className="text-muted-foreground text-sm">steps today</div>
            <Badge
              variant="outline"
              className={`text-xs border px-3 py-1 ${getStepBadgeClass(
                totalSteps,
              )}`}
            >
              {totalSteps >= 7000
                ? "🎉 Great job!"
                : totalSteps >= 3000
                  ? "🚶 Keep going!"
                  : "💪 Let's move!"}
            </Badge>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>{totalSteps.toLocaleString()} steps</span>
              <span>Goal: {goal.toLocaleString()}</span>
            </div>
            <Progress
              value={progressPct}
              className="h-3"
              data-ocid="steps.progress.panel"
            />
            <div className="text-xs text-muted-foreground text-right mt-1">
              {progressPct}% of daily goal
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Distance",
                value: `${distance.toFixed(2)} km`,
                icon: TrendingUp,
              },
              { label: "Calories", value: `${calories} kcal`, icon: Zap },
              {
                label: "Goal",
                value: `${goal.toLocaleString()} steps`,
                icon: Target,
              },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="bg-muted/30 rounded-lg p-3 text-center"
              >
                <Icon className="w-4 h-4 text-primary mx-auto mb-1" />
                <div className="text-sm font-medium">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Accelerometer Counter */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-display flex items-center gap-2">
            <Footprints className="w-4 h-4 text-primary" />
            Live Step Counter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {permissionState === "unsupported" ? (
            <div
              className="text-center py-4 text-muted-foreground"
              data-ocid="steps.accel.error_state"
            >
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">Accelerometer not available</p>
              <p className="text-xs mt-1">
                This device doesn't support motion sensing. Use manual entry
                below.
              </p>
            </div>
          ) : permissionState === "denied" ? (
            <div
              className="text-center py-4 text-muted-foreground"
              data-ocid="steps.accel.error_state"
            >
              <p className="text-sm">Motion permission was denied.</p>
              <p className="text-xs mt-1">
                Please enable motion access in your browser/device settings,
                then reload.
              </p>
            </div>
          ) : (
            <>
              {isTracking && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-sm text-primary">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                  Tracking active — move your phone while walking
                </div>
              )}

              {permissionState === "unknown" && !isTracking && (
                <p className="text-xs text-muted-foreground">
                  {needsIOSPermission()
                    ? "Tap Start to grant motion permission (iOS requires a user gesture)."
                    : "Start tracking to count steps using your device's accelerometer."}
                </p>
              )}

              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className="text-3xl font-display font-bold text-primary tabular-nums">
                    {sessionSteps}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    session steps
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  {!isTracking ? (
                    <Button
                      onClick={startTracking}
                      className="w-full"
                      data-ocid="steps.accel.primary_button"
                    >
                      <Footprints className="w-4 h-4 mr-2" />
                      Start Tracking
                    </Button>
                  ) : (
                    <Button
                      onClick={stopTracking}
                      variant="outline"
                      className="w-full"
                      data-ocid="steps.accel.secondary_button"
                    >
                      Pause
                    </Button>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={handleLogSession}
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      disabled={sessionSteps === 0}
                      data-ocid="steps.accel.save_button"
                    >
                      Save to Today
                    </Button>
                    <Button
                      onClick={handleResetSession}
                      size="sm"
                      variant="ghost"
                      className="text-xs"
                      disabled={sessionSteps === 0}
                      data-ocid="steps.accel.delete_button"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Manual Entry */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-display">
            Manual Step Entry
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Entered your step count from a smartwatch, fitness band, or another
            app? Log it here.
          </p>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1 block">
                Steps for today
              </Label>
              <Input
                type="number"
                min="0"
                max="100000"
                placeholder="e.g. 8500"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleManualLog()}
                data-ocid="steps.manual.input"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleManualLog}
                disabled={!manualInput}
                data-ocid="steps.manual.submit_button"
              >
                Log Steps
              </Button>
            </div>
          </div>
          {todayEntry && (
            <p className="text-xs text-muted-foreground">
              Last saved today:{" "}
              <span className="text-foreground font-medium">
                {todayEntry.steps.toLocaleString()} steps
              </span>
              {sessionSteps > 0 && (
                <span className="text-primary">
                  {" "}
                  + {sessionSteps} live session
                </span>
              )}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Goal Setting */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-display">Daily Goal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="number"
              min="1000"
              max="50000"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              className="w-36"
              data-ocid="steps.goal.input"
            />
            <Button
              variant="outline"
              onClick={handleGoalUpdate}
              data-ocid="steps.goal.save_button"
            >
              Set Goal
            </Button>
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            {[5000, 7500, 10000, 12000, 15000].map((g) => (
              <button
                key={g}
                type="button"
                className={`text-xs px-2 py-1 rounded border transition-colors ${
                  goal === g
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/40 text-muted-foreground border-border hover:border-primary/50"
                }`}
                onClick={() => {
                  setGoal(g);
                  setGoalInput(String(g));
                }}
                data-ocid="steps.goal.toggle"
              >
                {g.toLocaleString()}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 7-Day History Chart */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-display">
            7-Day Step History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.every((d) => d.steps === 0) ? (
            <div
              className="text-center py-8 text-muted-foreground"
              data-ocid="steps.history.empty_state"
            >
              <Footprints className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No step history yet</p>
              <p className="text-xs mt-1">
                Start tracking or log steps to see your chart
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={chartData}
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
                <YAxis tick={{ fill: "oklch(0.60 0.04 160)", fontSize: 11 }} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v: number) => [
                    `${v.toLocaleString()} steps`,
                    "Steps",
                  ]}
                />
                <Bar dataKey="steps" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.date}
                      fill={getStepColor(entry.steps)}
                      opacity={entry.isToday ? 1 : 0.75}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
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
    </div>
  );
}
