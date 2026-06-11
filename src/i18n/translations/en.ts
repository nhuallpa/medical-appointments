/** A tuple of exactly seven labels, indexed Sunday (0) through Saturday (6). */
export type WeekLabels = readonly [string, string, string, string, string, string, string];

/**
 * Shape of a translation dictionary. `es.ts` and `pt.ts` are typed against
 * this interface, so a missing or extra key in either is a compile-time
 * error. English (`en.ts`) is the source of truth for which keys exist.
 */
export interface Translations {
  common: {
    save: string;
    cancel: string;
    delete: string;
    confirm: string;
    close: string;
    today: string;
    goToToday: string;
    addAppointment: string;
  };
  nav: {
    settings: string;
  };
  viewTabs: {
    calendar: string;
    day: string;
  };
  calendar: {
    emptyStatePrefix: string;
    emptyStateAction: string;
    weekdays: WeekLabels;
    previousMonth: string;
    nextMonth: string;
    selectDate: string;
    addAppointmentOn: string;
  };
  dayView: {
    previousDay: string;
    nextDay: string;
    noSlotsConfigured: string;
    addAppointmentAt: string;
    addAppointmentButton: string;
  };
  appointmentForm: {
    title: string;
    patientName: string;
    professionalName: string;
    appointmentType: string;
    sessions: string;
    numberOfSessions: string;
    sessionsHintSingular: string;
    sessionsHintPlural: string;
    startDate: string;
    date: string;
    time: string;
    notes: string;
    saveSessions: string;
  };
  appointmentDetail: {
    title: string;
    patient: string;
    professional: string;
    type: string;
    series: string;
    sessionOf: string;
    date: string;
    time: string;
    notes: string;
    removeSeriesConfirm: string;
    removeAppointmentConfirm: string;
    deleteSeries: string;
    deleteSeriesAriaLabel: string;
  };
  appointmentTypeManager: {
    title: string;
    repeatableBadge: string;
    individualBadge: string;
    deleteAriaLabel: string;
    addNewType: string;
    typeName: string;
    typeNamePlaceholder: string;
    repeatable: string;
    maxSessions: string;
    addType: string;
  };
  scheduleConfig: {
    title: string;
    availableDays: string;
    dayNames: WeekLabels;
    consultationHours: string;
    startTime: string;
    endTime: string;
    slotInterval: string;
    minutes: string;
    saveConfiguration: string;
    saveConfigurationAriaLabel: string;
  };
  settings: {
    title: string;
    backToCalendar: string;
    backToCalendarAriaLabel: string;
  };
  validation: {
    patientNameRequired: string;
    professionalNameRequired: string;
    dateRequired: string;
    dateInPast: string;
    timeRequired: string;
    dayNotAvailable: string;
    timeOutsideHours: string;
    typeNameRequired: string;
  };
  languageSwitcher: {
    label: string;
    english: string;
    spanish: string;
    portuguese: string;
  };
}

const en: Translations = {
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    confirm: "Confirm",
    close: "Close",
    today: "Today",
    goToToday: "Go to today",
    addAppointment: "Add appointment",
  },
  nav: {
    settings: "Settings",
  },
  viewTabs: {
    calendar: "Calendar",
    day: "Day",
  },
  calendar: {
    emptyStatePrefix: "No appointments yet —",
    emptyStateAction: "click any date to add an appointment",
    weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    previousMonth: "Previous month",
    nextMonth: "Next month",
    selectDate: "Select {date}",
    addAppointmentOn: "Add appointment on {date}",
  },
  dayView: {
    previousDay: "Previous day",
    nextDay: "Next day",
    noSlotsConfigured: "No time slots configured for this day.",
    addAppointmentAt: "Add appointment at {time}",
    addAppointmentButton: "+ Add appointment",
  },
  appointmentForm: {
    title: "New Appointment",
    patientName: "Patient Name",
    professionalName: "Professional Name",
    appointmentType: "Appointment Type",
    sessions: "Sessions",
    numberOfSessions: "Number of sessions",
    sessionsHintSingular: "{sessions} session on consecutive available days (max {max})",
    sessionsHintPlural: "{sessions} sessions on consecutive available days (max {max})",
    startDate: "Start Date",
    date: "Date",
    time: "Time",
    notes: "Notes",
    saveSessions: "Save {sessions} Sessions",
  },
  appointmentDetail: {
    title: "Appointment Details",
    patient: "Patient",
    professional: "Professional",
    type: "Type",
    series: "Series",
    sessionOf: "Session {index} of {total}",
    date: "Date",
    time: "Time",
    notes: "Notes",
    removeSeriesConfirm: "Remove all {total} sessions?",
    removeAppointmentConfirm: "Remove this appointment?",
    deleteSeries: "Delete Series ({total})",
    deleteSeriesAriaLabel: "Delete series ({total} sessions)",
  },
  appointmentTypeManager: {
    title: "Appointment Types",
    repeatableBadge: "Repeatable · {max} sessions",
    individualBadge: "Individual",
    deleteAriaLabel: "Delete {name}",
    addNewType: "Add New Type",
    typeName: "Type Name",
    typeNamePlaceholder: "e.g. Physical Therapy",
    repeatable: "Repeatable",
    maxSessions: "Max Sessions",
    addType: "Add Type",
  },
  scheduleConfig: {
    title: "Schedule Configuration",
    availableDays: "Available Days",
    dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    consultationHours: "Consultation Hours",
    startTime: "Start Time",
    endTime: "End Time",
    slotInterval: "Slot Interval",
    minutes: "{count} minutes",
    saveConfiguration: "Save Configuration",
    saveConfigurationAriaLabel: "Save schedule configuration",
  },
  settings: {
    title: "Settings",
    backToCalendar: "Back to Calendar",
    backToCalendarAriaLabel: "Back to calendar",
  },
  validation: {
    patientNameRequired: "Patient name is required",
    professionalNameRequired: "Professional name is required",
    dateRequired: "Date is required",
    dateInPast: "Date cannot be in the past",
    timeRequired: "Time is required",
    dayNotAvailable: "This day is not within configured consultation days.",
    timeOutsideHours: "Time is outside consultation hours ({start}–{end}).",
    typeNameRequired: "Type name is required",
  },
  languageSwitcher: {
    label: "Language",
    english: "English",
    spanish: "Español",
    portuguese: "Português",
  },
};

export default en;
