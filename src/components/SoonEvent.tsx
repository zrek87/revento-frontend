import { useEffect, useState } from "react";
import Image from "next/image";
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
}

const SoonEvent = ({ endpoint }: { endpoint: string }) => {
  const [nearestEvent, setNearestEvent] = useState<Event | null>(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          findNearestEvent(data.events);
        }
      });
  }, [endpoint]);

  useEffect(() => {
    if (nearestEvent) {
      const interval = setInterval(() => {
        const now = new Date();
        const eventDate = new Date(nearestEvent.date_time);
        const diff = eventDate.getTime() - now.getTime();

        if (diff > 0) {
          setTimeLeft({
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor(
              (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            ),
            minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((diff % (1000 * 60)) / 1000),
          });
        } else {
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [nearestEvent]);

  const findNearestEvent = (events: Event[]) => {
    const now = new Date();
    const upcomingEvents = events.filter(
      (event) => new Date(event.date_time) > now
    );
    const nearest = upcomingEvents.reduce((prev, current) => {
      return new Date(current.date_time) < new Date(prev.date_time)
        ? current
        : prev;
    }, upcomingEvents[0]);

    setNearestEvent(nearest);
  };

  if (!nearestEvent) return <div>Loading...</div>;

  const imageUrl = nearestEvent.event_photo
    ? `${process.env.NEXT_PUBLIC_API_BASE}uploads/${nearestEvent.event_photo}`
    : "/default-image.jpg";

  return (
    <div className="relative w-full h-auto p-0 text-white">
      <div className="relative w-full h-[450px] overflow-hidden">
        <Image
          src={imageUrl}
          alt={nearestEvent.title}
          layout="fill"
          objectFit="cover"
          className="opacity-90 blur-sm"
          unoptimized
        />
        <div className="absolute inset-0 bg-black/70 flex flex-col justify-center items-center text-center px-6">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-wide mb-2">
            {nearestEvent.title}
          </h2>
          <p className="text-lg md:text-xl text-gray-300">
            {new Date(nearestEvent.date_time).toLocaleDateString()} |{" "}
            {nearestEvent.location}
          </p>
          <p className="mt-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-orange-400">
            From {Math.floor(nearestEvent.price)} SAR
          </p>

          <div className="mt-6 flex justify-center gap-6 text-center">
            {Object.entries(timeLeft).map(([label, value]) => (
              <div
                key={label}
                className="flex flex-col p-4 bg-gray-900 rounded-xl shadow-lg transition transform hover:scale-110"
              >
                <span className="text-4xl font-mono font-bold text-yellow-300 animate-pulse">
                  {value}
                </span>
                <span className="text-sm uppercase text-gray-400">{label}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setSelectedEvent(nearestEvent)}
            className="mt-6 px-6 py-3 text-lg font-bold rounded-lg transition transform hover:scale-105 shadow-lg bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:to-red-400 text-white"
          >
            Get Your Ticket
          </button>
        </div>
      </div>

      <EventDetailsDrawer
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
};

export default SoonEvent;
