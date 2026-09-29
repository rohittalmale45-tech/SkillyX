import { useMemo, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Activity,
  ArrowUpRight,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  CircleHelp,
  Download,
  FileBarChart,
  Filter,
  GraduationCap,
  LayoutDashboard,
  Lightbulb,
  Map,
  Menu,
  MoreHorizontal,
  Network,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  UserRound,
  Mail,
  Phone,
  Building2,
  MapPin,
  Pencil,
  Save,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

const queryClient = new QueryClient();

type Role = 'government' | 'institute' | 'employer' | 'student';
type NavItem = { label: string; href: string; icon: LucideIcon; group?: string };
type Overlay = 'notifications' | 'profile' | null;
type ProfileDetails = {
  name: string;
  email: string;
  phone: string;
  organization: string;
  location: string;
  role: Role;
};

const defaultProfile: ProfileDetails = {
  name: 'Aniket Kulkarni',
  email: 'aniket.kulkarni@skillsync.maha.gov.in',
  phone: '+91 98765 43210',
  organization: 'Department of Skill Development, Entrepreneurship & Innovation',
  location: 'Pune, Maharashtra',
  role: 'government',
};

const roles: { id: Role; title: string; description: string; icon: LucideIcon; accent: string }[] = [
  { id: 'government', title: 'Government & policy', description: 'Plan district skilling with evidence', icon: ShieldCheck, accent: 'amber' },
  { id: 'institute', title: 'Training institute', description: 'Align courses to real demand', icon: GraduationCap, accent: 'teal' },
  { id: 'employer', title: 'Employer', description: 'Find and grow the skills you need', icon: BriefcaseBusiness, accent: 'coral' },
  { id: 'student', title: 'Student & jobseeker', description: 'Turn signals into your next move', icon: Target, accent: 'violet' },
];

const nav: NavItem[] = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard, group: 'Decision room' },
  { label: 'Labour market', href: '/labour-market', icon: TrendingUp },
  { label: 'Skill gaps', href: '/skill-gaps', icon: Network },
  { label: 'District planning', href: '/district-planning', icon: Map },
  { label: 'Course alignment', href: '/course-alignment', icon: BookOpen, group: 'Action studio' },
  { label: 'Career navigator', href: '/career-navigator', icon: Sparkles },
  { label: 'Employer demand', href: '/employer-demand', icon: BriefcaseBusiness },
  { label: 'Reports', href: '/reports', icon: FileBarChart, group: 'Workspace' },
  { label: 'Settings', href: '/settings', icon: Settings },
];

const districtData = [
  { name: 'Pune', short: 'PN', demand: 84, learners: '1,24,800', gap: 18, trend: '+12.4%', color: 'bg-[#e1a329]' },
  { name: 'Thane', short: 'TH', demand: 77, learners: '98,420', gap: 24, trend: '+8.1%', color: 'bg-[#2e8b78]' },
  { name: 'Nashik', short: 'NS', demand: 69, learners: '72,610', gap: 31, trend: '+15.8%', color: 'bg-[#e56d52]' },
  { name: 'Nagpur', short: 'NG', demand: 66, learners: '84,210', gap: 26, trend: '+6.7%', color: 'bg-[#6c6298]' },
  { name: 'Chhatrapati Sambhajinagar', short: 'CS', demand: 58, learners: '51,890', gap: 39, trend: '+11.2%', color: 'bg-[#4b7590]' },
];

const courses = [
  { name: 'Industrial Automation Technician', provider: 'Maharashtra Skill University', demand: 94, fit: 'Strong fit', seats: 480, status: 'Aligned' },
  { name: 'Solar PV Installer', provider: 'MahaJobs partner network', demand: 86, fit: 'Strong fit', seats: 320, status: 'Aligned' },
  { name: 'Data Analytics Essentials', provider: 'Tata STRIVE', demand: 72, fit: 'Needs update', seats: 760, status: 'Review' },
  { name: 'Retail Sales Associate', provider: 'Rural Skill Centres', demand: 61, fit: 'Watch', seats: 1120, status: 'Review' },
];

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

function Badge({ children, tone = 'slate' }: { children: ReactNode; tone?: 'slate' | 'amber' | 'teal' | 'coral' | 'violet' | 'green' }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-600 border-slate-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    teal: 'bg-teal-50 text-teal-700 border-teal-200',
    coral: 'bg-orange-50 text-orange-700 border-orange-200',
    violet: 'bg-violet-50 text-violet-700 border-violet-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
  return <span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold', tones[tone])}>{children}</span>;
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={cn('rounded-2xl border border-card-border bg-card shadow-[0_10px_30px_-24px_rgba(26,62,78,.45)]', className)}>{children}</section>;
}

function ProgressBar({ value, color = 'bg-primary' }: { value: number; color?: string }) {
  return <div className="h-2 w-full overflow-hidden rounded-full bg-muted"><div className={cn('h-full rounded-full transition-all duration-500', color)} style={{ width: `${value}%` }} /></div>;
}

function StatCard({ label, value, change, detail, icon: Icon, tone = 'blue' }: { label: string; value: string; change: string; detail: string; icon: LucideIcon; tone?: string }) {
  return (
    <Card className="group p-5 transition-transform duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', tone === 'amber' ? 'bg-amber-100 text-amber-700' : tone === 'teal' ? 'bg-teal-100 text-teal-700' : tone === 'coral' ? 'bg-orange-100 text-orange-700' : 'bg-sky-100 text-sky-700')}><Icon size={19} /></div>
        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700"><ArrowUpRight size={13} />{change}</span>
      </div>
      <p className="mt-5 text-xs font-semibold uppercase tracking-data text-muted-foreground">{label}</p>
      <p className="display-font mt-1 text-3xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </Card>
  );
}

function Welcome({ onSelect }: { onSelect: (role: Role) => void }) {
  const [hovered, setHovered] = useState<Role | null>(null);
  return (
    <main className="noise min-h-[100dvh] overflow-hidden bg-background">
      <div className="relative mx-auto flex min-h-[100dvh] max-w-[1440px] flex-col px-5 py-6 sm:px-10 lg:px-16">
        <header className="flex items-center justify-between">
          <img src="/brand/skillsync-logo.png" alt="SkillSync Maharashtra" className="h-auto w-[190px] object-contain sm:w-[230px]" />
          <span className="hidden items-center gap-2 text-xs font-medium text-muted-foreground sm:flex"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Open-access preview · 2024–25</span>
        </header>
        <div className="grid flex-1 items-center gap-8 py-10 sm:py-14 lg:grid-cols-[.95fr_1.05fr] lg:gap-16">
          <div className="animate-rise max-w-xl">
            <div className="mb-1 flex justify-center sm:justify-start">
              <img src="/brand/skillsync-hero.png" alt="Learners collaborating around a laptop" className="h-auto w-full max-w-[430px] object-contain sm:max-w-[470px]" />
            </div>
            <Badge tone="amber"><Zap size={12} /> Maharashtra decision room</Badge>
            <h1 className="display-font mt-5 text-5xl font-bold leading-[.98] tracking-tight text-[#173746] sm:text-7xl">Make every <span className="text-primary">skill</span> count.</h1>
            <p className="mt-5 max-w-md text-base leading-7 text-muted-foreground">One clear view of district signals, course gaps, and career actions — built for the people shaping Maharashtra&apos;s workforce.</p>
            <div className="mt-7 flex items-center gap-4 text-xs text-muted-foreground"><div className="flex -space-x-2">{['G', 'T', 'E', 'S'].map((initial, i) => <span key={initial} className={cn('flex h-8 w-8 items-center justify-center rounded-full border-2 border-background text-[11px] font-bold text-white', ['bg-[#2e8b78]', 'bg-[#e56d52]', 'bg-[#6c6298]', 'bg-[#4b7590]'][i])}>{initial}</span>)}</div><span>For government, institutes, employers & students</span></div>
          </div>
          <div className="relative animate-rise animate-rise-1">
            <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-amber-200/40 blur-3xl" />
            <div className="relative rounded-[28px] border border-[#cfddd9] bg-[#eff4f0] p-4 shadow-[0_28px_80px_-45px_rgba(23,55,70,.55)] sm:p-6">
              <div className="mb-5 flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-data text-muted-foreground">Begin your workspace</p><p className="mt-1 text-lg font-bold text-[#173746]">Continue as</p></div><div className="rounded-full bg-white p-2 text-muted-foreground"><ChevronRight size={16} /></div></div>
              <div className="grid gap-3 sm:grid-cols-2">
                {roles.map(({ id, title, description, icon: Icon, accent }) => (
                  <button key={id} type="button" data-testid={`button-role-${id}`} onMouseEnter={() => setHovered(id)} onMouseLeave={() => setHovered(null)} onClick={() => onSelect(id)} className={cn('group text-left rounded-2xl border bg-card p-4 transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg', hovered && hovered !== id ? 'opacity-60' : 'opacity-100')}>
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', accent === 'amber' ? 'bg-amber-100 text-amber-700' : accent === 'teal' ? 'bg-teal-100 text-teal-700' : accent === 'coral' ? 'bg-orange-100 text-orange-700' : 'bg-violet-100 text-violet-700')}><Icon size={19} /></div>
                    <p className="mt-4 text-sm font-bold text-foreground">{title}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
                    <div className="mt-4 flex items-center gap-1 text-xs font-bold text-primary opacity-0 transition-opacity group-hover:opacity-100">Enter workspace <ChevronRight size={13} /></div>
                  </button>
                ))}
              </div>
              <p className="mt-5 text-center text-[11px] text-muted-foreground">No account needed for this preview · Local data only</p>
            </div>
          </div>
        </div>
        <footer className="flex flex-col gap-2 border-t border-border pt-5 text-[11px] text-muted-foreground sm:flex-row sm:justify-between"><span>Department of Skill Development, Entrepreneurship & Innovation</span><span>Built for a more capable Maharashtra</span></footer>
      </div>
    </main>
  );
}

function Sidebar({ role, collapsed, setCollapsed, onNavigate }: { role: Role; collapsed: boolean; setCollapsed: (value: boolean) => void; onNavigate?: () => void }) {
  const [location] = useLocation();
  const roleLabel = roles.find(r => r.id === role)?.title ?? 'Stakeholder';
  return (
    <aside className={cn('fixed inset-y-0 left-0 z-40 flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300', collapsed ? 'w-[76px]' : 'w-[248px]')}>
      <div className="flex h-[78px] items-center justify-between border-b border-sidebar-border px-4">
        <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-3" data-testid="link-brand"><span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white"><img src="/brand/skillsync-logo.png" alt="" className="h-full w-full object-cover object-left" /></span>{!collapsed && <span><span className="block text-sm font-bold tracking-tight">SkillSync</span><span className="block text-[9px] font-bold uppercase tracking-data text-sidebar-foreground/55">Maharashtra</span></span>}</Link>
        <button type="button" data-testid="button-collapse-sidebar" onClick={() => setCollapsed(!collapsed)} className="hidden rounded-lg p-2 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground md:block">{collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}</button>
      </div>
      <div className={cn('border-b border-sidebar-border px-3 py-4', collapsed && 'px-2')}><div className={cn('flex items-center gap-3 rounded-xl bg-sidebar-accent px-3 py-2.5', collapsed && 'justify-center px-0')}><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground">{roleLabel.charAt(0)}</span>{!collapsed && <div className="min-w-0"><p className="truncate text-xs font-semibold">{roleLabel}</p><p className="text-[10px] text-sidebar-foreground/55">Preview workspace</p></div>}</div></div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {['Decision room', 'Action studio', 'Workspace'].map(group => <div key={group} className="mb-5">{!collapsed && <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-data text-sidebar-foreground/40">{group}</p>}{nav.filter(item => item.group === group || (!item.group && ((group === 'Decision room' && ['Overview', 'Labour market', 'Skill gaps', 'District planning'].includes(item.label)) || (group === 'Action studio' && ['Course alignment', 'Career navigator', 'Employer demand'].includes(item.label)) || (group === 'Workspace' && ['Reports', 'Settings'].includes(item.label))))).map(item => { const active = location === item.href; return <Link key={item.href} href={item.href} onClick={onNavigate} data-testid={`link-nav-${item.label.toLowerCase().replaceAll(' ', '-')}`} className={cn('group mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-colors', active ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground', collapsed && 'justify-center px-0')}><item.icon size={17} strokeWidth={active ? 2.4 : 1.8} />{!collapsed && <span>{item.label}</span>}{!collapsed && active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-current" />}</Link>; })}</div>)}
      </nav>
      {!collapsed && <div className="m-3 rounded-xl border border-sidebar-border bg-sidebar-accent/50 p-3"><div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-data text-sidebar-foreground/60"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Data status</div><p className="mt-2 text-xs leading-5 text-sidebar-foreground/70">Local preview data is current to Q4 FY25.</p></div>}
      <div className="border-t border-sidebar-border p-3"><button type="button" data-testid="button-help" className={cn('flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground', collapsed && 'justify-center px-0')}><CircleHelp size={17} />{!collapsed && <span>Need a hand?</span>}</button></div>
    </aside>
  );
}

const notifications = [
  { title: 'Nashik has a 31% solar skills gap', detail: 'District planning · 2h ago', href: '/district-planning', tone: 'amber' },
  { title: '14 courses need a curriculum refresh', detail: 'Course alignment · Yesterday', href: '/course-alignment', tone: 'teal' },
  { title: 'Pune demand rose in precision engineering', detail: 'Labour market · Monday', href: '/labour-market', tone: 'coral' },
];

function NotificationPopover({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute right-4 top-[70px] z-50 w-[min(370px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-card shadow-[0_20px_60px_-24px_rgba(23,55,70,.45)]">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="text-sm font-bold text-foreground">Notifications</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Signals that may need your attention</p>
        </div>
        <button type="button" aria-label="Close notifications" onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"><X size={16} /></button>
      </div>
      <div className="divide-y divide-border">
        {notifications.map(item => (
          <Link key={item.title} href={item.href} onClick={onClose} className="group flex gap-3 px-4 py-3 transition-colors hover:bg-muted">
            <span className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', item.tone === 'amber' ? 'bg-amber-100 text-amber-700' : item.tone === 'teal' ? 'bg-teal-100 text-teal-700' : 'bg-orange-100 text-orange-700')}><Bell size={14} /></span>
            <span className="min-w-0">
              <span className="block text-xs font-semibold leading-5 text-foreground">{item.title}</span>
              <span className="mt-0.5 block text-[11px] text-muted-foreground">{item.detail}</span>
            </span>
            <ChevronRight className="ml-auto mt-1 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-1" size={15} />
          </Link>
        ))}
      </div>
      <div className="border-t border-border bg-muted/40 px-4 py-3 text-[11px] text-muted-foreground">Preview notifications are based on local workspace signals.</div>
    </div>
  );
}

function ProfileDrawer({ profile, onClose, onSave }: { profile: ProfileDetails; onClose: () => void; onSave: (profile: ProfileDetails) => void }) {
  const [draft, setDraft] = useState(profile);
  const [editing, setEditing] = useState(false);
  const roleLabel = roles.find(role => role.id === draft.role)?.title ?? 'Stakeholder';
  const update = (field: keyof ProfileDetails, value: string) => setDraft(current => ({ ...current, [field]: value }));
  const inputClass = 'mt-1.5 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none ring-primary/30 transition focus:ring-2 disabled:cursor-default disabled:border-transparent disabled:bg-muted/60';

  return (
    <div className="fixed inset-0 z-[60] bg-[#173746]/35" onClick={onClose}>
      <aside role="dialog" aria-modal="true" aria-labelledby="profile-title" onClick={event => event.stopPropagation()} className="absolute right-0 top-0 flex h-full w-full max-w-[460px] flex-col border-l border-border bg-background shadow-[-20px_0_70px_-35px_rgba(23,55,70,.65)]">
        <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-data text-primary">Account profile</p>
            <h2 id="profile-title" className="mt-1 text-xl font-bold text-foreground">Your details</h2>
          </div>
          <button type="button" aria-label="Close profile" onClick={onClose} className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-6">
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#2e8b78] text-lg font-bold text-white">{draft.name.split(' ').map(part => part.charAt(0)).slice(0, 2).join('')}</div>
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-foreground">{draft.name || 'Your name'}</p>
              <p className="mt-1 truncate text-xs text-muted-foreground">{roleLabel}</p>
            </div>
            <Badge tone="green">Preview</Badge>
          </div>

          <div className="mt-6 space-y-4">
            <label className="block text-xs font-semibold text-foreground">Full name<input value={draft.name} onChange={event => update('name', event.target.value)} disabled={!editing} className={inputClass} /></label>
            <label className="block text-xs font-semibold text-foreground"><span className="flex items-center gap-1.5"><Mail size={13} className="text-muted-foreground" /> Email address</span><input type="email" value={draft.email} onChange={event => update('email', event.target.value)} disabled={!editing} className={inputClass} /></label>
            <label className="block text-xs font-semibold text-foreground"><span className="flex items-center gap-1.5"><Phone size={13} className="text-muted-foreground" /> Phone number</span><input value={draft.phone} onChange={event => update('phone', event.target.value)} disabled={!editing} className={inputClass} /></label>
            <label className="block text-xs font-semibold text-foreground"><span className="flex items-center gap-1.5"><Building2 size={13} className="text-muted-foreground" /> Organization</span><input value={draft.organization} onChange={event => update('organization', event.target.value)} disabled={!editing} className={inputClass} /></label>
            <label className="block text-xs font-semibold text-foreground"><span className="flex items-center gap-1.5"><MapPin size={13} className="text-muted-foreground" /> Location</span><input value={draft.location} onChange={event => update('location', event.target.value)} disabled={!editing} className={inputClass} /></label>
            <label className="block text-xs font-semibold text-foreground">Working perspective<select value={draft.role} onChange={event => update('role', event.target.value)} disabled={!editing} className={inputClass}>{roles.map(role => <option key={role.id} value={role.id}>{role.title}</option>)}</select></label>
          </div>

          <div className="mt-6 rounded-xl border border-border bg-muted/50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-data text-muted-foreground">Local preview account</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Your changes are saved in this browser only. Authentication and cloud persistence are not configured for this preview.</p>
          </div>
        </div>
        <div className="flex gap-2 border-t border-border bg-background px-5 py-4 sm:px-6">
          {editing ? (
            <>
              <button type="button" onClick={() => { setDraft(profile); setEditing(false); }} className="flex-1 rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted">Cancel</button>
              <button type="button" data-testid="button-save-profile" onClick={() => { onSave(draft); setEditing(false); }} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:brightness-110"><Save size={14} /> Save details</button>
            </>
          ) : (
            <button type="button" data-testid="button-edit-profile" onClick={() => setEditing(true)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:brightness-110"><Pencil size={14} /> Edit profile</button>
          )}
        </div>
      </aside>
    </div>
  );
}

function Topbar({ role, onMenu, notificationsOpen, onNotifications, onProfile }: { role: Role; onMenu: () => void; notificationsOpen: boolean; onNotifications: () => void; onProfile: () => void }) {
  const [location] = useLocation();
  const current = nav.find(item => item.href === location)?.label ?? 'Overview';
  const roleLabel = roles.find(r => r.id === role)?.title ?? 'Stakeholder';
  return <header className="relative sticky top-0 z-30 flex h-[78px] items-center justify-between border-b border-border bg-background/90 px-5 backdrop-blur-md sm:px-8"><div className="flex items-center gap-3"><button type="button" data-testid="button-open-menu" onClick={onMenu} className="rounded-lg p-2 text-muted-foreground hover:bg-muted md:hidden"><Menu size={20} /></button><div><p className="text-[10px] font-bold uppercase tracking-data text-muted-foreground">Maharashtra / {roleLabel}</p><h2 className="mt-1 text-lg font-bold tracking-tight text-foreground">{current}</h2></div></div><div className="flex items-center gap-2 sm:gap-4"><div className="hidden items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs text-muted-foreground lg:flex"><Search size={14} /><span>Search signals</span><kbd className="ml-6 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">⌘ K</kbd></div><button type="button" data-testid="button-notifications" aria-label="Open notifications" aria-expanded={notificationsOpen} onClick={onNotifications} className={cn('relative rounded-xl p-2.5 text-muted-foreground hover:bg-muted', notificationsOpen && 'bg-muted text-foreground')}><Bell size={18} /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#e56d52]" /></button><div className="hidden h-7 w-px bg-border sm:block" /><button type="button" data-testid="button-profile" aria-label="Open profile" onClick={onProfile} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2e8b78] text-xs font-bold text-white transition-transform hover:scale-105">AK</button></div>{notificationsOpen && <NotificationPopover onClose={onNotifications} />}</header>;
}

function Shell({ children, role, setRole }: { children: ReactNode; role: Role; setRole: (role: Role) => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [profile, setProfile] = useState<ProfileDetails>(() => {
    try {
      const stored = localStorage.getItem('skillsync-profile');
      return stored ? { ...defaultProfile, ...JSON.parse(stored), role } : { ...defaultProfile, role };
    } catch {
      return { ...defaultProfile, role };
    }
  });
  const saveProfile = (nextProfile: ProfileDetails) => {
    setProfile(nextProfile);
    localStorage.setItem('skillsync-profile', JSON.stringify(nextProfile));
    setRole(nextProfile.role);
    setOverlay(null);
  };
  return <div className="min-h-[100dvh] bg-background"><div className={cn(mobileOpen ? 'block' : 'hidden', 'fixed inset-0 z-30 bg-[#173746]/35 md:hidden')} onClick={() => setMobileOpen(false)} /><div className={cn('md:block', mobileOpen ? 'block' : 'hidden')}><Sidebar role={role} collapsed={collapsed} setCollapsed={setCollapsed} onNavigate={() => setMobileOpen(false)} /></div><div className={cn('min-h-[100dvh] transition-[margin] duration-300', collapsed ? 'md:ml-[76px]' : 'md:ml-[248px]')}><Topbar role={role} onMenu={() => setMobileOpen(true)} notificationsOpen={overlay === 'notifications'} onNotifications={() => setOverlay(current => current === 'notifications' ? null : 'notifications')} onProfile={() => setOverlay('profile')} /><main className="mx-auto max-w-[1540px] px-5 py-7 sm:px-8 lg:px-10">{children}</main></div>{overlay === 'profile' && <ProfileDrawer profile={{ ...profile, role }} onClose={() => setOverlay(null)} onSave={saveProfile} />}</div>;
}

function PageIntro({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-[10px] font-bold uppercase tracking-data text-primary">{eyebrow}</p><h1 className="display-font mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p></div>{action}</div>;
}

function FilterStrip({ timeframe, setTimeframe, district, setDistrict }: { timeframe: string; setTimeframe: (value: string) => void; district: string; setDistrict: (value: string) => void }) {
  return <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-2"><div className="flex items-center gap-2 px-2 text-xs font-semibold text-muted-foreground"><Filter size={14} /> View as</div><select value={timeframe} onChange={e => setTimeframe(e.target.value)} data-testid="select-timeframe" className="rounded-lg border-0 bg-muted px-3 py-2 text-xs font-semibold text-foreground outline-none"><option>Last 12 months</option><option>Last 6 months</option><option>FY 2024–25</option></select><select value={district} onChange={e => setDistrict(e.target.value)} data-testid="select-district" className="rounded-lg border-0 bg-muted px-3 py-2 text-xs font-semibold text-foreground outline-none"><option>All Maharashtra</option><option>Pune</option><option>Thane</option><option>Nashik</option><option>Nagpur</option></select><span className="ml-auto hidden items-center gap-1 px-3 text-[11px] text-muted-foreground sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Updated 18 min ago</span></div>;
}

function Dashboard({ role }: { role: Role }) {
  const [timeframe, setTimeframe] = useState('Last 12 months');
  const [district, setDistrict] = useState('All Maharashtra');
  const multiplier = district === 'All Maharashtra' ? 1 : district === 'Pune' ? .81 : district === 'Thane' ? .69 : district === 'Nashik' ? .52 : .58;
  const jobs = Math.round(284600 * multiplier).toLocaleString('en-IN');
  const priorityItems = [
    { title: 'Nashik has a 31% solar skills gap', meta: 'District plan · 2h ago', icon: Zap, tone: 'amber', href: '/district-planning' },
    { title: '14 courses need a curriculum refresh', meta: 'Course alignment · Yesterday', icon: BookOpen, tone: 'teal', href: '/course-alignment' },
    { title: 'Pune demand rose in precision engineering', meta: 'Market signal · Mon', icon: TrendingUp, tone: 'coral', href: '/labour-market' },
  ];
  return <><PageIntro eyebrow="Decision room / live snapshot" title="Good morning, Aniket." description={`Here is the workforce picture for ${district.toLowerCase()} — and the signals worth acting on next.`} action={<button type="button" data-testid="button-refresh-dashboard" onClick={() => setTimeframe('Last 12 months')} className="flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-semibold text-foreground hover:bg-muted"><RefreshCw size={14} /> Refresh data</button>} /><FilterStrip timeframe={timeframe} setTimeframe={setTimeframe} district={district} setDistrict={setDistrict} /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Active job signals" value={jobs} change={district === 'All Maharashtra' ? '+12.8%' : '+9.4%'} detail="Across 18 priority sectors" icon={TrendingUp} /><StatCard label="Learners in pipeline" value={Math.round(482300 * multiplier).toLocaleString('en-IN')} change="+6.2%" detail="Enrolled across Maharashtra" icon={Users} tone="teal" /><StatCard label="Critical skill gaps" value={district === 'All Maharashtra' ? '47' : district === 'Pune' ? '18' : '24'} change="−4.1%" detail="Signals needing intervention" icon={Target} tone="coral" /><StatCard label="Course alignment" value={district === 'All Maharashtra' ? '68.4%' : '71.2%'} change="+3.7%" detail="Mapped to current demand" icon={Check} tone="amber" /></div><div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_.7fr]"><Card className="overflow-hidden"><div className="flex items-start justify-between border-b border-border p-5"><div><p className="text-sm font-bold text-foreground">Demand is moving east</p><p className="mt-1 text-xs text-muted-foreground">Job-posting momentum by leading district</p></div><Badge tone="teal"><TrendingUp size={12} /> 12.8% statewide</Badge></div><div className="data-grid p-5 pb-6"><div className="flex h-52 items-end gap-2 sm:gap-4">{[38, 48, 43, 61, 55, 68, 72, 65, 82, 76, 89, 94].map((height, i) => <div key={i} className="group flex flex-1 flex-col items-center gap-2"><div className="relative w-full max-w-10 rounded-t-md bg-primary/85 transition-all duration-300 group-hover:bg-[#e1a329]" style={{ height: `${height}%` }}><span className="absolute -top-5 left-1/2 hidden -translate-x-1/2 text-[10px] font-bold text-primary group-hover:block">{Math.round(height * 3.1)}k</span></div><span className="font-mono text-[9px] text-muted-foreground">{['J','F','M','A','M','J','J','A','S','O','N','D'][i]}</span></div>)}</div></div></Card><Card className="p-5"><div className="flex items-center justify-between"><div><p className="text-sm font-bold">Priority queue</p><p className="mt-1 text-xs text-muted-foreground">What needs attention today</p></div><Link href="/skill-gaps" data-testid="button-view-all-priorities" className="text-xs font-semibold text-primary hover:underline">View all</Link></div><div className="mt-5 space-y-2">{priorityItems.map(item => <Link href={item.href} key={item.title} className="group flex gap-3 rounded-xl p-2 transition-colors hover:bg-muted"><div className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', item.tone === 'amber' ? 'bg-amber-100 text-amber-700' : item.tone === 'teal' ? 'bg-teal-100 text-teal-700' : 'bg-orange-100 text-orange-700')}><item.icon size={15} /></div><div className="min-w-0"><p className="text-xs font-semibold leading-5 text-foreground">{item.title}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{item.meta}</p></div><ChevronRight className="ml-auto mt-1 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-1" size={15} /></Link>)}</div></Card></div><Card className="mt-6 p-5"><div className="mb-5 flex items-center justify-between"><div><p className="text-sm font-bold">District pulse</p><p className="mt-1 text-xs text-muted-foreground">A quick read of demand, participation, and risk</p></div><Link href="/district-planning" data-testid="link-district-planning" className="flex items-center gap-1 text-xs font-semibold text-primary">Open planning <ChevronRight size={14} /></Link></div><div className="grid gap-5 md:grid-cols-5">{districtData.map(d => <Link href="/district-planning" key={d.name} className="rounded-xl p-1 transition-colors hover:bg-muted"><div className="mb-2 flex items-center justify-between"><span className="text-xs font-semibold text-foreground">{d.name}</span><span className="font-mono text-[10px] text-muted-foreground">{d.trend}</span></div><ProgressBar value={d.demand} color={d.color} /><div className="mt-2 flex justify-between text-[10px] text-muted-foreground"><span>{d.learners} learners</span><span className={d.gap > 30 ? 'font-semibold text-orange-700' : ''}>{d.gap}% gap</span></div></Link>)}</div></Card></>;
}

function LabourMarket() {
  const sectors = [{ name: 'Advanced manufacturing', posts: 68400, growth: 22, color: 'bg-[#2e8b78]' }, { name: 'Digital & IT services', posts: 57400, growth: 18, color: 'bg-[#e1a329]' }, { name: 'Healthcare services', posts: 42100, growth: 15, color: 'bg-[#4b7590]' }, { name: 'Logistics & mobility', posts: 31900, growth: 11, color: 'bg-[#e56d52]' }, { name: 'Renewable energy', posts: 18400, growth: 27, color: 'bg-[#6c6298]' }];
  return <><PageIntro eyebrow="Signal intelligence" title="Where the work is" description="A living view of employer demand, salary momentum, and emerging occupations across Maharashtra." action={<button type="button" data-testid="button-export-market" className="flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2.5 text-xs font-bold text-primary-foreground hover:brightness-110"><Download size={14} /> Export view</button>} /><div className="grid gap-4 sm:grid-cols-3"><StatCard label="Open positions" value="2,84,612" change="+12.8%" detail="vs. same period last year" icon={BriefcaseBusiness} /><StatCard label="Median monthly pay" value="₹27,450" change="+8.6%" detail="Across tracked roles" icon={TrendingUp} tone="amber" /><StatCard label="New occupations" value="36" change="+9" detail="First seen this quarter" icon={Sparkles} tone="teal" /></div><div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_.9fr]"><Card className="p-5"><div className="flex items-center justify-between"><div><p className="text-sm font-bold">Sector demand index</p><p className="mt-1 text-xs text-muted-foreground">Open positions · Q4 FY25</p></div><button type="button" data-testid="button-sector-filter" className="rounded-lg p-2 text-muted-foreground hover:bg-muted"><MoreHorizontal size={18} /></button></div><div className="mt-6 space-y-5">{sectors.map((sector, i) => <div key={sector.name}><div className="mb-2 flex items-center justify-between"><span className="text-xs font-semibold">{sector.name}</span><span className="font-mono text-[11px] text-muted-foreground">{sector.posts.toLocaleString('en-IN')} <span className="ml-2 font-sans font-semibold text-emerald-700">+{sector.growth}%</span></span></div><div className="flex items-center gap-3"><ProgressBar value={sector.growth * 3.35} color={sector.color} /><span className="w-8 text-right font-mono text-[10px] text-muted-foreground">0{i + 1}</span></div></div>)}</div></Card><Card className="overflow-hidden bg-[#173746] text-[#f4f0e5]"><div className="p-5"><p className="text-[10px] font-bold uppercase tracking-data text-[#e1a329]">Emerging now</p><p className="mt-2 text-xl font-bold">Battery systems are hiring faster than training can keep up.</p><p className="mt-3 text-xs leading-5 text-[#b9cbc8]">3,240 new postings in the last 90 days. Only 18% of mapped courses cover the required battery management skills.</p><div className="mt-7 flex items-end justify-between"><div><span className="display-font text-5xl font-bold text-[#e1a329]">3.2k</span><p className="mt-1 text-[10px] uppercase tracking-data text-[#b9cbc8]">new signals</p></div><div className="flex h-24 items-end gap-1.5">{[35, 42, 38, 52, 48, 66, 60, 78, 72, 94].map((h, i) => <span key={i} className="w-2 rounded-t-sm bg-[#e1a329]" style={{ height: `${h}%`, opacity: .38 + i * .06 }} />)}</div></div></div><div className="border-t border-white/10 px-5 py-4 text-xs text-[#b9cbc8]">Signal confidence <span className="float-right font-mono text-[#f4f0e5]">0.87 / high</span></div></Card></div><Card className="mt-6 overflow-hidden"><div className="border-b border-border p-5"><p className="text-sm font-bold">Occupation watchlist</p><p className="mt-1 text-xs text-muted-foreground">Roles with a sharp change in demand this quarter</p></div><div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left text-xs"><thead className="bg-muted/60 text-[10px] uppercase tracking-data text-muted-foreground"><tr><th className="px-5 py-3 font-bold">Occupation</th><th className="px-5 py-3 font-bold">Demand signal</th><th className="px-5 py-3 font-bold">Median pay</th><th className="px-5 py-3 font-bold">Districts</th><th className="px-5 py-3 font-bold">Confidence</th></tr></thead><tbody>{['Battery systems technician', 'Industrial IoT specialist', 'Solar design engineer', 'Clinical data coordinator'].map((job, i) => <tr key={job} className="border-t border-border hover:bg-muted/30"><td className="px-5 py-4 font-semibold">{job}</td><td className="px-5 py-4"><span className="flex items-center gap-1 font-semibold text-emerald-700"><ArrowUpRight size={13} /> +{[42, 38, 31, 24][i]}%</span></td><td className="px-5 py-4 font-mono text-muted-foreground">₹{['38,500', '46,200', '41,750', '32,800'][i]}</td><td className="px-5 py-4 text-muted-foreground">{['Pune · Nagpur', 'Pune · Thane', 'Nashik · Pune', 'Mumbai · Thane'][i]}</td><td className="px-5 py-4"><Badge tone={i < 2 ? 'green' : 'amber'}>{i < 2 ? 'High' : 'Medium'}</Badge></td></tr>)}</tbody></table></div></Card></>;
}

function SkillGaps() {
  const [selected, setSelected] = useState('All sectors');
  const gaps = [{ skill: 'Digital literacy & tools', demand: 88, supply: 53, gap: 35, learners: '42,800' }, { skill: 'Battery management systems', demand: 81, supply: 29, gap: 52, learners: '3,240' }, { skill: 'Industrial automation', demand: 76, supply: 48, gap: 28, learners: '18,650' }, { skill: 'Green construction', demand: 69, supply: 38, gap: 31, learners: '7,920' }, { skill: 'Healthcare data handling', demand: 64, supply: 45, gap: 19, learners: '9,410' }];
  return <><PageIntro eyebrow="Gap analysis" title="Close the distance." description="See where employer expectations and learner readiness diverge — then move from insight to intervention." /><div className="mb-6 flex flex-wrap gap-2">{['All sectors', 'Manufacturing', 'Digital', 'Healthcare', 'Green economy'].map(filter => <button type="button" key={filter} data-testid={`button-gap-filter-${filter.toLowerCase().replaceAll(' ', '-')}`} onClick={() => setSelected(filter)} className={cn('rounded-full border px-4 py-2 text-xs font-semibold transition-colors', selected === filter ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-muted-foreground hover:bg-muted')}>{filter}</button>)}</div><div className="grid gap-6 lg:grid-cols-[1.25fr_.75fr]"><Card className="p-5"><div className="mb-6 flex items-center justify-between"><div><p className="text-sm font-bold">Skills under pressure</p><p className="mt-1 text-xs text-muted-foreground">{selected} · demand vs. current supply</p></div><Badge tone="coral">5 critical gaps</Badge></div><div className="space-y-6">{gaps.map(item => <div key={item.skill}><div className="mb-2 flex justify-between gap-3"><span className="text-xs font-semibold">{item.skill}</span><span className="font-mono text-[10px] text-orange-700">{item.gap} pt gap</span></div><div className="relative"><div className="h-3 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-[#2e8b78]" style={{ width: `${item.supply}%` }} /></div><div className="absolute left-0 top-0 h-3 rounded-full border-r-2 border-[#173746]" style={{ width: `${item.demand}%` }} /><span className="absolute -top-5 text-[9px] text-muted-foreground" style={{ left: `${item.demand}%` }}>demand</span></div><div className="mt-2 flex justify-between text-[10px] text-muted-foreground"><span>{item.learners} learners affected</span><span>Supply {item.supply}%</span></div></div>)}</div></Card><Card className="bg-[#f1e8d1] p-5"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e1a329] text-[#173746]"><Lightbulb size={19} /></div><p className="mt-5 text-lg font-bold text-[#173746]">One decision to make</p><p className="mt-2 text-sm leading-6 text-[#41606a]">Battery systems are the widest gap with a high-confidence signal. A short bridge course in Pune and Nagpur could reach <strong className="text-[#173746]">3,240 learners</strong> this quarter.</p><button type="button" data-testid="button-create-intervention" className="mt-6 flex items-center gap-2 rounded-xl bg-[#173746] px-4 py-3 text-xs font-bold text-[#f4f0e5] hover:bg-[#234b5b]">Create intervention brief <ChevronRight size={14} /></button><div className="mt-8 border-t border-[#d8c9a7] pt-4"><p className="text-[10px] font-bold uppercase tracking-data text-[#7e704f]">Recommended first step</p><p className="mt-2 text-xs font-semibold text-[#173746]">Map existing EV technician courses to BMS competencies.</p></div></Card></div></>;
}

function DistrictPlanning() {
  const [selected, setSelected] = useState('Pune');
  const item = districtData.find(d => d.name === selected) ?? districtData[0];
  return <><PageIntro eyebrow="Place-based action" title="Plan by district." description="Every district has a different signal. Focus resources where the gap, momentum, and learner base meet." action={<button type="button" data-testid="button-export-plan" className="flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-bold hover:bg-muted"><Download size={14} /> Export district brief</button>} /><div className="mb-6 flex gap-2 overflow-x-auto pb-1">{districtData.map(d => <button type="button" key={d.name} data-testid={`button-district-${d.short}`} onClick={() => setSelected(d.name)} className={cn('shrink-0 rounded-xl border px-4 py-3 text-left transition-all', selected === d.name ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:bg-muted')}><span className="block text-xs font-bold">{d.name}</span><span className={cn('mt-1 block text-[10px]', selected === d.name ? 'text-primary-foreground/70' : 'text-muted-foreground')}>{d.learners} learners</span></button>)}</div><div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]"><Card className="bg-[#173746] p-6 text-[#f4f0e5]"><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-data text-[#e1a329]">District profile</p><p className="mt-2 text-3xl font-bold">{item.name}</p></div><div className="rounded-xl bg-white/10 p-2"><Map size={19} /></div></div><div className="mt-8 grid grid-cols-2 gap-6"><div><p className="text-[10px] uppercase tracking-data text-[#a9c0bd]">Demand index</p><p className="mt-1 font-mono text-3xl font-bold text-[#e1a329]">{item.demand}</p></div><div><p className="text-[10px] uppercase tracking-data text-[#a9c0bd]">Critical gap</p><p className="mt-1 font-mono text-3xl font-bold text-[#e56d52]">{item.gap}%</p></div></div><div className="mt-8 border-t border-white/10 pt-4"><p className="text-xs leading-5 text-[#bad0cd]">Demand is growing <strong className="text-white">{item.trend}</strong>. Priority sectors: automotive, digital services, logistics.</p></div></Card><Card className="p-5"><div className="flex items-center justify-between"><div><p className="text-sm font-bold">Recommended allocation</p><p className="mt-1 text-xs text-muted-foreground">An evidence-led starting point for {item.name}</p></div><Badge tone="amber">Draft plan</Badge></div><div className="mt-6 space-y-5">{[{ sector: 'Advanced manufacturing', allocation: 42, seats: '2,100 seats', color: 'bg-[#2e8b78]' }, { sector: 'Digital & IT services', allocation: 28, seats: '1,400 seats', color: 'bg-[#e1a329]' }, { sector: 'Logistics & mobility', allocation: 18, seats: '900 seats', color: 'bg-[#e56d52]' }, { sector: 'Other priority areas', allocation: 12, seats: '600 seats', color: 'bg-[#6c6298]' }].map(row => <div key={row.sector}><div className="mb-2 flex justify-between text-xs"><span className="font-semibold">{row.sector}</span><span className="font-mono text-muted-foreground">{row.seats} · {row.allocation}%</span></div><ProgressBar value={row.allocation * 2.1} color={row.color} /></div>)}</div><button type="button" data-testid="button-save-district-plan" className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-bold text-primary-foreground hover:brightness-110"><Check size={14} /> Save {item.name} plan</button></Card></div><Card className="mt-6 p-5"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700"><Bell size={17} /></div><div><p className="text-sm font-bold">Planning note</p><p className="text-xs text-muted-foreground">This plan uses local mock signals for the preview. Connect a data source in Settings before operational use.</p></div></div></Card></>;
}

function CourseAlignment() {
  const [showOnly, setShowOnly] = useState(false);
  const visible = showOnly ? courses.filter(c => c.status === 'Review') : courses;
  return <><PageIntro eyebrow="Action studio" title="Make courses earn their place." description="Compare what a course teaches with what employers are asking for, before the next batch begins." action={<button type="button" data-testid="button-new-course-review" onClick={() => setShowOnly(true)} className="flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2.5 text-xs font-bold text-primary-foreground hover:brightness-110"><BookOpen size={14} /> Start a review</button>} /><div className="mb-6 flex items-center justify-between rounded-2xl border border-border bg-card p-3.5"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100 text-teal-700"><Check size={16} /></div><div><p className="text-xs font-bold">68.4% portfolio alignment</p><p className="text-[11px] text-muted-foreground">Across 246 mapped courses</p></div></div><button type="button" data-testid="button-toggle-course-review" onClick={() => setShowOnly(!showOnly)} className={cn('rounded-lg border px-3 py-2 text-xs font-semibold', showOnly ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted')}>{showOnly ? 'Showing review queue' : 'Show review queue'}</button></div><div className="grid gap-4 md:grid-cols-2">{visible.map((course, i) => <Card key={course.name} className="p-5 transition-transform hover:-translate-y-0.5"><div className="flex items-start justify-between"><div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', i % 2 ? 'bg-amber-100 text-amber-700' : 'bg-teal-100 text-teal-700')}><BookOpen size={18} /></div><Badge tone={course.status === 'Aligned' ? 'green' : course.fit === 'Needs update' ? 'amber' : 'coral'}>{course.status}</Badge></div><p className="mt-5 text-sm font-bold">{course.name}</p><p className="mt-1 text-xs text-muted-foreground">{course.provider}</p><div className="mt-5 grid grid-cols-2 gap-4 border-y border-border py-4"><div><p className="text-[10px] uppercase tracking-data text-muted-foreground">Demand fit</p><p className="mt-1 font-mono text-xl font-bold text-foreground">{course.demand}<span className="text-xs text-muted-foreground">/100</span></p></div><div><p className="text-[10px] uppercase tracking-data text-muted-foreground">Seats / year</p><p className="mt-1 font-mono text-xl font-bold text-foreground">{course.seats.toLocaleString('en-IN')}</p></div></div><div className="mt-4 flex items-center justify-between"><span className="text-xs text-muted-foreground">{course.fit}</span><button type="button" data-testid={`button-review-course-${i}`} onClick={() => setShowOnly(course.status === 'Review')} className="flex items-center gap-1 text-xs font-bold text-primary hover:underline">Review course <ChevronRight size={14} /></button></div></Card>)}</div></>;
}

function CareerNavigator() {
  const [interest, setInterest] = useState('Technology & digital');
  const paths = [{ title: 'Industrial IoT technician', match: 92, pay: '₹34,000', time: '4–6 months', tag: 'High momentum' }, { title: 'Data operations associate', match: 86, pay: '₹28,500', time: '3–4 months', tag: 'Fast entry' }, { title: 'Solar PV design assistant', match: 78, pay: '₹31,200', time: '5–7 months', tag: 'Growing sector' }];
  return <><PageIntro eyebrow="For learners" title="Your next move, made clearer." description="Tell us what you are curious about. We will connect your interests to skills, courses, and real work in Maharashtra." /><div className="grid gap-6 lg:grid-cols-[.7fr_1.3fr]"><Card className="bg-[#173746] p-6 text-[#f4f0e5]"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e1a329] text-[#173746]"><Sparkles size={19} /></div><p className="mt-6 text-xl font-bold">Start with a signal, not a job title.</p><p className="mt-2 text-sm leading-6 text-[#b9cbc8]">Pick an area that catches your attention. The path can change as you learn.</p><label className="mt-8 block text-[10px] font-bold uppercase tracking-data text-[#b9cbc8]" htmlFor="interest">I am curious about</label><select id="interest" value={interest} onChange={e => setInterest(e.target.value)} data-testid="select-career-interest" className="mt-2 w-full rounded-xl border border-white/15 bg-white/10 px-3 py-3 text-sm text-white outline-none"><option className="text-[#173746]">Technology & digital</option><option className="text-[#173746]">Machines & making</option><option className="text-[#173746]">Climate & energy</option><option className="text-[#173746]">People & healthcare</option></select><div className="mt-7 flex items-center gap-2 text-xs text-[#b9cbc8]"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Personalised to Maharashtra demand</div></Card><div className="space-y-4">{paths.map((path, i) => <Card key={path.title} className="group p-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div className="flex gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 font-mono text-sm font-bold text-amber-700">0{i + 1}</div><div><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-bold">{path.title}</p><Badge tone={i === 0 ? 'green' : 'amber'}>{path.tag}</Badge></div><p className="mt-1 text-xs text-muted-foreground">Based on {interest.toLowerCase()} · {path.time} to entry</p></div></div><div className="flex items-center gap-5 sm:text-right"><div><p className="font-mono text-xl font-bold text-primary">{path.match}%</p><p className="text-[10px] text-muted-foreground">match</p></div><Link href="/course-alignment" data-testid={`button-explore-path-${i}`} className="rounded-xl border border-border p-2.5 text-muted-foreground group-hover:border-primary group-hover:text-primary"><ChevronRight size={17} /></Link></div></div><div className="mt-4 flex items-center gap-4 border-t border-border pt-3 text-[11px] text-muted-foreground"><Link href="/course-alignment" className="flex items-center gap-1 hover:text-primary"><BookOpen size={13} /> Recommended courses</Link><span className="flex items-center gap-1"><BriefcaseBusiness size={13} /> Median {path.pay}</span><span className="hidden items-center gap-1 sm:flex"><Map size={13} /> Pune · Thane · Nagpur</span></div></Card>)}</div></div></>;
}

function EmployerDemand() {
  const [saved, setSaved] = useState(false);
  return <><PageIntro eyebrow="For employers" title="Name the skills you need." description="Translate your growth plans into a practical talent signal that institutes and policymakers can act on." action={<button type="button" data-testid="button-post-demand" onClick={() => setSaved(true)} className="flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2.5 text-xs font-bold text-primary-foreground hover:brightness-110"><Zap size={14} /> Share a demand signal</button>} />{saved && <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800"><Check size={16} /> Thanks — your local demand signal has been added to this preview workspace. <button type="button" data-testid="button-dismiss-demand-success" onClick={() => setSaved(false)} className="ml-auto"><X size={15} /></button></div>}<div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]"><Card className="p-6"><p className="text-sm font-bold">Your sector pulse</p><p className="mt-1 text-xs text-muted-foreground">What peers are hiring for right now</p><div className="mt-7 space-y-5">{[{ label: 'Automation & controls', value: 82 }, { label: 'Data engineering', value: 68 }, { label: 'EV service', value: 61 }, { label: 'Quality systems', value: 54 }].map(row => <div key={row.label}><div className="mb-2 flex justify-between text-xs"><span className="font-semibold">{row.label}</span><span className="font-mono text-muted-foreground">{row.value}/100</span></div><ProgressBar value={row.value} color={row.value > 75 ? 'bg-[#e1a329]' : 'bg-[#2e8b78]'} /></div>)}</div><div className="mt-8 rounded-xl bg-muted p-4"><p className="text-[10px] font-bold uppercase tracking-data text-muted-foreground">Market note</p><p className="mt-2 text-xs leading-5">Employers in Pune are asking for cross-functional talent — technical confidence plus communication.</p></div></Card><Card className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-bold">Demand signals from peers</p><p className="mt-1 text-xs text-muted-foreground">Anonymised, aggregated employer input</p></div><Badge tone="teal">This quarter</Badge></div><div className="mt-6 space-y-1">{[{ company: 'Large automotive supplier', need: 'Industrial automation', hires: '120–180 hires', location: 'Pune' }, { company: 'Clean energy scale-up', need: 'Solar PV + BMS', hires: '40–60 hires', location: 'Nashik' }, { company: 'Digital services firm', need: 'Data operations', hires: '80–120 hires', location: 'Thane' }].map((row, i) => <div key={row.company} className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-muted"><div className={cn('flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold text-white', ['bg-[#2e8b78]', 'bg-[#e56d52]', 'bg-[#6c6298]'][i])}>{row.company.charAt(0)}</div><div className="min-w-0 flex-1"><p className="text-xs font-bold">{row.need}</p><p className="mt-1 text-[11px] text-muted-foreground">{row.company} · {row.location}</p></div><div className="text-right"><p className="font-mono text-[11px] font-bold">{row.hires}</p><p className="mt-1 text-[10px] text-muted-foreground">planned</p></div></div>)}</div></Card></div></>;
}

function Reports() {
  const reportRows = [{ report: 'Maharashtra Skills Outlook', type: 'Briefing', updated: '18 Dec 2024', status: 'Ready' }, { report: 'District gap — Pune', type: 'District brief', updated: '14 Dec 2024', status: 'Ready' }, { report: 'Course alignment portfolio', type: 'Data export', updated: '02 Dec 2024', status: 'Ready' }];
  const download = (format: 'json' | 'csv') => { const payload = format === 'json' ? JSON.stringify({ generatedAt: new Date().toISOString(), scope: 'Maharashtra', activeSignals: 284612, courseAlignment: 68.4, criticalGaps: 47 }, null, 2) : 'report,scope,active_signals,course_alignment,critical_gaps\nMaharashtra Skills Snapshot,Maharashtra,284612,68.4%,47'; const blob = new Blob([payload], { type: format === 'json' ? 'application/json' : 'text/csv' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `skillsync-maharashtra-snapshot.${format}`; link.click(); URL.revokeObjectURL(link.href); };
  return <><PageIntro eyebrow="Evidence library" title="Reports worth sharing." description="Download clean snapshots for a review meeting, a district planning session, or your next policy brief." action={<div className="flex gap-2"><button type="button" data-testid="button-download-json" onClick={() => download('json')} className="flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-bold hover:bg-muted"><Download size={14} /> JSON</button><button type="button" data-testid="button-download-csv" onClick={() => download('csv')} className="flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2.5 text-xs font-bold text-primary-foreground hover:brightness-110"><Download size={14} /> CSV snapshot</button></div>} /><Card className="overflow-hidden"><div className="border-b border-border bg-muted/40 p-5"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground"><FileBarChart size={19} /></div><div><p className="text-sm font-bold">Local preview exports</p><p className="mt-1 text-xs text-muted-foreground">Files are generated in your browser from this workspace&apos;s mock data.</p></div></div></div><div className="divide-y divide-border">{reportRows.map((row, i) => <div key={row.report} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-primary"><FileBarChart size={16} /></div><div className="flex-1"><p className="text-xs font-bold">{row.report}</p><p className="mt-1 text-[11px] text-muted-foreground">{row.type} · Updated {row.updated}</p></div><Badge tone="green"><Check size={11} /> {row.status}</Badge><button type="button" data-testid={`button-download-report-${i}`} onClick={() => download(i === 2 ? 'csv' : 'json')} className="flex items-center gap-1 text-xs font-bold text-primary hover:underline">Download <Download size={13} /></button></div>)}</div></Card><div className="mt-6 grid gap-4 sm:grid-cols-3"><Card className="p-5"><p className="font-mono text-2xl font-bold text-primary">18</p><p className="mt-2 text-xs font-semibold">District briefs</p><p className="mt-1 text-[11px] text-muted-foreground">Ready to export</p></Card><Card className="p-5"><p className="font-mono text-2xl font-bold text-[#2e8b78]">246</p><p className="mt-2 text-xs font-semibold">Courses mapped</p><p className="mt-1 text-[11px] text-muted-foreground">Across 18 sectors</p></Card><Card className="p-5"><p className="font-mono text-2xl font-bold text-[#e56d52]">Q4</p><p className="mt-2 text-xs font-semibold">Latest data cut</p><p className="mt-1 text-[11px] text-muted-foreground">December 2024</p></Card></div></>;
}

function SettingsPage({ role, setRole }: { role: Role; setRole: (role: Role) => void }) {
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState(true);
  return <><PageIntro eyebrow="Workspace controls" title="Settings" description="Keep your preview workspace honest, focused, and ready for handoff." /><div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]"><Card className="p-5 sm:p-6"><div className="border-b border-border pb-5"><p className="text-sm font-bold">Workspace profile</p><p className="mt-1 text-xs text-muted-foreground">This is how your decision room is configured locally.</p></div><label className="mt-5 block text-xs font-semibold" htmlFor="workspace-name">Workspace name<input id="workspace-name" data-testid="input-workspace-name" defaultValue="Maharashtra Skills Decision Room" className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none ring-primary/30 focus:ring-2" /></label><label className="mt-4 block text-xs font-semibold" htmlFor="workspace-role">Working perspective<select id="workspace-role" value={role} onChange={e => setRole(e.target.value as Role)} data-testid="select-workspace-role" className="mt-2 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none ring-primary/30 focus:ring-2">{roles.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}</select></label><button type="button" data-testid="button-save-settings" onClick={() => setSaved(true)} className="mt-6 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:brightness-110">{saved ? 'Saved locally' : 'Save changes'}</button></Card><Card className="border-amber-200 bg-amber-50/60 p-5 sm:p-6"><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700"><ShieldCheck size={19} /></div><div><p className="text-sm font-bold text-amber-900">Data connection not configured</p><p className="mt-2 text-xs leading-5 text-amber-800/80">Supabase credentials were not included with this preview. SkillSync is running on local in-memory data and does not have authentication or persistence enabled.</p></div></div><div className="mt-6 border-t border-amber-200 pt-4"><p className="text-[10px] font-bold uppercase tracking-data text-amber-800/60">Connection status</p><div className="mt-3 flex items-center gap-2 text-xs font-semibold text-amber-900"><span className="h-2 w-2 rounded-full bg-amber-500" /> Awaiting credentials</div><p className="mt-3 text-[11px] leading-5 text-amber-800/70">To connect a live workspace, provide the project URL and anon key to the deployment owner. No credentials are requested or stored here.</p></div></Card></div><Card className="mt-6 p-5"><div className="flex items-center justify-between gap-4"><div><p className="text-sm font-bold">Workspace notifications</p><p className="mt-1 text-xs text-muted-foreground">Show local alerts for new signals and planning reminders.</p></div><button type="button" role="switch" aria-checked={notifications} data-testid="button-toggle-notifications" onClick={() => setNotifications(!notifications)} className={cn('relative h-6 w-11 rounded-full transition-colors', notifications ? 'bg-primary' : 'bg-muted')}><span className={cn('absolute top-1 h-4 w-4 rounded-full bg-white transition-transform', notifications ? 'left-6' : 'left-1')} /></button></div></Card></>;
}

function NotFound() {
  return <div className="flex min-h-[70vh] flex-col items-center justify-center text-center"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700"><Search size={24} /></div><h1 className="mt-5 text-2xl font-bold">That room is not on the map.</h1><p className="mt-2 text-sm text-muted-foreground">The page you requested does not exist in this preview.</p><Link href="/dashboard" className="mt-6 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground" data-testid="link-return-dashboard">Return to overview</Link></div>;
}

function Workspace({ role, setRole }: { role: Role; setRole: (role: Role) => void }) {
  const [location] = useLocation();
  const page = useMemo(() => {
    switch (location) {
      case '/dashboard': return <Dashboard role={role} />;
      case '/labour-market': return <LabourMarket />;
      case '/skill-gaps': return <SkillGaps />;
      case '/district-planning': return <DistrictPlanning />;
      case '/course-alignment': return <CourseAlignment />;
      case '/career-navigator': return <CareerNavigator />;
      case '/employer-demand': return <EmployerDemand />;
      case '/reports': return <Reports />;
      case '/settings': return <SettingsPage role={role} setRole={setRole} />;
      default: return <NotFound />;
    }
  }, [location, role, setRole]);
  return <Shell role={role} setRole={setRole}>{page}</Shell>;
}

function App() {
  const [location, setLocation] = useLocation();
  const [role, setRoleState] = useState<Role>(() => (localStorage.getItem('skillsync-role') as Role) || 'government');
  const isWelcome = location === '/';
  const setRole = (nextRole: Role) => { setRoleState(nextRole); localStorage.setItem('skillsync-role', nextRole); };
  if (isWelcome) return <Welcome onSelect={nextRole => { setRole(nextRole); setLocation('/dashboard'); }} />;
  return <QueryClientProvider client={queryClient}><TooltipProvider><ErrorBoundary resetKey={location}><Workspace role={role} setRole={setRole} /></ErrorBoundary><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;