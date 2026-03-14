import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Activity {
    caloriesBurnedPerMinuteModerate: number;
    name: string;
    caloriesBurnedPerMinuteFast: number;
    caloriesBurnedPerMinuteSlow: number;
}
export interface MealEntry {
    totalCalories: number;
    quantityGrams: number;
    foodName: string;
}
export interface DailyLog {
    meals: Array<MealEntry>;
    date: string;
    activities: Array<ActivityEntry>;
    totalCaloriesBurned: number;
    totalCaloriesConsumed: number;
}
export interface Food {
    servingSizeGrams: number;
    caloriesPerServing: number;
    name: string;
    caloriesPer100g: number;
    category: string;
}
export interface ActivityEntry {
    activityName: string;
    speed: ActivitySpeed;
    durationMinutes: number;
    caloriesBurned: number;
}
export interface UserProfile {
    age: bigint;
    heightCm: number;
    targetBmi: number;
    weightKg: number;
    targetWeightKg: number;
    gender: Gender;
}
export enum ActivitySpeed {
    fast = "fast",
    slow = "slow",
    moderate = "moderate"
}
export enum Gender {
    female = "female",
    male = "male"
}
export interface backendInterface {
    addActivity(activity: Activity): Promise<void>;
    addDailyLog(log: DailyLog): Promise<void>;
    addFood(food: Food): Promise<void>;
    getActivity(name: string): Promise<Activity>;
    getAllActivities(): Promise<Array<Activity>>;
    getAllFoods(): Promise<Array<Food>>;
    getDailyLogs(): Promise<Array<DailyLog>>;
    getFood(name: string): Promise<Food>;
    getUserProfile(): Promise<UserProfile>;
    updateUserProfile(profile: UserProfile): Promise<void>;
}
