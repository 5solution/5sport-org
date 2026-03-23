'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  MessageSquare,
  Loader2,
  Trash2,
  Eye,
  Star,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { AXIOS_INSTANCE } from '@/lib/api/axiosInstance';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Feedback {
  id: string;
  name: string;
  email: string;
  phone?: string;
  category: string;
  content: string;
  rating?: number;
  status: string;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    displayName?: string;
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: 'NEW', label: 'Moi' },
  { value: 'REVIEWED', label: 'Da xem' },
  { value: 'IN_PROGRESS', label: 'Dang xu ly' },
  { value: 'RESOLVED', label: 'Da giai quyet' },
  { value: 'DISMISSED', label: 'Bo qua' },
];

const CATEGORY_OPTIONS = [
  { value: 'GENERAL', label: 'Chung' },
  { value: 'EVENT', label: 'Su kien' },
  { value: 'PAYMENT', label: 'Thanh toan' },
  { value: 'UI_UX', label: 'Giao dien' },
  { value: 'BUG', label: 'Loi / Bug' },
  { value: 'SUGGESTION', label: 'De xuat' },
];

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-700 border-blue-200',
  REVIEWED: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  IN_PROGRESS: 'bg-orange-100 text-orange-700 border-orange-200',
  RESOLVED: 'bg-green-100 text-green-700 border-green-200',
  DISMISSED: 'bg-gray-100 text-gray-600 border-gray-200',
};

const CATEGORY_COLORS: Record<string, string> = {
  GENERAL: 'bg-slate-100 text-slate-700 border-slate-200',
  EVENT: 'bg-purple-100 text-purple-700 border-purple-200',
  PAYMENT: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  UI_UX: 'bg-pink-100 text-pink-700 border-pink-200',
  BUG: 'bg-red-100 text-red-700 border-red-200',
  SUGGESTION: 'bg-cyan-100 text-cyan-700 border-cyan-200',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatusLabel(status: string) {
  return STATUS_OPTIONS.find((s) => s.value === status)?.label ?? status;
}

function getCategoryLabel(category: string) {
  return CATEGORY_OPTIONS.find((c) => c.value === category)?.label ?? category;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FeedbackPage() {
  const params = useParams();
  const locale = params?.locale as string;

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const limit = 20;

  // Detail dialog
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [newStatus, setNewStatus] = useState('');

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams: Record<string, string | number> = { page, limit };
      if (statusFilter !== 'all') queryParams.status = statusFilter;
      if (categoryFilter !== 'all') queryParams.category = categoryFilter;

      const res = await AXIOS_INSTANCE.get('/feedback', { params: queryParams });
      const result = res.data;
      setFeedbacks(result.data || []);
      setTotal(result.total || 0);
    } catch {
      toast.error('Khong the tai danh sach feedback');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, categoryFilter]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const handleOpenDetail = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setNewStatus(feedback.status);
    setAdminNote(feedback.adminNote || '');
    setDetailOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedFeedback) return;
    setUpdatingStatus(true);
    try {
      await AXIOS_INSTANCE.patch(`/feedback/${selectedFeedback.id}/status`, {
        status: newStatus,
        adminNote: adminNote || undefined,
      });
      toast.success('Cap nhat trang thai thanh cong');
      setDetailOpen(false);
      fetchFeedbacks();
    } catch {
      toast.error('Cap nhat that bai');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Ban co chac chan muon xoa feedback nay?')) return;
    try {
      await AXIOS_INSTANCE.delete(`/feedback/${id}`);
      toast.success('Da xoa feedback');
      fetchFeedbacks();
    } catch {
      toast.error('Xoa that bai');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 pt-12 lg:pt-0 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            Feedback
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Quan ly gop y va phan hoi tu nguoi dung
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        {STATUS_OPTIONS.map((s) => {
          const count = feedbacks.filter((f) => f.status === s.value).length;
          return (
            <Card key={s.value}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6">
                <CardTitle className="text-xs sm:text-sm font-medium">{s.label}</CardTitle>
                <div
                  className={cn(
                    'h-2 w-2 rounded-full',
                    s.value === 'NEW' && 'bg-blue-500',
                    s.value === 'REVIEWED' && 'bg-yellow-500',
                    s.value === 'IN_PROGRESS' && 'bg-orange-500',
                    s.value === 'RESOLVED' && 'bg-green-500',
                    s.value === 'DISMISSED' && 'bg-gray-400',
                  )}
                />
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="font-heading text-xl sm:text-2xl font-bold">{count}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters + Table */}
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="font-heading text-base sm:text-lg font-bold">
                Danh sach feedback
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Tong cong {total} feedback
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Trang thai" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tat ca trang thai</SelectItem>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Danh muc" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tat ca danh muc</SelectItem>
                  {CATEGORY_OPTIONS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
              <MessageSquare className="mb-2 h-10 w-10" />
              <p>Chua co feedback nao</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ngay</TableHead>
                    <TableHead>Ho ten</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Danh muc</TableHead>
                    <TableHead>Danh gia</TableHead>
                    <TableHead>Trang thai</TableHead>
                    <TableHead className="text-right">Thao tac</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedbacks.map((fb) => (
                    <TableRow key={fb.id}>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(fb.createdAt)}
                      </TableCell>
                      <TableCell className="font-medium">{fb.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{fb.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn('text-xs', CATEGORY_COLORS[fb.category])}
                        >
                          {getCategoryLabel(fb.category)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {fb.rating ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{fb.rating}/5</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn('text-xs', STATUS_COLORS[fb.status])}
                        >
                          {getStatusLabel(fb.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleOpenDetail(fb)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(fb.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Trang {page} / {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Truoc
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Sau
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi tiet feedback</DialogTitle>
            <DialogDescription>
              {selectedFeedback && formatDate(selectedFeedback.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {selectedFeedback && (
            <div className="space-y-4">
              {/* Sender info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Ho ten</p>
                  <p className="font-medium">{selectedFeedback.name}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Email</p>
                  <p>{selectedFeedback.email}</p>
                </div>
                {selectedFeedback.phone && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">SDT</p>
                    <p>{selectedFeedback.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Danh muc</p>
                  <Badge
                    variant="outline"
                    className={cn('text-xs mt-0.5', CATEGORY_COLORS[selectedFeedback.category])}
                  >
                    {getCategoryLabel(selectedFeedback.category)}
                  </Badge>
                </div>
              </div>

              {/* Rating */}
              {selectedFeedback.rating && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Danh gia</p>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={cn(
                          'h-5 w-5',
                          s <= selectedFeedback.rating!
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300',
                        )}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Content */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Noi dung</p>
                <div className="rounded-lg border bg-muted/50 p-3 text-sm whitespace-pre-wrap">
                  {selectedFeedback.content}
                </div>
              </div>

              {/* Status update */}
              <div className="space-y-3 border-t pt-4">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                    Cap nhat trang thai
                  </p>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
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
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-1.5">
                    Ghi chu admin
                  </p>
                  <Textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Ghi chu noi bo..."
                    rows={3}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={handleUpdateStatus}
                  disabled={updatingStatus}
                >
                  {updatingStatus ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Dang cap nhat...
                    </>
                  ) : (
                    'Luu thay doi'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
