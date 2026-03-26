'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AXIOS_INSTANCE } from '@/lib/api/axiosInstance';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  Package,
  ShoppingCart,
  X,
  User,
  CreditCard,
  Calendar,
  FileText,
  Mail,
  Phone,
} from 'lucide-react';

interface Order {
  id: string;
  orderCode: string;
  eventId: string;
  eventName: string | null;
  eventBrand: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  athletes: {
    fullName: string;
    email: string;
    phone: string;
    ticketTierName: string;
    unitPrice: number;
  }[];
  paymentMethod: string | null;
  paymentStatus: string;
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  orderDate: string;
  paidAt: string | null;
  userId: string | null;
}

interface EventOption {
  id: string;
  name: string;
}

const STATUS_OPTIONS = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: 'PAID', label: 'Đã thanh toán' },
  { value: 'PENDING', label: 'Chờ thanh toán' },
  { value: 'FAILED', label: 'Thất bại' },
  { value: 'CANCELLED', label: 'Đã hủy' },
  { value: 'REFUNDED', label: 'Hoàn tiền' },
];

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  PAID: { label: 'Đã thanh toán', variant: 'default' },
  PENDING: { label: 'Chờ thanh toán', variant: 'secondary' },
  FAILED: { label: 'Thất bại', variant: 'destructive' },
  CANCELLED: { label: 'Đã hủy', variant: 'destructive' },
  REFUNDED: { label: 'Hoàn tiền', variant: 'outline' },
};

export default function AdminOrdersPage() {
  const params = useParams();
  const locale = params?.locale as string;

  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('ALL');
  const [eventId, setEventId] = useState('ALL');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [events, setEvents] = useState<EventOption[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const limit = 20;
  const totalPages = Math.ceil(total / limit);

  // Load events for filter (published + closed)
  useEffect(() => {
    AXIOS_INSTANCE.get('/events', { params: { limit: 100 } })
      .then((res) => {
        const data = res.data as any;
        const list = (data?.data ?? data ?? []) as any[];
        setEvents(
          list
            .filter((e: any) => ['PUBLISHED', 'CLOSED', 'LIVE'].includes(e.status))
            .map((e: any) => ({ id: e.id, name: e.name })),
        );
      })
      .catch(() => {});
  }, []);

  // Load orders
  const fetchOrders = useCallback(() => {
    setLoading(true);
    const queryParams: Record<string, string> = {
      page: String(page),
      limit: String(limit),
    };
    if (status !== 'ALL') queryParams.status = status;
    if (eventId !== 'ALL') queryParams.eventId = eventId;
    if (search) queryParams.search = search;

    AXIOS_INSTANCE.get('/admin/orders', { params: queryParams })
      .then((res) => {
        const data = res.data as any;
        setOrders(data?.data ?? []);
        setTotal(data?.total ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, status, eventId, search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" />
          Quản lý đơn hàng
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Xem và quản lý tất cả đơn đăng ký sự kiện
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm mã đơn, tên, email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={eventId} onValueChange={(v) => { setEventId(v); setPage(1); }}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Tất cả sự kiện" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tất cả sự kiện</SelectItem>
            {events.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleSearch} variant="outline" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-muted-foreground">
          <Package className="h-8 w-8" />
          <p className="text-sm">Chưa có đơn hàng nào</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Mã đơn</th>
                <th className="px-4 py-3 text-left font-medium">Sự kiện</th>
                <th className="px-4 py-3 text-left font-medium">Người đặt</th>
                <th className="px-4 py-3 text-left font-medium">VĐV</th>
                <th className="px-4 py-3 text-right font-medium">Số tiền</th>
                <th className="px-4 py-3 text-center font-medium">Trạng thái</th>
                <th className="px-4 py-3 text-left font-medium">Ngày đặt</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => {
                const st = STATUS_MAP[order.paymentStatus] ?? {
                  label: order.paymentStatus,
                  variant: 'outline' as const,
                };
                return (
                  <tr
                    key={order.id}
                    className="hover:bg-muted/30 cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold">
                        {order.orderCode}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm truncate max-w-[200px] block">
                        {order.eventName || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{order.contactName}</p>
                        <p className="text-xs text-muted-foreground">{order.contactEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {order.athletes?.length ?? 0} VĐV
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {Number(order.finalAmount).toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={st.variant}>{st.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {order.orderDate
                        ? new Date(order.orderDate).toLocaleString('vi-VN')
                        : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Trang {page}/{totalPages} ({total} đơn)
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Chi tiết đơn hàng
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Order info */}
                <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Mã đơn</span>
                    <span className="font-mono text-sm font-bold">{selectedOrder.orderCode}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Trạng thái</span>
                    <Badge variant={STATUS_MAP[selectedOrder.paymentStatus]?.variant ?? 'outline'}>
                      {STATUS_MAP[selectedOrder.paymentStatus]?.label ?? selectedOrder.paymentStatus}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Sự kiện</span>
                    <span className="text-sm font-medium">{selectedOrder.eventName || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Phương thức TT</span>
                    <span className="text-sm">{selectedOrder.paymentMethod || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Ngày đặt</span>
                    <span className="text-sm">
                      {selectedOrder.orderDate
                        ? new Date(selectedOrder.orderDate).toLocaleString('vi-VN')
                        : '-'}
                    </span>
                  </div>
                  {selectedOrder.paidAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Ngày thanh toán</span>
                      <span className="text-sm">
                        {new Date(selectedOrder.paidAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Contact info */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                    <User className="h-4 w-4" />
                    Thông tin liên hệ
                  </h4>
                  <div className="rounded-lg border p-3 space-y-1.5 text-sm">
                    <p className="font-medium">{selectedOrder.contactName}</p>
                    <p className="flex items-center gap-1.5 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      {selectedOrder.contactEmail}
                    </p>
                    <p className="flex items-center gap-1.5 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      {selectedOrder.contactPhone}
                    </p>
                  </div>
                </div>

                {/* Athletes */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">
                    Vận động viên ({selectedOrder.athletes?.length ?? 0})
                  </h4>
                  <div className="space-y-2">
                    {selectedOrder.athletes?.map((a, i) => (
                      <div key={i} className="rounded-lg border p-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{a.fullName}</p>
                          <p className="text-xs text-muted-foreground">{a.ticketTierName}</p>
                        </div>
                        <span className="text-sm font-semibold">
                          {Number(a.unitPrice).toLocaleString('vi-VN')} ₫
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="rounded-lg bg-muted/50 p-4 space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tổng tiền</span>
                    <span>{Number(selectedOrder.totalAmount).toLocaleString('vi-VN')} ₫</span>
                  </div>
                  {Number(selectedOrder.discountAmount) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Giảm giá</span>
                      <span className="text-green-600">
                        -{Number(selectedOrder.discountAmount).toLocaleString('vi-VN')} ₫
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold border-t pt-1.5">
                    <span>Thành tiền</span>
                    <span className="text-primary">
                      {Number(selectedOrder.finalAmount).toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
