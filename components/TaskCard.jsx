import React from "react";

const TaskCard = ({ ev, teamMembers, handleAssign }) => {
  return (
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
        Assigned to:{" "}
        <span className="font-medium">{ev.assignedTo || "Unassigned"}</span>
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
  );
};

export default TaskCard;
