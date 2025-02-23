
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import Sidebar from "@/components/layout/Sidebar";
import { TopHeader } from "@/components/layout/header";
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
    <div className=" min-h-screen bg-[#F8F8FA]">
      <TopHeader />

      <main className="grid grid-cols-7 gap-2 top-[80px]" style={{ height: "calc(100vh - 80px)" }}>
        <div className="w-full h-full col-span-2">
          <Sidebar />
        </div>
        <div className="w-full h-full col-span-5 overflow-y-auto p-10 pl-4" >

          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-8">Reservations Calendar</h1>

            <div className=" gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                {/* <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                /> */}
                <iframe
                  src={`https://calendar.google.com/calendar/embed?ctz=America%2FLos_Angeles&showPrint=0&showCalendars=0&showTz=0&showTitle=0&src=YjNlNTY3ZTAyY2E5YjgzNjViMjM2MjUzYzFkZjk5ZDg5OWU3NDQ5NmFmMzZhNDlmNTQxMzQyOGI1Y2ExM2MyOEBncm91cC5jYWxlbmRhci5nb29nbGUuY29t&src=YjNlNTY3ZTAyY2E5YjgzNjViMjM2MjUzYzFkZjk5ZDg5OWU3NDQ5NmFmMzZhNDlmNTQxMzQyOGI1Y2ExM2MyOEBncm91cC5jYWxlbmRhci5nb29nbGUuY29t&color=%23F4511E&color=%23F4511E&dates=${date ? date.toISOString().split('T')[0].replace(/-/g, '') : ''}/${date ? date.toISOString().split('T')[0].replace(/-/g, '') : ''}`}
                  style={{ border: 0 }}
                  width="100%"
                  height="600"
                ></iframe>
              </div>

              {/* <div className="bg-white p-6 rounded-xl shadow-sm">
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
              </div> */}
            </div>
          </div>
        </div>
      </main>
    </div >
  );
};

export default Reservations;
