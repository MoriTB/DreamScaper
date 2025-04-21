export const DREAM_STYLES = [
  { value: "realistic", label: "Realistic" },
  { value: "watercolor", label: "Watercolor" },
  { value: "sketch", label: "Sketch" },
  { value: "surreal", label: "Surreal" },
];

export const COMMON_TAGS = [
  "lucid",
  "nightmare",
  "flying",
  "falling",
  "chase",
  "water",
  "family",
  "childhood",
  "work",
  "test",
  "school",
  "travel",
  "animals",
  "recurring",
  "transformation",
  "death",
  "lost",
  "food",
  "magic",
  "forest",
  "urban",
  "space",
  "ocean",
  "house",
  "stranger",
];

export const NAV_ITEMS = [
  {
    section: "Journal",
    items: [
      { label: "Dashboard", icon: "ri-home-5-line", path: "/" },
      { label: "All Dreams", icon: "ri-archive-line", path: "/all-dreams" },
      { label: "Favorites", icon: "ri-star-line", path: "/favorites" },
      { label: "Mood Tracker", icon: "ri-emotion-line", path: "/mood" },
    ],
  },
  {
    section: "Analysis",
    items: [
      { label: "Insights", icon: "ri-bar-chart-box-line", path: "/insights" },
      { label: "Patterns", icon: "ri-calendar-line", path: "/patterns" },
    ],
  },
];

export const MOBILE_NAV_ITEMS = [
  { label: "Home", icon: "ri-home-5-line", path: "/" },
  { label: "Dreams", icon: "ri-archive-line", path: "/all-dreams" },
  { label: "Record", icon: "ri-add-line", path: "/record", isAction: true },
  { label: "Insights", icon: "ri-bar-chart-line", path: "/insights" },
  { label: "Profile", icon: "ri-user-line", path: "/profile" },
];
