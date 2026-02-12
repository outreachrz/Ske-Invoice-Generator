
import { Product, BankDetails, CompanyDetails } from './types';

export const COMPANY_DETAILS: CompanyDetails = {
  name: 'SRI KRISHNAA ENTERPRISES',
  address: 'Plot #98-100, Ramachandra Residency, Srinivasa Nagar colony, Nizampet Village, Hyderabad, Telangana - 500090',
  contact: '8121522223',
  mobileNumber: '8121522223',
  email: 'ske.co.in@gmail.com',
  website: 'organick.in',
  gstin: '36ADCPC3276H2ZR',
  logo: 'https://i.ibb.co/cftc0v5/SKE-LOGO.png',
  signature: 'https://i.ibb.co/0V29STNH/Sign-Pratap.png'
};

export const DEFAULT_BANK_DETAILS: BankDetails = {
  bankName: 'Syndicate Bank',
  accountHolder: 'SRI KRISHNAA ENTERPRISES',
  accountNo: '33183070000301',
  accountType: 'Current Account',
  ifsc: 'SYNB0003318',
  branch: 'Pragathi Nagar, Hyderabad',
  upiId: 'skenterprises@upi'
};

export const DEFAULT_TERMS = [
  'Goods once sold will not be taken back.',
  'Interest @ 18% p.a. will be charged if payment is not made within 15 days.',
  'Discrepancy must be reported within 3 days of delivery.',
  'Subject to Hyderabad Jurisdiction only.'
];

export const MASTER_PRODUCTS: Product[] = [
  { id: '1', name: 'ACRID (250 ml)', hsnCode: '3808:9910', rate: 200, gstRate: 18 },
  { id: '2', name: 'ACRID (500 ml)', hsnCode: '3808:9910', rate: 350, gstRate: 18 },
  { id: '3', name: 'BHU-MITRA (5 Lt)', hsnCode: '3101:0099', rate: 700, gstRate: 5 },
  { id: '4', name: 'BHU-MITRA (10 Lt)', hsnCode: '3101:0099', rate: 1250, gstRate: 5 },
  { id: '5', name: 'BHU-MITRA (20 Lt)', hsnCode: '3101:0099', rate: 4285.72, gstRate: 5 },
  { id: '6', name: 'BHU-MITRA-I', hsnCode: '3101:0099', rate: 166.67, gstRate: 5 },
  { id: '7', name: 'BLUME (1 Lt)', hsnCode: '3808:9340', rate: 466.11, gstRate: 18 },
  { id: '8', name: 'CALLUS - D (1 Lt)', hsnCode: '3808:9340', rate: 250, gstRate: 18 },
  { id: '9', name: 'CALLUS - F (250 Ml)', hsnCode: '3808:9340', rate: 238.1, gstRate: 5 },
  { id: '10', name: 'CALLUS - F (1 Lt)', hsnCode: '3808:9340', rate: 310, gstRate: 18 },
  { id: '11', name: 'BHU-AMRUT (10Lt)', hsnCode: '3101:0099', rate: 1095.24, gstRate: 5 },
  { id: '12', name: 'CALLUS-D (5 Lt)', hsnCode: '3808:9340', rate: 2712, gstRate: 18 },
  { id: '13', name: 'CANOPY- F (250 gm)', hsnCode: '3808:9290', rate: 254.24, gstRate: 18 },
  { id: '14', name: 'CANOPY - F (500 gm)', hsnCode: '3808:9290', rate: 650, gstRate: 18 },
  { id: '15', name: 'CALLUS-F( 250ml)', hsnCode: '3808:9340', rate: 90, gstRate: 18 },
  { id: '16', name: 'CLEAR DRIP (1 Lt)', hsnCode: '3808:9340', rate: 310, gstRate: 18 },
  { id: '17', name: 'BHU-MITRA (1 Lt)', hsnCode: '3101:0099', rate: 190.48, gstRate: 5 },
  { id: '18', name: 'GENIMEN (1 Lt)', hsnCode: '3808:9340', rate: 508.48, gstRate: 18 },
  { id: '19', name: 'SEA-MAX250ml', hsnCode: '3101:0099', rate: 238.1, gstRate: 5 },
  { id: '20', name: 'GLOSIL (500 Ml)', hsnCode: '3104:9090', rate: 523.81, gstRate: 5 },
  { id: '21', name: 'GLOSIL (1 Lt)', hsnCode: '3104:9090', rate: 250, gstRate: 18 },
  { id: '22', name: 'KRISIL (100 ml)', hsnCode: '3824:9017', rate: 122.8, gstRate: 18 },
  { id: '23', name: 'KRISIL (250 ml)', hsnCode: '3824:9017', rate: 275, gstRate: 18 },
  { id: '24', name: 'KRISIL (500 ml)', hsnCode: '3824:9017', rate: 636, gstRate: 18 },
  { id: '25', name: 'KRRISH-DOWNY (500 ml)', hsnCode: '3808:9910', rate: 300, gstRate: 5 },
  { id: '26', name: 'KRRISH-DOWNY (1 Lt)', hsnCode: '3808:9910', rate: 575, gstRate: 5 },
  { id: '27', name: 'SEA-MAX 500ml', hsnCode: '3101:0099', rate: 165, gstRate: 5 },
  { id: '28', name: 'GENIMEN (500 ml)', hsnCode: '3808:9340', rate: 165, gstRate: 18 },
  { id: '29', name: 'CANOPY- F (150 Gm)', hsnCode: '3808:9290', rate: 169.5, gstRate: 18 },
  { id: '30', name: 'BHU-AMRUT 5 Lt', hsnCode: '3101:0099', rate: 500, gstRate: 5 },
  { id: '31', name: 'RETRO - VIR (250 gm)', hsnCode: '3808:9290', rate: 225, gstRate: 18 },
  { id: '32', name: 'RETRO - VIR (500 gm)', hsnCode: '3808:9290', rate: 932.21, gstRate: 18 },
  { id: '33', name: 'BHU-AMRUT 20Lt', hsnCode: '3808:9340', rate: 1800, gstRate: 5 },
  { id: '34', name: 'SHIELD - S (250 ml)', hsnCode: '3808:9910', rate: 275, gstRate: 5 },
  { id: '35', name: 'SHIELD - S (500 ml)', hsnCode: '3808:9910', rate: 847, gstRate: 5 },
  { id: '36', name: 'SHIELD - S (1 Lt)', hsnCode: '3808:9910', rate: 600, gstRate: 5 },
  { id: '37', name: 'ULTRA LEGEND (250 ml)', hsnCode: '1515:9020', rate: 200, gstRate: 5 },
  { id: '38', name: 'ULTRA LEGEND (500 ml)', hsnCode: '1515:9020', rate: 400, gstRate: 5 },
  { id: '39', name: 'BLUME 500 ml', hsnCode: '3808:9340', rate: 275.43, gstRate: 18 },
  { id: '40', name: 'SEA-MAX (1Lt)', hsnCode: '3808:9340', rate: 428.58, gstRate: 5 },
  { id: '41', name: 'KRISH ZYME (30 Kgs)', hsnCode: '3101:0099', rate: 2571, gstRate: 5 },
  { id: '42', name: 'WONDER - 17 (250 ml)', hsnCode: '', rate: 211.87, gstRate: 18 }
];
