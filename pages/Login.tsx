import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, ShieldCheck, Mail, Lock, AlertCircle, ChevronLeft, UserCircle, ShieldAlert, Hotel } from 'lucide-react';
import { SLAHLogo } from '../Logo';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  type LoginView = 'login' | 'forgot' | 'update' | 'recovery';
  const [view, setView] = useState<LoginView>('login');

  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    // Check if user is already logged in (e.g. arriving via recovery link)
    const checkUser = async () => {
      // Supabase sets the session in the URL fragment (#) for recovery links
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          // Detect if we came from a recovery link (typically via hash)
          const isRecovery = window.location.hash.includes('type=recovery');

          if (isRecovery) {
            setView('recovery');
          } else if (!profile.password_changed) {
            setView('update');
          } else {
            navigate('/dashboard');
          }
        }
      }
    };
    checkUser();
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(email, password);
  };

  const performLogin = async (inputEmail: string, inputPassword: string) => {
    setLoading(true);
    setError('');

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: inputEmail,
        password: inputPassword,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Fetch profile to check password_changed flag
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (profileError) throw profileError;

        const userData = {
          ...authData.user,
          name: profile.name,
          role: profile.role,
          password_changed: profile.password_changed
        };

        localStorage.setItem('slah_auth', JSON.stringify(userData));
        localStorage.setItem('slah_remember', rememberMe.toString());

        if (!profile.password_changed) {
          setView('update');
          setLoading(false);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password.');
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // 1. Update the password in Auth
      const { data: updateData, error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        if (updateError.message.includes('same as the old password')) {
          throw new Error('Your new password must be different from the old one.');
        }
        throw updateError;
      }

      const user = updateData?.user;
      if (!user) throw new Error('Failed to retrieve user session after update.');

      // 2. Update password_changed flag in profile
      const { data: profileCheck, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      let persistenceSuccess = false;

      if (fetchError || !profileCheck) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            password_changed: true,
            name: user.user_metadata?.name || 'User',
            role: user.user_metadata?.role || 'member'
          });

        if (!insertError) persistenceSuccess = true;
        else console.error('Profile insertion failed:', insertError);
      } else {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ password_changed: true })
          .eq('id', user.id);

        if (!profileError) persistenceSuccess = true;
        else console.error('Profile update failed:', profileError);
      }

      // 3. Update local state (even if profile update failed, we have new session)
      const authStr = localStorage.getItem('slah_auth');
      const auth = authStr ? JSON.parse(authStr) : {};
      localStorage.setItem('slah_auth', JSON.stringify({
        ...auth,
        id: user.id,
        email: user.email,
        password_changed: true
      }));

      localStorage.setItem('slah_remember', rememberMe.toString());

      if (!persistenceSuccess) {
        // If profile update failed but password change succeeded, we notify and let them in
        alert('Password changed successfully, but we could not update your security badge in the database. You may be prompted to change it again until this is fixed. Continuing to dashboard...');
      }

      // 4. Success - Go to dashboard
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Password change failure:', err);
      setError(err.message || 'An unexpected error occurred during password update.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResetSuccess(false);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/login`,
      });

      if (resetError) throw resetError;

      setResetSuccess(true);
      setResetEmail('');
    } catch (err: any) {
      console.error('Reset error:', err.message);
      setError(err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 py-12">
      <Link to="/" className="mb-8 flex items-center text-slate-500 hover:text-emerald-600 transition-colors font-bold text-sm uppercase tracking-widest">
        <ChevronLeft size={20} className="mr-1" /> Back to Website
      </Link>

      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-slate-100 mb-6">
          <div className="text-center mb-10">
            <SLAHLogo variant="dark" className="h-28 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Member Portal</h1>
            <p className="text-slate-500">Secure access for SLAH administrators and member hotels.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start space-x-3 text-red-600 text-sm">
              <AlertCircle className="flex-shrink-0" size={18} />
              <span>{error}</span>
            </div>
          )}

          {view === 'update' ? (
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-start space-x-3 text-amber-800 text-xs mb-6">
                <ShieldAlert className="flex-shrink-0" size={16} />
                <p>Welcome! For your security, you are required to set a permanent password before accessing the dashboard.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    required
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    required
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full bg-emerald-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-emerald-800 transition-all flex items-center justify-center disabled:opacity-50"
              >
                {loading ? 'Updating Password...' : 'Update & Continue to Dashboard'}
              </button>

              <button
                type="button"
                onClick={() => setView('login')}
                className="w-full text-center text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
              >
                Back to Login
              </button>
            </form>
          ) : view === 'recovery' ? (
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex flex-col items-center text-center space-y-4 mb-6">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <h3 className="text-emerald-900 font-bold">Account Recovery</h3>
                  <p className="text-emerald-700 text-xs">Your security link has been verified. Please set a new permanent password to recover your account.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    required
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    required
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center disabled:opacity-50"
              >
                {loading ? 'Recovering Account...' : 'Recover Account'}
              </button>
            </form>
          ) : view === 'forgot' ? (
            <form onSubmit={handleForgotPassword} className="space-y-6">
              {resetSuccess ? (
                <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl text-center">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail size={32} />
                  </div>
                  <h3 className="text-emerald-900 font-bold mb-2">Check Your Email</h3>
                  <p className="text-emerald-700 text-sm mb-6">We've sent a password reset link to your inbox. Please follow the instructions to regain access.</p>
                  <button
                    type="button"
                    onClick={() => { setView('login'); setResetSuccess(false); }}
                    className="text-emerald-700 font-bold underline text-sm uppercase tracking-widest"
                  >
                    Return to Login
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start space-x-3 text-slate-600 text-xs mb-6">
                    <AlertCircle className="flex-shrink-0" size={16} />
                    <p>Enter your registered email address and we'll send you a link to reset your password and recover your account.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Registered Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        required
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <button
                    disabled={loading}
                    type="submit"
                    className="w-full bg-emerald-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-emerald-800 transition-all flex items-center justify-center disabled:opacity-50"
                  >
                    {loading ? 'Sending Request...' : 'Send Reset Link'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setView('login')}
                    className="w-full text-center text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                  >
                    Cancel and Return
                  </button>
                </>
              )}
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="name@slah.org.sl"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
                  <button
                    type="button"
                    onClick={() => setView('forgot')}
                    className="text-xs font-bold text-emerald-600 hover:underline tracking-widest uppercase cursor-pointer bg-transparent border-none p-0"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="peer hidden"
                    />
                    <div className="w-5 h-5 border-2 border-slate-200 rounded-lg bg-white peer-checked:bg-emerald-600 peer-checked:border-emerald-600 transition-all flex items-center justify-center">
                      <ShieldCheck size={12} className="text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-700 transition-colors">Keep me signed in</span>
                </label>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full bg-emerald-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-emerald-800 transition-all flex items-center justify-center disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : (
                  <>Sign In to Portal <LogIn size={20} className="ml-2" /></>
                )}
              </button>
            </form>
          )}

          <div className="mt-10 pt-8 border-t border-slate-50 text-center">
            <p className="text-slate-400 text-sm mb-4">Not a member yet?</p>
            <Link to="/register" className="inline-block text-emerald-700 font-bold hover:underline uppercase tracking-widest text-xs">
              Apply for Association Membership
            </Link>
          </div>
        </div>


        <div className="mt-8 text-center flex items-center justify-center space-x-2 text-slate-400">
          <ShieldCheck size={16} />
          <span className="text-xs font-medium uppercase tracking-widest">Protected by SLAH Security Secretariat</span>
        </div>
      </div>
    </div>
  );
}