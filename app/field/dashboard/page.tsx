"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<string | null>(null);
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

  const updateTaskStatus = async (taskId: string) => {
    if (!newStatus) return;
    try {
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
          taskId,
          status: newStatus,
          remarks: statusUpdate,
          attachments: uploadedUrls
        })
      });
      setEditingTask(null);
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
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Field Officer Dashboard</h1>
              <p className="text-gray-600">Task Management & Field Updates</p>
            </div>
          </div>
        </div>
      </div>

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
                  <TableHead>Issue/Project</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading tasks...
                    </TableCell>
                  </TableRow>
                ) : assignedTasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No tasks assigned
                    </TableCell>
                  </TableRow>
                ) : (
                  assignedTasks.map((task) => (
                    <>
                      <TableRow key={task.id}>
                        <TableCell className="font-mono text-sm">{task.referenceNumber || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{task.type || 'Unknown'}</Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {task.issue || task.projectName || task.title || 'N/A'}
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
                            onClick={() => setEditingTask(editingTask === task.id ? null : task.id)}
                            disabled={task.status === "RESOLVED"}
                          >
                            {editingTask === task.id ? 'Cancel' : 'Update'}
                          </Button>
                        </TableCell>
                      </TableRow>
                      {editingTask === task.id && (
                        <TableRow>
                          <TableCell colSpan={6} className="bg-gray-50 p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">New Status</label>
                                <Select value={newStatus} onValueChange={setNewStatus}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2">Remarks</label>
                                <Textarea
                                  value={statusUpdate}
                                  onChange={(e) => setStatusUpdate(e.target.value)}
                                  placeholder="Enter update remarks..."
                                  rows={2}
                                />
                              </div>
                              <div className="md:col-span-3">
                                <label className="block text-sm font-medium mb-2">Upload Photos</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center">
                                  <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={e => {
                                      if (e.target.files) {
                                        setUploadFiles(Array.from(e.target.files));
                                      }
                                    }}
                                    className="hidden"
                                    id={`upload-${task.id}`}
                                  />
                                  <label htmlFor={`upload-${task.id}`} className="cursor-pointer">
                                    <Camera className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                                    <p className="text-sm text-gray-600">Click to upload photos</p>
                                  </label>
                                  {uploadFiles.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                      {uploadFiles.map((file, idx) => (
                                        <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                          {file.name}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="md:col-span-3 flex gap-2">
                                <Button onClick={() => updateTaskStatus(task.id)} size="sm">
                                  <Upload className="w-4 h-4 mr-1" />
                                  Save Update
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setEditingTask(null);
                                    setStatusUpdate("");
                                    setNewStatus("");
                                    setUploadFiles([]);
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
