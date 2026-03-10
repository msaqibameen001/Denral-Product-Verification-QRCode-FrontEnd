import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Space,
  Skeleton,
  Empty,
  Popconfirm,
  Typography,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  ConfigProvider
} from 'antd';
import { Plus, Pencil, Trash2, ShoppingCart, TrendingUp, Package } from 'lucide-react';
import dayjs from 'dayjs';
import { Fetch_Purchases, Add_Purchase, Update_Purchase, Delete_Purchase } from '../../../Redux/Action/PurchaseAction/PurchaseAction';
import { Fetch_Suppliers } from '../../../Redux/Action/Party/SupplierActions/SupplierActions';

const { Title, Text } = Typography;

const Purchase = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [searchText, setSearchText] = useState('');

  const { purchases, loading, actionLoading } = useSelector((state) => state.LPG.purchase);
  const { suppliers, loading: suppliersLoading } = useSelector((state) => state.PRT.supplier);

  useEffect(() => {
    dispatch(Fetch_Purchases());
    dispatch(Fetch_Suppliers(2)); // 2 = Supplier Type ID
  }, [dispatch]);

  const showModal = (purchase = null) => {
    setEditingPurchase(purchase);
    if (purchase) {
      form.setFieldsValue({
        supplierId: purchase.supplierId,
        trDate: dayjs(purchase.trDate),
        price: purchase.price,
        qty: purchase.qty,
        gatePassNo: purchase.gatePassNo
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ trDate: dayjs() });
    }
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingPurchase(null);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    const purchaseData = {
      supplierId: values.supplierId,
      trDate: values.trDate.format('YYYY-MM-DD'),
      price: values.price,
      qty: values.qty,
      gatePassNo: values.gatePassNo || ''
    };

    let success;
    if (editingPurchase) {
      success = await dispatch(Update_Purchase(editingPurchase.purchaseId, purchaseData));
    } else {
      success = await dispatch(Add_Purchase(purchaseData));
    }

    if (success) {
      handleCancel();
      dispatch(Fetch_Purchases());
    }
  };

  const handleDelete = async (id) => {
    const success = await dispatch(Delete_Purchase(id));
    if (success) {
      dispatch(Fetch_Purchases());
    }
  };

  // Calculate statistics
  const totalPurchases = purchases?.length || 0;
  const totalQty = purchases?.reduce((sum, p) => sum + p.qty, 0) || 0;
  const totalAmount = purchases?.reduce((sum, p) => sum + p.totalAmount, 0) || 0;

  const columns = [
    {
      title: 'Date',
      dataIndex: 'trDate',
      key: 'trDate',
      render: (date) => dayjs(date).format('DD MMM YYYY'),
      sorter: (a, b) => dayjs(a.trDate).unix() - dayjs(b.trDate).unix()
    },
    {
      title: 'Supplier',
      dataIndex: 'supplierName',
      key: 'supplierName',
      ellipsis: true,
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record) => record.supplierName?.toLowerCase().includes(value.toLowerCase())
    },
    {
      title: 'Gate Pass No',
      dataIndex: 'gatePassNo',
      key: 'gatePassNo',
      ellipsis: true
    },
    {
      title: 'Quantity (KG)',
      dataIndex: 'qty',
      key: 'qty',
      align: 'right',
      render: (qty) => (
        <Text strong style={{ color: '#1890ff' }}>
          {qty.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      ),
      sorter: (a, b) => a.qty - b.qty
    },
    {
      title: 'Price/KG',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      render: (price) => <Text>Rs. {price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>,
      sorter: (a, b) => a.price - b.price
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      align: 'right',
      render: (amount) => (
        <Tag color="success" style={{ fontSize: '13px', padding: '4px 12px', fontWeight: 600 }}>
          Rs. {amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Tag>
      ),
      sorter: (a, b) => a.totalAmount - b.totalAmount
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button type="text" size="small" icon={<Pencil size={16} />} onClick={() => showModal(record)} style={{ color: '#1890ff' }} />
          <Popconfirm
            title="Delete Purchase"
            description="Are you sure you want to delete this purchase?"
            onConfirm={() => handleDelete(record.purchaseId)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" size="small" danger icon={<Trash2 size={16} />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Skeleton columns for loading state
  const skeletonColumns = columns.map((col) => ({
    ...col,
    render: () => <Skeleton.Input active size="small" style={{ width: '100%', minWidth: 60 }} />
  }));

  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: '"Sofia Sans", sans-serif'
        }
      }}
    >
      <div style={{ padding: '12px', background: '#f5f5f5', minHeight: '100vh' }}>
        {/* Header Section */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <Title level={3} style={{ margin: 0, marginBottom: 2, fontWeight: 600, color: '#262626' }}>
                Purchase Management
              </Title>
              <Text type="secondary">Track and manage all purchase transactions</Text>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<Plus size={18} />}
              onClick={() => showModal()}
              style={{
                background: '#000',
                borderColor: '#000',
                height: 42,
                padding: '0 24px',
                fontWeight: 500
              }}
            >
              New Purchase
            </Button>
          </div>

          {/* Statistics Cards */}
          {loading ? (
            <Row gutter={16}>
              {[1, 2, 3].map((i) => (
                <Col span={8} key={i}>
                  <Card>
                    <Skeleton active paragraph={{ rows: 1 }} />
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Row gutter={16}>
              <Col span={8}>
                <Card bordered={false} style={{ background: '#fff' }}>
                  <Statistic
                    title={<Text type="secondary">Total Purchases</Text>}
                    value={totalPurchases}
                    prefix={<ShoppingCart size={20} style={{ color: '#1890ff' }} />}
                    valueStyle={{ color: '#262626', fontWeight: 600 }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card bordered={false} style={{ background: '#fff' }}>
                  <Statistic
                    title={<Text type="secondary">Total Quantity</Text>}
                    value={totalQty}
                    precision={2}
                    suffix="KG"
                    prefix={<Package size={20} style={{ color: '#52c41a' }} />}
                    valueStyle={{ color: '#262626', fontWeight: 600 }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card bordered={false} style={{ background: '#fff' }}>
                  <Statistic
                    title={<Text type="secondary">Total Amount</Text>}
                    value={totalAmount}
                    precision={2}
                    prefix={<TrendingUp size={20} style={{ color: '#fa8c16' }} />}
                    valueStyle={{ color: '#262626', fontWeight: 600 }}
                    suffix={
                      <Text type="secondary" style={{ fontSize: 14 }}>
                        PKR
                      </Text>
                    }
                  />
                </Card>
              </Col>
            </Row>
          )}
        </div>

        {/* Table Section */}
        <Card bordered={false} style={{ background: '#fff', borderRadius: 8 }} bodyStyle={{ padding: 0 }}>
          <Table
            columns={loading ? skeletonColumns : columns}
            dataSource={
              loading
                ? Array(5)
                    .fill({})
                    .map((_, i) => ({ key: i }))
                : purchases
            }
            rowKey="purchaseId"
            loading={false}
            pagination={{
              pageSize: 5,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} purchases`,
              style: { padding: '16px' }
            }}
            locale={{
              emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No purchases found" style={{ padding: '40px 0' }} />
            }}
            scroll={{ x: 1000 }}
            style={{
              '--table-header-bg': '#fafafa',
              '--table-row-hover-bg': '#f5f5f5'
            }}
          />
        </Card>

        {/* Add/Edit Modal */}
        <Modal
          title={
            <div style={{ fontSize: 18, fontWeight: 600, color: '#262626' }}>{editingPurchase ? 'Edit Purchase' : 'New Purchase'}</div>
          }
          open={isModalOpen}
          onCancel={handleCancel}
          footer={null}
          width={600}
          centered
          zIndex={9999}
          styles={{
            body: { paddingTop: 24 }
          }}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit} disabled={actionLoading}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="supplierId"
                  label={<Text strong>Supplier</Text>}
                  rules={[{ required: true, message: 'Please select supplier' }]}
                >
                  <Select
                    placeholder="Select supplier"
                    size="large"
                    showSearch
                    optionFilterProp="children"
                    loading={suppliersLoading}
                    style={{ width: '100%' }}
                  >
                    {suppliers?.map((supplier) => (
                      <Select.Option key={supplier.id} value={supplier.id}>
                        {supplier.partyName}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="gatePassNo" label={<Text strong>Gate Pass No</Text>}>
                  <Input type="text" size="large" placeholder="Enter GP No" style={{ width: '100%' }} allowClear />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="trDate"
              label={<Text strong>Transaction Date</Text>}
              rules={[{ required: true, message: 'Please select date' }]}
            >
              <DatePicker size="large" style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="qty"
                  label={<Text strong>Quantity (KG)</Text>}
                  rules={[
                    { required: true, message: 'Please enter quantity' },
                    { type: 'number', min: 0.01, message: 'Must be greater than 0' }
                  ]}
                >
                  <InputNumber size="large" placeholder="0.00" style={{ width: '100%' }} precision={2} min={0} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="price"
                  label={<Text strong>Price per KG</Text>}
                  rules={[
                    { required: true, message: 'Please enter price' },
                    { type: 'number', min: 0.01, message: 'Must be greater than 0' }
                  ]}
                >
                  <InputNumber size="large" placeholder="0.00" style={{ width: '100%' }} prefix="Rs." precision={2} min={0} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button size="large" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={actionLoading}
                  style={{
                    background: '#000',
                    borderColor: '#000',
                    minWidth: 100
                  }}
                >
                  {editingPurchase ? 'Update' : 'Create'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default Purchase;
