import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { api } from './api';
import type {
  FestEvent, Registration, Volunteer, VolunteerAssignment,
  Sponsor, LogisticsRecord, FinanceRecord, Committee, AdminUser, StudentUser, SponsorStatus
} from './mock-data';

interface FestCtx {
  events: FestEvent[]; registrations: Registration[]; volunteers: Volunteer[];
  assignments: VolunteerAssignment[]; sponsors: Sponsor[]; logistics: LogisticsRecord[];
  finances: FinanceRecord[]; committees: Committee[]; admins: AdminUser[]; students: StudentUser[];
  loading: boolean;
  refreshEvents: () => Promise<void>;
  refreshRegistrations: () => Promise<void>;
  refreshVolunteers: () => Promise<void>;
  refreshSponsors: () => Promise<void>;
  refreshLogistics: () => Promise<void>;
  refreshCommittees: () => Promise<void>;
  refreshAdmins: () => Promise<void>;
  createEvent: (e: Omit<FestEvent, 'id'>) => Promise<void>;
  updateEvent: (id: string, u: Partial<FestEvent>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  approveEvent: (id: string) => Promise<void>;
  rejectEvent: (id: string, note: string) => Promise<void>;
  submitEventForApproval: (id: string) => Promise<void>;
  registerForEvent: (eventId: string, s: { id: string; name: string; email: string }) => Promise<void>;
  cancelRegistration: (id: string) => Promise<void>;
  markRegistrationAttended: (id: string) => Promise<void>;
  addVolunteer: (v: Omit<Volunteer, 'id'>) => Promise<void>;
  assignVolunteer: (vid: string, eid: string, role: string) => Promise<void>;
  toggleVolunteerAttendance: (aid: string) => Promise<void>;
  addSponsor: (s: Omit<Sponsor, 'id'>) => Promise<void>;
  updateSponsorStatus: (id: string, st: SponsorStatus) => Promise<void>;
  toggleSponsorChecklist: (sid: string, iid: string) => Promise<void>;
  addSponsorChecklistItem: (sid: string, task: string) => Promise<void>;  // NEW
  deleteSponsor: (id: string) => Promise<void>;
  createLogistics: (eid: string, venue: string) => Promise<void>;
  updateLogisticsField: (eid: string, field: 'venue' | 'notes', val: string) => Promise<void>;
  toggleLogisticsItem: (eid: string, iid: string) => Promise<void>;
  addLogisticsItem: (eid: string, task: string) => Promise<void>;
  removeLogisticsItem: (eid: string, iid: string) => Promise<void>;
  createCommittee: (name: string, desc: string) => Promise<void>;
  deleteCommittee: (id: string) => Promise<void>;
  assignAdminToCommittee: (aid: string, cid: string) => Promise<void>;
  removeAdminFromCommittee: (aid: string, cid: string) => Promise<void>;
  approveAdmin: (id: string) => Promise<void>;
  rejectAdmin: (id: string) => Promise<void>;
  deactivateAdmin: (id: string) => Promise<void>;
}

const Ctx = createContext<FestCtx | null>(null);
let counter = 100;
const uid = () => `gen-${counter++}`;

// ── Normalizers ───────────────────────────────────────────────────────────────

function normalizeEvent(e: Record<string, unknown>): FestEvent {
  return {
    id: (e._id as string) || (e.id as string),
    title: e.title as string,
    description: e.description as string,
    category: e.category as FestEvent['category'],
    committee: (e.committee as Record<string, unknown>)?.name as string || e.committee as string || '',
    date: (e.date as string)?.slice(0, 10) || '',
    time: e.time as string || '',
    venue: e.venue as string || '',
    capacity: e.capacity as number || 0,
    registeredCount: e.registeredCount as number || 0,
    entryFee: e.entryFee as number || 0,
    status: e.status as FestEvent['status'],
    rejectionNote: e.rejectionNote as string | undefined,
    isPast: new Date(e.date as string) < new Date(),
    createdBy: (e.createdBy as Record<string, unknown>)?._id as string || e.createdBy as string || '',
  };
}

function normalizeReg(r: Record<string, unknown>): Registration {
  const event = r.event as Record<string, unknown> | null;
  const student = r.student as Record<string, unknown> | null;
  return {
    id: (r._id as string) || (r.id as string),
    eventId: (event?._id as string) || (r.eventId as string) || '',
    studentId: (student?._id as string) || (r.studentId as string) || '',
    studentName: (student?.name as string) || (r.studentName as string) || '',
    studentEmail: (student?.email as string) || (r.studentEmail as string) || '',
    status: r.status as Registration['status'],
    registeredAt: r.createdAt as string || r.registeredAt as string || new Date().toISOString(),
  };
}

function normalizeVolunteer(v: Record<string, unknown>): Volunteer {
  const committee = v.committee as Record<string, unknown> | null;
  return {
    id: (v._id as string) || (v.id as string),
    name: v.name as string,
    email: v.email as string,
    phone: v.phone as string || '',
    committee: (committee?.name as string) || (v.committee as string) || '',
  };
}

function normalizeAssignment(a: Record<string, unknown>, volunteerId: string): VolunteerAssignment {
  const event = a.event as Record<string, unknown> | null;
  return {
    id: (a._id as string) || (a.id as string) || uid(),
    volunteerId,
    eventId: (event?._id as string) || (a.eventId as string) || (a.event as string) || '',
    role: a.role as string || '',
    attended: a.attended as boolean || false,
  };
}

function normalizeSponsor(s: Record<string, unknown>): Sponsor {
  const committee = s.committee as Record<string, unknown> | null;
  const checklist = (s.actionChecklist as Record<string, unknown>[]) || [];
  return {
    id: (s._id as string) || (s.id as string),
    name: s.name as string,
    dealAmount: s.dealAmount as number || 0,
    dealType: s.dealType as 'cash' | 'in-kind',
    status: s.status as SponsorStatus,
    committee: (committee?.name as string) || (s.committee as string) || '',
    notes: s.notes as string | undefined,
    checklist: checklist.map((c, i) => ({
      id: (c._id as string) || `sc-${i}`,
      task: c.task as string,
      done: c.done as boolean || false,
    })),
  };
}

function normalizeLogistics(l: Record<string, unknown>): LogisticsRecord {
  const event = l.event as Record<string, unknown> | null;
  const checklist = (l.checklist as Record<string, unknown>[]) || [];
  return {
    id: (l._id as string) || (l.id as string),
    // FIX: event may be an ObjectId string OR a populated object
    eventId: (event?._id as string) || (l.event as string) || (l.eventId as string) || '',
    venue: l.venue as string || '',
    notes: l.notes as string || '',
    checklist: checklist.map((c, i) => ({
      id: (c._id as string) || `lc-${i}`,
      // FIX: backend stores as "item", frontend uses "task"
      task: (c.item as string) || (c.task as string) || '',
      done: c.done as boolean || false,
    })),
  };
}

function normalizeCommittee(c: Record<string, unknown>): Committee {
  const admins = (c.admins as Record<string, unknown>[]) || [];
  return {
    id: (c._id as string) || (c.id as string),
    name: c.name as string,
    description: c.description as string || '',
    adminIds: admins.map(a => ((a as unknown as { _id: string })._id) || (a as unknown as string)),
  };
}

function normalizeAdmin(a: Record<string, unknown>): AdminUser {
  return {
    id: (a._id as string) || (a.id as string),
    name: a.name as string,
    email: a.email as string,
    status: a.isApproved ? 'approved' : 'pending',
    college: a.college as string | undefined,
    joinedAt: (a.createdAt as string)?.slice(0, 10) || '',
  };
}

function getCurrentUser() {
  try {
    const s = localStorage.getItem('collegefest_user');
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

// ── Helper: get the committee ObjectId from the stored user ───────────────────
// The login response may or may not populate committees.
// If populated: committees = [{_id, name}] → use ._id
// If not populated: committees = ["507f1f77bcf86cd799439011"] → use directly
function getCommitteeId(user: Record<string, unknown> | null): string {
  if (!user) return '';
  const comms = user.committees as Array<string | Record<string, unknown>> | undefined;
  if (!comms || comms.length === 0) return '';
  const first = comms[0];
  if (typeof first === 'string') return first;                          // raw ObjectId
  if (typeof first === 'object' && first !== null) {
    return (first._id as string) || (first.id as string) || '';        // populated object
  }
  return '';
}

export function FestProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<FestEvent[]>([]);
  const [registrations, setRegs] = useState<Registration[]>([]);
  const [volunteers, setVols] = useState<Volunteer[]>([]);
  const [assignments, setAsgn] = useState<VolunteerAssignment[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [logistics, setLog] = useState<LogisticsRecord[]>([]);
  const [finances] = useState<FinanceRecord[]>([]);
  const [committees, setComm] = useState<Committee[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [students] = useState<StudentUser[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Refresh functions ─────────────────────────────────────────────────────

  const refreshEvents = useCallback(async () => {
    try {
      const user = getCurrentUser();
      if (user?.role === 'admin') {
        const data = await api.get('/events/admin/mine');
        setEvents((data.data?.events || []).map(normalizeEvent));
      } else if (user?.role === 'superadmin') {
        const [approved, pending] = await Promise.all([
          api.get('/events'),
          api.get('/superadmin/events/pending'),
        ]);
        const raw = [
          ...(approved.data?.events || []),
          ...(pending.data?.events || []),
        ];
        setEvents(raw.map(normalizeEvent));
      } else {
        const data = await api.get('/events');
        setEvents((data.data?.events || []).map(normalizeEvent));
      }
    } catch {}
  }, []);

  const refreshRegistrations = useCallback(async () => {
    try {
      const data = await api.get('/registrations/my');
      const raw = data.data?.registrations || [];
      setRegs(raw.map(normalizeReg));
    } catch {}
  }, []);

  const refreshVolunteers = useCallback(async () => {
    try {
      const data = await api.get('/volunteers');
      const raw: Record<string, unknown>[] = data.data?.volunteers || [];
      const vols = raw.map(normalizeVolunteer);
      const asgns: VolunteerAssignment[] = [];
      raw.forEach(v => {
        const va = v.assignments as Record<string, unknown>[] || [];
        va.forEach(a => asgns.push(normalizeAssignment(a, (v._id as string) || (v.id as string))));
      });
      setVols(vols);
      setAsgn(asgns);
    } catch {}
  }, []);

  const refreshSponsors = useCallback(async () => {
    try {
      const data = await api.get('/finance/sponsors');
      const raw = data.data?.sponsors || [];
      setSponsors(raw.map(normalizeSponsor));
    } catch {}
  }, []);

  // FIX: refreshLogistics was an empty no-op — now actually fetches data.
  // The backend GET /logistics/:eventId requires an eventId, so we fetch
  // logistics for each of the admin's approved events.
  const refreshLogistics = useCallback(async () => {
    try {
      const user = getCurrentUser();
      if (user?.role === 'admin') {
        // Get admin's events first, then fetch logistics for each approved one
        const evData = await api.get('/events/admin/mine');
        const myEvents: Record<string, unknown>[] = evData.data?.events || [];
        const approvedIds = myEvents
          .filter((e) => e.status === 'approved')
          .map((e) => (e._id as string) || (e.id as string));

        const results = await Promise.allSettled(
          approvedIds.map((eid) => api.get(`/logistics/${eid}`))
        );

        const logs: LogisticsRecord[] = [];
        results.forEach((r) => {
          if (r.status === 'fulfilled') {
            const l = r.value.data?.logistics;
            if (l) logs.push(normalizeLogistics(l));
          }
        });
        setLog(logs);
      }
    } catch {}
  }, []);

  const refreshCommittees = useCallback(async () => {
    try {
      const data = await api.get('/superadmin/committees');
      const raw = data.data?.committees || [];
      setComm(raw.map(normalizeCommittee));
    } catch {}
  }, []);

  const refreshAdmins = useCallback(async () => {
    try {
      const data = await api.get('/superadmin/admins');
      const raw = data.data?.admins || [];
      setAdmins(raw.map(normalizeAdmin));
    } catch {}
  }, []);

  // ── Load on mount ─────────────────────────────────────────────────────────

  useEffect(() => {
    const token = localStorage.getItem('collegefest_token');
    const user = getCurrentUser();
    if (!token || !user) { setLoading(false); return; }

    const load = async () => {
      setLoading(true);
      try {
        if (user.role === 'student') {
          await Promise.all([refreshEvents(), refreshRegistrations()]);
        } else if (user.role === 'admin') {
          await Promise.all([refreshEvents(), refreshVolunteers(), refreshSponsors(), refreshLogistics()]);
        } else if (user.role === 'superadmin') {
          await Promise.all([refreshEvents(), refreshCommittees(), refreshAdmins()]);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Events ────────────────────────────────────────────────────────────────

  const createEvent = useCallback(async (e: Omit<FestEvent, 'id'>) => {
    try {
      const user = getCurrentUser();
      // FIX: always resolve committeeId properly regardless of whether
      // login populated committees or returned raw ObjectIds
      const committeeId = getCommitteeId(user) || e.committee;

      const payload = {
        title: e.title, description: e.description, category: e.category,
        committee: committeeId,   // always an ObjectId string
        date: e.date, time: e.time, venue: e.venue,
        capacity: e.capacity, teamSize: 1, entryFee: e.entryFee,
      };
      const data = await api.post('/events', payload);
      const newEvent = normalizeEvent(data.data?.event || data.data);
      setEvents(p => [...p, newEvent]);
    } catch (err) { throw err; }
  }, []);

  const updateEvent = useCallback(async (id: string, u: Partial<FestEvent>) => {
    try {
      await api.put(`/events/${id}`, u);
      setEvents(p => p.map(e => e.id === id ? { ...e, ...u } : e));
    } catch (err) { throw err; }
  }, []);

  const deleteEvent = useCallback(async (id: string) => {
    try { await api.delete(`/events/${id}`); } catch {}
    setEvents(p => p.filter(e => e.id !== id));
  }, []);

  const approveEvent = useCallback(async (id: string) => {
    try { await api.patch(`/superadmin/events/${id}/approve`); } catch {}
    setEvents(p => p.map(e => e.id === id ? { ...e, status: 'approved' as const, rejectionNote: undefined } : e));
  }, []);

  const rejectEvent = useCallback(async (id: string, note: string) => {
    try { await api.patch(`/superadmin/events/${id}/reject`, { note }); } catch {}
    setEvents(p => p.map(e => e.id === id ? { ...e, status: 'rejected' as const, rejectionNote: note } : e));
  }, []);

  const submitEventForApproval = useCallback(async (id: string) => {
    try { await api.post(`/events/${id}/submit`); } catch {}
    setEvents(p => p.map(e => e.id === id ? { ...e, status: 'pending' as const } : e));
  }, []);

  // ── Registrations ─────────────────────────────────────────────────────────

  const registerForEvent = useCallback(async (eventId: string, s: { id: string; name: string; email: string }) => {
    try {
      const data = await api.post('/registrations', { eventId });
      const reg = normalizeReg(data.data?.registration || data.data);
      setRegs(p => [...p, reg]);
      setEvents(p => p.map(e => e.id === eventId ? { ...e, registeredCount: e.registeredCount + 1 } : e));
    } catch (err) { throw err; }
  }, []);

  const cancelRegistration = useCallback(async (id: string) => {
    let eid = '';
    try { await api.delete(`/registrations/${id}`); } catch {}
    setRegs(p => p.map(r => {
      if (r.id === id) { eid = r.eventId; return { ...r, status: 'cancelled' as const }; }
      return r;
    }));
    if (eid) setEvents(p => p.map(e => e.id === eid ? { ...e, registeredCount: Math.max(0, e.registeredCount - 1) } : e));
  }, []);

  const markRegistrationAttended = useCallback(async (id: string) => {
    try { await api.patch(`/registrations/${id}/checkin`); } catch {}
    setRegs(p => p.map(r => r.id === id ? { ...r, status: 'attended' as const } : r));
  }, []);

  // ── Volunteers ────────────────────────────────────────────────────────────

  const addVolunteer = useCallback(async (v: Omit<Volunteer, 'id'>) => {
    try {
      const data = await api.post('/volunteers', { name: v.name, email: v.email, phone: v.phone });
      const vol = normalizeVolunteer(data.data?.volunteer || data.data);
      setVols(p => [...p, vol]);
    } catch (err) { throw err; }
  }, []);

  const assignVolunteer = useCallback(async (vid: string, eid: string, role: string) => {
    try { await api.post(`/volunteers/${vid}/assign`, { event: eid, role }); } catch {}
    setAsgn(p => [...p, { id: uid(), volunteerId: vid, eventId: eid, role, attended: false }]);
  }, []);

  const toggleVolunteerAttendance = useCallback(async (aid: string) => {
    const a = assignments.find(x => x.id === aid);
    try { await api.patch(`/volunteers/${a?.volunteerId}/attendance`, { assignmentId: aid, attended: !a?.attended }); } catch {}
    setAsgn(p => p.map(x => x.id === aid ? { ...x, attended: !x.attended } : x));
  }, [assignments]);

  // ── Sponsors ──────────────────────────────────────────────────────────────

  const addSponsor = useCallback(async (s: Omit<Sponsor, 'id'>) => {
    try {
      const payload = {
        name: s.name, dealAmount: s.dealAmount, dealType: s.dealType,
        status: s.status, notes: s.notes,
        actionChecklist: s.checklist.map(c => ({ task: c.task, done: c.done })),
      };
      const data = await api.post('/finance/sponsors', payload);
      const sp = normalizeSponsor(data.data?.sponsor || data.data);
      setSponsors(p => [...p, sp]);
    } catch (err) { throw err; }
  }, []);

  const updateSponsorStatus = useCallback(async (id: string, st: SponsorStatus) => {
    try { await api.put(`/finance/sponsors/${id}`, { status: st }); } catch {}
    setSponsors(p => p.map(s => s.id === id ? { ...s, status: st } : s));
  }, []);

  const toggleSponsorChecklist = useCallback(async (sid: string, iid: string) => {
    const sponsor = sponsors.find(s => s.id === sid);
    const updated = sponsor?.checklist.map(c => c.id === iid ? { ...c, done: !c.done } : c) || [];
    try {
      await api.put(`/finance/sponsors/${sid}`, {
        actionChecklist: updated.map(c => ({ task: c.task, done: c.done })),
      });
    } catch {}
    setSponsors(p => p.map(s => s.id === sid ? { ...s, checklist: updated } : s));
  }, [sponsors]);

  // FIX: New function to add a checklist item to an existing sponsor
  const addSponsorChecklistItem = useCallback(async (sid: string, task: string) => {
    const sponsor = sponsors.find(s => s.id === sid);
    const newItem = { id: uid(), task, done: false };
    const updated = [...(sponsor?.checklist || []), newItem];
    try {
      await api.put(`/finance/sponsors/${sid}`, {
        actionChecklist: updated.map(c => ({ task: c.task, done: c.done })),
      });
    } catch {}
    setSponsors(p => p.map(s => s.id === sid ? { ...s, checklist: updated } : s));
  }, [sponsors]);

  const deleteSponsor = useCallback(async (id: string) => {
    try { await api.delete(`/finance/sponsors/${id}`); } catch {}
    setSponsors(p => p.filter(s => s.id !== id));
  }, []);

  // ── Logistics ─────────────────────────────────────────────────────────────

  const createLogistics = useCallback(async (eid: string, venue: string) => {
    try {
      const data = await api.put(`/logistics/${eid}`, { venue, notes: '', checklist: [] });
      const l = data.data?.logistics;
      if (l) {
        setLog(p => [...p.filter(x => x.eventId !== eid), normalizeLogistics(l)]);
      } else {
        setLog(p => [...p, { id: uid(), eventId: eid, venue, notes: '', checklist: [] }]);
      }
    } catch {
      setLog(p => [...p, { id: uid(), eventId: eid, venue, notes: '', checklist: [] }]);
    }
  }, []);

  const updateLogisticsField = useCallback(async (eid: string, field: 'venue' | 'notes', val: string) => {
    const current = logistics.find(l => l.eventId === eid);
    try {
      await api.put(`/logistics/${eid}`, {
        venue: field === 'venue' ? val : current?.venue,
        notes: field === 'notes' ? val : current?.notes,
        checklist: current?.checklist.map(c => ({ item: c.task, done: c.done })) || [],
      });
    } catch {}
    setLog(p => p.map(l => l.eventId === eid ? { ...l, [field]: val } : l));
  }, [logistics]);

  const toggleLogisticsItem = useCallback(async (eid: string, iid: string) => {
    const log = logistics.find(l => l.eventId === eid);
    const updated = log?.checklist.map(c => c.id === iid ? { ...c, done: !c.done } : c) || [];
    try {
      await api.put(`/logistics/${eid}`, {
        venue: log?.venue, notes: log?.notes,
        checklist: updated.map(c => ({ item: c.task, done: c.done })),
      });
    } catch {}
    setLog(p => p.map(l => l.eventId === eid ? { ...l, checklist: updated } : l));
  }, [logistics]);

  const addLogisticsItem = useCallback(async (eid: string, task: string) => {
    const log = logistics.find(l => l.eventId === eid);
    const newItem = { id: uid(), task, done: false };
    const updated = [...(log?.checklist || []), newItem];
    try {
      await api.put(`/logistics/${eid}`, {
        venue: log?.venue, notes: log?.notes,
        checklist: updated.map(c => ({ item: c.task, done: c.done })),
      });
    } catch {}
    setLog(p => p.map(l => l.eventId === eid ? { ...l, checklist: updated } : l));
  }, [logistics]);

  const removeLogisticsItem = useCallback(async (eid: string, iid: string) => {
    const log = logistics.find(l => l.eventId === eid);
    const updated = log?.checklist.filter(c => c.id !== iid) || [];
    try {
      await api.put(`/logistics/${eid}`, {
        venue: log?.venue, notes: log?.notes,
        checklist: updated.map(c => ({ item: c.task, done: c.done })),
      });
    } catch {}
    setLog(p => p.map(l => l.eventId === eid ? { ...l, checklist: updated } : l));
  }, [logistics]);

  // ── Committees ────────────────────────────────────────────────────────────

  const createCommittee = useCallback(async (name: string, desc: string) => {
    try {
      const data = await api.post('/superadmin/committees', { name, description: desc });
      const c = normalizeCommittee(data.data?.committee || data.data);
      setComm(p => [...p, c]);
    } catch (err) { throw err; }
  }, []);

  const deleteCommittee = useCallback(async (id: string) => {
    try { await api.delete(`/superadmin/committees/${id}`); } catch {}
    setComm(p => p.filter(c => c.id !== id));
  }, []);

  const assignAdminToCommittee = useCallback(async (aid: string, cid: string) => {
    const currentCommittees = committees.filter(c => c.adminIds.includes(aid)).map(c => c.id);
    try {
      await api.patch(`/superadmin/admins/${aid}/committees`, { committeeIds: [...currentCommittees, cid] });
    } catch {}
    setComm(p => p.map(c => c.id === cid ? { ...c, adminIds: [...c.adminIds, aid] } : c));
  }, [committees]);

  const removeAdminFromCommittee = useCallback(async (aid: string, cid: string) => {
    const currentCommittees = committees.filter(c => c.adminIds.includes(aid) && c.id !== cid).map(c => c.id);
    try {
      await api.patch(`/superadmin/admins/${aid}/committees`, { committeeIds: currentCommittees });
    } catch {}
    setComm(p => p.map(c => c.id === cid ? { ...c, adminIds: c.adminIds.filter(i => i !== aid) } : c));
  }, [committees]);

  // ── Admins ────────────────────────────────────────────────────────────────

  const approveAdmin = useCallback(async (id: string) => {
    try {
      await api.patch(`/superadmin/admins/${id}/approve`, { committeeIds: [] });
      const data = await api.get('/superadmin/admins');
      setAdmins((data.data?.admins || []).map(normalizeAdmin));
    } catch {
      setAdmins(p => p.map(a => a.id === id ? { ...a, status: 'approved' as const } : a));
    }
  }, []);

  const rejectAdmin = useCallback(async (id: string) => {
    try {
      await api.delete(`/superadmin/admins/${id}/reject`);
      const data = await api.get('/superadmin/admins');
      setAdmins((data.data?.admins || []).map(normalizeAdmin));
    } catch {
      setAdmins(p => p.filter(a => a.id !== id));
    }
  }, []);

  const deactivateAdmin = useCallback(async (id: string) => {
    try {
      await api.patch(`/superadmin/admins/${id}/deactivate`);
      const data = await api.get('/superadmin/admins');
      setAdmins((data.data?.admins || []).map(normalizeAdmin));
    } catch {
      setAdmins(p => p.map(a => a.id === id ? { ...a, status: 'rejected' as const } : a));
    }
  }, []);

  const value: FestCtx = {
    events, registrations, volunteers, assignments, sponsors, logistics,
    finances, committees, admins, students, loading,
    refreshEvents, refreshRegistrations, refreshVolunteers, refreshSponsors,
    refreshLogistics, refreshCommittees, refreshAdmins,
    createEvent, updateEvent, deleteEvent, approveEvent, rejectEvent, submitEventForApproval,
    registerForEvent, cancelRegistration, markRegistrationAttended,
    addVolunteer, assignVolunteer, toggleVolunteerAttendance,
    addSponsor, updateSponsorStatus, toggleSponsorChecklist, addSponsorChecklistItem, deleteSponsor,
    createLogistics, updateLogisticsField, toggleLogisticsItem, addLogisticsItem, removeLogisticsItem,
    createCommittee, deleteCommittee, assignAdminToCommittee, removeAdminFromCommittee,
    approveAdmin, rejectAdmin, deactivateAdmin,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFest() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useFest must be used within FestProvider');
  return c;
}