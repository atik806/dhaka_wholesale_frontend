/**
 * Checkout field rules, matching the backend's CheckoutOrderSchema
 * (Dhaka_wholesale-backend src/modules/orders/dto/create-order.dto.ts) so the
 * customer sees a field error instead of a rejected order.
 */
export interface ShippingFields {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
}

/** 01XXXXXXXXX for a valid Bangladeshi mobile number, otherwise null. */
export function normalizeBdMobile(value: string): string | null {
  const digits = value.replace(/[\s()-]/g, "").replace(/^\+/, "");
  const local = digits.startsWith("880") ? digits.slice(2) : digits;
  return /^01[3-9]\d{8}$/.test(local) ? local : null;
}

export function validateShipping(values: ShippingFields): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!values.firstName.trim()) errors.firstName = "Required";
  if (!values.lastName.trim()) errors.lastName = "Required";
  if (!values.email.trim()) errors.email = "Required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = "Invalid email";
  if (!values.phone.trim()) errors.phone = "Required";
  else if (!normalizeBdMobile(values.phone)) errors.phone = "Enter a valid Bangladeshi mobile number, e.g. 01712345678";
  if (!values.address.trim()) errors.address = "Required";
  else if (values.address.trim().length < 5) errors.address = "Enter your full delivery address";
  if (!values.city.trim()) errors.city = "Required";
  else if (values.city.trim().length < 2) errors.city = "Enter your city";
  if (!values.zipCode.trim()) errors.zipCode = "Required";
  return errors;
}
