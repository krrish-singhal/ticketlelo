"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { signup, getUserByEmail } from "@/lib/auth";
import {
  createRegistration,
  checkDuplicateRegistration,
  getEvent,
  getBatchesByEvent,
} from "@/lib/firestore";
import { sendRegistrationConfirmation } from "@/lib/email";
import { generateQRCode } from "@/lib/qr";
import {
  User,
  Mail,
  Phone,
  MessageSquare,
  ChevronDown,
  Loader2,
  Sparkles,
} from "lucide-react";

/* ─── Country codes ─── */
const COUNTRY_CODES = [
  { code: "+91", country: "India", flag: "🇮🇳", len: 10 },
  { code: "+1", country: "United States", flag: "🇺🇸", len: 10 },
  { code: "+44", country: "United Kingdom", flag: "🇬🇧", len: 10 },
  { code: "+1", country: "Canada", flag: "🇨🇦", len: 10 },
  { code: "+61", country: "Australia", flag: "🇦🇺", len: 9 },
  { code: "+49", country: "Germany", flag: "🇩🇪", len: 11 },
  { code: "+33", country: "France", flag: "🇫🇷", len: 9 },
  { code: "+39", country: "Italy", flag: "🇮🇹", len: 10 },
  { code: "+34", country: "Spain", flag: "🇪🇸", len: 9 },
  { code: "+31", country: "Netherlands", flag: "🇳🇱", len: 9 },
  { code: "+971", country: "UAE", flag: "🇦🇪", len: 9 },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦", len: 9 },
  { code: "+92", country: "Pakistan", flag: "🇵🇰", len: 10 },
  { code: "+880", country: "Bangladesh", flag: "🇧🇩", len: 10 },
  { code: "+94", country: "Sri Lanka", flag: "🇱🇰", len: 9 },
  { code: "+977", country: "Nepal", flag: "🇳🇵", len: 10 },
  { code: "+65", country: "Singapore", flag: "🇸🇬", len: 8 },
  { code: "+60", country: "Malaysia", flag: "🇲🇾", len: 10 },
  { code: "+62", country: "Indonesia", flag: "🇮🇩", len: 11 },
  { code: "+81", country: "Japan", flag: "🇯🇵", len: 10 },
];

const registrationSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  whatsappPhone: z.string().min(8, "Phone number is too short"),
  eventId: z.string().min(1, "Please select an event"),
  batchId: z.string().min(1, "Please select a batch"),
  message: z.string().optional(),
});

export function RegistrationForm({ events, preSelectedEventId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [batches, setBatches] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(
    preSelectedEventId || "",
  );
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [countryOpen, setCountryOpen] = useState(false);
  const [phoneValue, setPhoneValue] = useState("");
  const nextFieldRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(registrationSchema),
    defaultValues: { eventId: preSelectedEventId || "" },
  });

  useEffect(() => {
    if (preSelectedEventId) {
      setSelectedEventId(preSelectedEventId);
      setValue("eventId", preSelectedEventId);
      loadBatches(preSelectedEventId);
    }
  }, [preSelectedEventId, setValue]);

  const loadBatches = async (eventId) => {
    try {
      const batchData = await getBatchesByEvent(eventId);
      setBatches(batchData);
    } catch (error) {
      console.error("Error loading batches:", error);
      toast.error("Failed to load batch options");
    }
  };

  const handleEventChange = async (newEventId) => {
    setSelectedEventId(newEventId);
    setValue("eventId", newEventId);
    setSelectedBatchId("");
    setValue("batchId", "");
    if (newEventId) await loadBatches(newEventId);
    else setBatches([]);
  };

  const handleBatchChange = (batchId) => {
    setSelectedBatchId(batchId);
    setValue("batchId", batchId);
  };

  const handlePhoneChange = useCallback(
    (e) => {
      const digits = e.target.value.replace(/\D/g, "");
      const maxLen = selectedCountry.len;
      const trimmed = digits.slice(0, maxLen);
      setPhoneValue(trimmed);
      setValue("whatsappPhone", selectedCountry.code + trimmed, {
        shouldValidate: trimmed.length >= maxLen,
      });
      if (trimmed.length >= maxLen && nextFieldRef.current) {
        nextFieldRef.current.focus();
      }
    },
    [selectedCountry, setValue],
  );

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const isDuplicate = await checkDuplicateRegistration(
        data.email,
        data.eventId,
      );
      if (isDuplicate) {
        toast.error("You are already registered for this event");
        setIsLoading(false);
        return;
      }

      let user = await getUserByEmail(data.email);
      if (!user) {
        user = await signup(
          data.email,
          Math.random().toString(36).slice(-8),
          data.fullName,
          data.whatsappPhone,
        );
      }

      const ticketId = `TKT-${Date.now()}-${Math.random().toString(36).slice(2, 11).toUpperCase()}`;
      const qrCode = await generateQRCode(ticketId);

      await createRegistration({
        userId: user.id,
        eventId: data.eventId,
        batchId: data.batchId,
        ticketId,
        fullName: data.fullName,
        email: data.email,
        whatsappPhone: data.whatsappPhone,
        message: data.message,
        status: "Unused",
        qrCode,
      });

      const eventData = await getEvent(data.eventId);
      if (!eventData) throw new Error("Event not found");

      const emailSent = await sendRegistrationConfirmation(
        data.email,
        data.fullName,
        eventData.name,
        ticketId,
      );

      if (emailSent) {
        toast.success(
          "Registration successful! Check your email for the PDF ticket.",
        );
      } else {
        toast.success(
          "Registration successful! You can download your ticket from the dashboard.",
        );
      }

      reset();
      setPhoneValue("");
      if (!preSelectedEventId) {
        setSelectedEventId("");
        setBatches([]);
      }
      setSelectedBatchId("");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 w-full">
      {/* Full Name */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
          Full Name *
        </label>
        <div className="relative input-glow rounded-xl">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
          <Input
            placeholder="Enter your full name"
            {...register("fullName")}
            disabled={isLoading}
            className="h-12 pl-10 bg-white dark:bg-slate-900 border-violet-200 dark:border-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:border-violet-500 rounded-xl"
          />
        </div>
        {errors.fullName && (
          <p className="text-sm text-red-500 dark:text-red-400">
            {errors.fullName.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
          Email *
        </label>
        <div className="relative input-glow rounded-xl">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
          <Input
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            disabled={isLoading}
            className="h-12 pl-10 bg-white dark:bg-slate-900 border-violet-200 dark:border-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:border-violet-500 rounded-xl"
          />
        </div>
        {errors.email && (
          <p className="text-sm text-red-500 dark:text-red-400">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* WhatsApp Phone */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
          WhatsApp Phone *
        </label>
        <div className="flex gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setCountryOpen(!countryOpen)}
              className="h-12 px-3 flex items-center gap-1.5 border border-violet-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl text-sm text-gray-700 dark:text-slate-300 hover:border-violet-400 dark:hover:border-violet-500/50 transition-colors min-w-[100px]"
            >
              <span className="text-lg">{selectedCountry.flag}</span>
              <span className="font-medium">{selectedCountry.code}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-gray-400 dark:text-slate-500 transition-transform ${countryOpen ? "rotate-180" : ""}`}
              />
            </button>
            {countryOpen && (
              <div className="absolute left-0 top-full mt-1 w-64 max-h-52 overflow-y-auto z-50 bg-white dark:bg-slate-900 border border-violet-200 dark:border-slate-700 rounded-xl shadow-2xl shadow-violet-500/10 dark:shadow-black/50">
                {COUNTRY_CODES.map((c, idx) => (
                  <button
                    key={`${c.code}-${idx}`}
                    type="button"
                    onClick={() => {
                      setSelectedCountry(c);
                      setCountryOpen(false);
                      setPhoneValue("");
                      setValue("whatsappPhone", "");
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-violet-50 dark:hover:bg-violet-500/10 transition-colors ${selectedCountry === c ? "bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400" : "text-gray-700 dark:text-slate-300"}`}
                  >
                    <span className="text-lg">{c.flag}</span>
                    <span className="flex-1 text-left">{c.country}</span>
                    <span className="text-gray-400 dark:text-slate-500 font-mono text-xs">
                      {c.code}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative flex-1 input-glow rounded-xl">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
            <Input
              type="tel"
              placeholder={`${"0".repeat(selectedCountry.len)}`}
              value={phoneValue}
              onChange={handlePhoneChange}
              disabled={isLoading}
              maxLength={selectedCountry.len}
              className="h-12 pl-10 bg-white dark:bg-slate-900 border-violet-200 dark:border-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:border-violet-500 rounded-xl font-mono tracking-wider"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-slate-600 font-mono">
              {phoneValue.length}/{selectedCountry.len}
            </span>
          </div>
        </div>
        <input type="hidden" {...register("whatsappPhone")} />
        {errors.whatsappPhone && (
          <p className="text-sm text-red-500 dark:text-red-400">
            {errors.whatsappPhone.message}
          </p>
        )}
      </div>

      {/* Event & Batch in grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
            Select Event *
          </label>
          <Select
            value={selectedEventId}
            onValueChange={handleEventChange}
            disabled={isLoading || !!preSelectedEventId}
          >
            <SelectTrigger
              ref={nextFieldRef}
              className="h-12 bg-white dark:bg-slate-900 border-violet-200 dark:border-slate-800 text-gray-900 dark:text-white rounded-xl focus:border-violet-500"
            >
              <SelectValue placeholder="Choose an event" />
            </SelectTrigger>
            <SelectContent>
              {events
                .filter((e) => e.isActive)
                .map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          {errors.eventId && (
            <p className="text-sm text-red-500 dark:text-red-400">
              {errors.eventId.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
            Select Batch *
          </label>
          <Select
            value={selectedBatchId}
            onValueChange={handleBatchChange}
            disabled={isLoading || batches.length === 0}
          >
            <SelectTrigger className="h-12 bg-white dark:bg-slate-900 border-violet-200 dark:border-slate-800 text-gray-900 dark:text-white rounded-xl focus:border-violet-500">
              <SelectValue
                placeholder={
                  batches.length === 0 ? "Select event first" : "Choose a batch"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {batches.map((batch) => (
                <SelectItem key={batch.id} value={batch.id}>
                  {batch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.batchId && (
            <p className="text-sm text-red-500 dark:text-red-400">
              {errors.batchId.message}
            </p>
          )}
        </div>
      </div>

      {/* Message */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
          Message (Optional)
        </label>
        <div className="relative input-glow rounded-xl">
          <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400 dark:text-slate-500" />
          <Textarea
            placeholder="Any special requests or message?"
            {...register("message")}
            disabled={isLoading}
            className="pl-10 min-h-[80px] bg-white dark:bg-slate-900 border-violet-200 dark:border-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-600 focus:border-violet-500 rounded-xl resize-none"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all rounded-xl gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Registering...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Register Now
          </>
        )}
      </Button>
    </form>
  );
}
