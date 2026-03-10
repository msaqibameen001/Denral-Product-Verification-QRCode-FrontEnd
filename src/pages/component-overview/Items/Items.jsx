import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Button, Input, Form, Popconfirm, Space, Typography, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { AgGridReact } from 'ag-grid-react';
import { Search } from 'lucide-react';
import { Fetch_Items, Add_Item, Update_Item, Delete_Item } from '../../../Redux/Action/ItemsAction/ItemsAction';

const { Title } = Typography;

const Items = () => {
  const dispatch = useDispatch();
  const { items, loading, actionLoading } = useSelector((state) => state.LPG.item);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(Fetch_Items());
  }, [dispatch]);

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    form.setFieldsValue(item);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    await dispatch(Delete_Item(id));
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      let success;

      if (editingItem) {
        success = await dispatch(Update_Item(editingItem.itemId, values));
      } else {
        success = await dispatch(Add_Item(values));
      }

      if (success) {
        setIsModalVisible(false);
        form.resetFields();
        setEditingItem(null);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingItem(null);
  };

  const ActionsCellRenderer = (props) => {
    const isPrimary = props.data?.isPrimary === true;
    const isRestrictedId = props.data?.itemId === 6;

    const isDisabled = isPrimary || isRestrictedId;

    return (
      <Space size="small">
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => handleEdit(props.data)}
          size="small"
          style={{ color: '#262626' }}
          disabled={isDisabled}
          title={isPrimary || isRestrictedId ? 'This item cannot be edited' : 'Edit'}
        />

        <Popconfirm
          title="Delete Item"
          description="Are you sure you want to delete this item?"
          onConfirm={() => handleDelete(props.data.itemId)}
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
          disabled={isDisabled}
        >
          <Button
            type="text"
            icon={<DeleteOutlined />}
            size="small"
            danger
            disabled={isDisabled}
            title={isPrimary || isRestrictedId ? 'This item cannot be deleted' : 'Delete'}
          />
        </Popconfirm>
      </Space>
    );
  };

  const columnDefs = useMemo(
    () => [
      {
        headerName: 'ITEM ID',
        field: 'itemId',
        filter: 'agTextColumnFilter',
        sortable: true,
        flex: 1,
        minWidth: 80
      },
      {
        headerName: 'ITEM NAME',
        field: 'itemName',
        filter: 'agTextColumnFilter',
        sortable: true,
        flex: 1,
        minWidth: 200
      },
      {
        headerName: 'WEIGHT',
        field: 'weight',
        filter: 'agTextColumnFilter',
        sortable: true,
        flex: 1,
        minWidth: 220
      },
      {
        headerName: 'IN STOCK',
        field: 'availableStock',
        filter: 'agTextColumnFilter',
        sortable: true,
        flex: 1,
        minWidth: 120
      },
      {
        headerName: 'COST PRICE',
        field: 'costPrice',
        filter: 'agNumberColumnFilter',
        sortable: true,
        flex: 1,
        minWidth: 130,
        valueFormatter: (params) => (params.value ? `Rs. ${parseFloat(params.value).toFixed(2)}` : 'Rs. 0.00')
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

  const filteredItems = useMemo(() => {
    if (!searchText) return items;
    const lowerSearch = searchText.toLowerCase();
    return items.filter(
      (item) =>
        item.itemName?.toLowerCase().includes(lowerSearch) ||
        item.weight?.toLowerCase().includes(lowerSearch) ||
        item.availableStock?.toLowerCase().includes(lowerSearch)
    );
  }, [items, searchText]);

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
              Stocks
            </Title>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280', fontWeight: '400' }}>
              Monitor and manage your inventory in real time
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
            Add Item
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
              placeholder="Search items..."
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
            '--ag-font-family': "'Sofia Sans', sans-serif",
            '--ag-header-background-color': '#fafafa',
            '--ag-border-color': '#f0f0f0',
            '--ag-row-hover-color': '#fafafa',
            '--ag-selected-row-background-color': '#f5f5f5',
            '--ag-font-size': '14px',
            '--ag-header-foreground-color': '#262626'
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
            enableCellTextSelection={true}
            suppressDragLeaveHidesColumns={true}
            overlayLoadingTemplate='<span style="padding: 10px; font-family: Sofia Sans, sans-serif;">Loading items...</span>'
            overlayNoRowsTemplate='<span style="padding: 10px; font-family: Sofia Sans, sans-serif;">No items found</span>'
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
            {editingItem ? 'Edit Item' : 'Add New Item'}
          </span>
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={actionLoading}
        okText={editingItem ? 'Update' : 'Add'}
        cancelText="Cancel"
        width={600}
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
                label={<span style={{ fontFamily: "'Sofia Sans', sans-serif", fontWeight: 500 }}>Item Name</span>}
                name="itemName"
                rules={[{ required: true, message: 'Please enter item name' }]}
              >
                <Input placeholder="Enter item name" size="large" style={{ fontFamily: "'Sofia Sans', sans-serif", borderRadius: '6px' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Weight"
                name="weight"
                style={{ fontFamily: "'Sofia Sans', sans-serif", fontWeight: 500 }}
                rules={[{ required: true, message: 'Please enter weight' }]}
              >
                <Input
                  placeholder="e.g. 1.5 KG"
                  size="large"
                  type="number"
                  min={0}
                  step="0.01"
                  style={{ borderRadius: 6, fontFamily: "'Sofia Sans', sans-serif" }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Available Stock"
                name="availableStock"
                style={{ fontFamily: "'Sofia Sans', sans-serif", fontWeight: 500 }}
                rules={[{ required: true, message: 'Please enter available stock' }]}
              >
                <Input
                  placeholder="Enter stock"
                  size="large"
                  type="number"
                  min={0}
                  style={{ borderRadius: 6, fontFamily: "'Sofia Sans', sans-serif" }}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={<span style={{ fontFamily: "'Sofia Sans', sans-serif", fontWeight: 500 }}>Cost Price</span>}
                name="costPrice"
                style={{ fontFamily: "'Sofia Sans', sans-serif", fontWeight: 500 }}
                rules={[
                  { required: true, message: 'Please enter price' },
                  { pattern: /^[0-9]+(\.[0-9]{1,2})?$/, message: 'Please enter valid price' }
                ]}
              >
                <Input
                  placeholder="Enter price"
                  prefix="Rs."
                  size="large"
                  type="number"
                  step="0.01"
                  style={{ fontFamily: "'Sofia Sans', sans-serif", borderRadius: '6px' }}
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

        .erp-grid .ag-paging-button {
          color: #374151;
        }

        .erp-grid .ag-paging-button:hover {
          background-color: #f3f4f6;
        }

        .erp-grid .ag-icon {
          color: #6b7280;
        }

        .ant-modal-content {
          border-radius: 8px;
        }

        .ant-modal-header {
          border-radius: 8px 8px 0 0;
        }

        .ant-input:focus,
        .ant-input-focused {
          border-color: #262626;
          box-shadow: 0 0 0 2px rgba(38, 38, 38, 0.1);
        }

        .ant-btn-primary:hover {
          background-color: #3d3d3d !important;
          border-color: #3d3d3d !important;
        }

        .ag-header-cell-label {
          font-weight: 600;
        }

        .ag-cell {
          display: flex;
          align-items: center;
        }

        .ag-paging-panel {
          border-top: 1px solid #f0f0f0;
          padding: 12px;
        }
      `}</style>
    </div>
  );
};

export default Items;
