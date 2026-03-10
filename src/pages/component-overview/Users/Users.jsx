import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Button, Input, Form, Popconfirm, Space, Typography, Row, Col, Checkbox, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { AgGridReact } from 'ag-grid-react';
import { Search, CircleCheckBig, CircleX } from 'lucide-react';
import { Fetch_Users, Add_User, Update_User, Delete_User } from '../../../Redux/Action/UserAction/UserAction';
const { Title } = Typography;

const Users = () => {
  const dispatch = useDispatch();
  const { users, loading, actionLoading } = useSelector((state) => state.user);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(Fetch_Users());
  }, [dispatch]);

  const handleAdd = () => {
    setEditingAsset(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (user) => {
    setEditingAsset(user);
    form.setFieldsValue(user);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    await dispatch(Delete_User(id));
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      let success;

      if (editingAsset) {
        success = await dispatch(Update_User(editingAsset.userId, values));
      } else {
        success = await dispatch(Add_User(values));
      }

      if (success) {
        setIsModalVisible(false);
        form.resetFields();
        setEditingAsset(null);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingAsset(null);
  };

  const ActionsCellRenderer = (props) => {
    const isAdmin = props.data.role?.toLowerCase() === 'admin';

    return (
      <Space size="small">
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => handleEdit(props.data)}
          size="small"
          style={{ color: '#262626' }}
          title={'Edit'}
        />

        {isAdmin ? (
          <Button
            type="text"
            icon={<DeleteOutlined />}
            size="small"
            disabled
            title="Admin users cannot be deleted"
            style={{ color: '#d1d5db', cursor: 'not-allowed' }}
          />
        ) : (
          <Popconfirm
            title="Delete User"
            description="Are you sure you want to delete this user?"
            onConfirm={() => handleDelete(props.data.userId)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" icon={<DeleteOutlined />} size="small" danger title={'Delete'} />
          </Popconfirm>
        )}
      </Space>
    );
  };
  const RoleCellRenderer = (props) => {
    const role = props.value || 'user';
    const roleColors = {
      employee: { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' },
      admin: { bg: '#d1fae5', text: '#065f46', border: '#6ee7b7' }
    };

    const colors = roleColors[role.toLowerCase()] || roleColors.employee;

    return (
      <span
        style={{
          display: 'inline-flex',
          height: '24px',
          alignItems: 'center',
          padding: '4px 12px',
          backgroundColor: colors.bg,
          color: colors.text,
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600',
          border: `1px solid ${colors.border}`,
          textTransform: 'capitalize',
          fontFamily: "'Sofia Sans', sans-serif"
        }}
      >
        {role}
      </span>
    );
  };

  const IsActiveCellRenderer = (props) => {
    const isActive = props.value;

    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        {isActive ? (
          <CircleCheckBig size={18} color="#16a34a" strokeWidth={1.5} />
        ) : (
          <CircleX size={18} color="#dc2626" strokeWidth={1.5} />
        )}
      </div>
    );
  };

  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Name',
        field: 'fullName',
        filter: 'agTextColumnFilter',
        sortable: true,
        flex: 1,
        minWidth: 180
      },
      {
        headerName: 'User NAME',
        field: 'username',
        filter: 'agTextColumnFilter',
        sortable: true,
        flex: 1,
        minWidth: 180
      },
      {
        headerName: 'email',
        field: 'email',
        filter: 'agTextColumnFilter',
        sortable: true,
        flex: 1,
        minWidth: 180
      },
      {
        headerName: 'phone',
        field: 'phone',
        filter: 'agTextColumnFilter',
        sortable: true,
        flex: 1,
        minWidth: 150
      },
      {
        headerName: 'role',
        field: 'role',
        filter: 'agTextColumnFilter',
        sortable: true,
        flex: 1,
        minWidth: 120,
        cellRenderer: RoleCellRenderer
      },
      {
        headerName: 'isActive',
        field: 'isActive',
        filter: 'agTextColumnFilter',
        sortable: true,
        flex: 1,
        minWidth: 100,
        cellRenderer: IsActiveCellRenderer
      },
      {
        headerName: 'last Login At',
        field: 'lastLoginAt',
        sortable: true,
        filter: 'agDateColumnFilter',
        flex: 1,
        minWidth: 170,
        valueFormatter: (params) => {
          if (!params.value) return '';

          const date = new Date(params.value);

          const day = String(date.getDate()).padStart(2, '0');
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const month = monthNames[date.getMonth()];
          const year = date.getFullYear();

          let hours = date.getHours();
          const minutes = String(date.getMinutes()).padStart(2, '0');
          const ampm = hours >= 12 ? 'PM' : 'AM';

          hours = hours % 12 || 12;

          return `${day} ${month} ${year} ${hours}:${minutes} ${ampm}`;
          // Example: 08 Jan 2026 3:45 PM
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

  const filteredItems = useMemo(() => {
    if (!searchText) return users;
    const lowerSearch = searchText.toLowerCase();
    return users.filter(
      (u) =>
        u.fullName?.toLowerCase().includes(lowerSearch) ||
        u.email?.toLowerCase().includes(lowerSearch) ||
        u.phone?.toLowerCase().includes(lowerSearch)
    );
  }, [users, searchText]);

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
              Users
            </Title>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280', fontWeight: '400' }}>
              Manage and track company Users efficiently
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
            Add User
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
              placeholder="Search users..."
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
            suppressDragLeaveHidesColumns={true}
            enableCellTextSelection={true}
            overlayLoadingTemplate='<span style="padding: 10px; font-family: Sofia Sans, sans-serif;">Loading assets...</span>'
            overlayNoRowsTemplate='<span style="padding: 10px; font-family: Sofia Sans, sans-serif;">No assets found</span>'
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
            {editingAsset ? 'Edit User' : 'Add New User'}
          </span>
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={actionLoading}
        okText={editingAsset ? 'Update' : 'Add'}
        cancelText="Cancel"
        width={600}
        style={{ top: 40 }}
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
                label={<span style={{ fontFamily: "'Sofia Sans', sans-serif", fontWeight: 500 }}>Username</span>}
                name="username"
                rules={[{ required: true, message: 'Please enter username' }]}
              >
                <Input placeholder="Enter username" size="large" style={{ fontFamily: "'Sofia Sans', sans-serif", borderRadius: '6px' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={<span style={{ fontFamily: "'Sofia Sans', sans-serif", fontWeight: 500 }}>Full Name</span>}
                name="fullName"
                rules={[{ required: true, message: 'Please enter full name' }]}
              >
                <Input placeholder="Enter full name" size="large" style={{ borderRadius: 6, fontFamily: "'Sofia Sans', sans-serif" }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={<span style={{ fontFamily: "'Sofia Sans', sans-serif", fontWeight: 500 }}>Email</span>}
                name="email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter valid email' }
                ]}
              >
                <Input placeholder="Enter email" size="large" style={{ borderRadius: 6, fontFamily: "'Sofia Sans', sans-serif" }} />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                label={<span style={{ fontFamily: "'Sofia Sans', sans-serif", fontWeight: 500 }}>Phone</span>}
                name="phone"
                rules={[{ required: true, message: 'Please enter phone number' }]}
              >
                <Input
                  placeholder="Enter phone number"
                  size="large"
                  style={{ fontFamily: "'Sofia Sans', sans-serif", borderRadius: '6px' }}
                />
              </Form.Item>
            </Col>
          </Row>
          {!editingAsset && (
               <Row gutter={16}>
    <Col span={24}>
      <Form.Item
        label={<span style={{ fontFamily: "'Sofia Sans', sans-serif", fontWeight: 500 }}>Password</span>}
        name="password"
        rules={[
          { required: true, message: 'Please enter password' },
          { min: 6, message: 'Password must be at least 6 characters' }
        ]}
      >
        <Input.Password
          placeholder="Enter password"
          size="large"
          style={{ borderRadius: 6, fontFamily: "'Sofia Sans', sans-serif" }}
        />
      </Form.Item>
    </Col>
    </Row>
)}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={<span style={{ fontFamily: "'Sofia Sans', sans-serif", fontWeight: 500 }}>Role</span>}
                name="role"
                initialValue="Employee"
                rules={[{ required: true, message: 'Please select role' }]}
              >
                <Select disabled={editingAsset?.role?.toLowerCase() === 'admin'} placeholder="Select role" size="large" style={{ fontFamily: "'Sofia Sans', sans-serif", borderRadius: '6px' }}>
                  <Select.Option value="Employee">Employee</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="isActive" valuePropName="checked" style={{ marginTop: 30 }}>
                <Checkbox disabled={editingAsset?.role?.toLowerCase() === 'admin'} style={{ fontFamily: "'Sofia Sans', sans-serif", fontWeight: 500 }}>Is Active</Checkbox>
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

export default Users;
