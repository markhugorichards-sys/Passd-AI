// src/pages/Login.jsx
import { useState } from 'react';
import { signIn, resetPassword } from '../lib/supabase.js';

const Login = ({ onLogin, onNav }) => {
  const [isInst,   setIsInst]   = useState(false);
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [err,      setErr]      = useState('');
  const [loading,  setLoading]  = useState(false);

  const [showReset,    setShowReset]    = useState(false);
  const [resetEmail,   setResetEmail]   = useState('');
  const [resetSent,    setResetSent]    = useState(false);
  const [resetErr,     setResetErr]     = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const { user } = await signIn({ email, password });
      if (!user) { setErr('Sign in failed — please try again.'); setLoading(false); return; }
      const role = user.user_metadata?.role;
      if (isInst && role !== 'instructor') {
        setErr('This account is not an instructor account. Try signing in as a Learner.');
        setLoading(false); return;
      }
      if (!isInst && role === 'instructor') {
        setErr('This is an instructor account. Switch to Instructor above.');
        setLoading(false); return;
      }
      if (role === 'instructor') {
        onLogin('inst', { id: user.id, email: user.email, name: user.user_metadata?.name || user.email });
      } else {
        onLogin('learner', { id: user.id, email: user.email, name: user.user_metadata?.name || user.email, postcode: '' });
      }
    } catch (e) {
      if (e.message?.includes('Invalid login')) {
        setErr('Email or password incorrect. Please try again.');
      } else if (e.message?.includes('Email not confirmed')) {
        setErr('Please verify your email before signing in. Check your inbox.');
      } else {
        setErr(e.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (ev) => {
    ev.preventDefault();
    setResetErr('');
    setResetLoading(true);
    try {
      await resetPassword(resetEmail);
      setResetSent(true);
    } catch (e) {
      setResetErr(e.message || 'Could not send reset email. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  if (showReset) {
    return (
      <div className="auth-wrap page">
        <div className="auth-card">
          <button onClick={() => setShowReset(false)}
            style={{ background:'none',border:'none',color:'#1d6ff3',fontWeight:600,cursor:'pointer',fontSize:14,marginBottom:16,padding:0,fontFamily:'inherit' }}>
            ← Back to sign in
          </button>
          <h2 style={{ fontSize:26,fontWeight:800,letterSpacing:'-.02em',marginBottom:4 }}>Reset password</h2>
          <p style={{ fontSize:14,color:'#475569',marginBottom:20 }}>Enter your email and we'll send you a reset link.</p>
          {resetSent ? (
            <div style={{ background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:12,padding:'16px 20px' }}>
              <div style={{ fontWeight:700,color:'#166534',marginBottom:4 }}>✓ Email sent</div>
              <div style={{ fontSize:14,color:'#166534',lineHeight:1.5 }}>
                Check your inbox for a password reset link. It expires in 1 hour.
              </div>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} style={{ display:'flex',flexDirection:'column',gap:14 }}>
              <div className="field">
                <span className="lbl">Email address</span>
                <input className="inp" type="email" value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  placeholder="your@email.com" required />
              </div>
              {resetErr && <p style={{ fontSize:13,color:'#dc2626' }}>{resetErr}</p>}
              <button type="submit" className="btn btn-p btn-full btn-lg" disabled={resetLoading}>
                {resetLoading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrap page">
      <div className="auth-card">
        <h2 style={{ fontSize:26,fontWeight:800,letterSpacing:'-.02em',marginBottom:4 }}>Welcome back</h2>
        <p style={{ fontSize:14,color:'#475569',marginBottom:20 }}>Sign in to your Passd-AI account.</p>

        <div style={{ display:'flex',gap:8,marginBottom:20 }}>
          {['Learner','Instructor'].map((t,ii) => (
            <button key={t}
              className={`btn btn-full ${(!ii && !isInst)||(ii && isInst) ? 'btn-p':'btn-gh'}`}
              style={{ height:42,fontSize:14 }}
              onClick={() => { setIsInst(!!ii); setErr(''); setEmail(''); setPassword(''); }}>
              {t}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display:'flex',flexDirection:'column',gap:14 }}>
          <div className="field">
            <span className="lbl">Email</span>
            <input className="inp" type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={isInst ? 'instructor@email.com' : 'your@email.com'}
              autoComplete="email" required />
          </div>
          <div className="field">
            <span className="lbl">Password</span>
            <input className="inp" type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" autoComplete="current-password" required />
          </div>

          {err && <p style={{ fontSize:13,color:'#dc2626',lineHeight:1.4 }}>{err}</p>}

          <button type="submit" className="btn btn-p btn-full btn-lg" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <p style={{ textAlign:'center',fontSize:14,color:'#475569' }}>
            No account?{' '}
            <button type="button" onClick={() => onNav('signup')}
              style={{ background:'none',border:'none',color:'#1d6ff3',fontWeight:600,cursor:'pointer',fontSize:14,fontFamily:'inherit' }}>
              Create free account
            </button>
          </p>

          <p style={{ textAlign:'center',fontSize:14,color:'#475569',marginTop:-6 }}>
            Forgot your password?{' '}
            <button type="button" onClick={() => setShowReset(true)}
              style={{ background:'none',border:'none',color:'#1d6ff3',fontWeight:600,cursor:'pointer',fontSize:14,fontFamily:'inherit' }}>
              Reset it
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
