"use client";

import { useState, useCallback, useEffect } from "react";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogTitle } from "@/components/ui/dialog";
import {
  CheckCircle,
  Utensils,
  Music,
  Theater,
  List,
  Users,
  Heart,
  Goal,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

interface PreferencesDrawerProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  userId: string | null;
  setUserId: (id: string) => void;
  formData: {
    fullname: string;
    username: string;
    email: string;
    password: string;
  };
}

const cities = ["Riyadh", "Dammam", "Khobar", "Jeddah"];

const interests = [
  { name: "Restaurants", icon: <Utensils size={20} /> },
  { name: "Sport", icon: <CheckCircle size={20} /> },
  { name: "Football", icon: <Goal size={20} /> },
  { name: "Concerts", icon: <Music size={20} /> },
  { name: "Theater", icon: <Theater size={20} /> },
  { name: "Things to Do", icon: <List size={20} /> },
];

const activitiesOptions = [
  { name: "Kids Activities", icon: <Users size={20} /> },
  { name: "Families Activities", icon: <Users size={20} /> },
  { name: "Solo Activities", icon: <Heart size={20} /> },
  { name: "Ladies Activities", icon: <Heart size={20} /> },
  { name: "Couples Activities", icon: <Heart size={20} /> },
];

export default function PreferencesDrawer({
  open,
  setOpen,
  setUserId,
  formData,
}: PreferencesDrawerProps) {
  const [city, setCity] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser?.user_uuid) {
        setUserId(parsedUser.user_uuid);
      }
    }
  }, [setUserId]);

  const handleMultiSelect = (
    setState: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) => {
    setState((prev: string[]) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : prev.length < 2
        ? [...prev, value]
        : prev
    );
  };

  const handleSubmit = useCallback(async () => {
    setLoading(true);

    if (!city) {
      toast.error("Please select your city.");
      setLoading(false);
      return;
    }
    if (categories.length === 0) {
      toast.error("Please select at least one category.");
      setLoading(false);
      return;
    }
    if (subcategories.length === 0) {
      toast.error("Please select at least one subcategory.");
      setLoading(false);
      return;
    }

    try {
      console.log("Submitting signup request...", formData);

      // Call Signup API first
      const { data: signupData } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE}routes/auth/signup.php`,
        formData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      console.log("Signup API Response:", signupData);

      if (!signupData.success || !signupData.user_id) {
        throw new Error(signupData.message || "Signup failed.");
      }

      const newUserId = signupData.user_id.trim().toLowerCase();
      console.log("Newly Created User ID:", newUserId);

      if (!newUserId || typeof newUserId !== "string") {
        throw new Error("Signup success but user ID is invalid.");
      }

      localStorage.setItem(
        "user",
        JSON.stringify({
          user_uuid: newUserId,
          username: formData.username,
          fullname: formData.fullname,
          email: formData.email,
        })
      );

      document.cookie = `auth_token=${signupData.token}; path=/; secure; samesite=strict`;

      // Ensure the state updates properly before proceeding
      await setUserId(newUserId);

      console.log("User ID stored successfully. Proceeding to preferences...");

      // Ensure categories and subcategories are arrays and trimmed properly
      const formattedCategories = categories
        .slice(0, 2)
        .map((cat) => cat.trim());
      const formattedSubcategories = subcategories
        .slice(0, 2)
        .map((sub) => sub.trim());

      // Call Preferences API only after storing user ID
      const requestData = {
        user_id: newUserId,
        city,
        categories: formattedCategories,
        subcategories: formattedSubcategories,
      };

      console.log("Submitting preferences request:", requestData);

      const { data: preferencesData } = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE}routes/auth/update_preferences.php`,
        requestData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      console.log("Preferences API Response:", preferencesData);

      if (!preferencesData.success) {
        throw new Error(preferencesData.message || "Error saving preferences.");
      }

      toast.success("Signup & Preferences saved successfully! 🎉");

      await new Promise((resolve) => setTimeout(resolve, 1500));
      setOpen(false);
      window.location.href = "/";
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong.";
      console.error("Error during signup:", error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [city, categories, subcategories, formData, setOpen, setUserId]);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button className="hidden">Open Preferences</Button>
      </DrawerTrigger>
      <DrawerContent className="p-6 bg-black/20 backdrop-blur-xl rounded-t-2xl">
        <DialogTitle className="text-xl font-bold mb-4 text-white">
          Complete Your Profile
        </DialogTitle>

        <div className="mb-4">
          <label className="block font-semibold mb-1 text-white">
            Select Your City
          </label>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="bg-gray-800 text-white border-gray-600">
              <SelectValue placeholder="Choose a city" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 text-white border-gray-700">
              {cities.map((city) => (
                <SelectItem
                  key={city}
                  value={city}
                  className="hover:bg-gray-700"
                >
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-1 text-white">
            Choose At Least 1 Category
          </label>
          <div className="grid grid-cols-3 gap-3">
            {interests.map((option) => (
              <button
                key={option.name}
                onClick={() => handleMultiSelect(setCategories, option.name)}
                className={`flex items-center justify-center space-x-2 border rounded-lg p-2 transition-all ${
                  categories.includes(option.name)
                    ? "bg-blue-500 text-white shadow-lg"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                {option.icon}
                <span>{option.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-1 text-white">
            Choose At Least 1 Subcategory
          </label>
          <div className="grid grid-cols-3 gap-3">
            {activitiesOptions.map((option) => (
              <button
                key={option.name}
                onClick={() => handleMultiSelect(setSubcategories, option.name)}
                className={`flex items-center justify-center space-x-2 border rounded-lg p-2 transition-all ${
                  subcategories.includes(option.name)
                    ? "bg-green-500 text-white shadow-lg"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                {option.icon}
                <span>{option.name}</span>
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-4 bg-gradient-to-r from-purple-400 to-orange-400 py-3 rounded-lg font-semibold transition-all"
        >
          {loading ? "Saving..." : "Save & Continue"}
        </Button>
      </DrawerContent>
    </Drawer>
  );
}
