
export interface Product {
  id: string;
  name: string;
  hsnCode: string;
  rate: number;
  gstRate: number;
}

export interface Customer {
  name: string;
  address: string;
  phone: string;
  gstin: string;
}

export interface SavedCustomer extends Customer {
  id: string;
}

export interface CompanyDetails {
  name: string;
  address: string;
  contact: string;
  mobileNumber?: string;
  email: string;
  website: string;
  gstin: string;
  logo: string;
  signature: string;
}

export interface BankDetails {
  bankName: string;
  accountHolder: string;
  accountNo: string;
  accountType?: string;
  ifsc: string;
  branch: string;
  upiId?: string;
}

export interface InvoiceItem {
  id: string;
  productId: string;
  description: string;
  hsnCode: string;
  gstRate: number;
  itemRate: number;
  qty: number;
}

export enum SaleType {
  CENTRAL = 'Central',
  LOCAL = 'Local'
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  date: string;
  poNo: string;
  vehicleNo: string;
  saleType: SaleType;
  billingAddress: Customer;
  shippingAddress: Customer;
  companyDetails: CompanyDetails;
  items: InvoiceItem[];
  discount: number;
  freightCharges: number;
  bankDetails: BankDetails;
  terms: string[];
  logo: string;
  qrCode?: string;
  signature: string;
}
