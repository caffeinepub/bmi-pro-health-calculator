import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useEffect, useRef, useState } from "react";

interface FastingWindow {
  id: string;
  name: string;
  fastHours: number;
  eatHours: number;
  description: string;
  benefits: string[];
  difficulty: string;
}

const fastingWindows: FastingWindow[] = [
  {
    id: "12_12",
    name: "12:12",
    fastHours: 12,
    eatHours: 12,
    description:
      "The gentlest form of intermittent fasting. Simply stop eating after dinner and skip breakfast.",
    benefits: [
      "Improves digestion",
      "Stabilizes blood sugar",
      "Easy to maintain long-term",
      "Improves sleep quality",
    ],
    difficulty: "Easy",
  },
  {
    id: "14_10",
    name: "14:10",
    fastHours: 14,
    eatHours: 10,
    description:
      "A moderate fasting window ideal for beginners. Skip breakfast, eat within a 10-hour window.",
    benefits: [
      "Mild weight loss",
      "Reduces inflammation",
      "Improves insulin sensitivity",
      "No calorie restriction needed",
    ],
    difficulty: "Easy",
  },
  {
    id: "16_8",
    name: "16:8",
    fastHours: 16,
    eatHours: 8,
    description:
      "The most popular intermittent fasting method. Eat within an 8-hour window, typically noon to 8pm.",
    benefits: [
      "Significant weight loss",
      "Boosts metabolism",
      "Reduces belly fat",
      "Improves brain function",
      "Anti-aging effects",
    ],
    difficulty: "Moderate",
  },
  {
    id: "18_6",
    name: "18:6",
    fastHours: 18,
    eatHours: 6,
    description:
      "An advanced fasting protocol. Only eat within a 6-hour window.",
    benefits: [
      "Accelerated fat loss",
      "Deep ketosis",
      "Cellular autophagy",
      "Mental clarity",
    ],
    difficulty: "Hard",
  },
  {
    id: "20_4",
    name: "20:4 (Warrior Diet)",
    fastHours: 20,
    eatHours: 4,
    description:
      "The Warrior Diet. One large meal at night within a 4-hour window.",
    benefits: [
      "Maximum fat burning",
      "Growth hormone boost",
      "High ketone production",
      "Simplified meal planning",
    ],
    difficulty: "Very Hard",
  },
  {
    id: "24",
    name: "24-Hour Fast",
    fastHours: 24,
    eatHours: 0,
    description:
      "A full-day fast done 1-2 times per week. Eat normally every other day.",
    benefits: [
      "Deep cellular cleansing",
      "Immune system reset",
      "Significant calorie reduction",
      "Gut rest",
    ],
    difficulty: "Very Hard",
  },
  {
    id: "5_2",
    name: "5:2 Weekly",
    fastHours: 0,
    eatHours: 0,
    description:
      "Eat normally 5 days a week, restrict to 500-600 calories on 2 non-consecutive days.",
    benefits: [
      "Flexible schedule",
      "Sustainable long-term",
      "Reduces chronic disease risk",
      "Mental resilience",
    ],
    difficulty: "Moderate",
  },
];

interface FastingSession {
  windowId: string;
  startTime: number;
  isActive: boolean;
}

export function FastingTab({ username }: { username: string }) {
  const [session, setSession] = useState<FastingSession | null>(() => {
    try {
      const saved = localStorage.getItem(`bmi_pro_${username}_fasting_logs`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [now, setNow] = useState(Date.now());
  const [selectedWindow, setSelectedWindow] = useState<FastingWindow>(
    fastingWindows[2],
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startFast = () => {
    const newSession: FastingSession = {
      windowId: selectedWindow.id,
      startTime: Date.now(),
      isActive: true,
    };
    setSession(newSession);
    localStorage.setItem(
      `bmi_pro_${username}_fasting_logs`,
      JSON.stringify(newSession),
    );
  };

  const stopFast = () => {
    setSession(null);
    localStorage.removeItem(`bmi_pro_${username}_fasting_logs`);
  };

  const getActiveWindow = () => {
    if (!session) return null;
    return fastingWindows.find((w) => w.id === session.windowId) || null;
  };

  const activeWindow = getActiveWindow();
  const elapsed = session ? (now - session.startTime) / 1000 : 0;
  const targetSeconds = activeWindow ? activeWindow.fastHours * 3600 : 0;
  const progress =
    targetSeconds > 0 ? Math.min((elapsed / targetSeconds) * 100, 100) : 0;
  const remaining = Math.max(targetSeconds - elapsed, 0);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const difficultyColors: Record<string, string> = {
    Easy: "bg-primary/10 text-primary border-primary/30",
    Moderate: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30",
    Hard: "bg-orange-500/10 text-orange-300 border-orange-500/30",
    "Very Hard": "bg-red-500/10 text-red-300 border-red-500/30",
  };

  return (
    <div className="space-y-6">
      {/* Active Timer */}
      {session && activeWindow ? (
        <Card className="bg-card border-primary/30 border-2">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <div className="text-sm text-muted-foreground mb-1">
                Currently Fasting — {activeWindow.name}
              </div>
              <div className="text-6xl font-display font-bold neon-text tabular-nums">
                {formatTime(elapsed)}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                {remaining > 0 ? (
                  <span>{formatTime(remaining)} remaining until goal</span>
                ) : (
                  <span className="text-primary font-medium">
                    🎉 Fast complete! You made it!
                  </span>
                )}
              </div>
            </div>
            <Progress value={progress} className="h-3 mb-4" />
            <div className="flex justify-between text-xs text-muted-foreground mb-4">
              <span>0h</span>
              <span>
                {Math.round(progress)}% of {activeWindow.fastHours}h goal
              </span>
              <span>{activeWindow.fastHours}h</span>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-muted/40 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground">Elapsed</div>
                <div className="font-bold">{(elapsed / 3600).toFixed(1)}h</div>
              </div>
              <div className="bg-muted/40 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground">Goal</div>
                <div className="font-bold text-primary">
                  {activeWindow.fastHours}h
                </div>
              </div>
              <div className="bg-muted/40 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground">Started</div>
                <div className="font-bold">
                  {new Date(session.startTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
            <Button
              variant="destructive"
              className="w-full"
              onClick={stopFast}
              data-ocid="fasting.stop.button"
            >
              Stop Fast
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base font-display">
              Start a Fast
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {fastingWindows.map((w) => (
                <button
                  type="button"
                  key={w.id}
                  className={`text-left p-3 rounded-lg border transition-all ${
                    selectedWindow.id === w.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-muted/20 hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedWindow(w)}
                  data-ocid="fasting.window.button"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm">{w.name}</span>
                    <Badge
                      className={`text-xs border ${difficultyColors[w.difficulty]}`}
                    >
                      {w.difficulty}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {w.fastHours > 0 ? `${w.fastHours}h fast` : "2 days/week"}
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-muted/40 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium">{selectedWindow.name}</div>
                <Badge
                  className={`text-xs border ${difficultyColors[selectedWindow.difficulty]}`}
                >
                  {selectedWindow.difficulty}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {selectedWindow.description}
              </p>
              <div className="space-y-1">
                {selectedWindow.benefits.map((b) => (
                  <div key={b} className="flex items-center gap-2 text-xs">
                    <span className="text-primary">✓</span>
                    <span className="text-muted-foreground">{b}</span>
                  </div>
                ))}
              </div>
            </div>

            {selectedWindow.id !== "5_2" && (
              <Button
                className="w-full"
                onClick={startFast}
                data-ocid="fasting.start.button"
              >
                Start {selectedWindow.name} Fast
              </Button>
            )}
            {selectedWindow.id === "5_2" && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-sm text-muted-foreground">
                <strong className="text-primary">5:2 Protocol:</strong> Eat
                normally today if not a fast day. On fast days, limit intake to
                500-600 calories. Use the Food Tracker to count calories on fast
                days.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display">
              Fasting Stages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  h: "0-4h",
                  stage: "Fed State",
                  desc: "Body digesting and absorbing nutrients",
                  icon: "🍲",
                },
                {
                  h: "4-8h",
                  stage: "Early Fasting",
                  desc: "Glycogen being used, insulin drops",
                  icon: "⚡",
                },
                {
                  h: "8-16h",
                  stage: "Fat Burning",
                  desc: "Body switches to burning stored fat",
                  icon: "🔥",
                },
                {
                  h: "16-24h",
                  stage: "Ketosis",
                  desc: "Ketone production increases",
                  icon: "🌟",
                },
                {
                  h: "24h+",
                  stage: "Autophagy",
                  desc: "Cellular repair and cleansing begins",
                  icon: "🔬",
                },
              ].map((s) => (
                <div key={s.h} className="flex items-start gap-3">
                  <span className="text-lg">{s.icon}</span>
                  <div>
                    <div className="text-xs font-medium">
                      {s.h} — {s.stage}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {s.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display">
              Tips for Success
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                "Drink water, herbal tea, or black coffee during fasting hours",
                "Break fast with light, easily digestible foods",
                "Avoid breaking fast with sugary or processed foods",
                "Get adequate sleep to make fasting feel easier",
                "Electrolytes (sodium, potassium) help prevent headaches",
                "Start with 12:12 and gradually extend",
              ].map((tip) => (
                <div key={tip} className="flex items-start gap-2 text-xs">
                  <span className="text-primary mt-0.5">•</span>
                  <span className="text-muted-foreground">{tip}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
