"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

ChartJS.register(
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  Title
);

const AnalyticsGraphs = ({ grievances, projects, events }) => {
  const grievanceCategories = grievances.reduce((acc, g) => {
    acc[g.category] = (acc[g.category] || 0) + 1;
    return acc;
  }, {});

  const grievanceStatuses = grievances.reduce((acc, g) => {
    acc[g.status] = (acc[g.status] || 0) + 1;
    return acc;
  }, {});

  const projectCategories = projects.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  const eventsByDay = events.month.reduce((acc, e) => {
    const day = e.date;
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
      {/* Grievance Categories - Doughnut */}
      <Card>
        <CardHeader>
          <CardTitle>Grievances by Category</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <Doughnut
            data={{
              labels: Object.keys(grievanceCategories),
              datasets: [
                {
                  label: "Grievances",
                  data: Object.values(grievanceCategories),
                  backgroundColor: [
                    "#3B82F6", // Blue
                    "#F59E0B", // Amber
                    "#10B981", // Green
                    "#EF4444", // Red
                    "#8B5CF6", // Violet
                  ],
                },
              ],
            }}
            options={{
              plugins: {
                legend: {
                  position: "bottom",
                  labels: {
                    boxWidth: 12,
                    padding: 16,
                  },
                },
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Grievance Status - Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Grievance Status Overview</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <Bar
            data={{
              labels: Object.keys(grievanceStatuses),
              datasets: [
                {
                  label: "Count",
                  data: Object.values(grievanceStatuses),
                  backgroundColor: [
                    "#FCD34D", // Yellow
                    "#3B82F6", // Blue
                    "#10B981", // Green
                  ],
                },
              ],
            }}
            options={{
              indexAxis: "y",
              responsive: true,
              plugins: {
                legend: { display: false },
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Project Categories - Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Projects by Category</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <Bar
            data={{
              labels: Object.keys(projectCategories),
              datasets: [
                {
                  label: "Projects",
                  data: Object.values(projectCategories),
                  backgroundColor: ["#6366F1", "#06B6D4", "#EC4899"],
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Monthly Event Timeline - Line */}
      {/* <Card className="lg:col-span-2 xl:col-span-3">
        <CardHeader>
          <CardTitle>Monthly Event Timeline</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <Line
            data={{
              labels: Object.keys(eventsByDay),
              datasets: [
                {
                  label: "Events",
                  data: Object.values(eventsByDay),
                  borderColor: "#3B82F6",
                  backgroundColor: "rgba(59, 130, 246, 0.2)",
                  fill: true,
                  tension: 0.4,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
              },
            }}
          />
        </CardContent>
      </Card> */}
    </div>
  );
};

export default AnalyticsGraphs;
