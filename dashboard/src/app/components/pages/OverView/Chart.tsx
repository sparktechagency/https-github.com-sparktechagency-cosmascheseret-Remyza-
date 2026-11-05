"use client";
import { useState, useRef, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { ChevronDown } from "lucide-react";

// Mock data structured by year
const multiYearData: Record<string, { name: string; ratio: number }[]> = {
  "2026": [
    { name: "Jan", ratio: 6200 },
    { name: "Feb", ratio: 7800 },
    { name: "Mar", ratio: 8500 },
    { name: "Apr", ratio: 11000 },
    { name: "May", ratio: 12200 },
    { name: "Jun", ratio: 10000 },
    { name: "Jul", ratio: 11600 },
    { name: "Aug", ratio: 13000 },
    { name: "Sep", ratio: 13800 },
    { name: "Oct", ratio: 12400 },
    { name: "Nov", ratio: 13000 },
    { name: "Dec", ratio: 14600 },
  ],
  "2025": [
    { name: "Jan", ratio: 4100 },
    { name: "Feb", ratio: 5200 },
    { name: "Mar", ratio: 6100 },
    { name: "Apr", ratio: 7800 },
    { name: "May", ratio: 8900 },
    { name: "Jun", ratio: 9200 },
    { name: "Jul", ratio: 9500 },
    { name: "Aug", ratio: 10200 },
    { name: "Sep", ratio: 11000 },
    { name: "Oct", ratio: 11500 },
    { name: "Nov", ratio: 12100 },
    { name: "Dec", ratio: 12800 },
  ],
  "2024": [
    { name: "Jan", ratio: 3000 },
    { name: "Feb", ratio: 3500 },
    { name: "Mar", ratio: 4200 },
    { name: "Apr", ratio: 5000 },
    { name: "May", ratio: 5500 },
    { name: "Jun", ratio: 6100 },
    { name: "Jul", ratio: 6400 },
    { name: "Aug", ratio: 7000 },
    { name: "Sep", ratio: 7300 },
    { name: "Oct", ratio: 8000 },
    { name: "Nov", ratio: 8500 },
    { name: "Dec", ratio: 9100 },
  ],
};

export default function Chart() {
  const [selectedYear, setSelectedYear] = useState<string>("2026");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown instantly if user clicks anywhere outside of it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeChartData = multiYearData[selectedYear] || [];

  return (
    <div className="w-full rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      {/* Chart Header Section */}
      <div className="mb-8 flex items-center justify-between">
        <h2 className="font-heading text-lg font-bold text-[#0F172A]">
          User Ratio
        </h2>

        {/* Functional Custom Dropdown Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-[#0F172A] transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200"
            aria-haspopup="true"
            aria-expanded={isDropdownOpen}
          >
            <span>{selectedYear === "2026" ? "This Year" : selectedYear}</span>
            <ChevronDown
              className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-1.5 z-30 w-36 origin-top-right rounded-xl border border-slate-100 bg-white p-1 shadow-lg ring-1 ring-black ring-opacity-5 animate-in fade-in slide-in-from-top-1 duration-100">
              {Object.keys(multiYearData)
                .sort((a, b) => b.localeCompare(a)) // Latest years first
                .map((year) => (
                  <button
                    key={year}
                    onClick={() => {
                      setSelectedYear(year);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors ${
                      selectedYear === year
                        ? "bg-slate-50 font-semibold text-[#062F87]"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {year === "2026" ? "This Year (2026)" : year}
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart Graph Frame Viewport Wrapper */}
      <div className="h-[320px] w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={activeChartData}
            margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
            barSize={24}
          >
            <CartesianGrid vertical={false} stroke="#F1F5F9" />

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748B", fontSize: 12, fontWeight: 500 }}
              dy={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748B", fontSize: 12, fontWeight: 500 }}
              domain={[0, 15000]}
              ticks={[0, 5000, 10000, 15000]}
              tickFormatter={(val) => (val === 0 ? "0" : `${val / 1000}k`)}
            />

            <Tooltip
              cursor={{ fill: "#F8FAFC", opacity: 0.5 }}
              contentStyle={{
                background: "#ffffff",
                borderRadius: "8px",
                borderColor: "#E2E8F0",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
              }}
            />

            <Bar
              dataKey="ratio"
              fill="#062F87"
              radius={[4, 4, 0, 0]}
              isAnimationActive={true} // Clean default fluid bar resizing transitions
              animationDuration={400}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
