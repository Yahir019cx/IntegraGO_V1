export function localDateTime(value: Date): string {
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
}
export function pickerMinimum(after?: string): string {
  const now = Date.now();
  const afterTime = after ? Date.parse(after) : NaN;
  return localDateTime(
    new Date(
      (Math.floor(
        Math.max(now, Number.isFinite(afterTime) ? afterTime : now) / 60000,
      ) +
        1) *
        60000,
    ),
  );
}
const pickupLeadTime = 30 * 60_000;

export function isPickupSlot(value: string, now = Date.now()): boolean {
  const date = new Date(value);
  return date.getTime() >= now + pickupLeadTime &&
    date.getMinutes() % 30 === 0 && date.getSeconds() === 0 && date.getMilliseconds() === 0;
}

export function pickupMinimum(): string {
  const now = Date.now();
  let slot = Math.ceil((now + pickupLeadTime) / 60_000) * 60_000;
  while (new Date(slot).getMinutes() % 30 !== 0) slot += 60_000;
  return localDateTime(new Date(slot));
}

export function pickupSlots(day: string, minimum: string): string[] {
  const slots: string[] = [];
  for (let hour = 0; hour < 24; hour += 1) {
    for (const minute of ["00", "30"]) {
      const slot = `${day}T${String(hour).padStart(2, "0")}:${minute}`;
      if (slot >= minimum && localDateTime(new Date(slot)) === slot) slots.push(slot);
    }
  }
  return slots;
}
export function mergePickerValue(
  current: string,
  selected: string,
  mode: "date" | "time",
): string {
  if (mode === "date")
    return `${selected.slice(0, 10)}T${current.slice(11, 16)}`;
  return `${current.slice(0, 10)}T${selected.slice(11, 16)}`;
}

export function changeTimePart(
  current: string,
  part: "hour" | "minute" | "period",
  value: string | number,
): string {
  let hour = Number(current.slice(11, 13));
  let minute = Number(current.slice(14, 16));
  if (part === "period") {
    if (value !== "am" && value !== "pm") return current;
    hour = (hour % 12) + (value === "pm" ? 12 : 0);
  } else if (part === "hour") {
    const next = Number(value);
    if (!Number.isInteger(next) || next < 1 || next > 12) return current;
    hour = (next % 12) + (hour >= 12 ? 12 : 0);
  } else {
    const next = Number(value);
    if (!Number.isInteger(next) || next < 0 || next > 59) return current;
    minute = next;
  }
  return `${current.slice(0, 10)}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}
