import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Form, Input, DatePicker, Select, InputNumber, Button, Table, Space, Row, Col, Typography, message } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Add_Invoice, Update_Invoice } from '../../../Redux/Action/InvoiceAction/InvoiceAction';
import { Fetch_Customers } from '../../../Redux/Action/Party/CustomerActions/CustomerActions';
import { Fetch_Items } from '../../../Redux/Action/ItemsAction/ItemsAction';

const { Title, Text } = Typography;

const InvoiceForm = ({ invoice, onClose }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { customers } = useSelector((state) => state.PRT.customer);
  const { items } = useSelector((state) => state.LPG.item);
  const { actionLoading } = useSelector((state) => state.LPG.invoice);

  const [invoiceItems, setInvoiceItems] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [rate, setRate] = useState(0);
  const [otherCharges, setOtherCharges] = useState(0);

  // Helper function to check if item is custom
  const isCustomItem = (item) => {
    return item.itemName?.toLowerCase().includes('custom') && !item.isPrimary && item.weight === 0;
  };

  useEffect(() => {
    dispatch(Fetch_Customers(1));
    dispatch(Fetch_Items());
  }, [dispatch]);

  useEffect(() => {
    const filteredItems = items.filter((item) => !item.isPrimary);

    if (invoice) {
      // Edit mode
      form.setFieldsValue({
        date: dayjs(invoice.date),
        customerId: invoice.customerId,
        gatePassNo: invoice.gatePassNo,
        otherCharges: invoice.otherCharges
      });

      const customer = customers.find((c) => c.id === invoice.customerId);
      setSelectedCustomer(customer);
      setOtherCharges(invoice.otherCharges);

      // Set rate from invoice items (first item's price)
      const firstItemPrice = invoice.items[0]?.price || customer?.defaultRate || 0;
      setRate(firstItemPrice);
      form.setFieldsValue({ rate: firstItemPrice });

      const mappedItems = filteredItems.map((item) => {
        const invoiceItem = invoice.items.find((ii) => ii.itemId === item.itemId);

        if (item.itemId === 6) {
          return {
            itemId: item.itemId,
            itemName: item.itemName,
            weight: invoiceItem?.totalKg ? Math.abs(invoiceItem.totalKg) : 0,
            qty: -1, // Fixed -1
            totalKg: invoiceItem?.totalKg || 0, // Negative value
            amount: invoiceItem ? invoiceItem.totalKg * firstItemPrice : 0
          };
        }
        return {
          itemId: item.itemId,
          itemName: item.itemName,
          weight: invoiceItem?.totalKg && invoiceItem?.qty ? invoiceItem.totalKg / invoiceItem.qty : item.weight,
          qty: invoiceItem?.qty || 0,
          totalKg: invoiceItem?.totalKg || 0,
          amount: invoiceItem ? invoiceItem.totalKg * firstItemPrice : 0
        };
      });
      setInvoiceItems(mappedItems);
    } else {
      if (filteredItems.length > 0) {
        const initialItems = filteredItems.map((item) => ({
          itemId: item.itemId,
          itemName: item.itemName,
          weight: item.weight,
          qty: item.itemId === 6 ? -1 : 0,
          totalKg: 0,
          amount: 0
        }));
        setInvoiceItems(initialItems);
      }
    }
  }, [invoice, items, customers, form]);

  const handleCustomerChange = (customerId) => {
    const customer = customers.find((c) => c.id === customerId);
    setSelectedCustomer(customer);

    // Set default rate
    const defaultRate = customer?.defaultRate || 0;
    setRate(defaultRate);
    form.setFieldsValue({ rate: defaultRate });

    // Recalculate amounts with new rate
    setInvoiceItems((prev) =>
      prev.map((item) => ({
        ...item,
        amount: item.totalKg * defaultRate
      }))
    );
  };

  const handleRateChange = (newRate) => {
    setRate(newRate || 0);

    // Recalculate all amounts
    setInvoiceItems((prev) =>
      prev.map((item) => ({
        ...item,
        amount: item.totalKg * (newRate || 0)
      }))
    );
  };

  const handleWeightChange = (itemId, newWeight) => {
    setInvoiceItems((prev) =>
      prev.map((item) => {
        if (item.itemId === itemId) {
          if (itemId === 6) {
            const totalKg = (newWeight || 0) * -1; // Hamesha -1 se multiply
            const amount = totalKg * rate;
            return { ...item, weight: newWeight || 0, totalKg, amount };
          }

          const totalKg = (item.qty || 0) * (newWeight || 0);
          const amount = totalKg * rate;
          return { ...item, weight: newWeight || 0, totalKg, amount };
        }
        return item;
      })
    );
  };

  const handleQtyChange = (itemId, qty) => {
    setInvoiceItems((prev) =>
      prev.map((item) => {
        if (item.itemId === itemId) {
          const totalKg = (qty || 0) * item.weight;
          const amount = totalKg * rate;
          return { ...item, qty: qty || 0, totalKg, amount };
        }
        return item;
      })
    );
  };

  // Calculate totals
  const calculateTotals = () => {
    const totalQty = invoiceItems.reduce((sum, item) => {
      if (item.itemId === 6) return sum;
      return sum + item.qty;
    }, 0);
    const totalKg = invoiceItems.reduce((sum, item) => sum + item.totalKg, 0);
    const totalAmount = invoiceItems.reduce((sum, item) => sum + item.amount, 0);
    const grandTotal = totalAmount + otherCharges;

    return { totalQty, totalKg, totalAmount, grandTotal };
  };

  const totals = calculateTotals();

  const handleSubmit = async (values) => {
    // Validation: Check if rate is set
    if (!rate || rate <= 0) {
      message.error('Please enter a valid rate per kg');
      return;
    }

    // Validation: Check for custom items with zero weight
    const invalidCustomItems = invoiceItems.filter((item) => {
      const isCustom = isCustomItem({
        itemName: item.itemName,
        isPrimary: false,
        weight: items.find((i) => i.itemId === item.itemId)?.weight || 0
      });
      return isCustom && item.qty > 0 && item.weight <= 0;
    });

    if (invalidCustomItems.length > 0) {
      message.error('Custom items must have weight greater than 0');
      return;
    }

    const gasReturnItem = invoiceItems.find((item) => item.itemId === 6);
    if (gasReturnItem && gasReturnItem.weight > 0 && gasReturnItem.qty !== -1) {
      message.error('Gas Return quantity must be -1');
      return;
    }

    const validItems = invoiceItems
      .filter((item) => {
        // Gas Return: Include only if weight > 0
        if (item.itemId === 6) {
          return item.totalKg < 0;
        }

        // Normal items: Include only if qty > 0
        return item.qty > 0;
      })
      .map((item) => ({
        itemId: item.itemId,
        qty: item.itemId === 6 ? -1 : item.qty,
        totalKg: item.totalKg,
        price: rate
      }));

    if (validItems.length === 0) {
      message.warning('Please add at least one item with quantity or return weight.');
      return;
    }

    const invoiceData = {
      id: invoice?.id,
      date: values.date.format('YYYY-MM-DD'),
      customerId: values.customerId,
      gatePassNo: values.gatePassNo || null,
      otherCharges: otherCharges,
      items: validItems
    };

    try {
      let result;
      if (invoice) {
        result = await dispatch(Update_Invoice(invoice.id, invoiceData));
      } else {
        result = await dispatch(Add_Invoice(invoiceData));
      }

      if (result.success) {
        message.success(invoice ? 'Invoice updated successfully' : 'Invoice created successfully');
        onClose(true);
      } else {
        message.error(result.message || 'Failed to save invoice');
      }
    } catch (error) {
      message.error('An error occurred while saving invoice');
      console.error('Invoice save error:', error);
    }
  };

  const columns = [
    {
      title: 'Item Name',
      dataIndex: 'itemName',
      key: 'itemName',
      width: 250
    },
    {
      title: 'Weight (Kg)',
      dataIndex: 'weight',
      key: 'weight',
      width: 150,
      align: 'center',
      render: (weight, record) => {
        const originalItem = items.find((i) => i.itemId === record.itemId);
        const isCustom = isCustomItem({
          itemName: originalItem?.itemName || record.itemName,
          isPrimary: originalItem?.isPrimary || false,
          weight: originalItem?.weight || 0
        });

        if (record.itemId === 6 || isCustom) {
          return (
            <InputNumber
              min={0}
              step={0.01}
              value={weight}
              onChange={(value) => handleWeightChange(record.itemId, value)}
              style={{ width: '100%' }}
              placeholder={record.itemId === 6 ? 'Return weight' : 'Enter weight'}
            />
          );
        }
        return <Text>{weight.toFixed(2)}</Text>;
      }
    },
    {
      title: 'Quantity',
      dataIndex: 'qty',
      key: 'qty',
      width: 150,
      render: (qty, record) => {
        if (record.itemId === 6) {
          return (
            <InputNumber
              value={-1}
              disabled
              style={{
                width: '100%',
                backgroundColor: '#f5f5f5',
                color: '#d9534f',
                fontWeight: 'bold'
              }}
            />
          );
        }

        // Baqi items
        return (
          <InputNumber
            min={0}
            value={qty}
            onChange={(value) => handleQtyChange(record.itemId, value)}
            style={{ width: '100%' }}
            placeholder="0"
          />
        );
      }
    },
    {
      title: 'Total Kg',
      dataIndex: 'totalKg',
      key: 'totalKg',
      width: 120,
      align: 'right',
      render: (totalKg) => (
        <Text strong style={{ color: totalKg < 0 ? '#d9534f' : '#000' }}>
          {totalKg.toFixed(2)}
        </Text>
      )
    },
    {
      title: 'Amount',
      key: 'amount',
      width: 150,
      align: 'right',
      render: (_, record) => (
        <Text strong style={{ color: record.amount < 0 ? '#d9534f' : '#000' }}>
          ₨ {record.amount.toLocaleString('en-PK', { maximumFractionDigits: 2 })}
        </Text>
      )
    }
  ];

  return (
    <div style={{ background: '#fff' }}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {/* Header Section */}
        <div
          style={{
            background: '#fff',
            padding: '20px 24px',
            borderBottom: '1px solid #e8e8e8'
          }}
        >
          <Row gutter={16}>
            <Col xs={24} sm={12} lg={4}>
              <Form.Item
                label={<Text style={{ fontSize: '13px', color: '#666' }}>Date</Text>}
                name="date"
                rules={[{ required: true, message: 'Required' }]}
                initialValue={dayjs()}
              >
                <DatePicker style={{ width: '100%' }} format="DD MMM YYYY" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Form.Item
                label={<Text style={{ fontSize: '13px', color: '#666' }}>Customer</Text>}
                name="customerId"
                rules={[{ required: true, message: 'Required' }]}
              >
                <Select
                  placeholder="Select Customer"
                  showSearch
                  optionFilterProp="children"
                  onChange={handleCustomerChange}
                  filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                >
                  {customers.map((customer) => (
                    <Select.Option key={customer.id} value={customer.id}>
                      {customer.partyName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={4}>
              <Form.Item
                label={<Text style={{ fontSize: '13px', color: '#666' }}>Rate per Kg</Text>}
                name="rate"
                rules={[
                  { required: true, message: 'Required' },
                  {
                    validator: (_, value) => {
                      if (value && value > 0) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Rate must be greater than 0'));
                    }
                  }
                ]}
              >
                <InputNumber
                  min={0}
                  value={rate}
                  onChange={handleRateChange}
                  style={{ width: '100%' }}
                  prefix="₨"
                  placeholder="Enter rate"
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} lg={5}>
              <Form.Item label={<Text style={{ fontSize: '13px', color: '#666' }}>Gate Pass No</Text>} name="gatePassNo">
                <Input placeholder="Optional" />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} lg={5}>
              <Form.Item
                label={<Text style={{ fontSize: '13px', color: '#666' }}>Other Charges</Text>}
                name="otherCharges"
                initialValue={0}
              >
                <InputNumber
                  min={0}
                  value={otherCharges}
                  onChange={(value) => setOtherCharges(value || 0)}
                  style={{ width: '100%' }}
                  prefix="₨"
                  placeholder="0"
                />
              </Form.Item>
            </Col>
          </Row>

          {selectedCustomer && (
            <div
              style={{
                padding: '12px 16px',
                background: '#f5f5f5',
                borderRadius: '4px',
                marginTop: '8px'
              }}
            >
              <Row gutter={16}>
                <Col span={8}>
                  <Text style={{ fontSize: '12px', color: '#666' }}>Customer: </Text>
                  <Text style={{ fontSize: '13px' }}>{selectedCustomer.partyName}</Text>
                </Col>
                <Col span={8}>
                  <Text style={{ fontSize: '12px', color: '#666' }}>Phone: </Text>
                  <Text style={{ fontSize: '13px' }}>{selectedCustomer.phone || 'N/A'}</Text>
                </Col>
                <Col span={8}>
                  <Text style={{ fontSize: '12px', color: '#666' }}>Default Rate: </Text>
                  <Text style={{ fontSize: '13px' }}>₨ {selectedCustomer.defaultRate}/Kg</Text>
                </Col>
              </Row>
            </div>
          )}
        </div>

        {/* Items Table */}
        <div style={{ padding: '20px 24px' }}>
          <Table
            columns={columns}
            dataSource={invoiceItems}
            rowKey="itemId"
            pagination={false}
            scroll={{ x: 900 }}
            bordered
            size="small"
            style={{
              border: '1px solid #e8e8e8',
              borderRadius: '4px',
              overflow: 'hidden'
            }}
          />
        </div>

        {/* Totals Section */}
        <div
          style={{
            padding: '20px 24px',
            background: '#fafafa',
            borderTop: '1px solid #e8e8e8',
            marginBottom: '10px'
          }}
        >
          <Row gutter={16}>
            <Col xs={12} sm={6}>
              <div style={{ textAlign: 'center', padding: '12px', background: '#fff', borderRadius: '4px' }}>
                <Text style={{ fontSize: '12px', color: '#666', display: 'block' }}>Total Qty</Text>
                <Text style={{ fontSize: '20px', fontWeight: '600', color: '#000' }}>{totals.totalQty}</Text>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div style={{ textAlign: 'center', padding: '12px', background: '#fff', borderRadius: '4px' }}>
                <Text style={{ fontSize: '12px', color: '#666', display: 'block' }}>Total Kg</Text>
                <Text style={{ fontSize: '20px', fontWeight: '600', color: '#000' }}>{totals.totalKg.toFixed(2)}</Text>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div style={{ textAlign: 'center', padding: '12px', background: '#fff', borderRadius: '4px' }}>
                <Text style={{ fontSize: '12px', color: '#666', display: 'block' }}>Total Amount</Text>
                <Text style={{ fontSize: '20px', fontWeight: '600', color: '#000' }}>
                  ₨ {totals.totalAmount.toLocaleString('en-PK', { maximumFractionDigits: 2 })}
                </Text>
              </div>
            </Col>
            <Col xs={12} sm={6}>
              <div style={{ textAlign: 'center', padding: '12px', background: '#000', borderRadius: '4px' }}>
                <Text style={{ fontSize: '12px', color: '#fff', display: 'block' }}>Grand Total</Text>
                <Text style={{ fontSize: '22px', fontWeight: '700', color: '#fff' }}>
                  ₨ {totals.grandTotal.toLocaleString('en-PK', { maximumFractionDigits: 2 })}
                </Text>
              </div>
            </Col>
          </Row>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: '#fff',
            padding: '16px 24px',
            borderTop: '1px solid #e8e8e8',
            textAlign: 'right',
            zIndex: 10
          }}
        >
          <Space size="middle">
            <Button size="large" onClick={() => onClose(false)}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              icon={<SaveOutlined />}
              loading={actionLoading}
              style={{ background: '#000', borderColor: '#000' }}
            >
              {invoice ? 'Update Invoice' : 'Save Invoice'}
            </Button>
          </Space>
        </div>
      </Form>
    </div>
  );
};

export default InvoiceForm;
