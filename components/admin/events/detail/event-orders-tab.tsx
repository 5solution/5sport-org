'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight, Search, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useEventOrderControllerFindAll } from '@/lib/services/event-orders/event-orders';

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  PAID: { label: 'Đã thanh toán', variant: 'default' },
  PENDING: { label: 'Chờ thanh toán', variant: 'secondary' },
  FAILED: { label: 'Thất bại', variant: 'destructive' },
  CANCELLED: { label: 'Đã hủy', variant: 'destructive' },
  REFUNDED: { label: 'Hoàn tiền', variant: 'outline' },
};

interface EventOrdersTabProps {
  eventId: string;
}

export function EventOrdersTab({ eventId }: EventOrdersTabProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 20;

  const { data: rawData, isLoading } = useEventOrderControllerFindAll(
    eventId,
    { page: String(page), limit: String(limit) },
    { query: { enabled: !!eventId } },
  );

  const response = rawData as any;
  const orders = response?.data ?? response ?? [];
  const total = response?.total ?? orders.length;
  const totalPages = Math.ceil(total / limit);

  const filtered = search
    ? orders.filter(
        (o: any) =>
          o.orderCode?.toLowerCase().includes(search.toLowerCase()) ||
          o.contactName?.toLowerCase().includes(search.toLowerCase()) ||
          o.contactEmail?.toLowerCase().includes(search.toLowerCase()),
      )
    : orders;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Đơn hàng ({total})</h3>
          <p className="text-sm text-muted-foreground">
            Danh sách đơn đăng ký sự kiện
          </p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm mã đơn, tên, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
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
                <th className="px-4 py-3 text-left font-medium">Liên hệ</th>
                <th className="px-4 py-3 text-left font-medium">VĐV</th>
                <th className="px-4 py-3 text-right font-medium">Số tiền</th>
                <th className="px-4 py-3 text-center font-medium">Trạng thái</th>
                <th className="px-4 py-3 text-left font-medium">Ngày đặt</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((order: any) => {
                const status = STATUS_MAP[order.paymentStatus] ?? {
                  label: order.paymentStatus,
                  variant: 'outline' as const,
                };
                return (
                  <tr key={order.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold">
                        {order.orderCode}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{order.contactName}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.contactEmail}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs">
                        {order.athletes?.length ?? 0} VĐV
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold">
                        {Number(order.finalAmount).toLocaleString('vi-VN')} ₫
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={status.variant}>{status.label}</Badge>
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
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
