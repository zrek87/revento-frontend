"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  FaUtensils,
  FaFutbol,
  FaMusic,
  FaTheaterMasks,
  FaTrophy,
  FaTicketAlt,
} from "react-icons/fa";
import EventDetailsDrawer from "@/components/EventDetails";

interface Event {
  event_id: number;
  title: string;
  description: string;
  date_time: string;
  location: string;
  category: string;
  price: number;
  event_photo: string;
}

const categories = [
  { name: "Things to do", icon: <FaTicketAlt size={24} /> },
  { name: "Restaurants", icon: <FaUtensils size={24} /> },
  { name: "Football", icon: <FaFutbol size={24} /> },
  { name: "Sports", icon: <FaTrophy size={24} /> },
  { name: "Concerts", icon: <FaMusic size={24} /> },
  { name: "Theater", icon: <FaTheaterMasks size={24} /> },
];

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchEvents = async (query: string) => {
    if (!query.trim()) {
      setEvents([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE
        }routes/events/get_events.php?title=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success && data.events.length > 0) {
        setEvents(data.events);
        setShowDropdown(true);
      } else {
        setEvents([]);
        setShowDropdown(false);
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
      setEvents([]);
      setShowDropdown(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchEvents(searchQuery);
  };

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    setSearchQuery(event.title);
    setShowDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCategoryClick = (slug: string) => {
    const section = document.getElementById(slug);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="w-full py-12 flex flex-col items-center px-6 relative">
      <h1 className="text-3xl font-bold text-center">
        Book the best events, experiences, and shows on{" "}
        <span className="text-pink-500">Revento</span>
      </h1>

      <div className="relative w-full max-w-lg mt-5">
        <Input
          type="text"
          placeholder="Search events by name..."
          className="w-full rounded-lg py-6 px-4 border-gray-300 focus:border-pink-600 focus:ring-pink-600"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            fetchEvents(e.target.value);
          }}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-pink-600 text-white rounded-lg p-3"
          onClick={handleSearch}
        >
          <Search size={20} />
        </Button>

        {showDropdown && events.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute left-0 w-full bg-black/30 backdrop-blur-xl shadow-lg rounded-lg max-h-64 overflow-y-auto z-50 top-full"
          >
            {events.map((event) => (
              <div
                key={event.event_id}
                className="p-3 border-b border-gray-900 hover:bg-pink-700 cursor-pointer flex items-start"
                onClick={() => handleSelectEvent(event)}
              >
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_BASE}uploads/${event.event_photo}`}
                  alt={event.title}
                  width={56} // Equivalent to w-14
                  height={56} // Equivalent to h-14
                  className="rounded-lg object-cover mr-3"
                  unoptimized
                  loading="lazy"
                />
                <div>
                  <p className="text-lg font-semibold">{event.title}</p>
                  <p className="text-sm text-gray-300">
                    {event.location} • {event.date_time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {showDropdown && events.length === 0 && !loading && (
          <div className="absolute mt-2 w-full bg-white shadow-lg rounded-lg p-3 text-gray-500">
            No events found
          </div>
        )}
      </div>

      {/*Category buttons*/}
      <div className="flex flex-wrap justify-center text-center mt-7 w-full">
        {categories.map((cat) => (
          <Card
            key={cat.name}
            className="flex flex-col items-center p-5 cursor-pointer rounded-lg bg-transparent border-none shadow-none text-white transition-all duration-300 hover:bg-pink-700 hover:scale-105 hover:shadow-lg"
            onClick={() =>
              handleCategoryClick(cat.name.toLowerCase().replace(/ /g, "-"))
            }
          >
            <div className="text-white text-2xl transition-colors duration-300">
              {cat.icon}
            </div>
            <span className="text-sm mt-2 text-white transition-colors duration-300">
              {cat.name}
            </span>
          </Card>
        ))}
      </div>

      <EventDetailsDrawer
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
