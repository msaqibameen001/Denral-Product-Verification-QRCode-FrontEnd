import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Fetch_Print_Settings,
    Save_Print_Settings
} from '../../../Redux/Action/PrintSettingsAction/PrintSettingsAction';
import {
    X, Printer, LayoutGrid, AlignLeft,
    Hash, Package, Shield, Calendar, Check,
    Loader2, Save, RotateCcw
} from 'lucide-react';

const FIELDS = [
    { key: 'showSerialNo', label: 'Serial Number', hint: 'PRD-2026-XXXXXXXX', icon: Hash },
    { key: 'showProduct', label: 'Product Name', hint: 'Product / brand name', icon: Package },
    { key: 'showWarranty', label: 'Warranty', hint: 'Warranty desc + term', icon: Shield },
    { key: 'showPurchase', label: 'Purchase Date', hint: 'Date of purchase', icon: Calendar },
    { key: 'showValidity', label: 'Valid Till', hint: 'Warranty expiry date', icon: Calendar },
];

const DEFAULT = {
    columns: 4,
    showSerialNo: true,
    showProduct: true,
    showWarranty: true,
    showPurchase: true,
    showValidity: true,
};

// ─────────────────────────────────────────────────────────────────────────────
// PrintSetupModal — GLOBAL settings only
//
// Props:
//   visible  boolean
//   onClose  () => void
//
// No onPrint callback. No batch ID. No config passed anywhere.
// User opens this, changes layout, hits Save → saves to DB → done.
// Every print button in the app reads from Redux (which mirrors DB).
// ─────────────────────────────────────────────────────────────────────────────
const PrintSetupModal = ({ visible, onClose }) => {
    const dispatch = useDispatch();
    const { settings, loading, saving, initialized } = useSelector(s => s.printSettings);

    const [draft, setDraft] = useState(DEFAULT);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (visible && !initialized) dispatch(Fetch_Print_Settings());
    }, [visible, initialized, dispatch]);

    useEffect(() => {
        if (visible && settings) {
            setDraft({ ...settings });
            setHasChanges(false);
        }
    }, [visible, settings]);

    useEffect(() => {
        if (!settings) return;
        setHasChanges(
            draft.columns !== settings.columns ||
            FIELDS.some(f => draft[f.key] !== settings[f.key])
        );
    }, [draft, settings]);

    if (!visible) return null;

    const setColumns = (n) => setDraft(p => ({ ...p, columns: n }));
    const toggle = (key) => setDraft(p => ({ ...p, [key]: !p[key] }));
    const reset = () => setDraft({ ...DEFAULT });

    const handleSave = async () => {
        try {
            await dispatch(Save_Print_Settings({
                columns: draft.columns,
                showSerialNo: draft.showSerialNo,
                showProduct: draft.showProduct,
                showWarranty: draft.showWarranty,
                showPurchase: draft.showPurchase,
                showValidity: draft.showValidity,
            }));
            onClose();
        } catch { /* toast shown in action */ }
    };

    const checkedCount = FIELDS.filter(f => draft[f.key]).length;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sofia+Sans:wght@300;400;500;600;700&display=swap');
                .psm-ov{position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.5);backdrop-filter:blur(5px);display:flex;align-items:center;justify-content:center;padding:24px;animation:psm-fi .15s ease}
                
                /* ── Modal box: flex column, fixed height, no overflow ── */
                .psm-box{
                    background:#fff;border-radius:16px;width:100%;height:550px;max-width:460px;
                    box-shadow:0 32px 80px rgba(0,0,0,.2);
                    font-family:'Sofia Sans',sans-serif;
                    animation:psm-su .2s cubic-bezier(.22,1,.36,1);
                    display:flex;flex-direction:column;overflow:hidden;
                }
                
                /* ── Scrollable body only ── */
                .psm-body{
                    flex:1;overflow-y:auto;overflow-x:hidden;
                    padding:18px 22px 0;
                }
                
                /* ── Thin light scrollbar ── */
                .psm-body::-webkit-scrollbar{width:4px}
                .psm-body::-webkit-scrollbar-track{background:transparent}
                .psm-body::-webkit-scrollbar-thumb{background:#e0e0e0;border-radius:99px}
                .psm-body::-webkit-scrollbar-thumb:hover{background:#c8c8c8}
                .psm-body{scrollbar-width:thin;scrollbar-color:#e0e0e0 transparent}
                
                @keyframes psm-fi{from{opacity:0}to{opacity:1}}
                @keyframes psm-su{from{transform:translateY(12px);opacity:0}to{transform:translateY(0);opacity:1}}
                .psm-col{flex:1;height:68px;border-radius:10px;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;transition:all .15s;outline:none}
                .psm-col:hover:not(.a){border-color:#999!important}
                .psm-fr{display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:9px;border:1.5px solid #ebebeb;background:#fafafa;cursor:pointer;transition:all .12s;user-select:none}
                .psm-fr:hover{border-color:#ccc;background:#f5f5f5}
                .psm-fr.on{border-color:#222;background:#f8f8f8}
                .psm-cb{width:20px;height:20px;border-radius:5px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .12s}
                .psm-cb.on{background:#111}.psm-cb.off{background:#e8e8e8}
                .psm-spin{animation:spin 1s linear infinite}
                @keyframes spin{to{transform:rotate(360deg)}}
                .psm-sec{font-size:10.5px;font-weight:700;color:#aaa;text-transform:uppercase;letter-spacing:.7px;display:flex;align-items:center;gap:6px;margin-bottom:10px}
                .psm-btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;height:38px;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Sofia Sans',sans-serif;transition:all .12s}
                .psm-btn:disabled{opacity:.45;cursor:not-allowed}
            `}</style>

            <div className="psm-ov" onClick={e => e.target === e.currentTarget && onClose()}>
                <div className="psm-box">

                    {/* ── Header — FIXED ── */}
                    <div style={{ padding: '18px 22px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Printer size={16} strokeWidth={1.8} style={{ color: '#fff' }} />
                            </div>
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>Print Setup</div>
                                <div style={{ fontSize: 11, color: '#aaa', marginTop: 1 }}>Global — applies to all batches</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {hasChanges && (
                                <span style={{ fontSize: 10, fontWeight: 700, background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: 4 }}>
                                    Unsaved
                                </span>
                            )}
                            <button onClick={onClose} style={{ width: 30, height: 30, border: '1px solid #e8e8e8', borderRadius: 7, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <X size={14} strokeWidth={2} style={{ color: '#888' }} />
                            </button>
                        </div>
                    </div>

                    {/* ── Scrollable Body ── */}
                    {loading && !initialized ? (
                        <div className="psm-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                            <Loader2 size={20} strokeWidth={1.8} style={{ color: '#ccc' }} className="psm-spin" />
                            <span style={{ fontSize: 13, color: '#bbb', fontFamily: 'Sofia Sans,sans-serif' }}>Loading settings…</span>
                        </div>
                    ) : (
                        <div className="psm-body">

                            {/* ── Columns ── */}
                            <div style={{ marginBottom: 20 }}>
                                <div className="psm-sec"><LayoutGrid size={12} strokeWidth={2} />Columns per Row</div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {[1, 2, 3, 4].map(n => {
                                        const a = draft.columns === n;
                                        return (
                                            <div key={n} className={`psm-col${a ? ' a' : ''}`} onClick={() => setColumns(n)}
                                                style={{ border: `2px solid ${a ? '#111' : '#e8e8e8'}`, background: a ? '#111' : '#fafafa' }}>
                                                <div style={{ display: 'flex', gap: n <= 2 ? 5 : 3 }}>
                                                    {Array.from({ length: n }).map((_, i) => (
                                                        <div key={i} style={{ width: n === 1 ? 22 : n === 2 ? 16 : n === 3 ? 11 : 9, height: 24, borderRadius: 3, background: a ? 'rgba(255,255,255,.25)' : '#d4d4d4' }} />
                                                    ))}
                                                </div>
                                                <span style={{ fontSize: 11, fontWeight: 700, color: a ? '#fff' : '#999' }}>{n} Col{n > 1 ? 's' : ''}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ── Fields ── */}
                            <div style={{ marginBottom: 18 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <div className="psm-sec" style={{ marginBottom: 0 }}><AlignLeft size={12} strokeWidth={2} />Fields to Display</div>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: checkedCount > 0 ? '#22883a' : '#aaa', background: checkedCount > 0 ? '#f0fdf4' : '#f4f4f4', border: `1px solid ${checkedCount > 0 ? '#b7ebc8' : '#e8e8e8'}`, padding: '2px 8px', borderRadius: 4 }}>
                                        {checkedCount} / {FIELDS.length}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {FIELDS.map(({ key, label, hint, icon: Icon }) => {
                                        const on = !!draft[key];
                                        return (
                                            <div key={key} className={`psm-fr${on ? ' on' : ''}`} onClick={() => toggle(key)}>
                                                <div className={`psm-cb ${on ? 'on' : 'off'}`}>
                                                    {on && <Check size={11} strokeWidth={2.8} style={{ color: '#fff' }} />}
                                                </div>
                                                <Icon size={14} strokeWidth={1.8} style={{ color: on ? '#555' : '#ccc', flexShrink: 0 }} />
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: 13, fontWeight: 600, color: on ? '#111' : '#bbb' }}>{label}</div>
                                                    <div style={{ fontSize: 10, color: '#ccc', marginTop: 1 }}>{hint}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                        </div>
                    )}

                    {/* ── Footer — FIXED ── */}
                    <div style={{ padding: '14px 22px 18px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8, flexShrink: 0 }}>
                        <button onClick={reset} title="Reset to defaults"
                            style={{ width: 38, height: 38, border: '1px solid #e8e8e8', borderRadius: 8, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <RotateCcw size={13} strokeWidth={2} style={{ color: '#888' }} />
                        </button>
                        <button onClick={onClose}
                            style={{ flex: 1, height: 38, border: '1px solid #e0e0e0', borderRadius: 8, background: '#fff', fontSize: 12, fontWeight: 600, color: '#666', cursor: 'pointer', fontFamily: 'Sofia Sans,sans-serif' }}>
                            Cancel
                        </button>
                        <button className="psm-btn" onClick={handleSave}
                            disabled={saving || loading || !hasChanges}
                            style={{ flex: 2, background: '#111', color: '#fff' }}>
                            {saving
                                ? <><Loader2 size={13} strokeWidth={2} className="psm-spin" />Saving…</>
                                : <><Save size={13} strokeWidth={1.8} />Save Settings</>
                            }
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
};

export default PrintSetupModal;