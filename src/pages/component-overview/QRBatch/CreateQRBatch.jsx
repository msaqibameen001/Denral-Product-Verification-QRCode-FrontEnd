import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Generate_QR_Preview,
    Confirm_And_Save_Batch,
    Generate_Serial_Numbers,
    Clear_QR_Preview
} from '../../../Redux/Action/QRBatchAction/QRBatchAction';
import { Fetch_Products } from '../../../Redux/Action/ProductsAction/ProductsAction';
import { Fetch_Print_Settings } from '../../../Redux/Action/PrintSettingsAction/PrintSettingsAction';
import {
    ArrowLeft, Trash2, Package, Eye, Save,
    CheckCircle2, QrCode as QrCodeIcon, Download,
    Box, Printer, Hash, Settings, Copy, AlertCircle,
    AlertTriangle, Lock, ShieldCheck
} from 'lucide-react';
import {
    Select, InputNumber, Input, DatePicker, Button, message, Tooltip, Modal
} from 'antd';
import dayjs from 'dayjs';
import { getUserData } from '../../../utils/authUtils';
import PrintSetupModal from './PrintSetupModal';

// ── DAYS OPTIONS for validity offset ──
const DAYS_OPTIONS = [
    { label: '20 Days', value: 20 },
    { label: '30 Days', value: 30 },
    { label: '33 Days', value: 33 },
    { label: '60 Days', value: 60 },
    { label: '90 Days', value: 90 },
    { label: '180 Days', value: 180 },
    { label: '1 Year (365)', value: 365 },
    { label: 'Custom', value: 'custom' },
];

// ── HELPER: compute validity date from purchase date + days ──
const computeValidityDate = (purchaseDate, days) => {
    if (!days || !purchaseDate) return '';
    const d = parseInt(days);
    if (isNaN(d) || d <= 0) return '';
    return dayjs(purchaseDate).add(d, 'day').format('YYYY-MM-DD');
};

const CreateQRBatch = () => {
    const dispatch = useDispatch();
    const { userId } = getUserData();
    const navigate = useNavigate();

    const { products } = useSelector((state) => state.product);
    const { previewData, previewLoading, actionLoading } = useSelector((state) => state.qrBatch);
    const { settings: printSettings } = useSelector((state) => state.printSettings);

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [serialItems, setSerialItems] = useState([]);
    const [showPrintSetup, setShowPrintSetup] = useState(false);

    // ── SAVE STATE TRACKING ──
    // isSaved: true only after Confirm & Save succeeds
    // previewGenerated: true after preview is generated (but not yet saved)
    const [isSaved, setIsSaved] = useState(false);
    const [previewGenerated, setPreviewGenerated] = useState(false);

    // ── UNSAVED LEAVE WARNING MODAL ──
    const [leaveWarningModal, setLeaveWarningModal] = useState(false);

    // ── PRINT BLOCKED MODAL (shown when user tries to print without saving) ──
    const [printBlockedModal, setPrintBlockedModal] = useState(false);

    // ── BULK WARRANTY DATA ──
    const [bulkWarranty, setBulkWarranty] = useState({
        warrantyDesc: '',
        warrantyTerm: '',
        purchaseDate: dayjs().format('YYYY-MM-DD'),
        validityDate: ''
    });

    // ── BULK DAYS OFFSET STATE ──
    const [bulkDaysMode, setBulkDaysMode] = useState('');
    const [bulkCustomDays, setBulkCustomDays] = useState('');

    // ── PER-ROW DAYS OFFSET STATE ──
    const [rowDaysMode, setRowDaysMode] = useState({});
    const [rowCustomDays, setRowCustomDays] = useState({});

    useEffect(() => {
        dispatch(Fetch_Products());
        dispatch(Fetch_Print_Settings());
    }, [dispatch]);

    useEffect(() => {
        dispatch(Clear_QR_Preview());
    }, []);

    // ── UNSAVED CHANGES: browser back/refresh warning ──
    // Only warn if something was generated but not saved
    useEffect(() => {
        const hasUnsavedWork = previewGenerated && !isSaved;

        const handleBeforeUnload = (e) => {
            if (hasUnsavedWork) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [previewGenerated, isSaved]);

    // ── BACK BUTTON HANDLER with unsaved warning ──
    const handleGoBack = () => {
        if (previewGenerated && !isSaved) {
            setLeaveWarningModal(true);
        } else {
            navigate('/qr-batch');
        }
    };

    // Confirm leave anyway
    const handleConfirmLeave = () => {
        setLeaveWarningModal(false);
        navigate('/qr-batch');
    };

    // Auto-set qty=1 and generate 1 serial when product selected
    const handleProductChange = async (value) => {
        setSelectedProduct(value);
        setQuantity(1);
        setIsSaved(false);
        setPreviewGenerated(false);
        try {
            const serials = await dispatch(Generate_Serial_Numbers(1));
            setSerialItems(serials.map((s) => ({
                serialNo: s,
                warrantyDesc: bulkWarranty.warrantyDesc,
                warrantyTerm: bulkWarranty.warrantyTerm,
                purchaseDate: bulkWarranty.purchaseDate,
                validityDate: bulkWarranty.validityDate
            })));
            setRowDaysMode({});
            setRowCustomDays({});
        } catch {
            message.error('Failed to generate serial numbers');
        }
    };

    const handleQuantityChange = async (newQty) => {
        const intQty = newQty ? Math.floor(Number(newQty)) : 1;
        if (!intQty || intQty <= 0) { setQuantity(1); return; }
        if (intQty > 100) { message.error('Maximum 100 items per batch'); setQuantity(100); return; }
        setQuantity(intQty);
        // Reset save/preview state when qty changes
        setIsSaved(false);
        setPreviewGenerated(false);
        try {
            const serials = await dispatch(Generate_Serial_Numbers(intQty));
            setSerialItems(serials.map((s) => ({
                serialNo: s,
                warrantyDesc: bulkWarranty.warrantyDesc,
                warrantyTerm: bulkWarranty.warrantyTerm,
                purchaseDate: bulkWarranty.purchaseDate,
                validityDate: bulkWarranty.validityDate
            })));
            setRowDaysMode({});
            setRowCustomDays({});
        } catch {
            message.error('Failed to generate serial numbers');
        }
    };

    // ── BULK WARRANTY HANDLERS ──
    const handleBulkWarrantyChange = (field, value) => {
        setBulkWarranty(prev => ({ ...prev, [field]: value }));
    };

    const handleBulkPurchaseDateChange = (date) => {
        const dateStr = date ? date.format('YYYY-MM-DD') : '';
        setBulkWarranty(prev => {
            const newState = { ...prev, purchaseDate: dateStr };
            if (bulkDaysMode && bulkDaysMode !== 'custom') {
                newState.validityDate = computeValidityDate(dateStr, bulkDaysMode);
            } else if (bulkDaysMode === 'custom' && bulkCustomDays) {
                newState.validityDate = computeValidityDate(dateStr, bulkCustomDays);
            }
            return newState;
        });
    };

    const handleBulkDaysModeChange = (val) => {
        setBulkDaysMode(val);
        if (val !== 'custom') {
            const vDate = computeValidityDate(bulkWarranty.purchaseDate, val);
            handleBulkWarrantyChange('validityDate', vDate);
        } else {
            handleBulkWarrantyChange('validityDate', '');
        }
    };

    const handleBulkCustomDaysChange = (val) => {
        const d = val ? Math.floor(Number(val)) : '';
        setBulkCustomDays(d);
        const vDate = computeValidityDate(bulkWarranty.purchaseDate, d);
        handleBulkWarrantyChange('validityDate', vDate);
    };

    const applyBulkToAll = () => {
        const updated = serialItems.map(item => ({
            ...item,
            warrantyDesc: bulkWarranty.warrantyDesc,
            warrantyTerm: bulkWarranty.warrantyTerm,
            purchaseDate: bulkWarranty.purchaseDate,
            validityDate: bulkWarranty.validityDate
        }));
        setSerialItems(updated);

        const newRowModes = {};
        const newRowCustom = {};
        serialItems.forEach((_, i) => {
            newRowModes[i] = bulkDaysMode;
            newRowCustom[i] = bulkCustomDays;
        });
        setRowDaysMode(newRowModes);
        setRowCustomDays(newRowCustom);

        message.success(`Bulk warranty data applied to all ${serialItems.length} serial(s)`);
    };

    const handleSerialItemChange = (index, field, value) => {
        const updated = [...serialItems];
        updated[index][field] = value;
        setSerialItems(updated);
    };

    const handleRowPurchaseDateChange = (index, date) => {
        const dateStr = date ? date.format('YYYY-MM-DD') : '';
        handleSerialItemChange(index, 'purchaseDate', dateStr);
        const mode = rowDaysMode[index];
        if (mode && mode !== 'custom') {
            const vDate = computeValidityDate(dateStr, mode);
            handleSerialItemChange(index, 'validityDate', vDate);
        } else if (mode === 'custom' && rowCustomDays[index]) {
            const vDate = computeValidityDate(dateStr, rowCustomDays[index]);
            handleSerialItemChange(index, 'validityDate', vDate);
        }
    };

    const handleRowDaysModeChange = (index, val) => {
        const updated = { ...rowDaysMode, [index]: val };
        setRowDaysMode(updated);
        if (val !== 'custom') {
            const vDate = computeValidityDate(serialItems[index]?.purchaseDate, val);
            handleSerialItemChange(index, 'validityDate', vDate);
            setRowCustomDays(prev => ({ ...prev, [index]: '' }));
        } else {
            handleSerialItemChange(index, 'validityDate', '');
        }
    };

    const handleRowCustomDaysChange = (index, val) => {
        const d = val ? Math.floor(Number(val)) : '';
        setRowCustomDays(prev => ({ ...prev, [index]: d }));
        const vDate = computeValidityDate(serialItems[index]?.purchaseDate, d);
        handleSerialItemChange(index, 'validityDate', vDate);
    };

    const handleRemoveItem = (index) => {
        const updated = serialItems.filter((_, i) => i !== index);
        setSerialItems(updated);
        setQuantity(updated.length);
        // Reset save/preview state since items changed
        setIsSaved(false);
        setPreviewGenerated(false);
        const newRowModes = {};
        const newRowCustom = {};
        Object.keys(rowDaysMode).forEach(k => {
            const ki = parseInt(k);
            if (ki < index) { newRowModes[ki] = rowDaysMode[ki]; }
            else if (ki > index) { newRowModes[ki - 1] = rowDaysMode[ki]; }
        });
        Object.keys(rowCustomDays).forEach(k => {
            const ki = parseInt(k);
            if (ki < index) { newRowCustom[ki] = rowCustomDays[ki]; }
            else if (ki > index) { newRowCustom[ki - 1] = rowCustomDays[ki]; }
        });
        setRowDaysMode(newRowModes);
        setRowCustomDays(newRowCustom);
    };

    const handleGeneratePreview = async () => {
        if (!selectedProduct) { message.error('Please select a product'); return; }
        if (serialItems.length === 0) { message.error('Please add at least one serial item'); return; }
        const missingValidity = serialItems.findIndex(item => !item.validityDate);
        if (missingValidity !== -1) {
            message.error(`Serial #${missingValidity + 1} (${serialItems[missingValidity].serialNo}) has no validity date`);
            return;
        }
        try {
            await dispatch(Generate_QR_Preview({
                productId: parseInt(selectedProduct),
                quantity: serialItems.length,
                serialItems: serialItems.map(item => ({
                    ...item,
                    purchaseDate: item.purchaseDate || null,
                    validityDate: item.validityDate || null
                }))
            }));
            // Mark preview as generated, but NOT saved yet
            setPreviewGenerated(true);
            setIsSaved(false);
            message.success('Preview generated — please Confirm & Save before printing');
            setTimeout(() => {
                document.getElementById('qr-preview-section')?.scrollIntoView({ behavior: 'smooth' });
            }, 300);
        } catch { }
    };

    const handleConfirmSave = async () => {
        if (!previewData) { message.error('Please generate preview first'); return; }
        const invalidItems = serialItems
            .map((item, i) => ({ item, i }))
            .filter(({ item }) => !item.validityDate || !item.purchaseDate);

        if (invalidItems.length > 0) {
            const first = invalidItems[0];
            message.error({
                content: `Serial #${first.i + 1} (${first.item.serialNo}): Purchase date aur Validity date are required.`,
                duration: 4,
            });
            return;
        }
        try {
            await dispatch(Confirm_And_Save_Batch({
                productId: parseInt(selectedProduct),
                serialItems: serialItems.map(item => ({
                    ...item,
                    purchaseDate: item.purchaseDate || null,
                    validityDate: item.validityDate || null
                })),
                createdBy: userId
            }));
            // Mark as saved — now print is allowed
            setIsSaved(true);
            message.success('Batch saved successfully! You can now print.');
            setTimeout(() => {
                document.getElementById('qr-preview-section')?.scrollIntoView({ behavior: 'smooth' });
            }, 200);
        } catch { }
    };

    const downloadQRCode = (qrCode, serialNo, type) => {
        try {
            const link = document.createElement('a');
            link.href = `data:image/png;base64,${qrCode.qrImageBase64}`;
            const label = type === 'product' ? 'warranty-card' : type;
            link.download = `${serialNo}_${label}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch {
            message.error('Failed to download');
        }
    };

    // ── PRINT: only allowed after isSaved ──
    const handlePrint = () => {
        // BLOCK: if preview exists but not saved yet
        if (previewData && !isSaved) {
            setPrintBlockedModal(true);
            return;
        }

        if (!previewData?.serials?.length) {
            message.error('No QR codes to print. Generate preview first.');
            return;
        }

        const productName = previewData.productName || 'Product';
        const batchDate = dayjs().format('DD MMM YYYY');

        const cfg = printSettings || {
            showSerialNo: true,
            showProduct: true,
            showWarranty: true,
            showPurchase: true,
            showValidity: true
        };

        // ─────────────────────────────────────────────────────────────────────────
        // COLLECT ALL QR CODES WITH METADATA
        // ─────────────────────────────────────────────────────────────────────────
        let qrItems = [];

        previewData.serials.forEach((serial) => {
            const productQR = serial.qrCodes?.find(q => q.qrType === 'product');
            const boxQR = serial.qrCodes?.find(q => q.qrType === 'box');

            const textLines = [];

            if (cfg.showSerialNo) {
                textLines.push({ type: 'serial', value: serial.serialNo });
            }
            if (cfg.showProduct) {
                textLines.push({ type: 'product', value: productName });
            }
            if (cfg.showWarranty && serial.warrantyDesc) {
                const warrantyText = `${serial.warrantyDesc}${serial.warrantyTerm ? ' ' + serial.warrantyTerm : ''}`;
                textLines.push({ type: 'warranty', label: 'WARRANTY', value: warrantyText });
            }
            if (cfg.showPurchase && serial.purchaseDate) {
                textLines.push({
                    type: 'purchase',
                    label: 'PURCHASE',
                    value: dayjs(serial.purchaseDate).format('DD MMM YYYY')
                });
            }
            if (cfg.showValidity && serial.validityDate) {
                textLines.push({
                    type: 'validity',
                    label: 'VALID',
                    value: dayjs(serial.validityDate).format('DD MMM YYYY')
                });
            }

            if (productQR) {
                qrItems.push({
                    base64: productQR.qrImageBase64,
                    type: 'product',
                    label: 'SCAN FOR WARRANTY',
                    textLines: textLines
                });
            }
            if (boxQR) {
                qrItems.push({
                    base64: boxQR.qrImageBase64,
                    type: 'box',
                    label: 'SCAN FOR WARRANTY',
                    textLines: textLines
                });
            }
        });

        // ─────────────────────────────────────────────────────────────────────────
        // BUILD HTML FOR LABELS (2 per row)
        // ─────────────────────────────────────────────────────────────────────────
        function generateSingleLabel(qr) {
            if (!qr) return '<div class="label-cell"></div>';

            let textHtml = '';
            qr.textLines.forEach(line => {
                if (line.type === 'serial') {
                    textHtml += `<div class="text-serial">${line.value}</div>`;
                } else if (line.type === 'product') {
                    textHtml += `<div class="text-product">${line.value}</div>`;
                } else {
                    textHtml += `<div class="text-field"><span class="text-label">${line.label}:</span> <span class="text-value">${line.value}</span></div>`;
                }
            });

            return `
        <div class="label-cell">
            <div class="qr-container">
                <img src="data:image/png;base64,${qr.base64}" alt="QR Code" class="qr-image">
                <div class="qr-label">${qr.label}</div>
            </div>
            <div class="text-container">
                ${textHtml}
            </div>
        </div>`;
        }

        let labelsHtml = '';
        for (let i = 0; i < qrItems.length; i += 2) {
            const leftQR = qrItems[i];
            const rightQR = qrItems[i + 1] || null;
            labelsHtml += `
        <div class="label-row">
            ${generateSingleLabel(leftQR)}
            ${rightQR ? generateSingleLabel(rightQR) : '<div class="label-cell"></div>'}
        </div>`;
        }

        // ─────────────────────────────────────────────────────────────────────────
        // FINAL PRINT HTML
        // ─────────────────────────────────────────────────────────────────────────
        const printHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>QR Labels - ${productName}</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }

@page {
    size: 100mm 25mm;
    margin: 0;
    marks: none;
}

@media print {
    @page { size: 100mm 25mm; margin: 0; marks: none; }
    body { margin: 0 !important; padding: 0 !important; }
    .no-print { display: none !important; }
}

body {
    margin: 0; padding: 0;
    font-family: 'Arial', 'Helvetica', sans-serif;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
}

.label-row {
    width: 100mm; height: 25mm;
    display: flex;
    page-break-after: always;
    page-break-inside: avoid;
    break-after: page;
    break-inside: avoid;
}

.label-cell {
    width: 50mm; height: 25mm;
    display: flex; align-items: stretch;
    gap: 1.5mm; padding: 1.5mm;
    background: #fff; position: relative;
}

.qr-container {
    width: 21mm; flex-shrink: 0;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
}

.qr-image {
    width: 20mm; height: 20mm;
    display: block; margin: 0 auto;
}

.qr-label {
    font-size: 5pt; font-weight: 700;
    text-align: center; margin-top: 0.5mm;
    text-transform: uppercase; letter-spacing: 0.1mm;
    color: #000; line-height: 1.1;
}

.text-container {
    flex: 1; min-width: 0;
    display: flex; flex-direction: column;
    justify-content: center; gap: 0.8mm;
}

.text-serial {
    font-family: 'Courier New', monospace;
    font-size: 7pt; font-weight: 700; color: #000;
    letter-spacing: 0.2mm; line-height: 1.1; margin-bottom: 0.5mm;
}

.text-product {
    font-size: 7pt; font-weight: 700; color: #000;
    line-height: 1.1; margin-bottom: 0.5mm;
}

.text-field { font-size: 5.5pt; line-height: 1.2; color: #000; margin-top: 0.3mm; }
.text-label { font-weight: 700; text-transform: uppercase; letter-spacing: 0.1mm; }
.text-value { font-weight: 400; }

@media screen {
    body { padding: 20px; background: #f0f0f0; }
    .label-row { margin-bottom: 10px; border: 1px dashed #999; }
    .label-cell { border-right: 1px dashed #ccc; }
    .label-cell:last-child { border-right: none; }
    .print-header {
        background: #fff; padding: 15px 20px; margin-bottom: 20px;
        border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        display: flex; justify-content: space-between; align-items: center;
    }
    .print-btn {
        background: #000; color: #fff; border: none;
        padding: 10px 20px; border-radius: 6px;
        cursor: pointer; font-weight: 600; font-size: 14px;
    }
    .print-btn:hover { background: #333; }
}

@media print {
    .print-header { display: none !important; }
    html, body { width: 100mm; height: auto; }
    .label-row { page-break-after: always; break-after: page; }
    .label-row:last-child { page-break-after: auto; break-after: auto; }
}
</style>
</head>
<body>

<div class="print-header no-print">
    <div>
        <h2 style="margin: 0; font-size: 18px;">QR Labels — ${productName}</h2>
        <p style="margin: 5px 0 0 0; color: #666; font-size: 13px;">${qrItems.length} labels | ${batchDate}</p>
    </div>
    <button class="print-btn" onclick="window.print()">🖨️ Print Labels</button>
</div>

${labelsHtml}

</body>
</html>`;

        // ─────────────────────────────────────────────────────────────────────────
        // OPEN PRINT WINDOW
        // ─────────────────────────────────────────────────────────────────────────
        const printWindow = window.open('', '_blank', 'width=800,height=600');

        if (printWindow) {
            printWindow.document.write(printHTML);
            printWindow.document.close();
            printWindow.onload = function () {
                printWindow.document.title = '';
                setTimeout(() => {
                    printWindow.print();
                }, 800);
            };
        } else {
            message.error('Please allow popups to print labels');
        }
    };

    // ─────────────────────────────────────────────
    // STYLES
    // ─────────────────────────────────────────────
    const card = {
        background: '#fff',
        border: '1px solid #e8e8e8',
        borderRadius: 10,
        marginBottom: 16
    };
    const cardBody = { padding: '20px 24px' };
    const sectionHead = {
        display: 'flex', alignItems: 'center', gap: 8,
        marginBottom: 18, paddingBottom: 14,
        borderBottom: '1px solid #f2f2f2'
    };
    const sectionIcon = {
        width: 28, height: 28, background: '#f4f4f4',
        borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center'
    };
    const fieldLabel = {
        display: 'block', fontSize: 11, fontWeight: 700, color: '#999',
        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6
    };

    // Determine print button state
    const canPrint = isSaved && previewData;
    const printButtonDisabled = !canPrint;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sofia+Sans:wght@300;400;500;600;700&display=swap');
                .cqb, .cqb * { font-family: 'Sofia Sans', sans-serif !important; }

                .cqb .ant-select-selector { border-radius: 6px !important; border-color: #e0e0e0 !important; }
                .cqb .ant-select-selector:hover { border-color: #bbb !important; }
                .cqb .ant-select-focused .ant-select-selector { border-color: #555 !important; box-shadow: 0 0 0 2px rgba(0,0,0,0.05) !important; }
                .cqb .ant-input { border-radius: 6px !important; border-color: #e0e0e0 !important; font-size: 13px !important; }
                .cqb .ant-input:hover { border-color: #bbb !important; }
                .cqb .ant-input:focus { border-color: #555 !important; box-shadow: 0 0 0 2px rgba(0,0,0,0.05) !important; }
                .cqb .ant-input-number { border-radius: 6px !important; border-color: #e0e0e0 !important; }
                .cqb .ant-input-number:hover { border-color: #bbb !important; }
                .cqb .ant-picker { border-radius: 6px !important; border-color: #e0e0e0 !important; }
                .cqb .ant-picker:hover { border-color: #bbb !important; }
                .cqb .ant-btn { font-family: 'Sofia Sans', sans-serif !important; border-radius: 7px !important; font-size: 13px !important; font-weight: 600 !important; }

                .stbl { width: 100%; border-collapse: collapse; }
                .stbl thead tr { border-bottom: 1.5px solid #e8e8e8; }
                .stbl thead th {
                    font-size: 10.5px; font-weight: 700; color: #aaa;
                    text-transform: uppercase; letter-spacing: 0.5px;
                    padding: 0 8px 10px; text-align: left; white-space: nowrap;
                }
                .stbl thead th:first-child { padding-left: 0; width: 32px; }
                .stbl thead th:last-child { width: 36px; }
                .stbl tbody tr { border-bottom: 1px solid #f4f4f4; }
                .stbl tbody tr:last-child { border-bottom: none; }
                .stbl tbody td { padding: 8px 8px; vertical-align: top; }
                .stbl tbody td:first-child { padding-left: 0; }

                .prev-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
                .pqc { border: 1px solid #ebebeb; border-radius: 8px; overflow: hidden; background: #fff; transition: border-color .15s, box-shadow .15s; }
                .pqc:hover { border-color: #bbb; box-shadow: 0 2px 8px rgba(0,0,0,.06); }
                .pqc-bar { height: 3px; background: #111; }
                .pqc-bar.box { background: #777; }
                .pqc-img { padding: 12px; background: #fafafa; border-bottom: 1px solid #f2f2f2; }
                .pqc-img img { width: 100%; display: block; }
                .pqc-body { padding: 8px 10px 10px; }
                .pqc-sn { font-family: 'Courier New', monospace; font-size: 9.5px; font-weight: 700; color: #111; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .pqc-foot { display: flex; align-items: center; justify-content: space-between; }
                .pqc-tag { display: inline-flex; align-items: center; gap: 3px; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 3px; }
                .pqc-tag.product { background: #111; color: #fff; }
                .pqc-tag.box { background: #f0f0f0; color: #555; }
                .pqc-dl { opacity: 0; transition: opacity .15s; background: none; border: none; cursor: pointer; padding: 2px; display: flex; align-items: center; }
                .pqc:hover .pqc-dl { opacity: 1; }

                .btn-prev { height: 40px !important; border-color: #d0d0d0 !important; color: #333 !important; background: #fff !important; }
                .btn-prev:hover { border-color: #888 !important; color: #111 !important; }
                .btn-save { height: 40px !important; background: #111 !important; border-color: #111 !important; color: #fff !important; }
                .btn-save:hover { background: #333 !important; border-color: #333 !important; }

                /* Print button: disabled state vs enabled state */
                .btn-prnt {
                    height: 33px !important;
                    border-color: #d0d0d0 !important;
                    color: #555 !important;
                    background: #fff !important;
                    transition: all .12s !important;
                }
                .btn-prnt:hover:not(:disabled) { border-color: #111 !important; color: #111 !important; }
                .btn-prnt-active {
                    height: 33px !important;
                    border-color: #111 !important;
                    color: #111 !important;
                    background: #fff !important;
                }
                .btn-prnt-active:hover { background: #111 !important; color: #fff !important; }

                /* Disabled print button */
                .btn-prnt-locked {
                    height: 33px !important;
                    border-color: #e0e0e0 !important;
                    color: #ccc !important;
                    background: #fafafa !important;
                    cursor: not-allowed !important;
                    pointer-events: all !important;
                }

                .sbar { display: flex; align-items: center; gap: 10px; background: #f6fef9; border: 1px solid #b7ebc8; border-radius: 8px; padding: 11px 16px; margin-bottom: 18px; }
                .sbar-saved { display: flex; align-items: center; gap: 10px; background: #f0f8ff; border: 1px solid #90caf9; border-radius: 8px; padding: 11px 16px; margin-bottom: 18px; }

                .hint { background: #f8f8f8; border: 1px solid #ebebeb; border-radius: 7px; padding: 10px 14px; font-size: 12px; color: #888; line-height: 1.6; }
                .hint strong { color: #555; }

                .back-btn:hover { border-color: #999 !important; }

                /* BULK WARRANTY SECTION */
                .bulk-section {
                    background: #fafafa;
                    border: 1.5px dashed #d0d0d0;
                    border-radius: 10px;
                    padding: 16px 18px;
                    margin-bottom: 16px;
                }
                .bulk-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 14px;
                }
                .bulk-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    font-weight: 700;
                    color: #555;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .apply-bulk-btn {
                    height: 30px !important;
                    background: #111 !important;
                    border-color: #111 !important;
                    color: #fff !important;
                    font-size: 12px !important;
                }
                .apply-bulk-btn:hover {
                    background: #333 !important;
                    border-color: #333 !important;
                }
                .bulk-notice {
                    background: #fff3cd;
                    border: 1px solid #ffd966;
                    border-radius: 6px;
                    padding: 8px 12px;
                    margin-top: 12px;
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                }
                .bulk-notice-text {
                    font-size: 11px;
                    color: #856404;
                    line-height: 1.5;
                }

                /* validity date preview badge */
                .validity-preview {
                    font-size: 10px;
                    color: #3a9e60;
                    margin-top: 4px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 3px;
                }

                /* UNSAVED BANNER */
                .unsaved-banner {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: #fff8e1;
                    border: 1px solid #ffe082;
                    border-radius: 8px;
                    padding: 10px 14px;
                    margin-bottom: 12px;
                    font-size: 12px;
                    color: #7a5600;
                }
                .unsaved-banner strong { color: #5d4000; }

                /* SAVED BADGE in preview header */
                .saved-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    background: #e8f5e9;
                    border: 1px solid #a5d6a7;
                    border-radius: 5px;
                    padding: 3px 10px;
                    font-size: 11px;
                    font-weight: 700;
                    color: #2e7d32;
                }

                /* Custom Modal styles */
                .warn-modal-icon {
                    width: 52px; height: 52px;
                    border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    margin: 0 auto 16px;
                }
                .warn-modal-title {
                    font-size: 16px;
                    font-weight: 700;
                    color: #111;
                    text-align: center;
                    margin-bottom: 8px;
                    font-family: 'Sofia Sans', sans-serif;
                }
                .warn-modal-body {
                    font-size: 13px;
                    color: #666;
                    text-align: center;
                    line-height: 1.6;
                    font-family: 'Sofia Sans', sans-serif;
                }
                .warn-modal-list {
                    background: #f9f9f9;
                    border: 1px solid #ececec;
                    border-radius: 8px;
                    padding: 12px 16px;
                    margin: 14px 0;
                    text-align: left;
                }
                .warn-modal-list-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                    font-size: 12px;
                    color: #555;
                    line-height: 1.5;
                    margin-bottom: 6px;
                    font-family: 'Sofia Sans', sans-serif;
                }
                .warn-modal-list-item:last-child { margin-bottom: 0; }
            `}</style>

            {/* ── LEAVE WARNING MODAL ── */}
            <Modal
                open={leaveWarningModal}
                footer={null}
                closable={false}
                width={420}
                centered
                zIndex={9999}
                styles={{ body: { padding: '28px 24px 20px' } }}
            >
                <div className="warn-modal-icon" style={{ background: '#fff3e0' }}>
                    <AlertTriangle size={26} strokeWidth={2} color="#e65100" />
                </div>
                <div className="warn-modal-title">Unsaved QR Batch</div>
                <div className="warn-modal-body">
                    You have generated QR codes that have <strong>not been saved</strong> yet. If you leave now, all this data will be permanently lost.
                </div>
                <div className="warn-modal-list">
                    <div className="warn-modal-list-item">
                        <AlertCircle size={13} strokeWidth={2} color="#e65100" style={{ flexShrink: 0, marginTop: 2 }} />
                        Generated serial numbers will be discarded
                    </div>
                    <div className="warn-modal-list-item">
                        <AlertCircle size={13} strokeWidth={2} color="#e65100" style={{ flexShrink: 0, marginTop: 2 }} />
                        QR codes will not be saved to the database
                    </div>
                    <div className="warn-modal-list-item">
                        <AlertCircle size={13} strokeWidth={2} color="#e65100" style={{ flexShrink: 0, marginTop: 2 }} />
                        Warranty & validity data will be lost
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                    <Button
                        style={{
                            flex: 1, height: 38,
                            borderColor: '#d0d0d0', color: '#555',
                            fontFamily: 'Sofia Sans, sans-serif', fontWeight: 600,
                            borderRadius: 7, fontSize: 13
                        }}
                        onClick={() => setLeaveWarningModal(false)}
                    >
                        Stay & Save
                    </Button>
                    <Button
                        danger
                        style={{
                            flex: 1, height: 38,
                            fontFamily: 'Sofia Sans, sans-serif', fontWeight: 600,
                            borderRadius: 7, fontSize: 13
                        }}
                        onClick={handleConfirmLeave}
                    >
                        Leave Anyway
                    </Button>
                </div>
            </Modal>

            {/* ── PRINT BLOCKED MODAL ── */}
            <Modal
                open={printBlockedModal}
                footer={null}
                closable={false}
                width={400}
                centered
                zIndex={9999}
                styles={{ body: { padding: '28px 24px 20px' } }}
            >
                <div className="warn-modal-icon" style={{ background: '#fce4ec' }}>
                    <Lock size={24} strokeWidth={2} color="#c62828" />
                </div>
                <div className="warn-modal-title">Save Before Printing</div>
                <div className="warn-modal-body">
                    Printing is only allowed after the batch is confirmed and saved. This ensures QR codes are verified and linked to your database.
                </div>
                <div className="warn-modal-list">
                    <div className="warn-modal-list-item">
                        <AlertCircle size={13} strokeWidth={2} color="#c62828" style={{ flexShrink: 0, marginTop: 2 }} />
                        Unsaved QR codes would scan as <strong>unverified</strong>
                    </div>
                    <div className="warn-modal-list-item">
                        <AlertCircle size={13} strokeWidth={2} color="#c62828" style={{ flexShrink: 0, marginTop: 2 }} />
                        Product data won't be linked until saved
                    </div>
                    <div className="warn-modal-list-item">
                        <AlertCircle size={13} strokeWidth={2} color="#c62828" style={{ flexShrink: 0, marginTop: 2 }} />
                        Warranty info won't be accessible on scan
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                    <Button
                        style={{
                            flex: 1, height: 38,
                            borderColor: '#d0d0d0', color: '#555',
                            fontFamily: 'Sofia Sans, sans-serif', fontWeight: 600,
                            borderRadius: 7, fontSize: 13
                        }}
                        onClick={() => setPrintBlockedModal(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        style={{
                            flex: 1, height: 38,
                            background: '#111', borderColor: '#111', color: '#fff',
                            fontFamily: 'Sofia Sans, sans-serif', fontWeight: 600,
                            borderRadius: 7, fontSize: 13
                        }}
                        onClick={() => {
                            setPrintBlockedModal(false);
                            handleConfirmSave();
                        }}
                        loading={actionLoading}
                    >
                        Confirm & Save Now
                    </Button>
                </div>
            </Modal>

            <PrintSetupModal visible={showPrintSetup} onClose={() => setShowPrintSetup(false)} />

            <div className="cqb" style={{ minHeight: '100vh', background: '#F5F5F5', fontFamily: 'Sofia Sans, sans-serif' }}>

                {/* ── HEADER ── */}
                <div style={{ background: '#fff', borderBottom: '1px solid #e8e8e8' }}>
                    <div style={{ maxWidth: 1100, margin: '0 auto', height: 56, display: 'flex', alignItems: 'center', gap: 14 }}>
                        <button
                            className="back-btn"
                            onClick={handleGoBack}
                            style={{ width: 32, height: 32, border: '1px solid #e0e0e0', borderRadius: 7, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                        >
                            <ArrowLeft size={15} strokeWidth={2} color="#555" />
                        </button>
                        <div style={{ width: 1, height: 18, background: '#e8e8e8' }} />
                        <div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: '#111', letterSpacing: '-0.3px' }}>Generate QR Codes</div>
                            <div style={{ fontSize: 12, color: '#aaa', marginTop: 1 }}>Create new QR code batch for products</div>
                        </div>
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                            {/* Unsaved indicator in header */}
                            {previewGenerated && !isSaved && (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 5,
                                    background: '#fff8e1', border: '1px solid #ffe082',
                                    borderRadius: 6, padding: '4px 10px',
                                    fontSize: 11, fontWeight: 700, color: '#7a5600'
                                }}>
                                    <AlertTriangle size={11} strokeWidth={2.5} />
                                    Unsaved
                                </div>
                            )}
                            {isSaved && (
                                <div className="saved-badge">
                                    <ShieldCheck size={12} strokeWidth={2} />
                                    Saved
                                </div>
                            )}
                            <Tooltip title="Configure global print layout & labels" placement="left">
                                <button
                                    onClick={() => setShowPrintSetup(true)}
                                    style={{
                                        height: 34, padding: '0 14px',
                                        border: '1px solid #e0e0e0', borderRadius: 7,
                                        background: '#fff', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: 7,
                                        fontSize: 12, fontWeight: 600, color: '#555',
                                        fontFamily: 'Sofia Sans, sans-serif', transition: 'all .12s'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#999'; e.currentTarget.style.color = '#111'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#e0e0e0'; e.currentTarget.style.color = '#555'; }}
                                >
                                    <Settings size={14} strokeWidth={1.8} />
                                    Print Setup
                                </button>
                            </Tooltip>

                            {/* Print button in header — only enabled after save */}
                            {previewData && (
                                <Tooltip
                                    title={!isSaved ? 'Please Confirm & Save the batch before printing' : 'Print batch QR codes'}
                                    placement="left"
                                >
                                    <Button
                                        className={canPrint ? 'btn-prnt-active' : 'btn-prnt-locked'}
                                        icon={canPrint
                                            ? <Printer size={14} strokeWidth={1.8} />
                                            : <Lock size={13} strokeWidth={1.8} />
                                        }
                                        onClick={handlePrint}
                                        style={{ height: 34 }}
                                    >
                                        {canPrint ? 'Print Batch' : 'Print Locked'}
                                    </Button>
                                </Tooltip>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── PAGE CONTENT ── */}
                <div style={{ maxWidth: 1150, margin: '0 auto', padding: '8px 0px' }}>

                    {/* Card 1: Product Info */}
                    <div style={card}>
                        <div style={cardBody}>
                            <div style={sectionHead}>
                                <div style={sectionIcon}><Package size={14} strokeWidth={1.8} color="#666" /></div>
                                <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>Product Information</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 16, alignItems: 'end' }}>
                                <div>
                                    <label style={fieldLabel}>Select Product <span style={{ color: '#e53535' }}>*</span></label>
                                    <Select
                                        size="medium"
                                        placeholder="Choose a product"
                                        value={selectedProduct}
                                        onChange={handleProductChange}
                                        style={{ width: '100%' }}
                                        options={products.map(p => ({ label: p.name, value: p.id }))}
                                    />
                                </div>
                                <div>
                                    <label style={fieldLabel}>Quantity <span style={{ color: '#e53535' }}>*</span></label>
                                    <InputNumber
                                        size="medium"
                                        min={1}
                                        max={100}
                                        value={quantity}
                                        onChange={handleQuantityChange}
                                        placeholder="1"
                                        disabled={!selectedProduct}
                                        style={{ width: '100%' }}
                                        precision={0}
                                        parser={(value) => {
                                            const parsed = parseInt((value || '').replace(/[^\d]/g, ''), 10);
                                            return isNaN(parsed) ? 1 : parsed;
                                        }}
                                    />
                                </div>
                            </div>
                            {!selectedProduct && (
                                <div className="hint" style={{ marginTop: 14 }}>
                                    Select a product first — serial numbers will be auto-generated with qty set to 1.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Card 1.5: BULK WARRANTY DATA */}
                    {selectedProduct && serialItems.length > 0 && (
                        <div style={card}>
                            <div style={cardBody}>
                                <div className="bulk-section">
                                    <div className="bulk-header">
                                        <div className="bulk-title">
                                            <Copy size={13} strokeWidth={2} />
                                            Bulk Warranty Data
                                        </div>
                                        <Button
                                            className="apply-bulk-btn"
                                            size="small"
                                            onClick={applyBulkToAll}
                                            icon={<Copy size={12} strokeWidth={2} />}
                                        >
                                            Apply to All {serialItems.length} Serials
                                        </Button>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                        <div>
                                            <label style={fieldLabel}>Warranty Description</label>
                                            <Input
                                                size="medium"
                                                value={bulkWarranty.warrantyDesc}
                                                onChange={(e) => handleBulkWarrantyChange('warrantyDesc', e.target.value)}
                                                placeholder="e.g., 1 Year Warranty"
                                            />
                                        </div>
                                        <div>
                                            <label style={fieldLabel}>Warranty Term</label>
                                            <Input
                                                size="medium"
                                                value={bulkWarranty.warrantyTerm}
                                                onChange={(e) => handleBulkWarrantyChange('warrantyTerm', e.target.value)}
                                                placeholder="e.g., 12 months"
                                            />
                                        </div>
                                        <div>
                                            <label style={fieldLabel}>Purchase Date</label>
                                            <DatePicker
                                                size="medium"
                                                value={bulkWarranty.purchaseDate ? dayjs(bulkWarranty.purchaseDate) : null}
                                                onChange={handleBulkPurchaseDateChange}
                                                format="DD MMM YYYY"
                                                style={{ width: '100%' }}
                                            />
                                        </div>

                                        <div>
                                            <label style={fieldLabel}>Validity Date (Days from Purchase)</label>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <Select
                                                    size="middle"
                                                    placeholder="Select days offset"
                                                    value={bulkDaysMode || undefined}
                                                    onChange={handleBulkDaysModeChange}
                                                    options={DAYS_OPTIONS}
                                                    style={{ flex: 1 }}
                                                    allowClear
                                                    onClear={() => {
                                                        setBulkDaysMode('');
                                                        setBulkCustomDays('');
                                                        handleBulkWarrantyChange('validityDate', '');
                                                    }}
                                                />
                                                {bulkDaysMode === 'custom' && (
                                                    <InputNumber
                                                        size="middle"
                                                        min={1}
                                                        precision={0}
                                                        parser={(v) => {
                                                            const parsed = parseInt((v || '').replace(/[^\d]/g, ''), 10);
                                                            return isNaN(parsed) ? 1 : parsed;
                                                        }}
                                                        placeholder="Days"
                                                        value={bulkCustomDays || undefined}
                                                        onChange={handleBulkCustomDaysChange}
                                                        style={{ width: 90 }}
                                                    />
                                                )}
                                            </div>
                                            {bulkWarranty.validityDate && (
                                                <div className="validity-preview">
                                                    ✓ {dayjs(bulkWarranty.validityDate).format('DD MMM YYYY')}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bulk-notice">
                                        <AlertCircle size={14} strokeWidth={2} color="#856404" style={{ flexShrink: 0, marginTop: 1 }} />
                                        <div className="bulk-notice-text">
                                            <strong>How it works:</strong> Select days offset — validity date is auto-calculated from purchase date. Click "Apply to All" to populate all serial rows. You can still edit individual rows below.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Card 2: Serial Details Table */}
                    {serialItems.length > 0 && (
                        <div style={card}>
                            <div style={cardBody}>
                                <div style={sectionHead}>
                                    <div style={sectionIcon}><Hash size={14} strokeWidth={1.8} color="#666" /></div>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>Serial Details</span>
                                    <div style={{ marginLeft: 'auto', background: '#111', color: '#fff', borderRadius: 4, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>
                                        {serialItems.length} {serialItems.length === 1 ? 'item' : 'items'}
                                    </div>
                                </div>

                                <div style={{ overflowX: 'auto' }}>
                                    <table className="stbl">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Serial No</th>
                                                <th>Warranty Desc</th>
                                                <th>Warranty Term</th>
                                                <th>Purchase Date</th>
                                                <th>Validity (Days)</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {serialItems.map((item, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        <div style={{ width: 22, height: 22, background: '#f0f0f0', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#777' }}>
                                                            {index + 1}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span style={{ fontFamily: 'Courier New, monospace', fontSize: 11.5, fontWeight: 700, color: '#111', letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>
                                                            {item.serialNo}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <Input size="medium" value={item.warrantyDesc}
                                                            onChange={(e) => handleSerialItemChange(index, 'warrantyDesc', e.target.value)}
                                                            placeholder="e.g., 1 Year Warranty"
                                                            style={{ minWidth: 150 }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <Input size="medium" value={item.warrantyTerm}
                                                            onChange={(e) => handleSerialItemChange(index, 'warrantyTerm', e.target.value)}
                                                            placeholder="e.g., 12 months"
                                                            style={{ minWidth: 120 }}
                                                        />
                                                    </td>
                                                    <td>
                                                        <DatePicker size="medium"
                                                            value={item.purchaseDate ? dayjs(item.purchaseDate) : null}
                                                            onChange={(date) => handleRowPurchaseDateChange(index, date)}
                                                            format="DD MMM YYYY"
                                                            style={{ minWidth: 130 }}
                                                        />
                                                    </td>

                                                    <td>
                                                        <div style={{ display: 'flex', gap: 5, minWidth: 210 }}>
                                                            <Select
                                                                size="middle"
                                                                placeholder="Select days"
                                                                value={rowDaysMode[index] || undefined}
                                                                onChange={(val) => handleRowDaysModeChange(index, val)}
                                                                options={DAYS_OPTIONS}
                                                                style={{ width: 135 }}
                                                                allowClear
                                                                onClear={() => {
                                                                    setRowDaysMode(prev => ({ ...prev, [index]: '' }));
                                                                    setRowCustomDays(prev => ({ ...prev, [index]: '' }));
                                                                    handleSerialItemChange(index, 'validityDate', '');
                                                                }}
                                                            />
                                                            {rowDaysMode[index] === 'custom' && (
                                                                <InputNumber
                                                                    size="middle"
                                                                    min={1}
                                                                    precision={0}
                                                                    parser={(v) => {
                                                                        const parsed = parseInt((v || '').replace(/[^\d]/g, ''), 10);
                                                                        return isNaN(parsed) ? 1 : parsed;
                                                                    }}
                                                                    placeholder="Days"
                                                                    value={rowCustomDays[index] || undefined}
                                                                    onChange={(val) => handleRowCustomDaysChange(index, val)}
                                                                    style={{ width: 70 }}
                                                                />
                                                            )}
                                                        </div>
                                                        {item.validityDate && (
                                                            <div className="validity-preview" style={{ marginTop: 3 }}>
                                                                ✓ {dayjs(item.validityDate).format('DD MMM YYYY')}
                                                            </div>
                                                        )}
                                                    </td>

                                                    <td>
                                                        <Button type="text" danger size="small"
                                                            icon={<Trash2 size={13} strokeWidth={1.8} />}
                                                            onClick={() => handleRemoveItem(index)}
                                                            style={{ opacity: 0.45 }}
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    {serialItems.length > 0 && (
                        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                            <Button
                                className="btn-prev"
                                icon={<Eye size={14} strokeWidth={1.8} />}
                                onClick={handleGeneratePreview}
                                loading={previewLoading}
                                disabled={isSaved}
                                style={{ flex: 1 }}
                            >
                                {previewLoading ? 'Generating...' : 'Generate Preview'}
                            </Button>
                            {previewData && !isSaved && (
                                <Button
                                    className="btn-save"
                                    icon={<Save size={14} strokeWidth={1.8} />}
                                    onClick={handleConfirmSave}
                                    loading={actionLoading}
                                    style={{ flex: 1 }}
                                >
                                    {actionLoading ? 'Saving...' : 'Confirm & Save'}
                                </Button>
                            )}
                            {isSaved && (
                                <Button
                                    style={{
                                        flex: 1, height: 40,
                                        background: '#e8f5e9', borderColor: '#a5d6a7',
                                        color: '#2e7d32', fontWeight: 700, fontSize: 13,
                                        borderRadius: 7, display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', gap: 7, cursor: 'default'
                                    }}
                                    icon={<ShieldCheck size={14} strokeWidth={2} />}
                                >
                                    Batch Saved Successfully
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Card 3: QR Preview */}
                    {previewData && (
                        <div id="qr-preview-section" style={card}>
                            <div style={cardBody}>
                                <div style={sectionHead}>
                                    <div style={sectionIcon}><QrCodeIcon size={14} strokeWidth={1.8} color="#666" /></div>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>QR Preview</span>
                                    {isSaved && (
                                        <span className="saved-badge" style={{ marginLeft: 8 }}>
                                            <ShieldCheck size={11} strokeWidth={2} />
                                            Saved to Database
                                        </span>
                                    )}
                                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                                        {/* Unsaved warning before print button */}
                                        {!isSaved && (
                                            <span style={{ fontSize: 11, color: '#e65100', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <Lock size={11} strokeWidth={2.5} />
                                                Save first to unlock print
                                            </span>
                                        )}
                                        <Tooltip
                                            title={!isSaved ? 'Confirm & Save the batch first before printing' : 'Print all QR codes'}
                                            placement="left"
                                        >
                                            <Button
                                                className={canPrint ? 'btn-prnt' : 'btn-prnt-locked'}
                                                size="small"
                                                icon={canPrint
                                                    ? <Printer size={13} strokeWidth={1.8} />
                                                    : <Lock size={12} strokeWidth={1.8} />
                                                }
                                                onClick={handlePrint}
                                                style={{ height: 30 }}
                                            >
                                                {canPrint ? 'Print All' : 'Locked'}
                                            </Button>
                                        </Tooltip>
                                    </div>
                                </div>

                                {/* Status bar: different look for saved vs unsaved */}
                                {isSaved ? (
                                    <div className="sbar-saved">
                                        <ShieldCheck size={16} strokeWidth={1.8} color="#1565c0" />
                                        <div>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: '#0d47a1' }}>Batch Confirmed & Saved</div>
                                            <div style={{ fontSize: 11, color: '#1976d2' }}>QR codes are verified — ready to print</div>
                                        </div>
                                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 28 }}>
                                            {[
                                                { label: 'Product', value: previewData.productName },
                                                { label: 'Serials', value: previewData.totalSerials },
                                                { label: 'Total QR', value: previewData.totalQRCodes },
                                            ].map(s => (
                                                <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                    <span style={{ fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{s.label}</span>
                                                    <span style={{ fontSize: s.label === 'Product' ? 13 : 15, fontWeight: 700, color: '#111' }}>{s.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="sbar">
                                            <CheckCircle2 size={16} strokeWidth={1.8} color="#25a855" />
                                            <div>
                                                <div style={{ fontSize: 12, fontWeight: 700, color: '#1a7a3c' }}>Preview Generated</div>
                                                <div style={{ fontSize: 11, color: '#3a9e60' }}>{previewData.totalQRCodes} QR codes ready — save before printing</div>
                                            </div>
                                            <div style={{ marginLeft: 'auto', display: 'flex', gap: 28 }}>
                                                {[
                                                    { label: 'Product', value: previewData.productName },
                                                    { label: 'Serials', value: previewData.totalSerials },
                                                    { label: 'Total QR', value: previewData.totalQRCodes },
                                                ].map(s => (
                                                    <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                        <span style={{ fontSize: 10, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.4px' }}>{s.label}</span>
                                                        <span style={{ fontSize: s.label === 'Product' ? 13 : 15, fontWeight: 700, color: '#111' }}>{s.value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        {/* Unsaved action banner */}
                                        <div className="unsaved-banner">
                                            <AlertTriangle size={15} strokeWidth={2} color="#e65100" style={{ flexShrink: 0 }} />
                                            <span>
                                                <strong>Action Required:</strong> Click <strong>"Confirm & Save"</strong> above to save this batch. Print will be unlocked automatically after saving.
                                            </span>
                                        </div>
                                    </>
                                )}

                                {previewData.serials && (
                                    <div className="prev-grid">
                                        {previewData.serials.map((serial) =>
                                            serial.qrCodes?.map((qr, qi) => (
                                                <div key={`${serial.serialNo}-${qi}`} className="pqc">
                                                    <div className={`pqc-bar ${qr.qrType === 'box' ? 'box' : ''}`} />
                                                    <div className="pqc-img">
                                                        <img src={`data:image/png;base64,${qr.qrImageBase64}`} alt={`${qr.qrType} QR`} />
                                                    </div>
                                                    <div className="pqc-body">
                                                        <div className="pqc-sn">{serial.serialNo}</div>
                                                        <div className="pqc-foot">
                                                            <span className={`pqc-tag ${qr.qrType}`}>
                                                                {qr.qrType === 'product'
                                                                    ? <><Package size={10} strokeWidth={2} /> Warranty Card</>
                                                                    : <><Box size={10} strokeWidth={2} /> Box</>
                                                                }
                                                            </span>
                                                            <button className="pqc-dl" onClick={() => downloadQRCode(qr, serial.serialNo, qr.qrType)} title="Download">
                                                                <Download size={12} strokeWidth={1.8} color="#666" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}

                                <div className="hint" style={{ marginTop: 16 }}>
                                    <strong>2 QR codes per serial</strong> — Product (black stripe) and Box (gray stripe). Hover to download individually, or use Print All{!isSaved ? ' (available after saving)' : ''}.
                                </div>
                            </div>
                        </div>
                    )}

                    {!selectedProduct && (
                        <div style={{ textAlign: 'center', padding: '52px 0', color: '#d0d0d0' }}>
                            <QrCodeIcon size={30} strokeWidth={1.2} style={{ display: 'block', margin: '0 auto 10px' }} />
                            <span style={{ fontSize: 13 }}>Select a product to get started</span>
                        </div>
                    )}

                </div>
            </div>
        </>
    );
};

export default CreateQRBatch;