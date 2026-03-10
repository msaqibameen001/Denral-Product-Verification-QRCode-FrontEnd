import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table,
  Button,
  Drawer,
  Form,
  Input,
  InputNumber,
  Switch,
  Space,
  Popconfirm,
  Tag,
  Skeleton,
  Empty,
  ConfigProvider,
  Divider,
  Row,
  Col
} from 'antd';
import { Users, Plus, Pencil, Trash2, Search, Phone, MapPin, DollarSign, TrendingUp } from 'lucide-react';
import MainCard from 'components/MainCard';
import {
  Fetch_OtherExpenses,
  Add_OtherExpense,
  Update_OtherExpense,
  Delete_OtherExpense
} from '../../../../Redux/Action/Party/OtherExpenseActions/OtherExpenseActions';

const OtherExpense = () => {
  const dispatch = useDispatch();
  const { otherExpenses, loading, actionLoading } = useSelector((state) => state.PRT.otherExpense);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingOtherExpense, setEditingOtherExpense] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(Fetch_OtherExpenses(3)); // 3 = Other Expense ( Party Type ID )
  }, [dispatch]);

  const handleAdd = () => {
    setEditingOtherExpense(null);
    form.resetFields();
    setIsDrawerOpen(true);
  };

  const handleEdit = (record) => {
    setEditingOtherExpense(record);
    form.setFieldsValue({
      partyName: record.partyName,
      phone: record.phone,
      address: record.address,
      defaultRate: record.defaultRate,
      // balance: record.balance,
      remarks: record.remarks,
      isAffectProfitLoss: record.isAffectProfitLoss
    });
    setIsDrawerOpen(true);
  };

  const handleDelete = async (id) => {
    await dispatch(Delete_OtherExpense(id));
    dispatch(Fetch_OtherExpenses(3)); // 3 = Other Expense ( Party Type ID )
  };

  const handleSubmit = async (values) => {
    let success = false;
    if (editingOtherExpense) {
      success = await dispatch(Update_OtherExpense(editingOtherExpense.id, values));
    } else {
      success = await dispatch(Add_OtherExpense(values));
    }

    if (success) {
      setIsDrawerOpen(false);
      form.resetFields();
      dispatch(Fetch_OtherExpenses(3)); // 3 = Other Expense ( Party Type ID )
    }
  };

  const columns = [
    {
      title: <span style={{ fontWeight: 600, color: '#1f2937' }}>NAME</span>,
      dataIndex: 'partyName',
      key: 'partyName',
      filteredValue: [searchText],
      onFilter: (value, record) => {
        return (
          record.partyName?.toLowerCase().includes(value.toLowerCase()) ||
          record.phone?.toLowerCase().includes(value.toLowerCase()) ||
          record.address?.toLowerCase().includes(value.toLowerCase())
        );
      },
      sorter: (a, b) => a.partyName.localeCompare(b.partyName),
      width: 220,
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              background: '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#111827',
              fontWeight: 600,
              fontSize: '14px',
              flexShrink: 0
            }}
          >
            {text?.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontWeight: 500, color: '#111827' }}>{text}</span>
        </div>
      )
    },
    {
      title: <span style={{ fontWeight: 600, color: '#1f2937' }}>CONTACT</span>,
      dataIndex: 'phone',
      key: 'phone',
      width: 180,
      render: (phone) =>
        phone ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280' }}>
            <Phone size={14} />
            <span>{phone}</span>
          </div>
        ) : (
          <span style={{ color: '#d1d5db' }}>—</span>
        )
    },
    {
      title: <span style={{ fontWeight: 600, color: '#1f2937' }}>ADDRESS</span>,
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
      width: 250,
      render: (address) =>
        address ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6b7280' }}>
            <MapPin size={14} />
            <span>{address}</span>
          </div>
        ) : (
          <span style={{ color: '#d1d5db' }}>—</span>
        )
    },
    {
      title: <span style={{ fontWeight: 600, color: '#1f2937' }}>BALANCE</span>,
      dataIndex: 'balance',
      key: 'balance',
      render: (balance) => (
        <Tag
          color={balance > 0 ? '#10b981' : balance < 0 ? '#ef4444' : '#6b7280'}
          style={{
            fontWeight: 500,
            borderRadius: '6px',
            border: 'none',
            padding: '4px 12px'
          }}
        >
          Rs. {balance?.toLocaleString()}
        </Tag>
      ),
      align: 'right',
      sorter: (a, b) => a.balance - b.balance,
      width: 150
    },
    // {
    //   title: <span style={{ fontWeight: 600, color: '#1f2937' }}>IS EFFECT P&L</span>,
    //   dataIndex: 'isAffectProfitLoss',
    //   key: 'isAffectProfitLoss',
    //   render: (affect) => (
    //     <Tag
    //       color={affect ? '#3b82f6' : '#6b7280'}
    //       style={{
    //         fontWeight: 500,
    //         borderRadius: '6px',
    //         border: 'none',
    //         padding: '4px 12px'
    //       }}
    //     >
    //       {affect ? 'Yes' : 'No'}
    //     </Tag>
    //   ),
    //   align: 'center',
    //   width: 140
    // },
    {
      title: <span style={{ fontWeight: 600, color: '#1f2937' }}>ACTIONS</span>,
      key: 'actions',
      fixed: 'right',
      align: 'right',
      width: 100,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<Pencil size={16} />}
            onClick={() => handleEdit(record)}
            size="small"
            style={{
              color: '#6b7280',
              borderRadius: '6px'
            }}
          />
          <Popconfirm
            title={<span style={{ fontWeight: 600 }}>Delete Other Expense</span>}
            description="Are you sure you want to delete this other expense?"
            onConfirm={() => handleDelete(record.id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{
              danger: true,
              style: { borderRadius: '6px' }
            }}
            cancelButtonProps={{
              style: { borderRadius: '6px' }
            }}
          >
            <Button type="text" danger icon={<Trash2 size={16} />} size="small" style={{ borderRadius: '6px' }} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const handleFormSubmit = () => {
    form.submit();
  };

  // Custom Skeleton for loading state
  const renderLoadingSkeleton = () => {
    return (
      <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
        {/* Table Header Skeleton */}
        <div
          style={{
            display: 'flex',
            background: '#f9fafb',
            padding: '16px 16px',
            borderBottom: '1px solid #e5e7eb'
          }}
        >
          {[220, 180, 250, 150, 140, 100].map((width, index) => (
            <div key={index} style={{ width: width, padding: '0 8px' }}>
              <Skeleton.Input
                active
                size="small"
                style={{
                  height: '20px',
                  width: '80%',
                  background: '#e5e7eb'
                }}
              />
            </div>
          ))}
        </div>

        {/* Table Rows Skeleton */}
        {[...Array(5)].map((_, rowIndex) => (
          <div
            key={rowIndex}
            style={{
              display: 'flex',
              padding: '16px 16px',
              borderBottom: rowIndex < 7 ? '1px solid #f3f4f6' : 'none',
              alignItems: 'center'
            }}
          >
            {/* Name Column */}
            <div style={{ width: 220, padding: '0 8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Skeleton.Avatar active size={36} />
                <Skeleton.Input
                  active
                  size="small"
                  style={{
                    height: '20px',
                    width: '60%',
                    background: '#f3f4f6'
                  }}
                />
              </div>
            </div>

            {/* Phone Column */}
            <div style={{ width: 180, padding: '0 8px' }}>
              <Skeleton.Input
                active
                size="small"
                style={{
                  height: '20px',
                  width: '70%',
                  background: '#f3f4f6'
                }}
              />
            </div>

            {/* Address Column */}
            <div style={{ width: 250, padding: '0 8px' }}>
              <Skeleton.Input
                active
                size="small"
                style={{
                  height: '20px',
                  width: '85%',
                  background: '#f3f4f6'
                }}
              />
            </div>

            {/* Balance Column */}
            <div style={{ width: 150, padding: '0 8px', textAlign: 'right' }}>
              <Skeleton.Input
                active
                size="small"
                style={{
                  height: '32px',
                  width: '90px',
                  background: '#f3f4f6',
                  borderRadius: '6px',
                  marginLeft: 'auto'
                }}
              />
            </div>

            {/* P&L Column */}
            <div style={{ width: 140, padding: '0 8px', textAlign: 'center' }}>
              <Skeleton.Input
                active
                size="small"
                style={{
                  height: '32px',
                  width: '60px',
                  background: '#f3f4f6',
                  borderRadius: '6px',
                  margin: '0 auto'
                }}
              />
            </div>

            {/* Actions Column */}
            <div style={{ width: 100, padding: '0 8px', textAlign: 'right' }}>
              <Space size="small">
                <Skeleton.Button
                  active
                  size="small"
                  style={{
                    width: '32px',
                    height: '32px',
                    background: '#f3f4f6',
                    borderRadius: '6px'
                  }}
                />
                <Skeleton.Button
                  active
                  size="small"
                  style={{
                    width: '32px',
                    height: '32px',
                    background: '#f3f4f6',
                    borderRadius: '6px'
                  }}
                />
              </Space>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: '"Sofia Sans", sans-serif',
          colorPrimary: '#111827',
          colorBgContainer: '#ffffff',
          borderRadius: 8,
          colorBorder: '#e5e7eb',
          colorText: '#111827',
          colorTextSecondary: '#6b7280',
          fontSize: 14
        },
        components: {
          Table: {
            headerBg: '#f9fafb',
            headerColor: '#111827',
            rowHoverBg: '#f9fafb',
            borderColor: '#e5e7eb'
          },
          Button: {
            controlHeight: 36,
            borderRadius: 6
          },
          Switch: {
            handleSize: 18,
            trackHeight: 22,
            trackMinWidth: 44
          }
        }
      }}
    >
      <MainCard
        sx={{
          '& .MuiCardHeader-title': {
            fontFamily: '"Sofia Sans", sans-serif'
          },
          '& .MuiCardHeader-subheader': {
            fontFamily: '"Sofia Sans", sans-serif'
          },
          '& .MuiCardContent-root': {
            fontFamily: '"Sofia Sans", sans-serif'
          }
        }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                background: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Users size={20} strokeWidth={1.5} color="#111827" />
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 600, color: '#111827' }}>Other Expenses</div>
              <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 400 }}>Manage your other expenses</div>
            </div>
          </div>
        }
        secondary={
          <Space size="middle">
            <Input
              placeholder="Search other expenses..."
              prefix={<Search size={16} color="#9ca3af" />}
              onChange={(e) => setSearchText(e.target.value)}
              style={{
                width: 280,
                borderRadius: '8px',
                height: '38px',
                border: '1px solid #e5e7eb',
                boxShadow: 'none'
              }}
              allowClear
            />
            <Button
              type="primary"
              icon={<Plus size={16} />}
              onClick={handleAdd}
              style={{
                background: '#111827',
                borderRadius: '8px',
                height: '38px',
                fontWeight: 500,
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                border: 'none'
              }}
            >
              Add Other Expense
            </Button>
          </Space>
        }
      >
        {loading ? (
          renderLoadingSkeleton()
        ) : (
          <Table
            columns={columns}
            dataSource={otherExpenses}
            tableLayout="fixed"
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => (
                <span style={{ color: '#6b7280', fontWeight: 500 }}>
                  Total {total} other expense{total !== 1 ? 's' : ''}
                </span>
              ),
              pageSizeOptions: ['10', '20', '50', '100'],
              style: { marginTop: '16px' }
            }}
            scroll={{ x: 1100 }}
            locale={{
              emptyText: (
                <Empty
                  description={<span style={{ color: '#9ca3af' }}>No other expenses found</span>}
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )
            }}
            size="middle"
            style={{
              background: 'white',
              borderRadius: '8px'
            }}
          />
        )}

        <Drawer
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '8px',
                  background: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {editingOtherExpense ? (
                  <Pencil size={18} strokeWidth={1.5} color="#111827" />
                ) : (
                  <Plus strokeWidth={1.5} size={18} color="#111827" />
                )}
              </div>
              <span style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>
                {editingOtherExpense ? 'Edit Other Expense' : 'Add New Other Expense'}
              </span>
            </div>
          }
          open={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false);
            form.resetFields();
          }}
          width={520}
          destroyOnClose
          footer={
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                padding: '16px 0'
              }}
            >
              <Button
                onClick={() => {
                  setIsDrawerOpen(false);
                  form.resetFields();
                }}
                style={{
                  borderRadius: '8px',
                  height: '38px',
                  fontWeight: 500,
                  border: '1px solid #e5e7eb'
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                onClick={handleFormSubmit}
                loading={actionLoading}
                style={{
                  background: '#111827',
                  borderRadius: '8px',
                  height: '38px',
                  fontWeight: 500,
                  border: 'none'
                }}
              >
                {editingOtherExpense ? 'Update Other Expense' : 'Add Other Expense'}
              </Button>
            </div>
          }
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
            <div style={{ marginBottom: '24px' }}>
              <Divider style={{ margin: '0 0 24px 0', borderColor: '#e5e7eb' }} />

              <Form.Item
                label={
                  <span style={{ fontWeight: 500, color: '#374151', fontSize: '13px' }}>
                    Other Expense Name <span style={{ color: '#ef4444' }}>*</span>
                  </span>
                }
                name="partyName"
                rules={[
                  { required: true, message: 'Please enter other expense name' },
                  { max: 200, message: 'Name cannot exceed 200 characters' }
                ]}
                style={{ marginBottom: '20px' }}
              >
                <Input
                  placeholder="Enter other expense name"
                  prefix={<Users size={16} color="#9ca3af" />}
                  style={{
                    borderRadius: '8px',
                    height: '40px',
                    border: '1px solid #e5e7eb'
                  }}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ fontWeight: 500, color: '#374151', fontSize: '13px' }}>Phone Number</span>}
                name="phone"
                rules={[{ max: 50, message: 'Phone cannot exceed 50 characters' }]}
                style={{ marginBottom: '20px' }}
              >
                <Input
                  placeholder="Enter phone number"
                  prefix={<Phone size={16} color="#9ca3af" />}
                  style={{
                    borderRadius: '8px',
                    height: '40px',
                    border: '1px solid #e5e7eb'
                  }}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ fontWeight: 500, color: '#374151', fontSize: '13px' }}>Address</span>}
                name="address"
                style={{ marginBottom: '20px' }}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Enter other expense address"
                  style={{
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ fontWeight: 500, color: '#374151', fontSize: '13px' }}>Remarks</span>}
                name="remarks"
                style={{ marginBottom: '20px' }}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Add any additional notes or remarks"
                  style={{
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ fontWeight: 500, color: '#374151', fontSize: '13px' }}>Affect Profit & Loss</span>}
                name="isAffectProfitLoss"
                valuePropName="checked"
                hidden
                initialValue={true}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Switch />
                  <span style={{ color: '#6b7280', fontSize: '13px' }}>
                    {form.getFieldValue('isAffectProfitLoss') ? 'Will affect profit & loss' : 'Will not affect profit & loss'}
                  </span>
                </div>
              </Form.Item>
            </div>
          </Form>
        </Drawer>
        <style jsx>{`
          .ant-drawer {
            z-index: 9999 !important;
          }
        `}</style>
      </MainCard>
    </ConfigProvider>
  );
};

export default OtherExpense;
