"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type EventFormData = {
  title: string;
  description: string;
  date_time: string;
  location: string;
  category: string;
  price: string;
};

export default function EditEventPage() {
  const router = useRouter();
  const { id } = useParams();

  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    date_time: "",
    location: "",
    category: "",
    price: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [oldImage, setOldImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      try {
        const response = await fetch(
          `http://localhost/revento-backend/routes/events/get_events.php?id=${id}`
        );
        const data = await response.json();
        if (data.success) {
          setFormData({
            title: data.event.title,
            description: data.event.description,
            date_time: data.event.date_time,
            location: data.event.location,
            category: data.event.category,
            price: data.event.price,
          });

          if (data.event.event_photo) {
            setOldImage(
              `http://localhost/revento-backend/uploads/${data.event.event_photo}`
            );
          }
        } else {
          console.error("Error fetching event:", data.message);
        }
      } catch (error) {
        console.error("Error fetching event:", error);
      }
    };

    fetchEvent();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setOldImage(null);
    }
  };

  const handleRemoveOldImage = () => {
    setOldImage(null);
    setSelectedFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formDataObj = new FormData();
    formDataObj.append("event_id", id as string);
    formDataObj.append("title", formData.title);
    formDataObj.append("description", formData.description);
    formDataObj.append("date_time", formData.date_time);
    formDataObj.append("location", formData.location);
    formDataObj.append("category", formData.category);
    formDataObj.append("price", formData.price);

    if (selectedFile) {
      formDataObj.append("event_photo", selectedFile);
    } else if (!oldImage) {
      formDataObj.append("remove_photo", "true");
    }

    try {
      const response = await fetch(
        "http://localhost/revento-backend/routes/events/update_event.php",
        {
          method: "POST",
          body: formDataObj,
        }
      );
      const data = await response.json();
      if (data.success) {
        alert("Event updated successfully!");
        router.push("/admin/manageevents");
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  return (
    <div className="p-6 w-full max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-100 mb-4">Edit Event</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          type="text"
          name="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
        <Textarea
          name="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
        />
        <Input
          type="datetime-local"
          name="date_time"
          value={formData.date_time}
          onChange={(e) =>
            setFormData({ ...formData, date_time: e.target.value })
          }
          required
        />
        <Input
          type="text"
          name="location"
          value={formData.location}
          onChange={(e) =>
            setFormData({ ...formData, location: e.target.value })
          }
          required
        />
        <Input
          type="text"
          name="category"
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          required
        />
        <Input
          type="number"
          name="price"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          required
        />

        <div
          className="border-2 border-dashed border-gray-600 p-6 rounded-lg text-center cursor-pointer hover:border-blue-500 transition-all"
          onClick={() => fileInputRef.current?.click()}
        >
          <p className="text-gray-400">
            Click or drag & drop to upload a new image
          </p>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
        </div>

        <div className="mt-4 relative">
          {imagePreview ? (
            <>
              <p className="text-gray-300">New Image Preview:</p>
              <Image
                src={imagePreview}
                alt="New Preview"
                width={500}
                height={200}
                className="w-full h-48 object-cover rounded-lg border border-gray-600"
              />
            </>
          ) : oldImage ? (
            <>
              <p className="text-gray-300">Current Event Image:</p>
              <Image
                src={oldImage}
                alt="Old Preview"
                width={500}
                height={200}
                className="w-full h-48 object-cover rounded-lg border border-gray-600"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700"
                onClick={handleRemoveOldImage}
              >
                <X className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <p className="text-gray-400">No image uploaded yet.</p>
          )}
        </div>

        <Button type="submit" className="w-full bg-blue-500 text-white">
          Update Event
        </Button>
      </form>
    </div>
  );
}
