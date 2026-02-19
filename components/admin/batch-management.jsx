"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function EventDropdown({ events, value, onChange, disabled }) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState(null);
  const triggerRef = useRef(null);
  const selected = events.find((e) => e.id === value);

  // Recalculate position on open
  useEffect(() => {
    if (open && triggerRef.current) {
      setRect(triggerRef.current.getBoundingClientRect());
    }
  }, [open]);

  // Close on scroll/resize
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const dropdown =
    open &&
    rect &&
    createPortal(
      <>
        {/* Overlay */}
        <div
          className="fixed inset-0 z-[9998]"
          onClick={() => setOpen(false)}
        />
        {/* Dropdown list */}
        <div
          style={{
            position: "fixed",
            top: rect.bottom + 6,
            left: rect.left,
            width: rect.width,
            zIndex: 9999,
          }}
          className="rounded-xl border border-violet-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden"
        >
          <div className="max-h-60 overflow-auto p-1">
            {events.map((event) => {
              const isSelected = event.id === value;
              return (
                <div
                  key={event.id}
                  onClick={() => {
                    onChange(event.id);
                    setOpen(false);
                  }}
                  className={[
                    "relative flex cursor-pointer select-none items-center rounded-lg px-3 py-2 text-sm transition-colors",
                    isSelected
                      ? "bg-violet-50 text-violet-700 font-medium dark:bg-violet-500/10 dark:text-violet-400"
                      : "text-gray-700 hover:bg-violet-50 hover:text-violet-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
                  ].join(" ")}
                >
                  {event.name}
                  {isSelected && (
                    <svg
                      className="ml-auto h-4 w-4 text-violet-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </>,
      document.body,
    );

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((p) => !p)}
        className={[
          "flex h-12 w-full items-center justify-between rounded-xl border px-4 py-2 text-sm transition-all bg-white dark:bg-slate-900 shadow-sm",
          open
            ? "border-violet-500 ring-2 ring-violet-500/20"
            : "border-violet-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-slate-600",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          !value
            ? "text-gray-400 dark:text-slate-500"
            : "text-gray-900 dark:text-white",
        ].join(" ")}
      >
        <span className="truncate">
          {selected ? selected.name : "Choose an event to manage batches"}
        </span>
        <svg
          className={`h-4 w-4 shrink-0 opacity-50 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {dropdown}
    </div>
  );
}

import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Layers,
  Ticket,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  createBatch,
  updateBatch,
  deleteBatch,
  getBatchesByEvent,
  getAllEvents,
} from "@/lib/firestore";

export function BatchManagement() {
  const [events, setEvents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    maxTickets: "",
    isActive: true,
  });

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadBatches();
    } else {
      setBatches([]);
    }
  }, [selectedEventId]);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const eventData = await getAllEvents();
      setEvents(eventData);
    } catch (error) {
      console.error("Error loading events:", error);
      toast.error("Failed to load events");
    } finally {
      setIsLoading(false);
    }
  };

  const loadBatches = async () => {
    setIsLoading(true);
    try {
      const batchData = await getBatchesByEvent(selectedEventId);
      setBatches(batchData);
    } catch (error) {
      console.error("Error loading batches:", error);
      toast.error("Failed to load batches");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEventId) {
      toast.error("Please select an event");
      return;
    }
    if (!formData.name.trim()) {
      toast.error("Please enter a batch name");
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      toast.error("Please select start and end dates");
      return;
    }
    const maxTickets = parseInt(formData.maxTickets);
    if (isNaN(maxTickets) || maxTickets < 1) {
      toast.error("Please enter a valid number of tickets");
      return;
    }

    setIsSubmitting(true);
    try {
      const batchData = {
        eventId: selectedEventId,
        name: formData.name.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        maxTickets,
        isActive: formData.isActive,
      };

      if (editingBatch) {
        await updateBatch(editingBatch.id, batchData);
        toast.success("Batch updated successfully");
      } else {
        await createBatch(batchData);
        toast.success("Batch created successfully");
      }
      resetForm();
      loadBatches();
    } catch (error) {
      console.error("Error saving batch:", error);
      toast.error("Failed to save batch");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (batch) => {
    setEditingBatch(batch);
    setSelectedEventId(batch.eventId);
    setFormData({
      name: batch.name,
      startDate: batch.startDate,
      endDate: batch.endDate,
      maxTickets: batch.maxTickets.toString(),
      isActive: batch.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (batchId) => {
    if (
      !confirm(
        "Are you sure you want to delete this batch? This action cannot be undone.",
      )
    )
      return;
    try {
      await deleteBatch(batchId);
      toast.success("Batch deleted successfully");
      loadBatches();
    } catch (error) {
      console.error("Error deleting batch:", error);
      toast.error("Failed to delete batch");
    }
  };

  const resetForm = () => {
    setEditingBatch(null);
    setShowForm(false);
    setFormData({
      name: "",
      startDate: "",
      endDate: "",
      maxTickets: "",
      isActive: true,
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center opacity-0 animate-fade-in-up">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Batches
          </h2>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            Create and manage event batches
          </p>
        </div>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="gap-2 h-11 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all rounded-xl"
          >
            <Plus className="w-4 h-4" />
            Create Batch
          </Button>
        )}
      </div>

      {/* Event Selector */}
      <div className="opacity-0 animate-fade-in-up stagger-1">
        <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 block">
          Select Event
        </label>
        <EventDropdown
          events={events}
          value={selectedEventId}
          onChange={setSelectedEventId}
          disabled={isLoading || !!editingBatch}
        />
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="rounded-2xl border border-violet-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 backdrop-blur p-8 opacity-0 animate-scale-in shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                {editingBatch ? (
                  <Pencil className="w-5 h-5 text-white" />
                ) : (
                  <Plus className="w-5 h-5 text-white" />
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingBatch ? "Edit Batch" : "Create New Batch"}
              </h3>
            </div>
            <button
              onClick={resetForm}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Batch Name *
                </label>
                <div className="relative input-glow rounded-xl">
                  <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                  <Input
                    placeholder="e.g., Morning Batch, Batch A"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    disabled={isSubmitting}
                    required
                    className="h-12 pl-10 bg-white dark:bg-slate-900 border-violet-200 dark:border-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:border-violet-500 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Max Tickets *
                </label>
                <div className="relative input-glow rounded-xl">
                  <Ticket className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                  <Input
                    type="number"
                    placeholder="e.g., 100"
                    value={formData.maxTickets}
                    onChange={(e) =>
                      setFormData({ ...formData, maxTickets: e.target.value })
                    }
                    disabled={isSubmitting}
                    min="1"
                    required
                    className="h-12 pl-10 bg-white dark:bg-slate-900 border-violet-200 dark:border-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:border-violet-500 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Start Date *
                </label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  disabled={isSubmitting}
                  required
                  className="h-12 bg-white dark:bg-slate-900 border-violet-200 dark:border-slate-800 text-gray-900 dark:text-white focus:border-violet-500 rounded-xl dark:[color-scheme:dark]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  End Date *
                </label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  disabled={isSubmitting}
                  min={formData.startDate}
                  required
                  className="h-12 bg-white dark:bg-slate-900 border-violet-200 dark:border-slate-800 text-gray-900 dark:text-white focus:border-violet-500 rounded-xl dark:[color-scheme:dark]"
                />
              </div>
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, isActive: !formData.isActive })
                }
                className={`relative w-11 h-6 rounded-full transition-colors ${formData.isActive ? "bg-violet-500" : "bg-gray-300 dark:bg-slate-700"}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${formData.isActive ? "translate-x-5" : ""}`}
                />
              </button>
              <span className="text-sm text-gray-600 dark:text-slate-300">
                Batch is {formData.isActive ? "active" : "inactive"}
              </span>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/25 transition-all rounded-xl"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isSubmitting
                  ? editingBatch
                    ? "Updating..."
                    : "Creating..."
                  : editingBatch
                    ? "Update Batch"
                    : "Create Batch"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="h-11 border-violet-200 dark:border-slate-800 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-violet-50 dark:hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Batches Grid */}
      {selectedEventId && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-violet-500 dark:text-violet-400" />
            Batches for {events.find((e) => e.id === selectedEventId)?.name}
          </h3>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            </div>
          ) : batches.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-violet-100 dark:border-slate-800 bg-violet-50/50 dark:bg-slate-900/40">
              <div className="w-16 h-16 rounded-full bg-violet-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <Layers className="w-8 h-8 text-violet-300 dark:text-slate-600" />
              </div>
              <p className="text-gray-500 dark:text-slate-400">
                No batches found for this event
              </p>
              <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">
                Create your first batch using the button above
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {batches.map((batch, i) => (
                <div
                  key={batch.id}
                  className={`group rounded-2xl border border-violet-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-violet-300 dark:hover:border-violet-500/30 transition-all duration-300 overflow-hidden card-hover shadow-sm opacity-0 animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}
                >
                  <div
                    className={`h-1 ${batch.isActive ? "bg-gradient-to-r from-violet-500 to-purple-500" : "bg-gray-200 dark:bg-slate-700"}`}
                  />
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                        {batch.name}
                      </h4>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          batch.isActive
                            ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                            : "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-500 border border-gray-200 dark:border-slate-700"
                        }`}
                      >
                        {batch.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-violet-500 dark:text-violet-400" />
                        </div>
                        <span className="text-gray-700 dark:text-slate-300">
                          {formatDate(batch.startDate)} —{" "}
                          {formatDate(batch.endDate)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
                          <Ticket className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                        </div>
                        <span className="text-gray-700 dark:text-slate-300">
                          {batch.maxTickets} tickets max
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(batch)}
                        className="flex-1 gap-2 h-10 border-violet-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-300 dark:hover:border-violet-500/30 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-all rounded-xl"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(batch.id)}
                        className="flex-1 gap-2 h-10 border-violet-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all rounded-xl"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!selectedEventId && !editingBatch && (
        <div className="text-center py-20 opacity-0 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-violet-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
            <Layers className="w-10 h-10 text-violet-300 dark:text-slate-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Select an Event
          </h3>
          <p className="text-gray-500 dark:text-slate-400">
            Choose an event above to view and manage its batches
          </p>
        </div>
      )}
    </div>
  );
}
