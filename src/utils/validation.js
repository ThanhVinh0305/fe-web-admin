import * as yup from 'yup';

export const loginSchema = yup.object({
  username: yup
    .string()
    .email('Email không hợp lệ')
    .required('Email là bắt buộc'),
  password: yup
    .string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .required('Mật khẩu là bắt buộc'),
});

export const registerSchema = yup.object({
  name: yup
    .string()
    .min(2, 'Tên phải có ít nhất 2 ký tự')
    .required('Tên là bắt buộc'),
  email: yup
    .string()
    .email('Email không hợp lệ')
    .required('Email là bắt buộc'),
  password: yup
    .string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .required('Mật khẩu là bắt buộc'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Mật khẩu xác nhận không khớp')
    .required('Xác nhận mật khẩu là bắt buộc'),
  phone: yup
    .string()
    .matches(/^(\+84|84|0)[3-9][0-9]{8}$/, 'Số điện thoại không hợp lệ')
    .required('Số điện thoại là bắt buộc'),
});

export const userSchema = yup.object({
  name: yup
    .string()
    .min(2, 'Tên phải có ít nhất 2 ký tự')
    .required('Tên là bắt buộc'),
  email: yup
    .string()
    .email('Email không hợp lệ')
    .required('Email là bắt buộc'),
  phone: yup
    .string()
    .matches(/^(\+84|84|0)[3-9][0-9]{8}$/, 'Số điện thoại không hợp lệ')
    .required('Số điện thoại là bắt buộc'),
  role: yup
    .string()
    .oneOf(['admin', 'user', 'moderator'], 'Vai trò không hợp lệ')
    .required('Vai trò là bắt buộc'),
});

export const postSchema = yup.object({
  title: yup
    .string()
    .min(5, 'Tiêu đề phải có ít nhất 5 ký tự')
    .max(200, 'Tiêu đề không được quá 200 ký tự')
    .required('Tiêu đề là bắt buộc'),
  content: yup
    .string()
    .min(10, 'Nội dung phải có ít nhất 10 ký tự')
    .required('Nội dung là bắt buộc'),
  category: yup
    .string()
    .required('Danh mục là bắt buộc'),
  tags: yup
    .array()
    .of(yup.string())
    .min(1, 'Phải có ít nhất 1 tag'),
});

export const changePasswordSchema = yup.object({
  currentPassword: yup
    .string()
    .required('Mật khẩu hiện tại là bắt buộc'),
  newPassword: yup
    .string()
    .min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự')
    .required('Mật khẩu mới là bắt buộc'),
  confirmNewPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Mật khẩu xác nhận không khớp')
    .required('Xác nhận mật khẩu mới là bắt buộc'),
});

export const contactSchema = yup.object({
  name: yup
    .string()
    .min(2, 'Tên phải có ít nhất 2 ký tự')
    .required('Tên là bắt buộc'),
  email: yup
    .string()
    .email('Email không hợp lệ')
    .required('Email là bắt buộc'),
  subject: yup
    .string()
    .min(5, 'Chủ đề phải có ít nhất 5 ký tự')
    .required('Chủ đề là bắt buộc'),
  message: yup
    .string()
    .min(10, 'Tin nhắn phải có ít nhất 10 ký tự')
    .required('Tin nhắn là bắt buộc'),
});