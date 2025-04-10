"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  CalendarIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  TicketIcon,
} from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

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

interface EventDetailsDrawerProps {
  event: Event | null;
  onClose: () => void;
}

const EventDetailsDrawer = ({ event, onClose }: EventDetailsDrawerProps) => {
  const [isBooked, setIsBooked] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

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
    if (!event || !username) return;

    const fetchBookedStatus = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}routes/events/get_booked_events.php?username=${username}`
        );
        const data = await response.json();

        if (data.success) {
          const bookedEventIds = new Set(
            data.events.map((e: Event) => e.event_id)
          );
          setIsBooked(bookedEventIds.has(event.event_id));
        }
      } catch (error) {
        console.error("Error fetching booked status:", error);
      }
    };

    fetchBookedStatus();
  }, [event, username]);

  const handleBookTicket = async () => {
    if (!event || !username) return;

    const bookingData = { event_id: event.event_id.toString() };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}routes/events/book_ticket.php`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingData),
        }
      );

      const text = await response.text();
      console.log("Raw Response:", text);

      try {
        const data = JSON.parse(text);
        if (data.success) {
          toast.success("Booking successful", {
            icon: <CheckCircleIcon className="text-green-500 w-6 h-6" />,
          });
          setIsBooked(true);
        } else {
          toast.error(`Booking failed: ${data.message}`, {
            icon: <XCircleIcon className="text-red-500 w-6 h-6" />,
          });
        }
      } catch (error) {
        console.error("JSON Parsing Error:", error);
        toast.error(`Unexpected response: ${text}`, {
          icon: <XCircleIcon className="text-red-500 w-6 h-6" />,
        });
      }
    } catch (error) {
      console.error("Error booking ticket:", error);
      toast.error("An error occurred while booking.", {
        icon: <XCircleIcon className="text-red-500 w-6 h-6" />,
      });
    }
  };

  if (!event) return null;

  const imageUrl = event.event_photo
    ? `${process.env.NEXT_PUBLIC_API_BASE}uploads/${event.event_photo}`
    : "/default-image.jpg";

  return (
    <Drawer open={!!event} onOpenChange={onClose}>
      <DrawerContent className="bg-black/20 backdrop-blur-xl text-white p-6 rounded-t-2xl shadow-lg border border-gray-700 transition-transform">
        <DrawerHeader>
          <VisuallyHidden>
            <DrawerTitle>{event?.title}</DrawerTitle>
          </VisuallyHidden>
        </DrawerHeader>

        <div className="mb-6">
          <p className="text-gray-400 text-sm uppercase tracking-wide">
            {event?.category}
          </p>
          <h2 className="text-3xl font-extrabold leading-tight">
            {event?.title}
          </h2>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-[30%]">
            <div className="relative w-full h-full md:h-full rounded-lg overflow-hidden shadow-md">
              <Image
                src={imageUrl}
                alt={event?.title}
                fill
                className="object-cover"
                unoptimized
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent"></div>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 p-4 rounded-lg flex flex-col items-start h-full">
                <p className="text-gray-400 text-sm">Starting From</p>
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <CalendarIcon className="text-red-500 w-5 h-5" />
                  {event?.date_time
                    ? new Date(event.date_time).toLocaleDateString()
                    : "Unknown Date"}
                </div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg flex flex-col items-start h-full">
                <p className="text-gray-400 text-sm">Location</p>
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <MapPinIcon className="text-blue-500 w-5 h-5" />
                  {event?.location || "Unknown Location"}
                </div>
              </div>
            </div>

            <div className="mt-4 max-w-2xl">
              <h3 className="text-lg font-bold border-b border-gray-700 pb-2 mb-3">
                About
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {event?.description || "No description available."}
              </p>
            </div>

            <div className="bg-gray-900 p-6 rounded-lg w-full shadow-md">
              <h3 className="text-lg font-bold">Book your spot</h3>
              <p className="text-pink-400 text-xl font-bold mt-1">
                From {event?.price ? Math.floor(event.price) : "N/A"} SAR
              </p>
              <p className="text-xs text-gray-400">VAT included</p>

              <Button
                onClick={handleBookTicket}
                disabled={isBooked}
                className={`w-full mt-4 py-3 rounded-full text-lg font-bold flex items-center justify-center gap-2 
                  ${
                    isBooked
                      ? "bg-gray-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-pink-500 to-red-500 hover:scale-105 transition-transform duration-300 shadow-lg"
                  }
                `}
              >
                {isBooked ? (
                  <>
                    <CheckCircleIcon className="w-5 h-5" />
                    Already Booked
                  </>
                ) : (
                  <>
                    <TicketIcon className="w-5 h-5" />
                    Book Ticket
                  </>
                )}
              </Button>

              <p className="text-xs text-gray-400 text-center mt-2">
                Instant booking will be made directly. Limited spots available.
              </p>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default EventDetailsDrawer;
