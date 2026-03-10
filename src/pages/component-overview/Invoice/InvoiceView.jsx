import React from 'react';
import { Card, Row, Col, Typography, Table, Space, Button, Divider } from 'antd';
import { PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getCompanyData } from '../../../GlobalSetup/companyConfig';

const { Title, Text } = Typography;

const InvoiceView = ({ invoice }) => {
  const { companyData } = getCompanyData();
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');

    printWindow.document.write(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice - ${invoice.invoiceNo}</title>
  <link href="https://fonts.googleapis.com/css2?family=ABeeZee:ital@0;1&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Jost:ital,wght@0,100..900;1,100..900&family=Outfit:wght@100..900&family=Sofia+Sans:ital,wght@0,1..1000;1,1..1000&family=Source+Sans+3:ital,wght@0,200..900;1,200..900&family=Urbanist:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: "Sofia Sans", sans-serif;
      background: #ffffff;
      color: #000000;
      line-height: 1.4;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    .invoice-container {
      max-width: 210mm;
      margin: 0 auto;
      background: #ffffff;
      padding: 20mm;
    }
    
    /* Header */
    .invoice-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #000000;
    }
    
    .company-info h1 {
      font-size: 20px;
      font-weight: 600;
      color: #000000;
      margin-bottom: 8px;
    }
    
    .company-details {
      font-size: 11px;
      color: #000000;
      line-height: 1.6;
    }
    
    .invoice-meta {
      text-align: right;
    }
    
    .invoice-title {
      font-size: 24px;
      font-weight: 600;
      color: #000000;
      margin-bottom: 12px;
    }
    
    .meta-info {
      font-size: 11px;
      color: #000000;
      line-height: 1.6;
    }
    
    .meta-info div {
      margin-bottom: 2px;
    }
    
    /* Customer Section */
    .customer-section {
      margin-bottom: 30px;
      padding: 15px;
      border: 1px solid #d1d5db;
      background: #f9fafb;
    }
    
    .customer-section h3 {
      font-size: 10px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    
    .customer-name {
      font-size: 14px;
      font-weight: 600;
      color: #000000;
      margin-bottom: 4px;
    }
    
    .customer-phone {
      font-size: 12px;
      color: #4b5563;
    }
    
    /* Items Table */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
      font-size: 11px;
    }
    
    .items-table thead {
      background: #f3f4f6;
      border-top: 1px solid #d1d5db;
      border-bottom: 1px solid #d1d5db;
    }
    
    .items-table th {
      padding: 10px 8px;
      text-align: left;
      font-size: 10px;
      font-weight: 600;
      color: #374151;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    
    .items-table th.text-center {
      text-align: center;
    }
    
    .items-table th.text-right {
      text-align: right;
    }
    
    .items-table td {
      padding: 10px 8px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 11px;
      color: #000000;
    }
    
    .items-table tbody tr:last-child td {
      border-bottom: 1px solid #d1d5db;
    }
    
    .item-name {
      font-weight: 500;
      color: #000000;
    }
    
    .text-center {
      text-align: center;
    }
    
    .text-right {
      text-align: right;
    }
    
    .text-muted {
      color: #6b7280;
    }
    
    /* Summary Section */
    .summary-container {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 40px;
    }
    
    .summary-box {
      width: 300px;
    }
    
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .summary-label {
      color: #6b7280;
      font-weight: 500;
    }
    
    .summary-value {
      color: #000000;
      font-weight: 500;
      text-align: right;
    }
    
    .summary-total {
      border-top: 2px solid #000000;
      border-bottom: 2px solid #000000;
      margin-top: 8px;
      padding: 12px 0;
    }
    
    .total-label {
      font-size: 13px;
      font-weight: 600;
      color: #000000;
    }
    
    .total-value {
      font-size: 15px;
      font-weight: 700;
      color: #000000;
    }
    
    /* Footer */
    .invoice-footer {
      padding-top: 30px;
      border-top: 1px solid #d1d5db;
      text-align: center;
    }
    
    .footer-text {
      font-size: 10px;
      color: #6b7280;
      line-height: 1.5;
    }
    
    /* Print Button */
    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #000000;
      color: #ffffff;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      z-index: 1000;
    }
    
    .print-button:hover {
      background: #1f2937;
    }
    
    @media print {
      .invoice-container {
        padding: 0;
      }
      
      .print-button {
        display: none;
      }
    }
    
    @page {
      margin: 15mm;
      size: A4 portrait;
    }
  </style>
</head>
<body>
  <button class="print-button" onclick="window.print()">Print Invoice</button>
  
  <div class="invoice-container">
    
    <!-- Header -->
    <div class="invoice-header">
      <div class="company-info">
        <h1>${companyData.name}</h1>
        <div class="company-details">
          <div>${companyData.phone}</div>
          <div>${companyData.email}</div>
          <div>${companyData.address}</div>
        </div>
      </div>
      <div class="invoice-meta">
        <div class="invoice-title">INVOICE</div>
        <div class="meta-info">
          <div><strong>Invoice #:</strong> ${invoice.invoiceNo}</div>
          <div><strong>Date:</strong> ${dayjs(invoice.date).format('DD MMM YYYY')}</div>
          ${invoice.gatePassNo ? `<div><strong>Gate Pass #:</strong> ${invoice.gatePassNo}</div>` : ''}
        </div>
      </div>
    </div>
    
    <!-- Customer Information -->
    <div class="customer-section">
      <h3>Bill To</h3>
      <div class="customer-name">${invoice.customerName}</div>
      ${invoice.customerPhone ? `<div class="customer-phone">${invoice.customerPhone}</div>` : ''}
    </div>
    
    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th>Item Description</th>
          <th class="text-center" style="width: 60px;">Qty</th>
          <th class="text-right" style="width: 100px;">Weight (kg)</th>
          <th class="text-right" style="width: 100px;">Price</th>
          <th class="text-right" style="width: 120px;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.items
          .map(
            (item) => `
          <tr>
            <td class="item-name">${item.itemName}</td>
            <td class="text-center text-muted">${item.qty}</td>
            <td class="text-right text-muted">${item.totalKg.toFixed(2)}</td>
            <td class="text-right text-muted">₨.${item.price.toLocaleString()}</td>
            <td class="text-right">₨.${item.amount.toLocaleString()}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
    
    <!-- Summary Section -->
    <div class="summary-container">
      <div class="summary-box">
        <div class="summary-row">
          <span class="summary-label">Subtotal</span>
          <span class="summary-value">₨.${invoice.totalAmount.toLocaleString()}</span>
        </div>
        
        ${
          invoice.otherCharges > 0
            ? `
        <div class="summary-row">
          <span class="summary-label">Other Charges</span>
          <span class="summary-value">₨.${invoice.otherCharges.toLocaleString()}</span>
        </div>
        `
            : ''
        }
        
        <div class="summary-row summary-total">
          <span class="total-label">Total Amount</span>
          <span class="total-value">₨.${invoice.grandTotal.toLocaleString()}</span>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="invoice-footer">
      <div class="footer-text">
        Thank you for your business.<br>
        This is a computer-generated invoice and does not require a signature.
      </div>
    </div>
    
  </div>
</body>
</html>
  `);

    printWindow.document.close();
  };

  const columns = [
    {
      title: 'ITEM',
      dataIndex: 'itemName',
      key: 'itemName',
      render: (text) => <Text style={{ fontSize: '14px', color: '#111827', fontWeight: '500' }}>{text}</Text>
    },
    {
      title: 'QTY',
      dataIndex: 'qty',
      key: 'qty',
      align: 'center',
      width: 80,
      render: (qty) => <Text style={{ fontSize: '14px', color: '#6b7280' }}>{qty}</Text>
    },
    {
      title: 'WEIGHT (KG)',
      dataIndex: 'totalKg',
      key: 'totalKg',
      align: 'right',
      width: 120,
      render: (kg) => <Text style={{ fontSize: '14px', color: '#6b7280' }}>{kg.toFixed(2)}</Text>
    },
    {
      title: 'PRICE',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      width: 120,
      render: (price) => <Text style={{ fontSize: '14px', color: '#6b7280' }}>₨.{price.toLocaleString()}</Text>
    },
    {
      title: 'AMOUNT',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      width: 140,
      render: (amount) => <Text style={{ fontSize: '14px', color: '#111827', fontWeight: '500' }}>₨.{amount.toLocaleString()}</Text>
    }
  ];

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>
      {/* Action Bar */}
      <div
        className="no-print"
        style={{
          background: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          padding: '16px 24px',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}
      >
        <Space size={12}>
          <Button
            onClick={handlePrint}
            icon={<PrinterOutlined />}
            type="primary"
            style={{
              height: '36px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Print Invoice
          </Button>
          <Button
            icon={<DownloadOutlined />}
            style={{
              height: '36px',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151'
            }}
          >
            Download PDF
          </Button>
        </Space>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div>
              <Title
                level={1}
                style={{
                  margin: 0,
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#111827',
                  letterSpacing: '-0.02em'
                }}
              >
                Invoice
              </Title>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Text style={{ fontSize: '14px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>{invoice.invoiceNo}</Text>
              <Text style={{ fontSize: '14px', color: '#6b7280' }}>{dayjs(invoice.date).format('DD MMM YYYY')}</Text>
            </div>
          </div>
          {invoice.gatePassNo && <Text style={{ fontSize: '14px', color: '#6b7280' }}>Gate Pass: {invoice.gatePassNo}</Text>}
        </div>

        {/* Customer Info */}
        <div
          style={{
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '24px',
            marginBottom: '32px'
          }}
        >
          <Row gutter={48}>
            <Col span={12}>
              <Text
                style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  display: 'block',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: '600'
                }}
              >
                Customer
              </Text>
              <Text style={{ fontSize: '15px', color: '#111827', fontWeight: '600', display: 'block' }}>{invoice.customerName}</Text>
              {invoice.customerPhone && (
                <Text style={{ fontSize: '14px', color: '#6b7280', display: 'block', marginTop: '4px' }}>{invoice.customerPhone}</Text>
              )}
            </Col>
          </Row>
        </div>

        {/* Items Table */}
        <div style={{ marginBottom: '32px' }}>
          <Table
            columns={columns}
            dataSource={invoice.items}
            rowKey="id"
            pagination={false}
            size="small"
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              overflow: 'hidden'
            }}
            className="professional-table"
          />
        </div>

        {/* Summary */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
          <div style={{ width: '320px' }}>
            <div style={{ padding: '16px 0', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: '14px', color: '#6b7280' }}>Subtotal</Text>
              <Text style={{ fontSize: '14px', color: '#111827', fontWeight: '500' }}>₨.{invoice.totalAmount.toLocaleString()}</Text>
            </div>

            {invoice.otherCharges > 0 && (
              <div style={{ padding: '16px 0', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: '14px', color: '#6b7280' }}>Other Charges</Text>
                <Text style={{ fontSize: '14px', color: '#111827', fontWeight: '500' }}>₨.{invoice.otherCharges.toLocaleString()}</Text>
              </div>
            )}

            <div style={{ padding: '16px 0', display: 'flex', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: '16px', color: '#111827', fontWeight: '700' }}>Total</Text>
              <Text style={{ fontSize: '18px', color: '#111827', fontWeight: '500' }}>₨.{invoice.grandTotal.toLocaleString()}</Text>
            </div>

            <Divider style={{ margin: '16px 0', borderColor: '#e5e7eb' }} />

            <div style={{ padding: '8px 0', display: 'flex', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: '13px', color: '#6b7280' }}>Total Quantity</Text>
              <Text style={{ fontSize: '13px', color: '#111827', fontWeight: '600' }}>{invoice.totalQty} items</Text>
            </div>

            <div style={{ padding: '8px 0', display: 'flex', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: '13px', color: '#6b7280' }}>Total Weight</Text>
              <Text style={{ fontSize: '13px', color: '#111827', fontWeight: '600' }}>{invoice.totalKg.toFixed(2)} kg</Text>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', paddingTop: '32px', borderTop: '1px solid #e5e7eb' }}>
          <Text style={{ fontSize: '13px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Thank you for your business</Text>
          <Text style={{ fontSize: '12px', color: '#d1d5db' }}>This is a computer-generated invoice</Text>
        </div>
      </div>

      <style>{`
        .professional-table .ant-table {
          background: transparent;
        }

        .professional-table .ant-table-thead > tr > th {
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          padding: 12px 16px;
          font-size: 11px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .professional-table .ant-table-tbody > tr > td {
          padding: 14px 16px;
          border-bottom: 1px solid #f3f4f6;
        }

        .professional-table .ant-table-tbody > tr:last-child > td {
          border-bottom: none;
        }

        .professional-table .ant-table-tbody > tr:hover > td {
          background: #fafafa;
        }
      `}</style>
    </div>
  );
};

export default InvoiceView;
