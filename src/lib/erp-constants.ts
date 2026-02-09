export const ROLE_OPTIONS = [
  { label: "Manager", value: "manager" },
  { label: "Assistant Manager", value: "assistant_manager" },
  { label: "Receptionist", value: "receptionist" },
  { label: "Concierge", value: "concierge" },
  { label: "Housekeeping", value: "housekeeping" },
  { label: "Laundry", value: "laundry" },
  { label: "Maintenance", value: "maintenance" },
  { label: "Security", value: "security" },
  { label: "Accountant", value: "accountant" },
  { label: "Cashier", value: "cashier" },
  { label: "Storekeeper", value: "storekeeper" },
  { label: "Chef", value: "chef" },
  { label: "Kitchen Staff", value: "kitchen_staff" },
  { label: "Restaurant Waiter", value: "restaurant_waiter" },
  { label: "Bar Attendant", value: "bar_attendant" },
  { label: "Room Service", value: "room_service" },
  { label: "Events/Banquets", value: "events_banquets" },
  { label: "IT Support", value: "it_support" },
  { label: "HR Officer", value: "hr_officer" },
  { label: "Sales & Marketing", value: "sales_marketing" },
];

export const DEPARTMENT_OPTIONS = [
  { label: "Management", value: "management" },
  { label: "Front Office", value: "front_office" },
  { label: "Housekeeping", value: "housekeeping" },
  { label: "Food & Beverage", value: "food_beverage" },
  { label: "Finance", value: "finance" },
  { label: "Maintenance", value: "maintenance" },
  { label: "Security", value: "security" },
];

export const GENDER_OPTIONS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
  { label: "Prefer not to say", value: "prefer_not" },
];

export const NIGERIA_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
  "FCT",
];

export const ROLE_LABELS: Record<string, string> = ROLE_OPTIONS.reduce(
  (acc, role) => {
    acc[role.value] = role.label;
    return acc;
  },
  {} as Record<string, string>
);

export const DEPARTMENT_LABELS: Record<string, string> = DEPARTMENT_OPTIONS.reduce(
  (acc, dept) => {
    acc[dept.value] = dept.label;
    return acc;
  },
  {} as Record<string, string>
);
