import React, { createContext, useState, useEffect, useContext } from 'react';
import { authApi } from '../services/apiService';

// 创建认证上下文
const AuthContext = createContext();

// 认证提供者组件
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // 检查本地存储中的用户信息
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('authToken');
    if (user && token) {
      setCurrentUser(user);
    }
    setIsLoading(false);
  }, []);

  // 登录函数
  const login = async (username, password) => {
    try {
      const data = await authApi.login({ username, password });
      setCurrentUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('authToken', data.token);
      setShowLoginModal(false);
      return data;
    } catch (error) {
      console.error('登录错误:', error);
      throw error;
    }
  };

  // 注册函数
  const register = async (username, password, nickname) => {
    try {
      const data = await authApi.register({ username, password, nickname });
      setCurrentUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('authToken', data.token);
      setShowRegisterModal(false);
      return data;
    } catch (error) {
      console.error('注册错误:', error);
      throw error;
    }
  };

  // 登出函数
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
  };

  // 打开登录模态框
  const openLoginModal = () => {
    setShowLoginModal(true);
    setShowRegisterModal(false);
  };

  // 打开注册模态框
  const openRegisterModal = () => {
    setShowRegisterModal(true);
    setShowLoginModal(false);
  };

  // 关闭模态框
  const closeModal = () => {
    setShowLoginModal(false);
    setShowRegisterModal(false);
  };

  // 上下文值
  const value = {
    currentUser,
    isLoading,
    showLoginModal,
    showRegisterModal,
    login,
    register,
    logout,
    openLoginModal,
    openRegisterModal,
    closeModal,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 自定义钩子，方便使用认证上下文
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth 必须在 AuthProvider 内部使用');
  }
  return context;
};