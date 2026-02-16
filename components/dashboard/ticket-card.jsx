"use client";

import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  Download,
  CheckCircle,
  Clock,
  QrCode,
} from "lucide-react";

export function TicketCard({ registration, event }) {
  const handleDownload = () => {
    const downloadUrl = `/api/generate-ticket/${registration.ticketId}`;
    window.open(downloadUrl, "_blank");
  };

  const isUsed = registration.status === "Used";

  return (
    <div
      className={`group relative h-full flex flex-col rounded-2xl border overflow-hidden transition-all duration-300 card-hover ${
        isUsed
          ? "border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/40"
          : "border-violet-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-violet-400 dark:hover:border-violet-500/40"
      }`}
    >
      {/* Top gradient bar */}
      <div
        className={`h-1 ${isUsed ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gradient-to-r from-violet-500 to-purple-500"}`}
      />

      <div className="p-6 flex flex-col flex-1">
        {/* Status Badge */}
        <div className="flex justify-between items-start mb-4">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
              isUsed
                ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                : "bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20"
            }`}
          >
            {isUsed ? (
              <CheckCircle className="w-3.5 h-3.5" />
            ) : (
              <Clock className="w-3.5 h-3.5" />
            )}
            {registration.status}
          </span>
        </div>

        {/* Event Details */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-1">
          {event.name}
        </h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-4 line-clamp-2 min-h-[2.5rem]">
          {event.description}
        </p>

        {/* Event Info */}
        <div className="space-y-2.5 mb-5">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
            <span className="text-gray-600 dark:text-slate-300 truncate">
              {event.date?.toDate
                ? event.date
                    .toDate()
                    .toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                : new Date(event.date).toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-gray-600 dark:text-slate-300 truncate">
              {event.location}
            </span>
          </div>
        </div>

        {/* Ticket ID */}
        <div className="bg-violet-50 dark:bg-slate-800/50 rounded-xl p-3 mb-5 border border-violet-100 dark:border-slate-700/50">
          <p className="text-xs text-gray-400 dark:text-slate-500 mb-1">
            Ticket ID
          </p>
          <p className="text-sm font-mono font-medium text-violet-600 dark:text-violet-400 truncate">
            {registration.ticketId}
          </p>
        </div>

        {/* QR Code */}
        {registration.qrCode && (
          <div className="flex justify-center mb-5">
            <div className="p-3 bg-white rounded-xl shadow-md shadow-violet-500/5 dark:shadow-violet-500/10 border border-violet-100 dark:border-transparent">
              <img
                src={registration.qrCode}
                alt="QR Code"
                className="w-28 h-28"
              />
            </div>
          </div>
        )}

        {/* Spacer to push button to bottom */}
        <div className="flex-1" />

        {/* Download Button */}
        <Button
          onClick={handleDownload}
          className="w-full h-11 gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/20 transition-all rounded-xl"
        >
          <Download className="w-4 h-4" /> Download Ticket
        </Button>

        {/* Used Info */}
        {isUsed && registration.usedAt && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-800">
            <p className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1.5">
              <CheckCircle className="w-3 h-3 text-emerald-500" />
              Used on{" "}
              {registration.usedAt?.toDate
                ? registration.usedAt.toDate().toLocaleString()
                : registration.usedAt
                  ? new Date(registration.usedAt).toLocaleString()
                  : "N/A"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
