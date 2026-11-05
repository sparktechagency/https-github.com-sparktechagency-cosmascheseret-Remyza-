"use client";

import React from "react";
import { Users, Edit2, Trash2, Check, X } from "lucide-react";

// Structured TypeScript definition interface for our card payloads
export interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingCardProps {
  id: string;
  name: string;
  price: string;
  period?: string;
  subscriberCount: number;
  features: PricingFeature[];
  isPopular?: boolean;
  highlightColor?: string; // Hex code or custom color override string
  icon: React.ReactNode;
  iconBgClass: string;
  iconTextClass: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function PricingCard({
  id,
  name,
  price,
  period = "/month",
  subscriberCount,
  features,
  isPopular = false,
  highlightColor,
  icon,
  iconBgClass,
  iconTextClass,
  onEdit,
  onDelete,
}: PricingCardProps): React.JSX.Element {
  // Dynamic border calculation styling logic based on popularity variants
  const dynamicBorderStyle = isPopular
    ? { borderColor: highlightColor || "#004BCE", borderWidth: "2px" }
    : highlightColor
      ? { borderColor: highlightColor, borderWidth: "2px" }
      : { borderWidth: "1px" };

  return (
    <div
      style={dynamicBorderStyle}
      className={`rounded-[20px] p-5 bg-white flex flex-col justify-between space-y-6 transition-all hover:shadow-md relative ${
        !isPopular && !highlightColor ? "border border-slate-200/80" : ""
      } ${isPopular ? "shadow-[0_4px_20px_rgba(0,75,206,0.06)]" : "shadow-sm"}`}
    >
      {isPopular && (
        <div
          style={{
            backgroundColor: "#EEF2FF",
            color: highlightColor || "#004BCE",
            borderColor: "#DBEAFE",
          }}
          className="absolute -top-3 right-4 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold tracking-wide border z-10"
        >
          Most Popular
        </div>
      )}

      <div className="space-y-5">
        {/* Tier Name Title Strip */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-lg ${iconBgClass} ${iconTextClass}`}
            >
              {icon}
            </div>
            <span className="text-sm font-bold text-[#0F172A]">{name}</span>
          </div>
        </div>

        {/* Pricing Index Counter Layout */}
        <div className="space-y-1">
          <h4
            className={`text-3xl font-extrabold tracking-tight ${name === "Free" ? "text-slate-400" : "text-[#0F172A]"}`}
          >
            {price}
            {price.includes("$") && !price.toLowerCase().includes("free") && (
              <span className="text-xs font-medium text-slate-400 font-normal">
                {period}
              </span>
            )}
          </h4>

          <div
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
              isPopular
                ? "bg-[#EFF6FF] text-[#2563EB]"
                : name === "Trial"
                  ? "bg-[#E6F4EA] text-[#137333]"
                  : "bg-slate-50 text-slate-400"
            }`}
          >
            <Users className="h-3 w-3" />
            <span>{subscriberCount.toLocaleString()} subscribers</span>
          </div>
        </div>

        {/* Feature Check Grid List Matrix */}
        <div className="space-y-3 pt-2">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`flex items-start gap-2.5 text-[13px] ${
                feature.included
                  ? isPopular
                    ? "font-semibold text-[#0F172A]"
                    : "font-medium text-slate-600"
                  : "font-medium text-slate-300"
              }`}
            >
              {feature.included ? (
                <Check
                  style={{
                    color: isPopular
                      ? highlightColor || "#004BCE"
                      : name === "Trial"
                        ? "#10B981"
                        : "#004BCE",
                  }}
                  className="h-4 w-4 shrink-0 mt-0.5"
                  strokeWidth={2.5}
                />
              ) : (
                <X
                  className="h-4 w-4 text-slate-300 shrink-0 mt-0.5"
                  strokeWidth={2.5}
                />
              )}
              <span
                className={
                  !feature.included ? "line-through text-slate-300/90" : ""
                }
              >
                {feature.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Control Actions Management Footer Deck */}
      <div className="flex items-center gap-2.5 pt-2">
        <button
          type="button"
          onClick={() => onEdit(id)}
          style={
            isPopular ? { backgroundColor: highlightColor || "#004BCE" } : {}
          }
          className={`w-1/2 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-[0.98] ${
            isPopular
              ? "text-white hover:opacity-90 border-transparent shadow-sm"
              : "border-slate-200 bg-white hover:bg-slate-50 text-[#004BCE]"
          }`}
        >
          <Edit2 className="h-3.5 w-3.5" strokeWidth={2} />
          <span>Edit Plan</span>
        </button>

        <button
          type="button"
          onClick={() => onDelete(id)}
          className="w-1/2 py-2.5 rounded-xl border border-rose-100 bg-white hover:bg-rose-50 text-xs font-bold text-[#EF4444] flex items-center justify-center gap-1.5 transition-colors outline-none focus:ring-2 focus:ring-red-500/10 active:scale-[0.98]"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
          <span>Delete Plan</span>
        </button>
      </div>
    </div>
  );
}
