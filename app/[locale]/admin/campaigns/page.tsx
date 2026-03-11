'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Package,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  Megaphone,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
  useCampaignProductControllerFindProducts,
  useCampaignProductControllerCreateProduct,
  useCampaignProductControllerUpdateProduct,
  useCampaignProductControllerRemoveProduct,
  getCampaignProductControllerFindProductsQueryKey,
} from '@/lib/services/campaign-products/campaign-products';
import {
  useCampaignOrderControllerFindAll,
} from '@/lib/services/campaign-orders/campaign-orders';
import { UpdateCampaignStatusDtoStatus } from '@/lib/schemas/updateCampaignStatusDtoStatus';
import { CampaignOrderControllerFindAllPaymentStatus } from '@/lib/schemas/campaignOrderControllerFindAllPaymentStatus';
import type { CreateCampaignDto } from '@/lib/schemas/createCampaignDto';
import type { CreateCampaignProductDto } from '@/lib/schemas/createCampaignProductDto';

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

export default function CampaignsPage() {
  const t = useTranslations('admin.campaigns');
  const tButtons = useTranslations('common.buttons');
  const queryClient = useQueryClient();

  // Campaign list
  const { data: campaignsData, isLoading: campaignsLoading } = useCampaignControllerFindAll();
  console.log('Campaigns data:', campaignsData);
  const campaigns = Array.isArray(campaignsData) ? campaignsData : [];

  // Mutations
  const createCampaign = useCampaignControllerCreate();
  const updateCampaign = useCampaignControllerUpdate();
  const removeCampaign = useCampaignControllerRemove();
  const updateStatus = useCampaignControllerUpdateStatus();
  const createProduct = useCampaignProductControllerCreateProduct();
  const updateProduct = useCampaignProductControllerUpdateProduct();
  const removeProduct = useCampaignProductControllerRemoveProduct();

  // UI state
  const [showCampaignDialog, setShowCampaignDialog] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productCampaignId, setProductCampaignId] = useState<string>('');
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'products' | 'orders'>('products');
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'campaign' | 'product'; id: string; campaignId?: string } | null>(null);

  // Campaign form
  const [campaignForm, setCampaignForm] = useState<CreateCampaignDto>({
    name: '',
    slug: '',
    startTime: '',
    endTime: '',
    description: '',
    bannerUrl: '',
  });

  // Product form
  const [productForm, setProductForm] = useState<CreateCampaignProductDto>({
    name: '',
    originalPrice: 0,
    totalQuantity: 0,
    description: '',
    maxPerOrder: 1,
    sortOrder: 0,
    isVisible: true,
  });

  const invalidateCampaigns = () => {
    queryClient.invalidateQueries({ queryKey: getCampaignControllerFindAllQueryKey() });
  };

  const openCreateCampaign = () => {
    setEditingCampaign(null);
    setCampaignForm({ name: '', slug: '', startTime: '', endTime: '', description: '', bannerUrl: '' });
    setShowCampaignDialog(true);
  };

  const openEditCampaign = (campaign: any) => {
    setEditingCampaign(campaign);
    setCampaignForm({
      name: campaign.name,
      slug: campaign.slug,
      startTime: campaign.startTime?.slice(0, 16) || '',
      endTime: campaign.endTime?.slice(0, 16) || '',
      description: campaign.description || '',
      bannerUrl: campaign.bannerUrl || '',
    });
    setShowCampaignDialog(true);
  };

  const handleSaveCampaign = async () => {
    try {
      if (editingCampaign) {
        await updateCampaign.mutateAsync({ id: editingCampaign._id, data: campaignForm as any });
        toast.success(t('messages.updateSuccess'));
      } else {
        await createCampaign.mutateAsync({ data: campaignForm });
        toast.success(t('messages.createSuccess'));
      }
      invalidateCampaigns();
      setShowCampaignDialog(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('messages.error'));
    }
  };

  const handleUpdateStatus = async (campaignId: string, status: string) => {
    try {
      await updateStatus.mutateAsync({ id: campaignId, data: { status: status as any } });
      toast.success(t('messages.statusUpdateSuccess'));
      invalidateCampaigns();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('messages.error'));
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      if (deleteConfirm.type === 'campaign') {
        await removeCampaign.mutateAsync({ id: deleteConfirm.id });
        toast.success(t('messages.deleteSuccess'));
        invalidateCampaigns();
        if (expandedCampaign === deleteConfirm.id) setExpandedCampaign(null);
      } else if (deleteConfirm.type === 'product' && deleteConfirm.campaignId) {
        await removeProduct.mutateAsync({ campaignId: deleteConfirm.campaignId, id: deleteConfirm.id });
        toast.success(t('messages.productDeleteSuccess'));
        queryClient.invalidateQueries({
          queryKey: getCampaignProductControllerFindProductsQueryKey(deleteConfirm.campaignId),
        });
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('messages.error'));
    } finally {
      setDeleteConfirm(null);
    }
  };

  const openCreateProduct = (campaignId: string) => {
    setEditingProduct(null);
    setProductCampaignId(campaignId);
    setProductForm({ name: '', originalPrice: 0, totalQuantity: 0, description: '', maxPerOrder: 1, sortOrder: 0, isVisible: true });
    setShowProductDialog(true);
  };

  const openEditProduct = (campaignId: string, product: any) => {
    setEditingProduct(product);
    setProductCampaignId(campaignId);
    setProductForm({
      name: product.name,
      originalPrice: product.originalPrice,
      totalQuantity: product.totalQuantity,
      description: product.description || '',
      maxPerOrder: product.maxPerOrder || 1,
      sortOrder: product.sortOrder || 0,
      isVisible: product.isVisible ?? true,
    });
    setShowProductDialog(true);
  };

  const handleSaveProduct = async () => {
    try {
      if (editingProduct) {
        await updateProduct.mutateAsync({ campaignId: productCampaignId, id: editingProduct.id, data: productForm as any });
        toast.success(t('messages.productUpdateSuccess'));
      } else {
        await createProduct.mutateAsync({ campaignId: productCampaignId, data: productForm });
        toast.success(t('messages.productCreateSuccess'));
      }
      queryClient.invalidateQueries({
        queryKey: getCampaignProductControllerFindProductsQueryKey(productCampaignId),
      });
      setShowProductDialog(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('messages.error'));
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 pt-12 lg:pt-0 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            {t('title')}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            {t('description')}
          </p>
        </div>
        <Button className="w-full sm:w-auto" onClick={openCreateCampaign}>
          <Plus className="mr-2 h-4 w-4" />
          {t('createCampaign')}
        </Button>
      </div>

      {/* Campaign List */}
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
            <Button className="mt-4" onClick={openCreateCampaign}>
              <Plus className="mr-2 h-4 w-4" />
              {t('createCampaign')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign: any) => (
            <Card key={campaign._id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-sm font-semibold">{campaign.name}</CardTitle>
                    <Badge className={statusColors[campaign.status] || ''} variant="secondary">
                      {t(`statuses.${campaign.status}`)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={campaign.status}
                      onValueChange={(val) => handleUpdateStatus(campaign._id, val)}
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
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditCampaign(campaign)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => setDeleteConfirm({ type: 'campaign', id: campaign._id })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setExpandedCampaign(expandedCampaign === campaign._id ? null : campaign._id)}
                    >
                      {expandedCampaign === campaign._id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>{t('slug')}: {campaign.slug}</span>
                  <span>{t('startTime')}: {formatDate(campaign.startTime)}</span>
                  <span>{t('endTime')}: {formatDate(campaign.endTime)}</span>
                </div>
              </CardHeader>

              {expandedCampaign === campaign._id && (
                <CardContent className="pt-0">
                  <div className="flex gap-2 mb-4">
                    <Button
                      variant={activeSection === 'products' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveSection('products')}
                    >
                      <Package className="mr-2 h-4 w-4" />
                      {t('products.title')}
                    </Button>
                    <Button
                      variant={activeSection === 'orders' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveSection('orders')}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {t('orders.title')}
                    </Button>
                  </div>

                  {activeSection === 'products' ? (
                    <CampaignProducts
                      campaignId={campaign._id}
                      t={t}
                      onAdd={() => openCreateProduct(campaign._id)}
                      onEdit={(product: any) => openEditProduct(campaign._id, product)}
                      onDelete={(productId: string) => setDeleteConfirm({ type: 'product', id: productId, campaignId: campaign._id })}
                    />
                  ) : (
                    <CampaignOrders campaignId={campaign._id} t={t} />
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Campaign Dialog */}
      <Dialog open={showCampaignDialog} onOpenChange={setShowCampaignDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCampaign ? t('editCampaign') : t('createCampaign')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('name')}</Label>
              <Input
                placeholder={t('namePlaceholder')}
                value={campaignForm.name}
                onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('slug')}</Label>
              <Input
                placeholder={t('slugPlaceholder')}
                value={campaignForm.slug}
                onChange={(e) => setCampaignForm({ ...campaignForm, slug: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('campaignDescription')}</Label>
              <Input
                placeholder={t('descriptionPlaceholder')}
                value={campaignForm.description || ''}
                onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('bannerUrl')}</Label>
              <Input
                placeholder={t('bannerUrlPlaceholder')}
                value={campaignForm.bannerUrl || ''}
                onChange={(e) => setCampaignForm({ ...campaignForm, bannerUrl: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('startTime')}</Label>
                <Input
                  type="datetime-local"
                  value={campaignForm.startTime}
                  onChange={(e) => setCampaignForm({ ...campaignForm, startTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('endTime')}</Label>
                <Input
                  type="datetime-local"
                  value={campaignForm.endTime}
                  onChange={(e) => setCampaignForm({ ...campaignForm, endTime: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCampaignDialog(false)}>
              {tButtons('cancel')}
            </Button>
            <Button
              onClick={handleSaveCampaign}
              disabled={createCampaign.isPending || updateCampaign.isPending || !campaignForm.name || !campaignForm.slug}
            >
              {(createCampaign.isPending || updateCampaign.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {tButtons('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingProduct ? t('products.editProduct') : t('products.addProduct')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('products.name')}</Label>
              <Input
                placeholder={t('products.namePlaceholder')}
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('products.productDescription')}</Label>
              <Input
                value={productForm.description || ''}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('products.originalPrice')}</Label>
                <Input
                  type="number"
                  value={productForm.originalPrice}
                  onChange={(e) => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('products.totalQuantity')}</Label>
                <Input
                  type="number"
                  value={productForm.totalQuantity}
                  onChange={(e) => setProductForm({ ...productForm, totalQuantity: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('products.maxPerOrder')}</Label>
                <Input
                  type="number"
                  value={productForm.maxPerOrder || ''}
                  onChange={(e) => setProductForm({ ...productForm, maxPerOrder: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('products.sortOrder')}</Label>
                <Input
                  type="number"
                  value={productForm.sortOrder || ''}
                  onChange={(e) => setProductForm({ ...productForm, sortOrder: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <Label>{t('products.isVisible')}</Label>
              <Switch
                checked={productForm.isVisible ?? true}
                onCheckedChange={(val) => setProductForm({ ...productForm, isVisible: val })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProductDialog(false)}>
              {tButtons('cancel')}
            </Button>
            <Button
              onClick={handleSaveProduct}
              disabled={createProduct.isPending || updateProduct.isPending || !productForm.name}
            >
              {(createProduct.isPending || updateProduct.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {tButtons('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {deleteConfirm?.type === 'campaign' ? t('deleteCampaign') : t('products.deleteProduct')}
            </DialogTitle>
            <DialogDescription>
              {deleteConfirm?.type === 'campaign' ? t('deleteCampaignConfirm') : t('products.deleteProductConfirm')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              {tButtons('cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={removeCampaign.isPending || removeProduct.isPending}>
              {(removeCampaign.isPending || removeProduct.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {tButtons('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sub-component: Campaign Products
function CampaignProducts({
  campaignId,
  t,
  onAdd,
  onEdit,
  onDelete,
}: {
  campaignId: string;
  t: any;
  onAdd: () => void;
  onEdit: (product: any) => void;
  onDelete: (productId: string) => void;
}) {
  const { data: productsData, isLoading } = useCampaignProductControllerFindProducts(campaignId);
  const products = Array.isArray(productsData) ? productsData : [];

  if (isLoading) {
    return <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">{t('products.title')}</h4>
        <Button size="sm" variant="outline" onClick={onAdd}>
          <Plus className="mr-2 h-3 w-3" />
          {t('products.addProduct')}
        </Button>
      </div>
      {products.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">{t('products.noProducts')}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('products.name')}</TableHead>
              <TableHead>{t('products.originalPrice')}</TableHead>
              <TableHead>{t('products.totalQuantity')}</TableHead>
              <TableHead>{t('products.maxPerOrder')}</TableHead>
              <TableHead>{t('products.isVisible')}</TableHead>
              <TableHead className="w-[80px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product: any) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.originalPrice?.toLocaleString()}</TableCell>
                <TableCell>{product.totalQuantity}</TableCell>
                <TableCell>{product.maxPerOrder || '-'}</TableCell>
                <TableCell>
                  <Badge variant={product.isVisible ? 'default' : 'secondary'}>
                    {product.isVisible ? 'Yes' : 'No'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(product)}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onDelete(product.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

// Sub-component: Campaign Orders
function CampaignOrders({ campaignId, t }: { campaignId: string; t: any }) {
  const [paymentFilter, setPaymentFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  const { data: ordersData, isLoading } = useCampaignOrderControllerFindAll(
    campaignId,
    {
      paymentStatus: paymentFilter ? (paymentFilter as any) : undefined,
      page,
      limit: 10,
    },
  );

  const orders = Array.isArray(ordersData) ? ordersData : (ordersData as any)?.data ?? [];
  const total = (ordersData as any)?.total ?? orders.length;

  if (isLoading) {
    return <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">{t('orders.title')}</h4>
        <Select value={paymentFilter} onValueChange={(val) => { setPaymentFilter(val === 'all' ? '' : val); setPage(1); }}>
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
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">{t('orders.noOrders')}</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('orders.orderId')}</TableHead>
                <TableHead>{t('orders.customerName')}</TableHead>
                <TableHead>{t('orders.phone')}</TableHead>
                <TableHead>{t('orders.email')}</TableHead>
                <TableHead>{t('orders.paymentStatus')}</TableHead>
                <TableHead>{t('orders.createdAt')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.id?.slice(0, 8)}...</TableCell>
                  <TableCell>{order.lastName} {order.firstName}</TableCell>
                  <TableCell>{order.phoneNumber}</TableCell>
                  <TableCell>{order.email || '-'}</TableCell>
                  <TableCell>
                    <Badge className={paymentStatusColors[order.paymentStatus] || ''} variant="secondary">
                      {t(`orders.paymentStatuses.${order.paymentStatus}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{new Date(order.createdAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {total > 10 && (
            <div className="flex justify-center gap-2">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <span className="flex items-center text-sm text-muted-foreground">
                {page} / {Math.ceil(total / 10)}
              </span>
              <Button size="sm" variant="outline" disabled={page >= Math.ceil(total / 10)} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
