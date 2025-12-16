import React, { useState } from 'react';
import { Input, Button, Card } from '../ui/index.js';
import { useForm } from '../../hooks/index.js';
import { loginSchema } from '../../utils/validation.js';
import { authService } from '../../services/index.js';

const LoginForm = ({ onSuccess, onError }) => {
  const [apiError, setApiError] = useState('');

  const handleSubmit = async (values) => {
    try {
      setApiError('');
      const result = await authService.login(values);
      
      if (result.success) {
        await new Promise(resolve => setTimeout(resolve, 200));
        if (onSuccess) {
          onSuccess(result.data);
        }
      } else {
        setApiError(result.error || 'Đăng nhập thất bại');
        if (onError) {
          onError(result.error);
        }
      }
    } catch (error) {
      const errorMessage = 'Có lỗi xảy ra khi đăng nhập';
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
    { username: '', password: '' },
    loginSchema,
    handleSubmit
  );

  return (
    <Card title="Đăng nhập" className="w-full max-w-md mx-auto">
      <form onSubmit={onSubmit} className="space-y-4">
        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {apiError}
          </div>
        )}

        <Input
          label="Email"
          name="username"
          type="email"
          value={values.username}
          onChange={(e) => handleChange('username', e.target.value)}
          onBlur={() => handleBlur('username')}
          error={touched.username && errors.username}
          placeholder="Nhập email của bạn"
          required
        />

        <Input
          label="Mật khẩu"
          name="password"
          type="password"
          value={values.password}
          onChange={(e) => handleChange('password', e.target.value)}
          onBlur={() => handleBlur('password')}
          error={touched.password && errors.password}
          placeholder="Nhập mật khẩu"
          required
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full"
          loading={isSubmitting}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
      </form>
    </Card>
  );
};

export default LoginForm;