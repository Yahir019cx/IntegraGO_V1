import { afterEach, describe, expect, it, vi } from "vitest";
import {
  changeTimePart,
  localDateTime,
  mergePickerValue,
  pickerMinimum,
} from "@/utils/dateTimePicker";

afterEach(() => vi.useRealTimers());
describe("mobile date and time selection", () => {
  it("keeps noon, midnight and minutes correct when the period changes", () => {
    expect(changeTimePart("2030-11-03T12:26", "period", "am")).toBe(
      "2030-11-03T00:26",
    );
    expect(changeTimePart("2030-11-03T00:26", "period", "pm")).toBe(
      "2030-11-03T12:26",
    );
    expect(changeTimePart("2030-11-03T12:26", "hour", 1)).toBe(
      "2030-11-03T13:26",
    );
    expect(changeTimePart("2030-11-03T13:26", "minute", 0)).toBe(
      "2030-11-03T13:00",
    );
  });
  it("keeps local date and time without converting to UTC", () => {
    expect(localDateTime(new Date(2030, 10, 3, 9, 5))).toBe("2030-11-03T09:05");
  });
  it("changes the date without losing the hour and vice versa", () => {
    expect(
      mergePickerValue("2030-11-03T09:05", "2030-11-10T00:00:00", "date"),
    ).toBe("2030-11-10T09:05");
    expect(
      mergePickerValue("2030-11-10T09:05", "2030-11-10T14:35:00", "time"),
    ).toBe("2030-11-10T14:35");
  });
  it("requires a future minute and handles next-day return limits", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2030, 10, 3, 23, 59, 30));
    expect(pickerMinimum()).toBe("2030-11-04T00:00");
    expect(pickerMinimum("2030-11-05T23:59")).toBe("2030-11-06T00:00");
    expect(pickerMinimum("invalid")).toBe("2030-11-04T00:00");
  });
});
