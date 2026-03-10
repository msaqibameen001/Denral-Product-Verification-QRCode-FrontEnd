import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  Drawer,
  Form,
  Input,
  InputNumber,
  Space,
  Modal,
  Radio,
  Select,
  Popconfirm,
  Tag,
  ConfigProvider,
  Divider,
  DatePicker
} from 'antd';
import { AgGridReact } from 'ag-grid-react';
import { Wallet, Plus, Pencil, Trash2, ArrowDownCircle, ArrowUpCircle, Calendar, Search, FileText } from 'lucide-react';
import MainCard from 'components/MainCard';
import dayjs from 'dayjs';
import {
  Fetch_Petty_Cashes,
  Add_Petty_Cash,
  Update_Petty_Cash,
  Delete_Petty_Cash
} from '../../../Redux/Action/PettyCashAction/PettyCashAction';
import { Fetch_Customers } from '../../../Redux/Action/Party/CustomerActions/CustomerActions';
import { Fetch_Suppliers } from '../../../Redux/Action/Party/SupplierActions/SupplierActions';
import { Fetch_OtherExpenses } from '../../../Redux/Action/Party/OtherExpenseActions/OtherExpenseActions';

const PettyCash = () => {
  const dispatch = useDispatch();
  const { pettyCashes, loading, actionLoading } = useSelector((state) => state.PC);
  const { customers, loading: customerLoading } = useSelector((state) => state.PRT.customer);
  const { suppliers, loading: supplierLoading } = useSelector((state) => state.PRT.supplier);
  const { otherExpenses, loading: expenseLoading } = useSelector((state) => state.PRT.otherExpense);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [editingPettyCash, setEditingPettyCash] = useState(null);
  const [paymentDirection, setPaymentDirection] = useState('in'); // 'in' or 'out'
  const [outType, setOutType] = useState('supplier'); // 'supplier' or 'expense'
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(Fetch_Petty_Cashes());
    dispatch(Fetch_Customers(1));
    dispatch(Fetch_Suppliers(2));
    dispatch(Fetch_OtherExpenses(3));
  }, [dispatch]);

  const handleAdd = () => {
    setEditingPettyCash(null);
    setPaymentDirection('in');
    setOutType('supplier');
    form.resetFields();
    form.setFieldsValue({ transactionDate: dayjs() });
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingPettyCash(record);
    const isIn = record.paymentType === 1;
    setPaymentDirection(isIn ? 'in' : 'out');

    // Determine out type based on party type
    if (!isIn) {
      const isSupplier = suppliers.some((s) => s.id === record.partyId);
      setOutType(isSupplier ? 'supplier' : 'expense');
    }

    form.setFieldsValue({
      partyId: record.partyId,
      amount: record.amount,
      remarks: record.remarks,
      transactionDate: record.transactionDate ? dayjs(record.transactionDate, 'YYYY-MM-DD') : null
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    await dispatch(Delete_Petty_Cash(id));
    dispatch(Fetch_Petty_Cashes());
  };

  const filteredPettyCashes = useMemo(() => {
    if (!searchText) return pettyCashes;

    const lowerSearch = searchText.toLowerCase();
    return pettyCashes.filter((cash) => {
      return (
        cash.partyName?.toLowerCase().includes(lowerSearch) ||
        cash.partyTypeName?.toLowerCase().includes(lowerSearch) ||
        cash.paymentTypeName?.toLowerCase().includes(lowerSearch) ||
        cash.remarks?.toLowerCase().includes(lowerSearch) ||
        cash.amount?.toString().includes(lowerSearch) ||
        dayjs(cash.transactionDate).format('DD MMM YYYY').toLowerCase().includes(lowerSearch)
      );
    });
  }, [pettyCashes, searchText]);

  const handleSubmit = async (values) => {
    const payload = {
      partyId: values.partyId,
      amount: values.amount,
      paymentType: paymentDirection === 'in' ? 1 : -1,
      remarks: values.remarks || '',
      transactionDate: values.transactionDate ? values.transactionDate.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')
    };

    let success = false;
    if (editingPettyCash) {
      success = await dispatch(Update_Petty_Cash(editingPettyCash.id, payload));
    } else {
      success = await dispatch(Add_Petty_Cash(payload));
    }

    if (success) {
      setIsModalOpen(false);
      form.resetFields();
      dispatch(Fetch_Petty_Cashes());
    }
  };

  // Get party options based on selection
  const partyOptions = useMemo(() => {
    console.log(customers);
    console.log(suppliers);
    console.log(otherExpenses);
    if (paymentDirection === 'in') {
      return customers.map((c) => ({ label: c.partyName, value: c.id }));
    } else {
      if (outType === 'supplier') {
        return suppliers.map((s) => ({ label: s.partyName, value: s.id }));
      } else {
        return otherExpenses.map((e) => ({ label: e.partyName, value: e.id }));
      }
    }
  }, [paymentDirection, outType, customers, suppliers, otherExpenses]);

  // AG Grid Column Definitions
  const columnDefs = useMemo(
    () => [
      {
        headerName: 'TR.DATE',
        field: 'transactionDate',
        width: 140,
        cellRenderer: (params) => {
          if (!params.value) return '—';
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280' }}>
              <Calendar size={14} />
              <span>{dayjs(params.value).format('DD MMM YYYY')}</span>
            </div>
          );
        }
      },
      {
        headerName: 'PARTY NAME',
        field: 'partyName',
        flex: 1,
        minWidth: 200,
        cellRenderer: (params) => (
          <div style={{ lineHeight: '1.2' }}>
            <div style={{ fontWeight: 500, color: '#111827' }}>{params.value}</div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>{params.data.partyTypeName}</div>
          </div>
        )
      },
      {
        headerName: 'TYPE',
        field: 'paymentTypeName',
        width: 100,
        cellRenderer: (params) => {
          const isIn = params.data.paymentType === 1;
          return (
            <Tag
              icon={isIn ? <ArrowDownCircle size={14} /> : <ArrowUpCircle size={14} />}
              color={isIn ? '#10b981' : '#ef4444'}
              style={{
                fontWeight: 500,
                borderRadius: '6px',
                border: 'none',
                padding: '4px 10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {params.value}
            </Tag>
          );
        }
      },
      {
        headerName: 'AMOUNT',
        field: 'amount',
        width: 150,
        type: 'rightAligned',
        cellRenderer: (params) => (
          <span style={{ fontWeight: 600, color: params.data.paymentType === 1 ? '#10b981' : '#ef4444' }}>
            Rs. {params.value?.toLocaleString()}
          </span>
        )
      },
      {
        headerName: 'REMARKS',
        field: 'remarks',
        flex: 1,
        minWidth: 200,
        cellRenderer: (params) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280' }}>
            {params.value ? (
              <>
                <FileText size={14} />
                <span>{params.value}</span>
              </>
            ) : (
              <span style={{ color: '#d1d5db' }}>—</span>
            )}
          </div>
        )
      },
      {
        headerName: 'ACTIONS',
        field: 'actions',
        width: 100,
        pinned: 'right',
        cellRenderer: (params) => (
          <Space size="small">
            <Button
              type="text"
              icon={<Pencil size={14} />}
              onClick={() => handleEdit(params.data)}
              size="small"
              style={{ color: '#6b7280', borderRadius: '4px' }}
            />
            <Popconfirm
              title={<span style={{ fontWeight: 600 }}>Delete Transaction</span>}
              description="Are you sure you want to delete this transaction?"
              onConfirm={() => handleDelete(params.data.id)}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true, style: { borderRadius: '6px' } }}
              cancelButtonProps={{ style: { borderRadius: '6px' } }}
            >
              <Button type="text" danger icon={<Trash2 size={14} />} size="small" style={{ borderRadius: '4px' }} />
            </Popconfirm>
          </Space>
        )
      }
    ],
    [customers, suppliers, otherExpenses]
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true
    }),
    []
  );

  const handleFormSubmit = () => {
    form.submit();
  };

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
          Select: { controlHeight: 38 }
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
              <Wallet size={20} strokeWidth={1.5} color="#111827" />
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 600, color: '#111827' }}>Petty Cash</div>
              <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 400 }}>Manage cash transactions</div>
            </div>
          </div>
        }
        secondary={
          <Space>
            <Input
              placeholder="Search transactions..."
              prefix={<Search strokeWidth={1.5} size={16} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{
                width: 280,
                height: '36px',
                borderRadius: '6px',
                border: '1px solid #e5e7eb'
              }}
            />
            <Button
              type="primary"
              icon={<Plus size={16} strokeWidth={1.5} />}
              onClick={handleAdd}
              style={{
                background: '#111827',
                borderRadius: '6px',
                height: '36px',
                fontWeight: 500,
                border: 'none'
              }}
            >
              Add Transaction
            </Button>
          </Space>
        }
      >
        <div
          className="ag-theme-quartz"
          style={{
            height: 600,
            width: '100%',
            height: 'calc(100vh - 230px)',
            '--ag-header-background-color': '#f9fafb',
            '--ag-header-foreground-color': '#111827',
            '--ag-border-color': '#e5e7eb',
            '--ag-row-hover-color': '#f9fafb',
            '--ag-font-family': '"Sofia Sans", sans-serif',
            '--ag-font-size': '14px'
          }}
        >
          <AgGridReact
            rowData={filteredPettyCashes}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            animateRows={true}
            rowHeight={60}
            headerHeight={44}
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 20, 50, 100]}
            suppressDragLeaveHidesColumns={true}
            loading={loading}
            domLayout="normal"
          />
        </div>

        <Modal
          style={{ top: 20 }}
          zIndex={9999}
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '6px',
                  background: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {editingPettyCash ? (
                  <Pencil size={16} strokeWidth={1.5} color="#111827" />
                ) : (
                  <Plus strokeWidth={1.5} size={16} color="#111827" />
                )}
              </div>
              <span style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>
                {editingPettyCash ? 'Edit Transaction' : 'Add New Transaction'}
              </span>
            </div>
          }
          open={isModalOpen}
          onCancel={() => {
            setIsModalOpen(false);
            form.resetFields();
          }}
          width={520}
          destroyOnClose
          footer={[
            <Button
              key="cancel"
              onClick={() => {
                setIsModalOpen(false);
                form.resetFields();
              }}
              style={{ borderRadius: '6px', height: '36px', fontWeight: 500, border: '1px solid #e5e7eb' }}
            >
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={handleFormSubmit}
              loading={actionLoading}
              style={{ background: '#111827', borderRadius: '6px', height: '36px', fontWeight: 500, border: 'none' }}
            >
              {editingPettyCash ? 'Update Transaction' : 'Add Transaction'}
            </Button>
          ]}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
            <Divider style={{ margin: '0 0 24px 0', borderColor: '#e5e7eb' }} />

            {/* Payment Direction */}
            <Form.Item
              label={<span style={{ fontWeight: 500, color: '#374151', fontSize: '13px' }}>Transaction Type</span>}
              style={{ marginBottom: '20px' }}
            >
              <Radio.Group
                value={paymentDirection}
                onChange={(e) => {
                  setPaymentDirection(e.target.value);
                  form.setFieldsValue({ partyId: undefined });
                }}
                buttonStyle="solid"
                style={{ width: '100%' }}
              >
                <Radio.Button
                  value="in"
                  style={{
                    width: '50%',
                    textAlign: 'center',
                    height: '40px',
                    lineHeight: '40px',
                    fontWeight: 500
                  }}
                >
                  <ArrowDownCircle size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                  Cash IN
                </Radio.Button>
                <Radio.Button
                  value="out"
                  style={{
                    width: '50%',
                    textAlign: 'center',
                    height: '40px',
                    lineHeight: '40px',
                    fontWeight: 500
                  }}
                >
                  <ArrowUpCircle size={16} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                  Cash OUT
                </Radio.Button>
              </Radio.Group>
            </Form.Item>

            {/* Out Type Selection */}
            {paymentDirection === 'out' && (
              <Form.Item
                label={<span style={{ fontWeight: 500, color: '#374151', fontSize: '13px' }}>Payment To</span>}
                style={{ marginBottom: '20px' }}
              >
                <Radio.Group
                  value={outType}
                  onChange={(e) => {
                    setOutType(e.target.value);
                    form.setFieldsValue({ partyId: undefined });
                  }}
                  buttonStyle="solid"
                  style={{ width: '100%' }}
                >
                  <Radio.Button value="supplier" style={{ width: '50%', textAlign: 'center', height: '40px', lineHeight: '40px' }}>
                    Supplier
                  </Radio.Button>
                  <Radio.Button value="expense" style={{ width: '50%', textAlign: 'center', height: '40px', lineHeight: '40px' }}>
                    Expense
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>
            )}

            <Form.Item
              label={
                <span style={{ fontWeight: 500, color: '#374151', fontSize: '13px' }}>
                  Transaction Date <span style={{ color: '#ef4444' }}>*</span>
                </span>
              }
              name="transactionDate"
              rules={[{ required: true, message: 'Please select transaction date' }]}
              style={{ marginBottom: '20px' }}
            >
              <DatePicker style={{ width: '100%', height: '38px', borderRadius: '6px' }} format="YYYY-MM-DD" />
            </Form.Item>

            {/* Party Selection */}
            <Form.Item
              label={
                <span style={{ fontWeight: 500, color: '#374151', fontSize: '13px' }}>
                  {paymentDirection === 'in' ? 'Customer' : outType === 'supplier' ? 'Supplier' : 'Expense Account'}{' '}
                  <span style={{ color: '#ef4444' }}>*</span>
                </span>
              }
              name="partyId"
              rules={[{ required: true, message: 'Please select a party' }]}
              style={{ marginBottom: '20px' }}
            >
              <Select
                placeholder={`Select ${paymentDirection === 'in' ? 'customer' : outType === 'supplier' ? 'supplier' : 'expense'}`}
                options={partyOptions}
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
                showSearch
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                style={{ width: '100%' }}
              />
            </Form.Item>

            {/* Amount */}
            <Form.Item
              label={
                <span style={{ fontWeight: 500, color: '#374151', fontSize: '13px' }}>
                  Amount <span style={{ color: '#ef4444' }}>*</span>
                </span>
              }
              name="amount"
              rules={[
                { required: true, message: 'Please enter amount' },
                { type: 'number', min: 0.01, message: 'Amount must be greater than 0' }
              ]}
              style={{ marginBottom: '20px' }}
            >
              <InputNumber
                style={{ width: '100%', height: '38px' }}
                placeholder="Enter amount"
                min={0}
                precision={2}
                formatter={(value) => `Rs. ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/Rs\.\s?|(,*)/g, '')}
              />
            </Form.Item>

            {/* Remarks */}
            <Form.Item
              label={<span style={{ fontWeight: 500, color: '#374151', fontSize: '13px' }}>Remarks</span>}
              name="remarks"
              style={{ marginBottom: '0' }}
            >
              <Input.TextArea
                rows={3}
                placeholder="Add transaction notes or remarks"
                style={{ borderRadius: '6px', border: '1px solid #e5e7eb' }}
              />
            </Form.Item>
          </Form>
        </Modal>

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

export default PettyCash;
