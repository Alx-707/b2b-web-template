'use client';

import { useActionState, useState } from 'react';
import { CheckCircle, Loader2, MessageSquare, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export interface ProductInquiryFormProps {
  /** Product name to display in the form */
  productName: string;
  /** Product slug for reference */
  productSlug: string;
  /** Custom class name */
  className?: string;
  /** Callback when form is submitted successfully */
  onSuccess?: () => void;
}

interface FormState {
  success: boolean;
  error: string | undefined;
}

const initialState: FormState = {
  success: false,
  error: undefined,
};

// Success message component
function SuccessMessage({ message }: { message: string }) {
  return (
    <CardContent className='flex flex-col items-center justify-center py-12 text-center'>
      <CheckCircle className='mb-4 h-12 w-12 text-green-500' />
      <p className='text-lg font-medium'>{message}</p>
    </CardContent>
  );
}

// Form header component
interface FormHeaderProps {
  title: string;
  description: string;
}

function FormHeader({ title, description }: FormHeaderProps) {
  return (
    <CardHeader className='bg-muted/50'>
      <CardTitle className='flex items-center gap-2 text-lg'>
        <MessageSquare className='h-5 w-5' />
        {title}
      </CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
  );
}

// Error display component
function ErrorMessage({ error }: { error: string }) {
  return (
    <div className='flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-600'>
      <XCircle className='h-4 w-4' />
      {error}
    </div>
  );
}

// Submit button component
interface SubmitButtonProps {
  isSubmitting: boolean;
  submitLabel: string;
  submittingLabel: string;
}

function SubmitButton({
  isSubmitting,
  submitLabel,
  submittingLabel,
}: SubmitButtonProps) {
  return (
    <Button
      type='submit'
      className='w-full'
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <>
          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          {submittingLabel}
        </>
      ) : (
        submitLabel
      )}
    </Button>
  );
}

// Product display component
function ProductDisplay({
  label,
  productName,
}: {
  label: string;
  productName: string;
}) {
  return (
    <div className='rounded-md bg-muted/50 p-3'>
      <Label className='text-xs text-muted-foreground'>{label}</Label>
      <p className='font-medium'>{productName}</p>
    </div>
  );
}

// Contact fields component
interface ContactFieldsProps {
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
}

function ContactFields({
  nameLabel,
  namePlaceholder,
  emailLabel,
  emailPlaceholder,
}: ContactFieldsProps) {
  return (
    <div className='grid gap-4 sm:grid-cols-2'>
      <div className='space-y-2'>
        <Label htmlFor='inquiry-name'>{nameLabel} *</Label>
        <Input
          id='inquiry-name'
          name='name'
          required
          placeholder={namePlaceholder}
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor='inquiry-email'>{emailLabel} *</Label>
        <Input
          id='inquiry-email'
          name='email'
          type='email'
          required
          placeholder={emailPlaceholder}
        />
      </div>
    </div>
  );
}

// Company field component
function CompanyField({
  label,
  placeholder,
}: {
  label: string;
  placeholder: string;
}) {
  return (
    <div className='space-y-2'>
      <Label htmlFor='inquiry-company'>{label}</Label>
      <Input
        id='inquiry-company'
        name='company'
        placeholder={placeholder}
      />
    </div>
  );
}

// Quantity and price fields component
interface QuantityPriceFieldsProps {
  quantityLabel: string;
  quantityPlaceholder: string;
  priceLabel: string;
  pricePlaceholder: string;
}

function QuantityPriceFields({
  quantityLabel,
  quantityPlaceholder,
  priceLabel,
  pricePlaceholder,
}: QuantityPriceFieldsProps) {
  return (
    <div className='grid gap-4 sm:grid-cols-2'>
      <div className='space-y-2'>
        <Label htmlFor='inquiry-quantity'>{quantityLabel} *</Label>
        <Input
          id='inquiry-quantity'
          name='quantity'
          required
          placeholder={quantityPlaceholder}
        />
      </div>
      <div className='space-y-2'>
        <Label htmlFor='inquiry-targetPrice'>{priceLabel}</Label>
        <Input
          id='inquiry-targetPrice'
          name='targetPrice'
          placeholder={pricePlaceholder}
        />
      </div>
    </div>
  );
}

// Requirements field component
function RequirementsField({
  label,
  placeholder,
}: {
  label: string;
  placeholder: string;
}) {
  return (
    <div className='space-y-2'>
      <Label htmlFor='inquiry-requirements'>{label}</Label>
      <Textarea
        id='inquiry-requirements'
        name='requirements'
        rows={4}
        placeholder={placeholder}
      />
    </div>
  );
}

/**
 * Product inquiry form for B2B product pages.
 *
 * A simplified inquiry form designed for foreign trade scenarios.
 * Collects basic contact info and inquiry details.
 */
export function ProductInquiryForm({
  productName,
  productSlug,
  className,
  onSuccess,
}: ProductInquiryFormProps) {
  const t = useTranslations('products.inquiry');
  const tContact = useTranslations('contact.form');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simple form action - in production, this would connect to a server action
  async function handleSubmit(
    _prevState: FormState,
    formData: FormData,
  ): Promise<FormState> {
    setIsSubmitting(true);

    try {
      // Simulate API call - in production, replace with actual server action
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Log the inquiry for demo purposes
      const inquiryData = {
        productSlug,
        productName,
        name: formData.get('name'),
        email: formData.get('email'),
        company: formData.get('company'),
        quantity: formData.get('quantity'),
        targetPrice: formData.get('targetPrice'),
        requirements: formData.get('requirements'),
      };

      // eslint-disable-next-line no-console
      console.log('Product inquiry submitted:', inquiryData);

      onSuccess?.();
      return { success: true, error: undefined };
    } catch {
      return { success: false, error: t('error') };
    } finally {
      setIsSubmitting(false);
    }
  }

  const [state, formAction] = useActionState(handleSubmit, initialState);

  if (state.success) {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <SuccessMessage message={t('success')} />
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <FormHeader
        title={t('title')}
        description={t('description')}
      />
      <CardContent className='pt-6'>
        <form
          action={formAction}
          className='space-y-4'
        >
          <input
            type='hidden'
            name='productSlug'
            value={productSlug}
          />
          <input
            type='hidden'
            name='productName'
            value={productName}
          />

          <ProductDisplay
            label={t('productName')}
            productName={productName}
          />
          <ContactFields
            nameLabel={tContact('firstName')}
            namePlaceholder={tContact('firstNamePlaceholder')}
            emailLabel={tContact('email')}
            emailPlaceholder={tContact('emailPlaceholder')}
          />
          <CompanyField
            label={tContact('company')}
            placeholder={tContact('companyPlaceholder')}
          />
          <QuantityPriceFields
            quantityLabel={t('quantity')}
            quantityPlaceholder={t('quantityPlaceholder')}
            priceLabel={t('targetPrice')}
            pricePlaceholder={t('targetPricePlaceholder')}
          />
          <RequirementsField
            label={t('requirements')}
            placeholder={t('requirementsPlaceholder')}
          />

          {state.error !== undefined && <ErrorMessage error={state.error} />}

          <SubmitButton
            isSubmitting={isSubmitting}
            submitLabel={t('submit')}
            submittingLabel={t('submitting')}
          />
        </form>
      </CardContent>
    </Card>
  );
}
