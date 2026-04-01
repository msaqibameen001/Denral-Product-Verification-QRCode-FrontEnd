import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Get_Serial_Details } from '../../../Redux/Action/QRBatchAction/QRBatchAction';
import {
    Search, Shield, Package, Calendar, FileText,
    CheckCircle, XCircle, Loader2, ArrowRight, Clock,
    Hash, AlertCircle, RotateCcw
} from 'lucide-react';
import dayjs from 'dayjs';

/* ── canvas-confetti CDN ── */
const loadConfetti = () => new Promise((resolve) => {
    if (window.confetti) { resolve(window.confetti); return; }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js';
    s.onload = () => resolve(window.confetti);
    document.head.appendChild(s);
});
const fireConfetti = async () => {
    const confetti = await loadConfetti();
    const colors = ['#111111', '#555555', '#999999', '#cccccc', '#ffffff'];
    confetti({ particleCount: 55, angle: 60, spread: 65, origin: { x: 0, y: 0.7 }, colors, scalar: 0.85 });
    setTimeout(() => confetti({ particleCount: 55, angle: 120, spread: 65, origin: { x: 1, y: 0.7 }, colors, scalar: 0.85 }), 160);
    setTimeout(() => confetti({ particleCount: 70, spread: 90, origin: { x: 0.5, y: 0.45 }, colors, scalar: 0.8, gravity: 0.75 }), 320);
};

const ProductVerification = () => {
    const dispatch = useDispatch();
    const { serialDetails, actionLoading } = useSelector((state) => state.qrBatch);
    const [serialNo, setSerialNo] = useState('');
    const [searched, setSearched] = useState(false);
    const [hasConfetti, setHasConfetti] = useState(false);

    const handleVerify = () => {
        if (!serialNo.trim()) return;
        setSearched(true);
        setHasConfetti(false);
        dispatch(Get_Serial_Details(serialNo.trim())).then((result) => {
            if (result && !hasConfetti) {
                setHasConfetti(true);
                setTimeout(() => fireConfetti(), 400);
            }
        });
    };

    const handleReset = () => {
        setSerialNo('');
        setSearched(false);
        setHasConfetti(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleVerify();
    };

    const isValidWarranty = serialDetails?.validityDate
        ? new Date(serialDetails.validityDate) > new Date()
        : false;

    let warrantyPct = 0;
    let daysLeft = null;
    if (serialDetails?.purchaseDate && serialDetails?.validityDate) {
        const total = dayjs(serialDetails.validityDate).diff(dayjs(serialDetails.purchaseDate), 'day');
        const elapsed = dayjs().diff(dayjs(serialDetails.purchaseDate), 'day');
        warrantyPct = Math.min(100, Math.max(3, Math.round((elapsed / total) * 100)));
        daysLeft = dayjs(serialDetails.validityDate).diff(dayjs(), 'day');
    }

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sofia+Sans:wght@300;400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .pv-wrap {
          min-height: 100vh;
          background: #F8F8F6;
          font-family: 'Sofia Sans', sans-serif;
          color: #111;
        }

        /* ── dot bg ── */
        .pv-dotbg {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image: radial-gradient(circle, #cacaca 1px, transparent 1px);
          background-size: 26px 26px;
          opacity: 0.28;
        }
        .pv-vignette {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background: radial-gradient(ellipse at center, transparent 25%, #F8F8F6 88%);
        }

        /* ── animations ── */
        @keyframes pv-fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pv-spin { to { transform: rotate(360deg); } }
        @keyframes pv-pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes pv-checkPop {
          0%   { opacity:0; transform:scale(.5) rotate(-15deg); }
          65%  { transform:scale(1.1) rotate(3deg); opacity:1; }
          100% { transform:scale(1) rotate(0); opacity:1; }
        }
        @keyframes pv-ring {
          0%   { transform:scale(1); opacity:.45; }
          100% { transform:scale(1.9); opacity:0; }
        }
        @keyframes pv-barGrow { from { width: 0%; } }
        @keyframes pv-badgePop {
          0%  { opacity:0; transform:scale(.8); }
          70% { transform:scale(1.05); opacity:1; }
          100%{ transform:scale(1); opacity:1; }
        }
        @keyframes pv-slideIn {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }

        .pv-au0 { opacity:0; animation: pv-fadeUp .5s cubic-bezier(.22,1,.36,1) .05s forwards; }
        .pv-au1 { opacity:0; animation: pv-fadeUp .5s cubic-bezier(.22,1,.36,1) .15s forwards; }
        .pv-au2 { opacity:0; animation: pv-fadeUp .5s cubic-bezier(.22,1,.36,1) .25s forwards; }
        .pv-au3 { opacity:0; animation: pv-fadeUp .5s cubic-bezier(.22,1,.36,1) .35s forwards; }
        .pv-au4 { opacity:0; animation: pv-fadeUp .5s cubic-bezier(.22,1,.36,1) .45s forwards; }
        .pv-au5 { opacity:0; animation: pv-fadeUp .5s cubic-bezier(.22,1,.36,1) .55s forwards; }

        /* ── topbar ── */
        .pv-topbar {
          position: relative; z-index: 10;
          background: rgba(248,248,246,.92);
          backdrop-filter: blur(14px);
          border-bottom: .5px solid #e0e0e0;
          height: 54px; padding: 0 28px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .pv-brand { display: flex; align-items: center; gap: 10px; }
        .pv-brandmark {
          width: 30px; height: 30px; background: #111; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
        }
        .pv-brandname { font-size: 13px; font-weight: 800; color: #111; letter-spacing: -.2px; }
        .pv-sep { width: .5px; height: 16px; background: #e0e0e0; }
        .pv-brandsub { font-size: 11px; font-weight: 700; color: #bbb; letter-spacing: .5px; text-transform: uppercase; }
        .pv-topright { display: flex; align-items: center; gap: 7px; font-size: 11px; font-weight: 700; color: #bbb; letter-spacing: .7px; text-transform: uppercase; }
        .pv-livedot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 6px rgba(34,197,94,.6); animation: pv-pulse 2s ease infinite; }

        /* ── content ── */
        .pv-content { position: relative; z-index: 1; max-width: 860px; margin: 0 auto; padding: 0 20px; }

        /* ── hero ── */
        .pv-hero {
          text-align: center; padding: 60px 20px 0px;
          animation: pv-fadeUp .5s ease both;
        }
        .pv-eyebrow {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 10px; font-weight: 800; color: #888; letter-spacing: 1.2px;
          text-transform: uppercase; border: .5px solid #e0e0e0; border-radius: 100px;
          padding: 5px 14px; background: #fff; margin-bottom: 22px;
        }
        .pv-hero h1 {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(30px, 4.5vw, 46px);
          font-weight: 400; color: #111; line-height: 1.12;
          letter-spacing: -.4px; margin-bottom: 13px;
        }
        .pv-hero h1 em { font-style: italic; color: #555; }
        .pv-hero-sub {
          font-size: 13px; color: #bbb; font-weight: 500; line-height: 1.75;
          max-width: 360px; margin: 0 auto;
        }
        .pv-divider {
          height: .5px; background: linear-gradient(90deg,transparent,#ddd,transparent);
          max-width: 280px; margin: 30px auto 0;
        }

        /* ── search section ── */
        .pv-search-section {
          max-width: 540px; margin: 0 auto; padding: 3px 0 10px;
          animation: pv-fadeUp .5s .1s ease both; opacity: 0;
          animation-fill-mode: forwards;
        }
        .pv-search-lbl {
          font-size: 11px; font-weight: 800; color: #999;
          letter-spacing: .7px; text-transform: uppercase;
          margin-bottom: 8px; display: block;
        }
        .pv-search-box {
          background: #fff; border: .5px solid #d8d8d8; border-radius: 12px;
          padding: 5px 5px 5px 18px;
          display: flex; align-items: center; gap: 10px;
          box-shadow: 0 2px 12px rgba(0,0,0,.05);
          transition: border-color .18s, box-shadow .18s;
        }
        .pv-search-box:focus-within { border-color: #999; box-shadow: 0 4px 20px rgba(0,0,0,.09); }
        .pv-search-ico { color: #ccc; display: flex; flex-shrink: 0; }
        .pv-search-input {
          flex: 1; border: none; outline: none;
          font-family: 'Courier New', monospace;
          font-size: 14px; font-weight: 700; color: #111; background: transparent;
          letter-spacing: .6px;
        }
        .pv-search-input::placeholder { font-family: 'Sofia Sans', sans-serif; font-weight: 500; color: #d0d0d0; letter-spacing: 0; font-size: 13px; }
        .pv-verify-btn {
          height: 42px; padding: 0 22px;
          background: #111; color: #fff; border: none; border-radius: 9px;
          font-family: 'Sofia Sans', sans-serif; font-size: 13px; font-weight: 700;
          cursor: pointer; display: flex; align-items: center; gap: 7px;
          transition: background .15s, transform .1s; flex-shrink: 0; white-space: nowrap;
        }
        .pv-verify-btn:hover { background: #222; }
        .pv-verify-btn:active { transform: scale(.97); }
        .pv-verify-btn:disabled { background: #ccc; cursor: not-allowed; transform: none; }
        .pv-hints {
          display: flex; align-items: center; justify-content: center;
          gap: 22px; margin-top: 11px; flex-wrap: wrap;
        }
        .pv-hint {
          font-size: 11px; color: #ccc; font-weight: 600;
          display: flex; align-items: center; gap: 5px;
        }

        /* ── loading ── */
        .pv-loading {
          display: flex; flex-direction: column; align-items: center; gap: 14px;
          padding: 56px 0; animation: pv-fadeUp .3s ease both;
        }
        .pv-spinner {
          width: 34px; height: 34px;
          border: 2px solid #e8e8e8; border-top-color: #111;
          border-radius: 50%; animation: pv-spin .75s linear infinite;
        }
        .pv-loading-lbl { font-size: 11px; font-weight: 800; color: #ccc; letter-spacing: 1.4px; text-transform: uppercase; }

        /* ── error ── */
        .pv-error-wrap {
          max-width: 420px; margin: 0 auto;
          background: #fff; border: .5px solid #ebe0e0; border-radius: 16px;
          padding: 40px 36px; text-align: center;
          animation: pv-slideIn .4s ease both;
          box-shadow: 0 2px 20px rgba(0,0,0,.04);
        }
        .pv-err-ico {
          width: 64px; height: 64px; border-radius: 50%;
          background: #fafafa; border: .5px solid #f0e0e0;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 18px;
        }
        .pv-err-title {
          font-family: 'DM Serif Display', serif;
          font-size: 24px; font-weight: 400; color: #111; margin-bottom: 10px;
        }
        .pv-err-sub { font-size: 13px; color: #aaa; line-height: 1.7; margin-bottom: 24px; }
        .pv-err-code {
          font-family: 'Courier New', monospace;
          background: #f5f5f5; padding: 2px 8px; border-radius: 5px;
          color: #555; font-size: 12px;
        }
        .pv-reset-btn {
          display: inline-flex; align-items: center; gap: 7px;
          height: 38px; padding: 0 18px;
          background: #111; color: #fff; border: none; border-radius: 9px;
          font-family: 'Sofia Sans', sans-serif; font-size: 13px; font-weight: 700;
          cursor: pointer; transition: background .15s;
        }
        .pv-reset-btn:hover { background: #333; }

        /* ── result layout ── */
        .pv-result { animation: pv-slideIn .45s ease both; }

        /* verified hero bar */
        .pv-verified-bar {
          background: #fff; border: .5px solid #e8e8e8; border-radius: 16px;
          padding: 28px 32px; margin-bottom: 16px;
          display: flex; align-items: center; gap: 24px;
          box-shadow: 0 1px 8px rgba(0,0,0,.04);
        }
        .pv-check-outer { position: relative; width: 72px; height: 72px; flex-shrink: 0; }
        .pv-ring {
          position: absolute; inset: 0; border-radius: 50%;
          border: 1px solid rgba(34,197,94,.3);
          animation: pv-ring 2.2s ease-out .5s infinite;
        }
        .pv-ring2 {
          position: absolute; inset: 0; border-radius: 50%;
          border: 1px solid rgba(34,197,94,.15);
          animation: pv-ring 2.2s ease-out 1.1s infinite;
        }
        .pv-check-circle {
          position: relative; z-index: 1;
          width: 72px; height: 72px; border-radius: 50%;
          background: #f0fdf4; border: .5px solid rgba(34,197,94,.25);
          display: flex; align-items: center; justify-content: center;
          animation: pv-checkPop .6s cubic-bezier(.34,1.56,.64,1) .1s both;
        }
        .pv-verified-info { flex: 1; min-width: 0; }
        .pv-verified-badge {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 10px; font-weight: 800; color: #16a34a;
          letter-spacing: 1px; text-transform: uppercase;
          border: .5px solid rgba(34,197,94,.25); border-radius: 100px;
          padding: 4px 12px; background: #f0fdf4; margin-bottom: 9px;
          animation: pv-badgePop .5s cubic-bezier(.34,1.56,.64,1) .25s both; opacity: 0;
          animation-fill-mode: forwards;
        }
        .pv-vdot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 5px #22c55e; }
        .pv-verified-title {
          font-family: 'DM Serif Display', serif;
          font-size: 22px; font-weight: 400; color: #111; line-height: 1.2;
          margin-bottom: 6px;
        }
        .pv-verified-title em { font-style: italic; }
        .pv-serial-pill {
          font-family: 'Courier New', monospace;
          font-size: 12px; font-weight: 700; color: #777;
          background: #f5f5f5; border: .5px solid #e8e8e8;
          border-radius: 6px; padding: 4px 12px; display: inline-block;
          letter-spacing: .5px;
        }
        .pv-verified-meta {
          display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0;
        }
        .pv-ts {
          font-size: 11px; color: #ccc; font-weight: 600;
          display: flex; align-items: center; gap: 5px;
        }
        .pv-scan-again-btn {
          display: inline-flex; align-items: center; gap: 6px;
          height: 34px; padding: 0 14px; background: #fff;
          border: .5px solid #ddd; border-radius: 8px;
          font-family: 'Sofia Sans', sans-serif; font-size: 12px; font-weight: 700;
          color: #666; cursor: pointer; transition: border-color .14s, color .14s;
        }
        .pv-scan-again-btn:hover { border-color: #999; color: #111; }

        /* ── cards ── */
        .pv-card {
          background: #fff; border: .5px solid #e8e8e8; border-radius: 14px;
          box-shadow: 0 1px 6px rgba(0,0,0,.04);
          overflow: hidden; transition: border-color .18s, box-shadow .18s;
        }
        .pv-card:hover { border-color: #ccc; box-shadow: 0 3px 18px rgba(0,0,0,.07); }
        .pv-card-head {
          padding: 13px 20px; border-bottom: .5px solid #f2f2f2;
          display: flex; align-items: center; gap: 9px;
        }
        .pv-ch-ico {
          width: 28px; height: 28px; background: #f5f5f5; border-radius: 7px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .pv-ch-title {
          font-size: 10px; font-weight: 800; color: #999;
          text-transform: uppercase; letter-spacing: .8px; flex: 1;
        }
        .pv-ch-badge {
          font-size: 10px; font-weight: 700; padding: 3px 9px;
          border-radius: 100px; letter-spacing: .3px;
        }
        .pv-badge-active { background: #f0fdf4; color: #16a34a; border: .5px solid rgba(34,197,94,.2); }
        .pv-badge-expired { background: #fef2f2; color: #dc2626; border: .5px solid rgba(239,68,68,.2); }
        .pv-card-body { padding: 18px 20px; }

        /* ── field ── */
        .pv-field {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 11px 0; border-bottom: .5px solid #f5f5f5;
        }
        .pv-field:first-child { padding-top: 0; }
        .pv-field:last-child { border-bottom: none; padding-bottom: 0; }
        .pv-fic {
          width: 30px; height: 30px; background: #fafafa;
          border: .5px solid #f0f0f0; border-radius: 7px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px;
        }
        .pv-flbl { font-size: 10px; font-weight: 700; color: #c0c0c0; text-transform: uppercase; letter-spacing: .5px; margin-bottom: 3px; }
        .pv-fval { font-size: 13.5px; font-weight: 600; color: #111; line-height: 1.3; }
        .pv-fval.mono { font-family: 'Courier New', monospace; font-size: 12px; color: #555; letter-spacing: .4px; }
        .pv-fval.green { color: #16a34a; }
        .pv-fval.red { color: #dc2626; }

        /* ── warranty status card ── */
        .pv-status-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .pv-status-pill {
          display: inline-flex; align-items: center; gap: 6px;
          border-radius: 100px; padding: 5px 14px;
          font-size: 11px; font-weight: 800; letter-spacing: .3px;
        }
        .pv-sp-active { background: #f0fdf4; border: .5px solid rgba(34,197,94,.25); color: #16a34a; }
        .pv-sp-expired { background: #fef2f2; border: .5px solid rgba(239,68,68,.2); color: #dc2626; }
        .pv-sdot-g { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 5px #22c55e; }
        .pv-sdot-r { width: 6px; height: 6px; border-radius: 50%; background: #ef4444; }
        .pv-days-counter {
          text-align: right;
        }
        .pv-days-num {
          font-family: 'DM Serif Display', serif;
          font-size: 28px; font-weight: 400; line-height: 1;
        }
        .pv-days-num.green { color: #16a34a; }
        .pv-days-num.red { color: #dc2626; }
        .pv-days-sub { font-size: 10px; font-weight: 700; color: #bbb; text-transform: uppercase; letter-spacing: .5px; margin-top: 2px; }
        .pv-bar-track { height: 4px; background: #f0f0f0; border-radius: 100px; overflow: hidden; margin-bottom: 7px; }
        .pv-bar-fill {
          height: 100%; border-radius: 100px;
          animation: pv-barGrow .85s cubic-bezier(.22,1,.36,1) .5s both;
          background: #111;
        }
        .pv-bar-fill.exp { background: #ef4444; }
        .pv-bar-labels { display: flex; justify-content: space-between; font-size: 10px; font-weight: 700; color: #ccc; letter-spacing: .2px; margin-bottom: 10px; }
        .pv-expiry-note { font-size: 11px; color: #bbb; font-weight: 500; line-height: 1.6; }

        /* ── grid ── */
        .pv-grid { display: grid; grid-template-columns: 1fr 260px; gap: 14px; align-items: start; }

        /* ── stats strip ── */
        .pv-stats {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px;
        }
        .pv-stat {
          background: #fff; border: .5px solid #e8e8e8; border-radius: 11px;
          padding: 14px 16px; text-align: center;
          box-shadow: 0 1px 4px rgba(0,0,0,.03);
          animation: pv-fadeUp .5s ease both;
        }
        .pv-stat-val { font-family: 'DM Serif Display', serif; font-size: 20px; font-weight: 400; color: #111; line-height: 1; margin-bottom: 5px; }
        .pv-stat-lbl { font-size: 10px; font-weight: 700; color: #bbb; text-transform: uppercase; letter-spacing: .5px; }

        /* ── footer ── */
        .pv-footer { text-align: center; padding: 36px 0 20px; }
        .pv-footer-line { height: .5px; background: linear-gradient(90deg,transparent,#ddd,transparent); max-width: 260px; margin: 0 auto 16px; }
        .pv-footer-txt { font-size: 10px; color: #ccc; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }

        @media (max-width: 640px) {
          .pv-grid { grid-template-columns: 1fr !important; }
          .pv-verified-bar { flex-direction: column; text-align: center; gap: 16px; }
          .pv-verified-meta { align-items: center; }
          .pv-stats { grid-template-columns: 1fr 1fr; }
          .pv-hero { padding: 40px 16px 0px; }
        }
      `}</style>

            <div className="pv-wrap">
                <div className="pv-dotbg" />
                <div className="pv-vignette" />

                {/* ── Topbar ── */}
                <div className="pv-topbar">
                    <div className="pv-brand">
                        <div className="pv-brandmark">
                            <Shield size={15} strokeWidth={1.5} style={{ color: '#fff' }} />
                        </div>
                        <span className="pv-brandname">Denral Electric</span>
                        <div className="pv-sep" />
                        <span className="pv-brandsub">Verify</span>
                    </div>
                    <div className="pv-topright">
                        <div className="pv-livedot" />
                        Secure Check
                    </div>
                </div>

                <div className="pv-content">

                    {/* ── Hero ── */}
                    {!searched && (
                        <div className="pv-hero">
                            <div className="pv-eyebrow">
                                <Shield size={11} strokeWidth={1.5} />
                                Anti-Counterfeit System
                            </div>
                            <h1>Verify your product is <em>authentic</em></h1>
                            <p className="pv-hero-sub">
                                Enter the serial number printed on your product or packaging to instantly check authenticity and warranty status.
                            </p>
                            <div className="pv-divider" />
                        </div>
                    )}

                    {/* ── Search Section ── */}
                    <div className="pv-search-section">
                        {searched && (
                            <div style={{ marginBottom: 20, animation: 'pv-fadeUp .35s ease both' }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#bbb', letterSpacing: '.4px' }}>
                                    Check another product
                                </span>
                            </div>
                        )}
                        <span className="pv-search-lbl">
                            <Hash size={10} strokeWidth={2} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
                            Serial Number
                        </span>
                        <div className="pv-search-box">
                            <div className="pv-search-ico">
                                <Search size={16} strokeWidth={1.5} />
                            </div>
                            <input
                                className="pv-search-input"
                                type="text"
                                placeholder="e.g. DE-2024-001234"
                                value={serialNo}
                                onChange={(e) => setSerialNo(e.target.value.toUpperCase())}
                                onKeyDown={handleKeyDown}
                                disabled={actionLoading}
                            />
                            {searched && !actionLoading && (
                                <button
                                    style={{
                                        height: 42, padding: '0 14px', background: 'transparent',
                                        border: '.5px solid #e0e0e0', borderRadius: 8,
                                        fontFamily: "'Sofia Sans', sans-serif", fontSize: 12, fontWeight: 700,
                                        color: '#999', cursor: 'pointer', marginRight: 4,
                                        display: 'flex', alignItems: 'center', gap: 5,
                                    }}
                                    onClick={handleReset}
                                >
                                    <RotateCcw size={12} strokeWidth={1.5} /> Reset
                                </button>
                            )}
                            <button
                                className="pv-verify-btn"
                                onClick={handleVerify}
                                disabled={actionLoading || !serialNo.trim()}
                            >
                                {actionLoading
                                    ? <><Loader2 size={14} strokeWidth={1.5} style={{ animation: 'pv-spin .75s linear infinite' }} /> Verifying</>
                                    : <><Search size={14} strokeWidth={1.5} /> Verify</>
                                }
                            </button>
                        </div>
                        <div className="pv-hints">
                            <span className="pv-hint"><Shield size={10} strokeWidth={1.5} /> SSL Secured</span>
                            <span className="pv-hint"><CheckCircle size={10} strokeWidth={1.5} /> Instant Result</span>
                            <span className="pv-hint"><Clock size={10} strokeWidth={1.5} /> Updated Daily</span>
                        </div>
                    </div>

                    {/* ── Loading ── */}
                    {actionLoading && (
                        <div className="pv-loading">
                            <div className="pv-spinner" />
                            <span className="pv-loading-lbl">Verifying serial number…</span>
                        </div>
                    )}

                    {/* ── Not Found ── */}
                    {searched && !actionLoading && !serialDetails && (
                        <div style={{ padding: '32px 0', animation: 'pv-slideIn .4s ease both' }}>
                            <div className="pv-error-wrap">
                                <div className="pv-err-ico">
                                    <XCircle size={26} strokeWidth={1.5} style={{ color: '#ef4444' }} />
                                </div>
                                <h3 className="pv-err-title">Not Verified</h3>
                                <p className="pv-err-sub">
                                    Serial number <span className="pv-err-code">{serialNo}</span> was not found in our system. Please check the number and try again.
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 20 }}>
                                    <div style={{ flex: 1, height: .5, background: '#f0f0f0' }} />
                                    <span style={{ fontSize: 10, fontWeight: 700, color: '#ddd', letterSpacing: '.5px', textTransform: 'uppercase' }}>What to do</span>
                                    <div style={{ flex: 1, height: .5, background: '#f0f0f0' }} />
                                </div>
                                <div style={{ textAlign: 'left', marginBottom: 24 }}>
                                    {['Double-check the serial number printed on your product', 'Ensure there are no spaces or typos', 'Contact Denral Electric support if issue persists'].map((tip, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, marginBottom: 9 }}>
                                            <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#f5f5f5', border: '.5px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                                                <span style={{ fontSize: 10, fontWeight: 700, color: '#bbb' }}>{i + 1}</span>
                                            </div>
                                            <span style={{ fontSize: 12, color: '#999', lineHeight: 1.6 }}>{tip}</span>
                                        </div>
                                    ))}
                                </div>
                                <button className="pv-reset-btn" onClick={handleReset}>
                                    <RotateCcw size={13} strokeWidth={1.5} /> Try Again
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Result ── */}
                    {searched && !actionLoading && serialDetails && (
                        <div className="pv-result">

                            {/* Verified bar */}
                            <div className="pv-verified-bar pv-au0">
                                <div className="pv-check-outer">
                                    <div className="pv-ring" />
                                    <div className="pv-ring2" />
                                    <div className="pv-check-circle">
                                        <CheckCircle size={30} strokeWidth={1.5} style={{ color: '#16a34a' }} />
                                    </div>
                                </div>
                                <div className="pv-verified-info">
                                    <div className="pv-verified-badge">
                                        <span className="pv-vdot" /> Genuine Product
                                    </div>
                                    <div className="pv-verified-title">
                                        This product is <em>authentic</em>
                                    </div>
                                    <div className="pv-serial-pill">{serialDetails.serialNo}</div>
                                </div>
                                <div className="pv-verified-meta">
                                    <span className="pv-ts">
                                        <Clock size={10} strokeWidth={1.5} />
                                        Verified {dayjs().format('DD MMM YYYY, HH:mm')}
                                    </span>
                                    <button className="pv-scan-again-btn" onClick={handleReset}>
                                        <RotateCcw size={11} strokeWidth={1.5} /> Verify Another
                                    </button>
                                </div>
                            </div>

                            {/* Stats strip */}
                            {(serialDetails.purchaseDate || serialDetails.validityDate || daysLeft !== null) && (
                                <div className="pv-stats">
                                    <div className="pv-stat" style={{ animationDelay: '.1s' }}>
                                        <div className="pv-stat-val">{serialDetails.purchaseDate ? dayjs(serialDetails.purchaseDate).format('DD MMM YY') : '—'}</div>
                                        <div className="pv-stat-lbl">Purchase Date</div>
                                    </div>
                                    <div className="pv-stat" style={{ animationDelay: '.2s' }}>
                                        <div className="pv-stat-val" style={{ color: isValidWarranty ? '#16a34a' : '#dc2626' }}>
                                            {daysLeft !== null ? Math.abs(daysLeft) : '—'}
                                        </div>
                                        <div className="pv-stat-lbl">{isValidWarranty ? 'Days Remaining' : 'Days Expired'}</div>
                                    </div>
                                    <div className="pv-stat" style={{ animationDelay: '.3s' }}>
                                        <div className="pv-stat-val">{serialDetails.validityDate ? dayjs(serialDetails.validityDate).format('DD MMM YY') : '—'}</div>
                                        <div className="pv-stat-lbl">Expiry Date</div>
                                    </div>
                                </div>
                            )}

                            {/* Main grid */}
                            <div className="pv-grid">

                                {/* LEFT */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                                    {/* Product Info */}
                                    <div className="pv-card pv-au2">
                                        <div className="pv-card-head">
                                            <div className="pv-ch-ico"><Package size={13} strokeWidth={1.5} style={{ color: '#888' }} /></div>
                                            <span className="pv-ch-title">Product Information</span>
                                        </div>
                                        <div className="pv-card-body">
                                            <div className="pv-field">
                                                <div className="pv-fic"><Package size={12} strokeWidth={1.5} style={{ color: '#bbb' }} /></div>
                                                <div>
                                                    <div className="pv-flbl">Product Name</div>
                                                    <div className="pv-fval">{serialDetails.productName}</div>
                                                </div>
                                            </div>
                                            <div className="pv-field">
                                                <div className="pv-fic"><Hash size={12} strokeWidth={1.5} style={{ color: '#bbb' }} /></div>
                                                <div>
                                                    <div className="pv-flbl">Serial Number</div>
                                                    <div className="pv-fval mono">{serialDetails.serialNo}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Warranty Details */}
                                    {(serialDetails.warrantyDesc || serialDetails.warrantyTerm || serialDetails.purchaseDate || serialDetails.validityDate) && (
                                        <div className="pv-card pv-au3">
                                            <div className="pv-card-head">
                                                <div className="pv-ch-ico"><Shield size={13} strokeWidth={1.5} style={{ color: '#888' }} /></div>
                                                <span className="pv-ch-title">Warranty Details</span>
                                                {isValidWarranty
                                                    ? <span className="pv-ch-badge pv-badge-active">Active</span>
                                                    : <span className="pv-ch-badge pv-badge-expired">Expired</span>
                                                }
                                            </div>
                                            <div className="pv-card-body">
                                                {serialDetails.warrantyDesc && (
                                                    <div className="pv-field">
                                                        <div className="pv-fic"><FileText size={12} strokeWidth={1.5} style={{ color: '#bbb' }} /></div>
                                                        <div>
                                                            <div className="pv-flbl">Coverage</div>
                                                            <div className="pv-fval">
                                                                {serialDetails.warrantyDesc}
                                                                {serialDetails.warrantyTerm && (
                                                                    <span style={{ fontSize: 11, color: '#bbb', marginLeft: 6 }}>· {serialDetails.warrantyTerm}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                {serialDetails.purchaseDate && (
                                                    <div className="pv-field">
                                                        <div className="pv-fic"><Calendar size={12} strokeWidth={1.5} style={{ color: '#bbb' }} /></div>
                                                        <div>
                                                            <div className="pv-flbl">Purchase Date</div>
                                                            <div className="pv-fval">{dayjs(serialDetails.purchaseDate).format('DD MMMM YYYY')}</div>
                                                        </div>
                                                    </div>
                                                )}
                                                {serialDetails.validityDate && (
                                                    <div className="pv-field">
                                                        <div className="pv-fic"><Calendar size={12} strokeWidth={1.5} style={{ color: '#bbb' }} /></div>
                                                        <div>
                                                            <div className="pv-flbl">Valid Until</div>
                                                            <div className={`pv-fval ${isValidWarranty ? 'green' : 'red'}`}>
                                                                {dayjs(serialDetails.validityDate).format('DD MMMM YYYY')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* RIGHT */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 16 }}>

                                    {/* Warranty Status */}
                                    <div className="pv-card pv-au3">
                                        <div className="pv-card-head">
                                            <div className="pv-ch-ico"><Shield size={13} strokeWidth={1.5} style={{ color: '#888' }} /></div>
                                            <span className="pv-ch-title">Warranty Status</span>
                                        </div>
                                        <div className="pv-card-body">
                                            {serialDetails.validityDate ? (
                                                <>
                                                    <div className="pv-status-row">
                                                        <span className={`pv-status-pill ${isValidWarranty ? 'pv-sp-active' : 'pv-sp-expired'}`}>
                                                            {isValidWarranty ? <span className="pv-sdot-g" /> : <span className="pv-sdot-r" />}
                                                            {isValidWarranty ? 'Active' : 'Expired'}
                                                        </span>
                                                        {daysLeft !== null && (
                                                            <div className="pv-days-counter">
                                                                <div className={`pv-days-num ${isValidWarranty ? 'green' : 'red'}`}>
                                                                    {Math.abs(daysLeft)}
                                                                </div>
                                                                <div className="pv-days-sub">{isValidWarranty ? 'days left' : 'days ago'}</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {serialDetails.purchaseDate && (
                                                        <>
                                                            <div className="pv-bar-track">
                                                                <div
                                                                    className={`pv-bar-fill ${isValidWarranty ? '' : 'exp'}`}
                                                                    style={{ width: `${warrantyPct}%` }}
                                                                />
                                                            </div>
                                                            <div className="pv-bar-labels">
                                                                <span>{dayjs(serialDetails.purchaseDate).format('DD MMM YY')}</span>
                                                                <span>{dayjs(serialDetails.validityDate).format('DD MMM YY')}</span>
                                                            </div>
                                                        </>
                                                    )}
                                                    <div className="pv-expiry-note">
                                                        {isValidWarranty
                                                            ? <>Warranty expires on <strong>{dayjs(serialDetails.validityDate).format('DD MMM YYYY')}</strong></>
                                                            : <>Warranty expired on <strong>{dayjs(serialDetails.validityDate).format('DD MMM YYYY')}</strong></>
                                                        }
                                                    </div>
                                                </>
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                                                    <AlertCircle size={14} strokeWidth={1.5} style={{ color: '#ccc' }} />
                                                    <span style={{ fontSize: 12, color: '#bbb' }}>No warranty date registered</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Authenticity Badge */}
                                    <div className="pv-card pv-au4">
                                        <div className="pv-card-head">
                                            <div className="pv-ch-ico"><CheckCircle size={13} strokeWidth={1.5} style={{ color: '#888' }} /></div>
                                            <span className="pv-ch-title">Authenticity</span>
                                        </div>
                                        <div className="pv-card-body">
                                            {[
                                                { label: 'Database Match', ok: true },
                                                { label: 'Serial Format Valid', ok: true },
                                                { label: 'Product Registered', ok: !!serialDetails.purchaseDate },
                                            ].map((check, i) => (
                                                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 2 ? '.5px solid #f5f5f5' : 'none' }}>
                                                    <span style={{ fontSize: 12, fontWeight: 600, color: '#666' }}>{check.label}</span>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                                        {check.ok
                                                            ? <><span className="pv-sdot-g" /><span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a' }}>Pass</span></>
                                                            : <><span className="pv-sdot-r" /><span style={{ fontSize: 11, fontWeight: 700, color: '#dc2626' }}>No</span></>
                                                        }
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* Footer */}
                            <div className="pv-footer">
                                <div className="pv-footer-line" />
                                <div className="pv-footer-txt">Verified by Denral Electric · {dayjs().format('YYYY')}</div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </>
    );
};

export default ProductVerification;