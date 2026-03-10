import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Button, Form, DatePicker, Select, Space, ConfigProvider, Card, Row, Col, Statistic, Spin } from 'antd';
import { AgGridReact } from 'ag-grid-react';
import { FileText, Calendar, Users, TrendingUp, DollarSign, Package, Download, RefreshCw } from 'lucide-react';
import MainCard from 'components/MainCard';
import dayjs from 'dayjs';
import { Fetch_Sales_Report, Clear_Sales_Report } from '../../../../Redux/Action/ReportsAction/ReportsAction';
import { Fetch_Customers } from '../../../../Redux/Action/Party/CustomerActions/CustomerActions';
import { printReport } from '../../../../utils/PrintHandler';

const { RangePicker } = DatePicker;

const SaleRpt = () => {
  const dispatch = useDispatch();
  const { salesReport, salesLoading } = useSelector((state) => state.reports);
  const { customers, loading: customerLoading } = useSelector((state) => state.PRT.customer);

  const [form] = Form.useForm();
  const [dateRange, setDateRange] = useState([dayjs().subtract(1, 'month'), dayjs()]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    dispatch(Fetch_Customers(1));
    return () => {
      dispatch(Clear_Sales_Report());
    };
  }, [dispatch]);

  const handleGenerateReport = async (values) => {
    const filters = {
      startDate: values?.dateRange ? values.dateRange[0].format('YYYY-MM-DD') : dateRange[0].format('YYYY-MM-DD'),
      endDate: values?.dateRange ? values.dateRange[1].format('YYYY-MM-DD') : dateRange[1].format('YYYY-MM-DD'),
      customerId: values?.customerId || selectedCustomer || null
    };

    await dispatch(Fetch_Sales_Report(filters));
  };

  const handlePrint = () => {
    if (!salesReport?.sales || salesReport.sales.length === 0) {
      toast.info('No data to print. Please generate the report.');
      return;
    }
    const summary = {
      totalInvoices: salesReport.summary?.totalInvoices || 0,
      totalKilograms: salesReport.summary?.totalKilograms || 0,
      totalSales: salesReport.summary?.totalSales || 0,
      totalProfit: salesReport.summary?.totalProfit || 0,
      overallProfitPercentage: salesReport.summary?.overallProfitPercentage || 0,
      totalExpense: salesReport.summary?.totalExpense || 0,
      netProfit: salesReport.summary?.netProfit || 0
    };

    const filters = {
      startDate: dateRange[0].format('YYYY-MM-DD'),
      endDate: dateRange[1].format('YYYY-MM-DD'),
      customerName: selectedCustomer ? customers.find((c) => c.id === selectedCustomer)?.partyName : 'All Customers'
    };

    printReport({
      reportType: 'sales',
      data: salesReport.sales,
      summary,
      filters
    });
  };

  const handleReset = () => {
    form.resetFields();
    setDateRange([dayjs().subtract(1, 'month'), dayjs()]);
    setSelectedCustomer(null);
    form.setFieldsValue({
      dateRange: [dayjs().subtract(1, 'month'), dayjs()],
      customerId: undefined
    });
    handleGenerateReport();
  };

  // Customer Options
  const customerOptions = useMemo(() => {
    return [{ label: 'All Customers', value: null }, ...customers.map((c) => ({ label: c.partyName, value: c.id }))];
  }, [customers]);

  // AG Grid Column Definitions
  const columnDefs = useMemo(
    () => [
      {
        headerName: 'INVOICE NO',
        field: 'invoiceNo',
        width: 170,
        pinned: 'left',
        cellRenderer: (params) => <div style={{ fontWeight: 600, color: '#111827' }}>{params.value}</div>
      },
      {
        headerName: 'DATE',
        field: 'invoiceDate',
        width: 130,
        cellRenderer: (params) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280' }}>
            <Calendar size={14} />
            <span>{dayjs(params.value).format('DD MMM YYYY')}</span>
          </div>
        )
      },
      {
        headerName: 'CUSTOMER',
        field: 'customerName',
        flex: 1,
        minWidth: 200,
        cellRenderer: (params) => (
          <div style={{ lineHeight: '1.2' }}>
            <div style={{ fontWeight: 500, color: '#111827' }}>{params.value}</div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>{params.data.customerPhone || '—'}</div>
          </div>
        )
      },
      {
        headerName: 'QTY',
        field: 'totalQty',
        width: 90,
        type: 'rightAligned',
        cellRenderer: (params) => (
          <span style={{ fontWeight: 500, textAlign: 'right', width: '100%', display: 'block' }}>{params.value}</span>
        )
      },
      {
        headerName: 'WEIGHT (KG)',
        field: 'totalKg',
        width: 130,
        type: 'rightAligned',
        cellRenderer: (params) => (
          <span style={{ fontWeight: 500, textAlign: 'right', width: '100%', display: 'block' }}>{params.value?.toFixed(2)}</span>
        )
      },
      {
        headerName: 'SALE AMOUNT',
        field: 'saleAmount',
        width: 150,
        type: 'rightAligned',
        cellRenderer: (params) => (
          <span style={{ fontWeight: 600, color: '#059669', textAlign: 'right', width: '100%', display: 'block' }}>
            Rs. {params.value?.toLocaleString()}
          </span>
        )
      },
      {
        headerName: 'COST',
        field: 'totalCost',
        width: 140,
        type: 'rightAligned',
        cellRenderer: (params) => (
          <span style={{ fontWeight: 500, color: '#dc2626', textAlign: 'right', width: '100%', display: 'block' }}>
            Rs. {params.value?.toLocaleString()}
          </span>
        )
      },
      {
        headerName: 'PROFIT',
        field: 'profit',
        width: 140,
        type: 'rightAligned',
        cellRenderer: (params) => (
          <span
            style={{
              fontWeight: 600,
              color: params.value >= 0 ? '#059669' : '#dc2626',
              textAlign: 'right',
              width: '100%',
              display: 'block'
            }}
          >
            Rs. {params.value?.toLocaleString()}
          </span>
        )
      },
      {
        headerName: 'PROFIT %',
        field: 'profitPercentage',
        width: 120,
        type: 'rightAligned',
        cellRenderer: (params) => (
          <div
            style={{
              fontWeight: 600,
              color: params.value >= 0 ? '#059669' : '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '4px',
              textAlign: 'right',
              width: '100%',
              display: 'block'
            }}
          >
            <TrendingUp size={14} />
            <span>{params.value?.toFixed(2)}%</span>
          </div>
        )
      }
    ],
    []
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true
    }),
    []
  );

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
          DatePicker: { controlHeight: 38 }
        }
      }}
    >
      <MainCard
        sx={{
          '& .MuiCardHeader-title': { fontFamily: '"Sofia Sans", sans-serif' },
          '& .MuiCardHeader-subheader': { fontFamily: '"Sofia Sans", sans-serif' },
          '& .MuiCardContent-root': { fontFamily: '"Sofia Sans", sans-serif', padding: '24px !important' }
        }}
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
              <FileText size={20} strokeWidth={1.5} color="#111827" />
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 600, color: '#111827' }}>Sales Report</div>
              <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 400 }}>Detailed sales analysis with profit calculation</div>
            </div>
          </div>
        }
      >
        {/* Filters Section */}
        <Card
          style={{
            marginBottom: '20px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            boxShadow: 'none'
          }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleGenerateReport}
            initialValues={{
              dateRange: [dayjs().subtract(1, 'month'), dayjs()],
              customerId: undefined
            }}
          >
            <Row gutter={16}>
              <Col xs={24} sm={12} md={7}>
                <Form.Item label={<span style={{ fontWeight: 500, color: '#374151', fontSize: '13px' }}>Date Range</span>} name="dateRange">
                  <RangePicker style={{ width: '100%' }} format="DD MMM YYYY" onChange={(dates) => setDateRange(dates)} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item label={<span style={{ fontWeight: 500, color: '#374151', fontSize: '13px' }}>Customer</span>} name="customerId">
                  <Select
                    placeholder="Select customer (optional)"
                    options={customerOptions}
                    loading={customerLoading}
                    onChange={(value) => setSelectedCustomer(value)}
                    showSearch
                    allowClear
                    filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} sm={24} md={8}>
                <Form.Item label={<span style={{ opacity: 0 }}>Actions</span>}>
                  <Space style={{ width: '100%' }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={salesLoading}
                      icon={<FileText size={16} />}
                      style={{
                        background: '#111827',
                        borderRadius: '6px',
                        fontWeight: 500,
                        border: 'none',
                        flex: 1
                      }}
                    >
                      Generate
                    </Button>
                    {salesReport?.sales?.length > 0 && (
                      <Button type="default" icon={<Download size={16} />} onClick={() => handlePrint()}>
                        Print
                      </Button>
                    )}
                    <Button
                      onClick={handleReset}
                      icon={<RefreshCw size={16} />}
                      style={{
                        borderRadius: '6px',
                        fontWeight: 500,
                        border: '1px solid #e5e7eb'
                      }}
                    >
                      Reset
                    </Button>
                  </Space>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>

        {/* Summary Cards */}
        {salesReport?.summary && (
          <Row gutter={16} style={{ marginBottom: '20px' }}>
            <Col xs={12} sm={8} md={6} lg={4}>
              <Card style={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <Statistic
                  title="Total Invoices"
                  value={salesReport.summary.totalInvoices}
                  prefix={<FileText size={16} />}
                  valueStyle={{ color: '#111827', fontSize: '20px', fontWeight: 600 }}
                />
              </Card>
            </Col>
            {/* <Col xs={12} sm={8} md={6} lg={4}>
              <Card style={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <Statistic
                  title="Customers"
                  value={salesReport.summary.totalCustomers}
                  prefix={<Users size={16} />}
                  valueStyle={{ color: '#111827', fontSize: '20px', fontWeight: 600 }}
                />
              </Card>
            </Col> */}
            <Col xs={12} sm={8} md={6} lg={4}>
              <Card style={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <Statistic
                  title="Total KG"
                  value={salesReport.summary.totalKilograms}
                  prefix={<Package size={16} />}
                  valueStyle={{ color: '#111827', fontSize: '20px', fontWeight: 600 }}
                  precision={2}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6} lg={4}>
              <Card style={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <Statistic
                  title="Total Sales"
                  value={salesReport.summary.totalSales}
                  prefix="Rs."
                  valueStyle={{ color: '#059669', fontSize: '20px', fontWeight: 600 }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6} lg={4}>
              <Card style={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <Statistic
                  title="Total Profit"
                  value={salesReport.summary.totalProfit}
                  prefix="Rs."
                  valueStyle={{ color: salesReport.summary.totalProfit >= 0 ? '#059669' : '#dc2626', fontSize: '20px', fontWeight: 600 }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6} lg={4}>
              <Card style={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <Statistic
                  title="Total Expense"
                  value={salesReport.summary.totalExpense}
                  prefix="Rs."
                  valueStyle={{ color: '#059669', fontSize: '20px', fontWeight: 600 }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6} lg={4}>
              <Card style={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <Statistic
                  title="Net Profit"
                  value={salesReport.summary.netProfit}
                  prefix="Rs."
                  valueStyle={{ color: salesReport.summary.netProfit >= 0 ? '#059669' : '#dc2626', fontSize: '20px', fontWeight: 600 }}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Data Grid */}
        <Spin spinning={salesLoading}>
          <div
            className="ag-theme-quartz"
            style={{
              height: 'calc(100vh - 500px)',
              width: '100%',
              minHeight: '400px',
              '--ag-header-background-color': '#f9fafb',
              '--ag-header-foreground-color': '#111827',
              '--ag-border-color': '#e5e7eb',
              '--ag-row-hover-color': '#f9fafb',
              '--ag-font-family': '"Sofia Sans", sans-serif',
              '--ag-font-size': '14px'
            }}
          >
            <AgGridReact
              rowData={salesReport?.sales || []}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              animateRows={true}
              rowHeight={60}
              headerHeight={44}
              pagination={true}
              paginationPageSize={20}
              paginationPageSizeSelector={[10, 20, 50, 100]}
              suppressDragLeaveHidesColumns={true}
              domLayout="normal"
            />
          </div>
        </Spin>

        <style>{`
          .ag-theme-quartz .ag-header-cell-label {
            font-weight: 600;
            color: #1f2937;
            font-size: 12px;
            letter-spacing: 0.5px;
          }
          
          .ag-theme-quartz .ag-cell {
            display: flex;
            align-items: center;
          }
          
          .ag-theme-quartz .ag-paging-panel {
            border-top: 1px solid #e5e7eb;
            padding: 12px 16px;
            font-size: 13px;
            color: #6b7280;
          }
        `}</style>
      </MainCard>
    </ConfigProvider>
  );
};

export default SaleRpt;
