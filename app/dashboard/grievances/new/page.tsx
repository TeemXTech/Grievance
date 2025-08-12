import { GrievanceForm } from '@/components/grievance-form'
import { Card } from '@/components/ui/card'

export default function NewGrievancePage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="mb-6 p-6">
        <h1 className="text-2xl font-bold">Submit New Grievance</h1>
        <p className="text-gray-600">
          Please fill in the details below to submit a new grievance.
        </p>
      </Card>

      <GrievanceForm />
    </div>
  )
}
