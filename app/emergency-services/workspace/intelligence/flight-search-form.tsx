"use client";

import type { FlightSearchResult, TrackedFlight } from "@/lib/flight-tracking";
import { useMemo, useState, type FormEvent } from "react";
import { searchEmergencyFlights } from "./actions";

const inputClass =
  "mt-1.5 w-full rounded-sm border border-[#1A2B3C]/20 bg-[#F7F5F0] px-3.5 py-2.5 text-sm text-[#1A2B3C] outline-none placeholder:text-[#1A2B3C]/40 focus:border-[#1F6A64] focus:ring-2 focus:ring-[#1F6A64]/20";

function defaultDates() {
  const to = new Date();
  to.setUTCDate(to.getUTCDate() - 1);
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - 6);
  return {
    dateFrom: from.toISOString().slice(0, 10),
    dateTo: to.toISOString().slice(0, 10),
  };
}

export function FlightSearchForm() {
  const defaults = useMemo(defaultDates, []);
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FlightSearchResult | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    const response = await searchEmergencyFlights(
      new FormData(event.currentTarget),
    );

    setStatus("idle");
    if (!response.ok) {
      setResult(null);
      setError(response.error);
      return;
    }

    setResult(response);
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="rounded-sm border border-[#1A2B3C]/15 bg-[#F9F8F3] p-6 shadow-[0_24px_60px_-36px_rgba(26,43,60,0.4)] sm:p-8"
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="tailNumber" className="text-sm font-medium text-[#1A2B3C]">
              Aircraft tail number
            </label>
            <input
              id="tailNumber"
              name="tailNumber"
              required
              className={inputClass}
              placeholder="N851MB"
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="airports" className="text-sm font-medium text-[#1A2B3C]">
              Airport codes <span className="font-normal text-[#1A2B3C]/45">(optional)</span>
            </label>
            <input
              id="airports"
              name="airports"
              className={inputClass}
              placeholder="CPR, APA"
              autoComplete="off"
            />
            <p className="mt-1.5 text-xs text-[#1A2B3C]/45">
              Optional filter only. The report runs on tail number and dates.
            </p>
          </div>
          <div>
            <label htmlFor="dateFrom" className="text-sm font-medium text-[#1A2B3C]">
              From date
            </label>
            <input
              id="dateFrom"
              name="dateFrom"
              type="date"
              required
              defaultValue={defaults.dateFrom}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="dateTo" className="text-sm font-medium text-[#1A2B3C]">
              To date
            </label>
            <input
              id="dateTo"
              name="dateTo"
              type="date"
              required
              defaultValue={defaults.dateTo}
              className={inputClass}
            />
          </div>
        </div>

        {error ? (
          <p className="mt-5 rounded-sm border border-red-800/30 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={status === "loading"}
          className="mt-6 rounded-sm bg-[#1F6A64] px-6 py-2.5 text-sm font-medium tracking-wide text-[#F9F8F3] transition hover:bg-[#1A2B3C] disabled:opacity-60"
        >
          {status === "loading" ? "Searching ADS-B…" : "Search flights"}
        </button>
      </form>

      {result ? <FlightResults result={result} /> : null}
    </div>
  );
}

function FlightResults({ result }: { result: FlightSearchResult }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-[#1F6A64]">
            RESULTS
          </p>
          <h2 className="mt-1 font-serif text-xl text-[#1A2B3C]">
            {result.flights.length} flight
            {result.flights.length === 1 ? "" : "s"} matching the search
          </h2>
          <p className="mt-1 text-xs text-[#1A2B3C]/50">{result.source}</p>
        </div>
        {result.aircraft ? (
          <p className="text-sm text-[#1A2B3C]/70">
            {result.aircraft.registration}
            {result.aircraft.type ? ` · ${result.aircraft.type}` : ""}
            {` · ${result.aircraft.icao24.toUpperCase()}`}
          </p>
        ) : null}
      </div>

      {result.airports.length > 0 ? (
        <p className="text-sm text-[#1A2B3C]/65">
          Airports:{" "}
          {result.airports
            .map((airport) =>
              airport.name
                ? `${airport.icao} (${airport.iata ?? airport.input}) · ${airport.name}`
                : airport.icao,
            )
            .join(" · ")}
        </p>
      ) : null}

      {result.notice ? (
        <p className="rounded-sm border border-[#C4A574]/50 bg-[#C4A574]/10 px-4 py-3 text-sm leading-6 text-[#1A2B3C]">
          {result.notice}
        </p>
      ) : null}

      {result.flights.length > 0 ? (
        <div className="overflow-x-auto rounded-sm border border-[#1A2B3C]/12 bg-[#F9F8F3]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#1A2B3C]/10 text-xs uppercase tracking-[0.12em] text-[#1A2B3C]/45">
              <tr>
                <th className="px-4 py-3 font-semibold">Tail / hex</th>
                <th className="px-4 py-3 font-semibold">Callsign</th>
                <th className="px-4 py-3 font-semibold">First seen</th>
                <th className="px-4 py-3 font-semibold">Last seen</th>
                <th className="px-4 py-3 font-semibold">From</th>
                <th className="px-4 py-3 font-semibold">To</th>
                <th className="px-4 py-3 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody>
              {result.flights.map((flight) => (
                <FlightRow key={flightKey(flight)} flight={flight} />
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

function FlightRow({ flight }: { flight: TrackedFlight }) {
  return (
    <tr className="border-b border-[#1A2B3C]/8 last:border-0">
      <td className="px-4 py-3 font-medium text-[#1A2B3C]">
        {flight.registration ?? "—"}
        <span className="block text-xs font-normal text-[#1A2B3C]/45">
          {flight.icao24.toUpperCase()}
        </span>
      </td>
      <td className="px-4 py-3 text-[#1A2B3C]/80">{flight.callsign ?? "—"}</td>
      <td className="px-4 py-3 text-[#1A2B3C]/80">{flight.firstSeen}</td>
      <td className="px-4 py-3 text-[#1A2B3C]/80">{flight.lastSeen}</td>
      <td className="px-4 py-3 text-[#1A2B3C]/80">{flight.departureIcao ?? "—"}</td>
      <td className="px-4 py-3 text-[#1A2B3C]/80">{flight.arrivalIcao ?? "—"}</td>
      <td className="px-4 py-3 text-[#1A2B3C]/80">
        {flight.durationMinutes != null ? `${flight.durationMinutes} min` : "—"}
      </td>
    </tr>
  );
}

function flightKey(flight: TrackedFlight): string {
  return [
    flight.icao24,
    flight.firstSeen,
    flight.lastSeen,
    flight.departureIcao,
    flight.arrivalIcao,
    flight.source,
  ].join("|");
}
