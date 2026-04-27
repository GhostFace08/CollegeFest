$src = "C:\Users\Rishabh Goyal\OneDrive\Desktop\COLLEGE\SIXTH SEMESTER\DevOPS\CollegeFest\frontend\src"

# ─── COMMON COMPONENTS ───────────────────────────────────────────

@'
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <nav className="bg-white shadow px-6 py-3 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold text-indigo-600">CollegeFest</Link>
      <div className="flex gap-4 items-center">
        {!user && <><Link to="/login" className="text-sm text-gray-600 hover:text-indigo-600">Login</Link><Link to="/register" className="text-sm bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">Register</Link></>}
        {user?.role === "student" && <><Link to="/my-registrations" className="text-sm text-gray-600 hover:text-indigo-600">My Events</Link><Link to="/profile" className="text-sm text-gray-600 hover:text-indigo-600">Profile</Link></>}
        {user?.role === "admin" && <><Link to="/admin" className="text-sm text-gray-600 hover:text-indigo-600">Dashboard</Link><Link to="/admin/events" className="text-sm text-gray-600 hover:text-indigo-600">Events</Link></>}
        {user?.role === "superadmin" && <Link to="/superadmin" className="text-sm text-gray-600 hover:text-indigo-600">Super Admin</Link>}
        {user && <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700">Logout</button>}
      </div>
    </nav>
  );
};
export default Navbar;
'@ | Set-Content "$src\components\common\Navbar.jsx" -Encoding UTF8

@'
const Badge = ({ text, color = "gray" }) => {
  const colors = {
    green: "bg-green-100 text-green-800", red: "bg-red-100 text-red-800",
    yellow: "bg-yellow-100 text-yellow-800", blue: "bg-blue-100 text-blue-800",
    purple: "bg-purple-100 text-purple-800", gray: "bg-gray-100 text-gray-800",
    orange: "bg-orange-100 text-orange-800",
  };
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[color] || colors.gray}`}>{text}</span>;
};
export default Badge;
'@ | Set-Content "$src\components\common\Badge.jsx" -Encoding UTF8

@'
const Spinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);
export default Spinner;
'@ | Set-Content "$src\components\common\Spinner.jsx" -Encoding UTF8

@'
const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-xl">&times;</button>
        {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}
        {children}
      </div>
    </div>
  );
};
export default Modal;
'@ | Set-Content "$src\components\common\Modal.jsx" -Encoding UTF8

# ─── STUDENT PAGES ───────────────────────────────────────────────

@'
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import Navbar from "../../components/common/Navbar";
import Badge from "../../components/common/Badge";
import Spinner from "../../components/common/Spinner";
import { formatDate, getCategoryColor, truncate } from "../../utils/helpers";

const Home = () => {
  const [category, setCategory] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["events", category],
    queryFn: () => api.get(`/events${category ? `?category=${category}` : ""}`).then(r => r.data.data.events),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Upcoming Events</h1>
        <p className="text-gray-500 mb-6">Browse and register for fest events</p>
        <div className="flex gap-2 mb-6">
          {["", "technical", "cultural", "sports", "other"].map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-1 rounded-full text-sm border ${category === c ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"}`}>
              {c || "All"}
            </button>
          ))}
        </div>
        {isLoading ? <Spinner /> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.length === 0 && <p className="text-gray-400">No events found.</p>}
            {data?.map(event => (
              <Link to={`/events/${event._id}`} key={event._id} className="bg-white rounded-xl shadow hover:shadow-md transition p-5 flex flex-col gap-2">
                {event.poster && <img src={event.poster} alt={event.title} className="w-full h-36 object-cover rounded-lg mb-2" />}
                <div className="flex justify-between items-start">
                  <h2 className="font-semibold text-gray-800 text-lg">{event.title}</h2>
                  <Badge text={event.category} color={getCategoryColor(event.category)} />
                </div>
                <p className="text-gray-500 text-sm">{truncate(event.description, 80)}</p>
                <div className="text-sm text-gray-400 mt-auto pt-2 border-t flex justify-between">
                  <span>{formatDate(event.date)} - {event.time}</span>
                  <span>{event.registeredCount}/{event.capacity} seats</span>
                </div>
                <div className="text-sm text-gray-500">{event.venue}</div>
                {event.entryFee > 0 && <div className="text-sm font-medium text-indigo-600">Rs. {event.entryFee} (Pay at venue)</div>}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default Home;
'@ | Set-Content "$src\pages\student\Home.jsx" -Encoding UTF8

@'
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import api from "../../utils/api";
import Navbar from "../../components/common/Navbar";
import Badge from "../../components/common/Badge";
import Spinner from "../../components/common/Spinner";
import Modal from "../../components/common/Modal";
import { formatDate, getCategoryColor } from "../../utils/helpers";
import { useAuth } from "../../context/AuthContext";

const EventDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: () => api.get(`/events/${id}`).then(r => r.data.data.event),
  });

  const handleRegister = async () => {
    if (!user) { navigate("/login"); return; }
    setLoading(true);
    try {
      await api.post("/registrations", { eventId: id, teamMembers });
      toast.success("Registered! Check your email for QR ticket.");
      setShowModal(false);
      navigate("/my-registrations");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  if (isLoading) return <><Navbar /><Spinner /></>;
  if (!event) return <><Navbar /><p className="p-8 text-gray-500">Event not found.</p></>;

  const isFull = event.registeredCount >= event.capacity;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        {event.poster && <img src={event.poster} alt={event.title} className="w-full h-56 object-cover rounded-xl mb-6" />}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-start mb-3">
            <h1 className="text-2xl font-bold text-gray-800">{event.title}</h1>
            <Badge text={event.category} color={getCategoryColor(event.category)} />
          </div>
          <p className="text-gray-600 mb-4">{event.description}</p>
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-500 mb-6">
            <div><span className="font-medium text-gray-700">Date:</span> {formatDate(event.date)}</div>
            <div><span className="font-medium text-gray-700">Time:</span> {event.time}</div>
            <div><span className="font-medium text-gray-700">Venue:</span> {event.venue}</div>
            <div><span className="font-medium text-gray-700">Capacity:</span> {event.registeredCount}/{event.capacity}</div>
            <div><span className="font-medium text-gray-700">Team Size:</span> {event.teamSize === 1 ? "Solo" : `Up to ${event.teamSize}`}</div>
            <div><span className="font-medium text-gray-700">Entry Fee:</span> {event.entryFee > 0 ? `Rs. ${event.entryFee} (Pay at venue)` : "Free"}</div>
          </div>
          {isFull ? <p className="text-red-500 font-medium">Event is full</p> :
            <button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
              {user ? "Register Now" : "Login to Register"}
            </button>}
        </div>
      </div>
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Confirm Registration">
        <p className="text-gray-600 mb-4">Registering for <strong>{event.title}</strong></p>
        {event.teamSize > 1 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Team Members (optional)</p>
            {Array.from({ length: event.teamSize - 1 }).map((_, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input placeholder="Name" className="border rounded px-2 py-1 text-sm flex-1"
                  onChange={e => { const t = [...teamMembers]; t[i] = { ...t[i], name: e.target.value }; setTeamMembers(t); }} />
                <input placeholder="Email" className="border rounded px-2 py-1 text-sm flex-1"
                  onChange={e => { const t = [...teamMembers]; t[i] = { ...t[i], email: e.target.value }; setTeamMembers(t); }} />
              </div>
            ))}
          </div>
        )}
        <button onClick={handleRegister} disabled={loading} className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
          {loading ? "Registering..." : "Confirm Registration"}
        </button>
      </Modal>
    </div>
  );
};
export default EventDetail;
'@ | Set-Content "$src\pages\student\EventDetail.jsx" -Encoding UTF8

@'
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      login(res.data.data.user, res.data.data.token);
      toast.success("Welcome back!");
      const role = res.data.data.user.role;
      if (role === "superadmin") navigate("/superadmin");
      else if (role === "admin") navigate("/admin");
      else navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Welcome back</h1>
        <p className="text-gray-500 text-sm mb-6">Login to CollegeFest</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="email" placeholder="Email" required value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          <input type="password" placeholder="Password" required value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          <button type="submit" disabled={loading}
            className="bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="text-sm text-gray-500 mt-4 text-center">
          No account? <Link to="/register" className="text-indigo-600 hover:underline">Register as Student</Link>
        </p>
        <p className="text-sm text-gray-500 mt-1 text-center">
          Admin? <Link to="/register-admin" className="text-indigo-600 hover:underline">Request Admin Access</Link>
        </p>
      </div>
    </div>
  );
};
export default Login;
'@ | Set-Content "$src\pages\student\Login.jsx" -Encoding UTF8

@'
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../utils/api";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", college: "", year: "", isAdmin: false });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = form.isAdmin ? "/auth/register-admin" : "/auth/register";
      await api.post(endpoint, form);
      toast.success(form.isAdmin ? "Request submitted! Await Super Admin approval." : "Registered! Please login.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Create Account</h1>
        <p className="text-gray-500 text-sm mb-6">Join CollegeFest</p>
        <div className="flex gap-3 mb-5">
          <button onClick={() => setForm({...form, isAdmin: false})} className={`flex-1 py-1.5 rounded-lg text-sm border ${!form.isAdmin ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-300"}`}>Student</button>
          <button onClick={() => setForm({...form, isAdmin: true})} className={`flex-1 py-1.5 rounded-lg text-sm border ${form.isAdmin ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-300"}`}>Admin Request</button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input placeholder="Full Name" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          <input type="email" placeholder="Email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          <input type="password" placeholder="Password" required value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          <input placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          {!form.isAdmin && <>
            <input placeholder="College Name" value={form.college} onChange={e => setForm({...form, college: e.target.value})} className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            <input placeholder="Year (e.g. 3rd)" value={form.year} onChange={e => setForm({...form, year: e.target.value})} className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </>}
          <button type="submit" disabled={loading} className="bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 mt-1">
            {loading ? "Submitting..." : form.isAdmin ? "Submit Request" : "Register"}
          </button>
        </form>
        <p className="text-sm text-gray-500 mt-4 text-center">Already have an account? <Link to="/login" className="text-indigo-600 hover:underline">Login</Link></p>
      </div>
    </div>
  );
};
export default Register;
'@ | Set-Content "$src\pages\student\Register.jsx" -Encoding UTF8

@'
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/common/Navbar";

const Profile = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow p-6">
          <h1 className="text-xl font-bold text-gray-800 mb-4">My Profile</h1>
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Name</span><span className="font-medium">{user?.name}</span></div>
            <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Email</span><span className="font-medium">{user?.email}</span></div>
            <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Role</span><span className="font-medium capitalize">{user?.role}</span></div>
            {user?.college && <div className="flex justify-between border-b pb-2"><span className="text-gray-500">College</span><span className="font-medium">{user?.college}</span></div>}
            {user?.year && <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Year</span><span className="font-medium">{user?.year}</span></div>}
            {user?.phone && <div className="flex justify-between"><span className="text-gray-500">Phone</span><span className="font-medium">{user?.phone}</span></div>}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Profile;
'@ | Set-Content "$src\pages\student\Profile.jsx" -Encoding UTF8

@'
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import QRCode from "qrcode.react";
import api from "../../utils/api";
import Navbar from "../../components/common/Navbar";
import Badge from "../../components/common/Badge";
import Spinner from "../../components/common/Spinner";
import Modal from "../../components/common/Modal";
import { formatDate, getStatusColor } from "../../utils/helpers";
import { useState } from "react";

const MyRegistrations = () => {
  const queryClient = useQueryClient();
  const [qrModal, setQrModal] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["my-registrations"],
    queryFn: () => api.get("/registrations/my").then(r => r.data.data.registrations),
  });

  const cancel = useMutation({
    mutationFn: (id) => api.delete(`/registrations/${id}`),
    onSuccess: () => { toast.success("Registration cancelled"); queryClient.invalidateQueries(["my-registrations"]); },
    onError: (err) => toast.error(err.response?.data?.message || "Failed"),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">My Registrations</h1>
        {isLoading ? <Spinner /> : data?.length === 0 ? <p className="text-gray-400">No registrations yet.</p> : (
          <div className="flex flex-col gap-4">
            {data?.map(reg => (
              <div key={reg._id} className="bg-white rounded-xl shadow p-5 flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex gap-2 items-center mb-1">
                    <h2 className="font-semibold text-gray-800">{reg.event?.title}</h2>
                    <Badge text={reg.status} color={getStatusColor(reg.status)} />
                  </div>
                  <p className="text-sm text-gray-500">{formatDate(reg.event?.date)} - {reg.event?.venue}</p>
                  <p className="text-xs text-gray-400 mt-1">ID: {reg.registrationId}</p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <button onClick={() => setQrModal(reg)} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded hover:bg-indigo-100">View QR</button>
                  {reg.status === "confirmed" && (
                    <button onClick={() => cancel.mutate(reg._id)} className="text-xs bg-red-50 text-red-500 px-3 py-1 rounded hover:bg-red-100">Cancel</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Modal open={!!qrModal} onClose={() => setQrModal(null)} title="Your QR Ticket">
        {qrModal && (
          <div className="flex flex-col items-center gap-3">
            <QRCode value={JSON.stringify({ registrationId: qrModal.registrationId, event: qrModal.event?.title })} size={200} />
            <p className="text-sm text-gray-500">Registration ID: <strong>{qrModal.registrationId}</strong></p>
            <p className="text-sm text-gray-500">Event: <strong>{qrModal.event?.title}</strong></p>
          </div>
        )}
      </Modal>
    </div>
  );
};
export default MyRegistrations;
'@ | Set-Content "$src\pages\student\MyRegistrations.jsx" -Encoding UTF8

@'
import { Link } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
const NotFound = () => (
  <div className="min-h-screen bg-gray-50">
    <Navbar />
    <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
      <h1 className="text-6xl font-bold text-indigo-600">404</h1>
      <p className="text-gray-500">Page not found</p>
      <Link to="/" className="text-indigo-600 hover:underline">Go Home</Link>
    </div>
  </div>
);
export default NotFound;
'@ | Set-Content "$src\pages\student\NotFound.jsx" -Encoding UTF8

# ─── ADMIN PAGES ─────────────────────────────────────────────────

@'
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import Navbar from "../../components/common/Navbar";
import Spinner from "../../components/common/Spinner";
import Badge from "../../components/common/Badge";
import { getStatusColor } from "../../utils/helpers";

const AdminDashboard = () => {
  const { data: events, isLoading } = useQuery({
    queryKey: ["admin-events"],
    queryFn: () => api.get("/events/admin/mine").then(r => r.data.data.events),
    refetchInterval: 5000,
  });

  const approved = events?.filter(e => e.status === "approved") || [];
  const pending = events?.filter(e => e.status === "pending") || [];
  const totalSeats = approved.reduce((a, e) => a + e.registeredCount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[["Total Events", events?.length || 0, "indigo"], ["Approved", approved.length, "green"], ["Pending Approval", pending.length, "yellow"]].map(([label, val, color]) => (
            <div key={label} className="bg-white rounded-xl shadow p-5 text-center">
              <p className={`text-3xl font-bold text-${color}-600`}>{val}</p>
              <p className="text-gray-500 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">My Events</h2>
          <Link to="/admin/events/new" className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700">+ New Event</Link>
        </div>
        {isLoading ? <Spinner /> : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-left"><tr>
                <th className="px-4 py-3">Event</th><th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Registrations</th><th className="px-4 py-3">Actions</th>
              </tr></thead>
              <tbody>
                {events?.map(e => (
                  <tr key={e._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{e.title}</td>
                    <td className="px-4 py-3"><Badge text={e.status} color={getStatusColor(e.status)} /></td>
                    <td className="px-4 py-3">{e.registeredCount}/{e.capacity}</td>
                    <td className="px-4 py-3 flex gap-2">
                      <Link to={`/admin/events/edit/${e._id}`} className="text-indigo-600 hover:underline">Edit</Link>
                      <Link to={`/admin/logistics`} className="text-gray-500 hover:underline">Logistics</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4 mt-6">
          {[["Volunteers", "/admin/volunteers"], ["Finance & Sponsors", "/admin/finance"], ["Logistics", "/admin/logistics"], ["QR Scanner", "/admin/scanner"]].map(([label, path]) => (
            <Link key={path} to={path} className="bg-white rounded-xl shadow p-4 text-center text-indigo-600 font-medium hover:shadow-md transition">{label}</Link>
          ))}
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
'@ | Set-Content "$src\pages\admin\Dashboard.jsx" -Encoding UTF8

@'
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../utils/api";
import Navbar from "../../components/common/Navbar";
import Spinner from "../../components/common/Spinner";
import Badge from "../../components/common/Badge";
import { formatDate, getStatusColor } from "../../utils/helpers";

const AdminEvents = () => {
  const queryClient = useQueryClient();
  const { data: events, isLoading } = useQuery({
    queryKey: ["admin-events"],
    queryFn: () => api.get("/events/admin/mine").then(r => r.data.data.events),
  });

  const submit = useMutation({
    mutationFn: (id) => api.post(`/events/${id}/submit`),
    onSuccess: () => { toast.success("Submitted for approval"); queryClient.invalidateQueries(["admin-events"]); },
    onError: (err) => toast.error(err.response?.data?.message || "Failed"),
  });

  const remove = useMutation({
    mutationFn: (id) => api.delete(`/events/${id}`),
    onSuccess: () => { toast.success("Event deleted"); queryClient.invalidateQueries(["admin-events"]); },
    onError: (err) => toast.error(err.response?.data?.message || "Failed"),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">My Events</h1>
          <Link to="/admin/events/new" className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700">+ New Event</Link>
        </div>
        {isLoading ? <Spinner /> : (
          <div className="flex flex-col gap-4">
            {events?.map(e => (
              <div key={e._id} className="bg-white rounded-xl shadow p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h2 className="font-semibold text-gray-800">{e.title}</h2>
                    <p className="text-sm text-gray-500">{formatDate(e.date)} - {e.venue}</p>
                    {e.status === "rejected" && e.rejectionNote && <p className="text-xs text-red-500 mt-1">Rejected: {e.rejectionNote}</p>}
                  </div>
                  <Badge text={e.status} color={getStatusColor(e.status)} />
                </div>
                <div className="flex gap-2 mt-3">
                  <Link to={`/admin/events/edit/${e._id}`} className="text-xs bg-gray-100 px-3 py-1 rounded hover:bg-gray-200">Edit</Link>
                  {e.status === "draft" && <button onClick={() => submit.mutate(e._id)} className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded hover:bg-indigo-100">Submit for Approval</button>}
                  <button onClick={() => remove.mutate(e._id)} className="text-xs bg-red-50 text-red-500 px-3 py-1 rounded hover:bg-red-100">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminEvents;
'@ | Set-Content "$src\pages\admin\Events.jsx" -Encoding UTF8

@'
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../../utils/api";
import Navbar from "../../components/common/Navbar";

const AdminEventForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [committees, setCommittees] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", category: "technical", date: "", time: "", venue: "", capacity: 50, teamSize: 1, entryFee: 0, committee: "" });

  useEffect(() => {
    api.get("/superadmin/committees").then(r => setCommittees(r.data.data.committees)).catch(() => {});
  }, []);

  const { data: event } = useQuery({
    queryKey: ["event-edit", id],
    queryFn: () => api.get(`/events/${id}`).then(r => r.data.data.event),
    enabled: isEdit,
    onSuccess: (e) => setForm({ title: e.title, description: e.description, category: e.category, date: e.date?.slice(0,10), time: e.time, venue: e.venue, capacity: e.capacity, teamSize: e.teamSize, entryFee: e.entryFee, committee: e.committee?._id || "" }),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.committee) { toast.error("Select a committee"); return; }
    setLoading(true);
    try {
      if (isEdit) await api.put(`/events/${id}`, form);
      else await api.post("/events", form);
      toast.success(isEdit ? "Event updated" : "Event created");
      navigate("/admin/events");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally { setLoading(false); }
  };

  const field = (label, key, type = "text", extra = {}) => (
    <div key={key}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})}
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" {...extra} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{isEdit ? "Edit Event" : "Create Event"}</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 flex flex-col gap-4">
          {field("Title", "title")}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">
              {["technical","cultural","sports","other"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Committee</label>
            <select value={form.committee} onChange={e => setForm({...form, committee: e.target.value})} className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="">Select committee</option>
              {committees.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {field("Date", "date", "date")}
            {field("Time", "time", "time")}
          </div>
          {field("Venue", "venue")}
          <div className="grid grid-cols-3 gap-4">
            {field("Capacity", "capacity", "number")}
            {field("Team Size", "teamSize", "number")}
            {field("Entry Fee (Rs.)", "entryFee", "number")}
          </div>
          <button type="submit" disabled={loading} className="bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 mt-2">
            {loading ? "Saving..." : isEdit ? "Update Event" : "Create Event"}
          </button>
        </form>
      </div>
    </div>
  );
};
export default AdminEventForm;
'@ | Set-Content "$src\pages\admin\EventForm.jsx" -Encoding UTF8

@'
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../../utils/api";
import Navbar from "../../components/common/Navbar";
import Spinner from "../../components/common/Spinner";
import Modal from "../../components/common/Modal";

const AdminVolunteers = () => {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  const { data: volunteers, isLoading } = useQuery({
    queryKey: ["volunteers"],
    queryFn: () => api.get("/volunteers").then(r => r.data.data.volunteers),
  });

  const add = useMutation({
    mutationFn: () => api.post("/volunteers", form),
    onSuccess: () => { toast.success("Volunteer added"); queryClient.invalidateQueries(["volunteers"]); setShowAdd(false); setForm({ name: "", email: "", phone: "" }); },
    onError: (err) => toast.error(err.response?.data?.message || "Failed"),
  });

  const remove = useMutation({
    mutationFn: (id) => api.delete(`/volunteers/${id}`),
    onSuccess: () => { toast.success("Removed"); queryClient.invalidateQueries(["volunteers"]); },
  });

  const markAttendance = async (vid, aid, attended) => {
    await api.patch(`/volunteers/${vid}/attendance`, { assignmentId: aid, attended });
    queryClient.invalidateQueries(["volunteers"]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Volunteers</h1>
          <button onClick={() => setShowAdd(true)} className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700">+ Add Volunteer</button>
        </div>
        {isLoading ? <Spinner /> : (
          <div className="flex flex-col gap-4">
            {volunteers?.length === 0 && <p className="text-gray-400">No volunteers yet.</p>}
            {volunteers?.map(v => (
              <div key={v._id} className="bg-white rounded-xl shadow p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-semibold text-gray-800">{v.name}</h2>
                    <p className="text-sm text-gray-500">{v.email} - {v.phone}</p>
                  </div>
                  <button onClick={() => remove.mutate(v._id)} className="text-xs text-red-500 hover:underline">Remove</button>
                </div>
                {v.assignments?.length > 0 && (
                  <div className="mt-3 border-t pt-3">
                    <p className="text-xs font-medium text-gray-500 mb-2">Assignments</p>
                    {v.assignments.map(a => (
                      <div key={a._id} className="flex justify-between items-center text-sm py-1">
                        <span>{a.event?.title} - <span className="text-gray-500">{a.role}</span></span>
                        <button onClick={() => markAttendance(v._id, a._id, !a.attended)}
                          className={`text-xs px-2 py-0.5 rounded ${a.attended ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {a.attended ? "Present" : "Mark Present"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Volunteer">
        <div className="flex flex-col gap-3">
          {["name", "email", "phone"].map(f => (
            <input key={f} placeholder={f.charAt(0).toUpperCase() + f.slice(1)} value={form[f]}
              onChange={e => setForm({...form, [f]: e.target.value})}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          ))}
          <button onClick={() => add.mutate()} className="bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">Add</button>
        </div>
      </Modal>
    </div>
  );
};
export default AdminVolunteers;
'@ | Set-Content "$src\pages\admin\Volunteers.jsx" -Encoding UTF8

@'
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../../utils/api";
import Navbar from "../../components/common/Navbar";
import Spinner from "../../components/common/Spinner";
import Modal from "../../components/common/Modal";
import Badge from "../../components/common/Badge";
import { getStatusColor } from "../../utils/helpers";

const AdminFinance = () => {
  const queryClient = useQueryClient();
  const [showSponsor, setShowSponsor] = useState(false);
  const [sponsorForm, setSponsorForm] = useState({ name: "", dealAmount: 0, dealType: "cash", notes: "" });

  const { data: sponsors, isLoading: loadingSponsors } = useQuery({
    queryKey: ["sponsors"],
    queryFn: () => api.get("/finance/sponsors").then(r => r.data.data.sponsors),
  });

  const addSponsor = useMutation({
    mutationFn: () => api.post("/finance/sponsors", sponsorForm),
    onSuccess: () => { toast.success("Sponsor added"); queryClient.invalidateQueries(["sponsors"]); setShowSponsor(false); },
    onError: (err) => toast.error(err.response?.data?.message || "Failed"),
  });

  const updateStatus = async (id, status) => {
    await api.put(`/finance/sponsors/${id}`, { status });
    queryClient.invalidateQueries(["sponsors"]);
    toast.success("Status updated");
  };

  const toggleTask = async (sponsor, taskIdx) => {
    const updated = sponsor.actionChecklist.map((t, i) => i === taskIdx ? { ...t, done: !t.done } : t);
    await api.put(`/finance/sponsors/${sponsor._id}`, { actionChecklist: updated });
    queryClient.invalidateQueries(["sponsors"]);
  };

  const deleteSponsor = useMutation({
    mutationFn: (id) => api.delete(`/finance/sponsors/${id}`),
    onSuccess: () => { toast.success("Deleted"); queryClient.invalidateQueries(["sponsors"]); },
  });

  const totalConfirmed = sponsors?.filter(s => ["confirmed","received"].includes(s.status)).reduce((a, s) => a + s.dealAmount, 0) || 0;
  const pipeline = ["contacted","negotiating","confirmed","received"];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Finance & Sponsorships</h1>
          <button onClick={() => setShowSponsor(true)} className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700">+ Add Sponsor</button>
        </div>
        <div className="bg-white rounded-xl shadow p-5 mb-6">
          <p className="text-sm text-gray-500">Total Confirmed Sponsorship</p>
          <p className="text-3xl font-bold text-green-600 mt-1">Rs. {totalConfirmed.toLocaleString()}</p>
        </div>
        {loadingSponsors ? <Spinner /> : (
          <div className="flex flex-col gap-4">
            {sponsors?.length === 0 && <p className="text-gray-400">No sponsors yet.</p>}
            {sponsors?.map(s => (
              <div key={s._id} className="bg-white rounded-xl shadow p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h2 className="font-semibold text-gray-800">{s.name}</h2>
                    <p className="text-sm text-gray-500">Rs. {s.dealAmount} - {s.dealType}</p>
                    {s.notes && <p className="text-xs text-gray-400 mt-1">{s.notes}</p>}
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <Badge text={s.status} color={getStatusColor(s.status)} />
                    <button onClick={() => deleteSponsor.mutate(s._id)} className="text-xs text-red-400 hover:underline">Delete</button>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {pipeline.map(st => (
                    <button key={st} onClick={() => updateStatus(s._id, st)}
                      className={`text-xs px-2 py-0.5 rounded border ${s.status === st ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-500 border-gray-300 hover:border-indigo-400"}`}>
                      {st}
                    </button>
                  ))}
                </div>
                {s.actionChecklist?.length > 0 && (
                  <div className="border-t pt-3">
                    <p className="text-xs font-medium text-gray-500 mb-2">Action Checklist</p>
                    {s.actionChecklist.map((t, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm py-0.5">
                        <input type="checkbox" checked={t.done} onChange={() => toggleTask(s, i)} className="cursor-pointer" />
                        <span className={t.done ? "line-through text-gray-400" : "text-gray-700"}>{t.task}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Modal open={showSponsor} onClose={() => setShowSponsor(false)} title="Add Sponsor">
        <div className="flex flex-col gap-3">
          <input placeholder="Sponsor Name" value={sponsorForm.name} onChange={e => setSponsorForm({...sponsorForm, name: e.target.value})} className="border rounded-lg px-3 py-2 text-sm" />
          <input type="number" placeholder="Deal Amount (Rs.)" value={sponsorForm.dealAmount} onChange={e => setSponsorForm({...sponsorForm, dealAmount: e.target.value})} className="border rounded-lg px-3 py-2 text-sm" />
          <select value={sponsorForm.dealType} onChange={e => setSponsorForm({...sponsorForm, dealType: e.target.value})} className="border rounded-lg px-3 py-2 text-sm">
            <option value="cash">Cash</option><option value="in-kind">In-Kind</option>
          </select>
          <textarea placeholder="Notes" value={sponsorForm.notes} onChange={e => setSponsorForm({...sponsorForm, notes: e.target.value})} className="border rounded-lg px-3 py-2 text-sm" rows={2} />
          <button onClick={() => addSponsor.mutate()} className="bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">Add Sponsor</button>
        </div>
      </Modal>
    </div>
  );
};
export default AdminFinance;
'@ | Set-Content "$src\pages\admin\Finance.jsx" -Encoding UTF8

@'
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../../utils/api";
import Navbar from "../../components/common/Navbar";
import Spinner from "../../components/common/Spinner";

const AdminLogistics = () => {
  const queryClient = useQueryClient();
  const { data: events } = useQuery({
    queryKey: ["admin-events"],
    queryFn: () => api.get("/events/admin/mine").then(r => r.data.data.events),
  });
  const [selectedEvent, setSelectedEvent] = useState("");
  const [newItem, setNewItem] = useState("");

  const { data: logistics, isLoading } = useQuery({
    queryKey: ["logistics", selectedEvent],
    queryFn: () => api.get(`/logistics/${selectedEvent}`).then(r => r.data.data.logistics),
    enabled: !!selectedEvent,
  });

  const update = useMutation({
    mutationFn: (data) => api.put(`/logistics/${selectedEvent}`, data),
    onSuccess: () => queryClient.invalidateQueries(["logistics", selectedEvent]),
  });

  const toggleItem = (idx) => {
    const updated = logistics.checklist.map((c, i) => i === idx ? { ...c, done: !c.done } : c);
    update.mutate({ checklist: updated, venue: logistics.venue, notes: logistics.notes });
  };

  const addItem = () => {
    if (!newItem.trim()) return;
    const updated = [...(logistics?.checklist || []), { item: newItem, done: false }];
    update.mutate({ checklist: updated, venue: logistics?.venue, notes: logistics?.notes });
    setNewItem("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Logistics</h1>
        <select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm mb-6">
          <option value="">Select an event</option>
          {events?.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
        </select>
        {selectedEvent && (isLoading ? <Spinner /> : logistics ? (
          <div className="bg-white rounded-xl shadow p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
              <input value={logistics.venue || ""} onChange={e => update.mutate({ ...logistics, venue: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Venue details" />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea value={logistics.notes || ""} onChange={e => update.mutate({ ...logistics, notes: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" rows={2} placeholder="Any notes..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Checklist</label>
              <div className="flex gap-2 mb-3">
                <input value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="Add item..."
                  className="flex-1 border rounded-lg px-3 py-2 text-sm" onKeyDown={e => e.key === "Enter" && addItem()} />
                <button onClick={addItem} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">Add</button>
              </div>
              {logistics.checklist?.map((c, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5 border-b last:border-0">
                  <input type="checkbox" checked={c.done} onChange={() => toggleItem(i)} className="cursor-pointer" />
                  <span className={`text-sm ${c.done ? "line-through text-gray-400" : "text-gray-700"}`}>{c.item}</span>
                </div>
              ))}
            </div>
          </div>
        ) : <p className="text-gray-400">No logistics record found.</p>)}
      </div>
    </div>
  );
};
export default AdminLogistics;
'@ | Set-Content "$src\pages\admin\Logistics.jsx" -Encoding UTF8

@'
import { useState } from "react";
import toast from "react-hot-toast";
import api from "../../utils/api";
import Navbar from "../../components/common/Navbar";
import Badge from "../../components/common/Badge";
import { formatDate } from "../../utils/helpers";

const AdminScanner = () => {
  const [regId, setRegId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const verify = async () => {
    if (!regId.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post("/registrations/verify", { registrationId: regId.trim() });
      setResult({ success: true, data: res.data.data.registration });
      toast.success("Check-in successful!");
    } catch (err) {
      setResult({ success: false, message: err.response?.data?.message || "Invalid QR" });
      toast.error(err.response?.data?.message || "Invalid QR");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">QR Scanner / Entry Verify</h1>
        <p className="text-gray-500 text-sm mb-6">Enter the Registration ID from the student QR ticket</p>
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex gap-2 mb-4">
            <input value={regId} onChange={e => setRegId(e.target.value)} placeholder="e.g. CF-A1B2C3D4"
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              onKeyDown={e => e.key === "Enter" && verify()} />
            <button onClick={verify} disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50">
              {loading ? "Checking..." : "Verify"}
            </button>
          </div>
          {result && (
            <div className={`rounded-lg p-4 ${result.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
              {result.success ? (
                <div className="flex flex-col gap-1 text-sm">
                  <p className="font-semibold text-green-700">Check-in Successful</p>
                  <p className="text-gray-700">Student: <strong>{result.data.student?.name}</strong></p>
                  <p className="text-gray-700">Event: <strong>{result.data.event?.title}</strong></p>
                  <p className="text-gray-700">Date: {formatDate(result.data.event?.date)}</p>
                  <p className="text-gray-700">Venue: {result.data.event?.venue}</p>
                </div>
              ) : (
                <p className="text-red-600 text-sm font-medium">{result.message}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default AdminScanner;
'@ | Set-Content "$src\pages\admin\Scanner.jsx" -Encoding UTF8

# ─── SUPER ADMIN PAGES ───────────────────────────────────────────

@'
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import Navbar from "../../components/common/Navbar";
import Spinner from "../../components/common/Spinner";

const SuperDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["super-dashboard"],
    queryFn: () => api.get("/superadmin/dashboard").then(r => r.data.data),
    refetchInterval: 5000,
  });

  const stats = [
    ["Total Events", data?.totalEvents, "indigo"],
    ["Total Registrations", data?.totalRegistrations, "blue"],
    ["Active Admins", data?.totalAdmins, "green"],
    ["Pending Admins", data?.pendingAdmins, "yellow"],
    ["Pending Events", data?.pendingEvents, "orange"],
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Super Admin Dashboard</h1>
        {isLoading ? <Spinner /> : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {stats.map(([label, val, color]) => (
                <div key={label} className="bg-white rounded-xl shadow p-4 text-center">
                  <p className={`text-2xl font-bold text-${color}-600`}>{val ?? 0}</p>
                  <p className="text-gray-500 text-xs mt-1">{label}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[["Manage Committees", "/superadmin/committees"], ["Approve Admins", "/superadmin/admins"], ["Approve Events", "/superadmin/events"], ["All Admins", "/superadmin/admins"]].map(([label, path]) => (
                <Link key={label} to={path} className="bg-white rounded-xl shadow p-5 text-center font-medium text-indigo-600 hover:shadow-md transition">{label}</Link>
              ))}
            </div>
            {data?.committees?.length > 0 && (
              <div className="bg-white rounded-xl shadow p-5">
                <h2 className="font-semibold text-gray-700 mb-3">Committees</h2>
                {data.committees.map(c => (
                  <div key={c._id} className="flex justify-between items-center py-2 border-b last:border-0 text-sm">
                    <span className="font-medium">{c.name}</span>
                    <span className="text-gray-500">{c.admins?.length} admin(s)</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default SuperDashboard;
'@ | Set-Content "$src\pages\superadmin\Dashboard.jsx" -Encoding UTF8

@'
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../../utils/api";
import Navbar from "../../components/common/Navbar";
import Spinner from "../../components/common/Spinner";
import Modal from "../../components/common/Modal";

const SuperCommittees = () => {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  const { data: committees, isLoading } = useQuery({
    queryKey: ["committees"],
    queryFn: () => api.get("/superadmin/committees").then(r => r.data.data.committees),
  });

  const add = useMutation({
    mutationFn: () => api.post("/superadmin/committees", form),
    onSuccess: () => { toast.success("Committee created"); queryClient.invalidateQueries(["committees"]); setShowAdd(false); setForm({ name: "", description: "" }); },
    onError: (err) => toast.error(err.response?.data?.message || "Failed"),
  });

  const remove = useMutation({
    mutationFn: (id) => api.delete(`/superadmin/committees/${id}`),
    onSuccess: () => { toast.success("Deleted"); queryClient.invalidateQueries(["committees"]); },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Committees</h1>
          <button onClick={() => setShowAdd(true)} className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700">+ New Committee</button>
        </div>
        {isLoading ? <Spinner /> : (
          <div className="flex flex-col gap-4">
            {committees?.length === 0 && <p className="text-gray-400">No committees yet.</p>}
            {committees?.map(c => (
              <div key={c._id} className="bg-white rounded-xl shadow p-5 flex justify-between items-start">
                <div>
                  <h2 className="font-semibold text-gray-800">{c.name}</h2>
                  {c.description && <p className="text-sm text-gray-500 mt-0.5">{c.description}</p>}
                  <p className="text-xs text-gray-400 mt-2">{c.admins?.length || 0} admin(s): {c.admins?.map(a => a.name).join(", ") || "None"}</p>
                </div>
                <button onClick={() => remove.mutate(c._id)} className="text-xs text-red-400 hover:underline">Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="New Committee">
        <div className="flex flex-col gap-3">
          <input placeholder="Committee Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="border rounded-lg px-3 py-2 text-sm" />
          <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="border rounded-lg px-3 py-2 text-sm" rows={2} />
          <button onClick={() => add.mutate()} className="bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">Create</button>
        </div>
      </Modal>
    </div>
  );
};
export default SuperCommittees;
'@ | Set-Content "$src\pages\superadmin\Committees.jsx" -Encoding UTF8

@'
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../../utils/api";
import Navbar from "../../components/common/Navbar";
import Spinner from "../../components/common/Spinner";
import Modal from "../../components/common/Modal";
import Badge from "../../components/common/Badge";

const SuperAdmins = () => {
  const queryClient = useQueryClient();
  const [approveModal, setApproveModal] = useState(null);
  const [selectedCommittees, setSelectedCommittees] = useState([]);

  const { data: pending, isLoading: loadingPending } = useQuery({
    queryKey: ["pending-admins"],
    queryFn: () => api.get("/superadmin/admins/pending").then(r => r.data.data.admins),
  });

  const { data: allAdmins, isLoading: loadingAll } = useQuery({
    queryKey: ["all-admins"],
    queryFn: () => api.get("/superadmin/admins").then(r => r.data.data.admins),
  });

  const { data: committees } = useQuery({
    queryKey: ["committees"],
    queryFn: () => api.get("/superadmin/committees").then(r => r.data.data.committees),
  });

  const approve = useMutation({
    mutationFn: () => api.patch(`/superadmin/admins/${approveModal._id}/approve`, { committeeIds: selectedCommittees }),
    onSuccess: () => { toast.success("Admin approved"); queryClient.invalidateQueries(["pending-admins"]); queryClient.invalidateQueries(["all-admins"]); setApproveModal(null); setSelectedCommittees([]); },
    onError: (err) => toast.error(err.response?.data?.message || "Failed"),
  });

  const reject = useMutation({
    mutationFn: (id) => api.delete(`/superadmin/admins/${id}/reject`),
    onSuccess: () => { toast.success("Rejected"); queryClient.invalidateQueries(["pending-admins"]); },
  });

  const deactivate = useMutation({
    mutationFn: (id) => api.patch(`/superadmin/admins/${id}/deactivate`),
    onSuccess: () => { toast.success("Deactivated"); queryClient.invalidateQueries(["all-admins"]); },
  });

  const toggleCommittee = (id) => setSelectedCommittees(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Management</h1>
        {pending?.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Pending Approvals ({pending.length})</h2>
            {loadingPending ? <Spinner /> : (
              <div className="flex flex-col gap-3">
                {pending.map(a => (
                  <div key={a._id} className="bg-white rounded-xl shadow p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">{a.name}</p>
                      <p className="text-sm text-gray-500">{a.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setApproveModal(a); setSelectedCommittees([]); }} className="text-sm bg-green-50 text-green-600 px-3 py-1 rounded hover:bg-green-100">Approve</button>
                      <button onClick={() => reject.mutate(a._id)} className="text-sm bg-red-50 text-red-500 px-3 py-1 rounded hover:bg-red-100">Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <h2 className="text-lg font-semibold text-gray-700 mb-3">All Approved Admins</h2>
        {loadingAll ? <Spinner /> : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-left"><tr>
                <th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Committees</th><th className="px-4 py-3">Actions</th>
              </tr></thead>
              <tbody>
                {allAdmins?.filter(a => a.isApproved).map(a => (
                  <tr key={a._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{a.name}</td>
                    <td className="px-4 py-3 text-gray-500">{a.email}</td>
                    <td className="px-4 py-3">{a.committees?.map(c => c.name).join(", ") || "—"}</td>
                    <td className="px-4 py-3"><button onClick={() => deactivate.mutate(a._id)} className="text-xs text-orange-500 hover:underline">Deactivate</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Modal open={!!approveModal} onClose={() => setApproveModal(null)} title={`Approve: ${approveModal?.name}`}>
        <p className="text-sm text-gray-500 mb-3">Assign committees to this admin:</p>
        <div className="flex flex-col gap-2 mb-4">
          {committees?.map(c => (
            <label key={c._id} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={selectedCommittees.includes(c._id)} onChange={() => toggleCommittee(c._id)} />
              {c.name}
            </label>
          ))}
        </div>
        <button onClick={() => approve.mutate()} className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">Approve & Assign</button>
      </Modal>
    </div>
  );
};
export default SuperAdmins;
'@ | Set-Content "$src\pages\superadmin\Admins.jsx" -Encoding UTF8

@'
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import api from "../../utils/api";
import Navbar from "../../components/common/Navbar";
import Spinner from "../../components/common/Spinner";
import Modal from "../../components/common/Modal";
import Badge from "../../components/common/Badge";
import { formatDate, getStatusColor } from "../../utils/helpers";

const SuperEvents = () => {
  const queryClient = useQueryClient();
  const [rejectModal, setRejectModal] = useState(null);
  const [note, setNote] = useState("");

  const { data: events, isLoading } = useQuery({
    queryKey: ["pending-events"],
    queryFn: () => api.get("/superadmin/events/pending").then(r => r.data.data.events),
  });

  const approve = useMutation({
    mutationFn: (id) => api.patch(`/superadmin/events/${id}/approve`),
    onSuccess: () => { toast.success("Event approved"); queryClient.invalidateQueries(["pending-events"]); },
  });

  const reject = useMutation({
    mutationFn: () => api.patch(`/superadmin/events/${rejectModal._id}/reject`, { note }),
    onSuccess: () => { toast.success("Event rejected"); queryClient.invalidateQueries(["pending-events"]); setRejectModal(null); setNote(""); },
  });

  const unpublish = useMutation({
    mutationFn: (id) => api.patch(`/superadmin/events/${id}/unpublish`),
    onSuccess: () => { toast.success("Unpublished"); queryClient.invalidateQueries(["pending-events"]); },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Event Approvals</h1>
        {isLoading ? <Spinner /> : events?.length === 0 ? <p className="text-gray-400">No pending events.</p> : (
          <div className="flex flex-col gap-4">
            {events?.map(e => (
              <div key={e._id} className="bg-white rounded-xl shadow p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h2 className="font-semibold text-gray-800">{e.title}</h2>
                    <p className="text-sm text-gray-500">{e.committee?.name} - {formatDate(e.date)} - {e.venue}</p>
                    <p className="text-xs text-gray-400">By: {e.createdBy?.name} ({e.createdBy?.email})</p>
                  </div>
                  <Badge text={e.status} color={getStatusColor(e.status)} />
                </div>
                <p className="text-sm text-gray-600 mb-3">{e.description}</p>
                <div className="flex gap-2">
                  <button onClick={() => approve.mutate(e._id)} className="text-sm bg-green-50 text-green-600 px-3 py-1 rounded hover:bg-green-100">Approve</button>
                  <button onClick={() => { setRejectModal(e); setNote(""); }} className="text-sm bg-red-50 text-red-500 px-3 py-1 rounded hover:bg-red-100">Reject</button>
                  <button onClick={() => unpublish.mutate(e._id)} className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded hover:bg-gray-200">Unpublish</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Modal open={!!rejectModal} onClose={() => setRejectModal(null)} title={`Reject: ${rejectModal?.title}`}>
        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Reason for rejection..." rows={3} className="w-full border rounded-lg px-3 py-2 text-sm mb-4" />
        <button onClick={() => reject.mutate()} className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700">Confirm Reject</button>
      </Modal>
    </div>
  );
};
export default SuperEvents;
'@ | Set-Content "$src\pages\superadmin\Events.jsx" -Encoding UTF8

Write-Host "Step 8 complete - all pages created."