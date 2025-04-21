export const DREAM_STYLES = [
  "realistic", 
  "sketch",
  "watercolor", 
  "surreal",
  "psychedelic",
  "cosmic",
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
      { label: "Favorites", icon: "ri-heart-line", path: "/favorites" },
      { label: "Mood Tracker", icon: "ri-emotion-line", path: "/mood-tracker" },
    ],
  },
  {
    section: "Analysis",
    items: [
      { label: "Insights", icon: "ri-bar-chart-box-line", path: "/insights" },
      { label: "Profile", icon: "ri-user-line", path: "/profile" },
    ],
  },
];

export const MOBILE_NAV_ITEMS = [
  { label: "Home", icon: "ri-home-5-line", path: "/" },
  { label: "Dreams", icon: "ri-archive-line", path: "/all-dreams" },
  { label: "Record", icon: "ri-add-line", path: "/record", isAction: true },
  { label: "Favorites", icon: "ri-heart-line", path: "/favorites" },
  { label: "Mood", icon: "ri-emotion-line", path: "/mood-tracker" },
];
