import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Get_Serial_Details } from '../../../Redux/Action/QRBatchAction/QRBatchAction';
import {
  ArrowLeft, Package, Shield, Calendar,
  FileText, Loader2, CheckCircle, XCircle, Download, QrCode
} from 'lucide-react';
import dayjs from 'dayjs';
import logoMain from '../../../assets/images/users/SASS-LOGO-removebg.png';

/* ── canvas-confetti loaded from CDN via script tag ── */
const loadConfetti = () => new Promise((resolve) => {
  if (window.confetti) { resolve(window.confetti); return; }
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js';
  s.onload = () => resolve(window.confetti);
  document.head.appendChild(s);
});

const fireConfetti = async () => {
  const confetti = await loadConfetti();
  const colors = ['#22c55e', '#16a34a', '#4ade80', '#bbf7d0', '#ffffff', '#d1fae5'];

  // Left burst
  confetti({ particleCount: 60, angle: 60, spread: 70, origin: { x: 0, y: 0.65 }, colors, scalar: 0.9 });
  // Right burst
  setTimeout(() => {
    confetti({ particleCount: 60, angle: 120, spread: 70, origin: { x: 1, y: 0.65 }, colors, scalar: 0.9 });
  }, 150);
  // Center shower
  setTimeout(() => {
    confetti({ particleCount: 80, spread: 100, origin: { x: 0.5, y: 0.4 }, colors, scalar: 0.8, gravity: 0.7 });
  }, 300);
};

const SerialScan = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { serialNo } = useParams();
  const { serialDetails, actionLoading } = useSelector((state) => state.qrBatch);
  const [visible, setVisible] = useState(false);
  const confettiFired = useRef(false);

  useEffect(() => {
    if (serialNo) dispatch(Get_Serial_Details(serialNo));
  }, [dispatch, serialNo]);

  useEffect(() => {
    if (serialDetails && !actionLoading) {
      // Stagger entrance
      const t = setTimeout(() => setVisible(true), 80);
      // Fire confetti only once, only if verified
      if (!confettiFired.current) {
        confettiFired.current = true;
        setTimeout(() => fireConfetti(), 500);
      }
      return () => clearTimeout(t);
    }
  }, [serialDetails, actionLoading]);

  const isValidWarranty = serialDetails?.validityDate
    ? new Date(serialDetails.validityDate) > new Date()
    : false;

  const downloadQR = (qr, type) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${qr.qrImageBase64}`;
    link.download = `${serialDetails.serialNo}_${type}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Loading ──
  if (actionLoading) return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sofia+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes spin-r { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:.4}50%{opacity:1} }
      `}</style>
      <div style={{ minHeight: '100vh', background: '#F7F7F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Sofia Sans, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, margin: '0 auto 18px', border: '2.5px solid #e0e0e0', borderTopColor: '#111', borderRadius: '50%', animation: 'spin-r .8s linear infinite' }} />
          <p style={{ fontSize: 12, color: '#aaa', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 700 }}>Verifying</p>
        </div>
      </div>
    </>
  );

  // ── Not Found ──
  if (!serialDetails) return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sofia+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
      `}</style>
      <div style={{ minHeight: '100vh', background: '#F7F7F5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'Sofia Sans, sans-serif' }}>
        <div style={{ maxWidth: 400, width: '100%', background: '#fff', border: '1px solid #f0e0e0', borderRadius: 20, padding: '48px 40px', textAlign: 'center', animation: 'fadeUp .5s ease forwards', boxShadow: '0 4px 40px rgba(0,0,0,0.06)' }}>
          <div style={{ width: 68, height: 68, borderRadius: '50%', background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px' }}>
            <XCircle size={30} strokeWidth={1.5} style={{ color: '#ef4444' }} />
          </div>
          <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 26, color: '#111', marginBottom: 10 }}>Not Verified</h2>
          <p style={{ fontSize: 13, color: '#999', lineHeight: 1.7, marginBottom: 28 }}>
            Serial <span style={{ fontFamily: 'Courier New, monospace', background: '#f5f5f5', padding: '1px 7px', borderRadius: 4, color: '#555' }}>{serialNo}</span> was not found in our system.
          </p>
          <button onClick={() => navigate('/')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 40, padding: '0 20px', background: '#111', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Sofia Sans, sans-serif' }}>
            <ArrowLeft size={14} strokeWidth={2} /> Go Back
          </button>
        </div>
      </div>
    </>
  );

  // Warranty progress %
  let warrantyPct = 0;
  if (serialDetails.purchaseDate && serialDetails.validityDate) {
    const total = dayjs(serialDetails.validityDate).diff(dayjs(serialDetails.purchaseDate), 'day');
    const elapsed = dayjs().diff(dayjs(serialDetails.purchaseDate), 'day');
    warrantyPct = Math.min(100, Math.max(3, Math.round((elapsed / total) * 100)));
  }
  const daysLeft = serialDetails.validityDate ? dayjs(serialDetails.validityDate).diff(dayjs(), 'day') : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sofia+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ss { min-height: 100vh; background: #F7F7F5; font-family: 'Sofia Sans', sans-serif; color: #111; }

        /* ── Subtle dot pattern bg ── */
        .ss-bg {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image: radial-gradient(circle, #d4d4d4 1px, transparent 1px);
          background-size: 28px 28px;
          opacity: 0.35;
        }
        /* Soft white vignette over dots */
        .ss-bg-vignette {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background: radial-gradient(ellipse at center, transparent 30%, #F7F7F5 90%);
        }

        /* ── Animations ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes checkPop {
          0%   { opacity: 0; transform: scale(0.5) rotate(-15deg); }
          65%  { transform: scale(1.12) rotate(4deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes ringExpand {
          0%   { transform: scale(1); opacity: .5; }
          100% { transform: scale(1.9); opacity: 0; }
        }
        @keyframes shimmerGreen {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes barGrow {
          from { width: 0%; }
        }
        @keyframes countUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes badgePop {
          0%   { opacity: 0; transform: scale(0.8); }
          70%  { transform: scale(1.06); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        .au0 { opacity:0; animation: fadeUp .55s cubic-bezier(.22,1,.36,1) .05s forwards; }
        .au1 { opacity:0; animation: fadeUp .55s cubic-bezier(.22,1,.36,1) .15s forwards; }
        .au2 { opacity:0; animation: fadeUp .55s cubic-bezier(.22,1,.36,1) .25s forwards; }
        .au3 { opacity:0; animation: fadeUp .55s cubic-bezier(.22,1,.36,1) .36s forwards; }
        .au4 { opacity:0; animation: fadeUp .55s cubic-bezier(.22,1,.36,1) .47s forwards; }
        .au5 { opacity:0; animation: fadeUp .55s cubic-bezier(.22,1,.36,1) .58s forwards; }
        .fi0 { opacity:0; animation: fadeIn .4s ease .1s forwards; }

        /* ── Top Bar ── */
        .ss-topbar {
          position: relative; z-index: 10;
          background: rgba(247,247,245,.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #e8e8e8;
          padding: 0 24px; height: 52px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .back-btn {
          display: inline-flex; align-items: center; gap: 7px;
          height: 32px; padding: 0 12px;
          background: #fff; border: 1px solid #e0e0e0; border-radius: 8px;
          font-size: 12px; font-weight: 700; color: #555;
          cursor: pointer; font-family: 'Sofia Sans', sans-serif;
          transition: border-color .15s, color .15s;
        }
        .back-btn:hover { border-color: #999; color: #111; }

        /* ── Hero ── */
        .hero {
          position: relative; z-index: 1;
          max-width: 680px; margin: 0 auto;
          padding: 52px 24px 36px;
          text-align: center;
        }

        /* check icon */
        .check-outer {
          position: relative; width: 88px; height: 88px; margin: 0 auto 26px;
        }
        .check-ring {
          position: absolute; inset: 0; border-radius: 50%;
          border: 1.5px solid rgba(34,197,94,0.35);
          animation: ringExpand 2s ease-out .6s infinite;
        }
        .check-ring2 {
          position: absolute; inset: 0; border-radius: 50%;
          border: 1.5px solid rgba(34,197,94,0.2);
          animation: ringExpand 2s ease-out 1.1s infinite;
        }
        .check-circle {
          position: relative; z-index: 1;
          width: 88px; height: 88px; border-radius: 50%;
          background: linear-gradient(145deg, #f0fdf4, #dcfce7);
          border: 1.5px solid rgba(34,197,94,0.25);
          box-shadow: 0 8px 32px rgba(34,197,94,0.12), 0 2px 8px rgba(34,197,94,0.08);
          display: flex; align-items: center; justify-content: center;
          animation: checkPop .65s cubic-bezier(.34,1.56,.64,1) .1s both;
        }

        /* verified badge pill */
        .verified-badge {
          display: inline-flex; align-items: center; gap: 7px;
          background: #f0fdf4;
          border: 1px solid rgba(34,197,94,0.25);
          border-radius: 100px; padding: 5px 16px;
          font-size: 11px; font-weight: 800;
          color: #16a34a; letter-spacing: 1px; text-transform: uppercase;
          margin-bottom: 18px;
          animation: badgePop .5s cubic-bezier(.34,1.56,.64,1) .3s both;
        }
        .v-dot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 6px #22c55e; }

        /* hero title */
        .hero-title {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(34px, 5.5vw, 50px);
          font-weight: 400; line-height: 1.1;
          color: #111; margin-bottom: 14px;
          letter-spacing: -0.5px;
        }
        .hero-title em { font-style: italic; color: #16a34a; }

        /* serial pill */
        .serial-pill {
          display: inline-block;
          font-family: 'Courier New', monospace;
          font-size: 13px; font-weight: 700;
          color: #555; background: #fff;
          border: 1px solid #e8e8e8;
          border-radius: 8px; padding: 8px 18px;
          letter-spacing: 1px;
          box-shadow: 0 1px 4px rgba(0,0,0,.04);
        }

        .hero-divider {
          height: 1px; max-width: 280px; margin: 28px auto 0;
          background: linear-gradient(90deg, transparent, #e0e0e0, transparent);
        }

        /* ── Cards ── */
        .ss-card {
          background: #fff;
          border: 1px solid #ebebeb;
          border-radius: 14px;
          overflow: hidden;
          transition: border-color .2s, box-shadow .2s;
          box-shadow: 0 1px 6px rgba(0,0,0,.04);
        }
        .ss-card:hover {
          border-color: #d0d0d0;
          box-shadow: 0 4px 20px rgba(0,0,0,.07);
        }
        .card-head {
          padding: 14px 20px;
          border-bottom: 1px solid #f5f5f5;
          display: flex; align-items: center; gap: 10px;
        }
        .card-head-icon {
          width: 30px; height: 30px; border-radius: 8px;
          background: #f4f4f4;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .card-head-title {
          font-size: 11px; font-weight: 800; color: #888;
          text-transform: uppercase; letter-spacing: .8px;
        }
        .card-body { padding: 20px; }

        /* field */
        .field { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f5f5f5; }
        .field:last-child { border-bottom: none; padding-bottom: 0; }
        .field:first-child { padding-top: 0; }
        .field-ico { width: 32px; height: 32px; background: #fafafa; border-radius: 8px; border: 1px solid #f0f0f0; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
        .f-lbl { font-size: 10px; font-weight: 700; color: #bbb; text-transform: uppercase; letter-spacing: .6px; margin-bottom: 4px; }
        .f-val { font-size: 14px; font-weight: 600; color: #111; line-height: 1.3; }
        .f-val.mono { font-family: 'Courier New', monospace; font-size: 12.5px; color: #555; letter-spacing: .4px; }

        /* ── Status card ── */
        .status-active {
          display: inline-flex; align-items: center; gap: 6px;
          background: #f0fdf4; border: 1px solid rgba(34,197,94,.25);
          border-radius: 100px; padding: 4px 13px;
          font-size: 11px; font-weight: 800; color: #16a34a; letter-spacing: .4px;
        }
        .status-expired {
          display: inline-flex; align-items: center; gap: 6px;
          background: #fef2f2; border: 1px solid rgba(239,68,68,.2);
          border-radius: 100px; padding: 4px 13px;
          font-size: 11px; font-weight: 800; color: #dc2626; letter-spacing: .4px;
        }
        .s-dot-g { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 5px #22c55e; }
        .s-dot-r { width: 6px; height: 6px; border-radius: 50%; background: #ef4444; }

        /* warranty bar */
        .w-bar-track { height: 5px; background: #f0f0f0; border-radius: 100px; overflow: hidden; margin: 14px 0 7px; }
        .w-bar-fill {
          height: 100%; border-radius: 100px;
          background: linear-gradient(90deg, #22c55e, #4ade80);
          animation: barGrow .9s cubic-bezier(.22,1,.36,1) .6s both;
        }
        .w-bar-fill.exp { background: linear-gradient(90deg, #ef4444, #f87171); }
        .w-bar-labels { display: flex; justify-content: space-between; font-size: 9.5px; font-weight: 700; color: #bbb; letter-spacing: .3px; }

        /* days left counter */
        .days-chip {
          display: inline-flex; align-items: baseline; gap: 4px;
          margin-top: 10px;
          background: #f0fdf4; border-radius: 8px; padding: 6px 12px;
          animation: countUp .5s ease .7s both;
        }
        .days-chip.exp { background: #fef2f2; }
        .days-num { font-family: 'DM Serif Display', serif; font-size: 26px; color: #16a34a; line-height: 1; }
        .days-num.exp { color: #dc2626; }
        .days-lbl { font-size: 11px; font-weight: 700; color: #16a34a; }
        .days-lbl.exp { color: #dc2626; }

        /* ── QR mini card ── */
        .qr-row-item {
          display: flex; align-items: center; gap: 14px;
          padding: 12px; border-radius: 10px;
          background: #fafafa; border: 1px solid #f0f0f0;
          transition: border-color .15s;
          margin-bottom: 8px;
        }
        .qr-row-item:last-child { margin-bottom: 0; }
        .qr-row-item:hover { border-color: #d0d0d0; }
        .qr-row-item img { width: 64px; height: 64px; display: block; border-radius: 6px; flex-shrink: 0; background: #fff; padding: 3px; border: 1px solid #ebebeb; }
        .qr-tag { display: inline-flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: .4px; margin-bottom: 6px; }
        .qr-tag.product { background: #111; color: #fff; }
        .qr-tag.box { background: #f0f0f0; color: #555; }
        .qr-dl {
          display: inline-flex; align-items: center; gap: 5px;
          height: 26px; padding: 0 10px;
          background: #fff; border: 1px solid #e0e0e0; border-radius: 6px;
          font-size: 10px; font-weight: 700; color: #666; cursor: pointer;
          font-family: 'Sofia Sans', sans-serif; transition: all .12s;
        }
        .qr-dl:hover { border-color: #111; color: #111; }

        /* ── Footer ── */
        .ss-footer { position: relative; z-index: 1; text-align: center; padding: 32px 24px 40px; }
        .footer-line { height: 1px; background: linear-gradient(90deg,transparent,#e0e0e0,transparent); max-width: 300px; margin: 0 auto 20px; }
        .footer-txt { font-size: 11px; color: #ccc; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; }

        /* Mobile */
        @media (max-width: 640px) {
          .ss-layout { grid-template-columns: 1fr !important; }
          .hero { padding: 36px 16px 28px; }
        }
      `}</style>

      <div className="ss fi0">
        <div className="ss-bg" />
        <div className="ss-bg-vignette" />

        {/* Top bar */}
        {/* <div className="ss-topbar">
          <button className="back-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={13} strokeWidth={2.2} /> Back
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
            <span style={{ fontSize: 11, fontWeight: 800, color: '#888', letterSpacing: '1px', textTransform: 'uppercase' }}>Genuine</span>
          </div>
        </div> */}

        {/* ── Hero ── */}
        <div className="hero">
          <div className="au0" style={{ marginBottom: 5 }}>
            <img
              src={logoMain}
              alt="SASS Logo"
              style={{
                height: 80,
                width: 'auto',
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.08))'
              }}
            />
          </div>
          {/* Animated check */}
          <div className="check-outer">
            <div className="check-ring" />
            <div className="check-ring2" />
            <div className="check-circle">
              <CheckCircle size={36} strokeWidth={1.5} style={{ color: '#16a34a' }} />
            </div>
          </div>

          <div className="au0">
            <div className="verified-badge">
              <span className="v-dot" /> Product Verified
            </div>
          </div>

          <div className="au1">
            <h1 className="hero-title">
              This product is <em>genuine</em>
            </h1>
          </div>

          <div className="au2">
            <p style={{ fontSize: 13, color: '#aaa', marginBottom: 14, fontWeight: 500 }}>Serial Number</p>
            <div className="serial-pill">{serialDetails.serialNo}</div>
          </div>

          <div className="hero-divider" />
        </div>

        {/* ── Main Layout ── */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto', padding: '0 24px 24px' }}>
          <div className="ss-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 264px', gap: 14, alignItems: 'start' }}>

            {/* LEFT */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Product Info */}
              <div className="ss-card au3">
                <div className="card-head">
                  <div className="card-head-icon"><Package size={14} strokeWidth={1.8} style={{ color: '#666' }} /></div>
                  <span className="card-head-title">Product Information</span>
                </div>
                <div className="card-body">
                  <div className="field">
                    <div className="field-ico"><Package size={13} strokeWidth={1.8} style={{ color: '#aaa' }} /></div>
                    <div style={{ flex: 1 }}>
                      <div className="f-lbl">Product Name</div>
                      <div className="f-val">{serialDetails.productName}</div>
                    </div>
                  </div>
                  <div className="field">
                    <div className="field-ico"><FileText size={13} strokeWidth={1.8} style={{ color: '#aaa' }} /></div>
                    <div style={{ flex: 1 }}>
                      <div className="f-lbl">Serial Number</div>
                      <div className="f-val mono">{serialDetails.serialNo}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Warranty Info */}
              {(serialDetails.warrantyDesc || serialDetails.warrantyTerm || serialDetails.purchaseDate || serialDetails.validityDate) && (
                <div className="ss-card au4">
                  <div className="card-head">
                    <div className="card-head-icon"><Shield size={14} strokeWidth={1.8} style={{ color: '#666' }} /></div>
                    <span className="card-head-title">Warranty Information</span>
                  </div>
                  <div className="card-body">
                    {serialDetails.warrantyDesc && (
                      <div className="field">
                        <div className="field-ico"><Shield size={13} strokeWidth={1.8} style={{ color: '#aaa' }} /></div>
                        <div style={{ flex: 1 }}>
                          <div className="f-lbl">Coverage</div>
                          <div className="f-val">{serialDetails.warrantyDesc}{serialDetails.warrantyTerm ? ` · ${serialDetails.warrantyTerm}` : ''}</div>
                        </div>
                      </div>
                    )}
                    {serialDetails.purchaseDate && (
                      <div className="field">
                        <div className="field-ico"><Calendar size={13} strokeWidth={1.8} style={{ color: '#aaa' }} /></div>
                        <div style={{ flex: 1 }}>
                          <div className="f-lbl">Purchase Date</div>
                          <div className="f-val">{dayjs(serialDetails.purchaseDate).format('DD MMMM YYYY')}</div>
                        </div>
                      </div>
                    )}
                    {serialDetails.validityDate && (
                      <div className="field">
                        <div className="field-ico"><Calendar size={13} strokeWidth={1.8} style={{ color: '#aaa' }} /></div>
                        <div style={{ flex: 1 }}>
                          <div className="f-lbl">Valid Until</div>
                          <div className="f-val" style={{ color: isValidWarranty ? '#16a34a' : '#dc2626' }}>
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
              <div className="ss-card au4">
                <div className="card-head">
                  <div className="card-head-icon"><Shield size={14} strokeWidth={1.8} style={{ color: '#666' }} /></div>
                  <span className="card-head-title">Warranty Status</span>
                </div>
                <div className="card-body">
                  {serialDetails.validityDate ? (
                    <>
                      {isValidWarranty
                        ? <span className="status-active"><span className="s-dot-g" /> Active</span>
                        : <span className="status-expired"><span className="s-dot-r" /> Expired</span>
                      }

                      {/* Days counter */}
                      {daysLeft !== null && (
                        <div className={`days-chip${isValidWarranty ? '' : ' exp'}`}>
                          <span className={`days-num${isValidWarranty ? '' : ' exp'}`}>
                            {Math.abs(daysLeft)}
                          </span>
                          <span className={`days-lbl${isValidWarranty ? '' : ' exp'}`}>
                            {isValidWarranty ? 'days left' : 'days ago'}
                          </span>
                        </div>
                      )}

                      {/* Progress bar */}
                      {serialDetails.purchaseDate && (
                        <>
                          <div className="w-bar-track">
                            <div
                              className={`w-bar-fill${isValidWarranty ? '' : ' exp'}`}
                              style={{ width: `${warrantyPct}%` }}
                            />
                          </div>
                          <div className="w-bar-labels">
                            <span>{dayjs(serialDetails.purchaseDate).format('MMM YY')}</span>
                            <span>{dayjs(serialDetails.validityDate).format('MMM YY')}</span>
                          </div>
                        </>
                      )}

                      <div style={{ marginTop: 12, fontSize: 11, color: '#bbb', lineHeight: 1.6 }}>
                        {isValidWarranty
                          ? `Expires ${dayjs(serialDetails.validityDate).format('DD MMM YYYY')}`
                          : `Expired ${dayjs(serialDetails.validityDate).format('DD MMM YYYY')}`
                        }
                      </div>
                    </>
                  ) : (
                    <p style={{ fontSize: 12, color: '#bbb' }}>No warranty date registered</p>
                  )}
                </div>
              </div>

              {/* QR Codes */}
              {/* {serialDetails.qrCodes?.length > 0 && (
                <div className="ss-card au5">
                  <div className="card-head">
                    <div className="card-head-icon"><QrCode size={14} strokeWidth={1.8} style={{ color: '#666' }} /></div>
                    <span className="card-head-title">QR Codes</span>
                  </div>
                  <div className="card-body">
                    {serialDetails.qrCodes.map((qr, idx) => (
                      <div key={idx} className="qr-row-item">
                        <img src={`data:image/png;base64,${qr.qrImageBase64}`} alt={`${qr.qrType} QR`} />
                        <div style={{ flex: 1 }}>
                          <div className={`qr-tag ${qr.qrType}`}>{qr.qrType}</div>
                          <button className="qr-dl" onClick={() => downloadQR(qr, qr.qrType)}>
                            <Download size={10} strokeWidth={2} /> Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )} */}
            </div>
          </div>

          {/* Footer */}
          <div className="ss-footer">
            <div className="footer-line" />
            <div className="footer-txt">Verified by Denral Electric &nbsp;·&nbsp; {dayjs().format('YYYY')}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SerialScan;