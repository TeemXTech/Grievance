"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { GovernmentHeader } from "@/components/ui/government-header"
import { MapPin, Clock, CheckCircle, AlertCircle, Camera, Upload } from "lucide-react"


type TaskStatus = "RESOLVED" | "IN_PROGRESS" | "PENDING" | "NEW" | string;
type Task = {
  id: string;
  referenceNumber?: string;
  type?: string;
  village?: string;
  location?: string;
  status?: TaskStatus;
  issue?: string;
  projectName?: string;
  title?: string;
  patientName?: string;
  ministerName?: string;
  requesterName?: string;
};

export default function FieldOfficerDashboard() {
  const { data: session } = useSession();
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [statusUpdate, setStatusUpdate] = useState("");
  const [newStatus, setNewStatus] = useState<TaskStatus>("");
  const [loading, setLoading] = useState(true);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);

  const loadAssignedTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/field/assigned-tasks");
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setAssignedTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load tasks:", error);
      setAssignedTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async () => {
    if (!selectedTask || !newStatus) return;
    try {
      // File upload logic (if needed)
      let uploadedUrls: string[] = [];
      if (uploadFiles.length > 0) {
        const formData = new FormData();
        uploadFiles.forEach((file) => formData.append('files', file));
        const uploadRes = await fetch('/api/field/upload', {
          method: 'POST',
          body: formData,
        });
        if (uploadRes.ok) {
          uploadedUrls = await uploadRes.json();
        }
      }
      await fetch(`/api/field/update-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: selectedTask.id,
          status: newStatus,
          remarks: statusUpdate,
          type: selectedTask.type,
          attachments: uploadedUrls
        })
      });
      setSelectedTask(null);
      setStatusUpdate("");
      setNewStatus("");
      setUploadFiles([]);
      loadAssignedTasks();
      alert("Status updated successfully!");
    } catch (error) {
      alert("Failed to update status");
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (isMounted) {
        await loadAssignedTasks();
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "RESOLVED": return "bg-green-100 text-green-800";
      case "IN_PROGRESS": return "bg-blue-100 text-blue-800";
      case "PENDING": return "bg-orange-100 text-orange-800";
      case "NEW": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <GovernmentHeader
        title="Field Officer Dashboard"
        description="Task Management & Field Updates"
        userName={session?.user?.name}
        userRole={session?.user?.role}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Assigned Tasks</p>
                  <p className="text-3xl font-bold text-blue-600">{assignedTasks.length}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {assignedTasks.filter((t) => t.status === "IN_PROGRESS").length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-green-600">
                    {assignedTasks.filter((t) => t.status === "RESOLVED").length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-red-600">
                    {assignedTasks.filter((t) => t.status === "PENDING" || t.status === "NEW").length}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tasks List */}
          <Card>
            <CardHeader>
              <CardTitle>Assigned Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        Loading tasks...
                      </TableCell>
                    </TableRow>
                  ) : assignedTasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No tasks assigned
                      </TableCell>
                    </TableRow>
                  ) : (
                    assignedTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-mono text-sm">{task.referenceNumber || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{task.type || 'Unknown'}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {task.village || task.location || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(task.status || 'PENDING')}>
                            {task.status || 'PENDING'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => setSelectedTask(task)}
                            disabled={task.status === "RESOLVED"}
                            aria-label={`Update status for task ${task.referenceNumber || task.id}`}
                          >
                            Update
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Update Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Update Task Status</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTask ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Task Details</h3>
                    <p className="text-sm text-gray-600">Reference: {selectedTask.referenceNumber || 'N/A'}</p>
                    <p className="text-sm text-gray-600">
                      {selectedTask.type === "grievance" ? "Issue" : "Project"}: {selectedTask.issue || selectedTask.projectName || selectedTask.title || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">Requester: {selectedTask.patientName || selectedTask.ministerName || selectedTask.requesterName || 'N/A'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" htmlFor="new-status">New Status</label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger id="new-status">
                        <SelectValue placeholder="Select new status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="RESOLVED">Resolved</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" htmlFor="status-update">Status Update / Remarks</label>
                    <Textarea
                      id="status-update"
                      value={statusUpdate}
                      onChange={(e) => setStatusUpdate(e.target.value)}
                      placeholder="Enter status update, progress notes, or completion remarks..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" htmlFor="upload-photos">Upload Photos (Optional)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer" tabIndex={0} aria-label="Upload photos">
                      <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">Click or drag to upload photos</p>
                      <input
                        id="upload-photos"
                        type="file"
                        multiple
                        accept="image/*"
                        className="sr-only"
                        onChange={e => {
                          if (e.target.files) {
                            setUploadFiles(Array.from(e.target.files));
                          }
                        }}
                        aria-label="Upload photos"
                      />
                      {uploadFiles.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2 justify-center">
                          {uploadFiles.map((file, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 rounded px-2 py-1">{file.name}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={updateTaskStatus} className="flex-1">
                      <Upload className="w-4 h-4 mr-2" />
                      Update Status
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => { setSelectedTask(null); setUploadFiles([]); }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a task to update its status</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
