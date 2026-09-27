const HEXDB_REG = "https://hexdb.io/reg-hex";
const HEXDB_TYPE = "https://hexdb.io/hex-type";
const ADSB_AIRPORT = "https://api.adsb.lol/api/0/airport";
const ADSB_REG = "https://api.adsb.lol/v2/reg";
const ADSB_POINT = "https://api.adsb.lol/v2/point";
const OPENSKY_API = "https://opensky-network.org/api";
const OPENSKY_TOKEN =
  "https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token";
const FETCH_HEADERS = {
  Accept: "application/json, text/plain;q=0.9, */*;q=0.8",
  "User-Agent": "DaedalusHealthEmergencyServices/1.0 (flight-research)",
};

const KNOWN_AIRPORTS: Record<string, FlightAirport> = {
  CPR: { input: "CPR", icao: "KCPR", iata: "CPR", name: "Casper-Natrona County International Airport" },
  KCPR: { input: "KCPR", icao: "KCPR", iata: "CPR", name: "Casper-Natrona County International Airport" },
  APA: { input: "APA", icao: "KAPA", iata: "APA", name: "Centennial Airport" },
  KAPA: { input: "KAPA", icao: "KAPA", iata: "APA", name: "Centennial Airport" },
  DEN: { input: "DEN", icao: "KDEN", iata: "DEN", name: "Denver International Airport" },
  KDEN: { input: "KDEN", icao: "KDEN", iata: "DEN", name: "Denver International Airport" },
};

const TWO_DAYS = 2 * 24 * 60 * 60;
const MAX_RANGE_DAYS = 30;

export interface FlightAircraft {
  registration: string;
  icao24: string;
  type: string | null;
}

export interface FlightAirport {
  input: string;
  icao: string;
  iata: string | null;
  name: string | null;
}

export interface TrackedFlight {
  icao24: string;
  registration: string | null;
  callsign: string | null;
  firstSeen: string;
  lastSeen: string;
  durationMinutes: number | null;
  departureIcao: string | null;
  arrivalIcao: string | null;
  source: string;
}

export interface FlightSearchInput {
  tailNumber?: string;
  dateFrom?: string;
  dateTo?: string;
  airports?: string;
}

export interface FlightSearchResult {
  ok: true;
  aircraft: FlightAircraft | null;
  airports: FlightAirport[];
  flights: TrackedFlight[];
  notice: string | null;
  source: string;
}

export interface FlightSearchError {
  ok: false;
  error: string;
}

let cachedOpenSkyToken: { value: string; expiresAt: number } | null = null;

export async function searchFlights(
  input: FlightSearchInput,
): Promise<FlightSearchResult | FlightSearchError> {
  const tail = normalizeTail(input.tailNumber);
  const airportInputs = parseAirportInputs(input.airports);
  const range = parseDateRange(input.dateFrom, input.dateTo);

  if (!range.ok) return range;
  if (!tail && airportInputs.length === 0) {
    return {
      ok: false,
      error: "Enter an aircraft tail number, airport codes, or both.",
    };
  }

  const airports = (
    await Promise.all(airportInputs.map((code) => resolveAirport(code)))
  ).filter((airport): airport is FlightAirport => airport !== null);

  if (airportInputs.length > 0 && airports.length === 0) {
    return {
      ok: false,
      error:
        "Those airport codes were not recognized. Try ICAO (KCPR, KAPA) or IATA (CPR, APA).",
    };
  }

  let aircraft: FlightAircraft | null = null;
  if (tail) {
    aircraft = await resolveAircraft(tail);
    if (!aircraft) {
      return {
        ok: false,
        error: `No ADS-B identity was found for tail ${tail}. Check the registration and try again.`,
      };
    }
  }

  const historical = await searchHistoricalFlights({
    aircraft,
    airports,
    begin: range.begin,
    end: range.end,
  });

  const live = await searchLiveFlights({ aircraft, airports });
  const flights = dedupeFlights([...historical.flights, ...live]);

  const notice = [
    historical.notice,
    flights.length === 0
      ? historical.notice
        ? "No live aircraft matched this search either."
        : "No matching flights were returned for that search. OpenSky posts completed flights after overnight processing, and some HEMS legs do not carry estimated airports."
      : null,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    ok: true,
    aircraft,
    airports,
    flights,
    notice: notice || null,
    source: historical.source,
  };
}

function normalizeTail(value?: string): string | null {
  const tail = (value ?? "").trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
  return tail || null;
}

function parseAirportInputs(value?: string): string[] {
  return Array.from(
    new Set(
      (value ?? "")
        .split(/[,\s]+/)
        .map((part) => part.trim().toUpperCase())
        .filter((part) => /^[A-Z]{3,4}$/.test(part)),
    ),
  );
}

function parseDateRange(
  dateFrom?: string,
  dateTo?: string,
):
  | { ok: true; begin: number; end: number }
  | FlightSearchError {
  const today = startOfUtcDay(new Date());
  const defaultEnd = today - 1;
  const defaultBegin = defaultEnd - 6 * 24 * 60 * 60;

  const begin = dateFrom ? parseDateInput(dateFrom, false) : defaultBegin;
  const end = dateTo ? parseDateInput(dateTo, true) : defaultEnd;

  if (begin === null || end === null) {
    return { ok: false, error: "Use valid from and to dates." };
  }
  if (end <= begin) {
    return { ok: false, error: "The end date must be after the start date." };
  }
  if (end - begin > MAX_RANGE_DAYS * 24 * 60 * 60) {
    return {
      ok: false,
      error: `Limit the date range to ${MAX_RANGE_DAYS} days so the public ADS-B query stays within API limits.`,
    };
  }

  return { ok: true, begin, end };
}

function parseDateInput(value: string, endOfDay: boolean): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  const start = Math.floor(date.getTime() / 1000);
  return endOfDay ? start + 24 * 60 * 60 - 1 : start;
}

function startOfUtcDay(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) /
    1000;
}

async function resolveAircraft(tail: string): Promise<FlightAircraft | null> {
  const hex = await fetchText(`${HEXDB_REG}?reg=${encodeURIComponent(tail)}`);
  if (!hex || !/^[0-9A-Fa-f]{6}$/.test(hex)) return null;
  const type = await fetchText(`${HEXDB_TYPE}?hex=${encodeURIComponent(hex)}`);
  return {
    registration: tail,
    icao24: hex.toLowerCase(),
    type: type && !type.startsWith("<") ? type : null,
  };
}

async function resolveAirport(code: string): Promise<FlightAirport | null> {
  const known = KNOWN_AIRPORTS[code];
  if (known) {
    return { ...known, input: code };
  }

  const candidates =
    code.length === 4 ? [code] : [`K${code}`, `C${code}`, `P${code}`, `T${code}`];

  for (const icao of candidates) {
    const mapped = KNOWN_AIRPORTS[icao];
    if (mapped) {
      return { ...mapped, input: code };
    }
    const data = await fetchJson<AdsbAirport>(`${ADSB_AIRPORT}/${icao}`);
    if (data?.icao) {
      return {
        input: code,
        icao: data.icao,
        iata: data.iata ?? null,
        name: data.name ?? null,
      };
    }
  }

  if (code.length === 3) {
    return {
      input: code,
      icao: `K${code}`,
      iata: code,
      name: null,
    };
  }
  if (code.length === 4) {
    return { input: code, icao: code, iata: null, name: null };
  }

  return null;
}

async function searchHistoricalFlights(input: {
  aircraft: FlightAircraft | null;
  airports: FlightAirport[];
  begin: number;
  end: number;
}): Promise<{ flights: TrackedFlight[]; notice: string | null; source: string }> {
  const headers = await openSkyHeaders();
  const icaoSet = new Set(input.airports.map((airport) => airport.icao));
  const windows = chunkUnixRange(input.begin, input.end, TWO_DAYS - 1);
  const raw: OpenSkyFlight[] = [];
  let blocked = false;
  let unauthorized = false;

  try {
    if (input.aircraft) {
      for (const window of windows) {
        const flights = await openSkyFlights(
          `/flights/aircraft?icao24=${input.aircraft.icao24}&begin=${window.begin}&end=${window.end}`,
          headers,
        );
        if (flights === "blocked") blocked = true;
        else if (flights === "unauthorized") unauthorized = true;
        else raw.push(...flights);
      }
    } else {
      for (const airport of input.airports) {
        for (const window of windows) {
          const arrivals = await openSkyFlights(
            `/flights/arrival?airport=${airport.icao}&begin=${window.begin}&end=${window.end}`,
            headers,
          );
          const departures = await openSkyFlights(
            `/flights/departure?airport=${airport.icao}&begin=${window.begin}&end=${window.end}`,
            headers,
          );
          if (arrivals === "blocked" || departures === "blocked") blocked = true;
          if (arrivals === "unauthorized" || departures === "unauthorized") {
            unauthorized = true;
          }
          if (Array.isArray(arrivals)) raw.push(...arrivals);
          if (Array.isArray(departures)) raw.push(...departures);
        }
      }
    }
  } catch (error) {
    return {
      flights: [],
      notice:
        error instanceof Error
          ? error.message
          : "The historical ADS-B service could not be reached.",
      source: "OpenSky Network",
    };
  }

  const flights = raw
    .map((flight) => toTrackedFlight(flight, input.aircraft?.registration ?? null))
    .filter((flight) => {
      if (icaoSet.size === 0) return true;
      return (
        (flight.departureIcao && icaoSet.has(flight.departureIcao)) ||
        (flight.arrivalIcao && icaoSet.has(flight.arrivalIcao))
      );
    });

  let notice: string | null = null;
  if (unauthorized || blocked) {
    notice = process.env.OPENSKY_CLIENT_ID
      ? "OpenSky rejected the historical query. Check OPENSKY_CLIENT_ID and OPENSKY_CLIENT_SECRET."
      : "Historical flight lists come from the OpenSky Network. Add a free OpenSky API client (OPENSKY_CLIENT_ID and OPENSKY_CLIENT_SECRET) in Vercel Production to unlock date-range results. Live matches are still shown when the aircraft or airport is active now.";
  }

  return { flights, notice, source: "OpenSky Network · ADS-B" };
}

async function searchLiveFlights(input: {
  aircraft: FlightAircraft | null;
  airports: FlightAirport[];
}): Promise<TrackedFlight[]> {
  const flights: TrackedFlight[] = [];

  if (input.aircraft) {
    const live = await fetchJson<AdsbAircraftResponse>(
      `${ADSB_REG}/${encodeURIComponent(input.aircraft.registration)}`,
    );
    const row = live?.ac?.[0];
    if (row) {
      flights.push(liveAircraftToFlight(row, input.aircraft.registration));
    }
  }

  for (const airport of input.airports) {
    if (airport.icao === "") continue;
    const meta = await fetchJson<AdsbAirport>(`${ADSB_AIRPORT}/${airport.icao}`);
    if (meta?.lat == null || meta.lon == null) continue;
    const nearby = await fetchJson<AdsbAircraftResponse>(
      `${ADSB_POINT}/${meta.lat}/${meta.lon}/20`,
    );
    for (const row of nearby?.ac ?? []) {
      if (
        input.aircraft &&
        row.hex?.toLowerCase() !== input.aircraft.icao24 &&
        normalizeTail(row.r) !== input.aircraft.registration
      ) {
        continue;
      }
      flights.push(liveAircraftToFlight(row, normalizeTail(row.r)));
    }
  }

  return flights;
}

function liveAircraftToFlight(
  row: AdsbAircraft,
  registration: string | null,
): TrackedFlight {
  const seen = row.seen_pos ?? row.seen ?? 0;
  const now = Math.floor(Date.now() / 1000);
  const last = now - Math.round(seen);
  return {
    icao24: (row.hex ?? "").toLowerCase(),
    registration,
    callsign: row.flight?.trim() || row.t || null,
    firstSeen: formatTime(last),
    lastSeen: "Live",
    durationMinutes: null,
    departureIcao: null,
    arrivalIcao: row.dst || null,
    source: "adsb.lol live ADS-B",
  };
}

function toTrackedFlight(
  flight: OpenSkyFlight,
  registration: string | null,
): TrackedFlight {
  const duration =
    flight.lastSeen && flight.firstSeen && flight.lastSeen > flight.firstSeen
      ? Math.round((flight.lastSeen - flight.firstSeen) / 60)
      : null;

  return {
    icao24: flight.icao24,
    registration,
    callsign: flight.callsign?.trim() || null,
    firstSeen: formatTime(flight.firstSeen),
    lastSeen: formatTime(flight.lastSeen),
    durationMinutes: duration,
    departureIcao: flight.estDepartureAirport,
    arrivalIcao: flight.estArrivalAirport,
    source: "OpenSky Network",
  };
}

function dedupeFlights(flights: TrackedFlight[]): TrackedFlight[] {
  const seen = new Set<string>();
  const unique: TrackedFlight[] = [];
  for (const flight of flights) {
    const key = [
      flight.icao24,
      flight.firstSeen,
      flight.lastSeen,
      flight.departureIcao,
      flight.arrivalIcao,
      flight.source,
    ].join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(flight);
  }
  return unique.sort((a, b) => b.firstSeen.localeCompare(a.firstSeen));
}

function chunkUnixRange(
  begin: number,
  end: number,
  maxSeconds: number,
): Array<{ begin: number; end: number }> {
  const windows = [];
  for (let start = begin; start < end; start += maxSeconds) {
    windows.push({ begin: start, end: Math.min(end, start + maxSeconds) });
  }
  return windows;
}

async function openSkyHeaders(): Promise<HeadersInit> {
  const token = await openSkyToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function openSkyToken(): Promise<string | null> {
  const clientId = process.env.OPENSKY_CLIENT_ID?.trim();
  const clientSecret = process.env.OPENSKY_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return null;

  if (cachedOpenSkyToken && Date.now() < cachedOpenSkyToken.expiresAt) {
    return cachedOpenSkyToken.value;
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch(OPENSKY_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  if (!response.ok) return null;

  const data = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
  };
  if (!data.access_token) return null;

  cachedOpenSkyToken = {
    value: data.access_token,
    expiresAt: Date.now() + Math.max(60, (data.expires_in ?? 1800) - 30) * 1000,
  };
  return data.access_token;
}

async function openSkyFlights(
  path: string,
  headers: HeadersInit,
): Promise<OpenSkyFlight[] | "blocked" | "unauthorized"> {
  const response = await fetch(`${OPENSKY_API}${path}`, {
    headers,
    cache: "no-store",
  });

  if (response.status === 404) return [];
  if (response.status === 401 || response.status === 403) {
    const text = await response.text();
    if (/cannot access historical|unauthorized|forbidden/i.test(text)) {
      return response.status === 401 ? "unauthorized" : "blocked";
    }
    return "blocked";
  }
  if (response.status === 429) {
    throw new Error("The flight-tracking API rate limit was reached. Wait a minute and search again.");
  }
  if (!response.ok) {
    throw new Error(`OpenSky returned HTTP ${response.status}.`);
  }

  const data = (await response.json()) as OpenSkyFlight[] | null;
  return Array.isArray(data) ? data : [];
}

async function fetchText(url: string): Promise<string | null> {
  const response = await fetch(url, { cache: "no-store", headers: FETCH_HEADERS });
  if (!response.ok) return null;
  const text = (await response.text()).trim();
  return text || null;
}

async function fetchJson<T>(url: string): Promise<T | null> {
  const response = await fetch(url, { cache: "no-store", headers: FETCH_HEADERS });
  if (!response.ok) return null;
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function formatTime(unix: number | null | undefined): string {
  if (!unix) return "—";
  return new Date(unix * 1000).toISOString().replace("T", " ").replace(/\.\d+Z$/, " UTC");
}

interface OpenSkyFlight {
  icao24: string;
  firstSeen: number;
  lastSeen: number;
  estDepartureAirport: string | null;
  estArrivalAirport: string | null;
  callsign: string | null;
}

interface AdsbAirport {
  icao?: string;
  iata?: string;
  name?: string;
  lat?: number;
  lon?: number;
}

interface AdsbAircraft {
  hex?: string;
  flight?: string;
  r?: string;
  t?: string;
  seen?: number;
  seen_pos?: number;
  dst?: string;
}

interface AdsbAircraftResponse {
  ac?: AdsbAircraft[];
}
