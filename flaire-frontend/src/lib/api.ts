const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8000";

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return null;

  return res.json();
}

export const api = {
  login: (email: string, password: string) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  signup: (name: string, email: string, password: string) =>
    request("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  me: () => request("/auth/me"),

  logout: () =>
    request("/auth/logout", {
      method: "POST",
    }),

  getDashboardToday: () => request("/dashboard/today"),
  saveCheckIn: (payload: {
    energy: number;
    pain: number;
    mood: number;
    notes: string;
    additionalData?: Record<string, unknown>;
  }) =>
    request("/checkins", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

    getSymptoms: () => request("/symptoms"),

  createSymptom: (payload: {
    name: string;
    severity: number;
    triggers: string[];
    notes: string;
    bodyAreas: string[];
  }) =>
    request("/symptoms", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  deleteSymptom: (id: string) =>
    request(`/symptoms/${id}`, {
      method: "DELETE",
    }),

  getMedications: () => request("/medications"),

  createMedication: (payload: {
    name: string;
    dosage: string;
    frequency: string;
    time: string[];
    taken: boolean[];
    notes: string;
  }) =>
    request("/medications", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  updateMedicationTaken: (id: string, taken: boolean[]) =>
    request(`/medications/${id}/taken`, {
      method: "PATCH",
      body: JSON.stringify({ taken }),
    }),

  getDietEntries: () => request("/diet"),

  createDietEntry: (payload: {
    mealType: string;
    food: string;
    notes: string;
  }) =>
    request("/diet", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  deleteDietEntry: (id: string) =>
    request(`/diet/${id}`, {
      method: "DELETE",
    }),

  getRecords: () => request("/records"),

  createRecord: (payload: {
    title: string;
    type: string;
    notes: string;
  }) =>
    request("/records", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  deleteRecord: (id: string) =>
    request(`/records/${id}`, {
      method: "DELETE",
    }),
  getCommunityPosts: () => request("/community"),

  createCommunityPost: (payload: {
    author: string;
    content: string;
  }) =>
    request("/community", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  deleteCommunityPost: (id: string) =>
    request(`/community/${id}`, {
      method: "DELETE",
    }),
  getInsights: () => request("/insights"),
};
