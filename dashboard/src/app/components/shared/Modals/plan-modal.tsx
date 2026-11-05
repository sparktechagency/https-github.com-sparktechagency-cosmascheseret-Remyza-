import React, { useState, useEffect, ChangeEvent } from "react";
import { X, Trash2, Plus, LayoutGrid } from "lucide-react";

// --- Interfaces ---
interface PlanFeature {
  id: string;
  text: string;
}

interface PlanData {
  id?: string;
  name: string;
  badgeColor: string;
  monthlyPrice: number;
  annualPrice: number;
  trialDays: number;
  features: PlanFeature[];
  contactLimit: number;
  messagesLimit: number;
  aiRepliesLimit: number;
  teamMembersLimit: number;
  isActive: boolean;
  showOnPricing: boolean;
}

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PlanData | null; // null = Add New, Plan object = Edit
  onSave: (data: PlanData) => void;
  onDelete: (id: string) => void;
}

export default function PlanModal({
  isOpen,
  onClose,
  plan,
  onSave,
  onDelete,
}: PlanModalProps): React.JSX.Element | null {
  // --- Form State ---
  const [formData, setFormData] = useState<PlanData>({
    name: "",
    badgeColor: "#94A3BB",
    monthlyPrice: 0,
    annualPrice: 0,
    trialDays: 0,
    features: [],
    contactLimit: 0,
    messagesLimit: 0,
    aiRepliesLimit: 0,
    teamMembersLimit: 0,
    isActive: true,
    showOnPricing: true,
  });

  const [newFeatureText, setNewFeatureText] = useState("");

  // Sync state when modal opens with a plan
  useEffect(() => {
    if (plan) {
      setFormData(plan);
    } else {
      setFormData({
        name: "",
        badgeColor: "#94A3BB",
        monthlyPrice: 0,
        annualPrice: 0,
        trialDays: 0,
        features: [],
        contactLimit: 0,
        messagesLimit: 0,
        aiRepliesLimit: 0,
        teamMembersLimit: 0,
        isActive: true,
        showOnPricing: true,
      });
    }
  }, [plan, isOpen]);

  if (!isOpen) return null;

  // --- Handlers ---
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleToggle = (field: "isActive" | "showOnPricing") => {
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const addFeature = () => {
    if (!newFeatureText.trim()) return;
    const newFeature: PlanFeature = {
      id: Math.random().toString(36).substr(2, 9),
      text: newFeatureText.trim(),
    };
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, newFeature],
    }));
    setNewFeatureText("");
  };

  const removeFeature = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f.id !== id),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">
            {plan ? `Edit ${formData.name} Plan` : "Create New Plan"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 scrollbar-thin scrollbar-thumb-slate-200">
          {/* SECTION: PLAN DETAILS */}
          <section className="space-y-4">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Plan Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-500 ml-1">
                  Plan Name
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 bg-slate-50/30"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-500 ml-1">
                  Badge Color
                </label>
                <input
                  name="badgeColor"
                  value={formData.badgeColor}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 bg-slate-50/30"
                />
              </div>
            </div>
          </section>

          {/* SECTION: PRICE CONFIGURATION */}
          <section className="space-y-4">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Price Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-500 ml-1">
                  Monthly Price ($)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    $
                  </span>
                  <input
                    type="number"
                    name="monthlyPrice"
                    value={formData.monthlyPrice}
                    onChange={handleInputChange}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-500 ml-1">
                  Annual Price ($)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    $
                  </span>
                  <input
                    type="number"
                    name="annualPrice"
                    value={formData.annualPrice}
                    onChange={handleInputChange}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-500 ml-1">
                  Trial Days
                </label>
                <input
                  type="number"
                  name="trialDays"
                  value={formData.trialDays}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </section>

          {/* SECTION: PLAN FEATURES */}
          <section className="space-y-4">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Plan Features
            </h3>
            <div className="space-y-2 border border-slate-100 rounded-2xl p-4 bg-slate-50/30">
              {formData.features.map((feature) => (
                <div
                  key={feature.id}
                  className="flex items-center justify-between group py-1"
                >
                  <div className="flex items-center gap-3">
                    <LayoutGrid className="w-4 h-4 text-slate-300" />
                    <span className="text-sm text-slate-600">
                      {feature.text}
                    </span>
                  </div>
                  <button
                    onClick={() => removeFeature(feature.id)}
                    className="text-rose-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <input
                  placeholder="Add a new feature..."
                  value={newFeatureText}
                  onChange={(e) => setNewFeatureText(e.target.value)}
                  className="flex-1 bg-white px-4 py-2 text-sm rounded-xl border border-slate-200 outline-none"
                  onKeyPress={(e) => e.key === "Enter" && addFeature()}
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="text-blue-600 text-sm font-bold flex items-center gap-1.5 hover:text-blue-700 transition-colors px-2"
                >
                  <Plus className="w-4 h-4" strokeWidth={3} /> Add Feature
                </button>
              </div>
            </div>
          </section>

          {/* SECTION: LIMITS CONFIGURATION */}
          <section className="space-y-4">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Limits Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-500 ml-1">
                  Contact Limit
                </label>
                <input
                  type="number"
                  name="contactLimit"
                  value={formData.contactLimit}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-500 ml-1">
                  Messages per Month
                </label>
                <input
                  type="number"
                  name="messagesLimit"
                  value={formData.messagesLimit}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-500 ml-1">
                  Team Members
                </label>
                <input
                  type="number"
                  name="teamMembersLimit"
                  value={formData.teamMembersLimit}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </section>

          {/* SECTION: STATUS */}
          <section className="space-y-4">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Status
            </h3>
            <div className="space-y-5 px-1">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-700">
                    Plan Status
                  </h4>
                  <p className="text-xs text-slate-400">
                    Users can subscribe to this plan
                  </p>
                </div>
                <button
                  onClick={() => handleToggle("isActive")}
                  className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${formData.isActive ? "bg-emerald-500" : "bg-slate-200"}`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${formData.isActive ? "translate-x-5" : ""}`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-700">
                    Show on Pricing Page
                  </h4>
                  <p className="text-xs text-slate-400">
                    Visible to new users during signup
                  </p>
                </div>
                <button
                  onClick={() => handleToggle("showOnPricing")}
                  className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${formData.showOnPricing ? "bg-emerald-500" : "bg-slate-200"}`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${formData.showOnPricing ? "translate-x-5" : ""}`}
                  />
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <button
            onClick={() => plan?.id && onDelete(plan.id)}
            className="flex items-center gap-2 text-rose-500 text-sm font-bold hover:text-rose-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Delete Plan
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(formData)}
              className="px-6 py-2.5 text-sm font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
