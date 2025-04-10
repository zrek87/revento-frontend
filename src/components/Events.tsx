"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import EventDetailsDrawer from "@/components/EventDetails";

interface Event {
  event_id: number;
  title: string;
  description: string;
  date_time: string;
  location: string;
  category: string;
  price: number;
  event_photo?: string;
  is_booked?: boolean;
}

const EventsCarousel = ({
  title,
  endpoint,
  events: initialEvents = [],
}: {
  title: string;
  endpoint?: string;
  events?: Event[];
}) => {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [bookedEventIds] = useState<Set<number>>(new Set());
  const [username, setUsername] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.username) {
        setUsername(parsedUser.username);
      }
    }
  }, []);

  useEffect(() => {
    if (endpoint) {
      fetch(endpoint)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setEvents(data.events);
          }
        })
        .catch((error) => console.error(`Error fetching ${title}:`, error));
    }
  }, [endpoint, title]);

  useEffect(() => {
    if (!username) return;

    const fetchBookedEvents = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}routes/events/get_booked_events.php?username=${username}`
        );
        const data = await response.json();

        if (data.success) {
          new Set(data.events.map((event: Event) => event.event_id));
        }
      } catch (error) {
        console.error("Error fetching booked events:", error);
      }
    };

    fetchBookedEvents();
  }, [username]);

  const openEventDetails = (event: Event) => {
    setSelectedEvent({
      ...event,
      is_booked: bookedEventIds.has(event.event_id),
    });
  };

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  //Handle Mouse & Touch Dragging
  const startDragging = (e: React.MouseEvent | React.TouchEvent) => {
    if (!carouselRef.current) return;
    isDragging.current = true;
    startX.current =
      e.type === "touchstart"
        ? (e as React.TouchEvent).touches[0].pageX
        : (e as React.MouseEvent).pageX;
    scrollLeft.current = carouselRef.current.scrollLeft;
    carouselRef.current.style.scrollBehavior = "auto";
  };

  const dragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging.current || !carouselRef.current) return;

    const x =
      e.type === "touchmove"
        ? (e as React.TouchEvent).touches[0].pageX
        : (e as React.MouseEvent).pageX;
    const delta = x - startX.current;
    carouselRef.current.scrollLeft = scrollLeft.current - delta;
  };

  const stopDragging = () => {
    if (!carouselRef.current) return;
    isDragging.current = false;
    carouselRef.current.style.scrollBehavior = "smooth";
  };

  return (
    <div className="relative w-full p-4 select-none">
      {/* Title and navigation buttons */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="bg-black/60 hover:bg-black/60 hover:border-pink-500 transition-all duration-300 ease-in-out transform hover:scale-110 hover:shadow-lg group"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="w-6 h-6 text-white transition-colors duration-300 group-hover:text-pink-500" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="bg-black/60 hover:bg-black/60 hover:border-pink-500 transition-all duration-300 ease-in-out transform hover:scale-110 hover:shadow-lg group"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="w-6 h-6 text-white transition-colors duration-300 group-hover:text-pink-500" />
          </Button>
        </div>
      </div>

      {/* Carousel content and dragging */}
      <div
        ref={carouselRef}
        className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth items-start"
        style={{ scrollbarWidth: "none" }}
        onMouseDown={startDragging}
        onMouseMove={dragMove}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
        onTouchStart={startDragging}
        onTouchMove={dragMove}
        onTouchEnd={stopDragging}
      >
        {events.length === 0 ? (
          <p className="text-gray-400">No events available.</p>
        ) : (
          events.map((event) => {
            const imageUrl = event.event_photo
              ? `${process.env.NEXT_PUBLIC_API_BASE}uploads/${event.event_photo}`
              : "/default-image.jpg";

            return (
              <div
                key={event.event_id}
                onClick={() => openEventDetails(event)}
                className="min-w-[250px] max-w-[250px] rounded-xl overflow-hidden shadow-lg flex flex-col transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl hover:bg-pink-800 cursor-pointer"
              >
                <Image
                  src={imageUrl}
                  alt={event.title}
                  width={300}
                  height={200}
                  className="w-full h-full object-cover pointer-events-none"
                  unoptimized
                  loading="lazy"
                />
                <div className="p-4 text-white flex flex-col flex-grow transition-all duration-300 ease-in-out">
                  <h3 className="font-thin text-lg truncate">{event.title}</h3>
                  <p className="text-sm text-gray-400">
                    {new Date(event.date_time).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-400 truncate">
                    {event.location}
                  </p>
                  <p className="mt-2 font-semibold">
                    From {Math.floor(event.price)} SAR
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <EventDetailsDrawer
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
};

export default EventsCarousel;
