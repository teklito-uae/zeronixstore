import React from 'react';
import { Truck, ShoppingBag, MapPin } from 'lucide-react';
import { Button } from '../ui/button';

interface AddressFormData {
  first_name: string;
  last_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  type: 'home' | 'office' | 'other';
  is_default: boolean;
}

interface AddressFormProps {
  initialData?: Partial<AddressFormData>;
  onSubmit: (data: AddressFormData) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export const AddressForm: React.FC<AddressFormProps> = ({ 
  initialData, 
  onSubmit, 
  onCancel,
  isSubmitting 
}) => {
  const [formData, setFormData] = React.useState<AddressFormData>({
    first_name: initialData?.first_name || '',
    last_name: initialData?.last_name || '',
    address_line1: initialData?.address_line1 || '',
    address_line2: initialData?.address_line2 || '',
    city: initialData?.city || '',
    state: initialData?.state || 'Dubai',
    postal_code: initialData?.postal_code || '',
    country: initialData?.country || 'United Arab Emirates',
    type: initialData?.type || 'home',
    is_default: initialData?.is_default || false,
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.first_name) newErrors.first_name = 'Required';
    if (!formData.last_name) newErrors.last_name = 'Required';
    if (!formData.address_line1) newErrors.address_line1 = 'Required';
    if (!formData.city) newErrors.city = 'Required';
    if (!formData.state) newErrors.state = 'Required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const inputClassName = "flex h-11 w-full rounded-lg border border-border-subtle bg-bg-primary px-4 py-2 text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all";
  const labelClassName = "text-xs font-bold text-text-muted uppercase tracking-widest opacity-60 mb-1.5 block";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClassName}>First Name</label>
          <input
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            placeholder="e.g. John"
            className={`${inputClassName} ${errors.first_name ? 'border-red-500/50' : ''}`}
          />
        </div>
        <div>
          <label className={labelClassName}>Last Name</label>
          <input
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            placeholder="e.g. Doe"
            className={`${inputClassName} ${errors.last_name ? 'border-red-500/50' : ''}`}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClassName}>Address Line 1</label>
          <input
            name="address_line1"
            value={formData.address_line1}
            onChange={handleChange}
            placeholder="Street name, Villa/Apartment/Office number"
            className={`${inputClassName} ${errors.address_line1 ? 'border-red-500/50' : ''}`}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClassName}>Address Line 2 (Optional)</label>
          <input
            name="address_line2"
            value={formData.address_line2}
            onChange={handleChange}
            placeholder="Additional details, landmarks"
            className={inputClassName}
          />
        </div>
        <div>
          <label className={labelClassName}>City</label>
          <input
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="e.g. Dubai"
            className={`${inputClassName} ${errors.city ? 'border-red-500/50' : ''}`}
          />
        </div>
        <div>
          <label className={labelClassName}>State / Emirate</label>
          <select 
            name="state"
            value={formData.state}
            onChange={handleChange}
            className={inputClassName}
          >
            <option value="Dubai">Dubai</option>
            <option value="Abu Dhabi">Abu Dhabi</option>
            <option value="Sharjah">Sharjah</option>
            <option value="Ajman">Ajman</option>
            <option value="Umm Al Quwain">Umm Al Quwain</option>
            <option value="Ras Al Khaimah">Ras Al Khaimah</option>
            <option value="Fujairah">Fujairah</option>
          </select>
        </div>
        <div>
          <label className={labelClassName}>Postal Code</label>
          <input
            name="postal_code"
            value={formData.postal_code}
            onChange={handleChange}
            placeholder="00000"
            className={inputClassName}
          />
        </div>
        <div>
          <label className={labelClassName}>Country</label>
          <input
            name="country"
            value={formData.country}
            disabled
            className={`${inputClassName} bg-bg-surface opacity-60 cursor-not-allowed`}
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className={labelClassName}>Address Type</label>
        <div className="flex gap-3">
          {[
            { id: 'home', label: 'Home', icon: Truck },
            { id: 'office', label: 'Office', icon: ShoppingBag },
            { id: 'other', label: 'Other', icon: MapPin }
          ].map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: t.id as any }))}
              className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border font-bold text-[11px] uppercase tracking-widest transition-all ${
                formData.type === t.id 
                ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                : 'bg-bg-primary border-border-subtle text-text-muted hover:border-emerald-500/30'
              }`}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 py-2">
        <input 
          type="checkbox" 
          id="is_default"
          name="is_default"
          checked={formData.is_default}
          onChange={handleChange}
          className="h-4 w-4 rounded border-border-subtle text-emerald-500 focus:ring-emerald-500"
        />
        <label htmlFor="is_default" className="text-xs font-bold text-text-primary uppercase tracking-tight cursor-pointer">
          Set as primary address
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        {onCancel && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="flex-1 h-12 rounded-xl text-xs font-bold uppercase tracking-widest"
          >
            Cancel
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className={`h-12 rounded-xl text-xs font-bold uppercase tracking-widest bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 ${onCancel ? 'flex-1' : 'w-full'}`}
        >
          {isSubmitting ? 'Saving...' : 'Save Address'}
        </Button>
      </div>
    </form>
  );
};
