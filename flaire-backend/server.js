const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 8000;

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://flaire-patch.vercel.app",
    ],
    credentials: true,
  })
);

const dataDir = __dirname;
const usersFile = path.join(dataDir, "users.json");

function readUsers() {
  try {
    if (!fs.existsSync(usersFile)) {
      fs.writeFileSync(usersFile, JSON.stringify([], null, 2));
    }
    return JSON.parse(fs.readFileSync(usersFile, "utf-8"));
  } catch (error) {
    console.error("Failed to read users:", error);
    return [];
  }
}

function writeUsers(users) {
  try {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error("Failed to write users:", error);
  }
}
const medications = [];
const checkins = [];
const dietEntries = [];
const medicalRecords = [];
const communityPosts = [];
const symptoms = [];
app.get("/", (req, res) => {
  res.send("Flaire backend running");
});

app.post("/auth/signup", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const users = readUsers();
  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = {
    id: String(Date.now()),
    name,
    email,
    password,
  };

  users.push(user);
  writeUsers(users);

  res.cookie("userEmail", user.email, {
  httpOnly: false,
  sameSite: "none",
  secure: true,
});

  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
});

app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;

const users = readUsers();
const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  res.cookie("userEmail", user.email, {
    httpOnly: false,
    sameSite: "lax",
  });

  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
});

app.get("/auth/me", (req, res) => {
  const email = req.cookies.userEmail;

  if (!email) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const users = readUsers();
  const user = users.find((u) => u.email === email);

  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
  });
});
app.post("/auth/logout", (req, res) => {
  res.clearCookie("userEmail");
  return res.status(200).json({ message: "Logged out" });
});

app.get("/records", (req, res) => {
  return res.json(medicalRecords);
});

app.post("/records", (req, res) => {
  const record = {
    id: String(Date.now()),
    title: req.body.title || "",
    type: req.body.type || "",
    notes: req.body.notes || "",
    createdAt: new Date().toISOString(),
  };

  medicalRecords.push(record);
  return res.json(record);
});

app.delete("/records/:id", (req, res) => {
  const index = medicalRecords.findIndex((item) => item.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: "Record not found" });
  }

  medicalRecords.splice(index, 1);
  return res.status(204).send();
});
app.get("/community", (req, res) => {
  return res.json(communityPosts);
});

app.post("/community", (req, res) => {
  const post = {
    id: String(Date.now()),
    author: req.body.author || "Anonymous",
    content: req.body.content || "",
    createdAt: new Date().toISOString(),
  };

  communityPosts.unshift(post);
  return res.json(post);
});

app.delete("/community/:id", (req, res) => {
  const index = communityPosts.findIndex((item) => item.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: "Post not found" });
  }

  communityPosts.splice(index, 1);
  return res.status(204).send();
});
app.get("/dashboard/today", (req, res) => {
  const latestCheckin = checkins.length > 0 ? checkins[checkins.length - 1] : null;

  return res.json({
    hasCheckedIn: !!latestCheckin,
    isFlareDay: latestCheckin ? latestCheckin.pain >= 7 : false,
    todayStatus: latestCheckin
      ? {
          energy: String(latestCheckin.energy),
          pain: String(latestCheckin.pain),
          flare: latestCheckin.pain >= 7,
          message:
            latestCheckin.pain >= 7
              ? "Looks like a harder day. Go gentle on yourself."
              : "You are doing well today.",
        }
      : {
          energy: "Not logged",
          pain: "Not logged",
          flare: false,
          message: "No check-in yet today.",
        },
    trackingFactors: [],
    additionalData: latestCheckin?.additionalData || {},
  });
});

app.post("/checkins", (req, res) => {
  const checkin = {
    id: String(Date.now()),
    energy: req.body.energy ?? 5,
    pain: req.body.pain ?? 5,
    mood: req.body.mood ?? 5,
    notes: req.body.notes || "",
    additionalData: req.body.additionalData || {},
    createdAt: new Date().toISOString(),
  };

  checkins.push(checkin);
  return res.json(checkin);
});
app.get("/insights", (req, res) => {
  const latestCheckin = checkins.length > 0 ? checkins[checkins.length - 1] : null;

  const avgPain =
    symptoms.length > 0
      ? (
          symptoms.reduce((sum, item) => sum + (Number(item.severity) || 0), 0) / symptoms.length
        ).toFixed(1)
      : null;

  const totalMedications = medications.length;
  const totalMeals = dietEntries.length;
  const totalSymptoms = symptoms.length;

  const flareRisk =
    latestCheckin && Number(latestCheckin.pain) >= 7
      ? "High"
      : latestCheckin && Number(latestCheckin.pain) >= 4
      ? "Moderate"
      : "Low";

  return res.json({
    summary: {
      totalSymptoms,
      totalMedications,
      totalMeals,
      latestPain: latestCheckin ? latestCheckin.pain : null,
      latestEnergy: latestCheckin ? latestCheckin.energy : null,
      averageSymptomSeverity: avgPain,
      flareRisk,
    },
    tips: [
      totalSymptoms > 3
        ? "You have logged several symptoms. Look for repeating triggers."
        : "Keep logging symptoms consistently to identify patterns.",
      totalMeals > 0
        ? "Diet logs are available. Watch for foods that appear before harder symptom days."
        : "Start adding meals to improve pattern detection.",
      totalMedications > 0
        ? "Medication tracking is active. Consistency can improve adherence."
        : "Add medications to track schedules and completion.",
    ],
  });
});
app.get("/diet", (req, res) => {
  return res.json(dietEntries);
});

app.post("/diet", (req, res) => {
  const entry = {
    id: String(Date.now()),
    mealType: req.body.mealType || "",
    food: req.body.food || "",
    notes: req.body.notes || "",
    createdAt: new Date().toISOString(),
  };

  dietEntries.push(entry);
  return res.json(entry);
});

app.delete("/diet/:id", (req, res) => {
  const index = dietEntries.findIndex((item) => item.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: "Diet entry not found" });
  }

  dietEntries.splice(index, 1);
  return res.status(204).send();
});

app.get("/symptoms", (req, res) => {
  return res.json(symptoms);
});

app.post("/symptoms", (req, res) => {
  const symptom = {
    id: String(Date.now()),
    name: req.body.name || "",
    severity: Number(req.body.severity) || 1,
    triggers: Array.isArray(req.body.triggers) ? req.body.triggers : [],
    notes: req.body.notes || "",
    bodyAreas: Array.isArray(req.body.bodyAreas) ? req.body.bodyAreas : [],
    date: new Date().toISOString(),
  };

  symptoms.unshift(symptom);
  return res.json(symptom);
});

app.delete("/symptoms/:id", (req, res) => {
  const index = symptoms.findIndex((item) => item.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: "Symptom not found" });
  }

  symptoms.splice(index, 1);
  return res.status(204).send();
});

app.get("/medications", (req, res) => {
  return res.json(medications);
});

app.post("/medications", (req, res) => {
  const medication = {
    id: String(Date.now()),
    name: req.body.name || "",
    dosage: req.body.dosage || "",
    frequency: req.body.frequency || "",
    time: Array.isArray(req.body.time) ? req.body.time : [],
    taken: Array.isArray(req.body.taken) ? req.body.taken : [],
    notes: req.body.notes || "",
  };

  medications.push(medication);
  return res.json(medication);
});

app.patch("/medications/:id/taken", (req, res) => {
  const medication = medications.find((m) => m.id === req.params.id);

  if (!medication) {
    return res.status(404).json({ message: "Medication not found" });
  }

  medication.taken = Array.isArray(req.body.taken) ? req.body.taken : medication.taken;

  return res.json(medication);
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});