import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, ConfigProvider, Space, Typography, Popconfirm, message, Dropdown } from 'antd';
import { Plus, Eye, Pencil, Trash2, Search, MoreVertical } from 'lucide-react';
import { AgGridReact } from 'ag-grid-react';
import dayjs from 'dayjs';
import { Fetch_Invoices, Delete_Invoice } from '../../../Redux/Action/InvoiceAction/InvoiceAction';
import InvoiceForm from './InvoiceForm';
import InvoiceView from './InvoiceView';

const { Text } = Typography;

const Invoice = () => {
  const dispatch = useDispatch();
  const { invoices, loading } = useSelector((state) => state.LPG.invoice);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [gridApi, setGridApi] = useState(null);

  useEffect(() => {
    dispatch(Fetch_Invoices());
  }, [dispatch]);

  const gridData = useMemo(() => {
    const result = [];
    invoices.forEach((invoice) => {
      result.push({
        ...invoice,
        rowType: 'invoice',
        uniqueId: `invoice-${invoice.id}`
      });
    });
    return result;
  }, [invoices]);

  const onGridReady = useCallback((params) => {
    setGridApi(params.api);
  }, []);

  const handleAdd = () => {
    setEditingInvoice(null);
    setIsModalOpen(true);
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setIsModalOpen(true);
  };

  const handleView = (invoice) => {
    setViewingInvoice(invoice);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (id) => {
    const success = await dispatch(Delete_Invoice(id));
    if (success) {
      message.success('Invoice deleted successfully');
      dispatch(Fetch_Invoices());
    }
  };

  const handleModalClose = (shouldRefresh) => {
    setIsModalOpen(false);
    setEditingInvoice(null);
    if (shouldRefresh) {
      dispatch(Fetch_Invoices());
    }
  };

  const ActionsCellRenderer = (props) => {
    if (props.data.rowType !== 'invoice') return null;

    const menuItems = [
      {
        key: 'view',
        label: (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
            <Eye size={14} />
            <span>View</span>
          </div>
        ),
        onClick: () => handleView(props.data)
      },
      {
        key: 'edit',
        label: (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
            <Pencil size={14} />
            <span>Edit</span>
          </div>
        ),
        onClick: () => handleEdit(props.data)
      },
      {
        key: 'delete',
        label: (
          <Popconfirm
            title="Delete Invoice"
            description="Are you sure? This will restore stock."
            onConfirm={() => handleDelete(props.data.id)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', color: '#dc2626' }}>
              <Trash2 size={14} />
              <span>Delete</span>
            </div>
          </Popconfirm>
        )
      }
    ];

    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
          <button
            onClick={(e) => e.stopPropagation()}
            style={{
              border: '1px solid #e5e7eb',
              background: '#ffffff',
              padding: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              transition: 'all 0.2s',
              width: '32px',
              height: '32px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f9fafb';
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#ffffff';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
          >
            <MoreVertical size={16} color="#374151" />
          </button>
        </Dropdown>
      </div>
    );
  };

  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Invoice No / Item',
        field: 'invoiceNo',
        width: 200,
        pinned: 'left',
        cellRenderer: (params) => {
          if (params.data.rowType === 'invoice') {
            return <span style={{ fontWeight: '600', color: '#111827' }}>{params.data.invoiceNo}</span>;
          } else {
            return <span style={{ paddingLeft: '24px', color: '#374151', fontSize: '13px' }}>{params.data.itemName}</span>;
          }
        },
        filter: 'agTextColumnFilter'
      },
      {
        headerName: 'Date',
        field: 'date',
        width: 130,
        valueFormatter: (params) => {
          if (params.data.rowType === 'invoice') {
            return dayjs(params.value).format('DD MMM YYYY');
          }
          return '';
        },
        filter: 'agDateColumnFilter',
        sort: 'desc',
        cellStyle: { color: '#374151' }
      },
      {
        headerName: 'Customer / Details',
        field: 'customerName',
        width: 200,
        cellRenderer: (params) => {
          if (params.data.rowType === 'invoice') {
            return <span style={{ fontWeight: '500', color: '#111827' }}>{params.data.customerName}</span>;
          } else {
            return (
              <span style={{ color: '#6b7280', fontSize: '13px' }}>
                Qty: {params.data.qty} | {params.data.totalKg?.toFixed(2)} kg
              </span>
            );
          }
        },
        filter: 'agTextColumnFilter'
      },
      {
        headerName: 'Phone',
        field: 'customerPhone',
        width: 140,
        cellRenderer: (params) => {
          if (params.data.rowType === 'invoice') {
            return <span style={{ color: '#6b7280' }}>{params.value}</span>;
          }
          return '';
        },
        filter: 'agTextColumnFilter'
      },
      {
        headerName: 'Gate Pass',
        field: 'gatePassNo',
        width: 130,
        cellRenderer: (params) => {
          if (params.data.rowType === 'invoice') {
            return params.value ? <span style={{ color: '#374151' }}>{params.value}</span> : <span style={{ color: '#9ca3af' }}>—</span>;
          }
          return '';
        },
        filter: 'agTextColumnFilter'
      },
      {
        headerName: 'Qty',
        field: 'totalQty',
        width: 90,
        type: 'numericColumn',
        cellRenderer: (params) => {
          if (params.data.rowType === 'invoice') {
            return <span style={{ fontWeight: '500', color: '#374151' }}>{params.value}</span>;
          }
          return '';
        },
        filter: 'agNumberColumnFilter',
        cellStyle: { textAlign: 'center' }
      },
      {
        headerName: 'Total Kg',
        field: 'totalKg',
        width: 120,
        type: 'numericColumn',
        valueFormatter: (params) => {
          if (params.data.rowType === 'invoice' && params.value) {
            return params.value.toFixed(2) + ' kg';
          }
          return '';
        },
        filter: 'agNumberColumnFilter',
        cellStyle: { color: '#374151' }
      },
      {
        headerName: 'Price / Amount',
        field: 'totalAmount',
        width: 150,
        type: 'numericColumn',
        cellRenderer: (params) => {
          if (params.data.rowType === 'invoice') {
            return <span style={{ fontWeight: '500', color: '#374151' }}>₨ {params.data.totalAmount.toLocaleString('en-PK')}</span>;
          } else {
            return (
              <span style={{ color: '#6b7280', fontSize: '13px' }}>
                ₨ {params.data.price?.toFixed(2)} × {params.data.qty} = ₨{' '}
                {parseFloat(params.data.amount).toLocaleString('en-PK', { minimumFractionDigits: 2 })}
              </span>
            );
          }
        },
        filter: 'agNumberColumnFilter'
      },
      {
        headerName: 'Other Charges',
        field: 'otherCharges',
        width: 140,
        type: 'numericColumn',
        cellRenderer: (params) => {
          if (params.data.rowType === 'invoice') {
            return params.value > 0 ? `₨ ${params.value.toLocaleString('en-PK')}` : '—';
          }
          return '';
        },
        filter: 'agNumberColumnFilter',
        cellStyle: { color: '#6b7280' }
      },
      {
        headerName: 'Grand Total',
        field: 'grandTotal',
        width: 160,
        type: 'numericColumn',
        pinned: 'right',
        cellRenderer: (params) => {
          if (params.data.rowType === 'invoice') {
            return <span style={{ fontWeight: '500', color: '#111827' }}>₨ {params.value.toLocaleString('en-PK')}</span>;
          }
          return '';
        },
        filter: 'agNumberColumnFilter',
        cellStyle: { background: '#f9fafb' }
      },
      {
        headerName: 'Actions',
        field: 'actions',
        width: 90,
        pinned: 'right',
        cellRenderer: ActionsCellRenderer,
        sortable: false,
        filter: false,
        cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', background: '#f9fafb' }
      }
    ],
    []
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      resizable: true,
      filter: true,
      floatingFilter: false
    }),
    []
  );

  const getRowStyle = (params) => {
    if (params.data.rowType === 'item') {
      return {
        background: '#f9fafb',
        borderLeft: '3px solid #e5e7eb'
      };
    }
    return null;
  };

  const onQuickFilterChanged = useCallback(() => {
    if (gridApi) {
      gridApi.setGridOption('quickFilterText', searchText);
    }
  }, [gridApi, searchText]);

  useEffect(() => {
    onQuickFilterChanged();
  }, [searchText, onQuickFilterChanged]);

  return (
    <ConfigProvider
      theme={{
        token: {
          fontFamily: '"Sofia Sans", sans-serif',
          colorPrimary: '#111827',
          colorBgContainer: '#ffffff',
          borderRadius: 6,
          fontSize: 14
        },
        components: {
          Modal: {
            borderRadius: 0,
            borderRadiusLG: 0,
            borderRadiusSM: 0
          }
        }
      }}
    >
      <div
        style={{
          padding: '12px 12px',
          background: '#ffffff',
          fontFamily: '"Sofia Sans", sans-serif'
        }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            paddingBottom: '20px',
            borderBottom: '1px solid #e5e7eb'
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: '700',
                color: '#111827',
                letterSpacing: '-0.02em'
              }}
            >
              Invoices
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280', fontWeight: '400' }}>
              Manage and track all sales invoices
            </p>
          </div>
          <button
            onClick={handleAdd}
            style={{
              background: '#111827',
              color: '#ffffff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s',
              boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#000000';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#111827';
              e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
            }}
          >
            <Plus size={18} strokeWidth={2.5} />
            New Invoice
          </button>
        </div>

        {/* Filters */}
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
              placeholder="Search invoices..."
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

        {/* AG Grid Table */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            overflow: 'hidden'
          }}
        >
          <div className="ag-theme-quartz erp-grid" style={{ height: 'calc(100vh - 290px)', width: '100%' }}>
            <AgGridReact
              rowData={gridData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              onGridReady={onGridReady}
              pagination={true}
              paginationPageSize={20}
              paginationPageSizeSelector={[10, 20, 50, 100]}
              animateRows={true}
              rowSelection="single"
              suppressCellFocus={true}
              suppressDragLeaveHidesColumns={true}
              loading={loading}
              getRowStyle={getRowStyle}
              getRowId={(params) => params.data.uniqueId}
              overlayLoadingTemplate='<div style="padding: 20px; color: #6b7280; font-size: 14px;">Loading invoices...</div>'
              overlayNoRowsTemplate='<div style="padding: 20px; color: #9ca3af; font-size: 14px;">No invoices found</div>'
            />
          </div>
        </div>

        {/* Add/Edit Modal */}
        <Modal
          open={isModalOpen}
          title={
            <Space size={12}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '6px',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {editingInvoice ? <Pencil size={18} color="#111827" /> : <Plus size={18} color="#111827" />}
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>
                  {editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
                </div>
                <Text type="secondary" style={{ fontSize: '13px', color: '#6b7280' }}>
                  {editingInvoice ? 'Update invoice details' : 'Enter complete invoice information'}
                </Text>
              </div>
            </Space>
          }
          onCancel={() => handleModalClose(false)}
          footer={null}
          width="100%"
          zIndex={9999}
          style={{ top: 0, paddingBottom: 0, maxWidth: '100vw' }}
          destroyOnClose
          styles={{
            content: { borderRadius: 0 },
            body: {
              padding: '16px',
              background: '#f9fafb',
              height: 'calc(100vh - 169px)',
              overflowY: 'auto'
            }
          }}
        >
          <InvoiceForm invoice={editingInvoice} onClose={handleModalClose} />
        </Modal>

        {/* View Modal */}
        <Modal
          zIndex={9999}
          width="100%"
          title={
            <div
              style={{
                display: 'flex',
                background: '#fff',
                borderBottom: '1px solid #e5e7eb',
                paddingBottom: '16px',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '6px',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Eye size={18} strokeWidth={1.2} color="#111827" />
              </div>
              <span style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>Invoice Details</span>
            </div>
          }
          open={isViewModalOpen}
          style={{ top: 0, paddingBottom: 0, maxWidth: '100vw' }}
          styles={{
            content: { borderRadius: 0 },
            body: {
              // padding: '16px',
              background: '#f9fafb',
              height: 'calc(100vh - 102px)',
              overflowY: 'auto'
            }
          }}
          onCancel={() => setIsViewModalOpen(false)}
          footer={null}
          destroyOnClose
        >
          {viewingInvoice && <InvoiceView invoice={viewingInvoice} />}
        </Modal>

        <style>{` 
          .erp-grid {
            --ag-font-family: "Sofia Sans", sans-serif !important;
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
        `}</style>
      </div>
    </ConfigProvider>
  );
};

export default Invoice;
