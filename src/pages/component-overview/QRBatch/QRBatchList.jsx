import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Fetch_All_Batches } from '../../../Redux/Action/QRBatchAction/QRBatchAction';
import {
    Plus, Search, Package, Calendar,
    User, QrCode, ChevronRight, Loader2,
    ChevronLeft, ChevronsLeft, ChevronsRight,
    ArrowUpDown, ArrowUp, ArrowDown, X
} from 'lucide-react';
import dayjs from 'dayjs';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const QRBatchList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { batches, loading } = useSelector((state) => state.qrBatch);

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortKey, setSortKey] = useState('batchId');
    const [sortDir, setSortDir] = useState('desc');

    useEffect(() => {
        dispatch(Fetch_All_Batches());
    }, [dispatch]);

    // Reset to page 1 on search/sort
    useEffect(() => { setCurrentPage(1); }, [searchTerm, sortKey, sortDir, pageSize]);

    const filtered = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return (batches || []).filter((b) =>
            b.productName?.toLowerCase().includes(term) ||
            b.createdByUsername?.toLowerCase().includes(term) ||
            b.batchId?.toString().includes(term)
        );
    }, [batches, searchTerm]);

    const sorted = useMemo(() => {
        return [...filtered].sort((a, b) => {
            let av = a[sortKey], bv = b[sortKey];
            if (sortKey === 'generatedAt') { av = dayjs(av).unix(); bv = dayjs(bv).unix(); }
            if (typeof av === 'string') av = av?.toLowerCase();
            if (typeof bv === 'string') bv = bv?.toLowerCase();
            if (av < bv) return sortDir === 'asc' ? -1 : 1;
            if (av > bv) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filtered, sortKey, sortDir]);

    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handleSort = (key) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('asc'); }
    };

    const SortIcon = ({ col }) => {
        if (sortKey !== col) return <ArrowUpDown size={12} strokeWidth={2} style={{ color: '#ccc', marginLeft: 4 }} />;
        return sortDir === 'asc'
            ? <ArrowUp size={12} strokeWidth={2.5} style={{ color: '#111', marginLeft: 4 }} />
            : <ArrowDown size={12} strokeWidth={2.5} style={{ color: '#111', marginLeft: 4 }} />;
    };

    // Page number range
    const pageRange = useMemo(() => {
        const delta = 2;
        const range = [];
        const left = Math.max(2, currentPage - delta);
        const right = Math.min(totalPages - 1, currentPage + delta);
        range.push(1);
        if (left > 2) range.push('...');
        for (let i = left; i <= right; i++) range.push(i);
        if (right < totalPages - 1) range.push('...');
        if (totalPages > 1) range.push(totalPages);
        return range;
    }, [currentPage, totalPages]);

    const totalSerials = filtered.reduce((s, b) => s + (b.totalSerials || 0), 0);
    const totalQRCodes = filtered.reduce((s, b) => s + (b.totalQRCodes || 0), 0);

    const from = sorted.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const to = Math.min(currentPage * pageSize, sorted.length);

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sofia+Sans:wght@300;400;500;600;700&display=swap');
                .qbl, .qbl * { font-family: 'Sofia Sans', sans-serif !important; box-sizing: border-box; }

                /* ── SEARCH ── */
                .qbl-search {
                    width: 100%; height: 36px;
                    padding: 0 32px 0 36px;
                    background: #fafafa;
                    border: 1px solid #e8e8e8;
                    border-radius: 8px;
                    font-size: 13px; color: #111;
                    outline: none;
                    transition: border-color .15s, box-shadow .15s;
                    font-family: 'Sofia Sans', sans-serif !important;
                }
                .qbl-search::placeholder { color: #c0c0c0; }
                .qbl-search:focus { border-color: #999; background: #fff; box-shadow: 0 0 0 3px rgba(0,0,0,0.04); }

                /* ── TABLE ── */
                .bt { width: 100%; border-collapse: collapse; }
                .bt thead tr { border-bottom: 1.5px solid #efefef; }
                .bt thead th {
                    font-size: 10.5px; font-weight: 700; color: #bbb;
                    text-transform: uppercase; letter-spacing: 0.6px;
                    padding: 0 14px 11px; text-align: left; white-space: nowrap;
                    user-select: none;
                }
                .bt thead th.sortable { cursor: pointer; }
                .bt thead th.sortable:hover { color: #888; }
                .bt thead th.active-col { color: #333; }
                .bt thead th:first-child { padding-left: 0; }
                .bt thead th:last-child { padding-right: 0; text-align: right; width: 36px; }
                .bt thead th .th-inner { display: inline-flex; align-items: center; }

                .bt tbody tr {
                    border-bottom: 1px solid #f5f5f5;
                    transition: background .1s;
                    cursor: pointer;
                }
                .bt tbody tr:last-child { border-bottom: none; }
                .bt tbody tr:hover { background: #fafafa; }
                .bt tbody tr:hover .ri { background: #111; }
                .bt tbody tr:hover .ri svg { color: #fff !important; }
                .bt tbody tr:hover .rarrow { color: #555; }
                .bt tbody td { padding: 12px 14px; vertical-align: middle; }
                .bt tbody td:first-child { padding-left: 0; }
                .bt tbody td:last-child { padding-right: 0; text-align: right; }

                /* ── ROW ICON ── */
                .ri {
                    width: 34px; height: 34px;
                    background: #f4f4f4; border-radius: 8px;
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0; transition: background .15s;
                }

                /* ── CHIPS ── */
                .chip {
                    display: inline-flex; align-items: center; gap: 5px;
                    background: #f4f4f4; border-radius: 5px;
                    padding: 3px 9px; font-size: 12px; font-weight: 700; color: #444;
                }
                .bid {
                    display: inline-block;
                    background: #f0f0f0; border-radius: 4px;
                    padding: 2px 8px; font-size: 11px; font-weight: 700; color: #999;
                    letter-spacing: 0.2px;
                }
                .avatar {
                    width: 26px; height: 26px; border-radius: 50%;
                    background: #ebebeb;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 10px; font-weight: 800; color: #666;
                    text-transform: uppercase; flex-shrink: 0;
                }
                .rarrow { color: #d0d0d0; transition: color .15s; }

                /* ── SUMMARY STATS ── */
                .sumstat { display: flex; flex-direction: column; gap: 1px; }
                .sumstat-l { font-size: 10px; font-weight: 700; color: #bbb; text-transform: uppercase; letter-spacing: 0.5px; }
                .sumstat-v { font-size: 17px; font-weight: 700; color: #111; line-height: 1; }
                .sumdiv { width: 1px; height: 26px; background: #ebebeb; }

                /* ── PAGINATION ── */
                .pgn { display: flex; align-items: center; gap: 4px; }
                .pg-btn {
                    min-width: 32px; height: 32px; padding: 0 6px;
                    border: 1px solid #e8e8e8; border-radius: 7px;
                    background: #fff; color: #555;
                    font-size: 12px; font-weight: 600;
                    cursor: pointer; display: flex; align-items: center; justify-content: center;
                    transition: all .12s; font-family: 'Sofia Sans', sans-serif !important;
                    gap: 2px;
                }
                .pg-btn:hover:not(:disabled) { border-color: #aaa; color: #111; background: #fafafa; }
                .pg-btn:disabled { opacity: 0.35; cursor: not-allowed; }
                .pg-btn.active { background: #111; color: #fff; border-color: #111; }
                .pg-btn.ellipsis { border-color: transparent; background: none; cursor: default; color: #bbb; pointer-events: none; }
                .pg-sep { width: 1px; height: 20px; background: #ebebeb; margin: 0 4px; }

                /* PAGE SIZE SELECT */
                .ps-select {
                    height: 32px; padding: 0 8px;
                    border: 1px solid #e8e8e8; border-radius: 7px;
                    background: #fff; color: #555;
                    font-size: 12px; font-weight: 600;
                    cursor: pointer; outline: none;
                    font-family: 'Sofia Sans', sans-serif !important;
                    transition: border-color .12s;
                }
                .ps-select:focus, .ps-select:hover { border-color: #aaa; }

                /* ── EMPTY / LOADING ── */
                .empty-w { text-align: center; padding: 72px 0; }
                .empty-ico { width: 54px; height: 54px; margin: 0 auto 14px; background: #f4f4f4; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
                .empty-t { font-size: 14px; font-weight: 700; color: #888; margin-bottom: 5px; }
                .empty-s { font-size: 12px; color: #bbb; }

                /* ── BUTTONS ── */
                .btn-dark {
                    display: inline-flex; align-items: center; gap: 7px;
                    height: 36px; padding: 0 16px;
                    background: #111; color: #fff;
                    border: none; border-radius: 8px;
                    font-size: 13px; font-weight: 600; cursor: pointer;
                    font-family: 'Sofia Sans', sans-serif !important;
                    transition: background .15s;
                }
                .btn-dark:hover { background: #333; }
                .btn-outline {
                    display: inline-flex; align-items: center; gap: 7px;
                    height: 34px; padding: 0 14px;
                    background: #fff; color: #333;
                    border: 1px solid #d8d8d8; border-radius: 8px;
                    font-size: 12px; font-weight: 600; cursor: pointer;
                    font-family: 'Sofia Sans', sans-serif !important;
                    transition: border-color .12s; margin-top: 14px;
                }
                .btn-outline:hover { border-color: #888; color: #111; }

                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

                /* ── CLEAR SEARCH BTN ── */
                .clr-btn {
                    position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
                    width: 18px; height: 18px; border-radius: 50%;
                    background: #ddd; border: none; cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    transition: background .12s;
                }
                .clr-btn:hover { background: #bbb; }
            `}</style>

            <div className="qbl" style={{ minHeight: '100vh', background: '#F5F5F5' }}>

                {/* ══ HEADER ══ */}
                <div style={{ background: '#fff', borderBottom: '1px solid #e8e8e8' }}>
                    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: '#111', letterSpacing: '-0.3px' }}>QR Code Batches</div>
                            <div style={{ fontSize: 12, color: '#aaa', marginTop: 1 }}>Manage and view all QR code generation batches</div>
                        </div>
                        <button className="btn-dark" onClick={() => navigate('/qr-batch-create')}>
                            <Plus size={15} strokeWidth={2.2} />
                            Generate QR Codes
                        </button>
                    </div>
                </div>

                {/* ══ CONTENT ══ */}
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '10px 10px' }}>

                    {/* ── Summary Cards ── */}
                    {!loading && (batches || []).length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                            {[
                                { label: 'Total Batches', value: (batches || []).length, icon: <QrCode size={16} strokeWidth={1.8} color="#888" /> },
                                { label: 'Total Serials', value: (batches || []).reduce((s, b) => s + (b.totalSerials || 0), 0), icon: <Package size={16} strokeWidth={1.8} color="#888" /> },
                                { label: 'Total QR Codes', value: (batches || []).reduce((s, b) => s + (b.totalQRCodes || 0), 0), icon: <QrCode size={16} strokeWidth={1.8} color="#888" /> },
                            ].map(card => (
                                <div key={card.label} style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <div style={{ width: 38, height: 38, background: '#f4f4f4', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {card.icon}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 10, fontWeight: 700, color: '#bbb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{card.label}</div>
                                        <div style={{ fontSize: 20, fontWeight: 700, color: '#111', lineHeight: 1.1, marginTop: 2 }}>{card.value.toLocaleString()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── Main Table Card ── */}
                    <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 10 }}>

                        {/* Card Top Bar */}
                        <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>All Batches</span>
                                {!loading && sorted.length > 0 && (
                                    <span style={{ fontSize: 11, fontWeight: 700, background: '#f0f0f0', color: '#777', borderRadius: 4, padding: '2px 7px' }}>
                                        {sorted.length}
                                    </span>
                                )}
                            </div>

                            {/* Search */}
                            <div style={{ position: 'relative', width: 300 }}>
                                <Search size={14} strokeWidth={1.8} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#bbb', pointerEvents: 'none' }} />
                                <input
                                    className="qbl-search"
                                    type="text"
                                    placeholder="Search product, batch ID, creator..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <button className="clr-btn" onClick={() => setSearchTerm('')}>
                                        <X size={10} strokeWidth={2.5} color="#666" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Table Body */}
                        <div style={{ padding: '0 20px' }}>
                            {loading ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '72px 0', color: '#ccc' }}>
                                    <Loader2 size={26} strokeWidth={1.5} className="spin" />
                                </div>

                            ) : sorted.length === 0 ? (
                                <div className="empty-w">
                                    <div className="empty-ico">
                                        <QrCode size={22} strokeWidth={1.4} color="#ccc" />
                                    </div>
                                    <div className="empty-t">No batches found</div>
                                    <div className="empty-s">
                                        {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first QR code batch'}
                                    </div>
                                    {!searchTerm && (
                                        <button className="btn-outline" onClick={() => navigate('/qr-batch-create')}>
                                            <Plus size={13} strokeWidth={2} /> Generate QR Codes
                                        </button>
                                    )}
                                </div>

                            ) : (
                                <table className="bt">
                                    <thead>
                                        <tr>
                                            <th className={`sortable ${sortKey === 'productName' ? 'active-col' : ''}`} onClick={() => handleSort('productName')}>
                                                <span className="th-inner">Product <SortIcon col="productName" /></span>
                                            </th>
                                            <th className={`sortable ${sortKey === 'batchId' ? 'active-col' : ''}`} onClick={() => handleSort('batchId')}>
                                                <span className="th-inner">Batch ID <SortIcon col="batchId" /></span>
                                            </th>
                                            <th className={`sortable ${sortKey === 'totalSerials' ? 'active-col' : ''}`} onClick={() => handleSort('totalSerials')}>
                                                <span className="th-inner">Serials <SortIcon col="totalSerials" /></span>
                                            </th>
                                            <th className={`sortable ${sortKey === 'totalQRCodes' ? 'active-col' : ''}`} onClick={() => handleSort('totalQRCodes')}>
                                                <span className="th-inner">QR Codes <SortIcon col="totalQRCodes" /></span>
                                            </th>
                                            <th className={`sortable ${sortKey === 'generatedAt' ? 'active-col' : ''}`} onClick={() => handleSort('generatedAt')}>
                                                <span className="th-inner">Generated <SortIcon col="generatedAt" /></span>
                                            </th>
                                            <th className={`sortable ${sortKey === 'createdByUsername' ? 'active-col' : ''}`} onClick={() => handleSort('createdByUsername')}>
                                                <span className="th-inner">Created By <SortIcon col="createdByUsername" /></span>
                                            </th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginated.map((batch) => (
                                            <tr key={batch.batchId} onClick={() => navigate(`/qr-batch/${batch.batchId}`)}>

                                                {/* Product */}
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <div className="ri">
                                                            <QrCode size={15} strokeWidth={1.7} style={{ color: '#999' }} />
                                                        </div>
                                                        <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{batch.productName}</span>
                                                    </div>
                                                </td>

                                                {/* Batch ID */}
                                                <td><span className="bid">#{batch.batchId}</span></td>

                                                {/* Serials */}
                                                <td>
                                                    <div className="chip">
                                                        <Package size={11} strokeWidth={2} style={{ color: '#888' }} />
                                                        {batch.totalSerials}
                                                    </div>
                                                </td>

                                                {/* QR Codes */}
                                                <td>
                                                    <div className="chip">
                                                        <QrCode size={11} strokeWidth={2} style={{ color: '#888' }} />
                                                        {batch.totalQRCodes}
                                                    </div>
                                                </td>

                                                {/* Date */}
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <Calendar size={12} strokeWidth={1.8} style={{ color: '#ccc', flexShrink: 0 }} />
                                                        <span style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>
                                                            {dayjs(batch.generatedAt).format('DD MMM YYYY')}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Created By */}
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                                        <div className="avatar">{batch.createdByUsername?.charAt(0) || 'U'}</div>
                                                        <span style={{ fontSize: 12, fontWeight: 600, color: '#555' }}>{batch.createdByUsername}</span>
                                                    </div>
                                                </td>

                                                {/* Arrow */}
                                                <td><ChevronRight size={15} strokeWidth={2} className="rarrow" /></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* ══ PAGINATION FOOTER ══ */}
                        {!loading && sorted.length > 0 && (
                            <div style={{
                                padding: '12px 20px',
                                borderTop: '1px solid #f0f0f0',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                flexWrap: 'wrap', gap: 10
                            }}>

                                {/* Left: rows info + page size */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ fontSize: 12, color: '#aaa', fontWeight: 500 }}>
                                        Showing <strong style={{ color: '#555' }}>{from}–{to}</strong> of <strong style={{ color: '#555' }}>{sorted.length}</strong>
                                    </span>
                                    <div style={{ width: 1, height: 14, background: '#e8e8e8' }} />
                                    <span style={{ fontSize: 11, color: '#bbb', fontWeight: 600 }}>Rows per page</span>
                                    <select
                                        className="ps-select"
                                        value={pageSize}
                                        onChange={e => setPageSize(Number(e.target.value))}
                                    >
                                        {PAGE_SIZE_OPTIONS.map(n => (
                                            <option key={n} value={n}>{n}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Right: page controls */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    {/* First */}
                                    <button className="pg-btn" onClick={() => setCurrentPage(1)} disabled={currentPage === 1} title="First page">
                                        <ChevronsLeft size={13} strokeWidth={2} />
                                    </button>
                                    {/* Prev */}
                                    <button className="pg-btn" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} title="Previous page">
                                        <ChevronLeft size={13} strokeWidth={2} />
                                    </button>

                                    <div style={{ width: 1, height: 20, background: '#ebebeb', margin: '0 2px' }} />

                                    {/* Page numbers */}
                                    <div className="pgn">
                                        {pageRange.map((p, i) =>
                                            p === '...'
                                                ? <button key={`el-${i}`} className="pg-btn ellipsis">···</button>
                                                : <button
                                                    key={p}
                                                    className={`pg-btn${currentPage === p ? ' active' : ''}`}
                                                    onClick={() => setCurrentPage(p)}
                                                >
                                                    {p}
                                                </button>
                                        )}
                                    </div>

                                    <div style={{ width: 1, height: 20, background: '#ebebeb', margin: '0 2px' }} />

                                    {/* Next */}
                                    <button className="pg-btn" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} title="Next page">
                                        <ChevronRight size={13} strokeWidth={2} />
                                    </button>
                                    {/* Last */}
                                    <button className="pg-btn" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} title="Last page">
                                        <ChevronsRight size={13} strokeWidth={2} />
                                    </button>

                                    {/* Jump to page */}
                                    <div style={{ width: 1, height: 20, background: '#ebebeb', margin: '0 4px' }} />
                                    <span style={{ fontSize: 11, color: '#bbb', fontWeight: 600, whiteSpace: 'nowrap' }}>Go to</span>
                                    <input
                                        type="number"
                                        min={1}
                                        max={totalPages}
                                        defaultValue={currentPage}
                                        key={currentPage}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                const v = parseInt(e.target.value);
                                                if (v >= 1 && v <= totalPages) setCurrentPage(v);
                                            }
                                        }}
                                        onBlur={(e) => {
                                            const v = parseInt(e.target.value);
                                            if (v >= 1 && v <= totalPages) setCurrentPage(v);
                                        }}
                                        style={{
                                            width: 48, height: 32,
                                            border: '1px solid #e8e8e8', borderRadius: 7,
                                            textAlign: 'center', fontSize: 12, fontWeight: 600,
                                            color: '#333', outline: 'none',
                                            fontFamily: 'Sofia Sans, sans-serif',
                                            transition: 'border-color .12s'
                                        }}
                                        onFocus={e => e.target.style.borderColor = '#999'}
                                        onBlurCapture={e => e.target.style.borderColor = '#e8e8e8'}
                                    />
                                    <span style={{ fontSize: 11, color: '#bbb', fontWeight: 500 }}>of {totalPages}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default QRBatchList;