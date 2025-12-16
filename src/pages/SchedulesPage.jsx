import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Select from '../components/ui/Select.jsx';
import Modal from '../components/ui/Modal.jsx';
import ConfirmModal from '../components/ui/ConfirmModal.jsx';
import Card from '../components/ui/Card.jsx';
import Textarea from '../components/ui/Textarea.jsx';
import Loading from '../components/ui/Loading.jsx';
import Alert from '../components/ui/Alert.jsx';
import { scheduleService } from '../services/index.js';

const formatVietnameseDateTime = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatVietnameseDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const SchedulesPage = () => {
  const [schedules, setSchedules] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingScheduleId, setDeletingScheduleId] = useState(null);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 10
  });
  
  const [formData, setFormData] = useState({
    schedule_name: '',
    bot_type: 'CRON',
    start_date: '',
    start_time: '',
    repeat_type: 'daily',
    repeat_interval: 1,
    end_enabled: false,
    interval_seconds: null,
    cron_expression: '0 6 * * *',
    status: true // Boolean: true for active, false for inactive
  });

  // Fetch schedules từ API
  useEffect(() => {
    fetchSchedules();
  }, [pagination.currentPage, statusFilter]); // Thêm statusFilter vào dependency

  // Auto hide alerts
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Convert statusFilter to Boolean or null for API
      let statusValue = null;
      if (statusFilter === 'active') {
        statusValue = true;
      } else if (statusFilter === 'paused') {
        statusValue = false;
      }
      // 'all' will send null
      
      const result = await scheduleService.getSchedules(
        pagination.currentPage,
        pagination.pageSize,
        statusValue
      );
      
      if (result.success && result.data) {
        setSchedules(result.data.content || []);
        setPagination(prev => ({
          ...prev,
          totalPages: result.data.totalPages || 0,
          totalElements: result.data.totalElements || 0
        }));
      } else {
        setError('Không thể tải danh sách lịch chạy');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tải danh sách lịch chạy');
    } finally {
      setLoading(false);
    }
  };

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.scheduleName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleAdd = () => {
    setEditingSchedule(null);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    setFormData({
      schedule_name: '',
      bot_type: 'CRON',
      start_date: tomorrow.toISOString().slice(0, 10),
      start_time: '06:00',
      repeat_type: 'daily',
      repeat_interval: 1,
      end_enabled: false,
      interval_seconds: null,
      cron_expression: '0 0 6 * * *', // 6 phần với giây
      status: true // Boolean: true for active
    });
    setShowModal(true);
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    const startDateTime = schedule.startTime ? new Date(schedule.startTime) : new Date();
    
    // Format date và time để khớp với input fields (YYYY-MM-DD và HH:mm)
    const year = startDateTime.getFullYear();
    const month = String(startDateTime.getMonth() + 1).padStart(2, '0');
    const day = String(startDateTime.getDate()).padStart(2, '0');
    const hours = String(startDateTime.getHours()).padStart(2, '0');
    const minutes = String(startDateTime.getMinutes()).padStart(2, '0');
    
    setFormData({
      schedule_name: schedule.scheduleName,
      bot_type: schedule.botType || 'CRON',
      start_date: `${year}-${month}-${day}`,
      start_time: `${hours}:${minutes}`,
      repeat_type: 'daily',
      repeat_interval: 1,
      end_enabled: !!schedule.end_time,
      interval_seconds: schedule.interval_seconds || null,
      cron_expression: schedule.cronExpr || schedule.cron || '0 0 6 * * *',
      status: schedule.status !== undefined ? schedule.status : true // Boolean
    });
    setShowModal(true);

  };

  const handleDelete = (id) => {
    setDeletingScheduleId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingScheduleId) return;
    
    try {
      setLoading(true);
      setError(null);
      const result = await scheduleService.deleteSchedule(deletingScheduleId);
      
      if (result.success) {
        setSuccess('Xóa lịch chạy thành công');
        fetchSchedules();
      } else {
        setError(result.error || 'Không thể xóa lịch chạy');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi xóa lịch chạy');
    } finally {
      setLoading(false);
      setDeletingScheduleId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const submitData = {
        schedule_name: formData.schedule_name,
        bot_type: formData.bot_type,
        start_date: formData.start_date, // yyyy-MM-dd format for backend
        cron: formData.cron_expression, // Send as 'cron' to match backend @JsonProperty
        interval_seconds: formData.bot_type === 'INTERVAL' ? formData.interval_seconds : null,
        status: formData.status // Boolean: true/false
      };
      
      let result;
      if (editingSchedule) {
        result = await scheduleService.updateSchedule(editingSchedule.id, submitData);
      } else {
        result = await scheduleService.createSchedule(submitData);
      }
      
      if (result.success) {
        setSuccess(editingSchedule ? 'Cập nhật lịch chạy thành công' : 'Tạo lịch chạy thành công');
        setShowModal(false);
        fetchSchedules();
      } else {
        setError(result.error || 'Có lỗi xảy ra');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi lưu lịch chạy');
    } finally {
      setLoading(false);
    }
  };

  // Generate cron from repeat settings
  const updateCronExpression = () => {
    const { repeat_type, repeat_interval, start_time } = formData;
    const [hours, minutes] = start_time.split(':');
    
    let cron = '';
    switch (repeat_type) {
      case 'daily':
        // Format: giây phút giờ ngày tháng thứ
        // Chạy hàng ngày vào giờ được chọn
        cron = `0 ${minutes} ${hours} * * *`;
        break;
      case 'weekly':
        // Chạy hàng tuần vào Chủ nhật (0)
        cron = `0 ${minutes} ${hours} * * 0`;
        break;
      case 'monthly':
        // Chạy vào ngày 1 hàng tháng
        cron = `0 ${minutes} ${hours} 1 * *`;
        break;
      case 'custom':
        // Giữ nguyên cron expression hiện tại
        cron = formData.cron_expression;
        break;
      default:
        cron = formData.cron_expression;
    }
    
    setFormData(prev => ({ ...prev, cron_expression: cron }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
  };

  // Cron expression helpers (6 parts with seconds)
  const cronPresets = [
    { value: '0 0 * * * *', label: 'Mỗi giờ' },
    { value: '0 */30 * * * *', label: 'Mỗi 30 phút' },
    { value: '0 */15 * * * *', label: 'Mỗi 15 phút' },
    { value: '0 */5 * * * *', label: 'Mỗi 5 phút' },
    { value: '0 0 */2 * * *', label: 'Mỗi 2 giờ' },
    { value: '0 0 */6 * * *', label: 'Mỗi 6 giờ' },
    { value: '0 0 */12 * * *', label: 'Mỗi 12 giờ' },
    { value: '0 0 6 * * *', label: 'Hàng ngày lúc 6:00 AM' },
    { value: '0 0 12 * * *', label: 'Hàng ngày lúc 12:00 PM' },
    { value: '0 0 18 * * *', label: 'Hàng ngày lúc 6:00 PM' },
    { value: '0 0 0 * * *', label: 'Hàng ngày lúc nửa đêm' },
    { value: '0 0 8 * * 1', label: 'Thứ 2 hàng tuần lúc 8:00 AM' },
    { value: '0 0 9 * * 1-5', label: 'Thứ 2-6 hàng tuần lúc 9:00 AM' },
    { value: '0 0 20 * * 6,0', label: 'Cuối tuần lúc 8:00 PM' },
    { value: '0 0 0 1 * *', label: 'Đầu tháng lúc nửa đêm' },
    { value: '0 0 0 */7 * *', label: 'Mỗi 7 ngày lúc nửa đêm' },
  ];

  const getCronDescription = (cron) => {
    if (!cron) return 'Chưa có biểu thức cron';
    
    // Tìm trong danh sách preset
    const preset = cronPresets.find(p => p.value === cron);
    if (preset) return preset.label;
    
    // Phân tích cron expression (6 parts: giây phút giờ ngày tháng thứ)
    const parts = cron.split(' ');
    if (parts.length !== 6) return cron; // Không đúng format 6 phần
    
    const [second, minute, hour, dayOfMonth, month, dayOfWeek] = parts;
    
    // Tạo mô tả đơn giản
    let description = 'Chạy ';
    
    // Kiểm tra tần suất
    if (minute.startsWith('*/')) {
      const interval = minute.substring(2);
      description += `mỗi ${interval} phút`;
    } else if (hour.startsWith('*/')) {
      const interval = hour.substring(2);
      description += `mỗi ${interval} giờ`;
    } else if (dayOfMonth.startsWith('*/')) {
      const interval = dayOfMonth.substring(2);
      description += `mỗi ${interval} ngày`;
    } else if (dayOfWeek !== '*') {
      // Có chỉ định ngày trong tuần
      const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
      if (dayOfWeek.includes('-')) {
        description += `từ ${dayNames[dayOfWeek.split('-')[0]]} đến ${dayNames[dayOfWeek.split('-')[1]]}`;
      } else if (dayOfWeek.includes(',')) {
        const days = dayOfWeek.split(',').map(d => dayNames[parseInt(d)]).join(', ');
        description += `vào ${days}`;
      } else {
        description += `vào ${dayNames[parseInt(dayOfWeek)]}`;
      }
    } else if (dayOfMonth !== '*') {
      description += `vào ngày ${dayOfMonth} hàng tháng`;
    } else {
      description += 'hàng ngày';
    }
    
    // Thêm thời gian nếu có
    if (hour !== '*' && minute !== '*') {
      description += ` lúc ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
    }
    
    return description;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý lịch chạy</h1>
            <p className="mt-2 text-sm text-gray-700">
              Tạo và quản lý lịch trình tự động thu thập dữ liệu
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button onClick={handleAdd} className="inline-flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tạo lịch mới
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <Input
                label="Tìm kiếm"
                type="text"
                placeholder="Tìm kiếm tên lịch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
            </div>
            <div className="md:col-span-1">
              <Select
                label="Trạng thái"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'Tất cả trạng thái' },
                  { value: 'active', label: 'Đang hoạt động' },
                  { value: 'paused', label: 'Tạm dừng' }
                ]}
              />
            </div>
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                &nbsp;
              </label>
              <Button
                variant="secondary"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="w-full"
              >
                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Xóa bộ lọc
              </Button>
            </div>
          </div>
        </Card>

        {/* Schedules Table */}
        <Card>
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12">
                    STT
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tên lịch
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">
                    Loại Bot
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">
                    Ngày bắt đầu
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden xl:table-cell">
                    Biểu thức Cron
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">
                    Chu kỳ (s)
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Trạng thái
                  </th>
                  <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSchedules.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-500 text-sm">Không tìm thấy lịch nào</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSchedules.map((schedule, index) => (
                    <tr key={schedule.id} className="hover:bg-gray-50">
                      <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-900">
                        {(pagination.currentPage * pagination.pageSize) + index + 1}
                      </td>
                      <td className="px-3 py-3">
                        <div 
                          className="text-sm font-medium text-gray-900 max-w-[150px] sm:max-w-[200px] truncate" 
                          title={schedule.scheduleName}
                        >
                          {schedule.scheduleName}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          ID: {schedule.id}
                        </div>
                      </td>
                      <td className="px-3 py-3 hidden lg:table-cell">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          schedule.botType === 'CRON' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {schedule.botType || 'CRON'}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-900 hidden md:table-cell">
                        {schedule.startTime ? formatVietnameseDate(schedule.startTime) : '-'}
                      </td>
                      <td className="px-3 py-3 hidden xl:table-cell">
                        {schedule.cronExpr || schedule.cron ? (
                          <>
                            <div 
                              className="text-xs text-gray-900 font-mono max-w-[120px] truncate" 
                              title={schedule.cronExpr || schedule.cron}
                            >
                              {schedule.cronExpr || schedule.cron}
                            </div>
                            <div 
                              className="text-xs text-gray-500 mt-1 max-w-[120px] truncate" 
                              title={getCronDescription(schedule.cronExpr || schedule.cron)}
                            >
                              {getCronDescription(schedule.cronExpr || schedule.cron)}
                            </div>
                          </>
                        ) : schedule.interval_seconds ? (
                          <>
                            <div className="text-xs text-gray-900 font-mono">-</div>
                            <div className="text-xs text-gray-500 mt-1">Theo chu kỳ</div>
                          </>
                        ) : (
                          <>
                            <div className="text-xs text-gray-900 font-mono">-</div>
                            <div className="text-xs text-gray-500 mt-1">Chạy ngay</div>
                          </>
                        )}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-900 hidden lg:table-cell">
                        {schedule.interval_seconds ? 
                          `${schedule.interval_seconds}s` : 
                          <span className="text-gray-400 italic">-</span>
                        }
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        {schedule.status ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            ⏸ Tạm dừng
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-right text-xs font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(schedule)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Sửa"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(schedule.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Xóa"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <Button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 0}
                  variant="secondary"
                >
                  Trước
                </Button>
                <Button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages - 1}
                  variant="secondary"
                >
                  Sau
                </Button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Hiển thị{' '}
                    <span className="font-medium">{pagination.currentPage * pagination.pageSize + 1}</span>
                    {' '}-{' '}
                    <span className="font-medium">
                      {Math.min((pagination.currentPage + 1) * pagination.pageSize, pagination.totalElements)}
                    </span>
                    {' '}trong{' '}
                    <span className="font-medium">{pagination.totalElements}</span>
                    {' '}kết quả
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <Button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 0}
                      variant="secondary"
                      className="rounded-l-md"
                    >
                      Trước
                    </Button>
                    
                    {/* First page */}
                    {pagination.currentPage > 2 && (
                      <>
                        <Button
                          onClick={() => handlePageChange(0)}
                          variant="secondary"
                          className="rounded-none"
                        >
                          1
                        </Button>
                        {pagination.currentPage > 3 && (
                          <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                            ...
                          </span>
                        )}
                      </>
                    )}
                    
                    {/* Pages around current page */}
                    {Array.from({ length: pagination.totalPages }, (_, i) => i)
                      .filter(page => {
                        // Hiển thị trang hiện tại và 2 trang trước/sau
                        return page >= pagination.currentPage - 2 && page <= pagination.currentPage + 2;
                      })
                      .map(page => (
                        <Button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          variant={page === pagination.currentPage ? 'primary' : 'secondary'}
                          className="rounded-none"
                        >
                          {page + 1}
                        </Button>
                      ))}
                    
                    {/* Last page */}
                    {pagination.currentPage < pagination.totalPages - 3 && (
                      <>
                        {pagination.currentPage < pagination.totalPages - 4 && (
                          <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                            ...
                          </span>
                        )}
                        <Button
                          onClick={() => handlePageChange(pagination.totalPages - 1)}
                          variant="secondary"
                          className="rounded-none"
                        >
                          {pagination.totalPages}
                        </Button>
                      </>
                    )}
                    
                    <Button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage >= pagination.totalPages - 1}
                      variant="secondary"
                      className="rounded-r-md"
                    >
                      Sau
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Cấu hình Bot & Cron-job"
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Bot/Cron-job Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bot/ Cron - job <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                required
                value={formData.schedule_name}
                onChange={(e) => setFormData({ ...formData, schedule_name: e.target.value })}
                placeholder="Cron-job for Ha Noi Tax debt"
              />
            </div>

            {/* Bot Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại Bot <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.bot_type}
                onChange={(e) => {
                  const newBotType = e.target.value;
                  
                  // Reset payload based on bot type
                  if (newBotType === 'CRON') {
                    // Chuyển từ INTERVAL sang CRON - reset interval_seconds
                    setFormData({
                      ...formData,
                      bot_type: newBotType,
                      interval_seconds: null,
                      cron_expression: '0 0 6 * * *',
                      repeat_type: 'daily',
                      repeat_interval: 1
                    });
                  } else if (newBotType === 'INTERVAL') {
                    // Chuyển từ CRON sang INTERVAL - reset cron fields
                    setFormData({
                      ...formData,
                      bot_type: newBotType,
                      interval_seconds: 300, // Default 5 phút
                      cron_expression: null,
                      repeat_type: null,
                      repeat_interval: null
                    });
                  }
                }}
                options={[
                  { value: 'CRON', label: 'CRON - Lập lịch theo biểu thức cron' },
                  { value: 'INTERVAL', label: 'INTERVAL - Lập lịch theo chu kỳ giây' }
                ]}
              />
            </div>

            {/* Interval config - Only show when INTERVAL is selected */}
            {formData.bot_type === 'INTERVAL' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chọn ngày <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      required
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chu kỳ (giây) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      required
                      min="1"
                      value={formData.interval_seconds || ''}
                      onChange={(e) => setFormData({ ...formData, interval_seconds: parseInt(e.target.value) || null })}
                      placeholder="Nhập số giây, ví dụ: 300 (5 phút)"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Ví dụ: 60 = 1 phút, 300 = 5 phút, 3600 = 1 giờ
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Chọn ngày và Chọn giờ - Only show for CRON */}
            {formData.bot_type === 'CRON' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chọn ngày <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chọn giờ <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => {
                        setFormData({ ...formData, start_time: e.target.value });
                        setTimeout(() => updateCronExpression(), 100);
                      }}
                    />
                  </div>
                </div>

                {/* Vòng lặp và Chu kỳ */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vòng lặp <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.repeat_type}
                      onChange={(e) => {
                        setFormData({ ...formData, repeat_type: e.target.value });
                        setTimeout(() => updateCronExpression(), 100);
                      }}
                      options={[
                        { value: 'daily', label: 'Hàng ngày' },
                        { value: 'weekly', label: 'Hàng tuần' },
                        { value: 'monthly', label: 'Hàng tháng' },
                        { value: 'custom', label: 'Tùy chỉnh' }
                      ]}
                    />
                  </div>
                  
                  {/* Chỉ hiển thị chu kỳ khi không phải custom */}
                  {formData.repeat_type !== 'custom' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Chu kỳ <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Input
                          type="number"
                          min="1"
                          value={formData.repeat_interval}
                          onChange={(e) => {
                            setFormData({ ...formData, repeat_interval: parseInt(e.target.value) || 1 });
                            setTimeout(() => updateCronExpression(), 100);
                          }}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                          {formData.repeat_type === 'daily' ? 'ngày' : 
                           formData.repeat_type === 'weekly' ? 'tuần' : 
                           formData.repeat_type === 'monthly' ? 'tháng' : 'lần'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Custom cron expression input */}
                {formData.repeat_type === 'custom' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chọn mẫu hoặc nhập tùy chỉnh <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.cron_expression}
                      onChange={(e) => setFormData({ ...formData, cron_expression: e.target.value })}
                      options={[
                        { value: 'custom_input', label: '-- Nhập tùy chỉnh --' },
                        ...cronPresets.map(preset => ({
                          value: preset.value,
                          label: `${preset.label} (${preset.value})`
                        }))
                      ]}
                    />
                    
                    {/* Custom input field */}
                    {formData.cron_expression === 'custom_input' && (
                      <div className="mt-3">
                        <Input
                          type="text"
                          placeholder="Nhập biểu thức cron (6 phần): giây phút giờ ngày tháng thứ"
                          value={formData.cron_expression === 'custom_input' ? '' : formData.cron_expression}
                          onChange={(e) => setFormData({ ...formData, cron_expression: e.target.value })}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Format: giây phút giờ ngày tháng thứ (ví dụ: 0 0 6 * * * = 6:00 AM hàng ngày)
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Display generated cron expression */}
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Biểu thức Cron:</span>
                    <code className="text-sm font-mono bg-white px-3 py-1 rounded border border-gray-300 text-indigo-600">
                      {formData.cron_expression}
                    </code>
                  </div>
                  <div className="flex items-start">
                    <svg className="w-4 h-4 text-gray-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-gray-600">
                      {getCronDescription(formData.cron_expression)}
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Bật/Tắt checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="status_enabled"
                checked={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
              />
              <label htmlFor="status_enabled" className="ml-2 text-sm text-gray-700">
                Kích hoạt lịch chạy ngay (Status)
              </label>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowModal(false)}
              >
                Hủy
              </Button>
              <Button type="submit">
                Lưu
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingScheduleId(null);
          }}
          onConfirm={confirmDelete}
          title="Xác nhận xóa lịch chạy"
          message="Bạn có chắc chắn muốn xóa lịch chạy này? Hành động này không thể hoàn tác và sẽ ảnh hưởng đến các task liên quan."
          confirmText="Xóa"
          cancelText="Hủy"
          variant="danger"
        />
      </div>
    </MainLayout>
  );
};

export default SchedulesPage;