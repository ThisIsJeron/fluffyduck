
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import Sidebar from "@/components/layout/Sidebar";
import { addDays } from "date-fns";

const Reservations = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Mock reservations data (replace with real data from Supabase later)
  const reservations = [
    {
      date: new Date(),
      name: "John Doe",
      time: "12:00 PM",
      partySize: 4,
    },
    {
      date: addDays(new Date(), 2),
      name: "Jane Smith",
      time: "7:00 PM",
      partySize: 2,
    },
  ];

  const selectedDayReservations = reservations.filter(
    (res) => date && res.date.toDateString() === date.toDateString()
  );

  return (
    <div className="flex min-h-screen bg-secondary">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-8">Reservations Calendar</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-lg font-semibold mb-4">
                {date ? (
                  `Reservations for ${date.toLocaleDateString()}`
                ) : (
                  "Select a date to view reservations"
                )}
              </h2>
              
              {selectedDayReservations.length > 0 ? (
                <div className="space-y-4">
                  {selectedDayReservations.map((reservation, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg hover:bg-accent/5 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{reservation.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Party of {reservation.partySize}
                          </p>
                        </div>
                        <p className="text-sm font-medium">{reservation.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No reservations for this date.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reservations;
