'use client';

import { useState } from 'react';
import { Loader2, Search } from 'lucide-react';

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
            Event Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="e.g. Pickleball Championship 2026"
            value={formData.name}
            onChange={(e) => onChange('name', e.target.value)}
            maxLength={256}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
        </div>

        {/* Brand */}
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="brand">Brand / Sponsor</Label>
          <Input
            id="brand"
            placeholder="e.g. VinSports"
            value={formData.brand}
            onChange={(e) => onChange('brand', e.target.value)}
            maxLength={256}
          />
        </div>

        {/* Sport Type */}
        <div className="space-y-2">
          <Label>
            Sport Type <span className="text-destructive">*</span>
          </Label>
          <Select value={formData.sportType} onValueChange={(v) => onChange('sportType', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select sport" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PICKLEBALL">Pickleball</SelectItem>
              <SelectItem value="BADMINTON">Badminton</SelectItem>
            </SelectContent>
          </Select>
          {errors.sportType && <p className="text-sm text-destructive">{errors.sportType}</p>}
        </div>

        {/* Hotline */}
        <div className="space-y-2">
          <Label htmlFor="hotline">
            Hotline <span className="text-destructive">*</span>
          </Label>
          <Input
            id="hotline"
            placeholder="0901234567"
            value={formData.hotline}
            onChange={(e) => onChange('hotline', e.target.value)}
            maxLength={20}
          />
          {errors.hotline && <p className="text-sm text-destructive">{errors.hotline}</p>}
        </div>

        {/* Address */}
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="address">
            Address <span className="text-destructive">*</span>
          </Label>
          <Input
            id="address"
            placeholder="Full venue address"
            value={formData.address}
            onChange={(e) => onChange('address', e.target.value)}
          />
          {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
        </div>

        {/* Province Select */}
        <div className="space-y-2">
          <Label>
            Province / City <span className="text-destructive">*</span>
          </Label>
          <Select value={formData.provinceCode} onValueChange={handleProvinceChange}>
            <SelectTrigger>
              <SelectValue placeholder={provincesLoading ? 'Loading...' : 'Select province'} />
            </SelectTrigger>
            <SelectContent>
              <div className="flex items-center gap-2 px-2 pb-2">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <Input
                  placeholder="Search province..."
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
                  No province found
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
            Ward / District <span className="text-destructive">*</span>
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
                    ? 'Select province first'
                    : wardsLoading
                      ? 'Loading...'
                      : 'Select ward'
                }
              />
            </SelectTrigger>
            <SelectContent>
              <div className="flex items-center gap-2 px-2 pb-2">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <Input
                  placeholder="Search ward..."
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
                  No ward found
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
            Prefix Code <span className="text-destructive">*</span>
          </Label>
          <Input
            id="prefixCode"
            placeholder="e.g. PKB"
            value={formData.prefixCode}
            onChange={(e) => onChange('prefixCode', e.target.value.toUpperCase())}
            maxLength={6}
            className="uppercase"
          />
          <p className="text-xs text-muted-foreground">Max 6 characters, auto-uppercase</p>
          {errors.prefixCode && <p className="text-sm text-destructive">{errors.prefixCode}</p>}
        </div>
      </div>
    </div>
  );
}

export function validateBasicInfo(data: EventFormData): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!data.name.trim()) errors.name = 'Event name is required';
  if (!data.sportType) errors.sportType = 'Sport type is required';
  if (!data.hotline.trim()) errors.hotline = 'Hotline is required';
  if (!data.address.trim()) errors.address = 'Address is required';
  if (!data.provinceCode) errors.provinceCode = 'Province is required';
  if (!data.wardCode) errors.wardCode = 'Ward is required';
  if (!data.prefixCode.trim()) errors.prefixCode = 'Prefix code is required';
  return errors;
}
