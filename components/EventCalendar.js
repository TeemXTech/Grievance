"use client";
import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";


  const mockCalendarEvents = {
    today: [
      {
        id: 1,
        date: "2025-01-08",
        time: "09:00-10:30",
        title: "Village Marriage Ceremony",
        type: "marriage",
        assignedTo: "PA Srinivas",
        status: "confirmed",
      },
      {
        id: 2,
        date: "2025-01-08",
        time: "14:00-15:30",
        title: "Grievance Review Meeting",
        type: "meeting",
        assignedTo: "Field Officer Ramesh",
        status: "pending",
      },
      {
        id: 3,
        date: "2025-01-08",
        time: "16:30-17:30",
        title: "Community Event",
        type: "other",
        assignedTo: null,
        status: "unassigned",
      },
    ],
    week: [
      {
        id: 4,
        date: "2025-01-09",
        time: "10:00-11:30",
        title: "District Collector Meeting",
        type: "meeting",
        assignedTo: "PA Srinivas",
        status: "confirmed",
      },
      {
        id: 5,
        date: "2025-01-10",
        time: "15:00-16:30",
        title: "Public Hearing",
        type: "meeting",
        assignedTo: "Field Officer Kumar",
        status: "confirmed",
      },
      {
        id: 6,
        date: "2025-01-11",
        time: "11:00-12:30",
        title: "Community Festival",
        type: "other",
        assignedTo: null,
        status: "unassigned",
      },
    ],
    month: [
      {
        id: 7,
        date: "2025-01-15",
        time: "09:00-10:30",
        title: "Budget Review",
        type: "meeting",
        assignedTo: "PA Srinivas",
        status: "confirmed",
      },
      {
        id: 8,
        date: "2025-01-20",
        time: "14:00-15:30",
        title: "School Opening Ceremony",
        type: "other",
        assignedTo: "Field Officer Ramesh",
        status: "confirmed",
      },
      {
        id: 9,
        date: "2025-01-25",
        time: "10:30-12:00",
        title: "Road Project Launch",
        type: "other",
        assignedTo: null,
        status: "unassigned",
      },
    ],
  };



export default function EventCalendar() {
  const [events, setEvents] = useState(mockCalendarEvents);
  const [selectedDateEvents, setSelectedDateEvents] =
    useState(mockCalendarEvents.today);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  const teamMembers = [
    { id: 1, name: "PA Srinivas", role: "Personal Assistant" },
    { id: 2, name: "Field Officer Ramesh", role: "Field Officer" },
    { id: 3, name: "Field Officer Kumar", role: "Field Officer" },
    { id: 4, name: "Back Officer Priya", role: "Back Officer" }
  ];

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        const colorCodedEvents = data.map((event) => ({
          ...event,
          color:
            event.type === "marriage"
              ? "#22c55e"
              : event.type === "meeting"
              ? "#eab308"
              : "#3b82f6"
        }));
        // setEvents(colorCodedEvents);
      })
      .catch(() => {
        // Fallback data if API fails
        const fallbackEvents = [
          {
            id: 1,
            title: "Rahul's Wedding",
            start: "2025-01-20",
            type: "marriage",
            assignedTo: null,
            color: "#22c55e"
          },
          {
            id: 2,
            title: "Cabinet Meeting",
            start: "2025-01-21",
            type: "meeting",
            assignedTo: "PA Srinivas",
            color: "#eab308"
          },
          {
            id: 3,
            title: "School Visit",
            start: "2025-01-21",
            type: "other",
            assignedTo: null,
            color: "#3b82f6"
          }
        ];
        // setEvents(fallbackEvents);
      });
  }, []);

  const handleDateClick = (info) => {
    const clickedDate = info.dateStr;
    const dayEvents = events.filter(
      (e) => e.start.split("T")[0] === clickedDate
    );
    // setSelectedDateEvents(dayEvents);
    setSelectedDate(clickedDate);
    setModalIsOpen(true);
  };

  const handleAssign = (eventId, assignedTo) => {
    fetch("/api/assign-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, assignedTo })
    })
    .then(() => {
      // Update local state
      // setEvents(prev => prev.map(event => 
      //   event.id === eventId ? { ...event, assignedTo } : event
      // ));
      // setSelectedDateEvents(prev => prev.map(event => 
      //   event.id === eventId ? { ...event, assignedTo } : event
      // ));
      alert(`Event assigned to ${assignedTo}`);
    })
    .catch(() => {
      alert("Assignment failed. Please try again.");
    });
  };

  return (
    <div className="w-full">
      <style jsx>{`
        .fc-event {
          border-radius: 4px;
          border: none;
          padding: 2px 4px;
          font-size: 12px;
        }
        .fc-daygrid-event {
          margin: 1px 0;
        }
        .fc-day-today {
          background-color: #f0f9ff !important;
        }
        .fc-button-primary {
          background-color: #3b82f6;
          border-color: #3b82f6;
        }
        .fc-button-primary:hover {
          background-color: #2563eb;
          border-color: #2563eb;
        }
      `}</style>
      
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        dateClick={handleDateClick}
        height="auto"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth'
        }}
        dayMaxEvents={3}
        moreLinkClick="popover"
      />

      {/* Custom Modal with Portal */}
      {modalIsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Events for {selectedDate}</h2>
              <button 
                onClick={() => setModalIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none p-1"
                aria-label="Close modal"
              >
                x
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {selectedDateEvents.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No events for this day</p>
              ) : (
                <div className="space-y-4">
                  {selectedDateEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="border-l-4 p-3 bg-gray-50 rounded-lg mb-2"
                      style={{ borderLeftColor: ev.color }}
                    >
                      <div className="font-medium text-gray-900 mb-1">{ev.title}</div>
                      <div className="text-sm text-gray-600 capitalize mb-1">
                        Type: <span className="font-medium">{ev.type}</span>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        Assigned to: <span className="font-medium">{ev.assignedTo || "Unassigned"}</span>
                      </div>
                      <div>
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAssign(ev.id, e.target.value);
                            }
                          }}
                          defaultValue=""
                          className="w-full p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="" disabled>
                            {ev.assignedTo ? "Reassign to..." : "Assign to..."}
                          </option>
                          {teamMembers.map((member) => (
                            <option key={member.id} value={member.name}>
                              {member.name} - {member.role}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t bg-gray-50">
              <button 
                onClick={() => setModalIsOpen(false)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}