"use client";

import { useState, useEffect } from "react";
import {
  X,
  Clock,
  RotateCw,
  AlertCircle,
  CheckCircle,
  Loader2,
  Bug,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import SyncDiagnostics from "./SyncDiagnostics";

// Predefined cron schedules
const PRESETS = [
  { label: "Daily at 2 AM", value: "0 2 * * *" },
  { label: "Daily at 4 AM", value: "0 4 * * *" },
  { label: "Every 12 hours", value: "0 */12 * * *" },
  { label: "Every 6 hours", value: "0 */6 * * *" },
  { label: "Once a week (Sunday 2 AM)", value: "0 2 * * 0" },
];

export default function CronSettings({ onClose }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState("");
  const [customSchedule, setCustomSchedule] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success"); // 'success', 'error', or 'info'
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const { dark } = useTheme();

  // Set initial hour and minute values
  useEffect(() => {
    if (!customSchedule) {
      // Default to 2:00 AM if no schedule is set
      setCustomSchedule("0 2");
    }
  }, [customSchedule]);
  // Get current cron status
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/sync/status`)
      .then((res) => res.json())
      .then((data) => {
        setStatus(data);

        // If there's a current schedule, parse it
        if (data.schedule) {
          const scheduleParts = data.schedule.split(" ");

          // Check if it's one of our presets
          const matchingPreset = PRESETS.find(
            (preset) => preset.value === data.schedule
          );

          if (matchingPreset) {
            setSchedule(data.schedule);
            setUseCustom(false);
          } else {
            // Otherwise treat as custom - for our UI, we're focusing only on the hour and minute
            // Default to setting up as a daily schedule (ignoring the other cron parts)
            setCustomSchedule(`${scheduleParts[0]} ${scheduleParts[1]}`);
            setUseCustom(true);
          }
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching cron status:", err);
        setMessage("Failed to fetch cron status");
        setMessageType("error");
        setLoading(false);
      });
  }, []);
  // Handle saving the schedule
  const handleSave = async () => {
    setMessage("");
    let scheduleToSave = "";

    if (useCustom) {
      const hour = customSchedule.split(" ")[1] || "";
      const minute = customSchedule.split(" ")[0] || "";

      if (!hour || !minute) {
        setMessage("Please select both hour and minute");
        setMessageType("error");
        return;
      }

      // Create a daily cron schedule with the selected hour and minute
      scheduleToSave = `${minute} ${hour} * * *`;
    } else {
      scheduleToSave = schedule;

      if (!scheduleToSave) {
        setMessage("Please select a schedule");
        setMessageType("error");
        return;
      }
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sync/schedule`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ schedule: scheduleToSave }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage("Schedule updated successfully!");
        setMessageType("success");
        // Refresh the status
        const statusRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/sync/status`
        );
        setStatus(await statusRes.json());
      } else {
        setMessage(`Failed to update schedule: ${data.message}`);
        setMessageType("error");
      }
    } catch (err) {
      console.error("Error updating schedule:", err);
      setMessage("Error updating schedule");
      setMessageType("error");
    }
  };

  // Handle manual sync
  const handleManualSync = async () => {
    setMessage("Running sync task...");
    setMessageType("info");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/sync/codeforces`,
        {
          method: "POST",
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage(`Sync completed: ${data.message}`);
        setMessageType("success");
        // Refresh the status
        const statusRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/sync/status`
        );
        setStatus(await statusRes.json());
      } else {
        setMessage(`Failed to run sync: ${data.message}`);
        setMessageType("error");
      }
    } catch (err) {
      console.error("Error running sync:", err);
      setMessage("Error running sync");
      setMessageType("error");
    }
  };
  return (
    <div
      className={`fixed inset-0 ${
        dark ? "bg-black/70" : "bg-black/50"
      } flex items-center justify-center z-50 p-4`}
    >
      <div
        className={`relative max-w-2xl w-full rounded-lg shadow-xl ${
          dark ? "bg-gray-800 text-white" : "bg-white text-black"
        } p-6 max-h-[90vh] overflow-y-auto`}
      >
        {" "}
        {/* Close button */}{" "}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 cursor-pointer"
          aria-label="Close"
          style={{ background: "transparent" }}
        >
          <X
            size={20}
            className={`${dark ? "text-gray-400" : "text-gray-500"}`}
          />
        </button>
        {/* Header */}
        <div
          className={`mb-6 border-b ${
            dark ? "border-gray-700" : "border-gray-200"
          } pb-4`}
        >
          <h2
            className={`text-2xl font-bold flex items-center gap-2 ${
              dark ? "text-white" : "text-black"
            }`}
          >
            <Clock
              className={`${dark ? "text-indigo-400" : "text-[#160f60]"}`}
              size={24}
            />
            Codeforces Sync Settings
          </h2>
          <p className={`${dark ? "text-gray-300" : "text-gray-700"}`}>
            Configure when and how often student data is synced from Codeforces
          </p>
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2
              size={36}
              className={`animate-spin ${
                dark ? "text-indigo-400" : "text-[#160f60]"
              } mb-3`}
            />
            <p className={`${dark ? "text-gray-300" : "text-black"}`}>
              Loading cron status...
            </p>
          </div>
        ) : (
          <>
            {/* Status Card */}{" "}
            <div
              className={`mb-6 ${
                status?.active
                  ? dark
                    ? "bg-indigo-900/20 border-indigo-800/30"
                    : "bg-indigo-50 border-indigo-100"
                  : dark
                  ? "bg-yellow-900/20 border-yellow-800/30"
                  : "bg-yellow-50 border-yellow-100"
              } rounded-lg p-5 border`}
            >
              <h3
                className={`text-lg font-semibold mb-3 flex items-center gap-2 ${
                  dark ? "text-white" : "text-black"
                }`}
              >
                {status?.active ? (
                  <CheckCircle
                    size={18}
                    className={`${dark ? "text-green-400" : "text-green-600"}`}
                  />
                ) : (
                  <AlertCircle
                    size={18}
                    className={`${
                      dark ? "text-yellow-400" : "text-yellow-600"
                    }`}
                  />
                )}
                Current Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {" "}
                <div className="flex flex-col">
                  <span
                    className={`text-sm font-medium ${
                      dark ? "text-gray-400" : "text-gray-700"
                    }`}
                  >
                    Sync Service
                  </span>
                  <span
                    className={`font-semibold ${
                      status?.active
                        ? "text-green-700 dark:text-green-400"
                        : "text-yellow-700 dark:text-yellow-400"
                    }`}
                  >
                    {status?.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span
                    className={`text-sm font-medium ${
                      dark ? "text-gray-400" : "text-gray-700"
                    }`}
                  >
                    Last Sync
                  </span>
                  <span
                    className={`font-semibold ${
                      dark ? "text-gray-200" : "text-black"
                    }`}
                  >
                    {status?.lastRun
                      ? new Date(status.lastRun).toLocaleString()
                      : "Never"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span
                    className={`text-sm font-medium ${
                      dark ? "text-gray-400" : "text-gray-700"
                    }`}
                  >
                    Status
                  </span>
                  <span
                    className={`font-semibold ${
                      status?.isRunning
                        ? "text-[#160f60] dark:text-indigo-400"
                        : dark
                        ? "text-gray-300"
                        : "text-gray-800"
                    }`}
                  >
                    {status?.isRunning ? "Running" : "Idle"}
                  </span>
                </div>
              </div>
            </div>
            {/* Schedule Settings */}{" "}
            <div className="mb-6">
              <h3
                className={`text-lg font-semibold mb-4 ${
                  dark ? "text-white" : "text-black"
                }`}
              >
                Schedule Settings
              </h3>

              <div className="space-y-4 mb-6">
                <p
                  className={`text-sm font-medium mb-2 ${
                    dark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Select a preset schedule:
                </p>{" "}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {PRESETS.map((preset) => (
                    <div
                      key={preset.value}
                      className={`
                        flex items-center p-3.5 rounded-lg border cursor-pointer transition-colors
                        ${
                          !useCustom && schedule === preset.value
                            ? `border-[#160f60] ${
                                dark
                                  ? "bg-indigo-900/40 border-indigo-700"
                                  : "bg-indigo-50"
                              }`
                            : `${
                                dark
                                  ? "border-gray-700 hover:border-gray-600 hover:bg-gray-800"
                                  : "border-gray-200 hover:bg-gray-50"
                              }`
                        }
                      `}
                      onClick={() => {
                        setUseCustom(false);
                        setSchedule(preset.value);
                      }}
                    >
                      <div className="mr-3">
                        <input
                          type="radio"
                          id={`preset-${preset.value}`}
                          name="schedule"
                          className={`h-4 w-4 focus:ring-indigo-500 ${
                            dark
                              ? "border-gray-600 text-indigo-400"
                              : "border-gray-300 text-[#160f60]"
                          }`}
                          checked={!useCustom && schedule === preset.value}
                          onChange={() => {
                            setUseCustom(false);
                            setSchedule(preset.value);
                          }}
                        />
                      </div>{" "}
                      <label
                        htmlFor={`preset-${preset.value}`}
                        className="cursor-pointer w-full"
                      >
                        {" "}
                        <span
                          className={`font-medium ${
                            !useCustom && schedule === preset.value
                              ? `${dark ? "text-indigo-200" : "text-[#160f60]"}`
                              : `${dark ? "text-white" : "text-black"}`
                          }`}
                        >
                          {preset.label}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                {" "}
                <div
                  className={`
                    flex items-center p-3.5 rounded-lg border cursor-pointer transition-colors
                    ${
                      useCustom
                        ? `border-[#160f60] ${
                            dark
                              ? "bg-indigo-900/40 border-indigo-700"
                              : "bg-indigo-50"
                          }`
                        : `${
                            dark
                              ? "border-gray-700 hover:border-gray-600 hover:bg-gray-800"
                              : "border-gray-200 hover:bg-gray-50"
                          }`
                    }
                  `}
                  onClick={() => setUseCustom(true)}
                >
                  <div className="mr-3">
                    <input
                      type="radio"
                      id="custom-schedule"
                      name="schedule"
                      className={`h-4 w-4 focus:ring-indigo-500 ${
                        dark
                          ? "border-gray-600 text-indigo-400"
                          : "border-gray-300 text-[#160f60]"
                      }`}
                      checked={useCustom}
                      onChange={() => setUseCustom(true)}
                    />
                  </div>{" "}
                  <label
                    htmlFor="custom-schedule"
                    className="cursor-pointer font-medium"
                  >
                    {" "}
                    <span
                      className={`${
                        useCustom
                          ? `${dark ? "text-indigo-200" : "text-[#160f60]"}`
                          : `${dark ? "text-white" : "text-black"}`
                      }`}
                    >
                      Daily at specific time
                    </span>
                  </label>
                </div>
                <div
                  className={`mt-4 transition-all ${
                    useCustom ? "opacity-100" : "opacity-50"
                  }`}
                >
                  <div className="grid grid-cols-2 gap-4">
                    {" "}
                    {/* Hour input */}{" "}
                    <div className="space-y-1">
                      <label
                        className={`block text-sm font-medium ${
                          dark ? "text-gray-300" : "text-black"
                        }`}
                      >
                        Hour (0-23)
                      </label>{" "}
                      <div
                        className={`relative rounded-lg ${
                          useCustom
                            ? `ring-1 ${
                                dark ? "ring-indigo-500" : "ring-[#160f60]"
                              }`
                            : ""
                        }`}
                      >
                        {" "}
                        <select
                          disabled={!useCustom}
                          className={`
                            block w-full rounded-lg py-2.5 pl-3 pr-10
                            ${
                              dark
                                ? "bg-gray-700 text-white border-gray-600"
                                : "bg-white text-black border-gray-300"
                            } 
                            shadow-sm focus:outline-none ${
                              dark
                                ? "focus:border-indigo-500 focus:ring-indigo-500"
                                : "focus:border-[#160f60] focus:ring-[#160f60]"
                            } focus:ring-1 
                            disabled:opacity-50 disabled:cursor-not-allowed
                          `}
                          value={customSchedule.split(" ")[1] || ""}
                          onChange={(e) => {
                            const parts = customSchedule.split(" ");
                            parts[1] = e.target.value;
                            setCustomSchedule(parts.join(" "));
                          }}
                        >
                          <option value="" disabled>
                            Select hour
                          </option>
                          {[...Array(24)].map((_, i) => (
                            <option key={i} value={i}>
                              {i.toString().padStart(2, "0")}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>{" "}
                    {/* Minute input */}{" "}
                    <div className="space-y-1">
                      <label
                        className={`block text-sm font-medium ${
                          dark ? "text-gray-300" : "text-black"
                        }`}
                      >
                        Minute (0-59)
                      </label>{" "}
                      <div
                        className={`relative rounded-lg ${
                          useCustom
                            ? `ring-1 ${
                                dark ? "ring-indigo-500" : "ring-[#160f60]"
                              }`
                            : ""
                        }`}
                      >
                        {" "}
                        <select
                          disabled={!useCustom}
                          className={`
                            block w-full rounded-lg py-2.5 pl-3 pr-10
                            ${
                              dark
                                ? "bg-gray-700 text-white border-gray-600"
                                : "bg-white text-black border-gray-300"
                            } 
                            shadow-sm focus:outline-none ${
                              dark
                                ? "focus:border-indigo-500 focus:ring-indigo-500"
                                : "focus:border-[#160f60] focus:ring-[#160f60]"
                            } focus:ring-1 
                            disabled:opacity-50 disabled:cursor-not-allowed
                          `}
                          value={customSchedule.split(" ")[0] || ""}
                          onChange={(e) => {
                            const parts = customSchedule.split(" ");
                            parts[0] = e.target.value;
                            setCustomSchedule(parts.join(" "));
                          }}
                        >
                          <option value="" disabled>
                            Select minute
                          </option>
                          {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(
                            (i) => (
                              <option key={i} value={i}>
                                {i.toString().padStart(2, "0")}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                    </div>
                  </div>{" "}
                  <div
                    className={`mt-3 p-3 rounded-lg ${
                      dark
                        ? "bg-indigo-900/20 border-indigo-800/30"
                        : "bg-indigo-50 border-indigo-100"
                    } border`}
                  >
                    <p
                      className={`text-xs ${
                        dark ? "text-indigo-300" : "text-[#160f60]"
                      } font-semibold`}
                    >
                      This schedule will run daily at the selected time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Message */}{" "}
            {message && (
              <div
                className={`p-4 mb-6 rounded-lg flex items-start gap-3 border ${
                  messageType === "success"
                    ? `${
                        dark
                          ? "bg-green-900/20 text-green-200 border-green-800/30"
                          : "bg-green-50 text-green-800 border-green-100"
                      }`
                    : messageType === "error"
                    ? `${
                        dark
                          ? "bg-red-900/20 text-red-200 border-red-800/30"
                          : "bg-red-50 text-red-800 border-red-100"
                      }`
                    : `${
                        dark
                          ? "bg-indigo-900/20 text-indigo-200 border-indigo-800/30"
                          : "bg-indigo-50 text-[#160f60] border-indigo-100"
                      }`
                }`}
              >
                {" "}
                {messageType === "success" ? (
                  <CheckCircle
                    size={20}
                    className={`${
                      dark ? "text-green-400" : "text-green-600"
                    } mt-0.5 flex-shrink-0`}
                  />
                ) : messageType === "error" ? (
                  <AlertCircle
                    size={20}
                    className={`${
                      dark ? "text-red-400" : "text-red-600"
                    } mt-0.5 flex-shrink-0`}
                  />
                ) : (
                  <Loader2
                    size={20}
                    className={`${
                      dark ? "text-indigo-400" : "text-[#160f60]"
                    } animate-spin mt-0.5 flex-shrink-0`}
                  />
                )}
                <span className="font-medium">{message}</span>
              </div>
            )}
            {/* Action Buttons */}{" "}            <div
              className={`flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t ${
                dark ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <button
                onClick={handleSave}
                className="flex-1 bg-[#160f60] hover:bg-[#0e0940] cursor-pointer text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Clock size={18} />
                Save Schedule
              </button>{" "}
              <button
                onClick={handleManualSync}
                disabled={status?.isRunning}
                className={`
                  flex-1 border font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer
                  ${
                    status?.isRunning
                      ? `${
                          dark
                            ? "bg-gray-800 text-gray-500 cursor-not-allowed border-gray-700"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                        }`
                      : `${
                          dark
                            ? "bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                            : "bg-white hover:bg-gray-50 text-[#160f60] border-[#160f60]/30 hover:border-[#160f60]"
                        }`
                  }
                `}
              >
                {status?.isRunning ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <RotateCw size={18} />
                )}
                <span>
                  {status?.isRunning ? "Sync Running..." : "Run Sync Now"}
                </span>
              </button>
            </div>
            
            {/* Diagnostics Button */}
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setShowDiagnostics(true)}
                className={`text-sm py-1.5 px-3 rounded flex items-center cursor-pointer gap-1.5 ${
                  dark
                    ? "text-amber-300 hover:bg-amber-900/20"
                    : "text-amber-600 hover:bg-amber-50"
                }`}
              >
                <Bug size={16} />
                <span>Run Sync Diagnostics</span>
              </button>
            </div>          </>
        )}
      </div>
      
      {/* Sync Diagnostics Modal */}
      {showDiagnostics && (
        <SyncDiagnostics onClose={() => setShowDiagnostics(false)} />
      )}
    </div>
  );
}
