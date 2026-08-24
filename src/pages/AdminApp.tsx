import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchAdminBookings,
  fetchAdminRooms,
  createAdminRoom,
  updateAdminRoom,
  deleteAdminRoom,
  fetchPaymentAccounts,
  createPaymentAccount,
  updatePaymentAccount,
  deletePaymentAccount,
  updateBookingStatus,
  updatePaymentProof,
  fetchStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  fetchReportSummary,
} from "@/lib/backend-api";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  BedDouble,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  Users,
  WalletCards,
  X,
} from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

type Room = {
  id: number;
  name: string;
  room_type: string;
  price: number;
  capacity: number;
  amenities?: string | null;
  image_url?: string | null;
  is_available: boolean;
};

type Booking = {
  id: number;
  name: string;
  email: string;
  room_type: string;
  check_in: string;
  check_out: string;
  created_at: string;
  status: string;
  payment_status: string;
  payment_proof?: string | null;
};

type PaymentAccount = {
  id: number;
  label: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  instructions?: string | null;
};

type Staff = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  address?: string | null;
  shift?: string | null;
  account_details?: string | null;
  status: string;
};

const AdminApp = () => {
  const { toast } = useToast();
  const { token, user, signOut } = useAuth();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [report, setReport] = useState<any>(null);

  const [roomForm, setRoomForm] = useState({
    name: "",
    room_type: "",
    price: "",
    capacity: "",
    amenities: "",
    image_url: "",
    is_available: true,
  });

  const [accountForm, setAccountForm] = useState({
    label: "",
    bank_name: "",
    account_name: "",
    account_number: "",
    instructions: "",
  });

  const [staffForm, setStaffForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Manager",
    address: "",
    shift: "",
    account_details: "",
    status: "active",
  });

  const [staff, setStaff] = useState<Staff[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin-app/login");
  };

  const loadRooms = async () => {
    if (!token) return;
    setLoadingRooms(true);
    try {
      const data = await fetchAdminRooms(token);
      setRooms(data as Room[]);
    } catch (error) {
      toast({
        title: "Failed to load rooms",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoadingRooms(false);
    }
  };

  const loadBookings = async () => {
    if (!token) return;
    setLoadingBookings(true);
    try {
      const data = await fetchAdminBookings(token);
      setBookings(data as Booking[]);
    } catch (error) {
      toast({
        title: "Failed to load bookings",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoadingBookings(false);
    }
  };

  const loadAccounts = async () => {
    if (!token) return;
    setLoadingAccounts(true);
    try {
      const data = await fetchPaymentAccounts(token);
      setAccounts(data as PaymentAccount[]);
    } catch (error) {
      toast({
        title: "Failed to load accounts",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoadingAccounts(false);
    }
  };

  const loadStaff = async () => {
    if (!token) return;
    setLoadingStaff(true);
    try {
      const data = await fetchStaff(token);
      setStaff(data as Staff[]);
    } catch (error) {
      toast({
        title: "Failed to load staff",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoadingStaff(false);
    }
  };

  const loadReport = async () => {
    if (!token) return;
    try {
      const data = await fetchReportSummary(token);
      setReport(data);
    } catch (error) {
      toast({
        title: "Failed to load reports",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/admin-app/login");
      return;
    }
    loadRooms();
    loadBookings();
    loadAccounts();
    loadStaff();
    loadReport();
    // Load the workspace once whenever the authenticated session changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, navigate]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await createAdminRoom(token, {
        name: roomForm.name,
        room_type: roomForm.room_type,
        price: Number(roomForm.price),
        capacity: Number(roomForm.capacity),
        amenities: roomForm.amenities || null,
        image_url: roomForm.image_url || null,
        is_available: roomForm.is_available,
      });
      toast({ title: "Room created" });
      setRoomForm({
        name: "",
        room_type: "",
        price: "",
        capacity: "",
        amenities: "",
        image_url: "",
        is_available: true,
      });
      loadRooms();
    } catch (error) {
      toast({
        title: "Room creation failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRoom = async (id: number) => {
    if (!token) return;
    try {
      await deleteAdminRoom(token, id);
      toast({ title: "Room deleted" });
      loadRooms();
    } catch (error) {
      toast({
        title: "Room deletion failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await createPaymentAccount(token, {
        label: accountForm.label,
        bank_name: accountForm.bank_name,
        account_name: accountForm.account_name,
        account_number: accountForm.account_number,
        instructions: accountForm.instructions || null,
      });
      toast({ title: "Account created" });
      setAccountForm({
        label: "",
        bank_name: "",
        account_name: "",
        account_number: "",
        instructions: "",
      });
      loadAccounts();
    } catch (error) {
      toast({
        title: "Account creation failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      await createStaff(token, {
        name: staffForm.name,
        email: staffForm.email,
        phone: staffForm.phone,
        role: staffForm.role,
        address: staffForm.address || null,
        shift: staffForm.shift || null,
        account_details: staffForm.account_details || null,
        status: staffForm.status,
      });
      toast({ title: "Staff created" });
      setStaffForm({
        name: "",
        email: "",
        phone: "",
        role: "Manager",
        address: "",
        shift: "",
        account_details: "",
        status: "active",
      });
      loadStaff();
    } catch (error) {
      toast({
        title: "Staff creation failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleDeleteStaff = async (id: number) => {
    if (!token) return;
    try {
      await deleteStaff(token, id);
      toast({ title: "Staff deleted" });
      loadStaff();
    } catch (error) {
      toast({
        title: "Staff deletion failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async (id: number) => {
    if (!token) return;
    try {
      await deletePaymentAccount(token, id);
      toast({ title: "Account deleted" });
      loadAccounts();
    } catch (error) {
      toast({
        title: "Account deletion failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (bookingId: number, status: string) => {
    if (!token) return;
    try {
      await updateBookingStatus(token, bookingId, status);
      toast({ title: "Booking status updated" });
      loadBookings();
    } catch (error) {
      toast({
        title: "Status update failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handlePaymentStatusChange = async (bookingId: number, status: string) => {
    if (!token) return;
    try {
      await updateBookingStatus(token, bookingId, "pending", status);
      toast({ title: "Payment status updated" });
      loadBookings();
    } catch (error) {
      toast({
        title: "Payment update failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handlePaymentProof = async (bookingId: number, proof: string) => {
    if (!token) return;
    try {
      await updatePaymentProof(token, bookingId, proof);
      toast({ title: "Payment proof saved" });
      loadBookings();
    } catch (error) {
      toast({
        title: "Payment proof failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const downloadReport = async (path: string, filename: string) => {
    if (!token) return;
    try {
      const response = await fetch(`${BACKEND_URL}${path}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Export failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const navigation = [
    { value: "dashboard", label: "Overview", icon: LayoutDashboard },
    { value: "bookings", label: "Bookings", icon: ClipboardList },
    { value: "rooms", label: "Rooms", icon: BedDouble },
    { value: "payments", label: "Payments", icon: WalletCards },
    { value: "staff", label: "Staff", icon: Users },
    { value: "reports", label: "Reports", icon: BarChart3 },
  ];

  const pendingBookings = bookings.filter((booking) => booking.status === "pending").length;
  const paidBookings = bookings.filter((booking) => booking.payment_status === "paid").length;
  const availableRooms = rooms.filter((room) => room.is_available).length;

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-slate-900">
      <div className="flex min-h-screen">
        <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-[#102a43] text-white shadow-xl transition-transform duration-200 lg:static lg:translate-x-0 ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-6">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e4b35c] text-[#102a43]"><ShieldCheck className="h-5 w-5" /></div>
                <div><p className="text-sm font-semibold tracking-[0.18em] text-[#e4b35c]">ROOMBOOKER</p><p className="text-xs text-white/55">Operations console</p></div>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 lg:hidden" onClick={() => setMobileNavOpen(false)}><X className="h-5 w-5" /></Button>
          </div>
          <div className="px-5 pt-7"><p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">Workspace</p>
            <nav className="space-y-1">
              {navigation.map(({ value, label, icon: Icon }) => (
                <button key={value} onClick={() => { setActiveTab(value); setMobileNavOpen(false); }} className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition-colors ${activeTab === value ? "bg-[#e4b35c] font-semibold text-[#102a43]" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
                  <Icon className="h-4 w-4" />{label}
                </button>
              ))}
            </nav>
          </div>
          <div className="mt-auto border-t border-white/10 p-5">
            <div className="mb-4 rounded-lg bg-white/5 p-3"><p className="truncate text-sm font-medium">{user?.email || "Administrator"}</p><p className="mt-1 text-xs text-white/45">Full access</p></div>
            <button onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-white/65 hover:bg-white/10 hover:text-white"><LogOut className="h-4 w-4" />Sign out</button>
          </div>
        </aside>
        {mobileNavOpen && <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" onClick={() => setMobileNavOpen(false)} />}
        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-8">
            <div className="flex items-center gap-3"><Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileNavOpen(true)}><Menu className="h-5 w-5" /></Button><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#c18a2d]">Hotel operations</p><h1 className="text-xl font-semibold tracking-tight md:text-2xl">{navigation.find((item) => item.value === activeTab)?.label}</h1></div></div>
            <div className="flex items-center gap-2 md:gap-4"><div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 md:flex"><Search className="h-4 w-4" />Search workspace</div><Button variant="ghost" size="icon" className="text-slate-500"><Activity className="h-5 w-5" /></Button><Button variant="outline" size="sm" onClick={() => { loadRooms(); loadBookings(); loadAccounts(); loadStaff(); loadReport(); }}><RefreshCcw className="mr-2 h-4 w-4" />Refresh</Button></div>
          </header>
          <div className="mx-auto max-w-[1500px] space-y-8 px-4 py-7 md:px-8 md:py-9">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="hidden"><TabsTrigger value="dashboard">Overview</TabsTrigger><TabsTrigger value="rooms">Rooms</TabsTrigger><TabsTrigger value="bookings">Bookings</TabsTrigger><TabsTrigger value="payments">Payments</TabsTrigger><TabsTrigger value="staff">Staff</TabsTrigger><TabsTrigger value="reports">Reports</TabsTrigger></TabsList>

            <TabsContent value="dashboard" className="mt-0 space-y-8">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end"><div><h2 className="text-3xl font-semibold tracking-tight text-slate-900">Good to see you.</h2><p className="mt-1 text-sm text-slate-500">Here is the pulse of your property today.</p></div><div className="flex items-center gap-2 text-sm text-slate-500"><span className="h-2 w-2 rounded-full bg-emerald-500" />System operational</div></div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[{ label: "Total bookings", value: bookings.length, note: `${pendingBookings} awaiting action`, icon: ClipboardList, tone: "bg-blue-50 text-blue-700" }, { label: "Available rooms", value: availableRooms, note: `${rooms.length} rooms configured`, icon: BedDouble, tone: "bg-emerald-50 text-emerald-700" }, { label: "Payments received", value: paidBookings, note: `${bookings.length ? Math.round((paidBookings / bookings.length) * 100) : 0}% of bookings`, icon: WalletCards, tone: "bg-amber-50 text-amber-700" }, { label: "Team members", value: staff.length, note: "Active staff records", icon: Users, tone: "bg-violet-50 text-violet-700" }].map(({ label, value, note, icon: Icon, tone }) => <div key={label} className="border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-sm text-slate-500">{label}</p><p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p></div><div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tone}`}><Icon className="h-5 w-5" /></div></div><p className="mt-4 text-xs text-slate-400">{note}</p></div>)}
              </div>
              <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
                <div className="border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h3 className="font-semibold">Recent bookings</h3><p className="mt-1 text-xs text-slate-400">Latest reservations entering your property</p></div><button onClick={() => setActiveTab("bookings")} className="flex items-center gap-1 text-sm font-medium text-[#b77b1f] hover:text-[#8e5e11]">View all <ArrowUpRight className="h-4 w-4" /></button></div>{bookings.length === 0 ? <div className="px-5 py-12 text-center text-sm text-slate-400">No bookings yet.</div> : <div className="divide-y divide-slate-100">{bookings.slice(0, 5).map((booking) => <div key={booking.id} className="flex items-center justify-between gap-4 px-5 py-4"><div className="flex min-w-0 items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">{booking.name.slice(0, 2).toUpperCase()}</div><div className="min-w-0"><p className="truncate text-sm font-medium">{booking.name}</p><p className="truncate text-xs text-slate-400">{booking.room_type} · {booking.check_in}</p></div></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${booking.status === "confirmed" ? "bg-emerald-50 text-emerald-700" : booking.status === "cancelled" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{booking.status}</span></div>)}</div>}</div>
                <div className="border border-slate-200 bg-[#102a43] p-6 text-white shadow-sm"><div className="flex items-center gap-2 text-[#e4b35c]"><CalendarDays className="h-5 w-5" /><span className="text-xs font-semibold uppercase tracking-[0.16em]">Today at a glance</span></div><p className="mt-8 text-5xl font-semibold">{pendingBookings}</p><p className="mt-2 text-sm text-white/60">bookings need your attention</p><div className="mt-8 space-y-3 border-t border-white/10 pt-5 text-sm"><div className="flex justify-between"><span className="text-white/55">Room availability</span><span>{rooms.length ? Math.round((availableRooms / rooms.length) * 100) : 0}%</span></div><progress className="h-1.5 w-full overflow-hidden rounded-full bg-white/10 accent-[#e4b35c]" value={availableRooms} max={rooms.length || 1} aria-label="Room availability" /></div><button onClick={() => setActiveTab("bookings")} className="mt-8 flex items-center gap-2 text-sm font-medium text-[#e4b35c]">Open booking queue <ArrowUpRight className="h-4 w-4" /></button></div>
              </div>
            </TabsContent>

            <TabsContent value="rooms" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Rooms</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleCreateRoom} className="grid gap-3 md:grid-cols-3">
                    <div>
                      <Label>Name</Label>
                      <Input value={roomForm.name} onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })} />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <Input value={roomForm.room_type} onChange={(e) => setRoomForm({ ...roomForm, room_type: e.target.value })} />
                    </div>
                    <div>
                      <Label>Price</Label>
                      <Input value={roomForm.price} onChange={(e) => setRoomForm({ ...roomForm, price: e.target.value })} />
                    </div>
                    <div>
                      <Label>Capacity</Label>
                      <Input value={roomForm.capacity} onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })} />
                    </div>
                    <div>
                      <Label>Amenities</Label>
                      <Input value={roomForm.amenities} onChange={(e) => setRoomForm({ ...roomForm, amenities: e.target.value })} />
                    </div>
                    <div>
                      <Label>Image URL</Label>
                      <Input value={roomForm.image_url} onChange={(e) => setRoomForm({ ...roomForm, image_url: e.target.value })} />
                    </div>
                    <div className="md:col-span-3">
                      <Button type="submit">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Room
                      </Button>
                    </div>
                  </form>

                  {loadingRooms ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading rooms...
                    </div>
                  ) : rooms.length === 0 ? (
                    <p className="text-muted-foreground">No rooms yet.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Capacity</TableHead>
                          <TableHead>Available</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rooms.map((room) => (
                          <TableRow key={room.id}>
                            <TableCell>{room.id}</TableCell>
                            <TableCell>{room.name}</TableCell>
                            <TableCell>{room.room_type}</TableCell>
                            <TableCell>{room.price}</TableCell>
                            <TableCell>{room.capacity}</TableCell>
                            <TableCell>{room.is_available ? "Yes" : "No"}</TableCell>
                            <TableCell>
                              <Button variant="destructive" size="sm" onClick={() => handleDeleteRoom(room.id)}>
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bookings" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingBookings ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading bookings...
                    </div>
                  ) : bookings.length === 0 ? (
                    <p className="text-muted-foreground">No bookings yet.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Guest</TableHead>
                          <TableHead>Room Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Payment</TableHead>
                          <TableHead>Proof</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell>{booking.id}</TableCell>
                            <TableCell>{booking.name}</TableCell>
                            <TableCell>{booking.room_type}</TableCell>
                            <TableCell>
                              <Input
                                value={booking.status}
                                onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={booking.payment_status}
                                onChange={(e) => handlePaymentStatusChange(booking.id, e.target.value)}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                placeholder="Paste proof URL/base64"
                                defaultValue={booking.payment_proof || ""}
                                onBlur={(e) => handlePaymentProof(booking.id, e.target.value)}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Accounts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleCreateAccount} className="grid gap-3 md:grid-cols-3">
                    <div>
                      <Label>Label</Label>
                      <Input value={accountForm.label} onChange={(e) => setAccountForm({ ...accountForm, label: e.target.value })} />
                    </div>
                    <div>
                      <Label>Bank</Label>
                      <Input value={accountForm.bank_name} onChange={(e) => setAccountForm({ ...accountForm, bank_name: e.target.value })} />
                    </div>
                    <div>
                      <Label>Account Name</Label>
                      <Input value={accountForm.account_name} onChange={(e) => setAccountForm({ ...accountForm, account_name: e.target.value })} />
                    </div>
                    <div>
                      <Label>Account Number</Label>
                      <Input value={accountForm.account_number} onChange={(e) => setAccountForm({ ...accountForm, account_number: e.target.value })} />
                    </div>
                    <div className="md:col-span-3">
                      <Label>Instructions</Label>
                      <Input value={accountForm.instructions} onChange={(e) => setAccountForm({ ...accountForm, instructions: e.target.value })} />
                    </div>
                    <div className="md:col-span-3">
                      <Button type="submit">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Account
                      </Button>
                    </div>
                  </form>

                  {loadingAccounts ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading accounts...
                    </div>
                  ) : accounts.length === 0 ? (
                    <p className="text-muted-foreground">No accounts yet.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Label</TableHead>
                          <TableHead>Bank</TableHead>
                          <TableHead>Account Name</TableHead>
                          <TableHead>Account Number</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {accounts.map((account) => (
                          <TableRow key={account.id}>
                            <TableCell>{account.id}</TableCell>
                            <TableCell>{account.label}</TableCell>
                            <TableCell>{account.bank_name}</TableCell>
                            <TableCell>{account.account_name}</TableCell>
                            <TableCell>{account.account_number}</TableCell>
                            <TableCell>
                              <Button variant="destructive" size="sm" onClick={() => handleDeleteAccount(account.id)}>
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="staff" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Staff Accounts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form onSubmit={handleCreateStaff} className="grid gap-3 md:grid-cols-3">
                    <div>
                      <Label>Name</Label>
                      <Input value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input value={staffForm.email} onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input value={staffForm.phone} onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })} />
                    </div>
                    <div>
                      <Label>Role</Label>
                      <Input value={staffForm.role} onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })} />
                    </div>
                    <div>
                      <Label>Address</Label>
                      <Input value={staffForm.address} onChange={(e) => setStaffForm({ ...staffForm, address: e.target.value })} />
                    </div>
                    <div>
                      <Label>Shift</Label>
                      <Input value={staffForm.shift} onChange={(e) => setStaffForm({ ...staffForm, shift: e.target.value })} />
                    </div>
                    <div className="md:col-span-3">
                      <Label>Account Details</Label>
                      <Input value={staffForm.account_details} onChange={(e) => setStaffForm({ ...staffForm, account_details: e.target.value })} />
                    </div>
                    <div>
                      <Label>Status</Label>
                      <Input value={staffForm.status} onChange={(e) => setStaffForm({ ...staffForm, status: e.target.value })} />
                    </div>
                    <div className="md:col-span-3">
                      <Button type="submit">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Staff
                      </Button>
                    </div>
                  </form>

                  {loadingStaff ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading staff...
                    </div>
                  ) : staff.length === 0 ? (
                    <p className="text-muted-foreground">No staff yet.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {staff.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell>{member.id}</TableCell>
                            <TableCell>{member.name}</TableCell>
                            <TableCell>{member.email}</TableCell>
                            <TableCell>{member.role}</TableCell>
                            <TableCell>{member.status}</TableCell>
                            <TableCell>
                              <Button variant="destructive" size="sm" onClick={() => handleDeleteStaff(member.id)}>
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Reports</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!report ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading reports...
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-3">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Total Bookings</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-semibold">{report.total_bookings}</CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Occupancy Rate</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-semibold">
                          {(report.occupancy_rate * 100).toFixed(1)}%
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Estimated Revenue</CardTitle>
                        </CardHeader>
                        <CardContent className="text-2xl font-semibold">{report.estimated_revenue}</CardContent>
                      </Card>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => downloadReport("/api/admin/reports/bookings.csv", "bookings.csv")}>
                      Export Bookings CSV
                    </Button>
                    <Button variant="outline" onClick={() => downloadReport("/api/admin/reports/bookings.xlsx", "bookings.xlsx")}>
                      Export Bookings Excel
                    </Button>
                    <Button variant="outline" onClick={() => downloadReport("/api/admin/reports/staff.csv", "staff.csv")}>
                      Export Staff CSV
                    </Button>
                    <Button variant="outline" onClick={() => downloadReport("/api/admin/reports/staff.xlsx", "staff.xlsx")}>
                      Export Staff Excel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      </div>
    </div>
  );
};

export default AdminApp;
