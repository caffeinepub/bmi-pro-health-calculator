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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RotateCcw, Search, Shield, Trash2, Users } from "lucide-react";
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

const DATA_KEYS = [
  "bmi_history",
  "food_logs",
  "step_logs",
  "water_logs",
  "fasting_logs",
  "profile",
];

function getUserDataSummary(username: string) {
  let total = 0;
  for (const key of DATA_KEYS) {
    try {
      const raw = localStorage.getItem(`bmi_pro_${username}_${key}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) total += parsed.length;
        else total += 1;
      }
    } catch {
      // ignore
    }
  }
  return total;
}

function resetUserData(username: string) {
  for (const key of DATA_KEYS) {
    localStorage.removeItem(`bmi_pro_${username}_${key}`);
  }
  // Also legacy keys
  localStorage.removeItem(`bmi_pro_${username}_bmi_history`);
}

function deleteUser(username: string) {
  resetUserData(username);
  const users = getUsers().filter((u) => u.username !== username);
  saveUsers(users);
}

export function AdminTab() {
  const [users, setUsers] = useState<UserRecord[]>(() => getUsers());
  const [search, setSearch] = useState("");

  function refresh() {
    setUsers(getUsers());
  }

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-display font-bold text-xl">Admin Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Manage all registered users
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card className="bg-card border-border">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <div className="text-2xl font-display font-bold">
                {users.length}
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Total Users
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-display font-bold text-primary">
              {users.filter((u) => u.username !== "admin").length}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Regular Users
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border hidden sm:block">
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-display font-bold text-yellow-400">
              1
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Admin Accounts
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          data-ocid="admin.search_input"
        />
      </div>

      {/* User Table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base">
            Registered Users ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table data-ocid="admin.users.table">
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Registered
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Data Entries
                  </TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                      data-ocid="admin.users.empty_state"
                    >
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((user, idx) => (
                    <TableRow
                      key={user.username}
                      data-ocid={`admin.user.row.${idx + 1}`}
                    >
                      <TableCell className="font-medium">
                        {user.username}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                        {new Date(user.registeredAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline" className="text-xs">
                          {getUserDataSummary(user.username)} entries
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.username === "admin" ? (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                            Admin
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-xs text-muted-foreground"
                          >
                            User
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {/* Reset Data */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-orange-400 hover:bg-orange-500/10 text-xs"
                                data-ocid={`admin.user.reset_data.open_modal_button.${idx + 1}`}
                              >
                                <RotateCcw className="w-3 h-3 mr-1" />
                                Reset
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent
                              data-ocid={`admin.reset_user.dialog.${idx + 1}`}
                            >
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Reset data for {user.username}?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will clear all tracked data (BMI history,
                                  food logs, steps, fasting, water logs) for{" "}
                                  <strong>{user.username}</strong>. The account
                                  will be kept. This cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel
                                  data-ocid={`admin.reset_user.cancel_button.${idx + 1}`}
                                >
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    resetUserData(user.username);
                                    refresh();
                                  }}
                                  className="bg-orange-500 text-white hover:bg-orange-600"
                                  data-ocid={`admin.reset_user.confirm_button.${idx + 1}`}
                                >
                                  Reset Data
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          {/* Delete User (not for admin) */}
                          {user.username !== "admin" && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-destructive hover:bg-destructive/10 text-xs"
                                  data-ocid={`admin.user.delete.open_modal_button.${idx + 1}`}
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent
                                data-ocid={`admin.delete_user.dialog.${idx + 1}`}
                              >
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete user {user.username}?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete the account and
                                    all data for{" "}
                                    <strong>{user.username}</strong>. This
                                    cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel
                                    data-ocid={`admin.delete_user.cancel_button.${idx + 1}`}
                                  >
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => {
                                      deleteUser(user.username);
                                      refresh();
                                    }}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    data-ocid={`admin.delete_user.confirm_button.${idx + 1}`}
                                  >
                                    Delete User
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
