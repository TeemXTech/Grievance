"// File deleted to restore project to previous state."
"// The following code was removed:"
"// \"use client\";"
"import { useEffect, useState, useCallback } from \"react\";"
"import { useRouter, useSearchParams } from \"next/navigation\";"
"import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from \"@/components/ui/select\";"
"import { Input } from \"@/components/ui/input\";"
"import { Button } from \"@/components/ui/button\";"
"import { Calendar } from \"lucide-react\";"
"import { Skeleton } from \"@/components/ui/skeleton\";"
""
"export type FilterState = {"
"  constituency: string;"
"  status: \"all\" | \"resolved\" | \"in_progress\" | \"pending\";"
"  priority: \"all\" | \"urgent\" | \"high\" | \"medium\" | \"low\";"
"  from: string;"
"  to: string;"
"  q: string;"
"};"
""
"const statusOptions = ["
"  { value: \"all\", label: \"All\" },"
"  { value: \"resolved\", label: \"Resolved\" },"
"  { value: \"in_progress\", label: \"In Progress\" },"
"  { value: \"pending\", label: \"Pending\" },"
"];"
"const priorityOptions = ["
"  { value: \"all\", label: \"All\" },"
"  { value: \"urgent\", label: \"Urgent\" },"
"  { value: \"high\", label: \"High\" },"
"  { value: \"medium\", label: \"Medium\" },"
"  { value: \"low\", label: \"Low\" },"
"];"
"const datePresets = ["
"  { label: \"This Week\", value: \"this_week\" },"
"  { label: \"This Month\", value: \"this_month\" },"
"  { label: \"Last 30 Days\", value: \"last30\" },"
"];"
""
"export default function FilterBar({"
"  filter,"
"  setFilter,"
"  constituencies,"
"  loadingConstituencies,"
"}: {"
"  filter: FilterState;"
"  setFilter: (f: FilterState) => void;"
"  constituencies: { id: string; name: string }[];"
"  loadingConstituencies: boolean;"
"}) {"
"  const [search, setSearch] = useState(filter.q);"
"  const router = useRouter();"
"  const params = useSearchParams();"
""
"  // Debounce search"
"  useEffect(() => {"
"    const handler = setTimeout(() => {"
"      setFilter({ ...filter, q: search });"
"    }, 300);"
"    return () => clearTimeout(handler);"
"  }, [search]);"
""
"  // Sync state from URL on mount"
"  useEffect(() => {"
"    // ...to be implemented with useQuerySync"
"  }, []);"
""
"  return ("
"    <div className=\"flex flex-wrap gap-2 items-center\">"
"      {/* Constituency Select */}"
"      <div className=\"min-w-[180px]\">"
"        {loadingConstituencies ? ("
"          <Skeleton className=\"h-10 w-full rounded\" />"
"        ) : ("
"          <Select"
"            value={filter.constituency}"
"            onValueChange={v => setFilter({ ...filter, constituency: v })}"
"          >"
"            <SelectTrigger>"
"              <SelectValue placeholder=\"Select Constituency\" />"
"            </SelectTrigger>"
"            <SelectContent>"
"              {constituencies.map(c => ("
"                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>"
"              ))}"
"            </SelectContent>"
"          </Select>"
"        )}"
"      </div>"
"      {/* Status Select */}"
"      <Select"
"        value={filter.status}"
"        onValueChange={v => setFilter({ ...filter, status: v as FilterState[\"status\"] })}"
"      >"
"        <SelectTrigger>"
"          <SelectValue />"
"        </SelectTrigger>"
"        <SelectContent>"
"          {statusOptions.map(opt => ("
"            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>"
"          ))}"
"        </SelectContent>"
"      </Select>"
"      {/* Priority Select */}"
"      <Select"
"        value={filter.priority}"
"        onValueChange={v => setFilter({ ...filter, priority: v as FilterState[\"priority\"] })}"
"      >"
"        <SelectTrigger>"
"          <SelectValue />"
"        </SelectTrigger>"
"        <SelectContent>"
"          {priorityOptions.map(opt => ("
"            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>"
"          ))}"
"        </SelectContent>"
"      </Select>"
"      {/* Date Range Picker (presets only for now) */}"
"      <Select"
"        value={filter.from + \",\" + filter.to}"
"        onValueChange={v => {"
"          // TODO: handle preset and custom"
"        }}"
"      >"
"        <SelectTrigger>"
"          <SelectValue placeholder=\"Date Range\" />"
"        </SelectTrigger>"
"        <SelectContent>"
"          {datePresets.map(opt => ("
"            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>"
"          ))}"
"        </SelectContent>"
"      </Select>"
"      {/* Search Input */}"
"      <Input"
"        className=\"w-48\""
"        placeholder=\"Search...\""
"        value={search}"
"        onChange={e => setSearch(e.target.value)}"
"      />"
"      {/* Filters Applied Pill (to be implemented) */}"
"    </div>"
"  );"
"}"
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export type FilterState = {
  constituency: string;
  status: "all" | "resolved" | "in_progress" | "pending";
  priority: "all" | "urgent" | "high" | "medium" | "low";
  from: string;
  to: string;
  q: string;
};

const statusOptions = [
  { value: "all", label: "All" },
  { value: "resolved", label: "Resolved" },
  { value: "in_progress", label: "In Progress" },
  { value: "pending", label: "Pending" },
];
const priorityOptions = [
  { value: "all", label: "All" },
  { value: "urgent", label: "Urgent" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];
const datePresets = [
  { label: "This Week", value: "this_week" },
  { label: "This Month", value: "this_month" },
  { label: "Last 30 Days", value: "last30" },
];

export default function FilterBar({
  filter,
  setFilter,
  constituencies,
  loadingConstituencies,
}: {
  filter: FilterState;
  setFilter: (f: FilterState) => void;
  constituencies: { id: string; name: string }[];
  loadingConstituencies: boolean;
}) {
  const [search, setSearch] = useState(filter.q);
  const router = useRouter();
  const params = useSearchParams();

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilter({ ...filter, q: search });
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Sync state from URL on mount
  useEffect(() => {
    // ...to be implemented with useQuerySync
  }, []);

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Constituency Select */}
      <div className="min-w-[180px]">
        {loadingConstituencies ? (
          <Skeleton className="h-10 w-full rounded" />
        ) : (
          <Select
            value={filter.constituency}
            onValueChange={v => setFilter({ ...filter, constituency: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Constituency" />
            </SelectTrigger>
            <SelectContent>
              {constituencies.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      {/* Status Select */}
      <Select
        value={filter.status}
        onValueChange={v => setFilter({ ...filter, status: v as FilterState["status"] })}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {/* Priority Select */}
      <Select
        value={filter.priority}
        onValueChange={v => setFilter({ ...filter, priority: v as FilterState["priority"] })}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {priorityOptions.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {/* Date Range Picker (presets only for now) */}
      <Select
        value={filter.from + "," + filter.to}
        onValueChange={v => {
          // TODO: handle preset and custom
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder="Date Range" />
        </SelectTrigger>
        <SelectContent>
          {datePresets.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {/* Search Input */}
      <Input
        className="w-48"
        placeholder="Search..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      {/* Filters Applied Pill (to be implemented) */}
    </div>
  );
}
