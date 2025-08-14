"use client"

import { useForm } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2 } from "lucide-react"

export function GovernmentProjectForm() {
  const { register, handleSubmit, reset, setValue } = useForm()

  const onSubmit = async (data: any) => {
    try {
      const response = await fetch("/api/government-projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
      if (response.ok) {
        alert("Government project submitted successfully!")
        reset()
      }
    } catch (error) {
      alert("Error submitting project")
    }
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Government Project Form
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Project Name *</Label>
              <Input {...register("projectName", { required: true })} />
            </div>
            <div>
              <Label>Minister Name *</Label>
              <Input {...register("ministerName", { required: true })} />
            </div>
          </div>

          <div>
            <Label>Project Description</Label>
            <Textarea {...register("description")} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Status *</Label>
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
              <Label>Estimated Cost (₹)</Label>
              <Input type="number" {...register("estimatedCost")} />
            </div>
            <div>
              <Label>Actual Cost (₹)</Label>
              <Input type="number" {...register("actualCost")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input type="date" {...register("startDate")} />
            </div>
            <div>
              <Label>Completion Date</Label>
              <Input type="date" {...register("completionDate")} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Village</Label>
              <Input {...register("village")} />
            </div>
            <div>
              <Label>Mandal</Label>
              <Input {...register("mandal")} />
            </div>
            <div>
              <Label>District</Label>
              <Input {...register("district")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Number of Beneficiaries</Label>
              <Input type="number" {...register("beneficiaries")} />
            </div>
            <div>
              <Label>State</Label>
              <Input {...register("state")} defaultValue="Telangana" />
            </div>
          </div>

          <div>
            <Label>Remarks</Label>
            <Textarea {...register("remarks")} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => reset()}>
              Reset
            </Button>
            <Button type="submit">
              Submit Project
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}