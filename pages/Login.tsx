import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, ShieldCheck, Mail, Lock, AlertCircle, ChevronLeft, UserCircle, ShieldAlert, Hotel, Info } from 'lucide-react';
import { SLAHLogo } from '../Logo';
import { supabase } from '../lib/supabase'; // Vite Force Refresh Tag
import { useAppContext } from '../context/AppContext';

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
  const { showNotification, setUser } = useAppContext();

  React.useEffect(() => {
    // 1. Cleanup Supabase auth fragments from HashRouter URL
    // HashRouter uses #/route, while Supabase appends #access_token=...
    // This creates #/login#access_token=... which is non-standard.
    const cleanupAuthFragment = () => {
      // Supabase appends auth fragments like #access_token=... to the URL.
      // With BrowserRouter, we can just clear the hash if it exists.
      if (window.location.hash && (window.location.hash.includes('access_token') || window.location.hash.includes('type=recovery'))) {
        console.log('Auth fragment detected. Cleaning up URL hash...');
        window.history.replaceState(null, '', window.location.pathname);
      }
    };

    // 2. Check session and profile state
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Fetch profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          // STATE-FIRST: If database confirms password is changed, bypass all reset views
          if (profile.password_changed) {
            console.log('Password verified in database. Transitioning to dashboard.');
            cleanupAuthFragment();
            navigate('/dashboard', { replace: true });
            return;
          }

          // Detect if we came from a recovery link (typically via hash)
          const isRecovery = window.location.hash.includes('type=recovery');

          if (isRecovery) {
            setView('recovery');
          } else if (!profile.password_changed) {
            setView('update');
          }
        }
      } else {
        // If no user, just clean up if there's an error fragment
        cleanupAuthFragment();
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
          showNotification('Login successful!', 'success');
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
    console.log('[DEBUG] Starting password update process...');

    try {
      // 0. Ensure we have a valid session before updating
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        throw new Error('Your session has expired. Please go back to login and sign in again.');
      }

      // 1. Update the password in Auth
      console.log('[DEBUG] Calling supabase.auth.updateUser...');
      const { data: updateData, error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        console.error('[DEBUG] Update Auth Error:', updateError);
        if (updateError.message.includes('same as the old password')) {
          throw new Error('Your new password must be different from the temporary one we gave you.');
        }
        if (updateError.status === 400 || updateError.status === 422) {
          throw new Error(`Security Policy: ${updateError.message}`);
        }
        throw updateError;
      }

      const user = updateData?.user;
      if (!user) throw new Error('Failed to retrieve user session after update.');
      console.log('[DEBUG] Auth update success for:', user.email);

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
        showNotification('Password updated successfully, however, we were unable to update your security flag. Please contact support if you are asked to reset it again.', 'warning');
      } else {
        // Optimistically update global user state
        setUser({
          ...user,
          password_changed: true
        });
        showNotification('Security update complete. Your new password is now active and your account is secure. Welcome to your dashboard.', 'success');
      }

      // 4. Success - Go to dashboard
      // We no longer need manual hash cleanup here as it conflicts with BrowserRouter
      // and is handled by the checkUser useEffect on mount if we ever return to login.

      setLoading(false); // Reset loading state BEFORE navigation to ensure UI reacts immediately
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
      // 1. Verify if email exists in the system via safe RPC
      const { data: exists, error: rpcError } = await supabase
        .rpc('verify_email_exists', { email_to_check: resetEmail });

      if (rpcError) throw rpcError;

      if (!exists) {
        throw new Error('This email address is not registered with SLAH. Please check for typos or contact the Secretariat.');
      }

      // 2. Proceed with reset if profile exists
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/login`,
      });

      if (resetError) throw resetError;

      setResetSuccess(true);
      setResetEmail('');
      showNotification('Recovery email sent successfully.', 'success');
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

          {view === 'login' && !error && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start space-x-3 text-emerald-800 text-sm animate-in fade-in slide-in-from-top-2 duration-500">
              <Info className="flex-shrink-0 text-emerald-500" size={18} />
              <div>
                <p className="font-bold">Welcome Back!</p>
                <p className="text-xs opacity-80">Please enter your credentials to access the secure association portal.</p>
              </div>
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