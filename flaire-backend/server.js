const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const path = require("path");

const app = express();

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

  // 🔥 FIXED COOKIE
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

/* --- REST OF YOUR ROUTES (UNCHANGED) --- */

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

/* --- KEEP ALL YOUR OTHER ROUTES SAME --- */

/* 🔥 FINAL FIXED PORT */
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});