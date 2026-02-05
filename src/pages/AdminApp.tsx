import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
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
} from "@/lib/backend-api";
import { Loader2, LogOut, RefreshCcw, Plus } from "lucide-react";

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

  useEffect(() => {
    if (!token) {
      navigate("/admin-app/login");
      return;
    }
    loadRooms();
    loadBookings();
    loadAccounts();
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 px-4 py-10">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold">ERP Admin</h1>
              <p className="text-muted-foreground mt-1">
                Signed in as {user?.email || "admin"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { loadRooms(); loadBookings(); loadAccounts(); }}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
              <Button variant="destructive" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>

          <Tabs defaultValue="rooms">
            <TabsList>
              <TabsTrigger value="rooms">Rooms</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>

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
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminApp;
