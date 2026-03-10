import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Form, DatePicker, Select, Space, Input, ConfigProvider, Card, Row, Col, Statistic, Spin } from 'antd';
import { AgGridReact } from 'ag-grid-react';
import { ShoppingCart, Calendar, Users, SearchIcon, Download, DollarSign, Package, RefreshCw } from 'lucide-react';
import MainCard from 'components/MainCard';
import dayjs from 'dayjs';
import { Fetch_Purchase_Report, Clear_Purchase_Report } from '../../../../Redux/Action/ReportsAction/ReportsAction';
import { Fetch_Suppliers } from '../../../../Redux/Action/Party/SupplierActions/SupplierActions';
import { printReport } from '../../../../utils/PrintHandler';

const { RangePicker } = DatePicker;

const PurchaseRpt = () => {
  const dispatch = useDispatch();
  const { purchaseReport, purchaseLoading } = useSelector((state) => state.reports);
  const { suppliers, loading: supplierLoading } = useSelector((state) => state.PRT.supplier);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  const [dateRange, setDateRange] = useState([dayjs().subtract(1, 'month'), dayjs()]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  useEffect(() => {
    dispatch(Fetch_Suppliers(2));

    return () => {
      dispatch(Clear_Purchase_Report());
    };
  }, [dispatch]);

  const handleGenerateReport = async (values) => {
    const filters = {
      startDate: values?.dateRange ? values.dateRange[0].format('YYYY-MM-DD') : dateRange[0].format('YYYY-MM-DD'),
      endDate: values?.dateRange ? values.dateRange[1].format('YYYY-MM-DD') : dateRange[1].format('YYYY-MM-DD'),
      supplierId: values?.supplierId || selectedSupplier || null
    };

    await dispatch(Fetch_Purchase_Report(filters));
  };

  const handlePrintReport = () => {
    if (!purchaseReport?.purchases || purchaseReport.purchases.length === 0) return;

    // Calculate totals
    const totals = purchaseReport.purchases.reduce(
      (acc, item) => {
        acc.totalQuantity += item.quantity || 0;
        acc.totalPurchaseAmount += item.purchaseAmount || 0;
        acc.totalUnitPrice += item.unitPrice || 0;
        return acc;
      },
      { totalQuantity: 0, totalPurchaseAmount: 0, totalUnitPrice: 0 }
    );

    // Prepare summary object for print
    const summary = {
      totalPurchases: purchaseReport.summary.totalPurchases,
      totalSuppliers: purchaseReport.summary.totalSuppliers,
      totalQuantity: totals.totalQuantity,
      totalPurchaseAmount: totals.totalPurchaseAmount,
      averagePricePerKg: purchaseReport.purchases.length > 0 ? totals.totalUnitPrice / purchaseReport.purchases.length : 0
    };

    // Filters info
    const filters = {
      startDate: dateRange[0].format('YYYY-MM-DD'),
      endDate: dateRange[1].format('YYYY-MM-DD'),
      supplierName: suppliers.find((s) => s.id === selectedSupplier)?.partyName || 'All Suppliers'
    };

    // Call generic print
    printReport({
      reportType: 'purchase',
      data: purchaseReport.purchases,
      summary,
      filters
    });
  };

  const handleReset = () => {
    form.resetFields();
    setDateRange([dayjs().subtract(1, 'month'), dayjs()]);
    setSelectedSupplier(null);
    form.setFieldsValue({
      dateRange: [dayjs().subtract(1, 'month'), dayjs()],
      supplierId: undefined
    });
    handleGenerateReport();
  };

  // Supplier Options
  const supplierOptions = useMemo(() => {
    return [{ label: 'All Suppliers', value: null }, ...suppliers.map((s) => ({ label: s.partyName, value: s.id }))];
  }, [suppliers]);

  const filteredPurchases = useMemo(() => {
    if (!searchText || !purchaseReport?.purchases) return purchaseReport?.purchases || [];

    const lowerSearch = searchText.toLowerCase();
    return purchaseReport.purchases.filter(
      (purchase) =>
        purchase.supplierName?.toLowerCase().includes(lowerSearch) ||
        purchase.gatePassNo?.toLowerCase().includes(lowerSearch) ||
        purchase.purchaseId?.toString().includes(lowerSearch) ||
        purchase.purchaseAmount?.toString().includes(lowerSearch)
    );
  }, [searchText, purchaseReport?.purchases]);

  // AG Grid Column Definitions
  const columnDefs = useMemo(
    () => [
      {
        headerName: 'PURCHASE ID',
        field: 'purchaseId',
        width: 130,
        pinned: 'left',
        cellRenderer: (params) => <div style={{ fontWeight: 600, color: '#111827' }}>PUR-{params.value}</div>
      },
      {
        headerName: 'DATE',
        field: 'purchaseDate',
        width: 130,
        cellRenderer: (params) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280' }}>
            <Calendar size={14} />
            <span>{dayjs(params.value).format('DD MMM YYYY')}</span>
          </div>
        )
      },
      {
        headerName: 'SUPPLIER',
        field: 'supplierName',
        flex: 1,
        minWidth: 200,
        cellRenderer: (params) => (
          <div style={{ lineHeight: '1.2' }}>
            <div style={{ fontWeight: 500, color: '#111827' }}>{params.value}</div>
          </div>
        )
      },
      {
        headerName: 'GATE PASS NO',
        field: 'gatePassNo',
        flex: 1,
        minWidth: 200
      },
      {
        headerName: 'UNIT PRICE',
        field: 'unitPrice',
        width: 140,
        type: 'rightAligned',
        cellRenderer: (params) => (
          <span style={{ fontWeight: 500, textAlign: 'right', width: '100%', display: 'block' }}>Rs. {params.value?.toFixed(2)}</span>
        )
      },
      {
        headerName: 'QUANTITY (KG)',
        field: 'quantity',
        width: 150,
        type: 'rightAligned',
        cellRenderer: (params) => (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              textAlign: 'right',
              width: '100%',
              display: 'block',
              gap: '6px'
            }}
          >
            <span style={{ fontWeight: 500 }}>{params.value?.toFixed(2)}</span>
          </div>
        )
      },
      {
        headerName: 'PURCHASE AMOUNT',
        field: 'purchaseAmount',
        width: 170,
        type: 'rightAligned',
        cellRenderer: (params) => (
          <span style={{ fontWeight: 600, color: '#dc2626', textAlign: 'right', width: '100%', display: 'block' }}>
            Rs. {params.value?.toLocaleString()}
          </span>
        )
      },
      // {
      //   headerName: 'SUPPLIER BALANCE',
      //   field: 'supplierBalance',
      //   width: 170,
      //   type: 'rightAligned',
      //   cellRenderer: (params) => (
      //     <span
      //       style={{
      //         fontWeight: 600,
      //         color: params.value > 0 ? '#dc2626' : '#059669',
      //         textAlign: 'right',
      //         width: '100%',
      //         display: 'block'
      //       }}
      //     >
      //       Rs. {params.value?.toLocaleString()}
      //     </span>
      //   )
      // }
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
              <ShoppingCart size={20} strokeWidth={1.5} color="#111827" />
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 600, color: '#111827' }}>Purchase Report</div>
              <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 400 }}>
                Comprehensive purchase analysis with supplier details
              </div>
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
              supplierId: undefined
            }}
          >
            <Row gutter={16}>
              <Col xs={24} sm={12} md={7}>
                <Form.Item label={<span style={{ fontWeight: 500, color: '#374151', fontSize: '13px' }}>Date Range</span>} name="dateRange">
                  <RangePicker style={{ width: '100%' }} format="DD MMM YYYY" onChange={(dates) => setDateRange(dates)} />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={8}>
                <Form.Item label={<span style={{ fontWeight: 500, color: '#374151', fontSize: '13px' }}>Supplier</span>} name="supplierId">
                  <Select
                    placeholder="Select supplier (optional)"
                    options={supplierOptions}
                    loading={supplierLoading}
                    onChange={(value) => setSelectedSupplier(value)}
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
                      loading={purchaseLoading}
                      icon={<ShoppingCart size={16} />}
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
                    {purchaseReport?.purchases?.length > 0 && (
                      <Button
                        type="default"
                        onClick={handlePrintReport}
                        icon={<Download size={16} />}
                        style={{
                          borderRadius: '6px',
                          fontWeight: 500,
                          border: '1px solid #e5e7eb'
                        }}
                      >
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
        {purchaseReport?.summary && (
          <Row gutter={16} style={{ marginBottom: '20px' }}>
            <Col xs={12} sm={8} md={6} lg={6}>
              <Card style={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <Statistic
                  title="Total Purchases"
                  value={purchaseReport.summary.totalPurchases}
                  prefix={<ShoppingCart size={16} />}
                  valueStyle={{ color: '#111827', fontSize: '20px', fontWeight: 600 }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6} lg={6}>
              <Card style={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <Statistic
                  title="Suppliers"
                  value={purchaseReport.summary.totalSuppliers}
                  prefix={<Users size={16} />}
                  valueStyle={{ color: '#111827', fontSize: '20px', fontWeight: 600 }}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6} lg={6}>
              <Card style={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <Statistic
                  title="Total KG"
                  value={purchaseReport.summary.totalQuantity}
                  prefix={<Package size={16} />}
                  valueStyle={{ color: '#111827', fontSize: '20px', fontWeight: 600 }}
                  precision={2}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6} lg={6}>
              <Card style={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <Statistic
                  title="Total Amount"
                  value={purchaseReport.summary.totalPurchaseAmount}
                  prefix="Rs."
                  valueStyle={{ color: '#dc2626', fontSize: '20px', fontWeight: 600 }}
                />
              </Card>
            </Col>
            {/* <Col xs={12} sm={8} md={6} lg={4}>
              <Card style={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <Statistic
                  title="Avg Price/KG"
                  value={purchaseReport.summary.averagePricePerKg}
                  prefix="Rs."
                  valueStyle={{ color: '#111827', fontSize: '20px', fontWeight: 600 }}
                  precision={2}
                />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6} lg={4}>
              <Card style={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>Price Range</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                  Rs. {purchaseReport.summary.minPricePerKg?.toFixed(2)} - Rs. {purchaseReport.summary.maxPricePerKg?.toFixed(2)}
                </div>
              </Card>
            </Col> */}
          </Row>
        )}
        {purchaseReport?.purchases?.length > 0 && (
          <Card style={{ marginBottom: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <Input
              placeholder="Search by Supplier Name, Gate Pass No, or Amount..."
              prefix={<SearchIcon size={18} strokeWidth={1.5} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ height: '40px', width: '600px' }}
              allowClear
            />
          </Card>
        )}
        {/* Data Grid */}
        <Spin spinning={purchaseLoading}>
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
              rowData={filteredPurchases}
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

export default PurchaseRpt;
