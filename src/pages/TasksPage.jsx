import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Select from '../components/ui/Select.jsx';
import Card from '../components/ui/Card.jsx';
import Modal from '../components/ui/Modal.jsx';
import ConfirmModal from '../components/ui/ConfirmModal.jsx';
import Loading from '../components/ui/Loading.jsx';
import Alert from '../components/ui/Alert.jsx';
import { taskService, scheduleService, keywordService, sourceService } from '../services/index.js';

const formatVietnameseDate = (dateString) => {
  if (!dateString) return '-';
  // Backend trả về LocalDate format: yyyy-MM-dd
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

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

const getStatusBadgeClass = (status) => {
  const statusMap = {
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'RUNNING': 'bg-blue-100 text-blue-800',
    'DONE': 'bg-green-100 text-green-800'
  };
  return statusMap[status] || 'bg-gray-100 text-gray-800';
};

const getStatusLabel = (status) => {
  const labels = {
    'PENDING': 'Chờ xử lý',
    'RUNNING': 'Đang chạy',
    'DONE': 'Hoàn thành'
  };
  return labels[status] || status;
};

const getCronDescription = (cron) => {
  if (!cron) return 'Chưa có biểu thức cron';
  
  // Danh sách các mẫu cron phổ biến
  const cronPresets = {
    '0 0 * * * *': 'Mỗi giờ',
    '0 */30 * * * *': 'Mỗi 30 phút',
    '0 */15 * * * *': 'Mỗi 15 phút',
    '0 */5 * * * *': 'Mỗi 5 phút',
    '0 0/5 * * * *': 'Mỗi 5 phút',
    '0 0 */2 * * *': 'Mỗi 2 giờ',
    '0 0 */6 * * *': 'Mỗi 6 giờ',
    '0 0 */12 * * *': 'Mỗi 12 giờ',
    '0 0 6 * * *': 'Hàng ngày lúc 6:00 AM',
    '0 0 12 * * *': 'Hàng ngày lúc 12:00 PM',
    '0 0 18 * * *': 'Hàng ngày lúc 6:00 PM',
    '0 0 0 * * *': 'Hàng ngày lúc nửa đêm',
    '0 0 8 * * 1': 'Thứ 2 hàng tuần lúc 8:00 AM',
    '0 0 9 * * 1-5': 'Thứ 2-6 hàng tuần lúc 9:00 AM',
    '0 0 20 * * 6,0': 'Cuối tuần lúc 8:00 PM',
    '0 0 0 1 * *': 'Đầu tháng lúc nửa đêm',
    '0 0 0 */7 * *': 'Mỗi 7 ngày lúc nửa đêm'
  };
  
  // Tìm trong danh sách preset
  if (cronPresets[cron]) return cronPresets[cron];
  
  // Phân tích cron expression (6 parts: giây phút giờ ngày tháng thứ)
  const parts = cron.split(' ');
  if (parts.length !== 6) return cron; // Không đúng format 6 phần
  
  const [second, minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  
  // Tạo mô tả đơn giản
  let description = 'Chạy ';
  
  // Kiểm tra tần suất
  if (minute.startsWith('*/') || minute.startsWith('0/')) {
    const interval = minute.includes('/') ? minute.split('/')[1] : minute;
    description += `mỗi ${interval} phút`;
  } else if (hour.startsWith('*/') || hour.startsWith('0/')) {
    const interval = hour.includes('/') ? hour.split('/')[1] : hour;
    description += `mỗi ${interval} giờ`;
  } else if (dayOfMonth.startsWith('*/')) {
    const interval = dayOfMonth.substring(2);
    description += `mỗi ${interval} ngày`;
  } else if (dayOfWeek !== '*') {
    // Có chỉ định ngày trong tuần
    const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    if (dayOfWeek.includes('-')) {
      const [start, end] = dayOfWeek.split('-');
      description += `từ ${dayNames[parseInt(start)]} đến ${dayNames[parseInt(end)]}`;
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
  if (hour !== '*' && !hour.includes('/') && minute !== '*' && !minute.includes('/')) {
    description += ` lúc ${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
  }
  
  return description;
};

// Hàm hiển thị lịch chạy cho task (cron hoặc interval)
const getTaskScheduleDisplay = (task) => {
  // Nếu có cronExpr thì hiển thị mô tả cron
  if (task.cronExpr) {
    return getCronDescription(task.cronExpr.trim());
  }
  
  // Nếu không có cron nhưng có interval_seconds thì hiển thị interval
  if (task.interval_seconds) {
    const seconds = task.interval_seconds;
    
    // Chuyển đổi giây sang định dạng dễ đọc
    if (seconds < 60) {
      return `Mỗi ${seconds} giây`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      if (remainingSeconds > 0) {
        return `Mỗi ${minutes} phút ${remainingSeconds} giây`;
      }
      return `Mỗi ${minutes} phút`;
    } else if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      const remainingMinutes = Math.floor((seconds % 3600) / 60);
      if (remainingMinutes > 0) {
        return `Mỗi ${hours} giờ ${remainingMinutes} phút`;
      }
      return `Mỗi ${hours} giờ`;
    } else {
      const days = Math.floor(seconds / 86400);
      const remainingHours = Math.floor((seconds % 86400) / 3600);
      if (remainingHours > 0) {
        return `Mỗi ${days} ngày ${remainingHours} giờ`;
      }
      return `Mỗi ${days} ngày`;
    }
  }
  
  // Nếu không có cả hai thì là chạy ngay
  return 'Chạy ngay';
};

const getScheduleDescription = (schedule) => {
  if (!schedule) return '';
  
  const parts = [];
  
  // Thời gian bắt đầu
  if (schedule.startTime) {
    parts.push(`Bắt đầu: ${formatVietnameseDate(schedule.startTime.trim())}`);
  }
  
  // Loại lịch và mô tả
  if (schedule.botType === 'CRON' && schedule.cronExpr) {
    const cronDesc = getCronDescription(schedule.cronExpr);
    parts.push(`Lịch Cron: ${cronDesc}`);
  } else if (schedule.botType === 'INTERVAL' && schedule.interval_seconds) {
    const seconds = schedule.interval_seconds;
    let intervalDesc = '';
    
    if (seconds < 60) {
      intervalDesc = `Mỗi ${seconds} giây`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      intervalDesc = remainingSeconds > 0 
        ? `Mỗi ${minutes} phút ${remainingSeconds} giây`
        : `Mỗi ${minutes} phút`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const remainingMinutes = Math.floor((seconds % 3600) / 60);
      intervalDesc = remainingMinutes > 0
        ? `Mỗi ${hours} giờ ${remainingMinutes} phút`
        : `Mỗi ${hours} giờ`;
    }
    
    parts.push(`Lặp lại: ${intervalDesc}`);
  }
  
  return parts.join(' • ');
};

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showManualRunModal, setShowManualRunModal] = useState(false);
  const [manualRunTab, setManualRunTab] = useState('keywords'); // 'keywords' or 'sources'
  const [manualRunKeywords, setManualRunKeywords] = useState([]);
  const [manualRunSources, setManualRunSources] = useState([]);
  const [activeKeywords, setActiveKeywords] = useState([]);
  const [activeSources, setActiveSources] = useState([]);
  const [modalActiveKeywords, setModalActiveKeywords] = useState([]);
  
  // Multi-step modal state
  const [modalStep, setModalStep] = useState(1); // 1: Chọn lịch, 2: Chọn từ khóa
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [keywordSearchInModal, setKeywordSearchInModal] = useState('');
  
  // Pagination for active keywords in manual run modal
  const [manualRunPagination, setManualRunPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 10
  });
  
  // Pagination for active sources in manual run modal
  const [manualRunSourcePagination, setManualRunSourcePagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 10
  });
  
  // Pagination for keywords in create/edit task modal
  const [modalKeywordPagination, setModalKeywordPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 10
  });
  
  // Manual run modal filters
  const [manualRunSearch, setManualRunSearch] = useState('');
  const [manualRunPlatformFilter, setManualRunPlatformFilter] = useState('all');
  
  // Create task modal filters
  const [modalKeywordSearch, setModalKeywordSearch] = useState('');
  const [modalPlatformFilter, setModalPlatformFilter] = useState('all');
  
  // Filters
  const [searchKeyword, setSearchKeyword] = useState('');
  const [scheduleStatusFilter, setScheduleStatusFilter] = useState('all');
  const [taskStatusFilter, setTaskStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  
  // Loading and messages
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 10
  });
  
  // Form data
  const [formData, setFormData] = useState({
    scheduleId: '',
    keywordName: [], // Vẫn dùng array cho form, backend sẽ nhận List<String>
    status: 'PENDING'
  });
  // Fetch tasks
  useEffect(() => {
    fetchTasks();
  }, [pagination.currentPage, searchKeyword, scheduleStatusFilter, taskStatusFilter, platformFilter]);

  // Reset về trang 0 khi bất kỳ filter nào thay đổi
  useEffect(() => {
    if (pagination.currentPage !== 0) {
      setPagination(prev => ({ ...prev, currentPage: 0 }));
    }
  }, [searchKeyword, scheduleStatusFilter, taskStatusFilter, platformFilter]);

  // Fetch schedules for dropdown
  useEffect(() => {
    fetchSchedules();
  }, []);

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

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Chỉ thêm field vào filterData khi có giá trị
      const filterData = {};
      
      if (searchKeyword && searchKeyword.trim()) {
        filterData.keyword = searchKeyword.trim();
      }
      
      if (scheduleStatusFilter !== 'all') {
        filterData.scheduleStatus = scheduleStatusFilter === 'active';
      }
      
      if (taskStatusFilter !== 'all') {
        filterData.taskStatus = taskStatusFilter;
      }
      
      if (platformFilter !== 'all') {
        filterData.platform = platformFilter;
      }
      
      const result = await taskService.getTasks(
        pagination.currentPage,
        pagination.pageSize,
        filterData
      );
      
      if (result.success && result.data) {
        setTasks(result.data.content || []);
        setPagination(prev => ({
          ...prev,
          totalPages: result.data.totalPages || 0,
          totalElements: result.data.totalElements || 0
        }));
      } else {
        setError('Không thể tải danh sách task');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tải danh sách task');
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    try {
      const result = await scheduleService.getSchedules(0, 100, null);
      if (result.success && result.data) {
        setSchedules(result.data.content || []);
      }
    } catch (err) {
      console.error('Error fetching schedules:', err);
    }
  };

  const handleAdd = () => {
    setEditingTask(null);
    setFormData({
      scheduleId: '',
      keywordName: [],
      status: 'PENDING'
    });
    // Reset multi-step modal
    setModalStep(1);
    setSelectedScheduleId(null);
    setKeywordSearchInModal('');
    setModalKeywordSearch('');
    setModalPlatformFilter('all');
    setModalKeywordPagination({
      currentPage: 0,
      totalPages: 0,
      totalElements: 0,
      pageSize: 10
    });
    setShowModal(true);
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      scheduleId: task.scheduleId || '',
      // Backend trả về keywordName là String, chuyển thành array cho form
      keywordName: task.keywordName ? [task.keywordName] : [],
      status: task.status || 'PENDING'
    });
    // Reset multi-step modal to step 1
    setModalStep(1);
    setSelectedScheduleId(task.scheduleId || null);
    setKeywordSearchInModal('');
    setModalKeywordSearch('');
    setModalPlatformFilter('all');
    setModalKeywordPagination({
      currentPage: 0,
      totalPages: 0,
      totalElements: 0,
      pageSize: 10
    });
    setShowModal(true);
  };

  const handleDelete = (taskId) => {
    setDeletingTaskId(taskId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingTaskId) return;
    
    try {
      setLoading(true);
      setError(null);
      const result = await taskService.deleteTask(deletingTaskId);
      
      if (result.success) {
        setSuccess('Xóa task thành công');
        fetchTasks();
      } else {
        setError(result.error || 'Không thể xóa task');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi xóa task');
    } finally {
      setLoading(false);
      setDeletingTaskId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.scheduleId) {
      setError('Vui lòng chọn lịch chạy');
      return;
    }
    
    if (!formData.keywordName || formData.keywordName.length === 0) {
      setError('Vui lòng chọn ít nhất một từ khóa');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      let result;
      if (editingTask) {
        // Khi UPDATE: gửi keywordName dạng String (lấy phần tử đầu tiên)
        const taskData = {
          scheduleId: parseInt(formData.scheduleId),
          keywordName: formData.keywordName[0], // Gửi string
          status: formData.status
        };
        result = await taskService.updateTask(editingTask.id, taskData);
      } else {
        // Khi CREATE: gửi keywordName dạng Array
        const taskData = {
          scheduleId: parseInt(formData.scheduleId),
          keywordName: formData.keywordName, // Gửi array
          status: formData.status
        };
        result = await taskService.createTask(taskData);
      }
      
      if (result.success) {
        setSuccess(editingTask ? 'Cập nhật task thành công' : 'Tạo task thành công');
        setShowModal(false);
        fetchTasks();
      } else {
        setError(result.error || 'Có lỗi xảy ra');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi lưu task');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTask = (task) => {
    setSelectedTask(task);
    setShowDetailModal(true);
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
  };

  const toggleKeywordSelection = (keywordName) => {
    setFormData(prev => {
      // Nếu đang edit, chỉ cho phép chọn 1 từ khóa (thay thế)
      if (editingTask) {
        return { ...prev, keywordName: [keywordName] };
      }
      
      // Nếu đang thêm mới, cho phép chọn nhiều từ khóa
      const keywords = prev.keywordName || [];
      if (keywords.includes(keywordName)) {
        return { ...prev, keywordName: keywords.filter(k => k !== keywordName) };
      } else {
        return { ...prev, keywordName: [...keywords, keywordName] };
      }
    });
  };

  const getScheduleName = (scheduleId) => {
    const schedule = schedules.find(s => s.id === scheduleId);
    return schedule ? schedule.scheduleName : `Schedule #${scheduleId}`;
  };

  const getScheduleDetails = (scheduleId) => {
    const schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule) return null;
    
    return {
      name: schedule.scheduleName,
      startTime: schedule.startTime,
      cronExpr: schedule.cronExpr || schedule.cron,
      cronDescription: getCronDescription(schedule.cronExpr.trim() || schedule.cron.trim()),
      botType: schedule.botType,
      intervalSeconds: schedule.interval_seconds
    };
  };

  // Multi-step modal handlers
  const handleNextToKeywords = () => {
    if (!selectedScheduleId) {
      setError('Vui lòng chọn lịch chạy');
      return;
    }
    setFormData(prev => ({ ...prev, scheduleId: selectedScheduleId }));
    setModalStep(2);
  };

  const handleBackToSchedule = () => {
    setModalStep(1);
    setKeywordSearchInModal('');
  };

  const handleSelectAllKeywords = () => {
    const filteredKeywordNames = modalActiveKeywords
      .filter(kw => kw.keyword.toLowerCase().includes(modalKeywordSearch.toLowerCase()))
      .map(kw => kw.keyword);
    setFormData(prev => ({ 
      ...prev, 
      keywordName: editingTask ? filteredKeywordNames.slice(0, 1) : filteredKeywordNames 
    }));
  };

  const handleDeselectAllKeywords = () => {
    setFormData(prev => ({ ...prev, keywordName: [] }));
  };

  const handleManualRun = () => {
    setManualRunTab('keywords'); // Reset to keywords tab
    setManualRunKeywords([]);
    setManualRunSources([]);
    setManualRunSearch('');
    setManualRunPlatformFilter('all');
    setManualRunPagination({
      currentPage: 0,
      totalPages: 0,
      totalElements: 0,
      pageSize: 10
    });
    setManualRunSourcePagination({
      currentPage: 0,
      totalPages: 0,
      totalElements: 0,
      pageSize: 10
    });
    setShowManualRunModal(true);
  };

  const fetchActiveKeywords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch only active keywords (status = true) with optional platform filter
      const filterRequest = {
        status: true
      };
      
      // Add platform filter if selected
      if (manualRunPlatformFilter !== 'all') {
        filterRequest.platform = manualRunPlatformFilter;
      }
      
      const result = await keywordService.getKeywords(
        manualRunPagination.currentPage,
        manualRunPagination.pageSize,
        filterRequest
      );
      
      if (result.success && result.data) {
        setActiveKeywords(result.data.content || []);
        setManualRunPagination(prev => ({
          ...prev,
          totalPages: result.data.totalPages || 0,
          totalElements: result.data.totalElements || 0
        }));
      } else {
        setError('Không thể tải danh sách từ khóa hoạt động');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tải danh sách từ khóa hoạt động');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveSources = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filterRequest = {
        status: true
      };
      
      if (manualRunPlatformFilter !== 'all') {
        filterRequest.platform = manualRunPlatformFilter;
      }
      
      const result = await sourceService.getSources(
        manualRunSourcePagination.currentPage,
        manualRunSourcePagination.pageSize,
        filterRequest
      );
      
      if (result.success && result.data) {
        setActiveSources(result.data.content || []);
        setManualRunSourcePagination(prev => ({
          ...prev,
          totalPages: result.data.totalPages || 0,
          totalElements: result.data.totalElements || 0
        }));
      } else {
        setError('Không thể tải danh sách nguồn URL hoạt động');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tải danh sách nguồn URL hoạt động');
    } finally {
      setLoading(false);
    }
  };

  const handleManualRunPageChange = (newPage) => {
    if (manualRunTab === 'keywords') {
      setManualRunPagination(prev => ({ ...prev, currentPage: newPage }));
    } else {
      setManualRunSourcePagination(prev => ({ ...prev, currentPage: newPage }));
    }
  };

  const handleManualRunSourcePageChange = (newPage) => {
    setManualRunSourcePagination(prev => ({ ...prev, currentPage: newPage }));
  };

  // Fetch active keywords/sources when modal opens, page changes, or filter changes
  useEffect(() => {
    if (showManualRunModal) {
      if (manualRunTab === 'keywords') {
        fetchActiveKeywords();
      } else {
        fetchActiveSources();
      }
    }
  }, [showManualRunModal, manualRunTab, manualRunPagination.currentPage, manualRunSourcePagination.currentPage, manualRunPlatformFilter]);

  // Reset to page 0 when filter or tab changes
  useEffect(() => {
    if (showManualRunModal && manualRunPlatformFilter !== 'all') {
      setManualRunPagination(prev => ({ ...prev, currentPage: 0 }));
      setManualRunSourcePagination(prev => ({ ...prev, currentPage: 0 }));
    }
  }, [manualRunPlatformFilter]);
  
  useEffect(() => {
    if (showManualRunModal) {
      setManualRunPagination(prev => ({ ...prev, currentPage: 0 }));
      setManualRunSourcePagination(prev => ({ ...prev, currentPage: 0 }));
    }
  }, [manualRunTab]);

  // Fetch keywords for Create/Edit Task modal (Step 2)
  const fetchModalKeywords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch only active keywords (status = true) with optional platform filter
      const filterRequest = {
        status: true
      };
      
      // Add platform filter if selected
      if (modalPlatformFilter !== 'all') {
        filterRequest.platform = modalPlatformFilter;
      }
      
      const result = await keywordService.getKeywords(
        modalKeywordPagination.currentPage,
        modalKeywordPagination.pageSize,
        filterRequest
      );
      
      if (result.success && result.data) {
        setModalActiveKeywords(result.data.content || []);
        setModalKeywordPagination(prev => ({
          ...prev,
          totalPages: result.data.totalPages || 0,
          totalElements: result.data.totalElements || 0
        }));
      } else {
        setError('Không thể tải danh sách từ khóa');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tải danh sách từ khóa');
    } finally {
      setLoading(false);
    }
  };

  const handleModalKeywordPageChange = (newPage) => {
    setModalKeywordPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  // Fetch keywords when modal opens to Step 2, page changes, or filter changes
  useEffect(() => {
    if (showModal && modalStep === 2) {
      fetchModalKeywords();
    }
  }, [showModal, modalStep, modalKeywordPagination.currentPage, modalPlatformFilter]);

  // Reset to page 0 when modal keyword filter changes
  useEffect(() => {
    if (showModal && modalStep === 2 && modalPlatformFilter !== 'all') {
      setModalKeywordPagination(prev => ({ ...prev, currentPage: 0 }));
    }
  }, [modalPlatformFilter]);

  const handleManualRunSubmit = async (e) => {
    e.preventDefault();

    if (manualRunTab === 'keywords' && !manualRunKeywords?.length) {
      setError('Vui lòng chọn ít nhất một từ khóa');
      return;
    }
    
    if (manualRunTab === 'sources' && !manualRunSources?.length) {
      setError('Vui lòng chọn ít nhất một nguồn URL');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (manualRunTab === 'keywords') {
        // Chuyển danh sách object -> string
        const keywordNames = manualRunKeywords.map(k =>
            typeof k === 'string' ? k : k.name
        );

        const result = await taskService.createHandleTask({ keywords: keywordNames });

        if (result.success) {
          setSuccess('Đã gửi yêu cầu chạy từ khóa thành công');
          setShowManualRunModal(false);
          setManualRunKeywords([]);
          // Cập nhật danh sách task sau khi chạy thành công
          fetchTasks();
        } else {
          setError(result.error || 'Có lỗi xảy ra khi chạy task thủ công');
        }
      } else {
        // Chạy sources
        const selectedSources = manualRunSources.map(s => 
          typeof s === 'string' ? s : s.sourceUrl
        );
        
        const createPayload = {
          sources: selectedSources.map(s => typeof s === 'string' ? s : s.url),
        };

        const result = await taskService.createHandleSource(createPayload);

        if (result.success) {
          setSuccess('Đã gửi yêu cầu chạy nguồn URL thành công');
          setShowManualRunModal(false);
          setManualRunSources([]);
          fetchTasks();
        } else {
          setError(result.error || 'Có lỗi xảy ra khi chạy nguồn URL');
        }
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi chạy task thủ công');
    } finally {
      setLoading(false);
    }
  };


  const toggleManualRunKeyword = (keywordName) => {
    setManualRunKeywords(prev => {
      if (prev.includes(keywordName)) {
        return prev.filter(k => k !== keywordName);
      } else {
        return [...prev, keywordName];
      }
    });
  };

  const toggleManualRunSource = (sourceUrl) => {
    setManualRunSources(prev => {
      if (prev.includes(sourceUrl)) {
        return prev.filter(s => s !== sourceUrl);
      } else {
        return [...prev, sourceUrl];
      }
    });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Alerts */}
        {error && (
          <Alert variant="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Task</h1>
            <p className="mt-2 text-sm text-gray-700">
              Theo dõi và quản lý các tác vụ crawl dữ liệu
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-2">
            <Button onClick={handleManualRun} disabled={loading} variant="secondary">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Chạy ngay
            </Button>
            <Button onClick={handleAdd} disabled={loading}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tạo Task mới
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Input
                label="Tìm kiếm từ khóa"
                type="text"
                placeholder="Nhập từ khóa..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                icon={
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />
            </div>
            
            <div>
              <Select
                label="Nền tảng"
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'Tất cả nền tảng' },
                  { value: 'facebook', label: 'Facebook' },
                  { value: 'youtube', label: 'Youtube' },
                  { value: 'tiktok', label: 'Tiktok' },
                  { value: 'shopee', label: 'Shopee' },
                  { value: 'website', label: 'Website' }
                ]}
              />
            </div>
            
            <div>
              <Select
                label="Trạng thái lịch chạy"
                value={scheduleStatusFilter}
                onChange={(e) => setScheduleStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'Tất cả' },
                  { value: 'active', label: 'Đang hoạt động' },
                  { value: 'inactive', label: 'Tạm dừng' }
                ]}
              />
            </div>
            
            <div>
              <Select
                label="Trạng thái task"
                value={taskStatusFilter}
                onChange={(e) => setTaskStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'Tất cả' },
                  { value: 'PENDING', label: 'Chờ xử lý' },
                  { value: 'RUNNING', label: 'Đang chạy' },
                  { value: 'DONE', label: 'Hoàn thành' }
                ]}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                &nbsp;
              </label>
              <Button
                variant="secondary"
                onClick={() => {
                  setSearchKeyword('');
                  setPlatformFilter('all');
                  setScheduleStatusFilter('all');
                  setTaskStatusFilter('all');
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

        {/* Tasks Table */}
        <Card>
          {loading ? (
            <div className="text-center py-12">
              <Loading />
            </div>
          ) : (
            <>
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12">
                        STT
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Từ khóa
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">
                        Nền tảng
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">
                        Bot
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden xl:table-cell">
                        Lịch chạy
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">
                        Bắt đầu
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden xl:table-cell">
                        Kết thúc
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
                    {tasks.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <p className="text-gray-500 text-sm">Không tìm thấy task nào</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      tasks.map((task, index) => (
                        <tr key={task.id} className="hover:bg-gray-50">
                          <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-900">
                            {pagination.currentPage * pagination.pageSize + index + 1}
                          </td>
                          <td className="px-3 py-3">
                            <div 
                              className="text-sm font-medium text-gray-900 max-w-[120px] sm:max-w-[180px] truncate" 
                              title={task.keywordName || task.source || '-'}
                            >
                              {task.keywordName || task.source || '-'}
                            </div>
                          </td>
                          <td className="px-3 py-3 hidden md:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {task.platform ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 capitalize">
                                  {task.platform}
                                </span>
                              ) : (
                                <span className="text-gray-400 text-xs italic">-</span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-600 hidden lg:table-cell">
                            <div className="max-w-[100px]">
                              {task.assignedBot ? (
                                <div>
                                  <div 
                                    className="font-medium text-gray-900 text-xs truncate" 
                                    title={task.assignedBot}
                                  >
                                    {task.assignedBot}
                                  </div>
                                  {task.botId && (
                                    <div 
                                      className="text-xs text-gray-500 truncate" 
                                      title={`ID: ${task.botId}`}
                                    >
                                      {task.botId}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-xs italic">-</span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-600 hidden xl:table-cell">
                            <div 
                              className="flex items-center max-w-[140px] truncate" 
                              title={getTaskScheduleDisplay(task)}
                            >
                              <svg className="w-3 h-3 mr-1 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="truncate">{getTaskScheduleDisplay(task)}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-500 hidden lg:table-cell">
                            <div className="max-w-[90px] truncate" title={
                              task.startTime 
                                ? formatVietnameseDate(task.startTime) 
                                : task.createdAt 
                                  ? formatVietnameseDateTime(task.createdAt)
                                  : '-'
                            }>
                              {task.startTime 
                                ? formatVietnameseDate(task.startTime) 
                                : task.createdAt 
                                  ? formatVietnameseDateTime(task.createdAt)
                                  : '-'
                              }
                            </div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-xs text-gray-500 hidden xl:table-cell">
                            {task.status === 'DONE' && task.updatedAt ? (
                              <div className="flex items-center text-green-600 max-w-[90px]" title={formatVietnameseDateTime(task.updatedAt)}>
                                <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="truncate">{formatVietnameseDateTime(task.updatedAt)}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs italic">-</span>
                            )}
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(task.status)}`}>
                              {getStatusLabel(task.status)}
                            </span>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-right text-xs font-medium">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleViewTask(task)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Xem chi tiết"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(task.id)}
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
            </>
          )}
        </Card>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setModalStep(1);
            setSelectedScheduleId(null);
            setKeywordSearchInModal('');
          }}
          title={editingTask ? 'Cập nhật Task' : 'Tạo Task mới'}
          size="lg"
        >
          <div className="space-y-4">
            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center">
                {/* Step 1 */}
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  modalStep === 1 ? 'bg-indigo-600 text-white' : 'bg-green-600 text-white'
                }`}>
                  {modalStep === 1 ? '1' : '✓'}
                </div>
                <div className="ml-2 mr-4">
                  <div className={`text-sm font-medium ${
                    modalStep === 1 ? 'text-indigo-600' : 'text-green-600'
                  }`}>Chọn lịch</div>
                </div>
                
                <div className="w-16 h-0.5 bg-gray-300 mx-2"></div>
                
                {/* Step 2 */}
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  modalStep === 2 ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  2
                </div>
                <div className="ml-2">
                  <div className={`text-sm font-medium ${
                    modalStep === 2 ? 'text-indigo-600' : 'text-gray-500'
                  }`}>Chọn từ khóa</div>
                </div>
              </div>
            </div>

            {/* Step 1: Select Schedule */}
            {modalStep === 1 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700">Chọn lịch chạy</h3>
                  <span className="text-xs text-gray-500">
                    {schedules.length} lịch khả dụng
                  </span>
                </div>
                
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {schedules.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm">Không có lịch chạy nào</p>
                    </div>
                  ) : (
                    schedules.map(schedule => {
                      const isSelected = selectedScheduleId === schedule.id;
                      const description = getScheduleDescription(schedule);
                      const isDisabled = !schedule.status; // Disable nếu lịch tạm dừng
                      
                      return (
                        <label
                          key={schedule.id}
                          className={`flex items-start p-4 border-2 rounded-lg transition-all ${
                            isDisabled
                              ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                              : isSelected
                              ? 'border-indigo-500 bg-indigo-50 cursor-pointer'
                              : 'border-gray-300 hover:border-indigo-300 hover:bg-gray-50 cursor-pointer'
                          }`}
                        >
                          <input
                            type="radio"
                            name="schedule"
                            checked={isSelected}
                            onChange={() => setSelectedScheduleId(schedule.id)}
                            disabled={isDisabled}
                            className="mt-1 mr-3 disabled:cursor-not-allowed"
                          />
                          <div className="flex-1">
                            <div className={`font-medium ${isDisabled ? 'text-gray-500' : 'text-gray-900'}`}>
                              {schedule.scheduleName}
                            </div>
                            {description && (
                              <div className={`text-sm mt-1 ${isDisabled ? 'text-gray-400' : 'text-gray-600'}`}>
                                {description}
                              </div>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                schedule.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {schedule.status ? 'Đang hoạt động' : 'Tạm dừng'}
                              </span>
                              <span className={`text-xs ${isDisabled ? 'text-gray-400' : 'text-gray-500'}`}>
                                ID: {schedule.id}
                              </span>
                            </div>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>

                {/* Action Buttons for Step 1 */}
                <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={() => {
                      setShowModal(false);
                      setModalStep(1);
                      setSelectedScheduleId(null);
                      setKeywordSearchInModal('');
                    }}
                  >
                    Hủy
                  </Button>
                  <Button 
                    type="button"
                    onClick={handleNextToKeywords}
                    disabled={!selectedScheduleId}
                  >
                    Tiếp theo
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Select Keywords */}
            {modalStep === 2 && (
              <form onSubmit={handleSubmit}>
                <button
                  type="button"
                  onClick={handleBackToSchedule}
                  className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 mb-3"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Quay lại chọn lịch
                </button>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-700">
                      Chọn từ khóa
                    </h3>
                    <span className="text-xs text-gray-500">
                      Tổng: {modalKeywordPagination.totalElements} từ khóa
                      {modalPlatformFilter !== 'all' && ` (${modalPlatformFilter})`}
                    </span>
                  </div>
                </div>

                {/* Search and Platform Filter */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <Input
                      type="text"
                      placeholder="Tìm kiếm từ khóa..."
                      value={modalKeywordSearch}
                      onChange={(e) => setModalKeywordSearch(e.target.value)}
                      icon={
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      }
                    />
                  </div>
                  <div>
                    <Select
                      value={modalPlatformFilter}
                      onChange={(e) => setModalPlatformFilter(e.target.value)}
                      options={[
                        { value: 'all', label: 'Tất cả nền tảng' },
                        { value: 'facebook', label: 'Facebook' },
                        { value: 'youtube', label: 'Youtube' },
                        { value: 'tiktok', label: 'Tiktok' },
                        { value: 'shopee', label: 'Shopee' },
                        { value: 'website', label: 'Website' }
                      ]}
                    />
                  </div>
                </div>

                {/* Search and action buttons */}
                <div className="mb-3 space-y-2">
                  {/* Chỉ hiển thị nút chọn tất cả/bỏ chọn tất cả khi THÊM MỚI */}
                  {!editingTask && (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSelectAllKeywords}
                        className="flex-1"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Chọn trang này
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleDeselectAllKeywords}
                        className="flex-1"
                        disabled={formData.keywordName.length === 0}
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Bỏ chọn tất cả
                      </Button>
                    </div>
                  )}
                  {/* Thông báo khi đang edit */}
                  {editingTask && (
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-800">
                        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Chế độ cập nhật: Chỉ được chọn 1 từ khóa
                      </p>
                    </div>
                  )}
                </div>

                {/* Keywords List */}
                {loading ? (
                  <div className="text-center py-12">
                    <Loading />
                  </div>
                ) : (
                  <>
                    <div className="max-h-80 overflow-y-auto border rounded-lg">
                      {modalActiveKeywords.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm">Không tìm thấy từ khóa phù hợp</p>
                        </div>
                      ) : (
                        modalActiveKeywords
                          .filter(kw => kw.keyword.toLowerCase().includes(modalKeywordSearch.toLowerCase()))
                          .map((keyword, index) => (
                            <label
                              key={keyword.id}
                              className="flex items-center p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                            >
                              {/* Khi EDIT: dùng radio, khi THÊM MỚI: dùng checkbox */}
                              <input
                                type={editingTask ? "radio" : "checkbox"}
                                name={editingTask ? "keyword-radio" : undefined}
                                checked={formData.keywordName.includes(keyword.keyword)}
                                onChange={() => toggleKeywordSelection(keyword.keyword)}
                                className={editingTask 
                                  ? "border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-3"
                                  : "rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-3"
                                }
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">
                                    #{modalKeywordPagination.currentPage * modalKeywordPagination.pageSize + index + 1}
                                  </span>
                                  <div className="text-sm font-medium text-gray-900">{keyword.keyword}</div>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {keyword.platform && keyword.platform.map((platform, idx) => (
                                    <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                      {platform}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✓ Hoạt động
                              </span>
                            </label>
                          ))
                      )}
                      
                      {/* Show message if search filters out all results */}
                      {modalActiveKeywords.length > 0 && 
                       modalActiveKeywords.filter(kw => kw.keyword.toLowerCase().includes(modalKeywordSearch.toLowerCase())).length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <p className="text-sm">Không tìm thấy "{modalKeywordSearch}"</p>
                          <p className="text-xs text-gray-400 mt-2">Thử từ khóa tìm kiếm khác</p>
                        </div>
                      )}
                    </div>

                    {/* Pagination */}
                    {modalKeywordPagination.totalPages > 1 && (
                      <div className="mt-4 flex items-center justify-between border-t pt-3">
                        <div>
                          <p className="text-xs text-gray-600">
                            Trang {modalKeywordPagination.currentPage + 1} / {modalKeywordPagination.totalPages}
                            {' '}({modalKeywordPagination.totalElements} từ khóa)
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            onClick={() => handleModalKeywordPageChange(modalKeywordPagination.currentPage - 1)}
                            disabled={modalKeywordPagination.currentPage === 0}
                            variant="secondary"
                            size="sm"
                          >
                            ← Trước
                          </Button>
                          <div className="flex items-center px-3 text-sm text-gray-700">
                            {modalKeywordPagination.currentPage + 1}
                          </div>
                          <Button
                            type="button"
                            onClick={() => handleModalKeywordPageChange(modalKeywordPagination.currentPage + 1)}
                            disabled={modalKeywordPagination.currentPage >= modalKeywordPagination.totalPages - 1}
                            variant="secondary"
                            size="sm"
                          >
                            Sau →
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {formData.keywordName.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      {editingTask ? (
                        <>
                          <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Đã chọn: <strong>{formData.keywordName[0]}</strong>
                        </>
                      ) : (
                        <>
                          Đã chọn: <strong>{formData.keywordName.length}</strong> từ khóa
                        </>
                      )}
                    </p>
                  </div>
                )}

                {/* Status Selection */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    options={[
                      { value: 'PENDING', label: 'Chờ xử lý' },
                      { value: 'RUNNING', label: 'Đang chạy' },
                      { value: 'DONE', label: 'Hoàn thành' }
                    ]}
                  />
                </div>

                {/* Action Buttons for Step 2 */}
                <div className="flex justify-between space-x-2 pt-4 border-t mt-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handleBackToSchedule}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Quay lại
                  </Button>
                  <div className="flex space-x-2">
                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={() => {
                        setShowModal(false);
                        setModalStep(1);
                        setSelectedScheduleId(null);
                        setKeywordSearchInModal('');
                      }}
                    >
                      Hủy
                    </Button>
                    <Button 
                      type="submit"
                      disabled={loading || formData.keywordName.length === 0}
                    >
                      {loading ? 'Đang xử lý...' : (editingTask ? 'Cập nhật' : 'Tạo mới')}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </Modal>

        {/* Detail Modal */}
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Chi tiết Task"
          size="lg"
        >
          {selectedTask && (
            <div className="space-y-6">
              {/* Header với trạng thái */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Task #{selectedTask.id}</h3>
                  <p className="text-sm text-gray-600 mt-1">{selectedTask.keywordName || 'Chưa có từ khóa'}</p>
                </div>
                <span className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full ${getStatusBadgeClass(selectedTask.status)}`}>
                  {getStatusLabel(selectedTask.status)}
                </span>
              </div>

              {/* Thông tin cơ bản */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <label className="text-sm font-medium text-gray-700">Từ khóa</label>
                  </div>
                  <p className="text-base font-semibold text-gray-900 ml-7">{selectedTask.keywordName || '-'}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <label className="text-sm font-medium text-gray-700">Nền tảng</label>
                  </div>
                  <p className="text-base font-semibold text-gray-900 ml-7 capitalize">
                    {selectedTask.platform || '-'}
                  </p>
                </div>
              </div>

              {/* Thông tin thời gian */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Thông tin thời gian
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-xs text-blue-600 font-medium">Thời gian bắt đầu</p>
                      <p className="text-sm font-semibold text-blue-900 mt-1">
                        {selectedTask.startTime 
                          ? formatVietnameseDate(selectedTask.startTime) 
                          : selectedTask.createdAt 
                            ? formatVietnameseDateTime(selectedTask.createdAt)
                            : 'Chưa xác định'
                        }
                      </p>
                      {!selectedTask.startTime && selectedTask.createdAt && (
                        <p className="text-xs text-blue-600 italic mt-1">
                          (Dùng thời gian tạo)
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start p-3 bg-green-50 rounded-lg border border-green-100">
                    <svg className="w-5 h-5 text-green-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-xs text-green-600 font-medium">Ngày tạo</p>
                      <p className="text-sm font-semibold text-green-900 mt-1">
                        {selectedTask.createdAt ? formatVietnameseDateTime(selectedTask.createdAt) : '-'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <svg className="w-5 h-5 text-purple-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <div>
                      <p className="text-xs text-purple-600 font-medium">Cập nhật lần cuối</p>
                      <p className="text-sm font-semibold text-purple-900 mt-1">
                        {selectedTask.updatedAt ? formatVietnameseDateTime(selectedTask.updatedAt) : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thông tin lịch chạy */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Cấu hình lịch chạy
                </h4>
                <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                  <div className="flex items-center text-base font-semibold text-gray-900 mb-3">
                    <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{getTaskScheduleDisplay(selectedTask)}</span>
                  </div>
                  
                  {selectedTask.cronExpr && (
                    <div className="mb-2">
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Biểu thức Cron:</label>
                      <div className="text-sm text-gray-800 font-mono bg-white px-3 py-2 rounded border border-gray-300 shadow-sm">
                        {selectedTask.cronExpr}
                      </div>
                    </div>
                  )}
                  
                  {selectedTask.interval_seconds && (
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Khoảng thời gian:</label>
                      <div className="text-sm text-gray-800 bg-white px-3 py-2 rounded border border-gray-300 shadow-sm">
                        <span className="font-semibold">{selectedTask.interval_seconds}</span> giây
                      </div>
                    </div>
                  )}
                  
                  {!selectedTask.cronExpr && !selectedTask.interval_seconds && (
                    <p className="text-sm text-gray-500 italic">Chạy ngay một lần</p>
                  )}
                </div>
              </div>

              {/* Thông tin Bot */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                  Thông tin Bot
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 font-medium mb-1">Bot được gán</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedTask.assignedBot || (
                        <span className="text-gray-400 italic">Chưa gán bot</span>
                      )}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 font-medium mb-1">Bot ID</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedTask.botId || (
                        <span className="text-gray-400 italic">-</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="border-t border-gray-200 pt-4 flex justify-end">
                <Button 
                  onClick={() => setShowDetailModal(false)}
                  variant="primary"
                >
                  Đóng
                </Button>
              </div>
            </div>
          )}
        </Modal>
        
        {/* Manual Run Modal */}
        <Modal
          isOpen={showManualRunModal}
          onClose={() => {
            setShowManualRunModal(false);
            setManualRunTab('keywords');
            setManualRunKeywords([]);
            setManualRunSources([]);
            setManualRunSearch('');
            setManualRunPlatformFilter('all');
          }}
          title="Chạy Task thủ công"
          size="lg"
        >
          <form onSubmit={handleManualRunSubmit}>
            <div className="mb-4">
              {/* Tabs */}
              <div className="border-b border-gray-200 mb-4">
                <nav className="-mb-px flex space-x-8">
                  <button
                    type="button"
                    onClick={() => setManualRunTab('keywords')}
                    className={`${
                      manualRunTab === 'keywords'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                    Từ khóa
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualRunTab('sources')}
                    className={`${
                      manualRunTab === 'sources'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Nguồn URL
                  </button>
                </nav>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                {manualRunTab === 'keywords' 
                  ? 'Chọn từ khóa đang hoạt động để chạy task ngay lập tức mà không cần tạo lịch chạy'
                  : 'Chọn nguồn URL đang hoạt động để chạy task ngay lập tức mà không cần tạo lịch chạy'
                }
              </p>
              
              {/* Search and Platform Filter */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div>
                  <Input
                    label={manualRunTab === 'keywords' ? "Tìm kiếm từ khóa" : "Tìm kiếm URL"}
                    type="text"
                    placeholder={manualRunTab === 'keywords' ? "Nhập từ khóa cần tìm..." : "Nhập URL cần tìm..."}
                    value={manualRunSearch}
                    onChange={(e) => setManualRunSearch(e.target.value)}
                    icon={
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    }
                  />
                </div>
                <div>
                  <Select
                    label="Lọc theo nền tảng"
                    value={manualRunPlatformFilter}
                    onChange={(e) => setManualRunPlatformFilter(e.target.value)}
                    options={[
                      { value: 'all', label: 'Tất cả nền tảng' },
                      { value: 'facebook', label: 'Facebook' },
                      { value: 'youtube', label: 'Youtube' },
                      { value: 'tiktok', label: 'Tiktok' },
                      { value: 'shopee', label: 'Shopee' },
                      { value: 'website', label: 'Website' }
                    ]}
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700">
                  {manualRunTab === 'keywords' ? 'Danh sách từ khóa' : 'Danh sách nguồn URL'}
                </h3>
                <span className="text-xs text-gray-500">
                  {manualRunTab === 'keywords' 
                    ? `Tổng: ${manualRunPagination.totalElements} từ khóa`
                    : `Tổng: ${manualRunSourcePagination.totalElements} nguồn URL`
                  }
                  {manualRunPlatformFilter !== 'all' && ` (${manualRunPlatformFilter})`}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mb-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (manualRunTab === 'keywords') {
                      const currentPageKeywords = activeKeywords.map(kw => kw.keyword);
                      setManualRunKeywords(prev => {
                        const newSet = new Set([...prev, ...currentPageKeywords]);
                        return Array.from(newSet);
                      });
                    } else {
                      const currentPageSources = activeSources.map(s => s.sourceUrl);
                      setManualRunSources(prev => {
                        const newSet = new Set([...prev, ...currentPageSources]);
                        return Array.from(newSet);
                      });
                    }
                  }}
                  className="flex-1"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Chọn trang này
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (manualRunTab === 'keywords') {
                      setManualRunKeywords([]);
                    } else {
                      setManualRunSources([]);
                    }
                  }}
                  className="flex-1"
                  disabled={
                    (manualRunTab === 'keywords' && manualRunKeywords.length === 0) ||
                    (manualRunTab === 'sources' && manualRunSources.length === 0)
                  }
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Bỏ chọn tất cả
                </Button>
              </div>

              {/* Keywords/Sources List */}
              {loading ? (
                <div className="text-center py-12">
                  <Loading />
                </div>
              ) : (
                <>
                  <div className="max-h-80 overflow-y-auto border rounded-lg">
                    {manualRunTab === 'keywords' ? (
                      // Keywords List
                      activeKeywords.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm">Không tìm thấy từ khóa hoạt động nào</p>
                          {(manualRunSearch || manualRunPlatformFilter !== 'all') && (
                            <p className="text-xs text-gray-400 mt-2">Thử thay đổi bộ lọc hoặc tìm kiếm</p>
                          )}
                        </div>
                      ) : (
                        activeKeywords
                          .filter(keyword => 
                            keyword.keyword.toLowerCase().includes(manualRunSearch.toLowerCase())
                          )
                          .map((keyword, index) => (
                          <label
                            key={keyword.id}
                            className="flex items-center p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={manualRunKeywords.includes(keyword.keyword)}
                              onChange={() => toggleManualRunKeyword(keyword.keyword)}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-3"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                  #{manualRunPagination.currentPage * manualRunPagination.pageSize + index + 1}
                                </span>
                                <div className="text-sm font-medium text-gray-900">{keyword.keyword}</div>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {keyword.platform && keyword.platform.map((platform, idx) => (
                                  <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    {platform}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ Hoạt động
                            </span>
                          </label>
                        ))
                      )
                    ) : (
                      // Sources List
                      activeSources.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          <p className="text-sm">Không tìm thấy nguồn URL hoạt động nào</p>
                          {(manualRunSearch || manualRunPlatformFilter !== 'all') && (
                            <p className="text-xs text-gray-400 mt-2">Thử thay đổi bộ lọc hoặc tìm kiếm</p>
                          )}
                        </div>
                      ) : (
                        activeSources
                          .filter(source => 
                            source.sourceUrl?.toLowerCase().includes(manualRunSearch.toLowerCase()) ||
                            source.companyName?.toLowerCase().includes(manualRunSearch.toLowerCase())
                          )
                          .map((source, index) => (
                          <label
                            key={source.id}
                            className="flex items-center p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={manualRunSources.includes(source.sourceUrl)}
                              onChange={() => toggleManualRunSource(source.sourceUrl)}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-3"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                  #{manualRunSourcePagination.currentPage * manualRunSourcePagination.pageSize + index + 1}
                                </span>
                                <div className="text-sm font-medium text-gray-900 max-w-sm truncate" title={source.sourceUrl}>
                                  {source.sourceUrl}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                {source.companyName && (
                                  <span className="text-xs text-gray-600">
                                    {source.companyName}
                                  </span>
                                )}
                                <div className="flex flex-wrap gap-1">
                                  {source.platform && source.platform.map((platform, idx) => (
                                    <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                      {platform}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ Hoạt động
                            </span>
                          </label>
                        ))
                      )
                    )}
                    
                    {/* Show message if search filters out all results */}
                    {manualRunTab === 'keywords' ? (
                      activeKeywords.length > 0 && 
                      activeKeywords.filter(kw => kw.keyword.toLowerCase().includes(manualRunSearch.toLowerCase())).length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <p className="text-sm">Không tìm thấy "{manualRunSearch}"</p>
                          <p className="text-xs text-gray-400 mt-2">Thử từ khóa tìm kiếm khác</p>
                        </div>
                      )
                    ) : (
                      activeSources.length > 0 && 
                      activeSources.filter(s => 
                        s.sourceUrl?.toLowerCase().includes(manualRunSearch.toLowerCase()) ||
                        s.companyName?.toLowerCase().includes(manualRunSearch.toLowerCase())
                      ).length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <p className="text-sm">Không tìm thấy "{manualRunSearch}"</p>
                          <p className="text-xs text-gray-400 mt-2">Thử từ khóa tìm kiếm khác</p>
                        </div>
                      )
                    )}
                  </div>

                  {/* Pagination */}
                  {((manualRunTab === 'keywords' && manualRunPagination.totalPages > 1) ||
                    (manualRunTab === 'sources' && manualRunSourcePagination.totalPages > 1)) && (
                    <div className="mt-4 flex items-center justify-between border-t pt-3">
                      <div>
                        <p className="text-xs text-gray-600">
                          {manualRunTab === 'keywords' ? (
                            <>
                              Trang {manualRunPagination.currentPage + 1} / {manualRunPagination.totalPages}
                              {' '}({manualRunPagination.totalElements} từ khóa)
                            </>
                          ) : (
                            <>
                              Trang {manualRunSourcePagination.currentPage + 1} / {manualRunSourcePagination.totalPages}
                              {' '}({manualRunSourcePagination.totalElements} nguồn)
                            </>
                          )}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          onClick={() => {
                            if (manualRunTab === 'keywords') {
                              handleManualRunPageChange(manualRunPagination.currentPage - 1);
                            } else {
                              handleManualRunSourcePageChange(manualRunSourcePagination.currentPage - 1);
                            }
                          }}
                          disabled={
                            manualRunTab === 'keywords' 
                              ? manualRunPagination.currentPage === 0 
                              : manualRunSourcePagination.currentPage === 0
                          }
                          variant="secondary"
                          size="sm"
                        >
                          ← Trước
                        </Button>
                        <div className="flex items-center px-3 text-sm text-gray-700">
                          {manualRunTab === 'keywords' 
                            ? manualRunPagination.currentPage + 1 
                            : manualRunSourcePagination.currentPage + 1}
                        </div>
                        <Button
                          type="button"
                          onClick={() => {
                            if (manualRunTab === 'keywords') {
                              handleManualRunPageChange(manualRunPagination.currentPage + 1);
                            } else {
                              handleManualRunSourcePageChange(manualRunSourcePagination.currentPage + 1);
                            }
                          }}
                          disabled={
                            manualRunTab === 'keywords'
                              ? manualRunPagination.currentPage >= manualRunPagination.totalPages - 1
                              : manualRunSourcePagination.currentPage >= manualRunSourcePagination.totalPages - 1
                          }
                          variant="secondary"
                          size="sm"
                        >
                          Sau →
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Selected Items Summary */}
              {(manualRunKeywords.length > 0 || manualRunSources.length > 0) && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-800">
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {manualRunTab === 'keywords' ? (
                      <>Đã chọn: <strong>{manualRunKeywords.length}</strong> từ khóa sẽ được chạy ngay</>
                    ) : (
                      <>Đã chọn: <strong>{manualRunSources.length}</strong> nguồn URL sẽ được chạy ngay</>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => {
                  setShowManualRunModal(false);
                  setManualRunKeywords([]);
                  setManualRunSources([]);
                }}
              >
                Hủy
              </Button>
              <Button 
                type="submit"
                disabled={
                  loading || 
                  (manualRunTab === 'keywords' && manualRunKeywords.length === 0) ||
                  (manualRunTab === 'sources' && manualRunSources.length === 0)
                }
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {manualRunTab === 'keywords' ? (
                      <>Chạy ngay ({manualRunKeywords.length} từ khóa)</>
                    ) : (
                      <>Chạy ngay ({manualRunSources.length} nguồn)</>
                    )}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Modal>
        
        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingTaskId(null);
          }}
          onConfirm={confirmDelete}
          title="Xác nhận xóa Task"
          message="Bạn có chắc chắn muốn xóa task này? Hành động này không thể hoàn tác."
          confirmText="Xóa"
          cancelText="Hủy"
          variant="danger"
        />
      </div>
    </MainLayout>
  );
};

export default TasksPage;
