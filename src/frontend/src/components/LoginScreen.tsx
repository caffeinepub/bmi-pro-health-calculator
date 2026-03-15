import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { useState } from "react";

interface UserRecord {
  username: string;
  password: string;
  registeredAt: string;
}

function getUsers(): UserRecord[] {
  try {
    const raw = localStorage.getItem("bmi_pro_users");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: UserRecord[]) {
  localStorage.setItem("bmi_pro_users", JSON.stringify(users));
}

function ensureAdmin() {
  const users = getUsers();
  if (!users.find((u) => u.username === "admin")) {
    users.push({
      username: "admin",
      password: "admin2610",
      registeredAt: new Date().toISOString(),
    });
    saveUsers(users);
  }
}

ensureAdmin();

interface LoginScreenProps {
  onLogin: (username: string) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter username and password.");
      return;
    }

    const users = getUsers();

    if (mode === "login") {
      const user = users.find(
        (u) => u.username === username && u.password === password,
      );
      if (!user) {
        setError("Invalid username or password.");
        return;
      }
      localStorage.setItem("bmi_pro_current_user", username);
      onLogin(username);
    } else {
      if (users.find((u) => u.username === username)) {
        setError("Username already exists. Please choose another.");
        return;
      }
      if (password.length < 4) {
        setError("Password must be at least 4 characters.");
        return;
      }
      users.push({
        username: username.trim(),
        password,
        registeredAt: new Date().toISOString(),
      });
      saveUsers(users);
      setSuccess("Account created! Logging you in...");
      setTimeout(() => {
        localStorage.setItem("bmi_pro_current_user", username);
        onLogin(username);
      }, 800);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-xl border-2 border-primary/30">
              <img
                src="/assets/uploads/Screenshot-2026-03-15-022225-1.png"
                alt="BMI Pro Logo"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <h1 className="font-display font-bold text-3xl neon-text mb-2">
            BMI Pro
          </h1>
          <p className="text-muted-foreground text-sm">
            Your complete health &amp; fitness companion
          </p>
        </div>

        <Card className="bg-card border-border shadow-card">
          <CardHeader className="pb-4">
            <div className="flex rounded-lg bg-muted/30 p-1 gap-1">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
                data-ocid="login.login.tab"
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                  mode === "login"
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError("");
                }}
                data-ocid="login.signup.tab"
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                  mode === "signup"
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign Up
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="pl-9"
                    data-ocid="login.username.input"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="pl-9 pr-10"
                    data-ocid="login.password.input"
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2"
                  data-ocid="login.error_state"
                >
                  {error}
                </div>
              )}

              {success && (
                <div
                  className="text-sm text-primary bg-primary/10 border border-primary/20 rounded-lg px-3 py-2"
                  data-ocid="login.success_state"
                >
                  {success}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bmi-gradient font-semibold"
                data-ocid="login.submit_button"
              >
                {mode === "login" ? "Login" : "Create Account"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
