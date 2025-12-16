import React, { useState } from 'react';
import { Input, Button, Card } from '../ui/index.js';
import { useForm } from '../../hooks/index.js';
import { registerSchema } from '../../utils/validation.js';
import { authService } from '../../services/index.js';

const RegisterForm = ({ onSuccess, onError }) => {
  const [apiError, setApiError] = useState('');

  const handleSubmit = async (values) => {
    try {
      setApiError('');
      const result = await authService.register(values);
      
      if (result.success) {
        if (onSuccess) {
          onSuccess(result.data);
        }
      } else {
        setApiError(result.error || 'Đăng ký thất bại');
        if (onError) {
          onError(result.error);
        }
      }
    } catch (error) {
      const errorMessage = 'Có lỗi xảy ra khi đăng ký';
      setApiError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
    }
  };

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit: onSubmit,
  } = useForm(
    { 
      name: '', 
      email: '', 
      password: '', 
      confirmPassword: '', 
      phone: '' 
    },
    registerSchema,
    handleSubmit
  );

  return (
    <Card title="Đăng ký tài khoản" className="w-full max-w-md mx-auto">
      <form onSubmit={onSubmit} className="space-y-4">
        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {apiError}
          </div>
        )}

        <Input
          label="Họ và tên"
          name="name"
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.name && errors.name}
          placeholder="Nhập họ và tên"
          required
        />

        <Input
          label="Email"
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.email && errors.email}
          placeholder="Nhập email"
          required
        />

        <Input
          label="Số điện thoại"
          name="phone"
          value={values.phone}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.phone && errors.phone}
          placeholder="Nhập số điện thoại"
          required
        />

        <Input
          label="Mật khẩu"
          name="password"
          type="password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.password && errors.password}
          placeholder="Nhập mật khẩu"
          required
        />

        <Input
          label="Xác nhận mật khẩu"
          name="confirmPassword"
          type="password"
          value={values.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.confirmPassword && errors.confirmPassword}
          placeholder="Nhập lại mật khẩu"
          required
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
        </Button>
      </form>
    </Card>
  );
};

export default RegisterForm;