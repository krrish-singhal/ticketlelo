"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Ticket,
  X,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "@/lib/firestore";

export function EventManagement() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    location: "",
    totalTickets: 0,
    isActive: true,
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const allEvents = await getAllEvents();
      setEvents(allEvents);
    } catch (error) {
      console.error("Failed to load events:", error);
      toast.error("Failed to load events");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, {
          ...formData,
          date: new Date(formData.date),
          totalTickets: parseInt(formData.totalTickets),
        });
        toast.success("Event updated successfully");
      } else {
        await createEvent({
          ...formData,
          date: new Date(formData.date),
          totalTickets: parseInt(formData.totalTickets),
        });
        toast.success("Event created successfully");
      }
      resetForm();
      loadEvents();
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error(error.message || "Failed to save event");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    let dateStr = "";
    try {
      const d = event.date?.toDate ? event.date.toDate() : new Date(event.date);
      if (!isNaN(d)) dateStr = d.toISOString().split("T")[0];
    } catch {
      dateStr = "";
    }

    setFormData({
      name: event.name,
      description: event.description,
      date: dateStr,
      location: event.location,
      totalTickets: event.totalTickets,
      isActive: event.isActive,
    });
    setIsCreating(true);
  };

  const handleDelete = async (eventId) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      await deleteEvent(eventId);
      toast.success("Event deleted successfully");
      loadEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      date: "",
      location: "",
      totalTickets: 0,
      isActive: true,
    });
    setEditingEvent(null);
    setIsCreating(false);
  };

  if (isLoading && events.length === 0) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center opacity-0 animate-fade-in-up">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Events
          </h2>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            Create and manage your events
          </p>
        </div>
        {!isCreating && (
          <Button
            onClick={() => setIsCreating(true)}
            className="gap-2 h-11 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all rounded-xl"
          >
            <Plus className="w-4 h-4" />
            Create Event
          </Button>
        )}
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <div className="rounded-2xl border border-violet-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 backdrop-blur p-8 opacity-0 animate-scale-in shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                {editingEvent ? (
                  <Edit className="w-5 h-5 text-white" />
                ) : (
                  <Plus className="w-5 h-5 text-white" />
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingEvent ? "Edit Event" : "Create New Event"}
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
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Event Name *
              </label>
              <div className="relative input-glow rounded-xl">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter event name"
                  required
                  className="h-12 pl-10 bg-white dark:bg-slate-900 border-violet-200 dark:border-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:border-violet-500 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Description *
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe your event..."
                required
                className="min-h-[100px] bg-white dark:bg-slate-900 border-violet-200 dark:border-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:border-violet-500 rounded-xl resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Date *
                </label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                  className="h-12 bg-white dark:bg-slate-900 border-violet-200 dark:border-slate-800 text-gray-900 dark:text-white focus:border-violet-500 rounded-xl dark:[color-scheme:dark]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Total Tickets *
                </label>
                <div className="relative input-glow rounded-xl">
                  <Ticket className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                  <Input
                    type="number"
                    value={formData.totalTickets}
                    onChange={(e) =>
                      setFormData({ ...formData, totalTickets: e.target.value })
                    }
                    placeholder="100"
                    required
                    min="1"
                    className="h-12 pl-10 bg-white dark:bg-slate-900 border-violet-200 dark:border-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:border-violet-500 rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Location *
              </label>
              <div className="relative input-glow rounded-xl">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                <Input
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="Enter event location"
                  required
                  className="h-12 pl-10 bg-white dark:bg-slate-900 border-violet-200 dark:border-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:border-violet-500 rounded-xl"
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
                Event is {formData.isActive ? "active" : "inactive"} (visible to
                public)
              </span>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/25 transition-all rounded-xl"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isLoading
                  ? "Saving..."
                  : editingEvent
                    ? "Update Event"
                    : "Create Event"}
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

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((event, i) => (
          <div
            key={event.id}
            className={`group rounded-2xl border border-violet-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-violet-300 dark:hover:border-violet-500/30 transition-all duration-300 overflow-hidden card-hover shadow-sm opacity-0 animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}
          >
            {/* Gradient bar */}
            <div
              className={`h-1 ${event.isActive ? "bg-gradient-to-r from-violet-500 to-purple-500" : "bg-gray-200 dark:bg-slate-700"}`}
            />

            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    {event.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {event.description}
                  </p>
                </div>
                <span
                  className={`ml-4 shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${
                    event.isActive
                      ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                      : "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-500 border border-gray-200 dark:border-slate-700"
                  }`}
                >
                  {event.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="space-y-2.5 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-violet-500 dark:text-violet-400" />
                  </div>
                  <span className="text-gray-700 dark:text-slate-300">
                    {(event.date?.toDate
                      ? event.date.toDate()
                      : new Date(event.date)
                    ).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                  </div>
                  <span className="text-gray-700 dark:text-slate-300">
                    {event.location}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                    <Ticket className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  </div>
                  <span className="text-gray-700 dark:text-slate-300">
                    {event.totalTickets} tickets
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(event)}
                  className="flex-1 gap-2 h-10 border-violet-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-300 dark:hover:border-violet-500/30 hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-all rounded-xl"
                >
                  <Edit className="w-3.5 h-3.5" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(event.id)}
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

      {events.length === 0 && !isCreating && (
        <div className="text-center py-20 opacity-0 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-violet-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-10 h-10 text-violet-300 dark:text-slate-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            No Events Yet
          </h3>
          <p className="text-gray-500 dark:text-slate-400 mb-6">
            Create your first event to get started
          </p>
          <Button
            onClick={() => setIsCreating(true)}
            className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/25 rounded-xl"
          >
            <Plus className="w-4 h-4" />
            Create Event
          </Button>
        </div>
      )}
    </div>
  );
}
