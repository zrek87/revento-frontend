"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash, ArrowUpDown } from "lucide-react";

type Event = {
  event_id: number;
  title: string;
  description: string;
  date_time: string;
  location: string;
  category: string;
  price: string;
  event_photo: string | null;
};

export default function ManageEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Event | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const router = useRouter();

  //Fetch events from the backend
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}routes/events/get_events.php`
      );
      const data = await response.json();
      if (data.success) {
        setEvents(data.events);
        setFilteredEvents(data.events);
      } else {
        console.error("Failed to fetch events:", data.message);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = events.filter(
      (event) =>
        event.title?.toLowerCase().includes(value) ||
        event.location?.toLowerCase().includes(value) ||
        event.category?.toLowerCase().includes(value)
    );
    setFilteredEvents(filtered);
  };

  const handleSort = (field: keyof Event) => {
    if (!filteredEvents || filteredEvents.length === 0) return;

    let order: "asc" | "desc" = "asc";
    if (sortField === field && sortOrder === "asc") {
      order = "desc";
    }
    setSortField(field);
    setSortOrder(order);

    const sortedEvents = [...filteredEvents].sort((a, b) => {
      const aValue = a[field] ?? "";
      const bValue = b[field] ?? "";

      if (field === "price") {
        return order === "asc"
          ? parseFloat(aValue.toString()) - parseFloat(bValue.toString())
          : parseFloat(bValue.toString()) - parseFloat(aValue.toString());
      } else if (field === "date_time") {
        return order === "asc"
          ? new Date(aValue.toString()).getTime() -
              new Date(bValue.toString()).getTime()
          : new Date(bValue.toString()).getTime() -
              new Date(aValue.toString()).getTime();
      } else {
        return order === "asc"
          ? aValue.toString().localeCompare(bValue.toString())
          : bValue.toString().localeCompare(aValue.toString());
      }
    });

    setFilteredEvents(sortedEvents);
  };

  const handleDelete = async (eventId: number) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}routes/events/delete_event.php`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event_id: eventId }),
        }
      );

      const data = await response.json();
      if (data.success) {
        alert("Event deleted successfully!");
        fetchEvents();
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  //Navigate to Edit Page
  const handleEdit = (eventId: number) => {
    router.push(`/admin/manageevents/${eventId}`);
  };

  return (
    <div className="p-6 w-full max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-100 mb-4">Manage Events</h2>

      <Input
        type="text"
        placeholder="Search by title, location, or category..."
        value={searchTerm}
        onChange={handleSearch}
        className="mb-4 p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring focus:ring-blue-500 transition-all"
      />

      <div className="bg-gray-800 text-white rounded-lg p-4">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-700">
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("title")}
              >
                Title <ArrowUpDown className="inline w-4 h-4 ml-1" />
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("date_time")}
              >
                Date & Time <ArrowUpDown className="inline w-4 h-4 ml-1" />
              </TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Category</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("price")}
              >
                Price <ArrowUpDown className="inline w-4 h-4 ml-1" />
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <TableRow key={event?.event_id}>
                  <TableCell>{event?.title ?? "No Title"}</TableCell>
                  <TableCell>
                    {event?.date_time
                      ? new Date(event.date_time).toLocaleString()
                      : "No Date"}
                  </TableCell>
                  <TableCell>{event?.location ?? "No Location"}</TableCell>
                  <TableCell>{event?.category ?? "No Category"}</TableCell>
                  <TableCell>${event?.price ?? "0.00"}</TableCell>
                  <TableCell className="flex gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2 text-black"
                      onClick={() => handleEdit(event?.event_id ?? 0)}
                    >
                      <Pencil className="w-4 h-4 text-black" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex items-center gap-2"
                      onClick={() => handleDelete(event?.event_id ?? 0)}
                    >
                      <Trash className="w-4 h-4" /> Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No events found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
