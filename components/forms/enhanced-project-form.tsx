"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Building2, Upload, Search, Users, Languages } from "lucide-react"

const translations = {
  en: {
    title: "Government Project Management",
    projectName: "Project Name",
    ministerName: "Minister Name",
    status: "Status",
    estimatedCost: "Estimated Cost",
    actualCost: "Actual Cost",
    village: "Village",
    submit: "Submit Project",
    search: "Search Projects",
    assignTo: "Assign To",
    uploadImages: "Upload Images"
  },
  te: {
    title: "ప్రభుత్వ ప్రాజెక్ట్ నిర్వహణ",
    projectName: "ప్రాజెక్ట్ పేరు",
    ministerName: "మంత్రి పేరు",
    status: "స్థితి",
    estimatedCost: "అంచనా వ్యయం",
    actualCost: "వాస్తవ వ్యయం",
    village: "గ్రామం",
    submit: "ప్రాజెక్ట్ సమర్పించండి",
    search: "ప్రాజెక్ట్లు వెతకండి",
    assignTo: "కేటాయించండి",
    uploadImages: "చిత్రాలు అప్లోడ్ చేయండి"
  }
}

export function EnhancedProjectForm() {
  const [language, setLanguage] = useState<'en' | 'te'>('en')
  const [activeTab, setActiveTab] = useState("create")
  const [projects, setProjects] = useState([])
  const [fieldOfficers, setFieldOfficers] = useState([])
  const [files, setFiles] = useState<File[]>([])
  const { register, handleSubmit, reset, setValue } = useForm()
  
  const t = translations[language]

  const onSubmit = async (data: any) => {
    const formData = new FormData()
    Object.keys(data).forEach(key => formData.append(key, data[key]))
    files.forEach(file => formData.append('attachments', file))

    try {
      const response = await fetch("/api/government-projects/enhanced", {
        method: "POST",
        body: formData
      })
      if (response.ok) {
        const result = await response.json()
        alert(`Project created! Reference: ${result.referenceNumber}`)
        reset()
        setFiles([])
        loadProjects()
      }
    } catch (error) {
      alert("Error creating project")
    }
  }

  const loadProjects = async () => {
    try {
      const response = await fetch("/api/government-projects")
      const data = await response.json()
      setProjects(data)
    } catch (error) {
      console.error("Failed to load projects:", error)
    }
  }

  const assignProject = async (projectId: string, officerId: string) => {
    try {
      await fetch(`/api/government-projects/${projectId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assigneeId: officerId })
      })
      loadProjects()
    } catch (error) {
      console.error("Failed to assign project:", error)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-end">
        <Select value={language} onValueChange={(value: 'en' | 'te') => setLanguage(value)}>
          <SelectTrigger className="w-[150px]">
            <Languages className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="te">తెలుగు</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="create">Create Project</TabsTrigger>
          <TabsTrigger value="list">View Projects</TabsTrigger>
          <TabsTrigger value="assign">Assign Tasks</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                {t.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t.projectName} *</Label>
                    <Input {...register("projectName", { required: true })} />
                  </div>
                  <div>
                    <Label>{t.ministerName} *</Label>
                    <Input {...register("ministerName", { required: true })} />
                  </div>
                  <div>
                    <Label>{t.status} *</Label>
                    <Select onValueChange={(value) => setValue("status", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="YET_TO_COMPLETE">Yet to Complete</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t.village}</Label>
                    <Input {...register("village")} />
                  </div>
                  <div>
                    <Label>{t.estimatedCost} (₹)</Label>
                    <Input type="number" {...register("estimatedCost")} />
                  </div>
                  <div>
                    <Label>{t.actualCost} (₹)</Label>
                    <Input type="number" {...register("actualCost")} />
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea {...register("description")} />
                </div>

                <div>
                  <Label>{t.uploadImages}</Label>
                  <Input type="file" multiple accept="image/*" onChange={handleFileUpload} />
                  {files.length > 0 && (
                    <div className="mt-2">
                      {files.map((file, i) => (
                        <Badge key={i} variant="outline" className="mr-2">
                          {file.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full">
                  {t.submit}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>All Projects</CardTitle>
              <Button onClick={loadProjects}>
                <Search className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Minister</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Village</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project: any) => (
                    <TableRow key={project.id}>
                      <TableCell>{project.referenceNumber}</TableCell>
                      <TableCell>{project.projectName}</TableCell>
                      <TableCell>{project.ministerName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{project.status}</Badge>
                      </TableCell>
                      <TableCell>{project.village}</TableCell>
                      <TableCell>
                        {project.assignedTo ? project.assignedTo.name : "Unassigned"}
                      </TableCell>
                      <TableCell>
                        <Select onValueChange={(value) => assignProject(project.id, value)}>
                          <SelectTrigger className="w-[120px]">
                            <SelectValue placeholder="Assign" />
                          </SelectTrigger>
                          <SelectContent>
                            {fieldOfficers.map((officer: any) => (
                              <SelectItem key={officer.id} value={officer.id}>
                                {officer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assign">
          <Card>
            <CardHeader>
              <CardTitle>Task Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Assignment management interface will be implemented here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Project Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold">Completed Projects</h3>
                    <p className="text-2xl font-bold text-green-600">
                      {projects.filter((p: any) => p.status === 'COMPLETED').length}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold">In Progress</h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {projects.filter((p: any) => p.status === 'IN_PROGRESS').length}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold">Yet to Complete</h3>
                    <p className="text-2xl font-bold text-orange-600">
                      {projects.filter((p: any) => p.status === 'YET_TO_COMPLETE').length}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}