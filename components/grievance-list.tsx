import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

type Category = {
  id: string
  name: string
  color: string
}

type Grievance = {
  id: string
  referenceNumber: string
  title: string
  requesterName: string
  district: string
  constituency: string
  category: Category
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  createdAt: string
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  RESOLVED: 'bg-green-100 text-green-800',
}

const priorityColors = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
}

type GrievanceListProps = {
  grievances: Grievance[]
  categories: Category[]
}

export function GrievanceList({ grievances, categories }: GrievanceListProps) {
  const router = useRouter()
  const [filteredGrievances, setFilteredGrievances] = useState(grievances)
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    priority: '',
    search: '',
  })

  useEffect(() => {
    let filtered = [...grievances]

    if (filters.category) {
      filtered = filtered.filter(g => g.category.id === filters.category)
    }

    if (filters.status) {
      filtered = filtered.filter(g => g.status === filters.status)
    }

    if (filters.priority) {
      filtered = filtered.filter(g => g.priority === filters.priority)
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(g => 
        g.title.toLowerCase().includes(searchLower) ||
        g.requesterName.toLowerCase().includes(searchLower) ||
        g.referenceNumber.toLowerCase().includes(searchLower) ||
        g.district.toLowerCase().includes(searchLower) ||
        g.constituency.toLowerCase().includes(searchLower)
      )
    }

    setFilteredGrievances(filtered)
  }, [grievances, filters])

  const handleRowClick = (id: string) => {
    router.push(`/dashboard/grievances/${id}`)
  }

  return (
    <Card>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search grievances..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />

          <Select
            value={filters.category}
            onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.status}
            onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.priority}
            onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Priorities</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="URGENT">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reference No.</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Requester</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>District</TableHead>
            <TableHead>Constituency</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredGrievances.map((grievance) => (
            <TableRow
              key={grievance.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleRowClick(grievance.id)}
            >
              <TableCell>{grievance.referenceNumber}</TableCell>
              <TableCell>{grievance.title}</TableCell>
              <TableCell>{grievance.requesterName}</TableCell>
              <TableCell>
                <Badge
                  style={{ backgroundColor: grievance.category.color + '20', color: grievance.category.color }}
                >
                  {grievance.category.name}
                </Badge>
              </TableCell>
              <TableCell>{grievance.district}</TableCell>
              <TableCell>{grievance.constituency}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={statusColors[grievance.status]}
                >
                  {grievance.status.replace('_', ' ')}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={priorityColors[grievance.priority]}
                >
                  {grievance.priority}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(grievance.createdAt).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
