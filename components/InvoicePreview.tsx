
import React from 'react';
import { Invoice, SaleType } from '../types';
import { formatCurrency, numberToWords } from '../utils';

interface InvoicePreviewProps {
  invoice: Invoice;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice }) => {
  const taxableTotal = invoice.items.reduce((acc, item) => acc + (item.itemRate * item.qty), 0);
  const gstTotal = invoice.items.reduce((acc, item) => acc + (item.itemRate * item.qty * item.gstRate / 100), 0);
  const grandTotal = Math.round(taxableTotal + gstTotal + Number(invoice.freightCharges) - Number(invoice.discount));

  const isCentral = invoice.saleType === SaleType.CENTRAL;
  const company = invoice.companyDetails;

  // Set minimum rows to 23 as requested to fill the page correctly while maintaining footer visibility
  const minRows = 23;
  const rowCount = Math.max(invoice.items.length, minRows);

  return (
    <div 
      id="invoice-printable" 
      className="bg-white w-[210mm] min-h-[297mm] mx-auto text-[10px] font-sans border border-gray-300 shadow-xl print:border-none print:shadow-none print:m-0 print:w-full flex flex-col overflow-hidden"
      style={{ 
        height: '297mm', 
        boxSizing: 'border-box',
        WebkitFontSmoothing: 'antialiased',
        textRendering: 'optimizeLegibility'
      }}
    >
      {/* Header Section */}
      <div className="mx-4 mt-3 border border-black flex shrink-0 overflow-hidden h-28 bg-white">
        {/* Logo Section */}
        <div className="w-1/4 p-3 border-r border-black flex items-center justify-center bg-white">
          <img 
            src={invoice.logo || company.logo} 
            alt="Logo" 
            className="max-w-full h-auto max-h-24 object-contain" 
          />
        </div>
        
        <div className="w-3/4 flex flex-col">
          {/* Top Label */}
          <div className="text-center py-1 border-b border-black font-extrabold text-[9px] tracking-[0.3em] bg-blue-900 text-white print:bg-blue-900 uppercase">
            Tax Invoice
          </div>
          
          <div className="p-3 flex-grow bg-white flex flex-col justify-center">
            <div className="flex justify-between items-start">
              {/* Company Info Left */}
              <div className="flex-grow pr-4">
                <h1 className="text-2xl font-black text-blue-900 leading-none mb-1 tracking-tighter uppercase">
                  {company.name}
                </h1>
                <p className="text-[7.5px] font-black text-green-700 uppercase tracking-widest mb-1.5 border-b border-green-100 pb-0.5 w-fit">
                  Manufacturers & Suppliers of Organic Fertilizers
                </p>
                <p className="text-[8px] leading-tight text-gray-800 font-bold italic max-w-[340px]">
                  {company.address}
                </p>
              </div>

              {/* Contact Information Right (Improved Format) */}
              <div className="shrink-0 flex flex-col gap-1.5 border-l border-gray-200 pl-4 min-w-[150px]">
                <div className="flex flex-col items-end">
                  <span className="text-[6px] text-gray-400 font-black uppercase leading-none tracking-tighter">Mobile</span>
                  <span className="text-[10px] font-black text-blue-900 leading-tight">
                    {company.mobileNumber || company.contact}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[6px] text-gray-400 font-black uppercase leading-none tracking-tighter">Email</span>
                  <span className="text-[8px] font-bold text-gray-700 leading-tight lowercase">
                    {company.email}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[6px] text-gray-400 font-black uppercase leading-none tracking-tighter">Website</span>
                  <span className="text-[8.5px] font-black text-blue-600 leading-tight underline decoration-blue-100 lowercase">
                    {company.website}
                  </span>
                </div>
              </div>
            </div>
            
            {/* GSTIN Badge */}
            <div className="mt-1 flex justify-end">
              <span className="text-[8.5px] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 text-blue-900 font-black uppercase shadow-sm">
                GSTIN: {company.gstin}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Meta Grid */}
      <div className="mx-4 border-x border-b border-black grid grid-cols-2 bg-gray-50 shrink-0">
        <div className="grid grid-cols-2 border-r border-black">
          <div className="p-1 border-r border-black font-bold uppercase text-[7px] text-gray-500">Invoice No:</div>
          <div className="p-1 font-bold text-[10px] text-blue-900">{invoice.invoiceNo}</div>
          <div className="p-1 border-t border-r border-black font-bold uppercase text-[7px] text-gray-500">PO No / Ref:</div>
          <div className="p-1 border-t font-semibold text-[9px]">{invoice.poNo || '-'}</div>
        </div>
        <div className="grid grid-cols-2">
          <div className="p-1 border-r border-black font-bold uppercase text-[7px] text-gray-500">Billing Date:</div>
          <div className="p-1 font-bold text-[9px]">{new Date(invoice.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
          <div className="p-1 border-t border-r border-black font-bold uppercase text-[7px] text-gray-500">Vehicle No:</div>
          <div className="p-1 border-t font-semibold uppercase text-[9px]">{invoice.vehicleNo || '-'}</div>
        </div>
      </div>

      {/* Sale Type Banner */}
      <div className="mx-4 border-x border-b border-black bg-gray-800 text-white text-center font-black py-0.5 text-[7px] uppercase tracking-widest shrink-0">
        {isCentral ? 'Inter-State Sale (Integrated GST)' : 'Intra-State Sale (Central & State GST)'}
      </div>

      {/* Addresses Section */}
      <div className="mx-4 border-x border-b border-black grid grid-cols-2 shrink-0 bg-white">
        <div className="border-r border-gray-300 flex flex-col">
          <div className="bg-gray-100 p-1 border-b border-gray-300 font-black text-[7px] text-center uppercase tracking-[0.1em] text-gray-500">
            Details of Receiver | Bill To
          </div>
          <div className="px-4 py-2 flex-grow flex flex-col justify-between min-h-[62px] space-y-1">
            <div>
              <p className="font-black text-[10px] uppercase text-blue-900 leading-tight mb-0.5">
                {invoice.billingAddress.name || '________________'}
              </p>
              <p className="whitespace-pre-line text-[8.5px] text-gray-700 font-bold leading-snug">
                {invoice.billingAddress.address || '________________'}
              </p>
            </div>
            <div className="pt-1 flex justify-between items-center text-[8px] border-t border-gray-200">
              <span className="font-bold"><span className="text-[6px] text-gray-400 font-black mr-1 uppercase">Phone:</span>{invoice.billingAddress.phone || 'N/A'}</span>
              <span className="font-black"><span className="text-[6px] text-gray-400 font-black mr-1 uppercase">GSTIN:</span>{invoice.billingAddress.gstin || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <div className="bg-gray-100 p-1 border-b border-gray-300 font-black text-[7px] text-center uppercase tracking-[0.1em] text-gray-500">
            Details of Consignee | Ship To
          </div>
          <div className="px-4 py-2 flex-grow flex flex-col justify-between min-h-[62px] space-y-1">
            <div>
              <p className="font-black text-[10px] uppercase text-blue-900 leading-tight mb-0.5">
                {invoice.shippingAddress.name || '________________'}
              </p>
              <p className="whitespace-pre-line text-[8.5px] text-gray-700 font-bold leading-snug">
                {invoice.shippingAddress.address || '________________'}
              </p>
            </div>
            <div className="pt-1 flex justify-between items-center text-[8px] border-t border-gray-200">
              <span className="font-bold"><span className="text-[6px] text-gray-400 font-black mr-1 uppercase">Phone:</span>{invoice.shippingAddress.phone || 'N/A'}</span>
              <span className="font-black"><span className="text-[6px] text-gray-400 font-black mr-1 uppercase">GSTIN:</span>{invoice.shippingAddress.gstin || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mx-4 border-x border-black flex-grow bg-white overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-900 text-white font-black text-[8.5px] uppercase tracking-tighter">
              <th className="border-r border-blue-800 p-2 w-8">S.No</th>
              <th className="border-r border-blue-800 p-2 text-left">Description of Goods</th>
              <th className="border-r border-blue-800 p-2 w-20 text-center">HSN/SAC</th>
              <th className="border-r border-blue-800 p-2 w-12 text-center">GST%</th>
              <th className="border-r border-blue-800 p-2 w-20 text-center">Rate</th>
              <th className="border-r border-blue-800 p-2 w-10 text-center">Qty</th>
              <th className="border-r border-blue-800 p-2 w-20 text-center">Taxable</th>
              <th className="p-2 w-20 text-center">Total</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rowCount }).map((_, index) => {
              const item = invoice.items[index];
              const taxable = item ? item.itemRate * item.qty : 0;
              const gst = item ? taxable * item.gstRate / 100 : 0;
              const net = taxable + gst;
              const cellClass = "border-r border-gray-200 text-[9px] font-bold text-gray-900 h-[20px] leading-tight";

              return (
                <tr key={index} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-blue-50/10'}`}>
                  <td className={`${cellClass} text-center text-gray-400 font-normal`}>{index + 1}</td>
                  <td className={`${cellClass} px-3 uppercase font-extrabold truncate`}>{item?.description || ''}</td>
                  <td className={`${cellClass} text-center font-mono text-[8.5px]`}>{item?.hsnCode || ''}</td>
                  <td className={`${cellClass} text-center text-blue-800`}>{item ? `${item.gstRate}%` : ''}</td>
                  <td className={`${cellClass} text-right pr-3`}>{item ? item.itemRate.toFixed(2) : ''}</td>
                  <td className={`${cellClass} text-center`}>{item?.qty || ''}</td>
                  <td className={`${cellClass} text-right pr-3`}>{item ? taxable.toFixed(2) : ''}</td>
                  <td className="text-[9px] font-black text-right pr-3 text-gray-900 bg-gray-50/60">
                    {item ? net.toFixed(2) : ''}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals & Declaration Section */}
      <div className="mx-4 border border-black grid grid-cols-12 shrink-0 bg-white">
        <div className="col-span-7 p-3 border-r border-black flex flex-col">
          <div className="flex-grow">
            <h3 className="font-black text-[8px] mb-1 uppercase text-blue-900 tracking-wider flex items-center gap-1">
              <span className="w-1 h-3 bg-blue-900 rounded-full inline-block"></span>
              Declaration & Certification
            </h3>
            <p className="italic text-[7px] leading-snug text-gray-600 font-semibold text-justify">
              We hereby certify that our registration certificate under the GST Act is in force on the date of sale. 
              The transaction covered by this invoice is accounted for in the turnover of sales while filing returns 
              and the due tax has been or shall be paid. Goods once sold will not be taken back.
            </p>
          </div>
          
          <div className="mt-2 flex items-end justify-between">
            <div className="flex flex-col items-center">
              <div className="w-24 border-b border-gray-400 h-6"></div>
              <span className="text-[6px] font-black uppercase text-gray-400 mt-1">Receiver's Signature</span>
            </div>
            
            <div className="text-right flex flex-col items-end">
              <span className="text-[6px] font-black text-gray-400 uppercase mb-0.5">Verified GSTIN</span>
              <span className="text-[9px] font-black bg-blue-50 text-blue-900 px-2 py-0.5 rounded border border-blue-200 shadow-sm uppercase tracking-tighter">
                {company.gstin}
              </span>
            </div>
          </div>
        </div>
        
        <div className="col-span-5 border-l border-black">
          <div className="grid grid-cols-2 border-b border-gray-200 text-[8px]">
            <div className="p-1.5 pl-3 font-semibold text-gray-500 uppercase text-[7px]">Taxable Amount</div>
            <div className="p-1.5 text-right pr-3 font-bold">{formatCurrency(taxableTotal)}</div>
          </div>
          <div className="grid grid-cols-2 border-b border-gray-200 text-[8px]">
            <div className="p-1.5 pl-3 text-gray-500 uppercase text-[7px]">Discount</div>
            <div className="p-1.5 text-right pr-3 text-red-600 font-bold">(-) {formatCurrency(Number(invoice.discount))}</div>
          </div>
          <div className="grid grid-cols-2 border-b border-gray-200 text-[8px]">
            <div className="p-1.5 pl-3 text-gray-500 uppercase text-[7px]">Freight Charges</div>
            <div className="p-1.5 text-right pr-3 font-bold text-green-700">(+) {formatCurrency(Number(invoice.freightCharges))}</div>
          </div>
          {isCentral ? (
            <div className="grid grid-cols-2 border-b border-gray-200 bg-blue-50/50 text-[8px]">
              <div className="p-1.5 pl-3 font-black text-blue-900 uppercase text-[7px]">IGST Output</div>
              <div className="p-1.5 text-right pr-3 font-black text-blue-900">{formatCurrency(gstTotal)}</div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 border-b border-gray-200 text-[8px]">
                <div className="p-1 pl-3 text-[7px] text-gray-500 uppercase">CGST Output</div>
                <div className="p-1 text-right pr-3 font-bold">{formatCurrency(gstTotal / 2)}</div>
              </div>
              <div className="grid grid-cols-2 border-b border-gray-200 text-[8px]">
                <div className="p-1 pl-3 text-[7px] text-gray-500 uppercase">SGST Output</div>
                <div className="p-1 text-right pr-3 font-bold">{formatCurrency(gstTotal / 2)}</div>
              </div>
            </>
          )}
          <div className="grid grid-cols-2 bg-blue-900 font-black p-2 border-t border-black text-white">
            <div className="flex items-center uppercase tracking-tighter text-[11px]">Grand Total</div>
            <div className="text-right text-base font-black tracking-tight">{formatCurrency(grandTotal)}</div>
          </div>
        </div>
      </div>

      {/* Amount in Words */}
      <div className="mx-4 border-x border-b border-black px-3 py-1.5 font-black bg-gray-50 uppercase text-[8px] shrink-0 flex items-center">
        <span className="text-gray-500 mr-2 text-[6px] font-black">Total In Words:</span>
        <span className="text-blue-900 text-[10px] italic tracking-tight">{numberToWords(grandTotal)}</span>
      </div>

      {/* Payment & Footer Auth - Consolidated Bank Details */}
      <div className="mx-4 border-x border-b border-black grid grid-cols-12 shrink-0 bg-white">
        <div className="col-span-8 border-r border-black flex flex-col">
          <div className="bg-gray-100 p-0.5 text-center font-black text-[7px] uppercase tracking-widest border-b border-black">
            Bank Payment Details (NEFT / RTGS)
          </div>
          <div className="p-2 flex items-center gap-4 bg-white flex-grow">
            {invoice.qrCode && (
              <div className="shrink-0 flex flex-col items-center ml-2">
                <div className="w-16 h-16 p-1 border border-gray-200 rounded bg-white flex items-center justify-center">
                  <img 
                    src={invoice.qrCode} 
                    alt="Payment QR" 
                    className="w-full h-full object-contain" 
                  />
                </div>
                <span className="text-[6px] font-black uppercase text-blue-600 mt-1">Scan to Pay</span>
              </div>
            )}
            <div className="flex-grow grid grid-cols-2 gap-x-4 gap-y-1">
              <div className="col-span-2 border-b border-gray-100 pb-1">
                <span className="text-[6px] font-black text-gray-400 uppercase block leading-none">Account Holder Name</span>
                <span className="text-[10px] font-black text-blue-900 uppercase leading-tight">
                  {invoice.bankDetails.accountHolder}
                </span>
              </div>
              
              <div className="pt-1">
                <span className="text-[6px] font-black text-gray-400 uppercase block leading-none">Bank & Branch</span>
                <span className="text-[8.5px] font-bold text-gray-800 leading-tight">
                  {invoice.bankDetails.bankName}, {invoice.bankDetails.branch}
                </span>
              </div>

              <div className="pt-1">
                <span className="text-[6px] font-black text-gray-400 uppercase block leading-none">Account Type</span>
                <span className="text-[8.5px] font-bold text-gray-800 leading-tight">
                  {invoice.bankDetails.accountType || 'Current Account'}
                </span>
              </div>

              <div className="col-span-2 mt-1 bg-blue-50/50 p-1.5 rounded border border-blue-100 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-[6px] font-black text-blue-400 uppercase leading-none mb-1">Account Number</span>
                  <span className="text-[12px] font-black text-gray-900 tracking-widest font-mono">
                    {invoice.bankDetails.accountNo}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[6px] font-black text-blue-400 uppercase leading-none mb-1">IFSC Code</span>
                  <span className="text-[11px] font-black text-blue-900 font-mono">
                    {invoice.bankDetails.ifsc}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-span-4 flex flex-col">
          <div className="bg-gray-800 p-0.5 text-center font-black text-white text-[7px] uppercase tracking-[0.1em]">For {company.name}</div>
          <div className="flex-grow flex flex-col items-center justify-center p-3 relative bg-gray-50/20">
            <div className="w-32 h-10 flex flex-col items-center justify-end relative">
               <img 
                 src={invoice.signature || company.signature} 
                 alt="Signature" 
                 className="max-h-12 w-auto object-contain mb-1 mix-blend-multiply"
               />
               <div className="w-full border-b border-black/30 border-dashed"></div>
            </div>
            <p className="font-black text-[8.5px] uppercase tracking-wider text-gray-900 mt-2">Authorised Signatory</p>
          </div>
        </div>
      </div>

      {/* Terms Section */}
      <div className="mx-4 mb-3 border-x border-b border-black grid grid-cols-2 bg-gray-50 shrink-0">
        <div className="p-3 border-r border-black text-[7px] leading-tight">
          <p className="font-black mb-1 text-blue-900 uppercase underline text-[8px]">Terms & Conditions:</p>
          <ul className="list-decimal list-inside space-y-0.5 text-gray-600 font-bold">
            {invoice.terms.slice(0, 4).map((term, i) => (
              <li key={i} className="pl-1">{term}</li>
            ))}
          </ul>
        </div>
        <div className="p-3 flex items-center justify-center bg-white border-l border-gray-300">
          <div className="text-center">
            <p className="italic text-[8.5px] text-green-700 font-black mb-1 tracking-tight">
              "Growing together with Organic Excellence"
            </p>
            <p className="text-[7.5px] text-blue-900 font-bold uppercase tracking-widest">
              Thank you for your business
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
