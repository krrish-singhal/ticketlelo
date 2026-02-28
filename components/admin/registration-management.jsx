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
  getEvent,
  subscribeToEventRegistrations,
} from "@/lib/firestore";

export function RegistrationManagement() {
  const [events, setEvents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [registrations, setRegistrations] = useState([]);

  // IMPORTANT: Use "" instead of null
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  /* =========================
     LOAD EVENTS ON MOUNT
  ==========================*/
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const allEvents = await getAllEvents();
        setEvents(allEvents || []);
      } catch (error) {
        console.error("Error loading events:", error);
        toast.error("Failed to load events");
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, []);

  /* =========================
     LOAD BATCHES + REGISTRATIONS
  ==========================*/
  useEffect(() => {
    if (!selectedEventId) {
      setRegistrations([]);
      setBatches([]);
      return;
    }

    let unsubscribe;

    const loadData = async () => {
      try {
        const batchData = await getBatchesByEvent(selectedEventId);
        setBatches(batchData || []);

        unsubscribe = subscribeToEventRegistrations(
          selectedEventId,
          (regData) => {
            setRegistrations(regData || []);
          },
        );
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load registrations");
      }
    };

    loadData();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [selectedEventId]);

  /* =========================
     FILTERING
  ==========================*/
  const filteredRegistrations = registrations.filter((reg) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      (reg.fullName || "").toLowerCase().includes(search) ||
      (reg.email || "").toLowerCase().includes(search) ||
      (reg.whatsappPhone || "").includes(search) ||
      (reg.ticketId || "").includes(search);

    const matchesBatch =
      selectedBatchId === "" || reg.batchId === selectedBatchId;

    return matchesSearch && matchesBatch;
  });

  /* =========================
     EXPORT TO EXCEL
  ==========================*/
  const exportToExcel = async () => {
    if (filteredRegistrations.length === 0) {
      toast.error("No registrations to export");
      return;
    }

    setIsExporting(true);

    try {
      const eventData = await getEvent(selectedEventId);

      const exportData = filteredRegistrations.map((reg) => ({
        "Ticket ID": reg.ticketId || "",
        "Full Name": reg.fullName || "",
        Email: reg.email || "",
        "WhatsApp Phone": reg.whatsappPhone || "",
        Event: eventData?.name || "Unknown",
        Status: reg.status || "",
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

      const fileName = `registrations-${
        eventData?.name || "export"
      }-${new Date().toISOString().split("T")[0]}.xlsx`;

      XLSX.writeFile(workbook, fileName);

      toast.success("Registrations exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export registrations");
    } finally {
      setIsExporting(false);
    }
  };

  /* =========================
     STATS
  ==========================*/
  const stats = {
    total: filteredRegistrations.length,
    used: filteredRegistrations.filter((r) => r.status === "Used").length,
    unused: filteredRegistrations.filter((r) => r.status === "Unused").length,
  };

  /* =========================
     UI
  ==========================*/
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-extrabold">Registrations</h2>
        <p className="text-gray-500 mt-1">
          View and manage event registrations
        </p>
      </div>

      {/* EVENT SELECT */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Event
          </label>

          <Select
            value={selectedEventId}
            onValueChange={(val) => {
              setSelectedEventId(val);
              setSelectedBatchId("");
            }}
          >
            <SelectTrigger>
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

        {/* BATCH SELECT */}
        {selectedEventId && (
          <div>
            <label className="text-sm font-medium">Batch</label>

            <Select
              value={selectedBatchId}
              onValueChange={(val) =>
                setSelectedBatchId(val === "__all__" ? "" : val)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All batches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Batches</SelectItem>
                {batches.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* SEARCH */}
        <div>
          <label className="text-sm font-medium flex items-center gap-1">
            <Search className="w-3.5 h-3.5" /> Search
          </label>

          <Input
            placeholder="Name, email, ticket ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* EXPORT */}
        {selectedEventId && (
          <div className="flex items-end">
            <Button
              onClick={exportToExcel}
              disabled={isExporting || filteredRegistrations.length === 0}
              className="w-full"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export to Excel
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* STATS */}
      {selectedEventId && (
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 border rounded-xl text-center">
            <Users className="mx-auto mb-2" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p>Total</p>
          </div>

          <div className="p-4 border rounded-xl text-center">
            <CheckCircle2 className="mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold text-green-600">{stats.used}</p>
            <p>Scanned</p>
          </div>

          <div className="p-4 border rounded-xl text-center">
            <Clock className="mx-auto mb-2 text-yellow-600" />
            <p className="text-2xl font-bold text-yellow-600">{stats.unused}</p>
            <p>Pending</p>
          </div>
        </div>
      )}

      {/* REGISTRATIONS TABLE */}
      {selectedEventId && (
        <div className="rounded-2xl border border-violet-100 bg-white overflow-hidden mt-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Ticket ID
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Full Name
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Registered
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-violet-500" />
                    </td>
                  </tr>
                ) : filteredRegistrations.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-gray-500"
                    >
                      <div className="w-12 h-12 rounded-full bg-violet-50 flex items-center justify-center mx-auto mb-3">
                        <Ticket className="w-6 h-6 text-violet-300" />
                      </div>
                      No registrations found
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map((reg) => (
                    <tr
                      key={reg.id}
                      className="hover:bg-violet-50 transition-colors"
                    >
                      <td className="px-5 py-4 text-sm font-mono text-violet-600">
                        {reg.ticketId}
                      </td>
                      <td className="px-5 py-4 text-sm font-medium">
                        {reg.fullName || "-"}
                      </td>
                      <td className="px-5 py-4 text-sm">{reg.email || "-"}</td>
                      <td className="px-5 py-4 text-sm">
                        {reg.whatsappPhone || "-"}
                      </td>
                      <td className="px-5 py-4 text-sm">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${reg.status === "Used" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}
                        >
                          {reg.status === "Used" ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {reg.status || "-"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
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
      )}

      {!selectedEventId && (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full bg-violet-50 flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-violet-300" />
          </div>
          <h3 className="text-2xl font-bold">Select an Event</h3>
          <p className="text-gray-500">
            Choose an event above to view registrations
          </p>
        </div>
      )}
    </div>
  );
}
