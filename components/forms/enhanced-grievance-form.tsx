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
import { User, Upload, QrCode, Search, FileText, Languages } from "lucide-react"

const translations = {
  en: {
    title: "Grievance Capture Form",
    patientName: "Patient Name",
    patientPhone: "Patient Phone",
    village: "Village",
    issue: "Issue Description",
    submit: "Submit Grievance",
    search: "Search by Phone/Reference",
    viewList: "View All Grievances",
    uploadFiles: "Upload Files",
    generateQR: "Generate QR Receipt"
  },
  te: {
    title: "ఫిర్యాదు నమోదు ఫారం",
    patientName: "రోగి పేరు",
    patientPhone: "రోగి ఫోన్",
    village: "గ్రామం",
    issue: "సమస్య వివరణ",
    submit: "ఫిర్యాదు సమర్పించండి",
    search: "ఫోన్/రిఫరెన్స్ ద్వారా వెతకండి",
    viewList: "అన్ని ఫిర్యాదులు చూడండి",
    uploadFiles: "ఫైల్స్ అప్‌లోడ్ చేయండి",
    generateQR: "QR రసీదు రూపొందించండి"
  }
}

export function EnhancedGrievanceForm() {
  const [language, setLanguage] = useState<'en' | 'te'>('en')
  const [activeTab, setActiveTab] = useState("create")
  const [searchResults, setSearchResults] = useState([])
  const [files, setFiles] = useState<File[]>([])
  const { register, handleSubmit, reset, watch } = useForm()
  
  const t = translations[language]

  const onSubmit = async (data: any) => {
    try {
      const response = await fetch("/api/grievances/enhanced", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
      if (response.ok) {
        const result = await response.json()
        alert(`${t.submit} successful! Reference: ${result.referenceNumber}`)
        
        // Open print receipt
        const printUrl = `/print/receipt?id=${result.id}&type=patient&lang=${language}`
        window.open(printUrl, '_blank')
        
        reset()
        setFiles([])
      }
    } catch (error) {
      alert("Error submitting grievance")
    }
  }

  const searchByPhone = async (phone: string) => {
    try {
      const response = await fetch(`/api/grievances/search?phone=${phone}`)
      const results = await response.json()
      setSearchResults(results)
    } catch (error) {
      console.error("Search failed:", error)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Language Toggle */}
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
          <TabsTrigger value="create">Create New</TabsTrigger>
          <TabsTrigger value="search">Search & Track</TabsTrigger>
          <TabsTrigger value="list">View All</TabsTrigger>
          <TabsTrigger value="qr">QR Scanner</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {t.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t.patientName} *</Label>
                    <Input {...register("patientName", { required: true })} />
                  </div>
                  <div>
                    <Label>{t.patientPhone} *</Label>
                    <Input {...register("patientPhone", { required: true })} />
                  </div>
                  <div>
                    <Label>{t.village}</Label>
                    <Input {...register("village")} />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select onValueChange={(value) => register("category").onChange({ target: { value } })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="medical">Medical</SelectItem>
                        <SelectItem value="infrastructure">Infrastructure</SelectItem>
                        <SelectItem value="utilities">Utilities</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label>{t.issue} *</Label>
                  <Textarea {...register("issue", { required: true })} />
                </div>

                <div>
                  <Label>{t.uploadFiles}</Label>
                  <Input type="file" multiple onChange={handleFileUpload} />
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

        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>Search Grievances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input 
                  placeholder="Enter phone number or reference number"
                  onChange={(e) => e.target.value.length >= 3 && searchByPhone(e.target.value)}
                />
                <Button>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
              
              {searchResults.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchResults.map((result: any) => (
                      <TableRow key={result.id}>
                        <TableCell>{result.referenceNumber}</TableCell>
                        <TableCell>{result.patientName}</TableCell>
                        <TableCell>{result.patientPhone}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{result.status}</Badge>
                        </TableCell>
                        <TableCell>{new Date(result.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              const printUrl = `/print/receipt?id=${result.id}&type=patient&lang=${language}`
                              window.open(printUrl, '_blank')
                            }}
                          >
                            <QrCode className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>All Grievances</CardTitle>
            </CardHeader>
            <CardContent>
              <p>List of all captured grievances will be displayed here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qr">
          <Card>
            <CardHeader>
              <CardTitle>QR Code Scanner</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <QrCode className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p>QR Scanner functionality will be implemented here</p>
                <Button className="mt-4">
                  <QrCode className="w-4 h-4 mr-2" />
                  Scan QR Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}