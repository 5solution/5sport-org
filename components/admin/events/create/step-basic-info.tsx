'use client';

import { useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useListProvinces,
  useListWardsByProvince,
} from '@/lib/services/provinces/provinces';

export interface EventFormData {
  name: string;
  brand: string;
  sportType: string;
  hotline: string;
  address: string;
  provinceCode: string;
  wardCode: string;
  prefixCode: string;
  allowTransfer: boolean;
  eventStartTime: string;
  eventEndTime: string;
  editInfoOpenTime: string;
  editInfoCloseTime: string;
  checkinOpenTime: string;
  checkinCloseTime: string;
  transferOpenTime: string;
  transferCloseTime: string;
  paymentMethods: string[];
}

export const defaultFormData: EventFormData = {
  name: '',
  brand: '',
  sportType: '',
  hotline: '',
  address: '',
  provinceCode: '',
  wardCode: '',
  prefixCode: '',
  allowTransfer: true,
  eventStartTime: '',
  eventEndTime: '',
  editInfoOpenTime: '',
  editInfoCloseTime: '',
  checkinOpenTime: '',
  checkinCloseTime: '',
  transferOpenTime: '',
  transferCloseTime: '',
  paymentMethods: [],
};

interface StepBasicInfoProps {
  formData: EventFormData;
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
}

export function StepBasicInfo({ formData, errors, onChange }: StepBasicInfoProps) {
  const [provinceSearch, setProvinceSearch] = useState('');
  const [wardSearch, setWardSearch] = useState('');
  const t = useTranslations('admin.events.fields');
  const tSports = useTranslations('admin.events.sports');
  const tMsg = useTranslations('admin.events.messages');

  const { data: provinces = [], isLoading: provincesLoading } = useListProvinces();
  const { data: wards = [], isLoading: wardsLoading } = useListWardsByProvince(
    Number(formData.provinceCode),
    { enabled: !!formData.provinceCode },
  );

  const filteredProvinces = provinceSearch
    ? provinces.filter((p) => p.name.toLowerCase().includes(provinceSearch.toLowerCase()))
    : provinces;

  const filteredWards = wardSearch
    ? (wards ?? []).filter((w) => w.name.toLowerCase().includes(wardSearch.toLowerCase()))
    : (wards ?? []);

  const handleProvinceChange = (value: string) => {
    onChange('provinceCode', value);
    onChange('wardCode', '');
    setWardSearch('');
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Event Name */}
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="name">
            {t('eventName')} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder={t('eventNamePlaceholder')}
            value={formData.name}
            onChange={(e) => onChange('name', e.target.value)}
            maxLength={256}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
        </div>

        {/* Brand */}
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="brand">{t('brand')}</Label>
          <Input
            id="brand"
            placeholder={t('brandPlaceholder')}
            value={formData.brand}
            onChange={(e) => onChange('brand', e.target.value)}
            maxLength={256}
          />
        </div>

        {/* Sport Type */}
        <div className="space-y-2">
          <Label>
            {t('sportType')} <span className="text-destructive">*</span>
          </Label>
          <Select value={formData.sportType} onValueChange={(v) => onChange('sportType', v)}>
            <SelectTrigger>
              <SelectValue placeholder={t('sportTypePlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PICKLEBALL">{tSports('pickleball')}</SelectItem>
              <SelectItem value="BADMINTON">{tSports('badminton')}</SelectItem>
            </SelectContent>
          </Select>
          {errors.sportType && <p className="text-sm text-destructive">{errors.sportType}</p>}
        </div>

        {/* Hotline */}
        <div className="space-y-2">
          <Label htmlFor="hotline">
            {t('hotline')} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="hotline"
            placeholder={t('hotlinePlaceholder')}
            value={formData.hotline}
            onChange={(e) => onChange('hotline', e.target.value)}
            maxLength={20}
          />
          {errors.hotline && <p className="text-sm text-destructive">{errors.hotline}</p>}
        </div>

        {/* Address */}
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="address">
            {t('address')} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="address"
            placeholder={t('addressPlaceholder')}
            value={formData.address}
            onChange={(e) => onChange('address', e.target.value)}
          />
          {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
        </div>

        {/* Province Select */}
        <div className="space-y-2">
          <Label>
            {t('province')} <span className="text-destructive">*</span>
          </Label>
          <Select value={formData.provinceCode} onValueChange={handleProvinceChange}>
            <SelectTrigger>
              <SelectValue placeholder={provincesLoading ? t('provinceLoading') : t('provincePlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <div className="flex items-center gap-2 px-2 pb-2">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <Input
                  placeholder={tMsg('searchProvince')}
                  value={provinceSearch}
                  onChange={(e) => setProvinceSearch(e.target.value)}
                  className="h-8"
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>
              {provincesLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : filteredProvinces.length === 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  {tMsg('noProvinceFound')}
                </div>
              ) : (
                filteredProvinces.map((province) => (
                  <SelectItem key={province.code} value={String(province.code)}>
                    {province.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.provinceCode && <p className="text-sm text-destructive">{errors.provinceCode}</p>}
        </div>

        {/* Ward Select */}
        <div className="space-y-2">
          <Label>
            {t('ward')} <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.wardCode}
            onValueChange={(v) => onChange('wardCode', v)}
            disabled={!formData.provinceCode}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  !formData.provinceCode
                    ? t('wardPlaceholderNoProvince')
                    : wardsLoading
                      ? t('wardLoading')
                      : t('wardPlaceholder')
                }
              />
            </SelectTrigger>
            <SelectContent>
              <div className="flex items-center gap-2 px-2 pb-2">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <Input
                  placeholder={tMsg('searchWard')}
                  value={wardSearch}
                  onChange={(e) => setWardSearch(e.target.value)}
                  className="h-8"
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>
              {wardsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : filteredWards.length === 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  {tMsg('noWardFound')}
                </div>
              ) : (
                filteredWards.map((ward) => (
                  <SelectItem key={ward.code} value={String(ward.code)}>
                    {ward.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.wardCode && <p className="text-sm text-destructive">{errors.wardCode}</p>}
        </div>

        {/* Prefix Code */}
        <div className="space-y-2">
          <Label htmlFor="prefixCode">
            {t('prefixCode')} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="prefixCode"
            placeholder={t('prefixCodePlaceholder')}
            value={formData.prefixCode}
            onChange={(e) => onChange('prefixCode', e.target.value.toUpperCase())}
            maxLength={6}
            className="uppercase"
          />
          <p className="text-xs text-muted-foreground">{t('prefixCodeHelp')}</p>
          {errors.prefixCode && <p className="text-sm text-destructive">{errors.prefixCode}</p>}
        </div>
      </div>
    </div>
  );
}

// Note: Validation function can't use hooks, so validation messages are passed from the parent component
export function validateBasicInfo(data: EventFormData, t?: any): Record<string, string> {
  const errors: Record<string, string> = {};
  const getMsg = (key: string, fallback: string) => t ? t(key) : fallback;

  if (!data.name.trim()) errors.name = getMsg('eventNameRequired', 'Event name is required');
  if (!data.sportType) errors.sportType = getMsg('sportTypeRequired', 'Sport type is required');
  if (!data.hotline.trim()) errors.hotline = getMsg('hotlineRequired', 'Hotline is required');
  if (!data.address.trim()) errors.address = getMsg('addressRequired', 'Address is required');
  if (!data.provinceCode) errors.provinceCode = getMsg('provinceRequired', 'Province is required');
  if (!data.wardCode) errors.wardCode = getMsg('wardRequired', 'Ward is required');
  if (!data.prefixCode.trim()) errors.prefixCode = getMsg('prefixCodeRequired', 'Prefix code is required');
  return errors;
}
