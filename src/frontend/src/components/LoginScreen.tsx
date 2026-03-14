import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, Eye, EyeOff, Lock, User } from "lucide-react";
import { useState } from "react";

interface LoginScreenProps {
  onLogin: (username: string) => void;
}

interface Account {
  username: string;
  password: string;
}

function getAccounts(): Account[] {
  try {
    return JSON.parse(localStorage.getItem("bmi_accounts") || "[]");
  } catch {
    return [];
  }
}

function saveAccounts(accounts: Account[]) {
  localStorage.setItem("bmi_accounts", JSON.stringify(accounts));
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Both fields are required.");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const accounts = getAccounts();

      if (mode === "signup") {
        const exists = accounts.find(
          (a) => a.username.toLowerCase() === username.trim().toLowerCase(),
        );
        if (exists) {
          setError("Username already taken. Please choose another.");
          setLoading(false);
          return;
        }
        accounts.push({ username: username.trim(), password });
        saveAccounts(accounts);
        localStorage.setItem("bmi_current_user", username.trim());
        onLogin(username.trim());
      } else {
        const account = accounts.find(
          (a) =>
            a.username.toLowerCase() === username.trim().toLowerCase() &&
            a.password === password,
        );
        if (!account) {
          setError("Invalid username or password.");
          setLoading(false);
          return;
        }
        localStorage.setItem("bmi_current_user", account.username);
        onLogin(account.username);
      }
      setLoading(false);
    }, 400);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[-10%] right-[-5%] w-96 h-96 rounded-full opacity-10"
          style={{
            background: "oklch(0.78 0.22 145 / 0.3)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute bottom-[-10%] left-[-5%] w-80 h-80 rounded-full opacity-10"
          style={{
            background: "oklch(0.72 0.18 200 / 0.3)",
            filter: "blur(80px)",
          }}
        />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bmi-gradient flex items-center justify-center mb-4 shadow-lg">
            <Activity className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="font-display font-bold text-3xl neon-text tracking-tight">
            BMI Pro
          </h1>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            Health &amp; Fitness Calculator
          </p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-6 shadow-xl">
          {/* Mode toggle */}
          <div className="flex bg-muted/40 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              data-ocid="login.login.tab"
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === "login"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError("");
              }}
              data-ocid="login.signup.tab"
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === "signup"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-9"
                  autoComplete="username"
                  data-ocid="login.username.input"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10"
                  autoComplete={
                    mode === "signup" ? "new-password" : "current-password"
                  }
                  data-ocid="login.password.input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  data-ocid="login.show_password.toggle"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p
                className="text-destructive text-sm py-2 px-3 rounded-lg bg-destructive/10"
                data-ocid="login.error_state"
              >
                {error}
              </p>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className="w-full font-semibold"
              disabled={loading}
              data-ocid="login.submit_button"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                  {mode === "login" ? "Logging in..." : "Creating account..."}
                </span>
              ) : mode === "login" ? (
                "Log In"
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {mode === "login" && (
            <p className="text-center text-xs text-muted-foreground mt-4">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError("");
                }}
                className="text-primary hover:underline font-medium"
                data-ocid="login.goto_signup.link"
              >
                Sign up free
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
