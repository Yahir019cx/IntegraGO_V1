<script setup lang="ts">
withDefaults(defineProps<{ name: string; size?: number }>(), { size: 22 });
const paths: Record<string, string> = {
  home: "m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z",
  capture: "M22 11.1V12a10 10 0 1 1-5.93-9.14 M22 4 12 14.01l-3-3",
  file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z M14 2v6h6 M8 13h8 M8 17h6",
  user: "M20 21v-2a7 7 0 0 0-14 0v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  mail: "M3 5h18v14H3Z m0 1 9 7 9-7",
  lock: "M5 10h14v11H5Z M8 10V6a4 4 0 0 1 8 0v4 M12 14v3",
  eye: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6",
  eyeOff:
    "m3 3 18 18 M10.5 5.1 12 5c7 0 10 7 10 7a18 18 0 0 1-3 4 M6 6C3.3 8 2 12 2 12s3 7 10 7c2 0 3.8-.6 5.3-1.4 M10 10a3 3 0 0 0 4 4",
  pin: "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6",
  arrow: "m9 5 7 7-7 7",
  back: "m15 5-7 7 7 7",
  close: "m6 6 12 12 M6 18 18 6",
  check: "m5 12 4 4L19 6",
  search: "M11 3a8 8 0 1 0 0 16 8 8 0 0 0 0-16 m6 14 5 5",
  phone:
    "M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3 5.2 2 2 0 0 1 5 3h3l2 5-3 2a16 16 0 0 0 7 7l2-3Z",
  car: "m5 6-2 7v6h3v-3h12v3h3v-6l-2-7Z M3 12h18 M7 6h10 M7 14h.01 M17 14h.01",
  shield: "m12 2 9 4v6c0 6-9 10-9 10S3 18 3 12V6Z m-5 10 3 3 7-7",
  calendar: "M3 5h18v16H3Z M7 3v4 M17 3v4 M3 10h18 M7 14h3 M14 14h3",
  banknote: "M3 6h18v12H3Z M6 12h.01 M18 12h.01 M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z",
  clock: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20 M12 6v6l4 2",
  share: "M12 16V2 m-4 4 4-4 4 4 M5 10H3v12h18V10h-2",
  copy: "M9 9h12v12H9Z M5 15H3V3h12v2",
  support:
    "M3 14v-3a9 9 0 0 1 18 0v3 M3 12h4v7H3Z M17 12h4v7h-4Z M21 19c0 3-5 3-8 3",
  info: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20 M12 11v6 M12 7h.01",
  logout: "M9 3H3v18h6 M8 12h14 m-5-5 5 5-5 5",
  scan: "M8 3H3v5 M16 3h5v5 M3 16v5h5 M21 16v5h-5 M7 12h10",
};
</script>
<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path :d="paths[name] ?? paths.info" />
  </svg>
</template>
