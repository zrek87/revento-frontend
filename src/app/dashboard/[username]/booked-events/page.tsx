"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";

interface Event {
  event_id: number;
  title: string;
  date_time: string;
  location: string;
  category: string;
  price: string;
  event_photo: string;
}

export default function BookedEvents() {
  const { username } = useParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserBookedEvents = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}routes/events/get_booked_events.php?username=${username}`
        );
        const data = await response.json();

        if (data.success) {
          setEvents(data.events);
        } else {
          setEvents([]);
        }
      } catch (error) {
        console.error("Error fetching booked events:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchUserBookedEvents();
    }
  }, [username]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Your Booked Events</h1>
      {loading ? (
        <p>Loading events...</p>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <div
              key={event.event_id}
              className="border border-pink-500 p-4 rounded-lg shadow-md"
            >
              <Image
                src={`${process.env.NEXT_PUBLIC_API_BASE}uploads/${event.event_photo}`}
                alt={event.title}
                width={500}
                height={160}
                className="w-full h-40 object-cover rounded"
              />
              <h2 className="text-lg font-semibold mt-2">{event.title}</h2>
              <p className="text-sm text-gray-500">
                {new Date(event.date_time).toLocaleString()}
              </p>
              <p className="text-sm">{event.location}</p>
              <p className="text-sm text-pink-500">{event.category}</p>
              <p className="text-sm font-bold">Price: ${event.price}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No booked events found.</p>
      )}
    </div>
  );
}
