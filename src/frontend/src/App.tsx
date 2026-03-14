import { BMITab } from "@/components/BMITab";
import { ExerciseTab } from "@/components/ExerciseTab";
import { FastingTab } from "@/components/FastingTab";
import { FoodTrackerTab } from "@/components/FoodTrackerTab";
import { ProgressTab } from "@/components/ProgressTab";
import { RecipesTab } from "@/components/RecipesTab";
import { StepsTab } from "@/components/StepsTab";
import { YogaTab } from "@/components/YogaTab";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  BarChart2,
  BookOpen,
  Dumbbell,
  Footprints,
  Menu,
  Timer,
  UtensilsCrossed,
  Wind,
  X,
} from "lucide-react";
import { useState } from "react";

const tabs = [
  { id: "bmi", label: "BMI", icon: Activity },
  { id: "food", label: "Food Tracker", icon: UtensilsCrossed },
  { id: "recipes", label: "Recipes", icon: BookOpen },
  { id: "exercise", label: "Exercise", icon: Dumbbell },
  { id: "yoga", label: "Yoga", icon: Wind },
  { id: "fasting", label: "Fasting", icon: Timer },
  { id: "steps", label: "Steps", icon: Footprints },
  { id: "progress", label: "Progress", icon: BarChart2 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("bmi");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bmi-gradient flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg leading-none neon-text">
                BMI Pro
              </h1>
              <p className="text-xs text-muted-foreground">
                Health & Fitness Calculator
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex gap-1" data-ocid="nav.section">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  data-ocid={`nav.${tab.id}.link`}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all ${
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

          {/* Mobile menu button */}
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

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-md">
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
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Tab triggers hidden on desktop (using custom nav), shown on mobile as scrollable list */}
          <TabsList
            className="lg:hidden flex w-full overflow-x-auto h-auto gap-1 bg-muted/30 p-1 mb-5 rounded-xl"
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
            <BMITab />
          </TabsContent>

          <TabsContent value="food" className="mt-0">
            <div className="mb-4">
              <h2 className="font-display font-bold text-2xl">Food Tracker</h2>
              <p className="text-sm text-muted-foreground">
                Track your daily nutrition with full macro breakdown
              </p>
            </div>
            <FoodTrackerTab />
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
                Yoga & Pranayama
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
            <FastingTab />
          </TabsContent>

          <TabsContent value="steps" className="mt-0">
            <div className="mb-4">
              <h2 className="font-display font-bold text-2xl">Step Counter</h2>
              <p className="text-sm text-muted-foreground">
                Track your daily steps, distance, and calories burned from
                walking
              </p>
            </div>
            <StepsTab />
          </TabsContent>

          <TabsContent value="progress" className="mt-0">
            <div className="mb-4">
              <h2 className="font-display font-bold text-2xl">Progress</h2>
              <p className="text-sm text-muted-foreground">
                Visualize your BMI, weight, calorie, and step trends over time
              </p>
            </div>
            <ProgressTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
