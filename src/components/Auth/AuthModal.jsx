import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UilGoogle, UilEnvelope, UilLock, UilUser,
  UilTimes
} from '@iconscout/react-unicons';
import { useAuth } from '../../context/AuthContext';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signin, signup, signInWithGoogle, resetPassword } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await signin(email, password);
      } else if (mode === 'signup') {
        await signup(email, password, displayName);
      } else if (mode === 'reset') {
        await resetPassword(email);
        setError('Check your email for password reset instructions');
      }
      onClose();
    } catch (error) {
      setError(error.message);
    }
    setLoading(false);
  }

  async function handleGoogleLogin() {
    try {
      await signInWithGoogle();
      onClose();
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-dark p-8 rounded-2xl w-full max-w-md relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <UilTimes className="w-6 h-6" />
            </button>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">
                {mode === 'login' ? 'Welcome Back' : 
                 mode === 'signup' ? 'Create Account' : 
                 'Reset Password'}
              </h2>
              <p className="text-lightest">
                {mode === 'login' ? 'Login to access your music' :
                 mode === 'signup' ? 'Sign up to start listening' :
                 'Enter your email to reset password'}
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg mb-4"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <div className="relative">
                    <UilUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-light pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <UilEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-light pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {mode !== 'reset' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <div className="relative">
                    <UilLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-light pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="w-full bg-primary text-white py-2 rounded-lg font-medium
                         hover:bg-primary/90 transition-colors disabled:opacity-50"
                type="submit"
              >
                {loading ? 'Please wait...' : 
                 mode === 'login' ? 'Login' :
                 mode === 'signup' ? 'Sign Up' :
                 'Reset Password'}
              </motion.button>
            </form>

            {mode !== 'reset' && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-dark text-gray-400">Or continue with</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGoogleLogin}
                  className="w-full bg-white text-gray-900 py-2 rounded-lg font-medium
                           flex items-center justify-center space-x-2"
                >
                  <UilGoogle className="w-5 h-5" />
                  <span>Continue with Google</span>
                </motion.button>
              </>
            )}

            <div className="mt-6 text-center text-sm">
              {mode === 'login' ? (
                <>
                  <button
                    onClick={() => setMode('reset')}
                    className="text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                  <p className="mt-2">
                    Don't have an account?{' '}
                    <button
                      onClick={() => setMode('signup')}
                      className="text-primary hover:underline"
                    >
                      Sign up
                    </button>
                  </p>
                </>
              ) : mode === 'signup' ? (
                <p>
                  Already have an account?{' '}
                  <button
                    onClick={() => setMode('login')}
                    className="text-primary hover:underline"
                  >
                    Login
                  </button>
                </p>
              ) : (
                <button
                  onClick={() => setMode('login')}
                  className="text-primary hover:underline"
                >
                  Back to login
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal; 