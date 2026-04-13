import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Get_Batch_Details } from '../../../Redux/Action/QRBatchAction/QRBatchAction';
import { Fetch_Print_Settings } from '../../../Redux/Action/PrintSettingsAction/PrintSettingsAction';
import {
    ArrowLeft, Download, Package, Calendar,
    User, QrCode, Loader2, Tag, Share2,
    Box, Printer, Hash, CheckCircle2, Settings
} from 'lucide-react';
import dayjs from 'dayjs';
import { message, Tooltip } from 'antd';
import PrintSetupModal from './PrintSetupModal';

const BatchDetails = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { batchId } = useParams();

    const { selectedBatch, actionLoading } = useSelector((state) => state.qrBatch);
    const { settings: printSettings } = useSelector((state) => state.printSettings);

    const [selectedSerial, setSelectedSerial] = useState(null);
    const [showPrintSetup, setShowPrintSetup] = useState(false);

    useEffect(() => {
        if (batchId) dispatch(Get_Batch_Details(parseInt(batchId)));
        dispatch(Fetch_Print_Settings());
    }, [dispatch, batchId]);

    // Auto-select first serial as soon as batch loads
    useEffect(() => {
        if (selectedBatch?.serials?.length > 0) {
            setSelectedSerial(selectedBatch.serials[0]);
        }
    }, [selectedBatch]);

    const downloadQRCode = (qrCode, serialNo, type) => {
        try {
            const link = document.createElement('a');
            link.href = `data:image/png;base64,${qrCode.qrImageBase64}`;
            const label = type === 'product' ? 'warranty-card' : type;
            link.download = `${serialNo}_${label}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            message.success(`${type} QR downloaded`);
        } catch {
            message.error('Failed to download');
        }
    };

    const downloadAllQRCodes = () => {
        if (!selectedBatch?.serials) return;
        let delay = 0;
        selectedBatch.serials.forEach((serial) => {
            serial.qrCodes.forEach((qr) => {
                setTimeout(() => downloadQRCode(qr, serial.serialNo, qr.qrType), delay);
                delay += 120;
            });
        });
        message.success('Downloading all QR codes...');
    };

    // ═══════════════════════════════════════════════════════════════════════════════
    // OPTIMIZED PRINT HANDLER FOR SATO CG412DT THERMAL PRINTER
    // Label: 100mm × 25mm | 2 QR codes per row
    // ═══════════════════════════════════════════════════════════════════════════════
    const handlePrint = () => {
        if (!selectedBatch?.serials?.length) return;

        const productName = selectedBatch.productName || 'Product';
        const batchDate = dayjs(selectedBatch.generatedAt).format('DD MMM YYYY');

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

        selectedBatch.serials.forEach((serial) => {
            const productQR = serial.qrCodes?.find(q => q.qrType === 'product');
            const boxQR = serial.qrCodes?.find(q => q.qrType === 'box');

            // Build text content based on settings
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

            // Add Product QR (Warranty Card)
            if (productQR) {
                qrItems.push({
                    base64: productQR.qrImageBase64,
                    type: 'product',
                    label: 'SCAN FOR WARRANTY',
                    textLines: textLines
                });
            }

            // Add Box QR
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
        // GENERATE SINGLE LABEL CELL
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

        // ─────────────────────────────────────────────────────────────────────────
        // FINAL PRINT HTML
        // ─────────────────────────────────────────────────────────────────────────
        const printHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>QR Labels - Batch #${selectedBatch.batchId}</title>
<style>
/* ═══════════════════════════════════════════════════════════════════════════
   SATO CG412 THERMAL PRINTER OPTIMIZED
   Label: 100mm × 25mm | 2 labels per row
   ═══════════════════════════════════════════════════════════════════════════ */

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

/* ─────────────────────────────────────────────────────────────────────────
   PAGE SETUP - EXACT LABEL SIZE
   ───────────────────────────────────────────────────────────────────────── */
@page {
    size: 100mm 25mm;
    margin: 0;
    marks: none;
}

@media print {
    @page {
        size: 100mm 25mm;
        margin: 0;
        marks: none;
    }
    
    body {
        margin: 0 !important;
        padding: 0 !important;
    }
    
    .no-print {
        display: none !important;
    }
}

body {
    margin: 0;
    padding: 0;
    font-family: 'Arial', 'Helvetica', sans-serif;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
}

/* ─────────────────────────────────────────────────────────────────────────
   LABEL ROW - 2 LABELS SIDE BY SIDE
   ───────────────────────────────────────────────────────────────────────── */
.label-row {
    width: 100mm;
    height: 25mm;
    display: flex;
    page-break-after: always;
    page-break-inside: avoid;
    break-after: page;
    break-inside: avoid;
}

/* ─────────────────────────────────────────────────────────────────────────
   SINGLE LABEL CELL - 50mm wide × 25mm high
   ───────────────────────────────────────────────────────────────────────── */
.label-cell {
    width: 50mm;
    height: 25mm;
    display: flex;
    align-items: stretch;
    gap: 1.5mm;
    padding: 1.5mm;
    background: #fff;
    position: relative;
}

/* ─────────────────────────────────────────────────────────────────────────
   QR CODE SECTION - Left side
   ───────────────────────────────────────────────────────────────────────── */
.qr-container {
    width: 21mm;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.qr-image {
    width: 20mm;
    height: 20mm;
    display: block;
    margin: 0 auto;
}

.qr-label {
    font-size: 5pt;
    font-weight: 700;
    text-align: center;
    margin-top: 0.5mm;
    text-transform: uppercase;
    letter-spacing: 0.1mm;
    color: #000;
    line-height: 1.1;
}

/* ─────────────────────────────────────────────────────────────────────────
   TEXT SECTION - Right side
   ───────────────────────────────────────────────────────────────────────── */
.text-container {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.8mm;
}

/* Serial Number */
.text-serial {
    font-family: 'Courier New', monospace;
    font-size: 7pt;
    font-weight: 700;
    color: #000;
    letter-spacing: 0.2mm;
    line-height: 1.1;
    margin-bottom: 0.5mm;
}

/* Product Name */
.text-product {
    font-size: 7pt;
    font-weight: 700;
    color: #000;
    line-height: 1.1;
    margin-bottom: 0.5mm;
}

/* Data Fields */
.text-field {
    font-size: 5.5pt;
    line-height: 1.2;
    color: #000;
    margin-top: 0.3mm;
}

.text-label {
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1mm;
}

.text-value {
    font-weight: 400;
}

/* ─────────────────────────────────────────────────────────────────────────
   SCREEN PREVIEW (not printed)
   ───────────────────────────────────────────────────────────────────────── */
@media screen {
    body {
        padding: 20px;
        background: #f0f0f0;
    }
    
    .label-row {
        margin-bottom: 10px;
        border: 1px dashed #999;
    }
    
    .label-cell {
        border-right: 1px dashed #ccc;
    }
    
    .label-cell:last-child {
        border-right: none;
    }
    
    .print-header {
        background: #fff;
        padding: 15px 20px;
        margin-bottom: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .print-btn {
        background: #000;
        color: #fff;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        font-size: 14px;
    }
    
    .print-btn:hover {
        background: #333;
    }
}

@media print {
    .print-header {
        display: none !important;
    }
}

/* ─────────────────────────────────────────────────────────────────────────
   WEBKIT PRINT FIXES
   ───────────────────────────────────────────────────────────────────────── */
@media print {
    html, body {
        width: 100mm;
        height: auto;
    }
    
    .label-row {
        page-break-after: always;
        break-after: page;
    }
    
    .label-row:last-child {
        page-break-after: auto;
        break-after: auto;
    }
}
</style>
</head>
<body>

<!-- Print Header (screen only) -->
<div class="print-header no-print">
    <div>
        <h2 style="margin: 0; font-size: 18px;">QR Labels - Batch #${selectedBatch.batchId}</h2>
        <p style="margin: 5px 0 0 0; color: #666; font-size: 13px;">${productName} | ${qrItems.length} labels | ${batchDate}</p>
    </div>
    <button class="print-btn" onclick="window.print()">🖨️ Print Labels</button>
</div>

<!-- Labels -->
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

    // ── Loading ──
    if (actionLoading) return (
        <div style={{ minHeight: '100vh', background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 size={28} strokeWidth={1.5} style={{ color: '#ccc', animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    // ── Not found ──
    if (!selectedBatch) return (
        <div style={{ minHeight: '100vh', background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
            <QrCode size={32} strokeWidth={1.3} style={{ color: '#ccc' }} />
            <p style={{ fontSize: 14, color: '#aaa', fontFamily: 'Sofia Sans, sans-serif' }}>Batch not found</p>
        </div>
    );

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sofia+Sans:wght@300;400;500;600;700&display=swap');
                .bd, .bd * { font-family: 'Sofia Sans', sans-serif !important; box-sizing: border-box; }

                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                .back-btn {
                    width: 32px; height: 32px;
                    border: 1px solid #e0e0e0; border-radius: 7px;
                    background: #fff; display: flex; align-items: center; justify-content: center;
                    cursor: pointer; flex-shrink: 0; transition: border-color .15s;
                }
                .back-btn:hover { border-color: #999; }

                .btn-dark {
                    display: inline-flex; align-items: center; gap: 7px;
                    height: 34px; padding: 0 14px;
                    background: #111; color: #fff; border: none; border-radius: 8px;
                    font-size: 12px; font-weight: 600; cursor: pointer;
                    font-family: 'Sofia Sans', sans-serif !important; transition: background .15s;
                }
                .btn-dark:hover { background: #333; }

                .btn-outline {
                    display: inline-flex; align-items: center; gap: 6px;
                    height: 34px; padding: 0 14px;
                    background: #fff; color: #333;
                    border: 1px solid #d8d8d8; border-radius: 8px;
                    font-size: 12px; font-weight: 600; cursor: pointer;
                    font-family: 'Sofia Sans', sans-serif !important; transition: all .12s;
                }
                .btn-outline:hover { border-color: #888; color: #111; }

                .stat-card {
                    background: #fff; border: 1px solid #e8e8e8; border-radius: 10px;
                    padding: 14px 16px;
                    display: flex; align-items: center; gap: 12;
                }

                .serial-row {
                    display: flex; align-items: center;
                    padding: 11px 16px;
                    border-bottom: 1px solid #f5f5f5;
                    cursor: pointer; transition: background .1s;
                    gap: 12px;
                }
                .serial-row:last-child { border-bottom: none; }
                .serial-row:hover { background: #fafafa; }
                .serial-row.active { background: #f7f7f7; border-left: 3px solid #111; padding-left: 13px; }
                .serial-row:not(.active) { border-left: 3px solid transparent; }

                .serial-idx {
                    width: 24px; height: 24px; border-radius: 6px;
                    background: #f0f0f0;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 10px; font-weight: 700; color: #888;
                    flex-shrink: 0;
                }
                .serial-row.active .serial-idx { background: #111; color: #fff; }

                .serial-no {
                    font-family: 'Courier New', monospace !important;
                    font-size: 12px; font-weight: 700; color: #111;
                    letter-spacing: 0.3px;
                }

                .meta-pill {
                    display: inline-flex; align-items: center; gap: 4px;
                    background: #f4f4f4; border-radius: 4px;
                    padding: 2px 7px; font-size: 10.5px; font-weight: 600; color: #666;
                }

                .qr-card {
                    border: 1px solid #e8e8e8; border-radius: 9px; overflow: hidden;
                    background: #fff; margin-bottom: 12px;
                    transition: border-color .15s, box-shadow .15s;
                }
                .qr-card:hover { border-color: #bbb; box-shadow: 0 2px 10px rgba(0,0,0,.06); }
                .qr-card:last-child { margin-bottom: 0; }
                .qr-stripe { height: 3px; background: #111; }
                .qr-stripe.box { background: #777; }
                .qr-img-wrap {
                    padding: 16px; background: #fafafa;
                    border-bottom: 1px solid #f0f0f0;
                    display: flex; align-items: center; justify-content: center;
                }
                .qr-img-wrap img { width: 100%; max-width: 200px; display: block; margin: 0 auto; }
                .qr-card-footer {
                    padding: 10px 14px;
                    display: flex; align-items: center; justify-content: space-between;
                }
                .qr-type-tag {
                    display: inline-flex; align-items: center; gap: 5px;
                    font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 4px;
                }
                .qr-type-tag.product { background: #111; color: #fff; }
                .qr-type-tag.box { background: #f0f0f0; color: #555; }
                .dl-btn {
                    width: 28px; height: 28px; border-radius: 6px;
                    border: 1px solid #e8e8e8; background: #fff;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; transition: all .12s;
                }
                .dl-btn:hover { border-color: #111; background: #111; }
                .dl-btn:hover svg { color: #fff !important; }

                .qr-value {
                    padding: 8px 14px 12px;
                    font-size: 10px; color: #bbb;
                    font-family: 'Courier New', monospace !important;
                    word-break: break-all; line-height: 1.5;
                    border-top: 1px solid #f5f5f5;
                }

                .fl { font-size: 10px; font-weight: 700; color: #bbb; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 3px; }
                .fv { font-size: 12px; font-weight: 600; color: #333; }
            `}</style>

            <PrintSetupModal visible={showPrintSetup} onClose={() => setShowPrintSetup(false)} />

            <div className="bd" style={{ minHeight: '100vh', background: '#F5F5F5' }}>

                {/* ══ HEADER ══ */}
                <div style={{ background: '#fff', borderBottom: '1px solid #e8e8e8' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', gap: 14 }}>
                        <button className="back-btn" onClick={() => navigate('/qr-batch')}>
                            <ArrowLeft size={15} strokeWidth={2} style={{ color: '#555' }} />
                        </button>
                        <div style={{ width: 1, height: 18, background: '#e8e8e8' }} />
                        <div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: '#111', letterSpacing: '-0.3px' }}>
                                Batch <span style={{ fontFamily: 'Courier New, monospace', color: '#888' }}>#{selectedBatch.batchId}</span>
                            </div>
                            <div style={{ fontSize: 12, color: '#aaa', marginTop: 1 }}>{selectedBatch.productName}</div>
                        </div>
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                            <Tooltip title="Configure global print layout & labels">
                                <button
                                    onClick={() => setShowPrintSetup(true)}
                                    className="btn-outline"
                                >
                                    <Settings size={13} strokeWidth={1.8} />
                                    Print Setup
                                </button>
                            </Tooltip>
                            <button className="btn-outline" onClick={handlePrint}>
                                <Printer size={13} strokeWidth={1.8} />
                                Print All
                            </button>
                            <button className="btn-dark" onClick={downloadAllQRCodes}>
                                <Download size={13} strokeWidth={1.8} />
                                Download All
                            </button>
                        </div>
                    </div>
                </div>

                {/* ══ CONTENT ══ */}
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 32px' }}>

                    {/* ── Stat Cards ── */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                        {[
                            { icon: <Package size={15} strokeWidth={1.8} style={{ color: '#888' }} />, label: 'Serial Numbers', value: selectedBatch.totalSerials },
                            { icon: <QrCode size={15} strokeWidth={1.8} style={{ color: '#888' }} />, label: 'QR Codes', value: selectedBatch.totalQRCodes },
                            { icon: <Calendar size={15} strokeWidth={1.8} style={{ color: '#888' }} />, label: 'Generated', value: dayjs(selectedBatch.generatedAt).format('DD MMM YYYY'), small: true },
                            { icon: <User size={15} strokeWidth={1.8} style={{ color: '#888' }} />, label: 'Created By', value: selectedBatch.createdByUsername, small: true },
                        ].map((s, i) => (
                            <div key={i} style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 10, padding: '14px 16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                    {s.icon}
                                    <span style={{ fontSize: 10, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</span>
                                </div>
                                <div style={{ fontSize: s.small ? 14 : 22, fontWeight: 700, color: '#111', lineHeight: 1 }}>{s.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* ── Main Layout: Serial List + QR Panel ── */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' }}>

                        {/* ── Serial List ── */}
                        <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 10, overflow: 'hidden' }}>
                            <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 28, height: 28, background: '#f4f4f4', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Hash size={14} strokeWidth={1.8} style={{ color: '#777' }} />
                                    </div>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>Serial Numbers</span>
                                </div>
                                <span style={{ fontSize: 11, fontWeight: 700, background: '#111', color: '#fff', borderRadius: 4, padding: '2px 8px' }}>
                                    {selectedBatch.serials?.length || 0}
                                </span>
                            </div>

                            <div>
                                {selectedBatch.serials?.map((serial, index) => (
                                    <div
                                        key={index}
                                        className={`serial-row${selectedSerial?.serialNo === serial.serialNo ? ' active' : ''}`}
                                        onClick={() => setSelectedSerial(serial)}
                                    >
                                        <div className="serial-idx">{index + 1}</div>

                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div className="serial-no">{serial.serialNo}</div>

                                            {(serial.warrantyDesc || serial.purchaseDate || serial.validityDate) && (
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 5 }}>
                                                    {serial.warrantyDesc && (
                                                        <span className="meta-pill">
                                                            <Tag size={9} strokeWidth={2} /> {serial.warrantyDesc}{serial.warrantyTerm ? ` · ${serial.warrantyTerm}` : ''}
                                                        </span>
                                                    )}
                                                    {serial.purchaseDate && (
                                                        <span className="meta-pill">
                                                            <Calendar size={9} strokeWidth={2} /> {dayjs(serial.purchaseDate).format('DD MMM YY')}
                                                        </span>
                                                    )}
                                                    {serial.validityDate && (
                                                        <span className="meta-pill" style={{ background: '#f0fdf4', color: '#22883a' }}>
                                                            <CheckCircle2 size={9} strokeWidth={2} /> {dayjs(serial.validityDate).format('DD MMM YY')}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                                            <QrCode size={12} strokeWidth={1.8} style={{ color: '#ccc' }} />
                                            <span style={{ fontSize: 11, fontWeight: 600, color: '#bbb' }}>{serial.qrCodes?.length || 0}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── QR Preview Panel (sticky) ── */}
                        <div style={{ position: 'sticky', top: 20 }}>
                            <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 10, overflow: 'hidden' }}>
                                <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 28, height: 28, background: '#f4f4f4', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <QrCode size={14} strokeWidth={1.8} style={{ color: '#777' }} />
                                    </div>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>QR Codes</span>
                                    {selectedSerial && (
                                        <span style={{ marginLeft: 'auto', fontFamily: 'Courier New, monospace', fontSize: 10, fontWeight: 700, color: '#aaa', background: '#f4f4f4', padding: '2px 7px', borderRadius: 4 }}>
                                            {selectedSerial.serialNo.slice(-8)}
                                        </span>
                                    )}
                                </div>

                                {selectedSerial ? (
                                    <div style={{ padding: '14px 14px' }}>

                                        <div style={{ background: '#fafafa', border: '1px solid #ebebeb', borderRadius: 8, padding: '10px 12px', marginBottom: 14 }}>
                                            <div style={{ fontFamily: 'Courier New, monospace', fontSize: 11, fontWeight: 700, color: '#111', marginBottom: 6, letterSpacing: '0.3px' }}>
                                                {selectedSerial.serialNo}
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                                {selectedSerial.warrantyDesc && (
                                                    <div>
                                                        <div className="fl">Warranty</div>
                                                        <div className="fv">{selectedSerial.warrantyDesc}</div>
                                                    </div>
                                                )}
                                                {selectedSerial.warrantyTerm && (
                                                    <div>
                                                        <div className="fl">Term</div>
                                                        <div className="fv">{selectedSerial.warrantyTerm}</div>
                                                    </div>
                                                )}
                                                {selectedSerial.purchaseDate && (
                                                    <div>
                                                        <div className="fl">Purchase</div>
                                                        <div className="fv">{dayjs(selectedSerial.purchaseDate).format('DD MMM YYYY')}</div>
                                                    </div>
                                                )}
                                                {selectedSerial.validityDate && (
                                                    <div>
                                                        <div className="fl">Valid Till</div>
                                                        <div className="fv" style={{ color: '#22883a' }}>{dayjs(selectedSerial.validityDate).format('DD MMM YYYY')}</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {selectedSerial.qrCodes?.map((qr, idx) => (
                                            <div key={idx} className="qr-card">
                                                <div className={`qr-stripe${qr.qrType === 'box' ? ' box' : ''}`} />
                                                <div className="qr-img-wrap">
                                                    <img
                                                        src={`data:image/png;base64,${qr.qrImageBase64}`}
                                                        alt={`${qr.qrType} QR Code`}
                                                    />
                                                </div>
                                                <div className="qr-card-footer">
                                                    <span className={`qr-type-tag ${qr.qrType}`}>
                                                        {qr.qrType === 'product'
                                                            ? <><Package size={11} strokeWidth={2} /> Warranty Card</>
                                                            : <><Box size={11} strokeWidth={2} /> Box</>
                                                        }
                                                    </span>
                                                    <button
                                                        className="dl-btn"
                                                        onClick={() => downloadQRCode(qr, selectedSerial.serialNo, qr.qrType)}
                                                        title="Download"
                                                    >
                                                        <Download size={13} strokeWidth={1.8} style={{ color: '#666' }} />
                                                    </button>
                                                </div>
                                                {qr.qrValue && (
                                                    <div className="qr-value">{qr.qrValue}</div>
                                                )}
                                            </div>
                                        ))}

                                        {selectedSerial.qrcodeUrl && (
                                            <a
                                                href={selectedSerial.qrcodeUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                                    marginTop: 12, fontSize: 12, fontWeight: 600, color: '#555',
                                                    textDecoration: 'none', transition: 'color .12s'
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.color = '#111'}
                                                onMouseLeave={e => e.currentTarget.style.color = '#555'}
                                            >
                                                <Share2 size={13} strokeWidth={1.8} />
                                                Open QR URL
                                            </a>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                                        <QrCode size={28} strokeWidth={1.3} style={{ color: '#ddd', display: 'block', margin: '0 auto 10px' }} />
                                        <p style={{ fontSize: 12, color: '#bbb' }}>Select a serial to view QR codes</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
};

export default BatchDetails;