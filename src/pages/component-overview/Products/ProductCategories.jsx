import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Button, Input, Form, Popconfirm, Space, Typography, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { AgGridReact } from 'ag-grid-react';
import { Search } from 'lucide-react';
import { Create_Category, Fetch_Categories, Update_Category, Delete_Category } from '../../../Redux/Action/ProductsAction/CategoryAction';

const { Title } = Typography;
const { TextArea } = Input;

const ProductCategories = () => {
    const dispatch = useDispatch();
    const { categories, loading, actionLoading } = useSelector((state) => state.category);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [form] = Form.useForm();

    useEffect(() => {
        dispatch(Fetch_Categories());
    }, [dispatch]);

    const handleAdd = () => {
        setEditingCategory(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        form.setFieldsValue({
            name: category.name,
            description: category.description
            // created_at edit nahi hoga, sirf view ke liye hai
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (id) => {
        await dispatch(Delete_Category(id));
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            let success;

            if (editingCategory) {
                // Update category
                success = await dispatch(Update_Category(editingCategory.id, values));
            } else {
                // Create category
                success = await dispatch(Create_Category(values));
            }

            if (success) {
                setIsModalVisible(false);
                form.resetFields();
                setEditingCategory(null);
            }
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
        setEditingCategory(null);
    };

    const ActionsCellRenderer = (props) => {
        return (
            <Space size="small">
                <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(props.data)}
                    size="small"
                    style={{ color: '#262626' }}
                    title="Edit Category"
                />

                <Popconfirm
                    title="Delete Category"
                    description="Are you sure you want to delete this category?"
                    onConfirm={() => handleDelete(props.data.id)}
                    okText="Delete"
                    cancelText="Cancel"
                    okButtonProps={{ danger: true }}
                >
                    <Button type="text" icon={<DeleteOutlined />} size="small" danger title="Delete Category" />
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
                headerName: 'CATEGORY NAME',
                field: 'name',
                filter: 'agTextColumnFilter',
                sortable: true,
                flex: 2,
                minWidth: 200,
                cellStyle: {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'block',
                    fontWeight: '500'
                },
                autoHeight: true,
            },
            {
                headerName: 'DESCRIPTION',
                field: 'description',
                filter: 'agTextColumnFilter',
                sortable: true,
                flex: 3,
                minWidth: 250,
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
                headerName: 'CREATED DATE',
                field: 'createdAt',
                sortable: true,
                filter: 'agDateColumnFilter',
                width: 150,
                valueFormatter: (params) => {
                    if (!params.value) return '-';
                    const date = new Date(params.value);
                    const day = String(date.getDate()).padStart(2, '0');
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    const month = monthNames[date.getMonth()];
                    const year = date.getFullYear();
                    return `${day} ${month} ${year}`;
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

    const filteredCategories = useMemo(() => {
        if (!searchText) return categories;
        const lowerSearch = searchText.toLowerCase();
        return categories.filter(
            (cat) =>
                cat.name?.toLowerCase().includes(lowerSearch) ||
                cat.description?.toLowerCase().includes(lowerSearch)
        );
    }, [categories, searchText]);

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
                            Product Categories
                        </Title>
                        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280', fontWeight: '400' }}>
                            Create and manage product categories efficiently
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
                        Add Category
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
                            placeholder="Search categories by name or description..."
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
                        rowData={filteredCategories}
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
                        overlayLoadingTemplate='<span style="padding: 10px; font-family: Sofia Sans, sans-serif;">Loading categories...</span>'
                        overlayNoRowsTemplate='<span style="padding: 10px; font-family: Sofia Sans, sans-serif;">No categories found</span>'
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
                        {editingCategory ? 'Edit Category' : 'Add New Category'}
                    </span>
                }
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                confirmLoading={actionLoading}
                okText={editingCategory ? 'Update' : 'Add'}
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
                        <Col span={24}>
                            <Form.Item
                                label={<span style={{ fontFamily: "'Sofia Sans', sans-serif", fontWeight: 500 }}>Category Name</span>}
                                name="name"
                                rules={[
                                    { required: true, message: 'Please enter category name' },
                                    { min: 2, message: 'Category name must be at least 2 characters' },
                                    { max: 150, message: 'Category name cannot exceed 150 characters' }
                                ]}
                            >
                                <Input
                                    placeholder="Enter category name (e.g., Electronics, Furniture, etc.)"
                                    size="large"
                                    style={{
                                        fontFamily: "'Sofia Sans', sans-serif",
                                        borderRadius: '6px'
                                    }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                label={<span style={{ fontFamily: "'Sofia Sans', sans-serif", fontWeight: 500 }}>Description</span>}
                                name="description"
                                rules={[
                                    { max: 500, message: 'Description cannot exceed 500 characters' }
                                ]}
                            >
                                <TextArea
                                    placeholder="Enter category description (optional)"
                                    size="large"
                                    rows={4}
                                    style={{
                                        fontFamily: "'Sofia Sans', sans-serif",
                                        borderRadius: '6px',
                                        resize: 'none'
                                    }}
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

        /* TextArea hover effect */
        .ant-input-textarea:hover .ant-input {
          border-color: #262626;
        }
      `}</style>
        </div>
    );
};

export default ProductCategories;