import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthModal = () => {
  const { 
    showLoginModal, 
    showRegisterModal, 
    login, 
    register, 
    closeModal, 
    currentUser, 
    logout,
    openLoginModal,
    openRegisterModal
  } = useAuth();
  
  // 登录表单状态
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // 注册表单状态
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerNickname, setRegisterNickname] = useState('');
  const [registerError, setRegisterError] = useState('');
  
  // 处理登录表单提交
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      await login(loginUsername, loginPassword);
      // 登录成功后重置表单
      setLoginUsername('');
      setLoginPassword('');
    } catch (error) {
      setLoginError('登录失败，请检查用户名和密码');
    }
  };
  
  // 处理注册表单提交
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');
    
    // 验证密码匹配
    if (registerPassword !== registerConfirmPassword) {
      setRegisterError('两次输入的密码不匹配');
      return;
    }
    
    try {
      await register(registerUsername, registerPassword, registerNickname);
      // 注册成功后重置表单
      setRegisterUsername('');
      setRegisterPassword('');
      setRegisterConfirmPassword('');
      setRegisterNickname('');
    } catch (error) {
      setRegisterError('注册失败，用户名可能已存在');
    }
  };
  
  // 如果两个模态框都不显示，则不渲染
  if (!showLoginModal && !showRegisterModal) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center">
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 bg-gray-600 bg-opacity-50" 
        onClick={closeModal}
      ></div>
      
      {/* 模态框容器 */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 z-10">
        {/* 登录模态框 */}
        {showLoginModal && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">登录</h2>
              <button 
                onClick={closeModal} 
                className="text-gray-400 hover:text-gray-600"
                aria-label="关闭"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {loginError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {loginError}
              </div>
            )}
            
            <form onSubmit={handleLoginSubmit}>
              <div className="mb-4">
                <label htmlFor="login-username" className="block text-gray-700 text-sm font-bold mb-2">
                  用户名
                </label>
                <input 
                  type="text" 
                  id="login-username" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="login-password" className="block text-gray-700 text-sm font-bold mb-2">
                  密码
                </label>
                <input 
                  type="password" 
                  id="login-password" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              
              <div className="flex items-center justify-between">
                <button 
                  type="submit" 
                  className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                >
                  登录
                </button>
              </div>
              
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  还没有账号？
                  <button 
                    type="button" 
                    onClick={() => {
                      closeModal();
                      openRegisterModal();
                    }}
                    className="text-primary hover:text-primary-dark font-semibold ml-1"
                  >
                    立即注册
                  </button>
                </p>
              </div>
            </form>
          </div>
        )}
        
        {/* 注册模态框 */}
        {showRegisterModal && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">注册</h2>
              <button 
                onClick={closeModal} 
                className="text-gray-400 hover:text-gray-600"
                aria-label="关闭"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {registerError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {registerError}
              </div>
            )}
            
            <form onSubmit={handleRegisterSubmit}>
              <div className="mb-4">
                <label htmlFor="register-username" className="block text-gray-700 text-sm font-bold mb-2">
                  用户名
                </label>
                <input 
                  type="text" 
                  id="register-username" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="register-nickname" className="block text-gray-700 text-sm font-bold mb-2">
                  昵称
                </label>
                <input 
                  type="text" 
                  id="register-nickname" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  value={registerNickname}
                  onChange={(e) => setRegisterNickname(e.target.value)}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="register-password" className="block text-gray-700 text-sm font-bold mb-2">
                  密码
                </label>
                <input 
                  type="password" 
                  id="register-password" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="register-confirm-password" className="block text-gray-700 text-sm font-bold mb-2">
                  确认密码
                </label>
                <input 
                  type="password" 
                  id="register-confirm-password" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  value={registerConfirmPassword}
                  onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <button 
                  type="submit" 
                  className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                >
                  注册
                </button>
              </div>
              
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  已有账号？
                  <button 
                    type="button" 
                    onClick={() => {
                      closeModal();
                      openLoginModal();
                    }}
                    className="text-primary hover:text-primary-dark font-semibold ml-1"
                  >
                    立即登录
                  </button>
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;