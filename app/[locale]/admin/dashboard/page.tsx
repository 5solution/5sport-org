'use client';

import {
  DollarSign,
  Users,
  Calendar,
  Megaphone,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  CreditCard,
  UserPlus,
  Eye,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// --- Mock Data ---

const kpiCards = [
  {
    title: 'Tổng doanh thu',
    value: '248.500.000 ₫',
    change: '+12.5%',
    trend: 'up' as const,
    icon: DollarSign,
    description: 'so với tháng trước',
  },
  {
    title: 'Đơn hàng',
    value: '1.284',
    change: '+8.2%',
    trend: 'up' as const,
    icon: ShoppingCart,
    description: 'so với tháng trước',
  },
  {
    title: 'Người dùng',
    value: '3.842',
    change: '+23.1%',
    trend: 'up' as const,
    icon: Users,
    description: 'so với tháng trước',
  },
  {
    title: 'Tỷ lệ thanh toán',
    value: '78.4%',
    change: '-2.1%',
    trend: 'down' as const,
    icon: CreditCard,
    description: 'so với tháng trước',
  },
];

const revenueByMonth = [
  { month: 'T1', value: 42_000_000 },
  { month: 'T2', value: 58_000_000 },
  { month: 'T3', value: 35_000_000 },
  { month: 'T4', value: 72_000_000 },
  { month: 'T5', value: 95_000_000 },
  { month: 'T6', value: 88_000_000 },
  { month: 'T7', value: 110_000_000 },
  { month: 'T8', value: 125_000_000 },
  { month: 'T9', value: 140_000_000 },
  { month: 'T10', value: 168_000_000 },
  { month: 'T11', value: 195_000_000 },
  { month: 'T12', value: 248_500_000 },
];

const activeCampaigns = [
  { name: 'Marathon Đà Nẵng 2026', status: 'ACTIVE', orders: 342, revenue: 85_000_000, endDate: '2026-04-15' },
  { name: 'Trail Running Sapa', status: 'ACTIVE', orders: 189, revenue: 47_000_000, endDate: '2026-05-01' },
  { name: 'Fun Run TP.HCM', status: 'ACTIVE', orders: 521, revenue: 62_000_000, endDate: '2026-03-30' },
  { name: 'Night Run Hà Nội', status: 'DRAFT', orders: 0, revenue: 0, endDate: '2026-06-10' },
];

const activeEvents = [
  { name: 'Giải Cầu Lông Mở Rộng', status: 'ACTIVE', participants: 128, startDate: '2026-03-25' },
  { name: 'Cup Bóng Đá 5 Người', status: 'ACTIVE', participants: 64, startDate: '2026-04-01' },
  { name: 'Giải Tennis Mùa Xuân', status: 'UPCOMING', participants: 32, startDate: '2026-04-10' },
];

const recentOrders = [
  { code: 'ORD-2026-1284', customer: 'Nguyễn Văn A', campaign: 'Marathon Đà Nẵng', amount: 350_000, status: 'PAID', date: '2026-03-22T08:30:00' },
  { code: 'ORD-2026-1283', customer: 'Trần Thị B', campaign: 'Trail Running Sapa', amount: 500_000, status: 'PAID', date: '2026-03-22T07:45:00' },
  { code: 'ORD-2026-1282', customer: 'Lê Minh C', campaign: 'Fun Run TP.HCM', amount: 150_000, status: 'PENDING', date: '2026-03-22T06:20:00' },
  { code: 'ORD-2026-1281', customer: 'Phạm Hồng D', campaign: 'Marathon Đà Nẵng', amount: 350_000, status: 'PAID', date: '2026-03-21T22:15:00' },
  { code: 'ORD-2026-1280', customer: 'Hoàng Thế E', campaign: 'Trail Running Sapa', amount: 500_000, status: 'FAILED', date: '2026-03-21T20:10:00' },
];

const newUsers = [
  { name: 'Nguyễn Minh Anh', email: 'anh.nm@gmail.com', date: '2026-03-22' },
  { name: 'Trần Đức Bình', email: 'binh.td@gmail.com', date: '2026-03-22' },
  { name: 'Lê Thị Cúc', email: 'cuc.lt@gmail.com', date: '2026-03-21' },
  { name: 'Vũ Hoàng Dũng', email: 'dung.vh@gmail.com', date: '2026-03-21' },
  { name: 'Đỗ Thu Hà', email: 'ha.dt@gmail.com', date: '2026-03-20' },
];

const paymentStatusColors: Record<string, string> = {
  PAID: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  FAILED: 'bg-red-100 text-red-800',
};

const campaignStatusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  DRAFT: 'bg-gray-100 text-gray-800',
  UPCOMING: 'bg-blue-100 text-blue-800',
};

// --- Helpers ---

function formatVND(n: number) {
  return n.toLocaleString('vi-VN') + ' ₫';
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('vi-VN');
}

function formatDateTime(s: string) {
  return new Date(s).toLocaleString('vi-VN');
}

// Simple bar chart using pure CSS
function MiniBarChart({ data }: { data: { month: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-1.5 h-32">
      {data.map((d) => {
        const pct = (d.value / max) * 100;
        return (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-t bg-primary/80 hover:bg-primary transition-colors cursor-default min-h-[4px]"
              style={{ height: `${pct}%` }}
              title={`${d.month}: ${formatVND(d.value)}`}
            />
            <span className="text-[10px] text-muted-foreground">{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}

// Donut-style stat
function StatRing({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = Math.round((value / total) * 100);
  const circumference = 2 * Math.PI * 18;
  const offset = circumference - (pct / 100) * circumference;
  return (
    <div className="flex items-center gap-3">
      <svg width="44" height="44" className="shrink-0">
        <circle cx="22" cy="22" r="18" fill="none" stroke="currentColor" strokeWidth="4" className="text-muted/30" />
        <circle
          cx="22" cy="22" r="18" fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 22 22)"
        />
      </svg>
      <div>
        <p className="text-sm font-semibold">{pct}%</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

// --- Page ---

export default function DashboardPage() {
  return (
    <div className="space-y-6 pt-12 lg:pt-0">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">
          Tổng quan
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Dữ liệu tổng hợp hoạt động kinh doanh 5Sport
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <div className="flex items-center gap-1 mt-1">
                {kpi.trend === 'up' ? (
                  <ArrowUpRight className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5 text-red-600" />
                )}
                <span className={`text-xs font-medium ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {kpi.change}
                </span>
                <span className="text-xs text-muted-foreground">{kpi.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Chart + Quick Stats */}
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base">Doanh thu theo tháng</CardTitle>
          </CardHeader>
          <CardContent>
            <MiniBarChart data={revenueByMonth} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Phân bổ thanh toán</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <StatRing label="Đã thanh toán" value={1005} total={1284} color="#16a34a" />
            <StatRing label="Chờ thanh toán" value={198} total={1284} color="#eab308" />
            <StatRing label="Thất bại" value={81} total={1284} color="#dc2626" />
          </CardContent>
        </Card>
      </div>

      {/* Campaigns & Events */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              Chiến dịch đang hoạt động
            </CardTitle>
            <Badge variant="secondary" className="text-xs">{activeCampaigns.length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeCampaigns.map((c) => (
                <div key={c.name} className="flex items-center justify-between gap-2 rounded-lg border p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{c.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={campaignStatusColors[c.status] || ''} variant="secondary">
                        {c.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Kết thúc: {formatDate(c.endDate)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">{formatVND(c.revenue)}</p>
                    <p className="text-xs text-muted-foreground">{c.orders} đơn</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Sự kiện
            </CardTitle>
            <Badge variant="secondary" className="text-xs">{activeEvents.length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeEvents.map((e) => (
                <div key={e.name} className="flex items-center justify-between gap-2 rounded-lg border p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{e.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={campaignStatusColors[e.status] || ''} variant="secondary">
                        {e.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(e.startDate)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm font-semibold">{e.participants}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">người tham gia</p>
                  </div>
                </div>
              ))}

              {/* Summary stats */}
              <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-lg font-bold">7</p>
                  <p className="text-xs text-muted-foreground">Tổng sự kiện</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold">224</p>
                  <p className="text-xs text-muted-foreground">VĐV đăng ký</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold">3</p>
                  <p className="text-xs text-muted-foreground">Đang diễn ra</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom: Recent Orders + New Users */}
      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders" className="gap-1.5">
            <ShoppingCart className="h-3.5 w-3.5" />
            Đơn hàng gần đây
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-1.5">
            <UserPlus className="h-3.5 w-3.5" />
            Người dùng mới
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã đơn</TableHead>
                    <TableHead>Khách hàng</TableHead>
                    <TableHead>Chiến dịch</TableHead>
                    <TableHead>Số tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thời gian</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.code}>
                      <TableCell className="font-mono text-xs">{order.code}</TableCell>
                      <TableCell className="font-medium">{order.customer}</TableCell>
                      <TableCell className="text-muted-foreground">{order.campaign}</TableCell>
                      <TableCell className="whitespace-nowrap">{formatVND(order.amount)}</TableCell>
                      <TableCell>
                        <Badge className={paymentStatusColors[order.status] || ''} variant="secondary">
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDateTime(order.date)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {newUsers.map((u) => (
                  <div key={u.email} className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {u.name.split(' ').slice(-1)[0][0]}{u.name.split(' ').slice(-2, -1)[0]?.[0] ?? ''}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{u.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{formatDate(u.date)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Metrics Footer */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2.5">
                <Eye className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lượt xem trang</p>
                <p className="text-xl font-bold">12.847</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2.5">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tỷ lệ chuyển đổi</p>
                <p className="text-xl font-bold">4.8%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 p-2.5">
                <Activity className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Đơn trung bình/ngày</p>
                <p className="text-xl font-bold">42</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2.5">
                <TrendingDown className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tỷ lệ hoàn tiền</p>
                <p className="text-xl font-bold">1.2%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
