export type EventCategory = 'technical' | 'cultural' | 'sports' | 'other';
export type EventStatus = 'approved' | 'pending' | 'rejected' | 'draft';
export type RegStatus = 'confirmed' | 'cancelled' | 'attended';
export type SponsorStatus = 'contacted' | 'negotiating' | 'confirmed' | 'received';

export interface FestEvent {
  id: string; title: string; description: string; category: EventCategory;
  committee: string; date: string; time: string; venue: string;
  capacity: number; registeredCount: number; entryFee: number;
  status: EventStatus; rejectionNote?: string; isPast: boolean; createdBy: string;
}
export interface Registration {
  id: string; eventId: string; studentId: string; studentName: string;
  studentEmail: string; status: RegStatus; registeredAt: string;
}
export interface Volunteer {
  id: string; name: string; email: string; phone: string; committee: string;
}
export interface VolunteerAssignment {
  id: string; volunteerId: string; eventId: string; role: string; attended: boolean;
}
export interface ChecklistItem { id: string; task: string; done: boolean; }
export interface Sponsor {
  id: string; name: string; dealAmount: number; dealType: 'cash' | 'in-kind';
  status: SponsorStatus; committee: string; notes?: string; checklist: ChecklistItem[];
}
export interface LogisticsRecord {
  id: string; eventId: string; venue: string; notes: string; checklist: ChecklistItem[];
}
export interface FinanceRecord {
  eventId: string; budget: number; revenue: number;
  expenses: { id: string; item: string; amount: number }[];
}
export interface Committee { id: string; name: string; description: string; adminIds: string[]; }
export interface AdminUser {
  id: string; name: string; email: string; status: 'approved' | 'pending' | 'rejected';
  college?: string; joinedAt: string;
}
export interface StudentUser {
  id: string; name: string; email: string; phone: string; college: string; year: string;
}

export const initialEvents: FestEvent[] = [
  { id:'evt-1', title:'HackSPIT 2025', description:'Annual 24-hour hackathon bringing together the brightest minds to build innovative solutions to real-world problems. Team up, code, and compete for exciting prizes!', category:'technical', committee:'Technical Committee', date:'2026-04-22', time:'09:00 AM', venue:'Computer Lab Block A', capacity:100, registeredCount:45, entryFee:0, status:'approved', isPast:false, createdBy:'admin-1' },
  { id:'evt-2', title:'CodeSprint', description:'Fast-paced competitive programming contest testing algorithmic skills. Solve challenging problems within time limits and climb the leaderboard.', category:'technical', committee:'Technical Committee', date:'2026-04-27', time:'10:00 AM', venue:'Seminar Hall 1', capacity:60, registeredCount:32, entryFee:50, status:'approved', isPast:false, createdBy:'admin-1' },
  { id:'evt-3', title:'Antakshari Night', description:'A melodious evening of musical showdown where teams compete in the classic Indian song game. Bring your best voices!', category:'cultural', committee:'Cultural Committee', date:'2026-04-19', time:'06:00 PM', venue:'Main Auditorium', capacity:200, registeredCount:87, entryFee:20, status:'approved', isPast:false, createdBy:'admin-2' },
  { id:'evt-4', title:'Dance Fiesta', description:'Showcase your dance talent in this electrifying competition featuring solo and group performances across all dance forms.', category:'cultural', committee:'Cultural Committee', date:'2026-05-02', time:'05:00 PM', venue:'Main Auditorium', capacity:150, registeredCount:23, entryFee:30, status:'approved', isPast:false, createdBy:'admin-2' },
  { id:'evt-5', title:'Cricket Tournament', description:'Inter-department cricket tournament with knockout format. Form your team and compete for the championship trophy!', category:'sports', committee:'Sports Committee', date:'2026-04-17', time:'08:00 AM', venue:'College Ground', capacity:80, registeredCount:56, entryFee:100, status:'approved', isPast:false, createdBy:'admin-3' },
  { id:'evt-6', title:'Table Tennis Open', description:'Open table tennis tournament for all skill levels. Singles format with round-robin group stage and knockout rounds.', category:'sports', committee:'Sports Committee', date:'2026-04-24', time:'09:00 AM', venue:'Sports Complex', capacity:40, registeredCount:12, entryFee:50, status:'approved', isPast:false, createdBy:'admin-3' },
  { id:'evt-7', title:'AI/ML Workshop', description:'Hands-on workshop exploring the latest in Artificial Intelligence and Machine Learning with practical projects and expert mentors.', category:'technical', committee:'Technical Committee', date:'2026-04-25', time:'10:00 AM', venue:'Computer Lab Block B', capacity:50, registeredCount:0, entryFee:0, status:'pending', isPast:false, createdBy:'admin-1' },
  { id:'evt-8', title:'Photography Contest', description:'Capture the beauty of campus life in this theme-based photography contest judged by professional photographers.', category:'other', committee:'General Committee', date:'2026-04-18', time:'09:00 AM', venue:'College Campus', capacity:30, registeredCount:0, entryFee:0, status:'pending', isPast:false, createdBy:'admin-4' },
  { id:'evt-9', title:'Laser Tag Battle', description:'Action-packed laser tag experience on campus grounds with team-based tactical gameplay.', category:'sports', committee:'Sports Committee', date:'2026-04-20', time:'03:00 PM', venue:'College Ground', capacity:40, registeredCount:0, entryFee:50, status:'rejected', rejectionNote:'Venue not available for the requested date.', isPast:false, createdBy:'admin-3' },
  { id:'evt-10', title:'Freshers Welcome 2024', description:'Annual welcome celebration for new students featuring performances, games, and a night of entertainment.', category:'cultural', committee:'Cultural Committee', date:'2026-03-12', time:'05:00 PM', venue:'Main Auditorium', capacity:300, registeredCount:280, entryFee:0, status:'approved', isPast:true, createdBy:'admin-2' },
];

export const initialStudents: StudentUser[] = [
  { id:'student-1', name:'Rahul Sharma', email:'rahul.sharma@student.com', phone:'9876543210', college:'SPIT Mumbai', year:'3rd Year' },
  { id:'student-2', name:'Ananya Patel', email:'ananya.patel@student.com', phone:'9876543211', college:'SPIT Mumbai', year:'2nd Year' },
  { id:'student-3', name:'Dev Khanna', email:'dev.khanna@student.com', phone:'9876543212', college:'SPIT Mumbai', year:'3rd Year' },
  { id:'student-4', name:'Meera Joshi', email:'meera.joshi@student.com', phone:'9876543213', college:'SPIT Mumbai', year:'4th Year' },
  { id:'student-5', name:'Siddharth Iyer', email:'siddharth.iyer@student.com', phone:'9876543214', college:'SPIT Mumbai', year:'2nd Year' },
  { id:'student-6', name:'Tanvi Desai', email:'tanvi.desai@student.com', phone:'9876543215', college:'SPIT Mumbai', year:'3rd Year' },
  { id:'student-7', name:'Amit Verma', email:'amit.verma@student.com', phone:'9876543216', college:'SPIT Mumbai', year:'1st Year' },
  { id:'student-8', name:'Pooja Gupta', email:'pooja.gupta@student.com', phone:'9876543217', college:'SPIT Mumbai', year:'2nd Year' },
];

export const initialRegistrations: Registration[] = [
  { id:'reg-1', eventId:'evt-1', studentId:'student-1', studentName:'Rahul Sharma', studentEmail:'rahul.sharma@student.com', status:'confirmed', registeredAt:'2026-04-01T10:00:00Z' },
  { id:'reg-2', eventId:'evt-2', studentId:'student-1', studentName:'Rahul Sharma', studentEmail:'rahul.sharma@student.com', status:'confirmed', registeredAt:'2026-04-02T11:00:00Z' },
  { id:'reg-3', eventId:'evt-5', studentId:'student-1', studentName:'Rahul Sharma', studentEmail:'rahul.sharma@student.com', status:'confirmed', registeredAt:'2026-04-03T09:00:00Z' },
  { id:'reg-4', eventId:'evt-1', studentId:'student-2', studentName:'Ananya Patel', studentEmail:'ananya.patel@student.com', status:'confirmed', registeredAt:'2026-04-01T12:00:00Z' },
  { id:'reg-5', eventId:'evt-4', studentId:'student-2', studentName:'Ananya Patel', studentEmail:'ananya.patel@student.com', status:'confirmed', registeredAt:'2026-04-04T14:00:00Z' },
  { id:'reg-6', eventId:'evt-3', studentId:'student-2', studentName:'Ananya Patel', studentEmail:'ananya.patel@student.com', status:'confirmed', registeredAt:'2026-04-02T15:00:00Z' },
  { id:'reg-7', eventId:'evt-2', studentId:'student-3', studentName:'Dev Khanna', studentEmail:'dev.khanna@student.com', status:'confirmed', registeredAt:'2026-04-03T10:00:00Z' },
  { id:'reg-8', eventId:'evt-6', studentId:'student-3', studentName:'Dev Khanna', studentEmail:'dev.khanna@student.com', status:'confirmed', registeredAt:'2026-04-05T11:00:00Z' },
  { id:'reg-9', eventId:'evt-3', studentId:'student-4', studentName:'Meera Joshi', studentEmail:'meera.joshi@student.com', status:'attended', registeredAt:'2026-04-01T09:00:00Z' },
  { id:'reg-10', eventId:'evt-10', studentId:'student-4', studentName:'Meera Joshi', studentEmail:'meera.joshi@student.com', status:'attended', registeredAt:'2026-02-28T10:00:00Z' },
  { id:'reg-11', eventId:'evt-5', studentId:'student-5', studentName:'Siddharth Iyer', studentEmail:'siddharth.iyer@student.com', status:'confirmed', registeredAt:'2026-04-02T08:00:00Z' },
  { id:'reg-12', eventId:'evt-1', studentId:'student-5', studentName:'Siddharth Iyer', studentEmail:'siddharth.iyer@student.com', status:'confirmed', registeredAt:'2026-04-01T14:00:00Z' },
  { id:'reg-13', eventId:'evt-4', studentId:'student-6', studentName:'Tanvi Desai', studentEmail:'tanvi.desai@student.com', status:'confirmed', registeredAt:'2026-04-05T16:00:00Z' },
  { id:'reg-14', eventId:'evt-6', studentId:'student-6', studentName:'Tanvi Desai', studentEmail:'tanvi.desai@student.com', status:'cancelled', registeredAt:'2026-04-06T09:00:00Z' },
  { id:'reg-15', eventId:'evt-2', studentId:'student-7', studentName:'Amit Verma', studentEmail:'amit.verma@student.com', status:'confirmed', registeredAt:'2026-04-04T10:00:00Z' },
  { id:'reg-16', eventId:'evt-3', studentId:'student-8', studentName:'Pooja Gupta', studentEmail:'pooja.gupta@student.com', status:'confirmed', registeredAt:'2026-04-03T12:00:00Z' },
];

export const initialVolunteers: Volunteer[] = [
  { id:'vol-1', name:'Vikram Nair', email:'vikram.nair@student.com', phone:'9871111111', committee:'Technical Committee' },
  { id:'vol-2', name:'Neha Kulkarni', email:'neha.kulkarni@student.com', phone:'9872222222', committee:'Technical Committee' },
  { id:'vol-3', name:'Rohan Pillai', email:'rohan.pillai@student.com', phone:'9873333333', committee:'Cultural Committee' },
  { id:'vol-4', name:'Divya Shah', email:'divya.shah@student.com', phone:'9874444444', committee:'Cultural Committee' },
  { id:'vol-5', name:'Karan Mehta', email:'karan.mehta@student.com', phone:'9875555555', committee:'Sports Committee' },
  { id:'vol-6', name:'Prerna Joshi', email:'prerna.joshi@student.com', phone:'9876666666', committee:'Sports Committee' },
  { id:'vol-7', name:'Sahil Gupta', email:'sahil.gupta@student.com', phone:'9877777777', committee:'General Committee' },
];

export const initialAssignments: VolunteerAssignment[] = [
  { id:'asgn-1', volunteerId:'vol-1', eventId:'evt-1', role:'Registration Desk', attended:true },
  { id:'asgn-2', volunteerId:'vol-1', eventId:'evt-2', role:'Tech Support', attended:false },
  { id:'asgn-3', volunteerId:'vol-2', eventId:'evt-1', role:'Stage Crew', attended:true },
  { id:'asgn-4', volunteerId:'vol-3', eventId:'evt-3', role:'Event Coordinator', attended:false },
  { id:'asgn-5', volunteerId:'vol-3', eventId:'evt-4', role:'Stage Crew', attended:false },
  { id:'asgn-6', volunteerId:'vol-4', eventId:'evt-3', role:'Registration Desk', attended:false },
  { id:'asgn-7', volunteerId:'vol-4', eventId:'evt-10', role:'Hospitality', attended:true },
  { id:'asgn-8', volunteerId:'vol-5', eventId:'evt-5', role:'Ground Marshal', attended:false },
  { id:'asgn-9', volunteerId:'vol-5', eventId:'evt-6', role:'Scorekeeping', attended:false },
  { id:'asgn-10', volunteerId:'vol-6', eventId:'evt-5', role:'First Aid', attended:false },
  { id:'asgn-11', volunteerId:'vol-7', eventId:'evt-4', role:'Crowd Management', attended:false },
];

export const initialSponsors: Sponsor[] = [
  { id:'spon-1', name:'TechCorp India', dealAmount:50000, dealType:'cash', status:'confirmed', committee:'Technical Committee', checklist:[
    {id:'sc-1',task:'Send proposal',done:true},{id:'sc-2',task:'Get agreement',done:true},{id:'sc-3',task:'Collect cheque',done:true},{id:'sc-4',task:'Send thank you',done:false},{id:'sc-5',task:'Place logo on banners',done:false}
  ]},
  { id:'spon-2', name:'CloudBase Solutions', dealAmount:25000, dealType:'cash', status:'negotiating', committee:'Technical Committee', checklist:[
    {id:'sc-6',task:'Send proposal',done:true},{id:'sc-7',task:'Follow up call',done:true},{id:'sc-8',task:'Get agreement',done:false},{id:'sc-9',task:'Collect payment',done:false}
  ]},
  { id:'spon-3', name:'Rhythm Studios', dealAmount:15000, dealType:'in-kind', status:'confirmed', committee:'Cultural Committee', checklist:[
    {id:'sc-10',task:'Confirm equipment list',done:true},{id:'sc-11',task:'Arrange transport',done:false},{id:'sc-12',task:'Setup and soundcheck',done:false}
  ]},
  { id:'spon-4', name:'SportZone', dealAmount:10000, dealType:'in-kind', status:'received', committee:'Sports Committee', checklist:[
    {id:'sc-13',task:'Confirm item list',done:true},{id:'sc-14',task:'Collect equipment',done:true},{id:'sc-15',task:'Return unused',done:false}
  ]},
  { id:'spon-5', name:'Mumbai Eats', dealAmount:8000, dealType:'in-kind', status:'contacted', committee:'General Committee', checklist:[
    {id:'sc-16',task:'Send proposal',done:true},{id:'sc-17',task:'Discuss menu',done:false},{id:'sc-18',task:'Confirm stall locations',done:false}
  ]},
];

export const initialLogistics: LogisticsRecord[] = [
  { id:'log-1', eventId:'evt-1', venue:'Computer Lab Block A', notes:'', checklist:[
    {id:'lc-1',task:'Book lab',done:true},{id:'lc-2',task:'Confirm 100 systems',done:true},{id:'lc-3',task:'Install software',done:true},{id:'lc-4',task:'Power backup',done:false},{id:'lc-5',task:'Registration desk',done:false},{id:'lc-6',task:'Refreshments',done:false},{id:'lc-7',task:'Print banners',done:false}
  ]},
  { id:'log-2', eventId:'evt-2', venue:'Seminar Hall 1', notes:'', checklist:[
    {id:'lc-8',task:'Book hall',done:true},{id:'lc-9',task:'Test online judge',done:false},{id:'lc-10',task:'Arrange seating',done:true},{id:'lc-11',task:'Setup projector',done:false},{id:'lc-12',task:'Print problem statements',done:false}
  ]},
  { id:'log-3', eventId:'evt-3', venue:'Main Auditorium', notes:'', checklist:[
    {id:'lc-13',task:'Book auditorium',done:true},{id:'lc-14',task:'Arrange sound',done:true},{id:'lc-15',task:'Stage lighting',done:false},{id:'lc-16',task:'Arrange seating',done:false},{id:'lc-17',task:'Prepare buzzers',done:false}
  ]},
  { id:'log-4', eventId:'evt-4', venue:'Main Auditorium', notes:'', checklist:[
    {id:'lc-18',task:'Book auditorium',done:true},{id:'lc-19',task:'Sound system',done:false},{id:'lc-20',task:'Backstage rooms',done:false},{id:'lc-21',task:'Judges seating',done:false},{id:'lc-22',task:'Score sheets',done:false}
  ]},
  { id:'log-5', eventId:'evt-5', venue:'College Ground', notes:'', checklist:[
    {id:'lc-23',task:'Book ground',done:true},{id:'lc-24',task:'Cricket kit',done:true},{id:'lc-25',task:'Boundary markers',done:false},{id:'lc-26',task:'Scoreboard',done:false},{id:'lc-27',task:'First aid',done:false}
  ]},
  { id:'log-6', eventId:'evt-6', venue:'Sports Complex', notes:'', checklist:[
    {id:'lc-28',task:'Book complex',done:true},{id:'lc-29',task:'Confirm 4 tables',done:true},{id:'lc-30',task:'Arrange balls',done:true},{id:'lc-31',task:'Tournament bracket',done:false},{id:'lc-32',task:'Umpires',done:false}
  ]},
];

export const initialFinances: FinanceRecord[] = [
  { eventId:'evt-1', budget:30000, revenue:0, expenses:[
    {id:'exp-1',item:'Refreshments',amount:8000},{id:'exp-2',item:'Printing',amount:3000},{id:'exp-3',item:'Prizes',amount:10000},{id:'exp-4',item:'Electricity',amount:2000}
  ]},
  { eventId:'evt-2', budget:10000, revenue:3000, expenses:[
    {id:'exp-5',item:'Platform',amount:2000},{id:'exp-6',item:'Prizes',amount:5000},{id:'exp-7',item:'Refreshments',amount:1500}
  ]},
  { eventId:'evt-5', budget:25000, revenue:8000, expenses:[
    {id:'exp-8',item:'Kit',amount:5000},{id:'exp-9',item:'Ground prep',amount:3000},{id:'exp-10',item:'Prizes',amount:8000}
  ]},
];

export const initialCommittees: Committee[] = [
  { id:'comm-1', name:'Technical Committee', description:'Manages all technical events including hackathons, coding contests, and workshops.', adminIds:['admin-1'] },
  { id:'comm-2', name:'Cultural Committee', description:'Organizes cultural events including dance, music, drama, and art competitions.', adminIds:['admin-2'] },
  { id:'comm-3', name:'Sports Committee', description:'Manages all sports events and tournaments across the college fest.', adminIds:['admin-3'] },
  { id:'comm-4', name:'General Committee', description:'Handles miscellaneous events, logistics coordination, and general operations.', adminIds:['admin-4'] },
];

export const initialAdmins: AdminUser[] = [
  { id:'admin-1', name:'Aryan Mehta', email:'aryan.mehta@collegefest.com', status:'approved', college:'SPIT Mumbai', joinedAt:'2026-01-15' },
  { id:'admin-2', name:'Sneha Rao', email:'sneha.rao@collegefest.com', status:'approved', college:'SPIT Mumbai', joinedAt:'2026-01-16' },
  { id:'admin-3', name:'Kabir Singh', email:'kabir.singh@collegefest.com', status:'approved', college:'SPIT Mumbai', joinedAt:'2026-01-17' },
  { id:'admin-4', name:'Priya Nair', email:'priya.nair@collegefest.com', status:'approved', college:'SPIT Mumbai', joinedAt:'2026-01-18' },
  { id:'admin-5', name:'Rohan Das', email:'rohan.das@collegefest.com', status:'pending', college:'SPIT Mumbai', joinedAt:'2026-04-01' },
  { id:'admin-6', name:'Aisha Khan', email:'aisha.khan@collegefest.com', status:'pending', college:'SPIT Mumbai', joinedAt:'2026-04-05' },
];

export const VOLUNTEER_ROLES = [
  'Registration Desk','Stage Crew','Tech Support','Event Coordinator','Hospitality',
  'Ground Marshal','First Aid','Scorekeeping','Crowd Management','Photography'
];
