"use client";
import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";

export default function ManageCalendar() {
  const [events, setEvents] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, title: "", date: "", type: "other" });

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch(() => setEvents([]));
  }, []);

  const handleDateClick = (info) => {
    setFormData({ id: null, title: "", date: info.dateStr, type: "other" });
    setModalIsOpen(true);
  };

  const handleEventClick = (clickInfo) => {
    const ev = clickInfo.event;
    setFormData({ 
      id: ev.id, 
      title: ev.title, 
      date: ev.startStr.split("T")[0], 
      type: ev.extendedProps.type || "other"
    });
    setModalIsOpen(true);
  };

  const saveEvent = async () => {
    if (!formData.title.trim()) return;
    
    const method = formData.id ? "PUT" : "POST";
    const res = await fetch("/api/events-manage", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    
    if (res.ok) {
      const updatedEvents = await fetch("/api/events").then(r => r.json());
      setEvents(updatedEvents);
      setModalIsOpen(false);
      setFormData({ id: null, title: "", date: "", type: "other" });
    }
  };

  const deleteEvent = async () => {
    if (!formData.id) return;
    
    const res = await fetch("/api/events-manage", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: formData.id })
    });
    
    if (res.ok) {
      const updatedEvents = await fetch("/api/events").then(r => r.json());
      setEvents(updatedEvents);
      setModalIsOpen(false);
      setFormData({ id: null, title: "", date: "", type: "other" });
    }
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
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        height="auto"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek'
        }}
        dayMaxEvents={3}
        moreLinkClick="popover"
        editable={true}
        selectable={true}
      />

      {/* Custom Modal with Portal */}
      {modalIsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                {formData.id ? "Edit Event" : "Add Event"}
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                  <input
                    type="text"
                    placeholder="Enter event title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="marriage">Marriage (Green)</option>
                    <option value="meeting">Meeting (Yellow)</option>
                    <option value="other">Other (Blue)</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t bg-gray-50">
              <div className="flex flex-col sm:flex-row gap-2">
                <button 
                  onClick={saveEvent}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Save
                </button>
                {formData.id && (
                  <button 
                    onClick={deleteEvent}
                    className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                  >
                    Delete
                  </button>
                )}
                <button 
                  onClick={() => {
                    setModalIsOpen(false);
                    setFormData({ id: null, title: "", date: "", type: "other" });
                  }}
                  className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}