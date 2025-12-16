import React, { useState } from 'react';
import { Input, Select, Button, Card } from '../ui/index.js';
import { useForm } from '../../hooks/index.js';
import { userSchema } from '../../utils/validation.js';
import { userService } from '../../services/index.js';

const UserForm = ({ 
  user = null, // null for create, user object for edit
  onSuccess, 
  onError,
  onCancel 
}) => {
  const [apiError, setApiError] = useState('');
  const isEdit = !!user;

  const initialValues = {
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || 'user',
  };

  const roleOptions = [
    { value: 'user', label: 'Người dùng' },
    { value: 'admin', label: 'Quản trị viên' },
    { value: 'moderator', label: 'Điều hành viên' },
  ];

  const handleSubmit = async (values) => {
    try {
      setApiError('');
      let result;
      
      if (isEdit) {
        result = await userService.updateUser(user.id, values);
      } else {
        result = await userService.createUser(values);
      }
      
      if (result.success) {
        if (onSuccess) {
          onSuccess(result.data);
        }
      } else {
        setApiError(result.error || `${isEdit ? 'Cập nhật' : 'Tạo'} người dùng thất bại`);
        if (onError) {
          onError(result.error);
        }
      }
    } catch (error) {
      const errorMessage = `Có lỗi xảy ra khi ${isEdit ? 'cập nhật' : 'tạo'} người dùng`;
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
  } = useForm(initialValues, userSchema, handleSubmit);

  return (
    <Card 
      title={isEdit ? 'Cập nhật người dùng' : 'Tạo người dùng mới'} 
      className="w-full max-w-md mx-auto"
    >
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

        <Select
          label="Vai trò"
          name="role"
          value={values.role}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.role && errors.role}
          options={roleOptions}
          required
        />

        <div className="flex space-x-4">
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? 
              (isEdit ? 'Đang cập nhật...' : 'Đang tạo...') : 
              (isEdit ? 'Cập nhật' : 'Tạo mới')
            }
          </Button>
          
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
};

export default UserForm;