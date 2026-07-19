/**
 * PortalDB - Client-side state manager backed by localStorage
 * Provides CRUD operations for Patients, Appointments, Notifications, and Settings
 */
const PortalDB = (() => {
  const KEYS = {
    PATIENTS: 'audspex_patients',
    APPOINTMENTS: 'audspex_appointments',
    SETTINGS: 'audspex_settings',
    NOTIFICATIONS: 'audspex_notifications'
  };

  const DEFAULT_SETTINGS = {
    clinicName: "AudSpeX Healthcare Center",
    logo: "../assets/images/logo.png",
    address: "12 Clifton Block 5, Karachi, Pakistan",
    phone: "+92 21 3456 7890",
    email: "info@audspex.com",
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    workingHoursStart: "09:00",
    workingHoursEnd: "20:00",
    appointmentDuration: 30, // in minutes
    holidays: [],
    slotInterval: 30 // in minutes
  };

  const SEED_PATIENTS = [
    {
      id: "PT-1001",
      regDate: "2026-07-01",
      fullName: "Ahmed Khan",
      parentName: "Saeed Khan",
      gender: "Male",
      dob: "1988-04-12",
      age: 38,
      cnic: "42101-1234567-1",
      mobile: "+92 300 1234567",
      whatsapp: "+92 300 1234567",
      email: "ahmed.khan@gmail.com",
      address: "Flat 4B, Clifton Pride, Block 5",
      city: "Karachi",
      firstVisit: "Yes",
      referralSource: "Google Search",
      reasonForVisit: "Persistent high-pitched ringing in ears (tinnitus).",
      notes: "Patient is anxious about hearing loss."
    },
    {
      id: "PT-1002",
      regDate: "2026-07-02",
      fullName: "Sarah Fatima",
      parentName: "Muhammad Ali",
      gender: "Female",
      dob: "1995-09-22",
      age: 30,
      cnic: "42201-9876543-2",
      mobile: "+92 321 7654321",
      whatsapp: "+92 321 7654321",
      email: "sarah.fatima@yahoo.com",
      address: "House 123, Street 5, DHA Phase 6",
      city: "Karachi",
      firstVisit: "Yes",
      referralSource: "Doctor Referral",
      reasonForVisit: "Routine pediatric speech delay checkup for toddler.",
      notes: "Referred by Dr. Sarah."
    },
    {
      id: "PT-1003",
      regDate: "2026-07-15",
      fullName: "Zainab Bibi",
      parentName: "Kashif Shah",
      gender: "Female",
      dob: "1960-01-15",
      age: 66,
      cnic: "37405-5555555-4",
      mobile: "+92 333 9988776",
      whatsapp: "",
      email: "",
      address: "Sector 11-A, North Karachi",
      city: "Karachi",
      firstVisit: "No",
      referralSource: "Walk-In",
      reasonForVisit: "Hearing aid cleaning and tuning.",
      notes: "Using SoundPro X RIC."
    }
  ];

  const SEED_APPOINTMENTS = [
    {
      id: "APT-1001",
      patientId: "PT-1001",
      patientName: "Ahmed Khan",
      date: new Date().toISOString().split('T')[0], // Today
      time: "09:00",
      service: "Hearing Assessment",
      specialist: "Dr. Sarah",
      priority: "Normal",
      status: "Confirmed",
      notes: "First audiometry session."
    },
    {
      id: "APT-1002",
      patientId: "PT-1002",
      patientName: "Sarah Fatima",
      date: new Date().toISOString().split('T')[0], // Today
      time: "10:30",
      service: "Speech Therapy",
      specialist: "Dr. Omar Baig",
      priority: "Urgent",
      status: "Checked-In",
      notes: "Follow up speech check."
    },
    {
      id: "APT-1003",
      patientId: "PT-1003",
      patientName: "Zainab Bibi",
      date: new Date().toISOString().split('T')[0], // Today
      time: "14:00",
      service: "Hearing Aids Fitting",
      specialist: "Dr. Ahmed Khan",
      priority: "Normal",
      status: "Pending",
      notes: "Re-programming request."
    }
  ];

  const SEED_NOTIFICATIONS = [
    {
      id: "NT-001",
      text: "Ahmed Khan registered as a new patient",
      type: "info",
      time: "1 hour ago",
      read: false
    },
    {
      id: "NT-002",
      text: "Appointment booked for Zainab Bibi",
      type: "success",
      time: "2 hours ago",
      read: true
    }
  ];

  // Initialize DB data if not existing
  const init = () => {
    if (!localStorage.getItem(KEYS.PATIENTS)) {
      localStorage.setItem(KEYS.PATIENTS, JSON.stringify(SEED_PATIENTS));
    }
    if (!localStorage.getItem(KEYS.APPOINTMENTS)) {
      localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(SEED_APPOINTMENTS));
    }
    if (!localStorage.getItem(KEYS.SETTINGS)) {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!localStorage.getItem(KEYS.NOTIFICATIONS)) {
      localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(SEED_NOTIFICATIONS));
    }
  };

  init();

  const getPatients = () => JSON.parse(localStorage.getItem(KEYS.PATIENTS)) || [];
  const savePatients = (data) => localStorage.setItem(KEYS.PATIENTS, JSON.stringify(data));

  const getAppointments = () => JSON.parse(localStorage.getItem(KEYS.APPOINTMENTS)) || [];
  const saveAppointments = (data) => localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(data));

  const getSettings = () => JSON.parse(localStorage.getItem(KEYS.SETTINGS)) || DEFAULT_SETTINGS;
  const saveSettings = (data) => localStorage.setItem(KEYS.SETTINGS, JSON.stringify(data));

  const getNotifications = () => JSON.parse(localStorage.getItem(KEYS.NOTIFICATIONS)) || [];
  const saveNotifications = (data) => localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(data));

  return {
    // Patients CRUD
    getPatients,
    getPatientById: (id) => getPatients().find(p => p.id === id),
    addPatient: (patient) => {
      const patients = getPatients();
      const nextId = "PT-" + (patients.length > 0 ? (Math.max(...patients.map(p => parseInt(p.id.split('-')[1]))) + 1) : 1001);
      const newPatient = {
        id: nextId,
        regDate: new Date().toISOString().split('T')[0],
        ...patient
      };
      patients.push(newPatient);
      savePatients(patients);
      // Trigger Notification
      PortalDB.addNotification(`Patient ${newPatient.fullName} registered successfully`, "success");
      return newPatient;
    },
    updatePatient: (id, updatedFields) => {
      const patients = getPatients();
      const idx = patients.findIndex(p => p.id === id);
      if (idx !== -1) {
        patients[idx] = { ...patients[idx], ...updatedFields };
        savePatients(patients);
        // Cascading name change update to appointments
        if (updatedFields.fullName) {
          const appointments = getAppointments();
          appointments.forEach(app => {
            if (app.patientId === id) app.patientName = updatedFields.fullName;
          });
          saveAppointments(appointments);
        }
        return true;
      }
      return false;
    },
    deletePatient: (id) => {
      const patients = getPatients();
      const filtered = patients.filter(p => p.id !== id);
      if (filtered.length !== patients.length) {
        savePatients(filtered);
        // Cascading removal of appointments
        const appointments = getAppointments().filter(app => app.patientId !== id);
        saveAppointments(appointments);
        return true;
      }
      return false;
    },

    // Appointments CRUD
    getAppointments,
    getAppointmentById: (id) => getAppointments().find(app => app.id === id),
    addAppointment: (app) => {
      const appointments = getAppointments();
      const nextId = "APT-" + (appointments.length > 0 ? (Math.max(...appointments.map(a => parseInt(a.id.split('-')[1]))) + 1) : 1001);
      const newApp = {
        id: nextId,
        ...app
      };
      appointments.push(newApp);
      saveAppointments(appointments);
      PortalDB.addNotification(`Appointment ${nextId} scheduled for ${newApp.patientName}`, "info");
      return newApp;
    },
    updateAppointment: (id, updatedFields) => {
      const appointments = getAppointments();
      const idx = appointments.findIndex(app => app.id === id);
      if (idx !== -1) {
        const oldStatus = appointments[idx].status;
        appointments[idx] = { ...appointments[idx], ...updatedFields };
        saveAppointments(appointments);

        // Notify if status changes
        if (updatedFields.status && updatedFields.status !== oldStatus) {
          PortalDB.addNotification(`Appointment ${id} status updated to ${updatedFields.status}`, "info");
        }
        return true;
      }
      return false;
    },
    deleteAppointment: (id) => {
      const appointments = getAppointments();
      const filtered = appointments.filter(app => app.id !== id);
      if (filtered.length !== appointments.length) {
        saveAppointments(filtered);
        return true;
      }
      return false;
    },

    // Settings
    getSettings,
    updateSettings: (newSettings) => {
      const current = getSettings();
      saveSettings({ ...current, ...newSettings });
      PortalDB.addNotification("Clinic settings updated", "success");
      return true;
    },

    // Notifications
    getNotifications,
    addNotification: (text, type = "info") => {
      const notifications = getNotifications();
      const newNotif = {
        id: "NT-" + (notifications.length + 1),
        text,
        type,
        time: "Just now",
        read: false
      };
      notifications.unshift(newNotif);
      saveNotifications(notifications.slice(0, 50)); // Keep max 50 notifications
      return newNotif;
    },
    markAllNotificationsRead: () => {
      const notifications = getNotifications();
      notifications.forEach(n => n.read = true);
      saveNotifications(notifications);
    }
  };
})();
