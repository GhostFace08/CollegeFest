require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./src/config/db");

const User = require("./src/models/User");
const Committee = require("./src/models/Committee");
const Event = require("./src/models/Event");
const Registration = require("./src/models/Registration");
const Volunteer = require("./src/models/Volunteer");
const Sponsor = require("./src/models/Sponsor");
const Logistics = require("./src/models/Logistics");
const Finance = require("./src/models/Finance");

const regId = () => "REG-" + Math.random().toString(36).substring(2, 10).toUpperCase();
const futureDate = (d) => { const x = new Date(); x.setDate(x.getDate() + d); return x; };
const pastDate = (d) => { const x = new Date(); x.setDate(x.getDate() - d); return x; };
const phone = (prefix) => prefix + Math.floor(10000 + Math.random() * 90000);

async function seed() {
  await connectDB();

  await Committee.deleteMany({});
  await Event.deleteMany({});
  await Registration.deleteMany({});
  await Volunteer.deleteMany({});
  await Sponsor.deleteMany({});
  await Logistics.deleteMany({});
  await Finance.deleteMany({});
  await User.deleteMany({ role: { $ne: "superadmin" } });
  console.log("🗑️  Cleared old seed data");

  const superadmin = await User.findOne({ role: "superadmin" });
  if (!superadmin) { console.error("❌ Superadmin not found."); process.exit(1); }
  console.log("👑 Superadmin:", superadmin.email);

  // ── Committees ──────────────────────────────────────────────────────────
  const committees = await Committee.insertMany([
    { name: "Technical Committee",  description: "Hackathons, coding contests, workshops, and all technical events", createdBy: superadmin._id, admins: [] },
    { name: "Cultural Committee",   description: "Dance, music, drama, art, and all cultural events",               createdBy: superadmin._id, admins: [] },
    { name: "Sports Committee",     description: "All sports tournaments, fitness events, and outdoor activities",   createdBy: superadmin._id, admins: [] },
    { name: "General Committee",    description: "Miscellaneous events, logistics, and general operations",          createdBy: superadmin._id, admins: [] },
  ]);
  console.log("🏛️  Committees:", committees.map(c => c.name).join(", "));

  // ── Admins ──────────────────────────────────────────────────────────────
  const adminData = [
    { name: "Aryan Mehta",    email: "aryan.mehta@collegefest.com",    committee: 0, isApproved: true  },
    { name: "Sneha Rao",      email: "sneha.rao@collegefest.com",      committee: 1, isApproved: true  },
    { name: "Kabir Singh",    email: "kabir.singh@collegefest.com",    committee: 2, isApproved: true  },
    { name: "Priya Nair",     email: "priya.nair@collegefest.com",     committee: 3, isApproved: true  },
    { name: "Rohan Das",      email: "rohan.das@collegefest.com",      committee: 0, isApproved: false },
    { name: "Aisha Khan",     email: "aisha.khan@collegefest.com",     committee: 1, isApproved: false },
    { name: "Nikhil Sharma",  email: "nikhil.sharma@collegefest.com",  committee: 2, isApproved: false },
  ];

  const admins = [];
  for (const a of adminData) {
    const user = await User.create({
      name: a.name, email: a.email, password: "admin123",
      role: "admin", isApproved: a.isApproved, college: "SPIT Mumbai",
      phone: phone("98765"), committees: a.isApproved ? [committees[a.committee]._id] : [],
    });
    admins.push({ user, ci: a.committee });
    if (a.isApproved) await Committee.findByIdAndUpdate(committees[a.committee]._id, { $push: { admins: user._id } });
  }
  console.log("👔 Admins:", admins.map(a => a.user.name).join(", "));

  const [techAdmin, cultAdmin, sportAdmin, genAdmin] = admins.map(a => a.user);

  // ── Students (20) ────────────────────────────────────────────────────────
  const studentData = [
    { name: "Rahul Sharma",     email: "rahul.sharma@student.com",     year: "Third Year"   },
    { name: "Ananya Patel",     email: "ananya.patel@student.com",     year: "Second Year"  },
    { name: "Dev Khanna",       email: "dev.khanna@student.com",       year: "First Year"   },
    { name: "Meera Joshi",      email: "meera.joshi@student.com",      year: "Fourth Year"  },
    { name: "Siddharth Iyer",   email: "siddharth.iyer@student.com",   year: "Second Year"  },
    { name: "Tanvi Desai",      email: "tanvi.desai@student.com",      year: "Third Year"   },
    { name: "Amit Verma",       email: "amit.verma@student.com",       year: "First Year"   },
    { name: "Pooja Gupta",      email: "pooja.gupta@student.com",      year: "Second Year"  },
    { name: "Karan Malhotra",   email: "karan.malhotra@student.com",   year: "Third Year"   },
    { name: "Divya Krishnan",   email: "divya.krishnan@student.com",   year: "Second Year"  },
    { name: "Arjun Reddy",      email: "arjun.reddy@student.com",      year: "Fourth Year"  },
    { name: "Simran Kaur",      email: "simran.kaur@student.com",      year: "First Year"   },
    { name: "Yash Tiwari",      email: "yash.tiwari@student.com",      year: "Third Year"   },
    { name: "Nisha Agarwal",    email: "nisha.agarwal@student.com",    year: "Second Year"  },
    { name: "Rohan Bose",       email: "rohan.bose@student.com",       year: "First Year"   },
    { name: "Prachi Kulkarni",  email: "prachi.kulkarni@student.com",  year: "Fourth Year"  },
    { name: "Vivek Mishra",     email: "vivek.mishra@student.com",     year: "Second Year"  },
    { name: "Anjali Singh",     email: "anjali.singh@student.com",     year: "Third Year"   },
    { name: "Harsh Pandey",     email: "harsh.pandey@student.com",     year: "First Year"   },
    { name: "Riya Shah",        email: "riya.shah@student.com",        year: "Second Year"  },
  ];

  const students = [];
  for (const s of studentData) {
    const user = await User.create({
      name: s.name, email: s.email, password: "student123",
      role: "student", isApproved: true, college: "SPIT Mumbai",
      year: s.year, phone: phone("91234"),
    });
    students.push(user);
  }
  console.log("🎓 Students:", students.length);

  // ── Events (16) ──────────────────────────────────────────────────────────
  const events = await Event.insertMany([
    // Technical — approved                                                                events[0]
    { title: "HackSPIT 2025",        description: "Annual 24-hour hackathon. Build innovative solutions for real-world problems. Win exciting prizes and get mentored by industry experts.",    category: "technical", date: futureDate(10), time: "09:00 AM", venue: "Computer Lab Block A",  capacity: 100, teamSize: 3, entryFee: 0,   status: "approved", committee: committees[0]._id, createdBy: techAdmin._id,  registeredCount: 0 },
    // events[1]
    { title: "CodeSprint",            description: "Competitive programming contest testing algorithmic skills. Solve challenging problems within time limits and climb the leaderboard.",        category: "technical", date: futureDate(15), time: "10:00 AM", venue: "Seminar Hall 1",        capacity: 60,  teamSize: 1, entryFee: 50,  status: "approved", committee: committees[0]._id, createdBy: techAdmin._id,  registeredCount: 0 },
    // events[2]
    { title: "WebDev Workshop",       description: "Hands-on workshop on modern web development using React and Node.js. Build and deploy a full-stack app in 6 hours.",                          category: "technical", date: futureDate(20), time: "10:00 AM", venue: "Computer Lab Block B",  capacity: 50,  teamSize: 1, entryFee: 0,   status: "approved", committee: committees[0]._id, createdBy: techAdmin._id,  registeredCount: 0 },
    // events[3]
    { title: "Cybersecurity CTF",     description: "Capture the Flag competition testing security skills. Participants solve security challenges to find flags and score points.",                  category: "technical", date: futureDate(25), time: "11:00 AM", venue: "Server Room Lab",       capacity: 40,  teamSize: 2, entryFee: 100, status: "approved", committee: committees[0]._id, createdBy: techAdmin._id,  registeredCount: 0 },
    // Cultural — approved                                                                 events[4]
    { title: "Antakshari Night",      description: "A melodious evening of musical showdown. Teams compete in the classic Indian song game. Bring your best voices and energy!",                  category: "cultural",  date: futureDate(7),  time: "06:00 PM", venue: "Main Auditorium",       capacity: 200, teamSize: 4, entryFee: 20,  status: "approved", committee: committees[1]._id, createdBy: cultAdmin._id,  registeredCount: 0 },
    // events[5]
    { title: "Dance Fiesta",          description: "Showcase your dance talent. Solo and group performances across classical, western, and fusion categories judged by professional choreographers.", category: "cultural",  date: futureDate(12), time: "05:00 PM", venue: "Main Auditorium",       capacity: 150, teamSize: 6, entryFee: 30,  status: "approved", committee: committees[1]._id, createdBy: cultAdmin._id,  registeredCount: 0 },
    // events[6]
    { title: "Battle of Bands",       description: "Rock the stage with your band. Compete across genres including rock, pop, jazz, and fusion. Judged on performance and originality.",           category: "cultural",  date: futureDate(18), time: "07:00 PM", venue: "Open Air Amphitheatre", capacity: 300, teamSize: 5, entryFee: 50,  status: "approved", committee: committees[1]._id, createdBy: cultAdmin._id,  registeredCount: 0 },
    // Sports — approved                                                                   events[7]
    { title: "Cricket Tournament",    description: "Inter-department cricket tournament with knockout format. Form your team and compete for the championship trophy and glory!",                   category: "sports",    date: futureDate(5),  time: "08:00 AM", venue: "College Ground",        capacity: 80,  teamSize: 6, entryFee: 100, status: "approved", committee: committees[2]._id, createdBy: sportAdmin._id, registeredCount: 0 },
    // events[8]
    { title: "Table Tennis Open",     description: "Open table tennis tournament for all skill levels. Singles and doubles format with round-robin group stage and knockout finals.",               category: "sports",    date: futureDate(8),  time: "09:00 AM", venue: "Sports Complex",        capacity: 40,  teamSize: 1, entryFee: 50,  status: "approved", committee: committees[2]._id, createdBy: sportAdmin._id, registeredCount: 0 },
    // events[9]
    { title: "Basketball 3v3",        description: "Fast-paced 3-on-3 basketball tournament on the outdoor court. Quick games, high energy, and intense competition.",                              category: "sports",    date: futureDate(14), time: "08:00 AM", venue: "Basketball Court",      capacity: 48,  teamSize: 3, entryFee: 75,  status: "approved", committee: committees[2]._id, createdBy: sportAdmin._id, registeredCount: 0 },
    // Pending events                                                                      events[10]
    { title: "AI/ML Workshop",        description: "Hands-on workshop on Artificial Intelligence and Machine Learning with Python. Build real models with industry-grade tools.",                   category: "technical", date: futureDate(22), time: "10:00 AM", venue: "Computer Lab Block B",  capacity: 50,  teamSize: 1, entryFee: 0,   status: "pending",  committee: committees[0]._id, createdBy: techAdmin._id,  registeredCount: 0 },
    // events[11]
    { title: "Photography Contest",   description: "Capture the beauty of campus life. Theme-based photography contest judged by professional photographers. Cash prizes for winners.",              category: "other",     date: futureDate(16), time: "09:00 AM", venue: "College Campus",        capacity: 30,  teamSize: 1, entryFee: 0,   status: "pending",  committee: committees[3]._id, createdBy: genAdmin._id,   registeredCount: 0 },
    // events[12]
    { title: "Stand-Up Comedy Night", description: "An evening of laughs featuring student comedians. Open mic format with a grand finale featuring the best performers of the evening.",           category: "cultural",  date: futureDate(30), time: "07:00 PM", venue: "Main Auditorium",       capacity: 200, teamSize: 1, entryFee: 40,  status: "pending",  committee: committees[1]._id, createdBy: cultAdmin._id,  registeredCount: 0 },
    // Rejected                                                                            events[13]
    { title: "Laser Tag Battle",      description: "Action-packed laser tag on campus grounds.",                                                                                                    category: "sports",    date: futureDate(35), time: "04:00 PM", venue: "Outdoor Area",          capacity: 40,  teamSize: 5, entryFee: 200, status: "rejected", rejectionNote: "Venue not available. Equipment logistics not feasible.", committee: committees[2]._id, createdBy: sportAdmin._id, registeredCount: 0 },
    // Past events                                                                         events[14]
    { title: "Freshers Welcome 2025", description: "Annual welcome celebration for new students with performances, games, and an unforgettable night of entertainment.",                            category: "cultural",  date: pastDate(30),   time: "05:00 PM", venue: "Main Auditorium",       capacity: 300, teamSize: 1, entryFee: 0,   status: "approved", committee: committees[1]._id, createdBy: cultAdmin._id,  registeredCount: 0 },
    // events[15]
    { title: "Ideathon 2025",         description: "Annual idea pitching competition where student teams present innovative startup ideas to a panel of investors and industry mentors.",           category: "technical", date: pastDate(45),   time: "10:00 AM", venue: "Seminar Hall 2",        capacity: 80,  teamSize: 4, entryFee: 0,   status: "approved", committee: committees[0]._id, createdBy: techAdmin._id,  registeredCount: 0 },
  ]);
  console.log("🎪 Events:", events.length);

  // approvedEvents — filtered indices (used everywhere below):
  // [0]  HackSPIT 2025        → events[0]
  // [1]  CodeSprint            → events[1]
  // [2]  WebDev Workshop       → events[2]
  // [3]  Cybersecurity CTF     → events[3]
  // [4]  Antakshari Night      → events[4]
  // [5]  Dance Fiesta          → events[5]
  // [6]  Battle of Bands       → events[6]
  // [7]  Cricket Tournament    → events[7]
  // [8]  Table Tennis Open     → events[8]
  // [9]  Basketball 3v3        → events[9]
  // [10] Freshers Welcome 2025 → events[14]
  // [11] Ideathon 2025         → events[15]
  const approvedEvents = events.filter(e => e.status === "approved");

  // ── Registrations ─────────────────────────────────────────────────────────
  const regPlan = [
    // Rahul — technical enthusiast
    { si: 0,  ei: 0,  status: "confirmed" }, // HackSPIT
    { si: 0,  ei: 1,  status: "confirmed" }, // CodeSprint
    { si: 0,  ei: 7,  status: "confirmed" }, // Cricket Tournament
    // Ananya — cultural + sports
    { si: 1,  ei: 0,  status: "confirmed" }, // HackSPIT
    { si: 1,  ei: 4,  status: "confirmed" }, // Antakshari Night
    { si: 1,  ei: 5,  status: "confirmed" }, // Dance Fiesta
    // Dev — technical
    { si: 2,  ei: 1,  status: "confirmed" }, // CodeSprint
    { si: 2,  ei: 2,  status: "confirmed" }, // WebDev Workshop
    { si: 2,  ei: 8,  status: "confirmed" }, // Table Tennis Open
    // Meera — cultural + past
    { si: 3,  ei: 4,  status: "attended"  }, // Antakshari Night
    { si: 3,  ei: 10, status: "attended"  }, // Freshers Welcome 2025
    { si: 3,  ei: 6,  status: "confirmed" }, // Battle of Bands
    // Siddharth — sports
    { si: 4,  ei: 7,  status: "confirmed" }, // Cricket Tournament
    { si: 4,  ei: 8,  status: "confirmed" }, // Table Tennis Open
    { si: 4,  ei: 0,  status: "confirmed" }, // HackSPIT
    // Tanvi — cultural + cancelled
    { si: 5,  ei: 5,  status: "confirmed" }, // Dance Fiesta
    { si: 5,  ei: 8,  status: "cancelled"  }, // Table Tennis Open
    { si: 5,  ei: 6,  status: "confirmed" }, // Battle of Bands
    // Amit — technical
    { si: 6,  ei: 1,  status: "confirmed" }, // CodeSprint
    { si: 6,  ei: 3,  status: "confirmed" }, // Cybersecurity CTF
    // Pooja — cultural
    { si: 7,  ei: 4,  status: "confirmed" }, // Antakshari Night
    { si: 7,  ei: 5,  status: "confirmed" }, // Dance Fiesta
    // Karan — sports + technical
    { si: 8,  ei: 7,  status: "confirmed" }, // Cricket Tournament
    { si: 8,  ei: 9,  status: "confirmed" }, // Basketball 3v3
    { si: 8,  ei: 3,  status: "confirmed" }, // Cybersecurity CTF
    // Divya — cultural
    { si: 9,  ei: 4,  status: "confirmed" }, // Antakshari Night
    { si: 9,  ei: 6,  status: "confirmed" }, // Battle of Bands
    // Arjun — sports
    { si: 10, ei: 7,  status: "confirmed" }, // Cricket Tournament
    { si: 10, ei: 8,  status: "confirmed" }, // Table Tennis Open
    { si: 10, ei: 9,  status: "confirmed" }, // Basketball 3v3
    // Simran — technical
    { si: 11, ei: 2,  status: "confirmed" }, // WebDev Workshop
    { si: 11, ei: 0,  status: "confirmed" }, // HackSPIT
    // Yash — all round
    { si: 12, ei: 1,  status: "confirmed" }, // CodeSprint
    { si: 12, ei: 5,  status: "confirmed" }, // Dance Fiesta
    { si: 12, ei: 7,  status: "confirmed" }, // Cricket Tournament
    // Nisha — cultural
    { si: 13, ei: 4,  status: "attended"  }, // Antakshari Night
    { si: 13, ei: 10, status: "attended"  }, // Freshers Welcome 2025
    // Rohan — sports
    { si: 14, ei: 7,  status: "confirmed" }, // Cricket Tournament
    { si: 14, ei: 9,  status: "confirmed" }, // Basketball 3v3
    // Prachi — past events
    { si: 15, ei: 10, status: "attended"  }, // Freshers Welcome 2025
    { si: 15, ei: 11, status: "attended"  }, // Ideathon 2025
    // Vivek — technical
    { si: 16, ei: 0,  status: "confirmed" }, // HackSPIT
    { si: 16, ei: 2,  status: "confirmed" }, // WebDev Workshop
    { si: 16, ei: 3,  status: "confirmed" }, // Cybersecurity CTF
    // Anjali — cultural + sports
    { si: 17, ei: 5,  status: "confirmed" }, // Dance Fiesta
    { si: 17, ei: 6,  status: "confirmed" }, // Battle of Bands
    // Harsh — technical
    { si: 18, ei: 1,  status: "confirmed" }, // CodeSprint
    { si: 18, ei: 2,  status: "confirmed" }, // WebDev Workshop
    // Riya — cultural
    { si: 19, ei: 4,  status: "confirmed" }, // Antakshari Night
    { si: 19, ei: 5,  status: "confirmed" }, // Dance Fiesta
    { si: 19, ei: 6,  status: "confirmed" }, // Battle of Bands
  ];

  const registrations = [];
  for (const r of regPlan) {
    const event = approvedEvents[r.ei];
    if (!event) continue;
    const student = students[r.si];
    const exists = registrations.find(x => x.event?.toString() === event._id.toString() && x.student?.toString() === student._id.toString());
    if (exists) continue;
    const reg = await Registration.create({
      event: event._id, student: student._id,
      registrationId: regId(), status: r.status,
      checkedIn: r.status === "attended",
      qrCode: `QR-${student._id}-${event._id}`, teamMembers: [],
    });
    registrations.push(reg);
    if (r.status !== "cancelled") {
      await Event.findByIdAndUpdate(event._id, { $inc: { registeredCount: 1 } });
    }
  }
  console.log("📋 Registrations:", registrations.length);

  // ── Volunteers (12) ──────────────────────────────────────────────────────
  const volunteerData = [
    { name: "Vikram Nair",    email: "vikram.nair@vol.com",    phone: phone("98121"), committee: 0, admin: techAdmin,
      assignments: [
        { event: approvedEvents[0]._id, role: "Registration Desk", attended: true  }, // HackSPIT
        { event: approvedEvents[1]._id, role: "Tech Support",       attended: false }, // CodeSprint
      ]},
    { name: "Neha Kulkarni",  email: "neha.kulkarni@vol.com",  phone: phone("98122"), committee: 0, admin: techAdmin,
      assignments: [
        { event: approvedEvents[0]._id, role: "Stage Crew",         attended: true  }, // HackSPIT
        { event: approvedEvents[2]._id, role: "Event Coordinator",  attended: false }, // WebDev Workshop
      ]},
    { name: "Rohan Pillai",   email: "rohan.pillai@vol.com",   phone: phone("98123"), committee: 1, admin: cultAdmin,
      assignments: [
        { event: approvedEvents[4]._id, role: "Event Coordinator",  attended: false }, // Antakshari Night
        { event: approvedEvents[5]._id, role: "Stage Crew",         attended: false }, // Dance Fiesta
      ]},
    { name: "Divya Shah",     email: "divya.shah@vol.com",     phone: phone("98124"), committee: 1, admin: cultAdmin,
      assignments: [
        { event: approvedEvents[4]._id,  role: "Registration Desk", attended: false }, // Antakshari Night
        { event: approvedEvents[10]._id, role: "Hospitality",       attended: true  }, // Freshers Welcome 2025
      ]},
    { name: "Karan Mehta",    email: "karan.mehta@vol.com",    phone: phone("98125"), committee: 2, admin: sportAdmin,
      assignments: [
        { event: approvedEvents[7]._id, role: "Ground Marshal",     attended: false }, // Cricket Tournament
        { event: approvedEvents[8]._id, role: "Scorekeeping",       attended: false }, // Table Tennis Open
      ]},
    { name: "Prerna Joshi",   email: "prerna.joshi@vol.com",   phone: phone("98126"), committee: 2, admin: sportAdmin,
      assignments: [
        { event: approvedEvents[7]._id, role: "First Aid",          attended: false }, // Cricket Tournament
        { event: approvedEvents[9]._id, role: "Ground Marshal",     attended: false }, // Basketball 3v3
      ]},
    { name: "Sahil Gupta",    email: "sahil.gupta@vol.com",    phone: phone("98127"), committee: 3, admin: genAdmin,
      assignments: [
        { event: approvedEvents[5]._id, role: "Crowd Management",   attended: false }, // Dance Fiesta
      ]},
    { name: "Pooja Menon",    email: "pooja.menon@vol.com",    phone: phone("98128"), committee: 1, admin: cultAdmin,
      assignments: [
        { event: approvedEvents[6]._id, role: "Stage Crew",         attended: false }, // Battle of Bands
        { event: approvedEvents[5]._id, role: "Photography",        attended: false }, // Dance Fiesta
      ]},
    { name: "Aakash Tiwari",  email: "aakash.tiwari@vol.com",  phone: phone("98129"), committee: 0, admin: techAdmin,
      assignments: [
        { event: approvedEvents[3]._id, role: "Tech Support",       attended: false }, // Cybersecurity CTF
      ]},
    { name: "Sonal Verma",    email: "sonal.verma@vol.com",    phone: phone("98130"), committee: 2, admin: sportAdmin,
      assignments: [
        { event: approvedEvents[8]._id, role: "Scorekeeping",       attended: false }, // Table Tennis Open
        { event: approvedEvents[9]._id, role: "Registration Desk",  attended: false }, // Basketball 3v3
      ]},
    { name: "Mihir Patil",    email: "mihir.patil@vol.com",    phone: phone("98131"), committee: 0, admin: techAdmin,
      assignments: [
        { event: approvedEvents[2]._id, role: "Tech Support",       attended: false }, // WebDev Workshop
      ]},
    { name: "Ruchi Agarwal",  email: "ruchi.agarwal@vol.com",  phone: phone("98132"), committee: 1, admin: cultAdmin,
      assignments: [
        { event: approvedEvents[6]._id, role: "Event Coordinator",  attended: false }, // Battle of Bands
        { event: approvedEvents[4]._id, role: "Hospitality",        attended: false }, // Antakshari Night
      ]},
  ];

  const volunteers = [];
  for (const v of volunteerData) {
    const vol = await Volunteer.create({
      name: v.name, email: v.email, phone: v.phone,
      assignments: v.assignments, addedBy: v.admin._id,
      committee: committees[v.committee]._id,
    });
    volunteers.push(vol);
  }
  console.log("🙋 Volunteers:", volunteers.length);

  // ── Sponsors (8) ─────────────────────────────────────────────────────────
  const sponsors = await Sponsor.insertMany([
    { name: "TechCorp India",      dealAmount: 50000, dealType: "cash",    status: "confirmed",   committee: committees[0]._id, addedBy: techAdmin._id,
      notes: "Primary sponsor for HackSPIT. Logo on all banners, t-shirts, and digital assets.",
      actionChecklist: [{ task: "Send proposal", done: true }, { task: "Get signed agreement", done: true }, { task: "Collect cheque", done: true }, { task: "Send thank you letter", done: false }, { task: "Place logo on banners", done: false }, { task: "Social media shoutout", done: false }] },
    { name: "CloudBase Solutions", dealAmount: 25000, dealType: "cash",    status: "negotiating", committee: committees[0]._id, addedBy: techAdmin._id,
      notes: "Interested in co-sponsoring CodeSprint. Awaiting final approval from marketing team.",
      actionChecklist: [{ task: "Send proposal", done: true }, { task: "Follow up call", done: true }, { task: "Send revised proposal", done: true }, { task: "Get agreement signed", done: false }, { task: "Collect payment", done: false }] },
    { name: "StartupHub Mumbai",   dealAmount: 20000, dealType: "cash",    status: "contacted",   committee: committees[0]._id, addedBy: techAdmin._id,
      notes: "Startup incubator interested in sponsoring Ideathon and providing mentors.",
      actionChecklist: [{ task: "Send proposal", done: true }, { task: "Initial meeting scheduled", done: false }, { task: "Get agreement", done: false }] },
    { name: "Rhythm Studios",      dealAmount: 15000, dealType: "in-kind", status: "confirmed",   committee: committees[1]._id, addedBy: cultAdmin._id,
      notes: "Providing professional sound and lighting equipment for all cultural events.",
      actionChecklist: [{ task: "Confirm equipment list", done: true }, { task: "Arrange transport", done: false }, { task: "Setup and soundcheck", done: false }, { task: "Post-event return", done: false }] },
    { name: "Bollywood Beats",     dealAmount: 10000, dealType: "cash",    status: "received",    committee: committees[1]._id, addedBy: cultAdmin._id,
      notes: "Sponsoring prizes for Dance Fiesta and Battle of Bands.",
      actionChecklist: [{ task: "Send proposal", done: true }, { task: "Get agreement", done: true }, { task: "Collect payment", done: true }, { task: "Acknowledge in event", done: false }] },
    { name: "SportZone",           dealAmount: 12000, dealType: "in-kind", status: "received",    committee: committees[2]._id, addedBy: sportAdmin._id,
      notes: "Providing all sports equipment including cricket kits, table tennis gear, and basketball.",
      actionChecklist: [{ task: "Confirm item list", done: true }, { task: "Collect equipment", done: true }, { task: "Return unused items", done: false }] },
    { name: "FitLife Nutrition",   dealAmount: 8000,  dealType: "in-kind", status: "confirmed",   committee: committees[2]._id, addedBy: sportAdmin._id,
      notes: "Providing energy drinks and nutrition bars for all sports events.",
      actionChecklist: [{ task: "Confirm product list", done: true }, { task: "Arrange delivery", done: false }, { task: "Setup distribution stalls", done: false }] },
    { name: "Mumbai Eats",         dealAmount: 8000,  dealType: "in-kind", status: "contacted",   committee: committees[3]._id, addedBy: genAdmin._id,
      notes: "Food stalls and refreshments for all-day events.",
      actionChecklist: [{ task: "Send proposal", done: true }, { task: "Discuss menu options", done: false }, { task: "Confirm stall locations", done: false }, { task: "Health & safety check", done: false }] },
  ]);
  console.log("💰 Sponsors:", sponsors.length);

  // ── Logistics ─────────────────────────────────────────────────────────────
  const logisticsData = [
    { event: approvedEvents[0]._id,  venue: "Computer Lab Block A",  notes: "Ensure all 100 systems are functional. Power backup is mandatory for overnight event.", updatedBy: techAdmin._id,
      checklist: [{ item: "Book Computer Lab Block A", done: true }, { item: "Confirm 100 working systems", done: true }, { item: "Install required IDEs and software", done: true }, { item: "Arrange power backup / UPS", done: false }, { item: "Setup registration desk at entrance", done: false }, { item: "Arrange overnight refreshments", done: false }, { item: "Print event banners and certificates", done: false }, { item: "Setup WiFi access for participants", done: true }] },
    { event: approvedEvents[1]._id,  venue: "Seminar Hall 1",        notes: "Online judge platform must be tested 24 hours before.", updatedBy: techAdmin._id,
      checklist: [{ item: "Book Seminar Hall 1", done: true }, { item: "Test online judge platform", done: false }, { item: "Arrange seating for 60", done: true }, { item: "Setup projector for leaderboard", done: false }, { item: "Print problem statements as backup", done: false }, { item: "Arrange water and refreshments", done: false }] },
    { event: approvedEvents[2]._id,  venue: "Computer Lab Block B",  notes: "Pre-install Node.js, React, and VS Code on all systems.", updatedBy: techAdmin._id,
      checklist: [{ item: "Book Computer Lab Block B", done: true }, { item: "Install Node.js and React", done: true }, { item: "Install VS Code with extensions", done: true }, { item: "Prepare workshop materials", done: false }, { item: "Arrange projector and screen", done: false }] },
    { event: approvedEvents[4]._id,  venue: "Main Auditorium",       notes: "Sound system must be tested 2 hours before event. Coordinate with Rhythm Studios.", updatedBy: cultAdmin._id,
      checklist: [{ item: "Book Main Auditorium", done: true }, { item: "Setup sound system with Rhythm Studios", done: false }, { item: "Stage lighting configuration", done: false }, { item: "Arrange seating for 200", done: false }, { item: "Prepare team buzzers", done: false }, { item: "Setup judge panel area", done: false }] },
    { event: approvedEvents[5]._id,  venue: "Main Auditorium",       notes: "Stage must be cleared between performances. Backstage area needed for costume changes.", updatedBy: cultAdmin._id,
      checklist: [{ item: "Book Main Auditorium", done: true }, { item: "Arrange professional sound system", done: false }, { item: "Setup backstage changing rooms", done: false }, { item: "Arrange judges panel seating", done: false }, { item: "Print score sheets", done: false }, { item: "Setup recording equipment", done: false }, { item: "Arrange flowers and decor", done: false }] },
    { event: approvedEvents[6]._id,  venue: "Open Air Amphitheatre", notes: "Weather backup plan needed. Check forecast 48 hours before.", updatedBy: cultAdmin._id,
      checklist: [{ item: "Book amphitheatre", done: true }, { item: "Arrange stage and PA system", done: false }, { item: "Setup instrument area", done: false }, { item: "Arrange crowd barriers", done: false }, { item: "Plan weather backup", done: false }] },
    { event: approvedEvents[7]._id,  venue: "College Ground",        notes: "Ground must be rolled and pitch prepared morning of event.", updatedBy: sportAdmin._id,
      checklist: [{ item: "Book college ground", done: true }, { item: "Arrange cricket kit from SportZone", done: true }, { item: "Setup boundary markers", done: false }, { item: "Arrange scoreboard", done: false }, { item: "First aid kit on site", done: false }, { item: "Water stations setup", done: false }, { item: "Umpire arrangement", done: false }] },
    { event: approvedEvents[8]._id,  venue: "Sports Complex",        notes: "Confirm minimum 4 tables available. Check net condition.", updatedBy: sportAdmin._id,
      checklist: [{ item: "Book Sports Complex", done: true }, { item: "Confirm 4 TT tables", done: true }, { item: "Arrange balls and paddles", done: true }, { item: "Setup tournament bracket display", done: false }, { item: "Arrange umpires", done: false }] },
    { event: approvedEvents[9]._id,  venue: "Basketball Court",      notes: "Court markings must be visible. Arrange portable hoops if needed.", updatedBy: sportAdmin._id,
      checklist: [{ item: "Book basketball court", done: true }, { item: "Arrange basketballs", done: true }, { item: "Mark 3v3 court dimensions", done: false }, { item: "Setup scoreboard", done: false }, { item: "Arrange referees", done: false }] },
    { event: approvedEvents[10]._id, venue: "Main Auditorium",       notes: "Past event — fully completed.", updatedBy: cultAdmin._id, // Freshers Welcome 2025
      checklist: [{ item: "Book auditorium", done: true }, { item: "Sound and lighting", done: true }, { item: "Welcome gifts for freshers", done: true }, { item: "Photo booth setup", done: true }, { item: "Food and refreshments", done: true }] },
  ];

  const logisticsList = [];
  for (const l of logisticsData) {
    const log = await Logistics.create(l);
    logisticsList.push(log);
  }
  console.log("📦 Logistics:", logisticsList.length, "events");

  // ── Finance ───────────────────────────────────────────────────────────────
  const financeData = [
    { event: approvedEvents[0]._id,  budget: 35000, expectedRevenue: 0,    committee: committees[0]._id, updatedBy: techAdmin._id,
      expenses: [{ label: "Overnight Refreshments", amount: 10000, note: "Meals and snacks for 100 participants" }, { label: "Printing and Banners", amount: 4000, note: "Event banners, certificates, name tags" }, { label: "Prizes — 1st, 2nd, 3rd", amount: 15000, note: "Cash prizes for top 3 teams" }, { label: "Power Backup Setup", amount: 3000, note: "UPS rental for 24 hours" }] },
    { event: approvedEvents[1]._id,  budget: 12000, expectedRevenue: 3000, committee: committees[0]._id, updatedBy: techAdmin._id,
      expenses: [{ label: "Online Judge Platform", amount: 2500, note: "HackerEarth enterprise license" }, { label: "Prizes", amount: 6000, note: "Cash prizes for top 5" }, { label: "Refreshments", amount: 2000, note: "Tea, coffee, snacks" }] },
    { event: approvedEvents[4]._id,  budget: 18000, expectedRevenue: 4000, committee: committees[1]._id, updatedBy: cultAdmin._id,
      expenses: [{ label: "Sound System", amount: 6000, note: "Partial — rest from Rhythm Studios" }, { label: "Stage Decoration", amount: 4000, note: "Lights and backdrop" }, { label: "Prizes and Trophies", amount: 5000, note: "Trophies + certificates" }, { label: "Refreshments", amount: 1500, note: "Snacks for participants" }] },
    { event: approvedEvents[5]._id,  budget: 22000, expectedRevenue: 4500, committee: committees[1]._id, updatedBy: cultAdmin._id,
      expenses: [{ label: "Professional Sound System", amount: 8000, note: "Partially sponsored by Rhythm Studios" }, { label: "Stage Lighting", amount: 5000, note: "LED stage setup" }, { label: "Judges Honorarium", amount: 4000, note: "3 judges × Rs.1333" }, { label: "Prizes", amount: 4000, note: "Trophies for top 3 categories" }] },
    { event: approvedEvents[7]._id,  budget: 28000, expectedRevenue: 8000, committee: committees[2]._id, updatedBy: sportAdmin._id,
      expenses: [{ label: "Cricket Kit", amount: 6000, note: "Supplemented by SportZone" }, { label: "Ground Preparation", amount: 3500, note: "Rolling, pitch prep, marking" }, { label: "Prizes and Trophies", amount: 10000, note: "Winner + runner-up" }, { label: "Refreshments", amount: 2500, note: "Water, energy drinks" }, { label: "First Aid", amount: 1000, note: "Kit and medic fee" }] },
    { event: approvedEvents[8]._id,  budget: 10000, expectedRevenue: 2000, committee: committees[2]._id, updatedBy: sportAdmin._id,
      expenses: [{ label: "Equipment", amount: 2000, note: "Extra balls and paddles" }, { label: "Prizes", amount: 4000, note: "Trophies for singles and doubles" }, { label: "Refreshments", amount: 800, note: "Water bottles" }] },
    { event: approvedEvents[10]._id, budget: 45000, expectedRevenue: 0,    committee: committees[1]._id, updatedBy: cultAdmin._id, // Freshers Welcome 2025
      expenses: [{ label: "Sound and Lighting", amount: 14000, note: "Full auditorium setup" }, { label: "Welcome Kits", amount: 12000, note: "Gift bags for 250 freshers" }, { label: "Food and Refreshments", amount: 10000, note: "Dinner and snacks" }, { label: "Photo Booth", amount: 4000, note: "Props and instant prints" }, { label: "Decoration", amount: 5000, note: "Banners, balloons, flowers" }] },
  ];

  const financeList = [];
  for (const f of financeData) {
    const fin = await Finance.create(f);
    financeList.push(fin);
  }
  console.log("💵 Finance:", financeList.length, "records");

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n══════════════════════════════════════════════════════");
  console.log("✅ SEED COMPLETE");
  console.log("══════════════════════════════════════════════════════");
  console.log("👑 Superadmin:  superadmin@collegefest.com / superadmin123");
  console.log("👔 Approved Admins (password: admin123):");
  console.log("   aryan.mehta@collegefest.com    (Technical)");
  console.log("   sneha.rao@collegefest.com       (Cultural)");
  console.log("   kabir.singh@collegefest.com     (Sports)");
  console.log("   priya.nair@collegefest.com      (General)");
  console.log("👔 Pending Admins (password: admin123):");
  console.log("   rohan.das@collegefest.com");
  console.log("   aisha.khan@collegefest.com");
  console.log("   nikhil.sharma@collegefest.com");
  console.log("🎓 Students (password: student123) — 20 students");
  console.log("   rahul.sharma@student.com  ananya.patel@student.com");
  console.log("   dev.khanna@student.com    meera.joshi@student.com");
  console.log("   ... and 16 more");
  console.log("══════════════════════════════════════════════════════");
  console.log(`🏛️  Committees:   ${committees.length}`);
  console.log(`🎪 Events:        ${events.length} (approved: ${events.filter(e=>e.status==="approved").length}, pending: ${events.filter(e=>e.status==="pending").length}, rejected: ${events.filter(e=>e.status==="rejected").length})`);
  console.log(`📋 Registrations: ${registrations.length}`);
  console.log(`🙋 Volunteers:    ${volunteers.length}`);
  console.log(`💰 Sponsors:      ${sponsors.length}`);
  console.log(`📦 Logistics:     ${logisticsList.length}`);
  console.log(`💵 Finance:       ${financeList.length}`);
  console.log("══════════════════════════════════════════════════════\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error("❌ Seed failed:", err.message); process.exit(1); });