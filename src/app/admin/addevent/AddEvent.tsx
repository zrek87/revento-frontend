"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function Addevent() {
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date_time: "",
    location: "",
    category: "",
    subcategories: [] as string[],
    price: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCategoryChange = (value: string) => {
    setEventData({ ...eventData, category: value, subcategories: [] });
  };

  const handleSubcategoryChange = (value: string) => {
    const subcategories = eventData.subcategories;
    if (subcategories.includes(value)) {
      setEventData({
        ...eventData,
        subcategories: subcategories.filter((sub) => sub !== value),
      });
    } else {
      if (subcategories.length < 2) {
        setEventData({
          ...eventData,
          subcategories: [...subcategories, value],
        });
      } else {
        toast.error("You can select a maximum of 2 subcategories.");
      }
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !eventData.title ||
      !eventData.description ||
      !eventData.date_time ||
      !eventData.location ||
      !eventData.category ||
      eventData.subcategories.length === 0
    ) {
      toast.error("Please fill all required fields!");
      return;
    }

    const formData = new FormData();
    formData.append("title", eventData.title);
    formData.append("description", eventData.description);
    formData.append("date", eventData.date_time);
    formData.append("location", eventData.location);
    formData.append("category", eventData.category);
    formData.append("subcategory", eventData.subcategories.join(", "));
    formData.append("price", eventData.price);
    if (selectedFile) {
      formData.append("event_photo", selectedFile);
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/routes/events/add_event.php`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success("Event added successfully!");
        setEventData({
          title: "",
          description: "",
          date_time: "",
          location: "",
          category: "",
          subcategories: [],
          price: "",
        });
        setSelectedFile(null);
        setImagePreview(null);
      } else {
        toast.error(`Error: ${data.message}`);
      }
    } catch {
      toast.error("Failed to connect to the server.");
    }
  };

  return (
    <div className="flex flex-col items-center p-6 w-full max-w-3xl">
      <h2 className="text-3xl font-bold text-gray-100 mb-4">Add Event</h2>
      <p className="text-gray-400 mb-4">
        Fill in the details below to add a new event.
      </p>

      <form className="space-y-6 w-full" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            type="text"
            name="title"
            placeholder="Event title"
            value={eventData.title}
            onChange={handleChange}
            required
          />

          <Input
            type="datetime-local"
            name="date_time"
            value={eventData.date_time}
            onChange={handleChange}
            required
          />
        </div>

        <Textarea
          name="description"
          placeholder="Describe the event..."
          value={eventData.description}
          onChange={handleChange}
          required
        />

        <Input
          type="number"
          name="price"
          placeholder="Enter price"
          value={eventData.price}
          onChange={handleChange}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            value={eventData.subcategories[0] || ""}
            onValueChange={handleSubcategoryChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a subcategory" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fine-dining">Fine Dining</SelectItem>
              <SelectItem value="fast-food">Fast Food</SelectItem>
              <SelectItem value="basketball">Basketball</SelectItem>
              <SelectItem value="music">Music</SelectItem>
              <SelectItem value="drama">Drama</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={eventData.category}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="restaurants">Restaurants</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
              <SelectItem value="football">Football</SelectItem>
              <SelectItem value="concerts">Concerts</SelectItem>
              <SelectItem value="theater">Theater</SelectItem>
              <SelectItem value="things-to-do">Things to do</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div
          className="border-2 border-dashed p-6 rounded-lg text-center cursor-pointer hover:border-blue-500"
          onClick={triggerFileInput}
        >
          <p>Click or drag & drop to upload an image</p>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
        </div>

        <AnimatePresence>
          {imagePreview && (
            <motion.div className="mt-4 relative">
              <Image
                src={imagePreview}
                alt="Preview"
                layout="responsive"
                width={300}
                height={200}
                className="rounded-lg"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemoveImage}
              >
                <X className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          type="submit"
          className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600"
        >
          Add Event
        </Button>
      </form>
    </div>
  );
}
