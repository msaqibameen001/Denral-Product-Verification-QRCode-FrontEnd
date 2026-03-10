import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Form, DatePicker, Select, Space, ConfigProvider, Card, Row, Col, Statistic, Spin, Table, Typography, Tag, Collapse } from 'antd';
import {
  BookOpen,
  Calendar,
  Phone,
  MapPin,
  ArrowUpCircle,
  ArrowDownCircle,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import MainCard from 'components/MainCard';
import dayjs from 'dayjs';
import { Fetch_Ledger_Report, Clear_Ledger_Report } from '../../../../Redux/Action/ReportsAction/ReportsAction';
import { Fetch_Customers } from '../../../../Redux/Action/Party/CustomerActions/CustomerActions';
import { Fetch_Suppliers } from '../../../../Redux/Action/Party/SupplierActions/SupplierActions';
import { Fetch_OtherExpenses } from '../../../../Redux/Action/Party/OtherExpenseActions/OtherExpenseActions';
import { Fetch_Party_Types } from '../../../../Redux/Action/Party/PartyTypeActions/PartyTypeActions';
import { printReport } from '../../../../utils/PrintHandler';

const { RangePicker } = DatePicker;
const { Panel } = Collapse;

const LedgerRpt = () => {
  const dispatch = useDispatch();
  const { ledgerReport, ledgerLoading } = useSelector((state) => state.reports);
  const { customers } = useSelector((state) => state.PRT.customer);
  const { suppliers } = useSelector((state) => state.PRT.supplier);
  const { otherExpenses } = useSelector((state) => state.PRT.otherExpense);
  const { partyTypes } = useSelector((state) => state.PRT.partyType);

  const [dateRange, setDateRange] = useState([dayjs().subtract(1, 'month'), dayjs()]);
  const [selectedPartyType, setSelectedPartyType] = useState(null);
  const [selectedParty, setSelectedParty] = useState(null);
  const [partyTypeId, setPartyTypeId] = useState(null);
  const [partyId, setPartyId] = useState(null);
  const [expandedRows, setExpandedRows] = useState([]); // Track expanded rows

  useEffect(() => {
    dispatch(Fetch_Party_Types());
    dispatch(Fetch_Customers(1));
    dispatch(Fetch_Suppliers(2));
    dispatch(Fetch_OtherExpenses(3));

    return () => {
      dispatch(Clear_Ledger_Report());
    };
  }, [dispatch]);

  const handleGenerateReport = async () => {
    if (partyTypeId == null || partyId == null) {
      return;
    }

    const filters = {
      partyTypeId: partyTypeId,
      partyId: partyId,
      startDate: dateRange[0].format('YYYY-MM-DD'),
      endDate: dateRange[1].format('YYYY-MM-DD')
    };

    await dispatch(Fetch_Ledger_Report(filters));
  };

// LedgerRpt.js میں handlePrintLedger function update کریں:
const handlePrintLedger = () => {
  if (!ledgerReport || !ledgerReport.transactions?.length) {
    alert('No data to print');
    return;
  }

  const filters = {
    startDate: dateRange[0]?.format('YYYY-MM-DD'),
    endDate: dateRange[1]?.format('YYYY-MM-DD')
  };

  const additionalInfo = {
    partyName: selectedParty ? partyOptions.find(p => p.value === partyId)?.label : 'All Parties',
    partyTypeName: selectedPartyType ? partyTypeOptions.find(pt => pt.value === partyTypeId)?.label : 'All Types',
    phone: ledgerReport.partyInfo?.phone,
    address: ledgerReport.partyInfo?.address
  };

  // Use groupedLedger report type for grouped structure
  const printData = groupedData.flatMap(party => {
    // Add party row
    const partyRow = { ...party, isPartyRow: true };
    
    // Add transaction rows with party info
    const transactionRows = party.transactions.map(txn => ({
      ...txn,
      isPartyRow: false,
      partyName: party.partyName,
      partyId: party.partyId
    }));
    
    return [partyRow, ...transactionRows];
  }).filter(item => item.isPartyRow); // Only send party rows with nested transactions

  printReport({
    reportType: 'groupedLedger',
    data: groupedData, // Send the grouped data directly
    summary: ledgerReport.summary || {},
    filters,
    additionalInfo
  });
};

  const handleReset = () => {
    setDateRange([dayjs().subtract(1, 'month'), dayjs()]);
    setSelectedParty(null);
    setSelectedPartyType(null);
    setPartyTypeId(null);
    setPartyId(null);
    setExpandedRows([]); // Reset expanded rows
    dispatch(Clear_Ledger_Report());
  };

  const partyOptions = useMemo(() => {
    if (!selectedPartyType) return [];

    let parties = [];
    if (selectedPartyType === 1) {
      parties = customers.map((c) => ({ label: c.partyName, value: c.id }));
    } else if (selectedPartyType === 2) {
      parties = suppliers.map((s) => ({ label: s.partyName, value: s.id }));
    } else if (selectedPartyType === 3) {
      parties = otherExpenses.map((e) => ({ label: e.partyName, value: e.id }));
    }

    return [{ label: 'All Parties', value: 0 }, ...parties];
  }, [selectedPartyType, customers, suppliers, otherExpenses]);

  const partyTypeOptions = useMemo(() => {
    return partyTypes?.map((pt) => ({ label: pt.partyTypeName, value: pt.partyTypeId })) || [];
  }, [partyTypes]);

  // Transform data for grouped display
  const groupedData = useMemo(() => {
    if (!ledgerReport?.partiesInfo) return [];

    return ledgerReport.partiesInfo.map((party) => {
      // Filter transactions for this party
      const partyTransactions = (ledgerReport.transactions || []).filter((txn) => txn.partyId === party.partyId);

      return {
        key: `party-${party.partyId}`,
        partyId: party.partyId,
        partyName: party.partyName,
        address: party.address,
        phone: party.phone,
        partyTypeName: party.partyTypeName,
        openingBalance: party.openingBalance,
        currentBalance: party.currentBalance,
        transactions: partyTransactions,
        isPartyRow: true
      };
    });
  }, [ledgerReport]);

  // Transaction columns (for expandable section)
  const transactionColumns = [
    {
      title: 'DATE',
      dataIndex: 'transactionDate',
      width: 120,
      render: (date) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280' }}>
          <Calendar size={12} />
          <span style={{ fontSize: '12px' }}>{dayjs(date).format('DD MMM YY')}</span>
        </div>
      )
    },
    {
      title: 'TYPE',
      dataIndex: 'transactionType',
      width: 120,
      render: (type) => {
        const colors = {
          Invoice: '#3b82f6',
          Purchase: '#f59e0b',
          'Payment Received': '#10b981',
          'Payment Made': '#ef4444'
        };
        return (
          <Tag color={colors[type] || '#6b7280'} style={{ 
            fontWeight: 500, 
            borderRadius: '4px', 
            padding: '2px 8px',
            fontSize: '11px',
            lineHeight: '1.2'
          }}>
            {type}
          </Tag>
        );
      }
    },
    {
      title: 'REFERENCE',
      dataIndex: 'referenceNo',
      width: 100,
      render: (ref) => <span style={{ fontWeight: 600, color: '#111827', fontSize: '12px' }}>{ref}</span>
    },
    {
      title: 'DESCRIPTION',
      dataIndex: 'description',
      width: 200,
      render: (desc) => <span style={{ color: '#6b7280', fontSize: '12px' }}>{desc}</span>
    },
    {
      title: 'DEBIT',
      dataIndex: 'debit',
      width: 100,
      align: 'right',
      render: (debit) => {
        if (debit === 0) return <span style={{ color: '#d1d5db', fontSize: '12px' }}>—</span>;
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
            <ArrowUpCircle size={12} color="#dc2626" />
            <span style={{ fontWeight: 600, color: '#dc2626', fontSize: '12px' }}>Rs. {debit?.toLocaleString()}</span>
          </div>
        );
      }
    },
    {
      title: 'CREDIT',
      dataIndex: 'credit',
      width: 100,
      align: 'right',
      render: (credit) => {
        if (credit === 0) return <span style={{ color: '#d1d5db', fontSize: '12px' }}>—</span>;
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
            <ArrowDownCircle size={12} color="#059669" />
            <span style={{ fontWeight: 600, color: '#059669', fontSize: '12px' }}>Rs. {credit?.toLocaleString()}</span>
          </div>
        );
      }
    },
    {
      title: 'BALANCE',
      dataIndex: 'balance',
      width: 120,
      align: 'right',
      render: (balance) => (
        <span style={{ fontWeight: 700, color: balance >= 0 ? '#059669' : '#dc2626', fontSize: '12px' }}>
          Rs. {balance?.toLocaleString()}
        </span>
      )
    }
  ];

  // Main party columns
  const partyColumns = [
    {
      title: 'PARTY NAME',
      dataIndex: 'partyName',
      width: 200,
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#111827', fontSize: '13px', marginBottom: '2px' }}>{name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6b7280', fontSize: '11px' }}>
            <Tag color="#3b82f6" style={{ fontSize: '10px', padding: '0 6px' }}>
              {record.partyTypeName}
            </Tag>
          </div>
        </div>
      )
    },
    {
      title: 'CONTACT INFO',
      width: 180,
      render: (_, record) => (
        <div style={{ fontSize: '12px' }}>
          {record.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6b7280', marginBottom: '2px' }}>
              <Phone size={10} />
              <span>{record.phone}</span>
            </div>
          )}
          {record.address && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#6b7280' }}>
              <MapPin size={10} />
              <span style={{ 
                maxWidth: '150px', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap',
                fontSize: '11px'
              }}>
                {record.address}
              </span>
            </div>
          )}
        </div>
      )
    },
    {
      title: 'OPENING BALANCE',
      dataIndex: 'openingBalance',
      width: 130,
      align: 'right',
      render: (balance) => (
        <span style={{ fontWeight: 600, color: balance >= 0 ? '#059669' : '#dc2626', fontSize: '13px' }}>
          Rs. {balance?.toLocaleString()}
        </span>
      )
    },
    {
      title: 'CURRENT BALANCE',
      dataIndex: 'currentBalance',
      width: 130,
      align: 'right',
      render: (balance) => (
        <span style={{ fontWeight: 700, color: balance >= 0 ? '#059669' : '#dc2626', fontSize: '13px' }}>
          Rs. {balance?.toLocaleString()}
        </span>
      )
    },
    {
      title: 'TRANSACTIONS',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Tag color={record.transactions?.length > 0 ? '#10b981' : '#9ca3af'} style={{ 
          fontWeight: 600,
          fontSize: '11px',
          padding: '2px 8px'
        }}>
          {record.transactions?.length || 0}
        </Tag>
      )
    },
    {
      title: '',
      width: 50,
      align: 'center',
      render: (_, record) => {
        const isExpanded = expandedRows.includes(record.key);
        return (
          <Button
            type="text"
            size="small"
            icon={isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            onClick={() => {
              if (isExpanded) {
                setExpandedRows(expandedRows.filter(key => key !== record.key));
              } else {
                setExpandedRows([...expandedRows, record.key]);
              }
            }}
            style={{ padding: '2px', minWidth: 'auto' }}
          />
        );
      }
    }
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: '"Sofia Sans", sans-serif',
          colorPrimary: '#111827',
          colorBgContainer: '#ffffff',
          borderRadius: 6,
          colorBorder: '#e5e7eb',
          colorText: '#111827',
          colorTextSecondary: '#6b7280',
          fontSize: 14
        },
        components: {
          Button: { controlHeight: 36, borderRadius: 6 },
          Input: { controlHeight: 38 },
          Select: { controlHeight: 38 },
          DatePicker: { controlHeight: 38 },
          Table: {
            headerBg: '#f9fafb',
            headerColor: '#374151',
            headerSplitColor: '#e5e7eb',
            rowHoverBg: '#f3f4f6',
            padding: 8,
            paddingSM: 6,
            paddingXS: 4
          }
        }
      }}
    >
      <MainCard
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '8px',
                background: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <BookOpen size={20} strokeWidth={1.5} color="#111827" />
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 600, color: '#111827' }}>Ledger Report</div>
              <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 400 }}>Party-wise transaction history with running balance</div>
            </div>
          </div>
        }
      >
        {/* Filters Section */}
        <Card style={{ marginBottom: '20px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: 'none' }}>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={4}>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontWeight: 500, color: '#374151', fontSize: '13px' }}>
                  Party Type <span style={{ color: '#ef4444' }}>*</span>
                </span>
              </div>
              <Select
                placeholder="Select party type"
                options={partyTypeOptions}
                value={partyTypeId}
                onChange={(value) => {
                  setSelectedPartyType(value);
                  setPartyTypeId(value);
                  setPartyId(null);
                  setExpandedRows([]); // Clear expanded rows when party type changes
                }}
                showSearch
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                style={{ width: '100%' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontWeight: 500, color: '#374151', fontSize: '13px' }}>
                  Party <span style={{ color: '#ef4444' }}>*</span>
                </span>
              </div>
              <Select
                placeholder="Select party"
                options={partyOptions}
                value={partyId}
                onChange={(value) => {
                  setSelectedParty(value);
                  setPartyId(value);
                  setExpandedRows([]); // Clear expanded rows when party changes
                }}
                showSearch
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                style={{ width: '100%' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontWeight: 500, color: '#374151', fontSize: '13px' }}>Date Range</span>
              </div>
              <RangePicker
                value={dateRange}
                style={{ width: '100%' }}
                format="DD MMM YYYY"
                onChange={(dates) => {
                  setDateRange(dates);
                  setExpandedRows([]); // Clear expanded rows when date changes
                }}
              />
            </Col>
            <Col xs={24} sm={24} md={6}>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ opacity: 0 }}>Actions</span>
              </div>
              <Space style={{ width: '100%' }}>
                <Button
                  type="primary"
                  onClick={handleGenerateReport}
                  loading={ledgerLoading}
                  icon={<BookOpen size={16} />}
                  style={{ background: '#111827', borderRadius: '6px', fontWeight: 500, border: 'none' }}
                >
                  Generate
                </Button>
                {ledgerReport?.transactions?.length > 0 && (
                  <Button
                    type="default"
                    onClick={handlePrintLedger}
                    icon={<Download size={16} />}
                    style={{ borderRadius: '6px', fontWeight: 500, border: '1px solid #e5e7eb' }}
                  >
                    Print
                  </Button>
                )}
                <Button
                  onClick={handleReset}
                  icon={<RefreshCw size={16} />}
                  style={{ borderRadius: '6px', fontWeight: 500, border: '1px solid #e5e7eb' }}
                >
                  Reset
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Summary Cards */}
        {ledgerReport?.summary && ledgerReport.partiesInfo?.length > 0 && (
          <Row gutter={16} style={{ marginBottom: '20px' }}>
            <Col xs={24} sm={12} md={6}>
              <Card style={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <Statistic
                  title="Opening Balance"
                  value={ledgerReport.summary.openingBalance}
                  prefix="Rs."
                  valueStyle={{
                    color: ledgerReport.summary.openingBalance >= 0 ? '#059669' : '#dc2626',
                    fontSize: '20px',
                    fontWeight: 600
                  }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card style={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <Statistic
                  title="Total Debits"
                  value={ledgerReport.summary.totalDebits}
                  prefix={<ArrowUpCircle size={16} />}
                  valueStyle={{ color: '#dc2626', fontSize: '20px', fontWeight: 600 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card style={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <Statistic
                  title="Total Credits"
                  value={ledgerReport.summary.totalCredits}
                  prefix={<ArrowDownCircle size={16} />}
                  valueStyle={{ color: '#059669', fontSize: '20px', fontWeight: 600 }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card style={{ borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fef3c7' }}>
                <Statistic
                  title="Closing Balance"
                  value={ledgerReport.summary.closingBalance}
                  prefix="Rs."
                  valueStyle={{
                    color: ledgerReport.summary.closingBalance >= 0 ? '#059669' : '#dc2626',
                    fontSize: '22px',
                    fontWeight: 700
                  }}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Party-wise Grouped Table */}
        <Spin spinning={ledgerLoading}>
          <Card style={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: 'none' }}>
            <Table
              columns={partyColumns}
              dataSource={groupedData}
              pagination={false}
              expandable={{
                expandedRowKeys: expandedRows,
                onExpand: (expanded, record) => {
                  if (expanded) {
                    setExpandedRows([...expandedRows, record.key]);
                  } else {
                    setExpandedRows(expandedRows.filter(key => key !== record.key));
                  }
                },
                expandedRowRender: (record) => {
                  if (!record.transactions || record.transactions.length === 0) {
                    return (
                      <div style={{ padding: '16px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>
                        No transactions found for this party
                      </div>
                    );
                  }
                  return (
                    <Table
                      columns={transactionColumns}
                      dataSource={record.transactions}
                       pagination={false}
                      size="small"
                      style={{ marginLeft: '20px' }}
                      rowKey={(txn, index) => `txn-${record.partyId}-${index}`}
                    />
                  );
                },
                rowExpandable: () => true,
                expandIcon: () => null // Hide default expand icon since we added our own
              }}
              size="small"
              scroll={{ x: 'max-content' }}
              rowClassName={() => 'party-row'}
              locale={{
                emptyText: (
                  <div style={{ padding: '40px', textAlign: 'center' }}>
                    <BookOpen size={48} color="#d1d5db" style={{ marginBottom: '16px' }} />
                    <div style={{ color: '#6b7280', fontSize: '14px' }}>No data available. Please generate report.</div>
                  </div>
                )
              }}
              style={{
                fontSize: '13px'
              }}
            />
          </Card>
        </Spin>
      </MainCard>

      <style jsx global>{`
        .party-row {
          height: 48px !important;
        }
        .ant-table-tbody > tr > td {
          padding: 8px !important;
        }
        .ant-table-thead > tr > th {
          padding: 12px 8px !important;
          background: #f9fafb !important;
        }
        .ant-table-expanded-row > td {
          padding: 0 !important;
          background: #fafafa !important;
        }
        .ant-table.ant-table-small .ant-table-tbody > tr > td {
          padding: 6px !important;
        }
      `}</style>
    </ConfigProvider>
  );
};

export default LedgerRpt;