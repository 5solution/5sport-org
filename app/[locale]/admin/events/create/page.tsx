'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useEventControllerCreate } from '@/lib/services/events/events';

import {
  StepBasicInfo,
  validateBasicInfo,
  defaultFormData,
  type EventFormData,
} from '@/components/admin/events/create/step-basic-info';
import { StepTimeline, validateTimeline } from '@/components/admin/events/create/step-timeline';
import { StepPayment, validatePayment } from '@/components/admin/events/create/step-payment';

export default function CreateEventPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string;
  const t = useTranslations('admin.events');
  const tCommon = useTranslations('common.buttons');
  const tVal = useTranslations('admin.events.validation');

  const steps = [
    { title: t('steps.basicInfo.title'), description: t('steps.basicInfo.description') },
    { title: t('steps.timeline.title'), description: t('steps.timeline.description') },
    { title: t('steps.payment.title'), description: t('steps.payment.description') },
  ];
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<EventFormData>(defaultFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  const createMutation = useEventControllerCreate();

  const handleChange = (field: string, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    setSubmitError('');
  };

  const validateStep = (): boolean => {
    let stepErrors: Record<string, string> = {};
    if (currentStep === 0) stepErrors = validateBasicInfo(formData, tVal);
    else if (currentStep === 1) stepErrors = validateTimeline(formData);
    else if (currentStep === 2) stepErrors = validatePayment(formData);
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
      setErrors({});
    }
  };

  const toISOString = (datetimeLocal: string) => {
    if (!datetimeLocal) return undefined;
    return new Date(datetimeLocal).toISOString();
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    try {
      const payload = {
        name: formData.name.trim(),
        brand: formData.brand.trim() || undefined,
        sportType: formData.sportType as 'PICKLEBALL' | 'BADMINTON',
        hotline: formData.hotline.trim(),
        address: formData.address.trim(),
        provinceCode: formData.provinceCode.trim(),
        wardCode: formData.wardCode.trim(),
        prefixCode: formData.prefixCode.trim(),
        allowTransfer: formData.allowTransfer,
        eventStartTime: toISOString(formData.eventStartTime)!,
        eventEndTime: toISOString(formData.eventEndTime)!,
        editInfoOpenTime: toISOString(formData.editInfoOpenTime)!,
        editInfoCloseTime: toISOString(formData.editInfoCloseTime)!,
        checkinOpenTime: toISOString(formData.checkinOpenTime)!,
        checkinCloseTime: toISOString(formData.checkinCloseTime)!,
        transferOpenTime: formData.allowTransfer ? toISOString(formData.transferOpenTime) : undefined,
        transferCloseTime: formData.allowTransfer ? toISOString(formData.transferCloseTime) : undefined,
        paymentMethods: formData.paymentMethods as any[],
      };

      const result = await createMutation.mutateAsync({ data: payload });
      const eventId = (result as any)?.data?.id ?? (result as any)?.id;
      toast.success(t('messages.createSuccess'));
      if (eventId) {
        router.push(`/${locale}/admin/events/${eventId}`);
      } else {
        router.push(`/${locale}/admin/events`);
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || t('messages.createFailed');
      setSubmitError(message);
      toast.error(t('messages.createFailed'), { description: message });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4 pt-12 lg:pt-0">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/${locale}/admin/events`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">
            {t('createPage.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('createPage.subtitle')}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="px-4 sm:px-6">
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-0 mb-2">
            {steps.map((step, index) => (
              <div key={step.title} className="flex items-center">
                {/* Step Circle */}
                <button
                  type="button"
                  onClick={() => {
                    if (index < currentStep) setCurrentStep(index);
                  }}
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-medium transition-colors',
                    index < currentStep
                      ? 'bg-primary text-primary-foreground cursor-pointer'
                      : index === currentStep
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                  )}
                >
                  {index < currentStep ? <Check className="h-4 w-4" /> : index + 1}
                </button>
                {/* Step Label (hidden on mobile) */}
                <div className="ml-2 hidden sm:block">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'mx-3 h-0.5 w-8 sm:w-16',
                      index < currentStep ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="px-4 sm:px-6">
          {/* Error Banner */}
          {submitError && (
            <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {submitError}
            </div>
          )}

          {/* Step Content */}
          {currentStep === 0 && (
            <StepBasicInfo formData={formData} errors={errors} onChange={handleChange} />
          )}
          {currentStep === 1 && (
            <StepTimeline formData={formData} errors={errors} onChange={handleChange} />
          )}
          {currentStep === 2 && (
            <StepPayment formData={formData} errors={errors} onChange={handleChange} />
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between border-t pt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0 || createMutation.isPending}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {tCommon('back')}
            </Button>
            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext}>
                {tCommon('next')}
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('createNew')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
