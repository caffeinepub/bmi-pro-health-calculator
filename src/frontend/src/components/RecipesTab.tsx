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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cuisines, mealTimes, recipes } from "@/data/recipes";
import type { Recipe } from "@/data/recipes";
import { ChefHat, Clock, Users } from "lucide-react";
import { useMemo, useState } from "react";

export function RecipesTab() {
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [selectedMeal, setSelectedMeal] = useState<string>("All");
  const [selectedTag, setSelectedTag] = useState("All");
  const [viewRecipe, setViewRecipe] = useState<Recipe | null>(null);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    for (const r of recipes) {
      for (const t of r.tags) {
        tags.add(t);
      }
    }
    return ["All", ...Array.from(tags).sort()];
  }, []);

  const filtered = useMemo(
    () =>
      recipes.filter((r) => {
        const matchC =
          selectedCuisine === "All" || r.cuisine === selectedCuisine;
        const matchM = selectedMeal === "All" || r.mealTime === selectedMeal;
        const matchT = selectedTag === "All" || r.tags.includes(selectedTag);
        return matchC && matchM && matchT;
      }),
    [selectedCuisine, selectedMeal, selectedTag],
  );

  const MacroChip = ({
    label,
    value,
    unit,
  }: { label: string; value: number; unit: string }) => (
    <div className="bg-muted/40 rounded p-2 text-center">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-semibold text-sm">
        {value}
        {unit}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Hero Image */}
      <div className="rounded-xl overflow-hidden relative h-36 sm:h-48 mb-2">
        <img
          src="/assets/generated/recipes-hero.dim_800x400.jpg"
          alt="Recipes"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent flex items-end p-4">
          <div>
            <h2 className="font-display font-bold text-2xl text-white">
              Healthy Recipes 🍽️
            </h2>
            <p className="text-white/80 text-sm">
              Indian, Regional & Global Cuisines
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Select value={selectedCuisine} onValueChange={setSelectedCuisine}>
          <SelectTrigger className="w-40" data-ocid="recipes.cuisine.select">
            <SelectValue placeholder="Cuisine" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Cuisines</SelectItem>
            {cuisines.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedMeal} onValueChange={setSelectedMeal}>
          <SelectTrigger className="w-36" data-ocid="recipes.meal_time.select">
            <SelectValue placeholder="Meal Time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Meals</SelectItem>
            {mealTimes.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedTag} onValueChange={setSelectedTag}>
          <SelectTrigger className="w-40" data-ocid="recipes.tag.select">
            <SelectValue placeholder="Diet" />
          </SelectTrigger>
          <SelectContent>
            {allTags.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="text-sm text-muted-foreground">
        {filtered.length} recipes found
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((recipe, idx) => (
          <Card
            key={recipe.id}
            className="bg-card border-border card-hover"
            data-ocid={`recipes.recipe.item.${idx + 1}`}
          >
            <div className="relative h-36 overflow-hidden rounded-t-lg">
              <img
                src={recipe.image}
                alt={recipe.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
            </div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-sm font-display leading-tight">
                  {recipe.name}
                </CardTitle>
                <Badge variant="outline" className="text-xs shrink-0">
                  {recipe.mealTime}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {recipe.prepTime}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {recipe.servings} servings
                </span>
                <span className="flex items-center gap-1">
                  <ChefHat className="w-3 h-3" />
                  {recipe.cuisine}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-1 mb-3">
                <MacroChip label="Cal" value={recipe.calories} unit="" />
                <MacroChip label="Protein" value={recipe.protein} unit="g" />
                <MacroChip label="Carbs" value={recipe.carbs} unit="g" />
                <MacroChip label="Fat" value={recipe.fat} unit="g" />
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {recipe.tags.slice(0, 3).map((t) => (
                  <Badge
                    key={t}
                    className="text-xs bg-primary/10 text-primary border-primary/20"
                  >
                    {t}
                  </Badge>
                ))}
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => setViewRecipe(recipe)}
                    data-ocid={`recipes.view.open_modal_button.${idx + 1}`}
                  >
                    View Recipe
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{viewRecipe?.name}</DialogTitle>
                  </DialogHeader>
                  {viewRecipe && (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-1">
                        {viewRecipe.tags.map((t) => (
                          <Badge
                            key={t}
                            className="text-xs bg-primary/10 text-primary border-primary/20"
                          >
                            {t}
                          </Badge>
                        ))}
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        <MacroChip
                          label="Calories"
                          value={viewRecipe.calories}
                          unit=" kcal"
                        />
                        <MacroChip
                          label="Protein"
                          value={viewRecipe.protein}
                          unit="g"
                        />
                        <MacroChip
                          label="Carbs"
                          value={viewRecipe.carbs}
                          unit="g"
                        />
                        <MacroChip
                          label="Fat"
                          value={viewRecipe.fat}
                          unit="g"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <MacroChip
                          label="Fiber"
                          value={viewRecipe.fiber}
                          unit="g"
                        />
                        <MacroChip
                          label="Sugar"
                          value={viewRecipe.sugar}
                          unit="g"
                        />
                        <MacroChip
                          label="Sodium"
                          value={viewRecipe.sodium}
                          unit="mg"
                        />
                      </div>
                      <div>
                        <h4 className="font-display font-semibold mb-2">
                          Ingredients
                        </h4>
                        <ul className="space-y-1">
                          {viewRecipe.ingredients.map((ing) => (
                            <li
                              key={ing}
                              className="flex items-start gap-2 text-sm"
                            >
                              <span className="text-primary mt-0.5">•</span>
                              <span className="text-muted-foreground">
                                {ing}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-display font-semibold mb-2">
                          Instructions
                        </h4>
                        <ol className="space-y-2">
                          {viewRecipe.instructions.map((step, i) => (
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
          data-ocid="recipes.list.empty_state"
        >
          <div className="text-4xl mb-3">🍳</div>
          <p>No recipes match your filters. Try different options.</p>
        </div>
      )}
    </div>
  );
}
