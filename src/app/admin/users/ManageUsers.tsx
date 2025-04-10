"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import {
  Loader2,
  Trash2,
  User,
  UserMinus,
  UserPlus,
  Search,
} from "lucide-react";

interface User {
  uuid: string;
  username: string;
  email: string;
  role: string;
}

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE}routes/admin/get_users.php`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUsers(data.users);
        }
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setError(error.message);
      })
      .finally(() => setLoading(false));
  }, []);

  //Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const changeUserRole = async (uuid: string, newRole: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}routes/admin/change_role.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ uuid: uuid.toLowerCase(), role: newRole }),
        }
      );

      const result = await response.json();
      if (result.success) {
        toast.success("User role updated successfully.");
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.uuid === uuid ? { ...user, role: newRole } : user
          )
        );
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error changing role:", error);
      toast.error("Failed to update user role.");
    }
  };

  const deleteUser = async (uuid: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}routes/admin/delete_user.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ uuid: uuid.toLowerCase() }),
        }
      );

      const result = await response.json();
      if (result.success) {
        toast.success("User deleted successfully.");
        setUsers((prevUsers) => prevUsers.filter((user) => user.uuid !== uuid));
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user.");
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <Card className="w-full max-w-4xl bg-gray-800 text-white shadow-lg border border-gray-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold flex items-center gap-2 text-gray-100">
              <User className="w-6 h-6 text-blue-400" />
              Manage Users
            </CardTitle>

            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search users..."
                className="pl-8 w-64 bg-gray-700 text-gray-300 border border-gray-600 focus:ring focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-gray-400 mb-4">List, update, or remove users.</p>

          {loading ? (
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
            </div>
          ) : error ? (
            <p className="text-red-400 text-center">{error}</p>
          ) : filteredUsers.length === 0 ? (
            <p className="text-gray-400 text-center">No users found.</p>
          ) : (
            <Table className="border-collapse border border-gray-700">
              <TableHeader className="bg-gray-700">
                <TableRow>
                  <TableHead className="text-gray-300">Username</TableHead>
                  <TableHead className="text-gray-300">Email</TableHead>
                  <TableHead className="text-gray-300">Role</TableHead>
                  <TableHead className="text-right text-gray-300">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow
                    key={u.uuid}
                    className="border-b border-gray-700 hover:bg-gray-700/50 transition"
                  >
                    <TableCell className="font-medium text-gray-100">
                      {u.username}
                    </TableCell>
                    <TableCell className="text-gray-400">{u.email}</TableCell>
                    <TableCell className="text-gray-300">{u.role}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-500 text-black hover:bg-gray-500"
                        onClick={() =>
                          changeUserRole(
                            u.uuid,
                            u.role === "admin" ? "user" : "admin"
                          )
                        }
                      >
                        {u.role === "admin" ? (
                          <>
                            <UserMinus className="w-4 h-4 mr-1" /> Demote
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 mr-1" /> Promote
                          </>
                        )}
                      </Button>

                      {/* Delete User Button */}
                      {u.role !== "admin" && (
                        <AlertDialog
                          open={openDialogId === u.uuid}
                          onOpenChange={(open) =>
                            setOpenDialogId(open ? u.uuid : null)
                          }
                        >
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setOpenDialogId(u.uuid)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-gray-800 text-white border border-gray-700">
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <p className="text-gray-300">
                              This action cannot be undone.
                            </p>
                            <AlertDialogFooter>
                              <Button
                                variant="ghost"
                                className="text-gray-300 border-gray-500"
                                onClick={() => setOpenDialogId(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => {
                                  deleteUser(u.uuid);
                                  setOpenDialogId(null);
                                }}
                              >
                                Yes, Delete
                              </Button>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
