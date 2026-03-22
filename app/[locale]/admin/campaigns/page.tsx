'use client';

import dynamic from 'next/dynamic';
import { useState, useRef } from 'react';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });
const MDPreview = dynamic(() => import('@uiw/react-md-editor').then((m) => m.default.Markdown), { ssr: false });
import { useQueryClient } from '@tanstack/react-query';
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  Megaphone,
  X,
  Ruler,
  Users,
  Phone,
  Link,
  RotateCcw,
  Upload,
  Shirt,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  useCampaignControllerFindAll,
  useCampaignControllerCreate,
  useCampaignControllerUpdate,
  useCampaignControllerRemove,
  useCampaignControllerUpdateStatus,
  getCampaignControllerFindAllQueryKey,
} from '@/lib/services/campaigns/campaigns';
import {
  useCampaignOrderControllerFindAll,
} from '@/lib/services/campaign-orders/campaign-orders';
import { useUploadControllerUploadFile } from '@/lib/services/upload/upload';
import { AXIOS_INSTANCE } from '@/lib/api/axiosInstance';
import { unwrapApi } from '@/lib/api/helpers';
import { UpdateCampaignStatusDtoStatus } from '@/lib/schemas/updateCampaignStatusDtoStatus';
import { CampaignOrderControllerFindAllPaymentStatus } from '@/lib/schemas/campaignOrderControllerFindAllPaymentStatus';
import type { CreateCampaignDto } from '@/lib/schemas/createCampaignDto';
import type { CampaignResponseDto } from '@/lib/schemas/campaignResponseDto';
import type { DistanceItemResponseDto } from '@/lib/schemas/distanceItemResponseDto';
import type { OrderResponseDto } from '@/lib/schemas/orderResponseDto';

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  ACTIVE: 'bg-green-100 text-green-800',
  CLOSED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const paymentStatusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-purple-100 text-purple-800',
};

interface DistanceEntry {
  name: string;
  price: string;
}

function parseDistances(distances: DistanceItemResponseDto[] = []): DistanceEntry[] {
  return distances.map((d) => ({
    name: d.distance ?? '',
    price: String(d.price ?? ''),
  }));
}

function serializeDistances(entries: DistanceEntry[]): { distance: string; price: number }[] {
  return entries
    .filter((e) => e.name.trim())
    .map((e) => ({ distance: e.name.trim(), price: Number(e.price) || 0 }));
}

const DEFAULT_SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const defaultForm: Omit<CreateCampaignDto, 'distances'> = {
  name: '',
  slug: '',
  startTime: '',
  endTime: '',
  description: '',
  bannerUrl: '',
  groupName: '',
  groupLeader: '',
  zaloGroupUrl: '',
  hotline: '',
  regulationsUrl: '',
  regulations: '',
  fanpageUrl: '',
  sizeShirtOptions: [...DEFAULT_SHIRT_SIZES],
};

export default function CampaignsPage() {
  const t = useTranslations('admin.campaigns');
  const tButtons = useTranslations('common.buttons');
  const queryClient = useQueryClient();

  const { data: campaignsRaw, isLoading: campaignsLoading } = useCampaignControllerFindAll();
  const campaigns = unwrapApi(campaignsRaw) ?? [];

  const createCampaign = useCampaignControllerCreate();
  const updateCampaign = useCampaignControllerUpdate();
  const removeCampaign = useCampaignControllerRemove();
  const updateStatus = useCampaignControllerUpdateStatus();

  const [showDialog, setShowDialog] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<CampaignResponseDto | null>(null);
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [form, setForm] = useState<Omit<CreateCampaignDto, 'distances'>>(defaultForm);
  const [distances, setDistances] = useState<DistanceEntry[]>([]);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const uploadFile = useUploadControllerUploadFile();

  const invalidateCampaigns = () => {
    queryClient.invalidateQueries({ queryKey: getCampaignControllerFindAllQueryKey() });
  };

  const handleBannerUpload = async (file: File) => {
    setIsUploadingBanner(true);
    try {
      const result = await uploadFile.mutateAsync({ data: { file } });
      const uploadData = result?.data as unknown as { url?: string; fileUrl?: string } | undefined;
      const url = uploadData?.url ?? uploadData?.fileUrl ?? '';
      setForm((prev) => ({ ...prev, bannerUrl: url }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      toast.error(message);
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const openCreate = () => {
    setEditingCampaign(null);
    setForm(defaultForm);
    setDistances([]);
    setShowDialog(true);
  };

  const openEdit = (campaign: CampaignResponseDto) => {
    setEditingCampaign(campaign);
    setForm({
      name: campaign.name || '',
      slug: campaign.slug || '',
      startTime: campaign.startTime?.slice(0, 16) || '',
      endTime: campaign.endTime?.slice(0, 16) || '',
      description: campaign.description || '',
      bannerUrl: campaign.bannerUrl || '',
      groupName: campaign.groupName || '',
      groupLeader: campaign.groupLeader || '',
      zaloGroupUrl: campaign.zaloGroupUrl || '',
      hotline: campaign.hotline || '',
      regulationsUrl: campaign.regulationsUrl || '',
      regulations: campaign.regulations || '',
      fanpageUrl: campaign.fanpageUrl || '',
      sizeShirtOptions: campaign.sizeShirtOptions?.length
        ? campaign.sizeShirtOptions
        : [...DEFAULT_SHIRT_SIZES],
    });
    setDistances(parseDistances(campaign.distances || []));
    setShowDialog(true);
  };

  const handleSave = async () => {
    const payload = {
      ...form,
      distances: serializeDistances(distances),
    };
    try {
      if (editingCampaign) {
        await updateCampaign.mutateAsync({ id: editingCampaign.id, data: payload });
        toast.success(t('messages.updateSuccess'));
      } else {
        await createCampaign.mutateAsync({ data: payload });
        toast.success(t('messages.createSuccess'));
      }
      invalidateCampaigns();
      setShowDialog(false);
    } catch {
      toast.error(t('messages.error'));
    }
  };

  const handleUpdateStatus = async (campaignId: string, status: UpdateCampaignStatusDtoStatus) => {
    try {
      await updateStatus.mutateAsync({ id: campaignId, data: { status } });
      toast.success(t('messages.statusUpdateSuccess'));
      invalidateCampaigns();
    } catch {
      toast.error(t('messages.error'));
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await removeCampaign.mutateAsync({ id: deleteConfirm });
      toast.success(t('messages.deleteSuccess'));
      invalidateCampaigns();
      if (expandedCampaign === deleteConfirm) setExpandedCampaign(null);
    } catch {
      toast.error(t('messages.error'));
    } finally {
      setDeleteConfirm(null);
    }
  };

  const addDistance = () => setDistances([...distances, { name: '', price: '' }]);
  const removeDistance = (i: number) => setDistances(distances.filter((_, idx) => idx !== i));
  const updateDistance = (i: number, field: 'name' | 'price', value: string) => {
    const next = [...distances];
    if (field === 'price') {
      // Strip non-digits, store as plain number string
      value = value.replace(/[^\d]/g, '');
    }
    next[i] = { ...next[i], [field]: value };
    setDistances(next);
  };

  const formatPriceInput = (raw: string) => {
    const num = raw.replace(/[^\d]/g, '');
    if (!num) return '';
    return Number(num).toLocaleString('vi-VN');
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('vi-VN');
  };

  const formatPrice = (price: string) => {
    const num = Number(price);
    if (!num) return price;
    return num.toLocaleString('vi-VN') + 'đ';
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 pt-12 lg:pt-0 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            {t('title')}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            {t('description')}
          </p>
        </div>
        <Button className="w-full sm:w-auto" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('createCampaign')}
        </Button>
      </div>

      {/* List */}
      {campaignsLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : campaigns.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Megaphone className="mb-4 h-12 w-12" />
            <p className="text-lg font-medium text-foreground">{t('noCampaigns')}</p>
            <p className="text-sm">{t('noCampaignsDescription')}</p>
            <Button className="mt-4" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              {t('createCampaign')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-sm font-semibold">{campaign.name}</CardTitle>
                      <Badge className={statusColors[campaign.status] || ''} variant="secondary">
                        {t(`statuses.${campaign.status}`)}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>Slug: {campaign.slug}</span>
                      <span>{t('startTime')}: {formatDate(campaign.startTime)}</span>
                      <span>{t('endTime')}: {formatDate(campaign.endTime)}</span>
                      {campaign.hotline && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />{campaign.hotline}
                        </span>
                      )}
                    </div>
                    {/* Distances preview */}
                    {campaign.distances?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {campaign.distances.map((d, i) => (
                            <Badge key={i} variant="outline" className="text-xs font-normal">
                              <Ruler className="h-3 w-3 mr-1" />
                              {d.distance}{d.price ? ` — ${formatPrice(String(d.price))}` : ''}
                            </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Select
                      value={campaign.status}
                      onValueChange={(val) => handleUpdateStatus(campaign.id, val as UpdateCampaignStatusDtoStatus)}
                    >
                      <SelectTrigger className="h-8 w-[140px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(UpdateCampaignStatusDtoStatus).map((s) => (
                          <SelectItem key={s} value={s}>
                            {t(`statuses.${s}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(campaign)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => setDeleteConfirm(campaign.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setExpandedCampaign(expandedCampaign === campaign.id ? null : campaign.id)}
                    >
                      {expandedCampaign === campaign.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {expandedCampaign === campaign.id && (
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 mb-3">
                    <ShoppingCart className="h-4 w-4" />
                    <span className="text-sm font-medium">{t('orders.title')}</span>
                  </div>
                  <CampaignOrders campaignId={campaign.id} t={t} />
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Campaign Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCampaign ? t('editCampaign') : t('createCampaign')}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {/* Basic info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('name')} *</Label>
                <Input
                  placeholder={t('namePlaceholder')}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('slug')} *</Label>
                <Input
                  placeholder={t('slugPlaceholder')}
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('campaignDescription')}</Label>
              <Input
                placeholder={t('descriptionPlaceholder')}
                value={form.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {/* Banner Upload */}
            <div className="space-y-2">
              <Label>{t('bannerUrl')}</Label>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleBannerUpload(file);
                  e.target.value = '';
                }}
              />
              <div className="relative rounded-lg border-2 border-dashed border-gray-200 hover:border-primary/50 transition-colors overflow-hidden bg-muted/30 aspect-[3/1] max-w-[400px]">
                {form.bannerUrl ? (
                  <>
                    <img
                      src={form.bannerUrl}
                      alt="Campaign Banner"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => bannerInputRef.current?.click()}
                        disabled={isUploadingBanner}
                      >
                        {isUploadingBanner ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4 mr-1" />
                        )}
                        Replace
                      </Button>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    className="w-full h-full flex flex-col items-center justify-center gap-2 cursor-pointer p-4"
                    onClick={() => bannerInputRef.current?.click()}
                    disabled={isUploadingBanner}
                  >
                    {isUploadingBanner ? (
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Upload Banner</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('startTime')} *</Label>
                <Input
                  type="datetime-local"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('endTime')} *</Label>
                <Input
                  type="datetime-local"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                />
              </div>
            </div>

            <hr className="border-border" />

            {/* Distances */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-primary" />
                  <Label className="text-base font-semibold">{t('distances.title')}</Label>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addDistance}>
                  <Plus className="mr-2 h-3 w-3" />
                  {t('distances.add')}
                </Button>
              </div>

              {distances.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-3 rounded-lg border border-dashed">
                  {t('distances.noDistances')}
                </p>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-xs text-muted-foreground px-1">
                    <span>{t('distances.distanceName')}</span>
                    <span>{t('distances.price')}</span>
                    <span className="w-8" />
                  </div>
                  {distances.map((entry, i) => (
                    <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                      <Input
                        placeholder={t('distances.distancePlaceholder')}
                        value={entry.name}
                        onChange={(e) => updateDistance(i, 'name', e.target.value)}
                      />
                      <Input
                        placeholder="0"
                        value={formatPriceInput(entry.price)}
                        onChange={(e) => updateDistance(i, 'price', e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-destructive"
                        onClick={() => removeDistance(i)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <hr className="border-border" />

            {/* Shirt Sizes */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Shirt className="h-4 w-4 text-primary" />
                <Label className="text-base font-semibold">Size áo</Label>
              </div>
              <div className="flex flex-wrap gap-2">
                {(form.sizeShirtOptions || []).map((size) => (
                  <span
                    key={size}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                  >
                    {size}
                    <button
                      type="button"
                      className="ml-1 rounded-full hover:bg-primary/20 p-0.5 transition-colors"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          sizeShirtOptions: (prev.sizeShirtOptions || []).filter((s) => s !== size),
                        }))
                      }
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  id="new-shirt-size-input"
                  placeholder="Thêm size (vd: XXXL)"
                  className="max-w-[160px] h-8 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = (e.target as HTMLInputElement).value.trim().toUpperCase();
                      if (val && !(form.sizeShirtOptions || []).includes(val)) {
                        setForm((prev) => ({
                          ...prev,
                          sizeShirtOptions: [...(prev.sizeShirtOptions || []), val],
                        }));
                      }
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => {
                    const input = document.getElementById('new-shirt-size-input') as HTMLInputElement;
                    const val = input?.value.trim().toUpperCase();
                    if (val && !(form.sizeShirtOptions || []).includes(val)) {
                      setForm((prev) => ({
                        ...prev,
                        sizeShirtOptions: [...(prev.sizeShirtOptions || []), val],
                      }));
                      input.value = '';
                    }
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Thêm
                </Button>
              </div>
            </div>

            <hr className="border-border" />

            {/* Group info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <Label className="text-base font-semibold">{t('groupInfo')}</Label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('groupName')}</Label>
                  <Input
                    placeholder={t('groupNamePlaceholder')}
                    value={form.groupName || ''}
                    onChange={(e) => setForm({ ...form, groupName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('groupLeader')}</Label>
                  <Input
                    placeholder={t('groupLeaderPlaceholder')}
                    value={form.groupLeader || ''}
                    onChange={(e) => setForm({ ...form, groupLeader: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('hotline')}</Label>
                  <Input
                    placeholder={t('hotlinePlaceholder')}
                    value={form.hotline || ''}
                    onChange={(e) => setForm({ ...form, hotline: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('zaloGroupUrl')}</Label>
                  <Input
                    placeholder={t('zaloGroupUrlPlaceholder')}
                    value={form.zaloGroupUrl || ''}
                    onChange={(e) => setForm({ ...form, zaloGroupUrl: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <hr className="border-border" />

            {/* Links */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Link className="h-4 w-4 text-primary" />
                <Label className="text-base font-semibold">Links</Label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('regulationsUrl')}</Label>
                  <Input
                    placeholder={t('regulationsUrlPlaceholder')}
                    value={form.regulationsUrl || ''}
                    onChange={(e) => setForm({ ...form, regulationsUrl: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('fanpageUrl')}</Label>
                  <Input
                    placeholder={t('fanpageUrlPlaceholder')}
                    value={form.fanpageUrl || ''}
                    onChange={(e) => setForm({ ...form, fanpageUrl: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <hr className="border-border" />

            {/* Regulations Markdown */}
            <RegulationsEditor
              value={form.regulations || ''}
              onChange={(val) => setForm((prev) => ({ ...prev, regulations: val }))}
            />
          </div>

          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              {tButtons('cancel')}
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                createCampaign.isPending ||
                updateCampaign.isPending ||
                !form.name ||
                !form.slug
              }
            >
              {(createCampaign.isPending || updateCampaign.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {tButtons('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteCampaign')}</DialogTitle>
            <DialogDescription>{t('deleteCampaignConfirm')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              {tButtons('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={removeCampaign.isPending}
            >
              {removeCampaign.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {tButtons('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RegulationsEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [tab, setTab] = useState<'edit' | 'preview'>('edit');

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Thể lệ giải (Markdown)</Label>
        <div className="flex rounded-md border border-border overflow-hidden text-xs">
          <button
            type="button"
            className={`px-3 py-1.5 transition-colors ${tab === 'edit' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            onClick={() => setTab('edit')}
          >
            Soạn thảo
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 transition-colors ${tab === 'preview' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            onClick={() => setTab('preview')}
          >
            Xem trước
          </button>
        </div>
      </div>

      {tab === 'edit' ? (
        <div data-color-mode="light">
          <MDEditor
            value={value}
            onChange={(val) => onChange(val ?? '')}
            height={320}
            preview="edit"
          />
        </div>
      ) : (
        <div
          data-color-mode="light"
          className="min-h-[320px] rounded-md border border-input bg-background p-4 prose prose-sm max-w-none"
        >
          {value ? (
            <MDPreview source={value} />
          ) : (
            <p className="text-muted-foreground text-sm">Chưa có nội dung.</p>
          )}
        </div>
      )}
    </div>
  );
}

function CampaignOrders({ campaignId, t }: { campaignId: string; t: (key: string) => string }) {
  const [paymentFilter, setPaymentFilter] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: ordersResponse, isLoading, refetch } = useCampaignOrderControllerFindAll(campaignId, {
    paymentStatus: paymentFilter ? paymentFilter as CampaignOrderControllerFindAllPaymentStatus : undefined,
    page,
    limit,
  });

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const response = await AXIOS_INSTANCE.get(`/campaigns/${campaignId}/orders/export/excel`, {
        params: { fromDate, toDate },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `orders-${campaignId}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(t('messages.exportSuccess'));
    } catch {
      toast.error(t('messages.error'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleReload = () => {
    setPage(1);
    refetch();
  };

  const ordersPage = unwrapApi(ordersResponse);
  const orders: OrderResponseDto[] = ordersPage?.data ?? [];
  const totalPages = Math.max(1, Math.ceil(orders.length / limit));

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="flex items-center gap-2 mr-auto mb-2 sm:mb-0 flex-wrap">
          <div className="flex items-center gap-1">
            <Label className="text-[10px] text-muted-foreground uppercase">{t('orders.fromDate')}</Label>
            <Input
              type="date"
              className="h-8 w-[130px] text-xs"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-1">
            <Label className="text-[10px] text-muted-foreground uppercase">{t('orders.toDate')}</Label>
            <Input
              type="date"
              className="h-8 w-[130px] text-xs"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportExcel}
            disabled={isExporting}
            className="h-8"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {t('orders.exportExcel')}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={paymentFilter}
            onValueChange={(val) => {
              setPaymentFilter(val === 'all' ? '' : val);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-[160px] text-xs">
              <SelectValue placeholder={t('orders.allStatuses')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('orders.allStatuses')}</SelectItem>
              {Object.values(CampaignOrderControllerFindAllPaymentStatus).map((s) => (
                <SelectItem key={s} value={s}>
                  {t(`orders.paymentStatuses.${s}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="outline"
            onClick={handleReload}
            disabled={isLoading}
            className="h-8"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">{t('orders.noOrders')}</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('orders.orderCode')}</TableHead>
                <TableHead>{t('orders.customerName')}</TableHead>
                <TableHead>{t('orders.totalAmount')}</TableHead>
                <TableHead>{t('orders.paymentStatus')}</TableHead>
                <TableHead>{t('orders.paidAt')}</TableHead>
                <TableHead>{t('orders.createdAt')}</TableHead>
                <TableHead>{t('orders.athletes')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.orderCode}</TableCell>
                  <TableCell>{order.lastName} {order.firstName}</TableCell>
                  <TableCell className="text-xs whitespace-nowrap">
                    {order.totalAmount?.toLocaleString('vi-VN')} ₫
                  </TableCell>
                  <TableCell>
                    <Badge className={paymentStatusColors[order.paymentStatus] || ''} variant="secondary">
                      {t(`orders.paymentStatuses.${order.paymentStatus}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {order.paidAt ? new Date(order.paidAt).toLocaleString('vi-VN') : '-'}
                  </TableCell>
                  <TableCell className="text-xs">
                    {new Date(order.createdAt).toLocaleString('vi-VN')}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {order.athletes.map((athlete, idx) => {
                        const a = athlete as Record<string, unknown>;
                        return (
                          <div key={String(a['_id'] ?? idx)} className="text-xs">
                            <span className="font-medium">{String(a['lastName'] ?? '')} {String(a['firstName'] ?? '')}</span>
                            <span className="text-muted-foreground"> · {String(a['distance'] ?? '')} · {Number(a['unitPrice'] ?? 0).toLocaleString('vi-VN')} ₫</span>
                          </div>
                        );
                      })}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-center items-center gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              {t('orders.previous')}
            </Button>
            <span className="flex items-center text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              {t('orders.next')}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
