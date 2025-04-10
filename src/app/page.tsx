"use client";

import { useEffect, useState, useMemo } from "react";
import Header from "@/components/layout/Header";
import EventsCarousel from "@/components/Events";
import SoonEvent from "@/components/SoonEvent";

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

export default function Home() {
  const categories = useMemo(
    () => [
      { title: "Sports", slug: "sports" },
      { title: "Restaurants", slug: "restaurants" },
      { title: "Football", slug: "football" },
      { title: "Concerts", slug: "concerts" },
      { title: "Theater", slug: "theater" },
      { title: "Things to Do", slug: "things-to-do" },
    ],
    []
  );

  const [eventsData, setEventsData] = useState<Record<string, Event[]>>({});
  const [latestEvents, setLatestEvents] = useState<Event[]>([]);
  const [recommendedEvents, setRecommendedEvents] = useState<Event[]>([]);
  const [bookedEvents, setBookedEvents] = useState<Set<number>>(new Set());
  const [userUUID, setUserUUID] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const updateUserUUID = () => {
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUserUUID(parsedUser?.user_uuid || null);
        }
      }
    };

    updateUserUUID();
    window.addEventListener("storage", updateUserUUID);
    return () => window.removeEventListener("storage", updateUserUUID);
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      const results: Record<string, Event[]> = {};

      try {
        const latestResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}routes/events/get_events.php?latest=true`
        );
        const latestData = await latestResponse.json();
        if (latestData.success && latestData.events.length > 0) {
          setLatestEvents(
            latestData.events.map((event: Event) => ({
              ...event,
              price: Number(event.price),
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching latest events:", error);
      }

      await Promise.all(
        categories.map(async (category) => {
          try {
            const response = await fetch(
              `${process.env.NEXT_PUBLIC_API_BASE}routes/events/get_events.php?category=${category.slug}`
            );
            const data = await response.json();
            if (data.success && data.events.length > 0) {
              results[category.slug] = data.events.map((event: Event) => ({
                ...event,
                price: Number(event.price),
              }));
            }
          } catch (error) {
            console.error(`Error fetching ${category.title}:`, error);
          }
        })
      );

      setEventsData(results);
      setIsLoading(false);
    };

    fetchEvents();
  }, [categories]);

  useEffect(() => {
    if (!userUUID) return;

    const fetchBookedEvents = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}routes/events/get_booked_events.php?user_uuid=${userUUID}`
        );
        const data = await response.json();
        if (data.success && data.events.length > 0) {
          setBookedEvents(
            new Set(data.events.map((event: Event) => event.event_id))
          );
        }
      } catch (error) {
        console.error("Error fetching booked events:", error);
      }
    };

    fetchBookedEvents();
  }, [userUUID]);

  useEffect(() => {
    if (!userUUID) return;

    const fetchRecommendedEvents = async () => {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}routes/events/recommend_events.php?user_uuid=${userUUID}`
        );
        const data = await response.json();

        if (data.success && data.events.length > 0) {
          const filteredEvents = data.events
            .map((event: Event) => ({
              ...event,
              price: Number(event.price),
            }))
            .filter((event: Event) => !bookedEvents.has(event.event_id));

          setRecommendedEvents(filteredEvents);
        } else {
          console.warn("No recommended events found.");
          setRecommendedEvents([]);
        }
      } catch (error) {
        console.error("Error fetching recommended events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendedEvents();
  }, [userUUID, bookedEvents]);

  return (
    <main className="w-full min-h-screen flex flex-col items-center">
      <Header />

      <SoonEvent
        endpoint={`${process.env.NEXT_PUBLIC_API_BASE}routes/events/get_events.php?latest=true`}
      />

      {userUUID && recommendedEvents.length > 0 && !isLoading ? (
        <EventsCarousel
          title="Recommended for You"
          events={recommendedEvents}
        />
      ) : (
        userUUID &&
        !isLoading && (
          <p className="text-red-400 text-center mt-4">
            No recommendations available, try to run the recommend.py first.
          </p>
        )
      )}

      {latestEvents.length > 0 && (
        <EventsCarousel title="What's New" events={latestEvents.slice(0, 7)} />
      )}

      {categories.map(
        (category) =>
          eventsData[category.slug] &&
          eventsData[category.slug].length > 0 && (
            <div key={category.slug} id={category.slug} className="w-full mt-6">
              <EventsCarousel
                title={category.title}
                events={eventsData[category.slug]}
              />
            </div>
          )
      )}
    </main>
  );
}
