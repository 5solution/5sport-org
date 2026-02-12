'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

        {/* Province Code */}
        <div className="space-y-2">
          <Label htmlFor="provinceCode">
            Province Code <span className="text-destructive">*</span>
          </Label>
          <Input
            id="provinceCode"
            placeholder="e.g. 01"
            value={formData.provinceCode}
            onChange={(e) => onChange('provinceCode', e.target.value)}
          />
          {errors.provinceCode && <p className="text-sm text-destructive">{errors.provinceCode}</p>}
        </div>

        {/* Ward Code */}
        <div className="space-y-2">
          <Label htmlFor="wardCode">
            Ward Code <span className="text-destructive">*</span>
          </Label>
          <Input
            id="wardCode"
            placeholder="e.g. 00001"
            value={formData.wardCode}
            onChange={(e) => onChange('wardCode', e.target.value)}
          />
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
  if (!data.provinceCode.trim()) errors.provinceCode = 'Province code is required';
  if (!data.wardCode.trim()) errors.wardCode = 'Ward code is required';
  if (!data.prefixCode.trim()) errors.prefixCode = 'Prefix code is required';
  return errors;
}
