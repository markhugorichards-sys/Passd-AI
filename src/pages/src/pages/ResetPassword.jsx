// src/pages/ResetPassword.jsx
import { useState, useEffect } from 'react';
import { updatePassword, supabase } from '../lib/supabase.js';

const ResetPassword = ({ onNav }) => {
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [err,      setErr]      = useState('');
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(false);
  const [ready,    setReady]    = useState(false);

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
  }, []);

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setErr('');
    if (password.length < 8) { setErr('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setErr('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await updatePassword(password);
      setDone(true);
      setTimeout(() => onNav('login'), 2500);
    } catch (e) {
      setErr(e.message || 'Could not update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <div className="auth-wrap page">
        <div className="auth-card" style={{ textAlign:'center' }}>
          <div style={{ fontSize:14,color:'#64748b' }}>Verifying reset link…</div>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="auth-wrap page">
        <div className="auth-card" style={{ textAlign:'center' }}>
          <div style={{ fontSize:48,marginBottom:12 }}>✅</div>
          <h2 style={{ fontSize:22,fontWeight:800,marginBottom:8 }}>Password updated</h2>
          <p style={{ fontSize:14,color:'#475569' }}>Redirecting you to sign in…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrap page">
      <div className="auth-card">
        <h2 style={{ fontSize:26,fontWeight:800,letterSpacing:'-.02em',marginBottom:4 }}>Set new password</h2>
        <p style={{ fontSize:14,color:'#475569',marginBottom:20 }}>Choose a strong password for your account.</p>
        <form onSubmit={handleSubmit} style={{ display:'flex',flexDirection:'column',gap:14 }}>
          <div className="field">
            <span className="lbl">New password</span>
            <input className="inp" type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 8 characters" autoComplete="new-password" required />
          </div>
          <div className="field">
            <span className="lbl">Confirm new password</span>
            <input className="inp" type="password" value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Repeat password" required />
          </div>
          {err && <p style={{ fontSize:13,color:'#dc2626' }}>{err}</p>}
          <button type="submit" className="btn btn-p btn-full btn-lg" disabled={loading}>
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
