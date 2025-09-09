"use client";
import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function EventCalendar() {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Political Rally in Central Square",
      start: "2025-09-10T09:00:00",
      type: "rally",
      assignedTo: null,
      color: "#ef4444",
      location: "Central Square, Hyderabad",
      invitedBy: "Local Party Committee",
    },
    {
      id: 2,
      title: "Constituency Meeting",
      start: "2025-09-10T14:00:00",
      type: "meeting",
      assignedTo: "PA Srinivas",
      color: "#eab308",
      location: "Party Office, Manthanani",
      invitedBy: "District Coordinator",
    },
    {
      id: 3,
      title: "Campaign Strategy Session",
      start: "2025-09-11T10:30:00",
      type: "meeting",
      assignedTo: null,
      color: "#eab308",
      location: "Conference Hall, Karimnagar",
      invitedBy: "State Party Leadership",
    },
    {
      id: 4,
      title: "Voter Outreach Program",
      start: "2025-09-11T15:00:00",
      type: "outreach",
      assignedTo: "Field Officer Ramesh",
      color: "#3b82f6",
      location: "Ramagundam Village",
      invitedBy: "Community Leaders",
    },
    {
      id: 5,
      title: "Party Conference",
      start: "2025-09-10T11:00:00",
      type: "conference",
      assignedTo: null,
      color: "#3b82f6",
      location: "Convention Center, Warangal",
      invitedBy: "National Party Office",
    },
    {
      id: 6,
      title: "Youth Wing Meeting",
      start: "2025-09-10T12:00:00",
      type: "meeting",
      assignedTo: null,
      color: "#eab308",
      location: "Community Hall, Hyderabad",
      invitedBy: "Youth Wing President",
    },
    {
      id: 7,
      title: "Press Conference",
      start: "2025-09-11T13:00:00",
      type: "conference",
      assignedTo: "Back Officer Priya",
      color: "#3b82f6",
      location: "Media Center, Hyderabad",
      invitedBy: "Media Coordinator",
    },
    {
      id: 8,
      title: "Public Forum",
      start: "2025-09-10T16:00:00",
      type: "outreach",
      assignedTo: null,
      color: "#3b82f6",
      location: "Town Hall, Secunderabad",
      invitedBy: "Civic Association",
    },
    {
      id: 9,
      title: "Election Strategy Session",
      start: "2025-09-11T17:00:00",
      type: "meeting",
      assignedTo: null,
      color: "#eab308",
      location: "Party HQ, Hyderabad",
      invitedBy: "Election Committee",
    },
    {
      id: 10,
      title: "Community Outreach",
      start: "2025-09-10T18:00:00",
      type: "outreach",
      assignedTo: "Field Officer Kumar",
      color: "#3b82f6",
      location: "Warangal Village",
      invitedBy: "Local Leaders",
    },
    {
      id: 11,
      title: "Policy Review Meeting",
      start: "2025-09-11T19:00:00",
      type: "meeting",
      assignedTo: null,
      color: "#eab308",
      location: "Conference Room, Karimnagar",
      invitedBy: "Policy Advisors",
    },
    {
      id: 12,
      title: "Fundraising Event",
      start: "2025-09-10T20:00:00",
      type: "outreach",
      assignedTo: null,
      color: "#3b82f6",
      location: "Banquet Hall, Hyderabad",
      invitedBy: "Fundraising Committee",
    },
    {
      id: 13,
      title: "Volunteer Coordination Meeting",
      start: "2025-09-10T08:00:00",
      type: "meeting",
      assignedTo: null,
      color: "#eab308",
      location: "Party Office, Peddapalli",
      invitedBy: "Volunteer Coordinator",
    },
    {
      id: 14,
      title: "Campaign Rally",
      start: "2025-09-11T21:00:00",
      type: "rally",
      assignedTo: null,
      color: "#ef4444",
      location: "Main Square, Warangal",
      invitedBy: "Campaign Manager",
    },
    {
      id: 15,
      title: "Legislative Briefing",
      start: "2025-09-11T22:00:00",
      type: "meeting",
      assignedTo: null,
      color: "#eab308",
      location: "State Assembly, Hyderabad",
      invitedBy: "Legislative Team",
    },
  ]);
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  const teamMembers = [
    { id: 1, name: "PA Srinivas", role: "Personal Assistant" },
    { id: 2, name: "Field Officer Ramesh", role: "Field Officer" },
    { id: 3, name: "Field Officer Kumar", role: "Field Officer" },
    { id: 4, name: "Back Officer Priya", role: "Back Officer" },
  ];

  const handleDateClick = (info) => {
    const clickedDate = info.dateStr;
    const dayEvents = events
      .filter((e) => e.start.split("T")[0] === clickedDate)
      .sort((a, b) => new Date(a.start) - new Date(b.start));
    setSelectedDateEvents(dayEvents);
    setSelectedDate(clickedDate);
    setModalIsOpen(true);
  };

  const handleAssign = (eventId, assignedTo) => {
    setEvents((prev) => prev.map((event) => (event.id === eventId ? { ...event, assignedTo } : event)));
    setSelectedDateEvents((prev) => prev.map((event) => (event.id === eventId ? { ...event, assignedTo } : event)));
    alert(`Event assigned to ${assignedTo}`);
  };

  return (
    <div className="w-full">
      <style jsx>{`
        .fc-event {
          border-radius: 50%;
          border: none;
          width: 6px;
          height: 6px;
          padding: 0;
          margin: 1px;
          font-size: 0;
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
        .fc-daygrid-day {
          cursor: pointer !important;
        }
        .fc-daygrid-day:hover {
          background-color: #f3f4f6 !important;
        }
        .fc-daygrid-day-frame {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .fc-daygrid-dot-event {
          display: inline-block;
        }
      `}</style>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        dateClick={handleDateClick}
        height="auto"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth",
        }}
        dayMaxEvents={3}
        moreLinkClick="popover"
        eventContent={(arg) => (
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: arg.event.backgroundColor || arg.event.extendedProps.color,
              margin: "0 auto",
            }}
          />
        )}
      />

      {/* Custom Modal with Portal */}
      {modalIsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Events for {selectedDate}</h2>
              <button
                onClick={() => setModalIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none p-1"
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <ScrollArea className="flex-1 h-[60vh] p-4">
              {selectedDateEvents.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No events for this day</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">Time</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Invited By</TableHead>
                      <TableHead>Assigned To</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedDateEvents.map((ev) => (
                      <TableRow key={ev.id}>
                        <TableCell>
                          {new Date(ev.start).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell>{ev.title}</TableCell>
                        <TableCell className="capitalize">{ev.type}</TableCell>
                        <TableCell>{ev.location}</TableCell>
                        <TableCell>{ev.invitedBy}</TableCell>
                        <TableCell>
                          <Select
                            onValueChange={(value) => {
                              if (value) {
                                handleAssign(ev.id, value);
                              }
                            }}
                            defaultValue={ev.assignedTo || ""}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder={ev.assignedTo ? ev.assignedTo : "Assign to..."} />
                            </SelectTrigger>
                            <SelectContent>
                              {teamMembers.map((member) => (
                                <SelectItem key={member.id} value={member.name}>
                                  {member.name} - {member.role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </ScrollArea>

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
