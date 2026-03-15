import { AdminTab } from "@/components/AdminTab";
import { BMITab } from "@/components/BMITab";
import { ExerciseTab } from "@/components/ExerciseTab";
import { FastingTab } from "@/components/FastingTab";
import { FoodTrackerTab } from "@/components/FoodTrackerTab";
import { LoginScreen } from "@/components/LoginScreen";
import { ProgressTab } from "@/components/ProgressTab";
import { RecipesTab } from "@/components/RecipesTab";
import { StepsTab } from "@/components/StepsTab";
import { WaterLogTab } from "@/components/WaterLogTab";
import { YogaTab } from "@/components/YogaTab";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  BarChart2,
  BookOpen,
  Droplets,
  Dumbbell,
  Footprints,
  LogOut,
  Menu,
  RotateCcw,
  Shield,
  Timer,
  UtensilsCrossed,
  Wind,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

const USER_TABS = [
  { id: "bmi", label: "BMI", icon: Activity },
  { id: "food", label: "Food Tracker", icon: UtensilsCrossed },
  { id: "recipes", label: "Recipes", icon: BookOpen },
  { id: "exercise", label: "Exercise", icon: Dumbbell },
  { id: "yoga", label: "Yoga", icon: Wind },
  { id: "fasting", label: "Fasting", icon: Timer },
  { id: "steps", label: "Steps", icon: Footprints },
  { id: "water", label: "Water Log", icon: Droplets },
  { id: "progress", label: "Progress", icon: BarChart2 },
];

const ADMIN_TAB = { id: "admin", label: "Admin", icon: Shield };

const DATA_KEYS = [
  "bmi_history",
  "food_logs",
  "step_logs",
  "water_logs",
  "fasting_logs",
  "profile",
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem("bmi_pro_current_user");
  });
  const [activeTab, setActiveTab] = useState("bmi");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const isAdmin = currentUser === "admin";

  const tabs = useMemo(
    () => (isAdmin ? [...USER_TABS, ADMIN_TAB] : USER_TABS),
    [isAdmin],
  );

  function handleLogin(username: string) {
    setCurrentUser(username);
  }

  function handleLogout() {
    localStorage.removeItem("bmi_pro_current_user");
    setCurrentUser(null);
    setMobileMenuOpen(false);
  }

  function handleResetAllData() {
    if (!currentUser) return;
    for (const key of DATA_KEYS) {
      localStorage.removeItem(`bmi_pro_${currentUser}_${key}`);
    }
    // Legacy key cleanup
    localStorage.removeItem("bmi_data");
    localStorage.removeItem("food_log");
    localStorage.removeItem("fasting_session");
    localStorage.removeItem("week_plan");
    setMobileMenuOpen(false);
    setResetKey((k) => k + 1);
    setActiveTab("bmi");
  }

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-border">
              <img
                src="/assets/generated/heartrate-logo-transparent.dim_256x256.png"
                alt="BMI Pro"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg leading-none neon-text">
                BMI Pro
              </h1>
              <p className="text-xs text-muted-foreground">
                Health &amp; Fitness
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav
            className="hidden lg:flex gap-0.5 flex-wrap"
            data-ocid="nav.section"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  data-ocid={`nav.${tab.id}.link`}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-all ${
                    activeTab === tab.id
                      ? "bg-primary/15 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-xs text-muted-foreground">
              👤 {currentUser}
            </span>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden lg:flex items-center gap-1.5 text-muted-foreground hover:text-orange-400"
                  data-ocid="nav.reset_data.open_modal_button"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent data-ocid="reset_data.dialog">
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset All Data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your BMI history, food logs,
                    step data, fasting logs, water logs, and progress charts.
                    Your account ({currentUser}) will be kept. This cannot be
                    undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-ocid="reset_data.cancel_button">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleResetAllData}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    data-ocid="reset_data.confirm_button"
                  >
                    Yes, Reset Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="hidden lg:flex items-center gap-1.5 text-muted-foreground hover:text-destructive"
              data-ocid="nav.logout.button"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen((p) => !p)}
              data-ocid="nav.mobile_menu.button"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-md max-h-[70vh] overflow-y-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  data-ocid={`nav.mobile.${tab.id}.link`}
                  className={`flex items-center gap-3 w-full px-5 py-3 text-sm transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  data-ocid="nav.mobile_reset.open_modal_button"
                  className="flex items-center gap-3 w-full px-5 py-3 text-sm text-orange-400 hover:bg-orange-500/10 transition-colors border-t border-border"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset All Data
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent data-ocid="reset_data_mobile.dialog">
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset All Data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your BMI history, food logs,
                    step data, fasting logs, water logs, and progress charts.
                    Your account ({currentUser}) will be kept.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-ocid="reset_data_mobile.cancel_button">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleResetAllData}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    data-ocid="reset_data_mobile.confirm_button"
                  >
                    Yes, Reset Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <button
              type="button"
              onClick={handleLogout}
              data-ocid="nav.mobile_logout.button"
              className="flex items-center gap-3 w-full px-5 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors border-t border-border"
            >
              <LogOut className="w-4 h-4" />
              Logout ({currentUser})
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList
            className="lg:hidden flex w-full overflow-x-auto h-auto gap-1 bg-muted/30 p-1 mb-5 rounded-xl scrollbar-hide"
            data-ocid="nav.tabs.section"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-1.5 shrink-0 text-xs px-3 py-2"
                  data-ocid={`nav.tab.${tab.id}.tab`}
                >
                  <Icon className="w-3 h-3" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="bmi" className="mt-0">
            <div className="mb-4">
              <h2 className="font-display font-bold text-2xl">
                BMI Calculator
              </h2>
              <p className="text-sm text-muted-foreground">
                Calculate your Body Mass Index and get personalized health
                guidance
              </p>
            </div>
            <BMITab key={`bmi-${resetKey}`} username={currentUser} />
          </TabsContent>

          <TabsContent value="food" className="mt-0">
            <div className="mb-4">
              <h2 className="font-display font-bold text-2xl">Food Tracker</h2>
              <p className="text-sm text-muted-foreground">
                Track your daily nutrition with full macro breakdown
              </p>
            </div>
            <FoodTrackerTab key={`food-${resetKey}`} username={currentUser} />
          </TabsContent>

          <TabsContent value="recipes" className="mt-0">
            <div className="mb-4">
              <h2 className="font-display font-bold text-2xl">
                Healthy Recipes
              </h2>
              <p className="text-sm text-muted-foreground">
                Browse recipes by cuisine, meal time, and dietary preference
              </p>
            </div>
            <RecipesTab />
          </TabsContent>

          <TabsContent value="exercise" className="mt-0">
            <div className="mb-4">
              <h2 className="font-display font-bold text-2xl">
                Exercise Library
              </h2>
              <p className="text-sm text-muted-foreground">
                Find workouts by level, goal, and category
              </p>
            </div>
            <ExerciseTab />
          </TabsContent>

          <TabsContent value="yoga" className="mt-0">
            <div className="mb-4">
              <h2 className="font-display font-bold text-2xl">
                Yoga &amp; Pranayama
              </h2>
              <p className="text-sm text-muted-foreground">
                Poses, breathing exercises, and goal-based practice
              </p>
            </div>
            <YogaTab />
          </TabsContent>

          <TabsContent value="fasting" className="mt-0">
            <div className="mb-4">
              <h2 className="font-display font-bold text-2xl">
                Fasting Tracker
              </h2>
              <p className="text-sm text-muted-foreground">
                Choose your fasting window and track with a live countdown
              </p>
            </div>
            <FastingTab key={`fasting-${resetKey}`} username={currentUser} />
          </TabsContent>

          <TabsContent value="steps" className="mt-0">
            <div className="mb-4">
              <h2 className="font-display font-bold text-2xl">Step Counter</h2>
              <p className="text-sm text-muted-foreground">
                Track your daily steps, distance, and calories burned from
                walking
              </p>
            </div>
            <StepsTab key={`steps-${resetKey}`} username={currentUser} />
          </TabsContent>

          <TabsContent value="water" className="mt-0">
            <WaterLogTab key={`water-${resetKey}`} username={currentUser} />
          </TabsContent>

          <TabsContent value="progress" className="mt-0">
            <div className="mb-4">
              <h2 className="font-display font-bold text-2xl">Progress</h2>
              <p className="text-sm text-muted-foreground">
                Visualize your BMI, weight, calorie, and step trends over time
              </p>
            </div>
            <ProgressTab key={`progress-${resetKey}`} username={currentUser} />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="admin" className="mt-0">
              <AdminTab />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}
