"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User } from "lucide-react"

type GrievanceType = "patient" | "individual" | "job" | "ttd"

export function GrievanceCaptureForm() {
  const [grievanceType, setGrievanceType] = useState<GrievanceType>("patient")
  const { register, handleSubmit, reset } = useForm()

  const onSubmit = async (data: any) => {
    try {
      const endpoint = `/api/grievances/${grievanceType}`
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
      if (response.ok) {
        alert("Grievance submitted successfully!")
        reset()
      }
    } catch (error) {
      alert("Error submitting grievance")
    }
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Grievance Capture Form
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={grievanceType} onValueChange={(value) => setGrievanceType(value as GrievanceType)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="patient">Patient Issue</TabsTrigger>
            <TabsTrigger value="individual">Individual Issue</TabsTrigger>
            <TabsTrigger value="job">Job Request</TabsTrigger>
            <TabsTrigger value="ttd">TTD Request</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
            <TabsContent value="patient" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Patient Name *</Label>
                  <Input {...register("patientName", { required: true })} />
                </div>
                <div>
                  <Label>Patient Phone *</Label>
                  <Input {...register("patientPhone", { required: true })} />
                </div>
                <div>
                  <Label>Village</Label>
                  <Input {...register("village")} />
                </div>
                <div>
                  <Label>Caretaker Name</Label>
                  <Input {...register("caretakerName")} />
                </div>
                <div>
                  <Label>Caretaker Phone</Label>
                  <Input {...register("caretakerPhone")} />
                </div>
                <div>
                  <Label>Hospital</Label>
                  <Input {...register("hospital")} />
                </div>
                <div>
                  <Label>Doctor</Label>
                  <Input {...register("doctor")} />
                </div>
                <div>
                  <Label>Referred By Name</Label>
                  <Input {...register("referredByName")} />
                </div>
                <div>
                  <Label>Referred By Number</Label>
                  <Input {...register("referredByNumber")} />
                </div>
              </div>
              <div>
                <Label>Issue Description *</Label>
                <Textarea {...register("issue", { required: true })} />
              </div>
            </TabsContent>

            <TabsContent value="individual" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name *</Label>
                  <Input {...register("name", { required: true })} />
                </div>
                <div>
                  <Label>Mobile Number *</Label>
                  <Input {...register("mobileNumber", { required: true })} />
                </div>
                <div>
                  <Label>Village</Label>
                  <Input {...register("village")} />
                </div>
                <div>
                  <Label>Contact Person Name</Label>
                  <Input {...register("contactName")} />
                </div>
                <div>
                  <Label>Contact Person Number</Label>
                  <Input {...register("contactNumber")} />
                </div>
                <div>
                  <Label>Office</Label>
                  <Input {...register("office")} />
                </div>
                <div>
                  <Label>Referred By Name</Label>
                  <Input {...register("referredByName")} />
                </div>
                <div>
                  <Label>Referred By Number</Label>
                  <Input {...register("referredByNumber")} />
                </div>
              </div>
              <div>
                <Label>Subject *</Label>
                <Textarea {...register("subject", { required: true })} />
              </div>
            </TabsContent>

            <TabsContent value="job" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name *</Label>
                  <Input {...register("name", { required: true })} />
                </div>
                <div>
                  <Label>Mobile Number *</Label>
                  <Input {...register("mobileNumber", { required: true })} />
                </div>
                <div>
                  <Label>Village</Label>
                  <Input {...register("village")} />
                </div>
                <div>
                  <Label>Contact Person Name</Label>
                  <Input {...register("contactName")} />
                </div>
                <div>
                  <Label>Contact Person Number</Label>
                  <Input {...register("contactNumber")} />
                </div>
                <div>
                  <Label>Office</Label>
                  <Input {...register("office")} />
                </div>
                <div>
                  <Label>Referred By Name</Label>
                  <Input {...register("referredByName")} />
                </div>
                <div>
                  <Label>Referred By Number</Label>
                  <Input {...register("referredByNumber")} />
                </div>
              </div>
              <div>
                <Label>Subject *</Label>
                <Textarea {...register("subject", { required: true })} />
              </div>
            </TabsContent>

            <TabsContent value="ttd" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date of Darshan *</Label>
                  <Input type="date" {...register("darshanDate", { required: true })} />
                </div>
                <div>
                  <Label>Type of Darshan *</Label>
                  <Input {...register("darshanType", { required: true })} />
                </div>
                <div>
                  <Label>Accommodation From</Label>
                  <Input type="date" {...register("accommodationFrom")} />
                </div>
                <div>
                  <Label>Accommodation To</Label>
                  <Input type="date" {...register("accommodationTo")} />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold">Guest Details (Up to 5 guests)</h3>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="grid grid-cols-4 gap-2 p-4 border rounded">
                    <Input placeholder="Name" {...register(`guest${i}Name`)} />
                    <Input placeholder="Mobile" {...register(`guest${i}Mobile`)} />
                    <Input placeholder="Aadhar" {...register(`guest${i}Aadhar`)} />
                    <Input placeholder="Age" type="number" {...register(`guest${i}Age`)} />
                    <Input placeholder="Address" {...register(`guest${i}Address`)} />
                    <Input placeholder="Village" {...register(`guest${i}Village`)} />
                    <Input placeholder="Mandal" {...register(`guest${i}Mandal`)} />
                    <Input placeholder="District" {...register(`guest${i}District`)} />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Reference Name</Label>
                  <Input {...register("referenceName")} />
                </div>
                <div>
                  <Label>Reference Number</Label>
                  <Input {...register("referenceNumber")} />
                </div>
                <div>
                  <Label>Reference Village</Label>
                  <Input {...register("referenceVillage")} />
                </div>
                <div>
                  <Label>Reference Mandal</Label>
                  <Input {...register("referenceMandal")} />
                </div>
              </div>
            </TabsContent>

            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={() => reset()}>
                Reset
              </Button>
              <Button type="submit">
                Submit Grievance
              </Button>
            </div>
          </form>
        </Tabs>
      </CardContent>
    </Card>
  )
}