import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Button, Input, Form, Popconfirm, Space, Typography, Row, Col, Checkbox, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { AgGridReact } from 'ag-grid-react';
import { Search } from 'lucide-react';
import { CircleCheckBig, CircleX } from 'lucide-react';
import { Fetch_Products, Add_Product, Update_Product, Delete_Product } from '../../../Redux/Action/ProductsAction/ProductsAction';
import { Fetch_Categories } from '../../../Redux/Action/ProductsAction/CategoryAction';

const { Title } = Typography;
const { Option } = Select;

const Products = () => {
  const dispatch = useDispatch();
  const { products, loading, actionLoading } = useSelector((state) => state.product);
  const { categories } = useSelector((state) => state.category); // Categories from redux

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  const [showInactiveFields, setShowInactiveFields] = useState(false);

  useEffect(() => {
    dispatch(Fetch_Products());
    dispatch(Fetch_Categories());
  }, [dispatch]);

  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowInactiveFields(product.isInActive || false);
    form.setFieldsValue({
      ...product,
      categoryId: product.categoryId,
      purchaseDate: product.purchaseDate ? product.purchaseDate.split('T')[0] : null,
      inActiveDate: product.inActiveDate ? product.inActiveDate.split('T')[0] : null
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    await dispatch(Delete_Product(id));
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      let success;

      if (editingProduct) {
        success = await dispatch(Update_Product(editingProduct.id, values));
      } else {
        success = await dispatch(Add_Product(values));
      }

      if (success) {
        setIsModalVisible(false);
        form.resetFields();
        setEditingProduct(null);
        setShowInactiveFields(false);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingProduct(null);
    setShowInactiveFields(false);
  };

  // Actions Cell Renderer
  const ActionsCellRenderer = (props) => {
    return (
      <Space size="small">
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => handleEdit(props.data)}
          size="small"
          style={{ color: '#262626' }}
          title="Edit Product"
        />

        <Popconfirm
          title="Delete Product"
          description="Are you sure you want to delete this product?"
          onConfirm={() => handleDelete(props.data.id)}
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
        >
          <Button type="text" icon={<DeleteOutlined />} size="small" danger title="Delete Product" />
        </Popconfirm>
      </Space>
    );
  };

  const columnDefs = useMemo(
    () => [
      {
        headerName: 'ID',
        field: 'id',
        filter: 'agNumberColumnFilter',
        sortable: true,
        width: 80,
        cellStyle: { fontWeight: '500' }
      },
      {
        headerName: 'CATEGORY',
        field: 'categoryName',
        filter: 'agTextColumnFilter',
        sortable: true,
        flex: 1,
        minWidth: 120,
        cellStyle: { fontWeight: '500' }
      },
      {
        headerName: 'NAME',
        field: 'name',
        filter: 'agTextColumnFilter',
        sortable: true,
        flex: 1,
        minWidth: 150,
      },
      {
        headerName: 'DESCRIPTION',
        field: 'description',
        filter: 'agTextColumnFilter',
        sortable: true,
        flex: 2,
        minWidth: 200,
        cellStyle: {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          display: 'block'
        },
        autoHeight: true,
        cellRenderer: (params) => {
          return params.value || '-';
        }
      },
      {
        headerName: 'ACTIONS',
        field: 'actions',
        cellRenderer: ActionsCellRenderer,
        sortable: false,
        filter: false,
        width: 120,
        pinned: 'right',
        cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' }
      }
    ],
    []
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      suppressMovable: true
    }),
    []
  );

  // Filter products based on search
  const filteredItems = useMemo(() => {
    if (!searchText) return products;
    const lowerSearch = searchText.toLowerCase();
    return products.filter(
      (product) =>
        product.name?.toLowerCase().includes(lowerSearch) ||
        product.description?.toLowerCase().includes(lowerSearch) ||
        product.categoryName?.toLowerCase().includes(lowerSearch)
    );
  }, [products, searchText]);

  return (
    <div
      style={{
        fontFamily: "'Sofia Sans', sans-serif",
        backgroundColor: '#ffffff',
        padding: '12px'
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          backgroundColor: '#ffffff'
        }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '20px',
            borderBottom: '1px solid #e5e7eb'
          }}
        >
          <div>
            <Title
              level={3}
              style={{
                fontFamily: "'Sofia Sans', sans-serif",
                margin: 0,
                fontSize: '24px',
                fontWeight: '700',
                color: '#111827',
                letterSpacing: '-0.02em'
              }}
            >
              Products
            </Title>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280', fontWeight: '400' }}>
              Manage and track products efficiently
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            size="large"
            style={{
              backgroundColor: '#262626',
              borderColor: '#262626',
              fontFamily: "'Sofia Sans', sans-serif",
              fontWeight: 500,
              height: '40px',
              borderRadius: '6px'
            }}
          >
            Add Product
          </Button>
        </div>

        {/* Search Bar */}
        <div
          style={{
            background: '#ffffff',
            padding: '16px',
            marginBottom: '16px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}
        >
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search products by name, category, description..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 38px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: '"Sofia Sans", sans-serif',
                outline: 'none',
                transition: 'all 0.15s',
                background: '#ffffff',
                color: '#111827'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#111827';
                e.target.style.boxShadow = '0 0 0 3px rgba(17, 24, 39, 0.05)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* AG Grid */}
        <div
          className="ag-theme-quartz erp-grid"
          style={{
            height: 'calc(100vh - 290px)',
            width: '100%',
            fontFamily: "'Sofia Sans', sans-serif",
          }}
        >
          <AgGridReact
            rowData={filteredItems}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination={true}
            paginationPageSize={20}
            paginationPageSizeSelector={[10, 20, 50, 100]}
            domLayout="normal"
            loading={loading}
            animateRows={true}
            rowSelection="single"
            suppressCellFocus={true}
            suppressDragLeaveHidesColumns={true}
            enableCellTextSelection={true}
            overlayLoadingTemplate='<span style="padding: 10px; font-family: Sofia Sans, sans-serif;">Loading products...</span>'
            overlayNoRowsTemplate='<span style="padding: 10px; font-family: Sofia Sans, sans-serif;">No products found</span>'
          />
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        zIndex={9999}
        title={
          <span
            style={{
              fontFamily: "'Sofia Sans', sans-serif",
              fontWeight: 600,
              fontSize: '18px',
              color: '#262626'
            }}
          >
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </span>
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={actionLoading}
        okText={editingProduct ? 'Update' : 'Add'}
        cancelText="Cancel"
        width={700}
        okButtonProps={{
          style: {
            backgroundColor: '#262626',
            borderColor: '#262626',
            fontFamily: "'Sofia Sans', sans-serif",
            fontWeight: 500
          }
        }}
        cancelButtonProps={{
          style: {
            fontFamily: "'Sofia Sans', sans-serif",
            fontWeight: 500
          }
        }}
      >
        <Form
          form={form}
          layout="vertical"
          style={{
            marginTop: '24px',
            fontFamily: "'Sofia Sans', sans-serif"
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={<span style={{ fontFamily: "'Sofia Sans', sans-serif", fontWeight: 500 }}>Category</span>}
                name="categoryId"
                rules={[{ required: true, message: 'Please select category' }]}
              >
                <Select
                  placeholder="Select category"
                  size="large"
                  style={{ borderRadius: '6px', fontFamily: "'Sofia Sans', sans-serif" }}
                  showSearch
                  optionFilterProp="children"
                >
                  {categories?.map(cat => (
                    <Option key={cat.id} value={cat.id}>
                      {cat.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Product Name"
                name="name"
                rules={[{ required: true, message: 'Please enter product name' }]}
              >
                <Input
                  placeholder="Enter product name"
                  size="large"
                  style={{ borderRadius: 6, fontFamily: "'Sofia Sans', sans-serif" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Description"
                name="description"
              >
                <Input.TextArea
                  placeholder="Enter product description"
                  size="large"
                  rows={3}
                  style={{ borderRadius: 6, fontFamily: "'Sofia Sans', sans-serif", resize: 'none' }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <style jsx global>{`
        * {
          font-family: 'Sofia Sans', sans-serif;
        }

        .erp-grid {
          --ag-font-family: 'Sofia Sans', sans-serif !important;
          --ag-font-size: 14px;
          --ag-background-color: #ffffff;
          --ag-header-background-color: #f9fafb;
          --ag-odd-row-background-color: #ffffff;
          --ag-row-hover-color: #f9fafb;
          --ag-border-color: #e5e7eb;
          --ag-header-foreground-color: #111827;
          --ag-foreground-color: #374151;
          --ag-secondary-foreground-color: #6b7280;
          --ag-row-border-color: #f3f4f6;
        }

        .erp-grid .ag-header {
          border-bottom: 1px solid #e5e7eb !important;
        }

        .erp-grid .ag-header-cell {
          padding-left: 16px !important;
          padding-right: 16px !important;
        }

        .erp-grid .ag-header-cell-text {
          font-weight: 600 !important;
          font-size: 13px !important;
          color: #374151 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.025em !important;
        }

        .erp-grid .ag-cell {
          line-height: 52px;
          padding-left: 16px;
          padding-right: 16px;
          border-bottom: 1px solid #f3f4f6;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
        }

        .erp-grid .ag-row {
          border: none;
        }

        .erp-grid .ag-row-hover {
          background-color: #f9fafb !important;
        }

        .erp-grid .ag-paging-panel {
          border-top: 1px solid #e5e7eb;
          padding: 16px 20px;
          background: #ffffff;
          font-size: 13px;
          color: #6b7280;
        }

        .ant-modal-content {
          border-radius: 8px;
        }

        .ant-modal-header {
          border-radius: 8px 8px 0 0;
        }

        .ant-input:focus,
        .ant-input-focused,
        .ant-select-focused .ant-select-selector {
          border-color: #262626 !important;
          box-shadow: 0 0 0 2px rgba(38, 38, 38, 0.1) !important;
        }

        .ant-select-selector:hover {
          border-color: #262626 !important;
        }

        .ant-btn-primary:hover {
          background-color: #3d3d3d !important;
          border-color: #3d3d3d !important;
        }

        .ant-select-selection-placeholder,
        .ant-select-selection-item {
          font-family: 'Sofia Sans', sans-serif;
        }
      `}</style>
    </div>
  );
};

export default Products;