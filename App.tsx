
import { useState, useEffect, useRef, useMemo } from 'react';
import { Invoice, InvoiceItem, Customer, SavedCustomer, SaleType, Product, BankDetails, CompanyDetails } from './types';
import { MASTER_PRODUCTS as INITIAL_MASTER_PRODUCTS, DEFAULT_BANK_DETAILS, DEFAULT_TERMS, COMPANY_DETAILS } from './constants';
import InvoicePreview from './components/InvoicePreview';
// Added Globe to the imported icons from lucide-react
import { 
  Plus, Trash2, ChevronLeft, ChevronRight, 
  Landmark, ListChecks, Settings2, PackagePlus,
  Download, Loader2, Package, Search, Image as ImageIcon,
  PenTool, PlusCircle, MinusCircle, User, CreditCard, MapPin, Hash,
  Building2, ReceiptText, ShieldCheck, QrCode, Tag, Users, UserPlus,
  Contact2, Phone, Briefcase, Globe, Mail, Building, ListOrdered, ExternalLink
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const INITIAL_CUSTOMER: Customer = {
  name: '',
  address: '',
  phone: '',
  gstin: ''
};

const INITIAL_INVOICE: Invoice = {
  id: '',
  invoiceNo: '',
  date: new Date().toISOString().split('T')[0],
  poNo: '',
  vehicleNo: '',
  saleType: SaleType.LOCAL,
  billingAddress: { ...INITIAL_CUSTOMER },
  shippingAddress: { ...INITIAL_CUSTOMER },
  companyDetails: { ...COMPANY_DETAILS },
  items: [],
  discount: 0,
  freightCharges: 0,
  bankDetails: { ...DEFAULT_BANK_DETAILS },
  terms: [...DEFAULT_TERMS],
  logo: COMPANY_DETAILS.logo,
  qrCode: '',
  signature: COMPANY_DETAILS.signature
};

const App: React.FC = () => {
  const [invoice, setInvoice] = useState<Invoice>({ 
    ...INITIAL_INVOICE,
    invoiceNo: (Math.floor(Math.random() * 900) + 100).toString()
  });
  const [products, setProducts] = useState<Product[]>(INITIAL_MASTER_PRODUCTS);
  const [savedCustomers, setSavedCustomers] = useState<SavedCustomer[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'main' | 'settings'>('main');
  const [isExporting, setIsExporting] = useState(false);
  const [customerSearchContext, setCustomerSearchContext] = useState<'billing' | 'shipping' | null>(null);
  
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    hsnCode: '',
    rate: 0,
    gstRate: 18
  });

  const [newCustomer, setNewCustomer] = useState<Partial<SavedCustomer>>({
    name: '',
    address: '',
    phone: '',
    gstin: ''
  });

  const printableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedInvoice = localStorage.getItem('last_draft_ske');
    if (savedInvoice) {
      try {
        const parsed = JSON.parse(savedInvoice);
        setInvoice({
          ...INITIAL_INVOICE,
          ...parsed,
          companyDetails: { ...COMPANY_DETAILS, ...(parsed.companyDetails || {}) },
          bankDetails: { ...DEFAULT_BANK_DETAILS, ...parsed.bankDetails },
          terms: parsed.terms || [...DEFAULT_TERMS],
          logo: parsed.logo || COMPANY_DETAILS.logo,
          qrCode: parsed.qrCode || '',
          signature: parsed.signature || COMPANY_DETAILS.signature
        });
      } catch (e) {
        console.error('Error loading draft', e);
      }
    }

    const savedProducts = localStorage.getItem('ske_master_products');
    if (savedProducts) {
      try {
        setProducts(JSON.parse(savedProducts));
      } catch (e) {
        console.error('Error loading products', e);
      }
    }

    const savedCusts = localStorage.getItem('ske_saved_customers');
    if (savedCusts) {
      try {
        setSavedCustomers(JSON.parse(savedCusts));
      } catch (e) {
        console.error('Error loading customers', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('last_draft_ske', JSON.stringify(invoice));
  }, [invoice]);

  useEffect(() => {
    localStorage.setItem('ske_master_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('ske_saved_customers', JSON.stringify(savedCustomers));
  }, [savedCustomers]);

  const handleAddItem = (product?: Product) => {
    const newItem: InvoiceItem = {
      id: Math.random().toString(36).substring(2, 11),
      productId: product?.id || 'manual',
      description: product?.name || '',
      hsnCode: product?.hsnCode || '',
      gstRate: product?.gstRate || 0,
      itemRate: product?.rate || 0,
      qty: 1
    };
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
    setSearchTerm('');
  };

  const handleUpdateItem = (id: string, updates: Partial<InvoiceItem>) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, ...updates } : item)
    }));
  };

  const handleRemoveItem = (id: string) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const handleAddMasterProduct = () => {
    if (!newProduct.name || !newProduct.hsnCode) {
      alert("Please enter Product Name and HSN Code");
      return;
    }
    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name,
      hsnCode: newProduct.hsnCode,
      rate: Number(newProduct.rate) || 0,
      gstRate: Number(newProduct.gstRate) || 0,
    };
    setProducts(prev => [product, ...prev]);
    setNewProduct({ name: '', hsnCode: '', rate: 0, gstRate: 18 });
  };

  const handleRemoveMasterProduct = (id: string) => {
    if (window.confirm('Delete this product from master list?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleAddSavedCustomer = () => {
    if (!newCustomer.name || !newCustomer.address) {
      alert("Please enter Customer Name and Address");
      return;
    }
    const customer: SavedCustomer = {
      id: Date.now().toString(),
      name: newCustomer.name || '',
      address: newCustomer.address || '',
      phone: newCustomer.phone || '',
      gstin: newCustomer.gstin || '',
    };
    setSavedCustomers(prev => [customer, ...prev]);
    setNewCustomer({ name: '', address: '', phone: '', gstin: '' });
  };

  const handleRemoveSavedCustomer = (id: string) => {
    if (window.confirm('Delete this customer from your records?')) {
      setSavedCustomers(prev => prev.filter(c => c.id !== id));
    }
  };

  const selectSavedCustomer = (customer: SavedCustomer) => {
    if (customerSearchContext === 'billing') {
      setInvoice(prev => ({
        ...prev,
        billingAddress: {
          name: customer.name,
          address: customer.address,
          phone: customer.phone,
          gstin: customer.gstin
        }
      }));
    } else if (customerSearchContext === 'shipping') {
      setInvoice(prev => ({
        ...prev,
        shippingAddress: {
          name: customer.name,
          address: customer.address,
          phone: customer.phone,
          gstin: customer.gstin
        }
      }));
    }
    setCustomerSearchContext(null);
    setCustomerSearchTerm('');
  };

  const updateBankDetails = (updates: Partial<BankDetails>) => {
    setInvoice(prev => ({
      ...prev,
      bankDetails: { ...prev.bankDetails, ...updates }
    }));
  };

  const updateCompanyDetails = (updates: Partial<CompanyDetails>) => {
    setInvoice(prev => ({
      ...prev,
      companyDetails: { ...prev.companyDetails, ...updates }
    }));
  };

  const updateTerm = (index: number, value: string) => {
    const newTerms = [...invoice.terms];
    newTerms[index] = value;
    setInvoice(prev => ({ ...prev, terms: newTerms }));
  };

  const addTerm = () => {
    setInvoice(prev => ({ ...prev, terms: [...prev.terms, ''] }));
  };

  const insertTerm = (index: number) => {
    const newTerms = [...invoice.terms];
    newTerms.splice(index + 1, 0, '');
    setInvoice(prev => ({ ...prev, terms: newTerms }));
  };

  const removeTerm = (index: number) => {
    setInvoice(prev => ({ ...prev, terms: prev.terms.filter((_, i) => i !== index) }));
  };

  // Fuzzy product filtering
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const query = searchTerm.toLowerCase().trim();
    return products
      .map(p => {
        const name = p.name.toLowerCase();
        const code = p.hsnCode.toLowerCase();
        let score = name === query || code === query ? 100 : name.startsWith(query) ? 80 : name.includes(query) ? 50 : 0;
        return { product: p, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.product);
  }, [products, searchTerm]);

  // Saved customer filtering
  const filteredCustomers = useMemo(() => {
    const query = customerSearchTerm.toLowerCase().trim();
    if (!query) return savedCustomers;
    return savedCustomers.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.gstin.toLowerCase().includes(query) ||
      c.phone.includes(query)
    );
  }, [savedCustomers, customerSearchTerm]);

  const handleExportPDF = async () => {
    const element = document.getElementById('invoice-printable');
    if (!element) return;
    try {
      setIsExporting(true);
      
      // High-definition canvas settings for crystal clear text
      const canvas = await html2canvas(element, { 
        scale: 4, 
        useCORS: true, 
        logging: false, 
        backgroundColor: '#ffffff',
        width: element.offsetWidth,
        height: element.offsetHeight,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          const clonedEl = clonedDoc.getElementById('invoice-printable');
          if (clonedEl) {
            // Use setProperty to avoid TypeScript errors with vendor prefixes and dynamic properties
            clonedEl.style.setProperty('box-shadow', 'none');
            clonedEl.style.setProperty('border', 'none');
            // Font smoothing and text rendering are now handled by global CSS in index.html
          }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({ 
        orientation: 'p', 
        unit: 'mm', 
        format: 'a4',
        compress: true
      });

      // Map canvas to A4 dimensions (210x297mm) with precise mapping
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, undefined, 'SLOW');
      pdf.save(`SKE_Invoice_${invoice.invoiceNo}.pdf`);
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert('Failed to export PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const copyBillingToShipping = () => {
    setInvoice(prev => ({ ...prev, shippingAddress: { ...prev.billingAddress } }));
  };

  const CompanyDetailsEditor = () => (
    <div className="space-y-6">
      <div className="group">
        <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 group-focus-within:text-blue-600 transition-colors"><Building size={14} /> Company Name</label>
        <input type="text" value={invoice.companyDetails.name} onChange={e => updateCompanyDetails({ name: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-800 transition-all" />
      </div>
      
      <div className="group">
        <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 group-focus-within:text-blue-600 transition-colors"><MapPin size={14} /> Business Address</label>
        <textarea rows={3} value={invoice.companyDetails.address} onChange={e => updateCompanyDetails({ address: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm leading-relaxed" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="group">
          <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 group-focus-within:text-blue-600 transition-colors"><Phone size={14} /> Company Mobile Number</label>
          <input type="text" value={invoice.companyDetails.mobileNumber} onChange={e => updateCompanyDetails({ mobileNumber: e.target.value })} placeholder="8121522223" className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
        </div>
        <div className="group">
          <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 group-focus-within:text-blue-600 transition-colors"><Mail size={14} /> Email Address</label>
          <input type="email" value={invoice.companyDetails.email} onChange={e => updateCompanyDetails({ email: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="group">
          <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 group-focus-within:text-blue-600 transition-colors"><Globe size={14} /> Website</label>
          <input type="text" value={invoice.companyDetails.website} onChange={e => updateCompanyDetails({ website: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm text-blue-600 font-medium" />
        </div>
        <div className="group">
          <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 group-focus-within:text-blue-600 transition-colors"><ShieldCheck size={14} /> Company GSTIN</label>
          <input type="text" value={invoice.companyDetails.gstin} onChange={e => updateCompanyDetails({ gstin: e.target.value.toUpperCase() })} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-black text-gray-900 uppercase tracking-wider" />
        </div>
      </div>
    </div>
  );

  const BankDetailsEditor = () => (
    <div className="space-y-6">
      <div className="group">
        <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 group-focus-within:text-blue-600 transition-colors"><User size={14} /> Beneficiary Account Holder</label>
        <input type="text" value={invoice.bankDetails.accountHolder} onChange={e => updateBankDetails({ accountHolder: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-gray-800 transition-all" placeholder="SRI KRISHNAA ENTERPRISES" />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="group">
          <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 group-focus-within:text-blue-600 transition-colors"><CreditCard size={14} /> Account Number</label>
          <input type="text" value={invoice.bankDetails.accountNo} onChange={e => updateBankDetails({ accountNo: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-mono font-black text-gray-900 tracking-wider" placeholder="33183070000301" />
        </div>
        <div className="group">
          <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 group-focus-within:text-blue-600 transition-colors"><Briefcase size={14} /> Account Type</label>
          <input type="text" value={invoice.bankDetails.accountType} onChange={e => updateBankDetails({ accountType: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold" placeholder="Current Account / Savings" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="group">
          <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 group-focus-within:text-blue-600 transition-colors"><Hash size={14} /> IFSC Code</label>
          <input type="text" value={invoice.bankDetails.ifsc} onChange={e => updateBankDetails({ ifsc: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none uppercase font-black text-gray-800" placeholder="SYNB0003318" />
        </div>
        <div className="group">
          <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 group-focus-within:text-blue-600 transition-colors"><Building2 size={14} /> Bank Name</label>
          <input type="text" value={invoice.bankDetails.bankName} onChange={e => updateBankDetails({ bankName: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold" placeholder="Syndicate Bank" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="group">
          <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 group-focus-within:text-blue-600 transition-colors"><MapPin size={14} /> Branch Name</label>
          <input type="text" value={invoice.bankDetails.branch} onChange={e => updateBankDetails({ branch: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Pragathi Nagar, Hyderabad" />
        </div>
        <div className="group">
          <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 group-focus-within:text-blue-600 transition-colors"><Phone size={14} /> UPI ID (Optional)</label>
          <input type="text" value={invoice.bankDetails.upiId} onChange={e => updateBankDetails({ upiId: e.target.value })} className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-600" placeholder="yourname@upi" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans text-gray-900">
      <header className="bg-blue-900 text-white p-4 shadow-xl sticky top-0 z-50 flex items-center justify-between no-print border-b-2 border-blue-800">
        <div className="flex items-center gap-4">
          <div className="bg-white p-1 rounded-xl shadow-inner overflow-hidden flex items-center justify-center h-12 w-12">
            <img src={invoice.logo || invoice.companyDetails.logo || COMPANY_DETAILS.logo} alt="SKE Logo" className="h-full w-full object-contain" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-black tracking-tight uppercase leading-tight">{invoice.companyDetails.name}</h1>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest">Organic Fertilizers Solutions</p>
              </div>
              <div className="flex gap-4 mt-1 text-[9px] text-blue-200 font-medium">
                <span className="flex items-center gap-1"><Phone size={10} /> {invoice.companyDetails.mobileNumber || invoice.companyDetails.contact}</span>
                <span className="flex items-center gap-1"><Mail size={10} /> {invoice.companyDetails.email}</span>
                <span className="flex items-center gap-1"><Globe size={10} className="w-2.5 h-2.5" /> {invoice.companyDetails.website}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <div className="hidden sm:flex bg-blue-800 rounded-lg p-1 mr-1">
             <button onClick={() => setActiveTab('main')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'main' ? 'bg-white text-blue-900 shadow-md' : 'text-blue-200 hover:text-white'}`}>Invoice</button>
             <button onClick={() => setActiveTab('settings')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'settings' ? 'bg-white text-blue-900 shadow-md' : 'text-blue-200 hover:text-white'}`}>Settings</button>
          </div>
          <button type="button" onClick={() => setShowPreview(!showPreview)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-sm transition-all shadow-lg active:scale-95">{showPreview ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}{showPreview ? 'Edit Data' : 'Preview'}</button>
          {showPreview && (
            <button type="button" onClick={handleExportPDF} disabled={isExporting} className="flex items-center gap-2 px-4 sm:px-6 py-2 bg-blue-700 hover:bg-blue-600 rounded-lg font-bold text-sm transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
              {isExporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}Export PDF
            </button>
          )}
        </div>
      </header>

      <main className="flex-grow flex flex-col lg:flex-row gap-6 p-4 sm:p-8 overflow-hidden max-w-[1920px] mx-auto w-full">
        <div className={`flex-1 overflow-y-auto space-y-6 ${showPreview ? 'hidden lg:block lg:w-[480px] lg:flex-none' : 'w-full'} no-print pb-24`}>
          {activeTab === 'settings' ? (
            <div className="space-y-6 animate-in slide-in-from-left duration-300">
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2"><Building className="text-blue-600" size={22} />Edit Company Details</h2>
                <CompanyDetailsEditor />
              </section>

              <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2"><ImageIcon className="text-blue-600" size={22} />Branding & Visuals</h2>
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="h-16 w-16 bg-white rounded-lg shadow-inner overflow-hidden flex items-center justify-center p-1 border border-gray-200"><img src={invoice.logo || invoice.companyDetails.logo || COMPANY_DETAILS.logo} alt="Preview" className="h-full w-full object-contain" /></div>
                    <div className="flex-grow">
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Company Logo URL</label>
                      <input type="text" placeholder="https://i.ibb.co/..." value={invoice.logo} onChange={e => setInvoice(prev => ({ ...prev, logo: e.target.value }))} className="w-full p-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="h-16 w-16 bg-white rounded-lg shadow-inner overflow-hidden flex items-center justify-center p-1 border border-gray-200">
                      <div className="relative w-full h-full flex items-center justify-center">
                        <img src={invoice.signature || invoice.companyDetails.signature || COMPANY_DETAILS.signature} alt="Preview" className="h-full w-full object-contain mix-blend-multiply" />
                        <PenTool className="absolute top-1 right-1 text-blue-300" size={10} />
                      </div>
                    </div>
                    <div className="flex-grow">
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Signature Image URL</label>
                      <input type="text" placeholder="https://i.ibb.co/..." value={invoice.signature} onChange={e => setInvoice(prev => ({ ...prev, signature: e.target.value }))} className="w-full p-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs" />
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2"><ListOrdered className="text-blue-600" size={22} />Terms & Conditions</h2>
                <div className="space-y-3">
                  {invoice.terms.map((term, index) => (
                    <div key={index} className="flex gap-2 items-start group">
                      <div className="flex-grow">
                        <input 
                          type="text" 
                          value={term} 
                          onChange={(e) => updateTerm(index, e.target.value)} 
                          className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-xs font-semibold"
                          placeholder={`Term #${index + 1}`}
                        />
                      </div>
                      <button 
                        onClick={() => removeTerm(index)} 
                        className="p-2.5 text-gray-300 hover:text-red-500 transition-colors bg-gray-50 hover:bg-red-50 rounded-xl border border-gray-200"
                        title="Remove Term"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={addTerm} 
                    className="w-full mt-2 py-2 border-2 border-dashed border-blue-200 text-blue-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={14} /> Add New Term
                  </button>
                </div>
              </section>

              <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2"><Users className="text-blue-600" size={22} />Customer Database</h2>
                <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100">
                  <h3 className="text-[10px] font-black text-blue-800 uppercase mb-3 flex items-center gap-2"><UserPlus size={14}/> Add New Customer</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <input type="text" placeholder="Firm/Person Name" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} className="p-2 border border-blue-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold" />
                    <input type="text" placeholder="Phone Number" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} className="p-2 border border-blue-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                    <input type="text" placeholder="GSTIN (Optional)" value={newCustomer.gstin} onChange={e => setNewCustomer({...newCustomer, gstin: e.target.value.toUpperCase()})} className="p-2 border border-blue-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none uppercase font-semibold" />
                    <textarea placeholder="Complete Address" value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} className="p-2 border border-blue-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none sm:col-span-2 h-20" />
                  </div>
                  <button onClick={handleAddSavedCustomer} className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2"><Plus size={14} /> Save Customer Record</button>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scroll">
                  {savedCustomers.length > 0 ? savedCustomers.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 group shadow-sm transition-all">
                      <div className="flex-grow overflow-hidden">
                        <p className="font-black text-sm text-gray-800 truncate uppercase">{c.name}</p>
                        <p className="text-[10px] text-gray-500 line-clamp-1">{c.address}</p>
                        <div className="flex gap-3 mt-1">
                          {c.gstin && <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-1.5 rounded uppercase">GST: {c.gstin}</span>}
                          {c.phone && <span className="text-[9px] font-black text-green-600 bg-green-50 px-1.5 rounded">PH: {c.phone}</span>}
                        </div>
                      </div>
                      <button onClick={() => handleRemoveSavedCustomer(c.id)} className="text-gray-300 hover:text-red-500 transition-all p-1.5 ml-4 shrink-0"><Trash2 size={18} /></button>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-400 italic text-xs">No saved customers yet.</div>
                  )}
                </div>
              </section>

              <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-black text-gray-800 flex items-center gap-2"><Landmark className="text-blue-600" size={22} />Default Bank Details</h2>
                  <span className="flex items-center gap-1 text-[9px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100"><ShieldCheck size={12} /> SECURE</span>
                </div>
                <BankDetailsEditor />
              </section>

              <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2"><QrCode className="text-blue-600" size={22} />Payment QR Code</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="h-24 w-24 bg-white rounded-lg shadow-inner overflow-hidden flex items-center justify-center p-1 border border-gray-200">{invoice.qrCode ? <img src={invoice.qrCode} alt="QR Code Preview" className="h-full w-full object-contain" /> : <QrCode className="text-gray-200" size={40} />}</div>
                    <div className="flex-grow">
                      <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">UPI / QR Code Image URL</label>
                      <input type="text" placeholder="https://i.ibb.co/..." value={invoice.qrCode} onChange={e => setInvoice(prev => ({ ...prev, qrCode: e.target.value }))} className="w-full p-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-xs" />
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2"><Package className="text-blue-600" size={22} />Product Master List</h2>
                <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100">
                  <h3 className="text-[10px] font-black text-blue-800 uppercase mb-3">Add New Product to List</h3>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input type="text" placeholder="Product Name" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="p-2 border border-blue-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                    <input type="text" placeholder="HSN Code" value={newProduct.hsnCode} onChange={e => setNewProduct({...newProduct, hsnCode: e.target.value})} className="p-2 border border-blue-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                    <input type="number" placeholder="Base Rate" value={newProduct.rate || ''} onChange={e => setNewProduct({...newProduct, rate: Number(e.target.value)})} className="p-2 border border-blue-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                    <input type="number" placeholder="GST %" value={newProduct.gstRate || ''} onChange={e => setNewProduct({...newProduct, gstRate: Number(e.target.value)})} className="p-2 border border-blue-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <button onClick={handleAddMasterProduct} className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-2"><Plus size={14} /> Add Product to Master</button>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scroll">
                  {products.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 group">
                      <div><p className="font-bold text-sm text-gray-800">{p.name}</p><p className="text-[10px] text-gray-400 font-medium">HSN: {p.hsnCode} | GST: {p.gstRate}% | Rate: ₹{p.rate}</p></div>
                      <button onClick={() => handleRemoveMasterProduct(p.id)} className="text-gray-300 hover:text-red-500 transition-all p-1"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </section>

              <button onClick={() => setActiveTab('main')} className="w-full py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-700 transition-colors shadow-lg">Back to Invoice Entry</button>

              <footer className="py-8 text-center no-print">
                <a 
                  href="https://outreachrz.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-2 group"
                >
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] group-hover:text-blue-600 transition-colors">
                    Designed and developed by
                  </span>
                  <span className="text-[11px] font-black text-gray-600 group-hover:text-blue-800 transition-colors flex items-center gap-1">
                    Outreachrz.com <ExternalLink size={10} className="opacity-40" />
                  </span>
                </a>
              </footer>
            </div>
          ) : (
            <>
              <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-black text-gray-800 mb-5 flex items-center gap-2"><Settings2 className="text-blue-600" size={22} />Header Info</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Invoice Number</label><input type="text" value={invoice.invoiceNo} onChange={e => setInvoice(prev => ({ ...prev, invoiceNo: e.target.value }))} className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold" /></div>
                  <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Date</label><input type="date" value={invoice.date} onChange={e => setInvoice(prev => ({ ...prev, date: e.target.value }))} className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                  <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-1">PO Number (Optional)</label><input type="text" placeholder="PO-2024-X" value={invoice.poNo} onChange={e => setInvoice(prev => ({ ...prev, poNo: e.target.value }))} className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                  <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Vehicle No</label><input type="text" placeholder="TS-10-XY-1234" value={invoice.vehicleNo} onChange={e => setInvoice(prev => ({ ...prev, vehicleNo: e.target.value }))} className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                  <div className="col-span-2 mt-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">GST Mode / Sale Type</label>
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                      <button onClick={() => setInvoice(prev => ({ ...prev, saleType: SaleType.LOCAL }))} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${invoice.saleType === SaleType.LOCAL ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-500'}`}>Local (CGST/SGST)</button>
                      <button onClick={() => setInvoice(prev => ({ ...prev, saleType: SaleType.CENTRAL }))} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${invoice.saleType === SaleType.CENTRAL ? 'bg-white text-blue-900 shadow-sm' : 'text-gray-500'}`}>Central (IGST)</button>
                    </div>
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 relative">
                  <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-black text-gray-800 flex items-center gap-2">Billing Details</h2><button onClick={() => { setCustomerSearchContext('billing'); setCustomerSearchTerm(''); }} className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-black uppercase flex items-center gap-1 hover:bg-blue-100 transition-all border border-blue-100 shadow-sm"><Contact2 size={12}/> Pick Customer</button></div>
                  <div className="space-y-4">
                    <input type="text" placeholder="Customer/Firm Name" className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold" value={invoice.billingAddress.name} onChange={e => setInvoice(prev => ({ ...prev, billingAddress: { ...prev.billingAddress, name: e.target.value } }))} />
                    <textarea placeholder="Full Address" rows={3} className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" value={invoice.billingAddress.address} onChange={e => setInvoice(prev => ({ ...prev, billingAddress: { ...prev.billingAddress, address: e.target.value } }))} />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="Phone No" className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" value={invoice.billingAddress.phone} onChange={e => setInvoice(prev => ({ ...prev, billingAddress: { ...prev.billingAddress, phone: e.target.value } }))} />
                      <input type="text" placeholder="GSTIN Number" className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none uppercase font-semibold" value={invoice.billingAddress.gstin} onChange={e => setInvoice(prev => ({ ...prev, billingAddress: { ...prev.billingAddress, gstin: e.target.value.toUpperCase() } }))} />
                    </div>
                  </div>
                  {customerSearchContext === 'billing' && (
                    <div className="absolute inset-0 bg-white z-30 p-6 rounded-2xl flex flex-col border border-blue-200 shadow-2xl">
                      <div className="flex justify-between items-center mb-4"><h3 className="font-black text-blue-900 uppercase text-xs">Select Billing Customer</h3><button onClick={() => setCustomerSearchContext(null)} className="text-gray-400 hover:text-red-500"><Plus className="rotate-45" size={24}/></button></div>
                      <input autoFocus type="text" placeholder="Search saved customers..." className="w-full p-2.5 border border-gray-200 rounded-xl mb-4 text-sm" value={customerSearchTerm} onChange={e => setCustomerSearchTerm(e.target.value)} />
                      <div className="flex-grow overflow-y-auto space-y-2 custom-scroll pr-1">{filteredCustomers.map(c => (<button key={c.id} onClick={() => selectSavedCustomer(c)} className="w-full text-left p-3 border border-gray-100 rounded-xl hover:bg-blue-50 group flex flex-col gap-0.5"><span className="font-black text-xs uppercase group-hover:text-blue-700">{c.name}</span><span className="text-[10px] text-gray-500 truncate">{c.address}</span></button>))}</div>
                    </div>
                  )}
                </section>
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 relative">
                  <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-black text-gray-800">Shipping Details</h2><div className="flex gap-2"><button onClick={copyBillingToShipping} className="text-[10px] text-gray-600 font-bold hover:bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 transition-all uppercase tracking-tight shadow-sm">Same as Bill</button><button onClick={() => { setCustomerSearchContext('shipping'); setCustomerSearchTerm(''); }} className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-black uppercase flex items-center gap-1 hover:bg-blue-100 transition-all border border-blue-100 shadow-sm"><Contact2 size={12}/> Pick</button></div></div>
                  <div className="space-y-4">
                    <input type="text" placeholder="Recipient Name" className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold" value={invoice.shippingAddress.name} onChange={e => setInvoice(prev => ({ ...prev, shippingAddress: { ...prev.shippingAddress, name: e.target.value } }))} />
                    <textarea placeholder="Delivery Address" rows={3} className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm" value={invoice.shippingAddress.address} onChange={e => setInvoice(prev => ({ ...prev, shippingAddress: { ...prev.shippingAddress, address: e.target.value } }))} />
                  </div>
                  {customerSearchContext === 'shipping' && (
                    <div className="absolute inset-0 bg-white z-30 p-6 rounded-2xl flex flex-col border border-blue-200 shadow-2xl">
                      <div className="flex justify-between items-center mb-4"><h3 className="font-black text-blue-900 uppercase text-xs">Select Shipping Customer</h3><button onClick={() => setCustomerSearchContext(null)} className="text-gray-400 hover:text-red-500"><Plus className="rotate-45" size={24}/></button></div>
                      <input autoFocus type="text" placeholder="Search saved customers..." className="w-full p-2.5 border border-gray-200 rounded-xl mb-4 text-sm" value={customerSearchTerm} onChange={e => setCustomerSearchTerm(e.target.value)} />
                      <div className="flex-grow overflow-y-auto space-y-2 custom-scroll pr-1">{filteredCustomers.map(c => (<button key={c.id} onClick={() => selectSavedCustomer(c)} className="w-full text-left p-3 border border-gray-100 rounded-xl hover:bg-blue-50 group flex flex-col gap-0.5"><span className="font-black text-xs uppercase group-hover:text-blue-700">{c.name}</span><span className="text-[10px] text-gray-500 truncate">{c.address}</span></button>))}</div>
                    </div>
                  )}
                </section>
              </div>

              <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-5"><h2 className="text-lg font-black text-gray-800 flex items-center gap-2"><PackagePlus className="text-green-500" size={22} />Add Products</h2><button onClick={() => handleAddItem()} className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-lg font-bold hover:bg-green-100 transition-colors border border-green-100 flex items-center gap-1"><Plus size={14} /> Custom Item</button></div>
                <div className="relative mb-6">
                  <div className="relative">
                    <input type="text" placeholder="Search fertilizers by name or HSN/SAC code..." className="w-full p-3.5 pl-12 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    <Search className="absolute left-4 top-4 text-gray-400" size={20} />
                  </div>
                  {searchTerm && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-100 rounded-2xl shadow-2xl z-20 max-h-72 overflow-y-auto mt-2 overflow-hidden ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
                      {filteredProducts.length > 0 ? filteredProducts.map(product => (
                        <button key={product.id} onClick={() => handleAddItem(product)} className="w-full text-left p-4 hover:bg-blue-50 border-b border-gray-50 flex justify-between items-center group transition-colors">
                          <div className="flex-grow">
                            <p className="font-black text-gray-800 group-hover:text-blue-700 transition-colors uppercase text-sm">{product.name}</p>
                            <div className="flex gap-2 mt-1.5">
                              <span className="flex items-center gap-1 text-[9px] text-gray-600 font-black uppercase tracking-tight bg-gray-100 px-2 py-0.5 rounded">SAC: {product.hsnCode}</span>
                              <span className="flex items-center gap-1 text-[9px] text-blue-600 font-black uppercase tracking-tight bg-blue-50 px-2 py-0.5 rounded border border-blue-100">GST: {product.gstRate}%</span>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <span className="font-black text-blue-600 block text-sm">₹{product.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          </div>
                        </button>
                      )) : <div className="p-8 text-center text-gray-400">No matching fertilizers found.</div>}
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {invoice.items.map((item, index) => (
                    <div key={item.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 hover:border-blue-200 transition-all shadow-sm">
                      <div className="flex justify-between items-start mb-3"><span className="bg-blue-900 text-white text-[10px] font-black px-2 py-0.5 rounded-full">Item #{index + 1}</span><button onClick={() => handleRemoveItem(item.id)} className="text-gray-300 hover:text-red-500 transition-all p-1"><Trash2 size={16} /></button></div>
                      <div className="space-y-3">
                        <div><label className="block text-[8px] uppercase font-black text-gray-400 mb-1 ml-1">Product Description</label><input type="text" value={item.description} onChange={e => handleUpdateItem(item.id, { description: e.target.value })} placeholder="Enter product name..." className="w-full p-2 border border-gray-200 rounded-xl font-bold text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white" /></div>
                        <div className="grid grid-cols-3 gap-2">
                          <div><label className="block text-[8px] uppercase font-black text-gray-400 mb-1 ml-1">HSN/SAC Code</label><input type="text" value={item.hsnCode} onChange={e => handleUpdateItem(item.id, { hsnCode: e.target.value })} placeholder="3808..." className="w-full p-2 border border-gray-200 rounded-xl text-center font-bold text-[10px] focus:ring-2 focus:ring-blue-500 outline-none bg-white uppercase" /></div>
                          <div><label className="block text-[8px] uppercase font-black text-gray-400 mb-1 ml-1">GST Rate (%)</label><input type="number" value={item.gstRate} onChange={e => handleUpdateItem(item.id, { gstRate: Number(e.target.value) })} className="w-full p-2 border border-gray-200 rounded-xl text-center font-bold text-[10px] focus:ring-2 focus:ring-blue-500 outline-none bg-white" /></div>
                          <div><label className="block text-[8px] uppercase font-black text-gray-400 mb-1 ml-1">Qty</label><input type="number" value={item.qty} onChange={e => handleUpdateItem(item.id, { qty: Number(e.target.value) })} className="w-full p-2 border border-gray-200 rounded-xl text-center font-bold text-[10px] focus:ring-2 focus:ring-blue-500 outline-none bg-white" /></div>
                        </div>
                        <div><label className="block text-[8px] uppercase font-black text-gray-400 mb-1 ml-1">Unit Rate (₹)</label><input type="number" value={item.itemRate} onChange={e => handleUpdateItem(item.id, { itemRate: Number(e.target.value) })} className="w-full p-2 border border-gray-200 rounded-xl text-right font-black text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white" /></div>
                      </div>
                    </div>
                  ))}
                  {invoice.items.length === 0 && <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 bg-white"><div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><PackagePlus className="opacity-20" size={32} /></div><p className="font-black text-[10px] uppercase tracking-widest px-4">Search or manually add products above</p></div>}
                </div>
              </section>

              <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="text-lg font-black text-gray-800 mb-4 flex items-center gap-2">Summary Adjustments</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Discount (₹)</label><input type="number" value={invoice.discount} onChange={e => setInvoice(prev => ({ ...prev, discount: Number(e.target.value) }))} className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 text-right font-bold text-red-500" /></div>
                  <div><label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Freight/Others (₹)</label><input type="number" value={invoice.freightCharges} onChange={e => setInvoice(prev => ({ ...prev, freightCharges: Number(e.target.value) }))} className="w-full p-2.5 border border-gray-200 rounded-xl bg-gray-50 text-right font-bold text-green-600" /></div>
                </div>
              </section>

              <footer className="py-8 text-center no-print">
                <a 
                  href="https://outreachrz.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex flex-col items-center gap-1 group"
                >
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] group-hover:text-blue-500 transition-colors">
                    Designed and developed by
                  </span>
                  <span className="text-[10px] font-black text-gray-600 group-hover:text-blue-700 transition-colors flex items-center gap-1.5">
                    Outreachrz.com <ExternalLink size={10} className="opacity-40" />
                  </span>
                </a>
              </footer>
            </>
          )}
        </div>

        <div className={`flex-1 overflow-y-auto print:p-0 ${!showPreview ? 'hidden lg:block lg:w-3/4 lg:bg-gray-200 lg:p-12 xl:p-20' : 'w-full bg-gray-200 p-4 sm:p-12'}`}>
          <div ref={printableRef} className="print:shadow-none mx-auto transform-gpu origin-top duration-300">
            <InvoicePreview invoice={invoice} />
          </div>
          <div className="h-32 no-print" />
        </div>
      </main>

      {!showPreview && activeTab === 'main' && (
        <div className="bg-white border-t border-gray-200 p-4 sticky bottom-0 z-50 flex flex-col sm:flex-row justify-between items-center no-print shadow-2xl gap-4">
          <div className="flex items-center gap-3"><div className="bg-green-100 p-2 rounded-lg"><Plus className="text-green-600" size={18} /></div><div className="flex flex-col"><span className="text-[10px] font-black uppercase tracking-tight text-gray-500">Auto-Saving Enabled</span><span className="text-[9px] text-gray-400">Your draft is stored in this browser</span></div></div>
          <div className="flex gap-4 w-full sm:w-auto">
            <button onClick={() => setActiveTab('settings')} className="flex-1 sm:flex-none px-6 py-3 border-2 border-gray-200 text-gray-600 font-black rounded-xl hover:bg-gray-50 transition-all text-xs uppercase tracking-widest">Configure</button>
            <button onClick={() => setShowPreview(true)} className="flex-1 sm:flex-none px-10 py-3 bg-blue-900 text-white font-black rounded-xl hover:bg-blue-800 transition-all shadow-xl text-xs uppercase tracking-widest active:scale-95">Review & Export</button>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          .no-print { display: none !important; }
          html, body { height: auto; margin: 0 !important; padding: 0 !important; background: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          #root { display: block !important; height: auto !important; min-height: auto !important; overflow: visible !important; }
          main { display: block !important; padding: 0 !important; margin: 0 !important; overflow: visible !important; }
          #invoice-printable { position: relative; margin: 0 auto !important; width: 210mm; min-height: 297mm; padding: 0 !important; border: none !important; box-shadow: none !important; background: white !important; }
        }
        @page { size: A4; margin: 0mm; }
        .custom-scroll::-webkit-scrollbar { width: 5px; }
        .custom-scroll::-webkit-scrollbar-track { background: #f1f1f1; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default App;
