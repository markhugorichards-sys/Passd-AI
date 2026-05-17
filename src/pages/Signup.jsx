// src/pages/Signup.jsx
import { useState } from 'react';
import { signUpLearner, signUpInstructor } from '../lib/supabase.js';

const Signup = ({ onSignup, onNav }) => {
  const [isInst,   setIsInst]   = useState(false);
  const [step,     setStep]     = useState(1);
  const [loading,  setLoading]  = useState(false);
  const [err,      setErr]      = useState('');
  const [done,     setDone]     = useState(false);

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [postcode, setPostcode] = useState('');

  const [adiNum,  setAdiNum]  = useState('');
  const [adiType, setAdiType] = useState('ADI');
  const [basePC,  setBasePC]  = useState('');
  const [priceHr, setPriceHr] = useState('');
  const [bio,     setBio]     = useState('');
  const [consent, setConsent] = useState(false);

  const validateStep1 = () => {
    if (!name.trim())         return 'Please enter your full name.';
    if (!email.trim())        return 'Please enter your email address.';
    if (password.length < 8)  return 'Password must be at least 8 characters.';
    if (password !== confirm)  return 'Passwords do not match.';
    if (!isInst && !postcode.trim()) return 'Please enter your postcode.';
    return null;
  };

  const handleLearnerSubmit = async (ev) => {
    ev.preventDefault();
    const ve = validateStep1();
    if (ve) { setErr(ve); return; }
    setErr(''); setLoading(true);
    try {
      await signUpLearner({ name, email, password, postcode });
      setDone(true);
      onSignup(name, email);
    } catch (e) {
      if (e.message?.includes('already registered')) {
        setErr('An account with this email already exists. Try signing in.');
      } else {
        setErr(e.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInstructorStep1 = (ev) => {
    ev.preventDefault();
    const ve = validateStep1();
    if (ve) { setErr(ve); return; }
    setErr('');
    setStep(2);
  };

  const handleInstructorSubmit = async (ev) => {
    ev.preventDefault();
    if (!consent) { setErr('Please accept the listing terms to continue.'); return; }
    setErr(''); setLoading(true);
    try {
      await signUpInstructor({ name, email, password });
      setDone(true);
    } catch (e) {
      if (e.message?.includes('already registered')) {
        setErr('An account with this email already exists. Try signing in.');
      } else {
        setErr(e.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="auth-wrap page">
        <div className="auth-card" style={{ textAlign:'center' }}>
          <div style={{ fontSize:48,marginBottom:16 }}>✉️</div>
          <h2 style={{ fontSize:24,fontWeight:800,marginBottom:8,letterSpacing:'-.02em' }}>Check your email</h2>
          <p style={{ fontSize:15,color:'#475569',lineHeight:1.6,marginBottom:20 }}>
            We've sent a verification link to <strong>{email}</strong>.
            {isInst
              ? ' Once verified, your listing will be reviewed by our team before going live.'
              : ' Click the link to verify your account and start comparing instructors.'
            }
          </p>
          <button className="btn btn-p btn-full" onClick={() => onNav('login')}>
            Back to sign in
          </button>
          {isInst && (
            <div style={{ marginTop:16,fontSize:13,color:'#64748b',lineHeight:1.5 }}>
              Questions? Email{' '}
              <a href="mailto:hello@passd-ai.co.uk" style={{ color:'#1d6ff3' }}>hello@passd-ai.co.uk</a>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrap page">
      <div className="auth-card">
        <h2 style={{ fontSize:26,fontWeight:800,letterSpacing:'-.02em',marginBottom:4 }}>Create account</h2>
        <p style={{ fontSize:14,color:'#475569',marginBottom:20 }}>
          {isInst ? 'List your profile on Passd-AI.' : 'Start comparing instructors near you.'}
        </p>

        <div style={{ display:'flex',gap:8,marginBottom:20 }}>
          {['Learner','Instructor'].map((t,ii) => (
            <button key={t}
              className={`btn btn-full ${(!ii && !isInst)||(ii && isInst) ? 'btn-p':'btn-gh'}`}
              style={{ height:42,fontSize:14 }}
              onClick={() => { setIsInst(!!ii); setErr(''); setStep(1); }}>
              {t}
            </button>
          ))}
        </div>

        {/* LEARNER FORM */}
        {!isInst && (
          <form onSubmit={handleLearnerSubmit} style={{ display:'flex',flexDirection:'column',gap:14 }}>
            <div className="field">
              <span className="lbl">Full name</span>
              <input className="inp" type="text" value={name}
                onChange={e => setName(e.target.value)} placeholder="Alex Smith" required />
            </div>
            <div className="field">
              <span className="lbl">Email</span>
              <input className="inp" type="email" value={email}
                onChange={e => setEmail(e.target.value)} placeholder="alex@email.com"
                autoComplete="email" required />
            </div>
            <div className="field">
              <span className="lbl">Postcode</span>
              <input className="inp" type="text" value={postcode}
                onChange={e => setPostcode(e.target.value)} placeholder="SO14 1AA" required />
            </div>
            <div className="field">
              <span className="lbl">Password</span>
              <input className="inp" type="password" value={password}
                onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters"
                autoComplete="new-password" required />
            </div>
            <div className="field">
              <span className="lbl">Confirm password</span>
              <input className="inp" type="password" value={confirm}
                onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" required />
            </div>
            {err && <p style={{ fontSize:13,color:'#dc2626',lineHeight:1.4 }}>{err}</p>}
            <p style={{ fontSize:12,color:'#64748b',lineHeight:1.5 }}>
              By creating an account you agree to our{' '}
              <button type="button" onClick={() => onNav('legal_terms')}
                style={{ background:'none',border:'none',color:'#1d6ff3',cursor:'pointer',fontSize:12,fontFamily:'inherit' }}>
                Terms
              </button>{' '}and{' '}
              <button type="button" onClick={() => onNav('legal_privacy')}
                style={{ background:'none',border:'none',color:'#1d6ff3',cursor:'pointer',fontSize:12,fontFamily:'inherit' }}>
                Privacy Policy
              </button>.
            </p>
            <button type="submit" className="btn btn-p btn-full btn-lg" disabled={loading}>
              {loading ? 'Creating account…' : 'Create free account'}
            </button>
            <p style={{ textAlign:'center',fontSize:14,color:'#47556
