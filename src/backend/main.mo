import Text "mo:core/Text";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Float "mo:core/Float";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Map "mo:core/Map";

actor {
  // Custom Types & Modules
  type Gender = {
    #male;
    #female;
  };

  type ActivitySpeed = {
    #slow;
    #moderate;
    #fast;
  };

  type UserProfile = {
    age : Nat;
    gender : Gender;
    heightCm : Float;
    weightKg : Float;
    targetWeightKg : Float;
    targetBmi : Float;
  };

  type Food = {
    name : Text;
    category : Text;
    caloriesPer100g : Float;
    servingSizeGrams : Float;
    caloriesPerServing : Float;
  };

  type Activity = {
    name : Text;
    caloriesBurnedPerMinuteSlow : Float;
    caloriesBurnedPerMinuteModerate : Float;
    caloriesBurnedPerMinuteFast : Float;
  };

  type MealEntry = {
    foodName : Text;
    quantityGrams : Float;
    totalCalories : Float;
  };

  type ActivityEntry = {
    activityName : Text;
    durationMinutes : Float;
    speed : ActivitySpeed;
    caloriesBurned : Float;
  };

  type DailyLog = {
    date : Text;
    meals : [MealEntry];
    activities : [ActivityEntry];
    totalCaloriesConsumed : Float;
    totalCaloriesBurned : Float;
  };

  // Compare Functions
  module Food {
    public func compare(food1 : Food, food2 : Food) : Order.Order {
      Text.compare(food1.name, food2.name);
    };
  };

  module Activity {
    public func compare(activity1 : Activity, activity2 : Activity) : Order.Order {
      Text.compare(activity1.name, activity2.name);
    };
  };

  module DailyLog {
    public func compare(log1 : DailyLog, log2 : DailyLog) : Order.Order {
      Text.compare(log1.date, log2.date);
    };
  };

  // Storage
  let userProfiles = Map.empty<Principal, UserProfile>();
  let foodDatabase = Map.empty<Text, Food>();
  let activityDatabase = Map.empty<Text, Activity>();
  let dailyLogs = Map.empty<Principal, [DailyLog]>();

  // User Functions
  public shared ({ caller }) func updateUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile() : async UserProfile {
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found") };
      case (?profile) { profile };
    };
  };

  // Food Functions
  public shared ({ caller }) func addFood(food : Food) : async () {
    foodDatabase.add(food.name, food);
  };

  public query ({ caller }) func getFood(name : Text) : async Food {
    switch (foodDatabase.get(name)) {
      case (null) { Runtime.trap("Food not found") };
      case (?food) { food };
    };
  };

  public query ({ caller }) func getAllFoods() : async [Food] {
    foodDatabase.values().toArray().sort();
  };

  // Activity Functions
  public shared ({ caller }) func addActivity(activity : Activity) : async () {
    activityDatabase.add(activity.name, activity);
  };

  public query ({ caller }) func getActivity(name : Text) : async Activity {
    switch (activityDatabase.get(name)) {
      case (null) { Runtime.trap("Activity not found") };
      case (?activity) { activity };
    };
  };

  public query ({ caller }) func getAllActivities() : async [Activity] {
    activityDatabase.values().toArray().sort();
  };

  // Daily Log Functions
  public shared ({ caller }) func addDailyLog(log : DailyLog) : async () {
    let logs = switch (dailyLogs.get(caller)) {
      case (null) { [log] };
      case (?existingLogs) { existingLogs.concat([log]) };
    };
    dailyLogs.add(caller, logs);
  };

  public query ({ caller }) func getDailyLogs() : async [DailyLog] {
    switch (dailyLogs.get(caller)) {
      case (null) { [] };
      case (?logs) {
        logs.sort();
      };
    };
  };
};
