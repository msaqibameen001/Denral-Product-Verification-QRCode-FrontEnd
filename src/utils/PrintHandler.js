// import dayjs from 'dayjs';
// import { getCompanyData } from '../GlobalSetup/companyConfig';

// /**
//  * Generic Report Print Function
//  * @param {Object} config - Configuration object
//  * @param {string} config.reportType - 'sales' | 'purchase' | 'ledger'
//  * @param {Array} config.data - Report data array
//  * @param {Object} config.summary - Summary object
//  * @param {Object} config.filters - Applied filters
//  * @param {Object} config.additionalInfo - Additional info (e.g., party info for ledger)
//  */
// export const printReport = (config) => {
//   const { reportType, data, summary, filters, additionalInfo = {} } = config;
//   const { companyData } = getCompanyData();

//   if (!data || data.length === 0) {
//     alert('No data to print. Please generate report first.');
//     return;
//   }

//   const printWindow = window.open('', '_blank');

//   if (!printWindow) {
//     alert('Please allow popups for this site');
//     return;
//   }

//   // Generate HTML based on report type
//   const htmlContent = generateReportHTML({
//     reportType,
//     data,
//     summary,
//     filters,
//     additionalInfo,
//     companyData
//   });

//   printWindow.document.write(htmlContent);
//   printWindow.document.close();

//   setTimeout(() => {
//     printWindow.focus();
//   }, 250);
// };

// // Generate HTML based on report type
// const generateReportHTML = ({ reportType, data, summary, filters, additionalInfo, companyData }) => {
//   const reportTitle = getReportTitle(reportType);
//   const tableHeaders = getTableHeaders(reportType);
//   const tableRows = generateTableRows(reportType, data);
//   const summarySection = generateSummary(reportType, summary);
//   const filterInfo = generateFilterInfo(reportType, filters, additionalInfo);

//   return `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="UTF-8">
//       <title>${reportTitle} - ${dayjs().format('DD MMM YYYY')}</title>
//       <link href="https://fonts.googleapis.com/css2?family=Sofia+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
//       <style>
//         * {
//           margin: 0;
//           padding: 0;
//           box-sizing: border-box;
//         }

//         body {
//           font-family: "Sofia Sans", sans-serif;
//           background: #ffffff;
//           color: #1a1a1a;
//           line-height: 1.4;
//           -webkit-print-color-adjust: exact;
//           print-color-adjust: exact;
//         }

//         .report-wrapper {
//           max-width: 320mm;
//           margin: 20px auto;
//           background: #ffffff;
//           box-shadow: 0 0 20px rgba(0,0,0,0.08);
//         }

//         .report-page {
//           padding: 24px 32px;
//         }

//         /* Header */
//         .report-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: flex-start;
//           border-bottom: 2px solid #e5e7eb;
//           padding-bottom: 12px;
//           margin-bottom: 20px;
//         }

//         .company-name {
//           font-size: 22px;
//           font-weight: bold;
//           margin-bottom: 4px;
//         }

//         .company-meta {
//           font-size: 11px;
//           color: #444;
//           line-height: 1.5;
//         }

//         .report-section {
//           text-align: right;
//           font-size: 11px;
//         }

//         .report-title {
//           font-size: 16px;
//           font-weight: bold;
//           margin-bottom: 2px;
//         }

//         .report-period {
//           font-size: 11px;
//           margin-bottom: 6px;
//         }

//         .report-summary div {
//           margin-bottom: 2px;
//         }

//         /* Filter Info Section */
//         .filter-info {
//           background: #f9fafb;
//           padding: 12px 16px;
//           margin-bottom: 16px;
//           border-radius: 4px;
//           border: 1px solid #e5e7eb;
//         }

//         .filter-info-title {
//           font-size: 12px;
//           font-weight: 600;
//           color: #6b7280;
//           margin-bottom: 8px;
//         }

//         .filter-row {
//           display: flex;
//           gap: 24px;
//           font-size: 11px;
//           margin-bottom: 4px;
//         }

//         .filter-item strong {
//           color: #374151;
//         }

//         /* Table */
//         .report-table {
//           width: 100%;
//           border-collapse: collapse;
//           font-size: 10px;
//           margin-bottom: 20px;
//         }

//         .report-table thead {
//           background: linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%) !important;
//         }

//         .report-table th {
//           padding: 5px 7px;
//           text-align: left;
//           font-size: 10px;
//           font-weight: 600;
//           text-transform: uppercase;
//           letter-spacing: 0.3px;
//           border: 1px solid #e5e7eb;
//         }

//         .report-table td {
//           padding: 10px 6px;
//           border-bottom: 1px solid #e5e7eb;
//           font-size: 11px;
//         }

//         .report-table tbody tr:nth-child(even) {
//           background: #fafafa;
//         }

//         .report-table tbody tr:hover {
//           background: #f3f4f6;
//         }

//         .text-center { text-align: center; }
//         .text-right { text-align: right !important; }
//         .font-bold { font-weight: 600; }

//         .positive { color: #059669; }
//         .negative { color: #dc2626; }

//         /* Totals Row */
//         .totals-row {
//           background: linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%) !important;
//           border-top: 2px solid #e5e7eb !important;
//           font-weight: 700 !important;
//         }

//         .totals-row td {
//           padding: 10px 6px !important;
//           font-size: 11px !important;
//           border-bottom: 2px solid #e5e7eb !important;
//         }

//         /* Summary Cards */
//         .summary-section {
//           display: grid;
//           grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
//           gap: 16px;
//           margin-bottom: 20px;
//         }

//         .summary-card {
//           background: #f9fafb;
//           padding: 12px 16px;
//           border-radius: 4px;
//           border: 1px solid #e5e7eb;
//         }

//         .summary-label {
//           font-size: 11px;
//           color: #6b7280;
//           margin-bottom: 4px;
//         }

//         .summary-value {
//           font-size: 18px;
//           font-weight: 700;
//           color: #111827;
//         }

//         /* Footer */
//         .report-footer {
//           margin-top: 24px;
//           padding-top: 16px;
//           border-top: 1px solid #e5e7eb;
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           font-size: 10px;
//           color: #6b7280;
//         }

//         .print-btn {
//           position: fixed;
//           top: 20px;
//           right: 20px;
//           background: #1a1a1a;
//           color: #ffffff;
//           border: none;
//           padding: 10px 20px;
//           border-radius: 6px;
//           font-size: 13px;
//           font-weight: 600;
//           cursor: pointer;
//           box-shadow: 0 4px 12px rgba(0,0,0,0.15);
//           z-index: 1000;
//           transition: all 0.2s;
//         }

//         .print-btn:hover {
//           background: #2d2d2d;
//           transform: translateY(-1px);
//           box-shadow: 0 6px 16px rgba(0,0,0,0.2);
//         }

//         @media print {
//           body { background: #ffffff; }
//           .report-wrapper { margin: 0; box-shadow: none; }
//           .report-page { padding: 0; }
//           .print-btn { display: none; }
//           .report-table { page-break-inside: auto; }
//           .report-table tr { page-break-inside: avoid; page-break-after: auto; }
//           .report-table thead { display: table-header-group; }
//           .totals-row { page-break-before: avoid; }
//         }

//         @page {
//           margin: 10mm;
//           size: A4 portrait;
//         }
//       </style>
//     </head>
//     <body>
//       <button class="print-btn" onclick="window.print()">Print Report</button>

//       <div class="report-wrapper">
//         <div class="report-page">

//           <!-- Header -->
//           <div class="report-header">
//             <div class="company-section">
//               <div class="company-name">${companyData?.name || 'Company Name'}</div>
//               <div class="company-meta">
//                 ${companyData?.phone || ''}<br />
//                 ${companyData?.email || ''}<br />
//                 ${companyData?.address || ''}
//               </div>
//             </div>

//             <div class="report-section">
//               <div class="report-title">${reportTitle}</div>
//               <div class="report-period">
//                 Generated: ${dayjs().format('DD MMM YYYY HH:mm')}
//               </div>
//             </div>
//           </div>

//           <!-- Filter Info -->
//           ${filterInfo}

//           <!-- Summary Cards -->
//            <!-- $ {summarySection} agar summary section chahyai to uncommint krna hoga issay dollar sign mai gap dia hua hai us gap ko remove krna hai or uncommint krna hai bas aajayga summry or kuch nh krna -->

//           <!-- Data Table -->
//           <table class="report-table">
//             <thead>
//               ${tableHeaders}
//             </thead>
//             <tbody>
//               ${tableRows}
//             </tbody>
//           </table>

//           <!-- Footer -->
//           <div class="report-footer">
//             <div>
//               <strong>Total Records:</strong> ${data.length}
//             </div>
//             <div style="text-align: right;">
//               <strong>Printed On:</strong> ${dayjs().format('DD MMM YYYY HH:mm:ss')}
//             </div>
//           </div>

//         </div>
//       </div>
//     </body>
//     </html>
//   `;
// };

// // Get Report Title
// const getReportTitle = (reportType) => {
//   switch (reportType) {
//     case 'sales':
//       return 'Sales Report';
//     case 'purchase':
//       return 'Purchase Report';
//     case 'ledger':
//       return 'Ledger Report';
//     default:
//       return 'Report';
//   }
// };

// // Get Table Headers
// const getTableHeaders = (reportType) => {
//   switch (reportType) {
//     case 'sales':
//       return `
//         <tr>
//           <th>Invoice No</th>
//           <th>Date</th>
//           <th>Customer</th>
//           <th class="text-right">Qty</th>
//           <th class="text-right">Weight (KG)</th>
//           <th class="text-right">Sale Amount</th>
//           <th class="text-right">Cost</th>
//           <th class="text-right">Profit</th>
//           <th class="text-right">Profit %</th>
//         </tr>
//       `;
//     case 'purchase':
//       return `
//         <tr>
//           <th>Purchase ID</th>
//           <th>Date</th>
//           <th>Supplier</th>
//           <th>Gate Pass No</th>
//           <th class="text-right">Unit Price</th>
//           <th class="text-right">Quantity (KG)</th>
//           <th class="text-right">Purchase Amount</th>
//           <th class="text-right">Supplier Balance</th>
//         </tr>
//       `;
//     case 'ledger':
//       return `
//         <tr>
//           <th>Date</th>
//           <th>Type</th>
//           <th>Reference</th>
//           <th>Description</th>
//           <th class="text-right">Debit</th>
//           <th class="text-right">Credit</th>
//           <th class="text-right">Balance</th>
//         </tr>
//       `;
//     default:
//       return '';
//   }
// };

// // Generate Table Rows with Totals
// const generateTableRows = (reportType, data) => {
//   if (!data || data.length === 0) return '';

//   let rows = '';
//   let totals = {};

//   switch (reportType) {
//     case 'sales':
//       // Initialize totals
//       totals = { totalQty: 0, totalKg: 0, saleAmount: 0, totalCost: 0, profit: 0 };

//       rows = data
//         .map((item) => {
//           // Add to totals
//           totals.totalQty += item.totalQty || 0;
//           totals.totalKg += item.totalKg || 0;
//           totals.saleAmount += item.saleAmount || 0;
//           totals.totalCost += item.totalCost || 0;
//           totals.profit += item.profit || 0;

//           return `
//             <tr>
//               <td class="font-bold">${item.invoiceNo}</td>
//               <td>${dayjs(item.invoiceDate).format('DD MMM YYYY')}</td>
//               <td>${item.customerName}</td>
//               <td class="text-right">${item.totalQty}</td>
//               <td class="text-right">${item.totalKg?.toFixed(2)}</td>
//               <td class="text-right">Rs. ${item.saleAmount?.toLocaleString()}</td>
//               <td class="text-right">Rs. ${item.totalCost?.toLocaleString()}</td>
//               <td class="text-right ${item.profit >= 0 ? 'positive' : 'negative'}">Rs. ${item.profit?.toLocaleString()}</td>
//               <td class="text-right ${item.profitPercentage >= 0 ? 'positive' : 'negative'}">${item.profitPercentage?.toFixed(2)}%</td>
//             </tr>
//           `;
//         })
//         .join('');

//       // Add totals row
//       rows += `
//         <tr class="totals-row">
//           <td colspan="3" class="text-right font-bold">Total</td>
//           <td class="text-right font-bold">${totals.totalQty}</td>
//           <td class="text-right font-bold">${totals.totalKg.toFixed(2)}</td>
//           <td class="text-right font-bold">Rs. ${totals.saleAmount.toLocaleString()}</td>
//           <td class="text-right font-bold">Rs. ${totals.totalCost.toLocaleString()}</td>
//           <td class="text-right font-bold">Rs. ${totals.profit.toLocaleString()}</td>
//           <td></td>
//         </tr>
//       `;
//       return rows;

//     // You can add similar logic for purchase or ledger reports
//     case 'purchase':
//       // Initialize totals for purchase numeric fields
//       totals = { quantity: 0, purchaseAmount: 0, unitPrice: 0 };

//       rows = data
//         .map((item) => {
//           totals.quantity += item.quantity || 0;
//           totals.purchaseAmount += item.purchaseAmount || 0;
//           totals.unitPrice += item.unitPrice || 0;

//           return `
//             <tr>
//               <td class="font-bold">PUR-${item.purchaseId}</td>
//               <td>${dayjs(item.purchaseDate).format('DD MMM YYYY')}</td>
//               <td>${item.supplierName}</td>
//               <td>${item.gatePassNo ? item.gatePassNo : ''}</td>
//               <td class="text-right">Rs. ${item.unitPrice?.toFixed(2)}</td>
//               <td class="text-right">${item.quantity?.toFixed(2)}</td>
//               <td class="text-right">Rs. ${item.purchaseAmount?.toLocaleString()}</td>
//               <td class="text-right ${item.supplierBalance > 0 ? 'negative' : 'positive'}">Rs. ${item.supplierBalance?.toLocaleString()}</td>
//             </tr>
//           `;
//         })
//         .join('');

//       // Add totals row
//       rows += `
//         <tr class="totals-row">
//           <td colspan="4" class="text-right font-bold">Total</td>
//           <td></td>
//           <td class="text-right font-bold">${totals.quantity.toFixed(2)}</td>
//           <td class="text-right font-bold">Rs. ${totals.purchaseAmount.toLocaleString()}</td>
//           <td></td>
//         </tr>
//       `;
//       return rows;

//     case 'ledger':
//       // Ledger may not need numeric totals, can skip or just sum debit/credit/balance
//       return data
//         .map(
//           (item) => `
//             <tr>
//               <td>${dayjs(item.transactionDate).format('DD MMM YYYY')}</td>
//               <td>${item.transactionType}</td>
//               <td class="font-bold">${item.referenceNo}</td>
//               <td>${item.description}</td>
//               <td class="text-right ${item.debit > 0 ? 'negative' : ''}">${item.debit > 0 ? 'Rs. ' + item.debit.toLocaleString() : '—'}</td>
//               <td class="text-right ${item.credit > 0 ? 'positive' : ''}">${item.credit > 0 ? 'Rs. ' + item.credit.toLocaleString() : '—'}</td>
//               <td class="text-right font-bold ${item.balance >= 0 ? 'positive' : 'negative'}">Rs. ${item.balance?.toLocaleString()}</td>
//             </tr>
//           `
//         )
//         .join('');

//     default:
//       return '';
//   }
// };

// // Generate Summary
// const generateSummary = (reportType, summary) => {
//   if (!summary) return '';

//   switch (reportType) {
//     case 'sales':
//       return `
//         <div class="summary-section">
//           <div class="summary-card">
//             <div class="summary-label">Total Invoices</div>
//             <div class="summary-value">${summary.totalInvoices || 0}</div>
//           </div>
//           <div class="summary-card">
//             <div class="summary-label">Total KG</div>
//             <div class="summary-value">${summary.totalKilograms?.toFixed(2) || 0}</div>
//           </div>
//           <div class="summary-card">
//             <div class="summary-label">Total Sales</div>
//             <div class="summary-value">Rs. ${summary.totalSales?.toLocaleString() || 0}</div>
//           </div>
//           <div class="summary-card">
//             <div class="summary-label">Total Profit</div>
//             <div class="summary-value positive">Rs. ${summary.totalProfit?.toLocaleString() || 0}</div>
//           </div>
//           <div class="summary-card">
//             <div class="summary-label">Profit %</div>
//             <div class="summary-value positive">${summary.overallProfitPercentage?.toFixed(2) || 0}%</div>
//           </div>
//         </div>
//       `;

//     case 'purchase':
//       return `
//         <div class="summary-section">
//           <div class="summary-card">
//             <div class="summary-label">Total Purchases</div>
//             <div class="summary-value">${summary.totalPurchases || 0}</div>
//           </div>
//           <div class="summary-card">
//             <div class="summary-label">Total Suppliers</div>
//             <div class="summary-value">${summary.totalSuppliers || 0}</div>
//           </div>
//           <div class="summary-card">
//             <div class="summary-label">Total KG</div>
//             <div class="summary-value">${summary.totalQuantity?.toFixed(2) || 0}</div>
//           </div>
//           <div class="summary-card">
//             <div class="summary-label">Total Amount</div>
//             <div class="summary-value">Rs. ${summary.totalPurchaseAmount?.toLocaleString() || 0}</div>
//           </div>
//           <div class="summary-card">
//             <div class="summary-label">Avg Price/KG</div>
//             <div class="summary-value">Rs. ${summary.averagePricePerKg?.toFixed(2) || 0}</div>
//           </div>
//         </div>
//       `;

//     case 'ledger':
//       return `
//         <div class="summary-section">
//           <div class="summary-card">
//             <div class="summary-label">Opening Balance</div>
//             <div class="summary-value ${summary.openingBalance >= 0 ? 'positive' : 'negative'}">Rs. ${summary.openingBalance?.toLocaleString() || 0}</div>
//           </div>
//           <div class="summary-card">
//             <div class="summary-label">Total Debits</div>
//             <div class="summary-value negative">Rs. ${summary.totalDebits?.toLocaleString() || 0}</div>
//           </div>
//           <div class="summary-card">
//             <div class="summary-label">Total Credits</div>
//             <div class="summary-value positive">Rs. ${summary.totalCredits?.toLocaleString() || 0}</div>
//           </div>
//           <div class="summary-card">
//             <div class="summary-label">Closing Balance</div>
//             <div class="summary-value ${summary.closingBalance >= 0 ? 'positive' : 'negative'}">Rs. ${summary.closingBalance?.toLocaleString() || 0}</div>
//           </div>
//         </div>
//       `;

//     default:
//       return '';
//   }
// };

// // Generate Filter Info
// const generateFilterInfo = (reportType, filters, additionalInfo) => {
//   if (!filters) return '';

//   const dateRange =
//     filters.startDate && filters.endDate
//       ? `${dayjs(filters.startDate).format('DD MMM YYYY')} - ${dayjs(filters.endDate).format('DD MMM YYYY')}`
//       : 'All Time';

//   switch (reportType) {
//     case 'sales':
//       return `
//         <div class="filter-info">
//           <div class="filter-info-title">Report Filters</div>
//           <div class="filter-row">
//             <div class="filter-item"><strong>Period:</strong> ${dateRange}</div>
//             <div class="filter-item"><strong>Customer:</strong> ${filters.customerName || 'All Customers'}</div>
//           </div>
//         </div>
//       `;

//     case 'purchase':
//       return `
//         <div class="filter-info">
//           <div class="filter-info-title">Report Filters</div>
//           <div class="filter-row">
//             <div class="filter-item"><strong>Period:</strong> ${dateRange}</div>
//             <div class="filter-item"><strong>Supplier:</strong> ${filters.supplierName || 'All Suppliers'}</div>
//           </div>
//         </div>
//       `;

//     case 'ledger':
//       return `
//         <div class="filter-info">
//           <div class="filter-info-title">Party Information</div>
//           <div class="filter-row">
//             <div class="filter-item"><strong>Party Name:</strong> ${additionalInfo.partyName || 'N/A'}</div>
//             <div class="filter-item"><strong>Type:</strong> ${additionalInfo.partyTypeName || 'N/A'}</div>
//             <div class="filter-item"><strong>Phone:</strong> ${additionalInfo.phone || 'N/A'}</div>
//           </div>
//           <div class="filter-row">
//             <div class="filter-item"><strong>Period:</strong> ${dateRange}</div>
//             <div class="filter-item"><strong>Address:</strong> ${additionalInfo.address || 'N/A'}</div>
//           </div>
//         </div>
//       `;

//     default:
//       return '';
//   }
// };

import dayjs from 'dayjs';
import { getCompanyData } from '../GlobalSetup/companyConfig';

/**
 * Generic Report Print Function
 * @param {Object} config - Configuration object
 * @param {string} config.reportType - 'sales' | 'purchase' | 'ledger' | 'groupedLedger'
 * @param {Array} config.data - Report data array
 * @param {Object} config.summary - Summary object
 * @param {Object} config.filters - Applied filters
 * @param {Object} config.additionalInfo - Additional info (e.g., party info for ledger)
 */
export const printReport = (config) => {
  const { reportType, data, summary, filters, additionalInfo = {} } = config;
  const { companyData } = getCompanyData();

  if (!data || data.length === 0) {
    alert('No data to print. Please generate report first.');
    return;
  }

  const printWindow = window.open('', '_blank');

  if (!printWindow) {
    alert('Please allow popups for this site');
    return;
  }

  // Generate HTML based on report type
  const htmlContent = generateReportHTML({
    reportType,
    data,
    summary,
    filters,
    additionalInfo,
    companyData
  });

  printWindow.document.write(htmlContent);
  printWindow.document.close();

  setTimeout(() => {
    printWindow.focus();
  }, 250);
};

// Generate HTML based on report type
const generateReportHTML = ({ reportType, data, summary, filters, additionalInfo, companyData }) => {
  const reportTitle = getReportTitle(reportType);
  const tableHeaders = getTableHeaders(reportType);
  const tableRows = generateTableRows(reportType, data);
  const summarySection = generateSummary(reportType, summary);
  const filterInfo = generateFilterInfo(reportType, filters, additionalInfo);
  const isGroupedLedger = reportType === 'groupedLedger';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${reportTitle} - ${dayjs().format('DD MMM YYYY')}</title>
      <link href="https://fonts.googleapis.com/css2?family=Sofia+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: "Sofia Sans", sans-serif;
          background: #ffffff;
          color: #1a1a1a;
          line-height: 1.4;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        
        .report-wrapper {
          max-width: 320mm;
          margin: 20px auto;
          background: #ffffff;
          box-shadow: 0 0 20px rgba(0,0,0,0.08);
        }
        
        .report-page {
          padding: 24px 32px;
        }
        
        /* Header */
        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 12px;
          margin-bottom: 20px;
        }
        
        .company-name {
          font-size: 22px;
          font-weight: bold;
          margin-bottom: 4px;
        }
        
        .company-meta {
          font-size: 12px;
          color: #444;
          line-height: 1.5;
        }
        
        .report-section {
          text-align: right;
          font-size: 11px;
        }
        
        .report-title {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 2px;
        }
        
        .report-period {
          font-size: 11px;
          margin-bottom: 6px;
        }
        
        .report-summary div {
          margin-bottom: 2px;
        }
        
        /* Filter Info Section */
        .filter-info {
          background: #f9fafb;
          padding: 12px 16px;
          margin-bottom: 16px;
          border-radius: 4px;
          border: 1px solid #e5e7eb;
        }
        
        .filter-info-title {
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          margin-bottom: 8px;
        }
        
        .filter-row {
          display: flex;
          gap: 24px;
          font-size: 11px;
          margin-bottom: 4px;
        }
        
        .filter-item strong {
          color: #374151;
        }
        
        /* Table */
        .report-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10px;
          margin-bottom: 20px;
        }
        
        .report-table thead {
          background: linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%) !important;
        }
        
        .report-table th {
          padding: 8px 8px;
          text-align: left;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          border: 1px solid #e5e7eb;
        }
        
        .report-table td {
          padding: 10px 8px;
          border: 1px solid #e5e7eb;
          font-size: 11px;
        }
        
        .report-table tbody tr:nth-child(even) {
          background: #fafafa;
        }
        
        .text-center { text-align: center; }
        .text-right { text-align: right !important; }
        .font-bold { font-weight: 600; }
        
        .positive { color: #111827; }
        .negative { color: #111827; }
        
        /* Party Group Row - For Grouped Ledger */
        .party-group-row {
          background: linear-gradient(180deg, #f3f4f6 0%, #e5e7eb 100%) !important;
          font-weight: 700 !important;
        }
        
        .party-group-row td {
          padding: 8px 8px !important;
          border-top: 2px solid #d1d5db !important;
          border-bottom: 2px solid #d1d5db !important;
        }
        
        .party-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .party-name {
          font-size: 13px;
          color: #111827;
        }
        
        .party-type {
          background: #3b82f6;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 500;
        }
        
        .party-contact {
          font-size: 10px;
          color: #6b7280;
          margin-top: 4px;
        }
        
        /* Transaction Row - For Grouped Ledger */
        .transaction-row {
          background: #ffffff !important;
        }
        
        .transaction-row td {
          padding: 8px 8px !important;
          border-left: 2px solid #e5e7eb !important;
        }
        
        /* Indent for nested transactions */
        .indented-row {
          background: #f9fafb !important;
        }
        
        /* Transaction Type Tags */
        .txn-tag {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 500;
          text-align: center;
        }
        
        .tag-invoice { background: #dbeafe; color: #1e40af; }
        .tag-purchase { background: #fef3c7; color: #92400e; }
        .tag-payment-received { background: #d1fae5; color: #065f46; }
        .tag-payment-made { background: #fee2e2; color: #991b1b; }
        
        /* Totals Row */
        .totals-row {
          background: linear-gradient(180deg, #f9fafb 0%, #f3f4f6 100%) !important;
          border-top: 2px solid #e5e7eb !important;
          font-weight: 700 !important;
        }
        
        .totals-row td {
          padding: 10px 8px !important;
          font-size: 11px !important;
          border-bottom: 2px solid #e5e7eb !important;
        }
        
        /* Summary Cards */
        .summary-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }
        
        .summary-card {
          background: #f9fafb;
          padding: 12px 16px;
          border-radius: 4px;
          border: 1px solid #e5e7eb;
        }
        
        .summary-label {
          font-size: 11px;
          color: #6b7280;
          margin-bottom: 4px;
        }
        
        .summary-value {
          font-size: 18px;
          font-weight: 700;
          color: #111827;
        }
        
        /* Footer */
        .report-footer {
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 10px;
          color: #6b7280;
        }
        
        .print-btn {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #1a1a1a;
          color: #ffffff;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 1000;
          transition: all 0.2s;
        }
        
        .print-btn:hover {
          background: #2d2d2d;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.2);
        }
        
        @media print {
          body { background: #ffffff; }
          .report-wrapper { margin: 0; box-shadow: none; }
          .report-page { padding: 0; }
          .print-btn { display: none; }
          .report-table { page-break-inside: auto; }
          .party-group-row { page-break-inside: avoid; page-break-after: auto; }
          .report-table thead { display: table-header-group; }
          .totals-row { page-break-before: avoid; }
        }
        
        @page {
          margin: 10mm;
          size: A4 portrait;
        }
      </style>
    </head>
    <body>
      <button class="print-btn" onclick="window.print()">Print Report</button>
      
      <div class="report-wrapper">
        <div class="report-page">
          
          <!-- Header -->
          <div class="report-header">
            <div class="company-section">
              <div class="company-name">${companyData?.name || 'Company Name'}</div>
              <div class="company-meta">
                ${companyData?.phone || ''}<br />
                ${companyData?.address || ''}
              </div>
            </div>
            
            <div class="report-section">
              <div class="report-title">${reportTitle}</div>
              <div class="report-period">
                Generated: ${dayjs().format('DD MMM YYYY HH:mm')}
              </div>
            </div>
          </div>
          
          <!-- Filter Info -->
          ${filterInfo}
          
          <!-- Summary Cards -->
          ${summarySection}
          
          <!-- Data Table -->
          <table class="report-table">
            <thead>
              ${tableHeaders}
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          
          <!-- Footer -->
          <div class="report-footer">
            <div>
              <strong style="margin-left: 16px;">Total Transactions:</strong> ${
                isGroupedLedger ? data.filter((d) => !d.isPartyRow).length || 0 : data.length || 0
              }
            </div>
            <div style="text-align: right;">
              <strong>Printed On:</strong> ${dayjs().format('DD MMM YYYY HH:mm:ss')}
            </div>
          </div>
          
        </div>
      </div>
    </body>
    </html>
  `;
};

// Get Report Title
const getReportTitle = (reportType) => {
  switch (reportType) {
    case 'sales':
      return 'Sales Report';
    case 'purchase':
      return 'Purchase Report';
    case 'ledger':
      return 'Ledger Report';
    case 'groupedLedger':
      return 'Ledger Report';
    default:
      return 'Report';
  }
};

// Get Table Headers
const getTableHeaders = (reportType) => {
  switch (reportType) {
    case 'sales':
      return `
        <tr>
          <th>Invoice No</th>
          <th>Date</th>
          <th>Customer</th>
          <th class="text-right">Qty</th>
          <th class="text-right">Weight (KG)</th>
          <th class="text-right">Sale Amount</th>
          <th class="text-right">Cost</th>
          <th class="text-right">Profit</th>
          <th class="text-right">Profit %</th>
        </tr>
      `;
    case 'purchase':
      return `
        <tr>
          <th>Purchase ID</th>
          <th>Date</th>
          <th>Supplier</th>
          <th>Gate Pass No</th>
          <th class="text-right">Unit Price</th>
          <th class="text-right">Quantity (KG)</th>
          <th class="text-right">Purchase Amount</th>
          <th class="text-right">Supplier Balance</th>
        </tr>
      `;
    case 'ledger':
      return `
        <tr>
          <th>Date</th>
          <th>Type</th>
          <th>Reference</th>
          <th>Description</th>
          <th class="text-right">Debit</th>
          <th class="text-right">Credit</th>
          <th class="text-right">Balance</th>
        </tr>
      `;
    case 'groupedLedger':
      return `
        <tr>
          <th colspan="3">Party Information</th>
          <th class="text-right">Opening Balance</th>
          <th class="text-right">Current Balance</th>
        </tr>
      `;
    default:
      return '';
  }
};

// Generate Table Rows with Totals
const generateTableRows = (reportType, data) => {
  if (!data || data.length === 0) return '';

  let rows = '';
  let totals = {};

  switch (reportType) {
    case 'sales':
      // Sales report logic (existing code)
      totals = { totalQty: 0, totalKg: 0, saleAmount: 0, totalCost: 0, profit: 0 };

      rows = data
        .map((item) => {
          totals.totalQty += item.totalQty || 0;
          totals.totalKg += item.totalKg || 0;
          totals.saleAmount += item.saleAmount || 0;
          totals.totalCost += item.totalCost || 0;
          totals.profit += item.profit || 0;

          return `
            <tr>
              <td class="font-bold">${item.invoiceNo}</td>
              <td>${dayjs(item.invoiceDate).format('DD MMM YYYY')}</td>
              <td>${item.customerName}</td>
              <td class="text-right">${item.totalQty}</td>
              <td class="text-right">${item.totalKg?.toFixed(2)}</td>
              <td class="text-right">Rs. ${item.saleAmount?.toLocaleString()}</td>
              <td class="text-right">Rs. ${item.totalCost?.toLocaleString()}</td>
              <td class="text-right ${item.profit >= 0 ? 'positive' : 'negative'}">Rs. ${item.profit?.toLocaleString()}</td>
              <td class="text-right ${item.profitPercentage >= 0 ? 'positive' : 'negative'}">${item.profitPercentage?.toFixed(2)}%</td>
            </tr>
          `;
        })
        .join('');

      rows += `
        <tr class="totals-row">
          <td colspan="3" class="text-right font-bold">Total</td>
          <td class="text-right font-bold">${totals.totalQty}</td>
          <td class="text-right font-bold">${totals.totalKg.toFixed(2)}</td>
          <td class="text-right font-bold">Rs. ${totals.saleAmount.toLocaleString()}</td>
          <td class="text-right font-bold">Rs. ${totals.totalCost.toLocaleString()}</td>
          <td class="text-right font-bold">Rs. ${totals.profit.toLocaleString()}</td>
          <td></td>
        </tr>
      `;
      return rows;

    case 'purchase':
      // Purchase report logic (existing code)
      totals = { quantity: 0, purchaseAmount: 0, unitPrice: 0 };

      rows = data
        .map((item) => {
          totals.quantity += item.quantity || 0;
          totals.purchaseAmount += item.purchaseAmount || 0;
          totals.unitPrice += item.unitPrice || 0;

          return `
            <tr>
              <td class="font-bold">PUR-${item.purchaseId}</td>
              <td>${dayjs(item.purchaseDate).format('DD MMM YYYY')}</td>
              <td>${item.supplierName}</td>
              <td>${item.gatePassNo ? item.gatePassNo : ''}</td>
              <td class="text-right">Rs. ${item.unitPrice?.toFixed(2)}</td>
              <td class="text-right">${item.quantity?.toFixed(2)}</td>
              <td class="text-right">Rs. ${item.purchaseAmount?.toLocaleString()}</td>
              <td class="text-right ${item.supplierBalance > 0 ? 'negative' : 'positive'}">Rs. ${item.supplierBalance?.toLocaleString()}</td>
            </tr>
          `;
        })
        .join('');

      rows += `
        <tr class="totals-row">
          <td colspan="4" class="text-right font-bold">Total</td>
          <td></td>
          <td class="text-right font-bold">${totals.quantity.toFixed(2)}</td>
          <td class="text-right font-bold">Rs. ${totals.purchaseAmount.toLocaleString()}</td>
          <td></td>
        </tr>
      `;
      return rows;

    case 'ledger':
      // Simple ledger (without groups)
      return data
        .map(
          (item) => `
            <tr>
              <td>${dayjs(item.transactionDate).format('DD MMM YYYY')}</td>
              <td>${item.transactionType}</td>
              <td class="font-bold">${item.referenceNo}</td>
              <td>${item.description}</td>
              <td class="text-right ${item.debit > 0 ? 'negative' : ''}">${item.debit > 0 ? 'Rs. ' + item.debit.toLocaleString() : '—'}</td>
              <td class="text-right ${item.credit > 0 ? 'positive' : ''}">${item.credit > 0 ? 'Rs. ' + item.credit.toLocaleString() : '—'}</td>
              <td class="text-right font-bold ${item.balance >= 0 ? 'positive' : 'negative'}">Rs. ${item.balance?.toLocaleString()}</td>
            </tr>
          `
        )
        .join('');

    case 'groupedLedger':
      // Grouped ledger with party rows and transaction rows
      rows = '';
      let totalParties = 0;
      let totalTransactions = 0;

      data.forEach((item) => {
        if (item.isPartyRow) {
          // Party Group Row
          totalParties++;

          rows += `
            <tr class="party-group-row">
              <td colspan="3">
                <div class="party-info">
                  <div>
                    <div class="party-name">${item.partyName}</div>
                  </div>
                </div>
              </td>
              <td class="text-right ${item.openingBalance >= 0 ? 'positive' : 'negative'}">
                <strong>Rs. ${item.openingBalance?.toLocaleString()}</strong>
              </td>
              <td class="text-right ${item.currentBalance >= 0 ? 'positive' : 'negative'}">
                <strong>Rs. ${item.currentBalance?.toLocaleString()}</strong>
              </td>
            </tr>
          `;

          // Add transactions for this party
          if (item.transactions && item.transactions.length > 0) {
            // Add transaction table header
            rows += `
              <tr class="indented-row">
                <td colspan="6">
                  <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                      <tr style="background: #f9fafb;">
                        <th style="padding: 6px; font-size: 10px; border: 1px solid #e5e7eb; width: 100px;">Date</th>
                        <th style="padding: 6px; font-size: 10px; border: 1px solid #e5e7eb; width: 100px;">Type</th>
                        <th style="padding: 6px; font-size: 10px; border: 1px solid #e5e7eb; width: 100px;">Reference</th>
                        <th style="padding: 6px; font-size: 10px; border: 1px solid #e5e7eb;">Description</th>
                        <th style="padding: 6px; font-size: 10px; border: 1px solid #e5e7eb; width: 100px; text-align: right;">Debit</th>
                        <th style="padding: 6px; font-size: 10px; border: 1px solid #e5e7eb; width: 100px; text-align: right;">Credit</th>
                        <th style="padding: 6px; font-size: 10px; border: 1px solid #e5e7eb; width: 120px; text-align: right;">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
            `;

            item.transactions.forEach((txn, index) => {
              totalTransactions++;
              const txnTypeClass = getTransactionTypeClass(txn.transactionType);

              rows += `
                <tr style="${index % 2 === 0 ? 'background: #fafafa;' : 'background: #ffffff;'}">
                  <td style="padding: 6px; font-size: 10px; border: 1px solid #e5e7eb;">
                    ${dayjs(txn.transactionDate).format('DD MMM YYYY')}
                  </td>
                  <td style="padding: 6px; font-size: 10px; border: 1px solid #e5e7eb;">
                    <span class="txn-tag ${txnTypeClass}">${txn.transactionType}</span>
                  </td>
                  <td style="padding: 6px; font-size: 10px; border: 1px solid #e5e7eb; font-weight: 600;">
                    ${txn.referenceNo}
                  </td>
                  <td style="padding: 6px; font-size: 10px; border: 1px solid #e5e7eb;">
                    ${txn.description}
                  </td>
                  <td style="padding: 6px; font-size: 10px; border: 1px solid #e5e7eb; text-align: right; ${txn.debit > 0 ? 'font-weight: 600;' : ''}">
                    ${txn.debit > 0 ? `Rs. ${txn.debit.toLocaleString()}` : '—'}
                  </td>
                  <td style="padding: 6px; font-size: 10px; border: 1px solid #e5e7eb; text-align: right; ${txn.credit > 0 ? 'font-weight: 600;' : ''}">
                    ${txn.credit > 0 ? `Rs. ${txn.credit.toLocaleString()}` : '—'}
                  </td>
                  <td style="padding: 6px; font-size: 10px; border: 1px solid #e5e7eb; text-align: right; font-weight: 700;">
                    Rs. ${txn.balance?.toLocaleString()}
                  </td>
                </tr>
              `;
            });

            // Close transaction table
            rows += `
                    </tbody>
                  </table>
                </td>
              </tr>
            `;
          } else {
            // No transactions message
            rows += `
              <tr class="indented-row">
                <td colspan="6" style="padding: 12px; text-align: center; color: #9ca3af; font-style: italic; border: 1px solid #e5e7eb;">
                  No transactions found for this party
                </td>
              </tr>
            `;
          }
        }
      });

      // Add totals row
      rows += `
        <tr class="totals-row">
          <td colspan="2" class="text-right font-bold">Summary</td>
          <td class="text-right font-bold">${totalParties} Parties</td>
          <td class="text-right font-bold">${totalTransactions} Transactions</td>
          <td colspan="2"></td>
        </tr>
      `;

      return rows;

    default:
      return '';
  }
};

// Get transaction type CSS class
const getTransactionTypeClass = (type) => {
  switch (type) {
    case 'Invoice':
      return 'tag-invoice';
    case 'Purchase':
      return 'tag-purchase';
    case 'Payment Received':
      return 'tag-payment-received';
    case 'Payment Made':
      return 'tag-payment-made';
    default:
      return 'tag-default';
  }
};

// Generate Summary (same as before)
const generateSummary = (reportType, summary) => {
  if (!summary) return '';

  switch (reportType) {
    case 'sales':
      return `
        <div class="summary-section">
          <div class="summary-card">
            <div class="summary-label">Total KG</div>
            <div class="summary-value">${summary.totalKilograms?.toFixed(2) || 0}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Total Sales</div>
            <div class="summary-value">Rs. ${summary.totalSales?.toLocaleString() || 0}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Total Profit</div>
            <div class="summary-value positive">Rs. ${summary.totalProfit?.toLocaleString() || 0}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Total Expense</div>
            <div class="summary-value positive">Rs. ${summary.totalExpense?.toLocaleString() || 0}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Net Profit</div>
            <div class="summary-value positive">Rs. ${summary.netProfit?.toLocaleString() || 0}</div>
          </div>
        </div>
      `;

    case 'purchase':
      return `
        <div class="summary-section">
          <div class="summary-card">
            <div class="summary-label">Total Purchases</div>
            <div class="summary-value">${summary.totalPurchases || 0}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Total Suppliers</div>
            <div class="summary-value">${summary.totalSuppliers || 0}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Total KG</div>
            <div class="summary-value">${summary.totalQuantity?.toFixed(2) || 0}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Total Amount</div>
            <div class="summary-value">Rs. ${summary.totalPurchaseAmount?.toLocaleString() || 0}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Avg Price/KG</div>
            <div class="summary-value">Rs. ${summary.averagePricePerKg?.toFixed(2) || 0}</div>
          </div>
        </div>
      `;

    case 'ledger':
    case 'groupedLedger':
      return `
        <div class="summary-section">
          <div class="summary-card">
            <div class="summary-label">Opening Balance</div>
            <div class="summary-value ${summary.openingBalance >= 0 ? 'positive' : 'negative'}">Rs. ${summary.openingBalance?.toLocaleString() || 0}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Total Debits</div>
            <div class="summary-value negative">Rs. ${summary.totalDebits?.toLocaleString() || 0}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Total Credits</div>
            <div class="summary-value positive">Rs. ${summary.totalCredits?.toLocaleString() || 0}</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Closing Balance</div>
            <div class="summary-value ${summary.closingBalance >= 0 ? 'positive' : 'negative'}">Rs. ${summary.closingBalance?.toLocaleString() || 0}</div>
          </div>
        </div>
      `;

    default:
      return '';
  }
};

// Generate Filter Info
const generateFilterInfo = (reportType, filters, additionalInfo) => {
  if (!filters) return '';

  const dateRange =
    filters.startDate && filters.endDate
      ? `${dayjs(filters.startDate).format('DD MMM YYYY')} - ${dayjs(filters.endDate).format('DD MMM YYYY')}`
      : 'All Time';

  switch (reportType) {
    case 'sales':
      return `
        <div class="filter-info">
          <div class="filter-info-title">Report Filters</div>
          <div class="filter-row">
            <div class="filter-item"><strong>Period:</strong> ${dateRange}</div>
            <div class="filter-item"><strong>Customer:</strong> ${filters.customerName || 'All Customers'}</div>
          </div>
        </div>
      `;

    case 'purchase':
      return `
        <div class="filter-info">
          <div class="filter-info-title">Report Filters</div>
          <div class="filter-row">
            <div class="filter-item"><strong>Period:</strong> ${dateRange}</div>
            <div class="filter-item"><strong>Supplier:</strong> ${filters.supplierName || 'All Suppliers'}</div>
          </div>
        </div>
      `;

    case 'ledger':
    case 'groupedLedger':
      // For grouped ledger, show selected filters
      const partyTypeText = additionalInfo.partyTypeName ? `${additionalInfo.partyTypeName}` : 'All Types';
      const partyText = additionalInfo.partyName ? `${additionalInfo.partyName}` : 'All Parties';

      return `
        <div class="filter-info">
          <div class="filter-info-title">Report Filters</div>
          <div class="filter-row">
            <div class="filter-item"><strong>Period:</strong> ${dateRange}</div>
            <div class="filter-item"><strong>Party Type:</strong> ${partyTypeText}</div>
            <div class="filter-item"><strong>Party:</strong> ${partyText}</div>
          </div>
        </div>
      `;

    default:
      return '';
  }
};
