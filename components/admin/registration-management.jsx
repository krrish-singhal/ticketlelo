"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Download,
  Search,
  Users,
  CheckCircle2,
  Clock,
  Ticket,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import {
  getAllEvents,
  getBatchesByEvent,
  getRegistrationsByEvent,
  getEvent,
  subscribeToEventRegistrations,
} from "@/lib/firestore";

export function RegistrationManagement() {
  const [events, setEvents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadBatches();
      const unsubscribe = subscribeToEventRegistrations(
        selectedEventId,
        (regData) => {
          setRegistrations(regData);
        },
      );
      return () => {
        unsubscribe();
      };
    } else {
      setRegistrations([]);
      setBatches([]);
    }
  }, [selectedEventId]);

  const loadEvents = async () => {
    try {
      const allEvents = await getAllEvents();
      setEvents(allEvents);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading events:", error);
      toast.error("Failed to load events");
      setIsLoading(false);
    }
  };

  const loadBatches = async () => {
    try {
      const batchData = await getBatchesByEvent(selectedEventId);
      setBatches(batchData);
    } catch (error) {
      console.error("Error loading batches:", error);
      toast.error("Failed to load batches");
    }
  };

  const filteredRegistrations = registrations.filter((reg) => {
    const matchesSearch =
      reg.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.whatsappPhone.includes(searchTerm) ||
      reg.ticketId.includes(searchTerm);
    const matchesBatch = !selectedBatchId || reg.batchId === selectedBatchId;
    return matchesSearch && matchesBatch;
  });

  const exportToExcel = async () => {
    if (filteredRegistrations.length === 0) {
      toast.error("No registrations to export");
      return;
    }
    setIsExporting(true);
    try {
      const eventData = await getEvent(selectedEventId);
      const exportData = filteredRegistrations.map((reg) => ({
        "Ticket ID": reg.ticketId,
        "Full Name": reg.fullName,
        Email: reg.email,
        "WhatsApp Phone": reg.whatsappPhone,
        Event: eventData?.name || "Unknown",
        Status: reg.status,
        "Registered Date": reg.createdAt?.toDate
          ? reg.createdAt.toDate().toLocaleDateString()
          : reg.createdAt
            ? new Date(reg.createdAt).toLocaleDateString()
            : "N/A",
        "Used Date": reg.usedAt?.toDate
          ? reg.usedAt.toDate().toLocaleDateString()
          : reg.usedAt
            ? new Date(reg.usedAt).toLocaleDateString()
            : "-",
        Message: reg.message || "-",
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");
      worksheet["!cols"] = [
        { wch: 15 },
        { wch: 20 },
        { wch: 25 },
        { wch: 18 },
        { wch: 20 },
        { wch: 12 },
        { wch: 15 },
        { wch: 15 },
        { wch: 30 },
      ];
      const fileName = `registrations-${eventData?.name || "export"}-${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      toast.success("Registrations exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export registrations");
    } finally {
      setIsExporting(false);
    }
  };

  const stats = {
    total: filteredRegistrations.length,
    used: filteredRegistrations.filter((r) => r.status === "Used").length,
    unused: filteredRegistrations.filter((r) => r.status === "Unused").length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="opacity-0 animate-fade-in-up">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          Registrations
        </h2>
        <p className="text-gray-500 dark:text-slate-400 mt-1">
          View and manage event registrations
        </p>
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 opacity-0 animate-fade-in-up stagger-1">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" /> Event
          </label>
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger className="h-11 bg-white dark:bg-slate-900 border-violet-200 dark:border-slate-800 text-gray-900 dark:text-white focus:border-violet-500 rounded-xl">
              <SelectValue placeholder="Select event" />
            </SelectTrigger>
            <SelectContent>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedEventId && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
              Batch
            </label>
            <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
              <SelectTrigger className="h-11 bg-white dark:bg-slate-900 border-violet-200 dark:border-slate-800 text-gray-900 dark:text-white focus:border-violet-500 rounded-xl">
                <SelectValue placeholder="All batches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Batches</SelectItem>
                {batches.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" /> Search
          </label>
          <div className="relative input-glow rounded-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
            <Input
              placeholder="Name, email, ticket ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11 pl-10 bg-white dark:bg-slate-900 border-violet-200 dark:border-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:border-violet-500 rounded-xl"
            />
          </div>
        </div>

        {selectedEventId && (
          <div className="flex items-end">
            <Button
              onClick={exportToExcel}
              disabled={isExporting || filteredRegistrations.length === 0}
              className="w-full h-11 gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" /> Export to Excel
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {selectedEventId && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 opacity-0 animate-fade-in-up stagger-2">
            <div className="rounded-2xl border border-violet-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 text-center shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center mx-auto mb-3">
                <Users className="w-5 h-5 text-violet-500 dark:text-violet-400" />
              </div>
              <p className="text-3xl font-extrabold text-gray-900 dark:text-white">
                {stats.total}
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                Total
              </p>
            </div>
            <div className="rounded-2xl border border-violet-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 text-center shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              </div>
              <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {stats.used}
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                Scanned
              </p>
            </div>
            <div className="rounded-2xl border border-violet-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 text-center shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
                <Clock className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              </div>
              <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                {stats.unused}
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                Pending
              </p>
            </div>
          </div>

          {/* Registrations Table */}
          <div className="rounded-2xl border border-violet-100 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden opacity-0 animate-fade-in-up stagger-3 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-violet-100 dark:border-slate-800">
                    <th className="px-5 py-4 text-left text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
                      Ticket ID
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
                      Full Name
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
                      Registered
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-violet-50 dark:divide-slate-800/60">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center">
                        <Loader2 className="w-6 h-6 animate-spin text-violet-500 mx-auto" />
                      </td>
                    </tr>
                  ) : filteredRegistrations.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-12 text-center text-gray-400 dark:text-slate-500"
                      >
                        <div className="w-12 h-12 rounded-full bg-violet-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                          <Ticket className="w-6 h-6 text-violet-300 dark:text-slate-600" />
                        </div>
                        No registrations found
                      </td>
                    </tr>
                  ) : (
                    filteredRegistrations.map((reg) => (
                      <tr
                        key={reg.id}
                        className="hover:bg-violet-50/50 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="px-5 py-4 text-sm font-mono text-violet-600 dark:text-violet-400">
                          {reg.ticketId}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-900 dark:text-white font-medium">
                          {reg.fullName}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-500 dark:text-slate-400">
                          {reg.email}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-500 dark:text-slate-400">
                          {reg.whatsappPhone}
                        </td>
                        <td className="px-5 py-4 text-sm">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                              reg.status === "Used"
                                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                                : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20"
                            }`}
                          >
                            {reg.status === "Used" ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            {reg.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-500 dark:text-slate-400">
                          {reg.createdAt?.toDate
                            ? reg.createdAt.toDate().toLocaleDateString()
                            : reg.createdAt
                              ? new Date(reg.createdAt).toLocaleDateString()
                              : "N/A"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!selectedEventId && (
        <div className="text-center py-20 opacity-0 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-violet-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-violet-300 dark:text-slate-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Select an Event
          </h3>
          <p className="text-gray-500 dark:text-slate-400">
            Choose an event above to view registrations
          </p>
        </div>
      )}
    </div>
  );
}
