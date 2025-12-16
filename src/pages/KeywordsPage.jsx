import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Select from '../components/ui/Select.jsx';
import Modal from '../components/ui/Modal.jsx';
import ConfirmModal from '../components/ui/ConfirmModal.jsx';
import Card from '../components/ui/Card.jsx';
import Loading from '../components/ui/Loading.jsx';
import Alert from '../components/ui/Alert.jsx';
import { keywordService } from '../services/index.js';

const formatVietnameseDate = (date) => {
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const PlatformBadge = ({ platform }) => {
  const platformConfig = {
    facebook: { 
      icon: (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      label: 'Facebook', 
      color: 'bg-blue-100 text-blue-800' 
    },
    youtube: { 
      icon: (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
      label: 'Youtube', 
      color: 'bg-red-100 text-red-800' 
    },
    tiktok: { 
      icon: (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>
      ),
      label: 'Tiktok', 
      color: 'bg-gray-100 text-gray-900' 
    },
    shopee: { 
      icon: (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7.5 6.5C7.5 8.981 9.519 11 12 11s4.5-2.019 4.5-4.5S14.481 2 12 2 7.5 4.019 7.5 6.5zM20 21h1v-1c0-3.859-3.141-7-7-7h-4c-3.86 0-7 3.141-7 7v1h1 1 14H20z"/>
          <path d="M4 9 L20 9 L18 20 L6 20 Z" strokeWidth="1.5" stroke="currentColor" fill="none"/>
        </svg>
      ),
      label: 'Shopee', 
      color: 'bg-orange-100 text-orange-800' 
    },
    website: { 
      icon: (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
        </svg>
      ),
      label: 'Website', 
      color: 'bg-green-100 text-green-800' 
    }
  };
  
  const config = platformConfig[platform] || { 
    icon: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    ),
    label: platform, 
    color: 'bg-gray-100 text-gray-800' 
  };
  
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color} mr-1 mb-1`}>
      {config.icon} <span>{config.label}</span>
    </span>
  );
};

const KeywordsPage = () => {
  const [keywords, setKeywords] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingKeywordId, setDeletingKeywordId] = useState(null);
  const [editingKeyword, setEditingKeyword] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serverFilter, setServerFilter] = useState('all');
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
    keyword: '',
    keywords: [],
    platforms: ['facebook'],
    server: ['server_test'],
    status: true
  });

  useEffect(() => {
    fetchKeywords();
  }, [pagination.currentPage, statusFilter, platformFilter, serverFilter]);

  // Reset về trang 0 khi thay đổi filter
  useEffect(() => {
    setPagination(prev => ({ ...prev, currentPage: 0 }));
  }, [statusFilter, platformFilter, serverFilter]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleKeywordEnter = (e) => {
    // Chỉ cho phép thêm từ khóa khi đang ở chế độ thêm mới (không phải edit)
    if (e.key === 'Enter' && !editingKeyword) {
      e.preventDefault();
      const trimmed = formData.keyword.trim();
      if (trimmed && !formData.keywords.includes(trimmed)) {
        setFormData({
          ...formData,
          keywords: [...formData.keywords, trimmed],
          keyword: '', // reset input
        });
      }
    }
  };

  const removeKeyword = (kw) => {
    // Chỉ cho phép xóa từ khóa khi đang ở chế độ thêm mới (không phải edit)
    if (!editingKeyword) {
      setFormData({
        ...formData,
        keywords: formData.keywords.filter(k => k !== kw),
      });
    }
  };

  const fetchKeywords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Tạo filter request object theo format KeywordFilterRequest
      const filterRequest = {};
      
      // Set platform filter
      if (platformFilter !== 'all') {
        filterRequest.platform = platformFilter;
      }
      
      // Set server filter
      if (serverFilter !== 'all') {
        filterRequest.server = serverFilter;
      }
      
      // Set status filter
      if (statusFilter === 'active') {
        filterRequest.status = true;
      } else if (statusFilter === 'inactive') {
        filterRequest.status = false;
      }
      
      const result = await keywordService.getKeywords(
        pagination.currentPage, 
        pagination.pageSize,
        filterRequest
      );
      
      if (result.success && result.data) {
        setKeywords(result.data.content || []);
        setPagination(prev => ({
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

  const filteredKeywords = keywords.filter(keyword => {
    // Chỉ filter theo search term vì platform và status đã được filter ở backend
    const matchesSearch = keyword.keyword?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleAdd = () => {
    setEditingKeyword(null);
    setFormData({ keyword: '', keywords: [], platforms: ['facebook'], server: ['server_test'], status: true });
    setShowModal(true);
  };

  const handleEdit = (keyword) => {
    setEditingKeyword(keyword);
    setFormData({
      keyword: keyword.keyword, // Hiển thị từ khóa hiện tại trong input để sửa
      keywords: [], // Không dùng mảng keywords khi edit
      platforms: keyword.platform || ['facebook'],
      server: keyword.server || ['server_test'],
      status: keyword.status !== undefined ? keyword.status : true
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    setDeletingKeywordId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingKeywordId) return;
    
    try {
      setLoading(true);
      setError(null);
      const result = await keywordService.deleteKeyword(deletingKeywordId);
      
      if (result.success) {
        setSuccess('Xóa từ khóa thành công');
        fetchKeywords();
      } else {
        setError(result.error || 'Không thể xóa từ khóa');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi xóa từ khóa');
    } finally {
      setLoading(false);
      setDeletingKeywordId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      let result;

      if (editingKeyword) {
        // Khi edit: gửi newKeyword (string), platforms (array) và status
        if (!formData.keyword.trim()) {
          setError('Vui lòng nhập từ khóa');
          setLoading(false);
          return;
        }

        if (formData.platforms.length === 0) {
          setError('Vui lòng chọn ít nhất một nền tảng');
          setLoading(false);
          return;
        }

        if (formData.server.length === 0) {
          setError('Vui lòng chọn ít nhất một server');
          setLoading(false);
          return;
        }

        const updatePayload = {
          newKeyword: formData.keyword.trim(),
          platforms: formData.platforms,
          server: formData.server,
          status: formData.status
        };

        result = await keywordService.updateKeyword(editingKeyword.id, updatePayload);
        if (result.success) {
          setSuccess('Cập nhật từ khóa thành công');
        } else {
          setError(result.error || 'Không thể cập nhật từ khóa');
        }
      } else {
        // Khi thêm mới: gửi keywords (array), platforms (array), và status
        let allKeywords = [...formData.keywords];
        if (formData.keyword.trim()) {
          allKeywords.push(formData.keyword.trim());
        }
        
        if (allKeywords.length === 0) {
          setError('Vui lòng nhập ít nhất một từ khóa');
          setLoading(false);
          return;
        }

        const createPayload = {
          keywords: allKeywords,
          platforms: formData.platforms,
          server: formData.server,
          status: formData.status
        };

        result = await keywordService.createKeyword(createPayload);
        if (result.success) {
          setSuccess('Thêm từ khóa thành công');
        } else {
          setError(result.error || 'Không thể thêm từ khóa');
        }
      }

      if (result.success) {
        setShowModal(false);
        fetchKeywords();
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };


  const toggleStatus = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const result = await keywordService.toggleStatus(id);
      
      if (result.success) {
        setSuccess('Thay đổi trạng thái thành công');
        fetchKeywords();
      } else {
        setError(result.error || 'Không thể thay đổi trạng thái');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi thay đổi trạng thái');
    } finally {
      setLoading(false);
    }
  };

  const togglePlatform = (platform) => {
    setFormData(prev => {
      const platforms = prev.platforms || [];
      if (platforms.includes(platform)) {
        return { ...prev, platforms: platforms.filter(p => p !== platform) };
      } else {
        return { ...prev, platforms: [...platforms, platform] };
      }
    });
  };

  const toggleServer = (server) => {
    setFormData(prev => {
      const servers = prev.server || [];
      if (servers.includes(server)) {
        return { ...prev, server: servers.filter(s => s !== server) };
      } else {
        return { ...prev, server: [...servers, server] };
      }
    });
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
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
            <h1 className="text-2xl font-bold text-gray-900">Quản lý từ khóa</h1>
            <p className="mt-2 text-sm text-gray-700">
              Quản lý danh sách từ khóa để BOT crawl dữ liệu
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
            <Button onClick={handleAdd} disabled={loading}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Thêm từ khóa
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                label="Tìm kiếm từ khóa"
                placeholder="Nhập từ khóa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                label="Server"
                value={serverFilter}
                onChange={(e) => setServerFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'Tất cả server' },
                  { value: 'server_test', label: 'Server Test' },
                  { value: 'server_live', label: 'Server Live' },
                  { value: 'server_cbs', label: 'Server CBS' }
                ]}
              />
            </div>
            
            <div>
              <Select
                label="Trạng thái"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'Tất cả trạng thái' },
                  { value: 'active', label: 'Đang hoạt động' },
                  { value: 'inactive', label: 'Ngừng hoạt động' }
                ]}
              />
            </div>
          </div>
        </Card>

        {/* Keywords Table */}
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
                        Server
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
                    {filteredKeywords.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p>Không tìm thấy từ khóa nào</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredKeywords.map((keyword, index) => (
                        <tr key={keyword.id} className="hover:bg-gray-50">
                          <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-900">
                            {pagination.currentPage * pagination.pageSize + index + 1}
                          </td>
                          <td className="px-3 py-3">
                            <div 
                              className="text-sm font-medium text-gray-900 max-w-[150px] sm:max-w-[200px] truncate" 
                              title={keyword.keyword}
                            >
                              {keyword.keyword}
                            </div>
                          </td>
                          <td className="px-3 py-3 hidden md:table-cell">
                            <div className="flex flex-wrap">
                              {keyword.platform && keyword.platform.length > 0 ? (
                                keyword.platform.map((platform, idx) => (
                                  <PlatformBadge key={idx} platform={platform} />
                                ))
                              ) : (
                                <span className="text-xs text-gray-400 italic">-</span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3 hidden lg:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {keyword.server && keyword.server.length > 0 ? (
                                keyword.server.map((srv, idx) => (
                                  <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                    {srv === 'server_test' && '🧪 Test'}
                                    {srv === 'server_live' && '🚀 Live'}
                                    {srv === 'server_cbs' && '📡 CBS'}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-gray-400 italic">-</span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <button
                              onClick={() => toggleStatus(keyword.id)}
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                keyword.status 
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                  : 'bg-red-100 text-red-800 hover:bg-red-200'
                              }`}
                            >
                              {keyword.status ? '✓ Hoạt động' : '✕ Ngừng'}
                            </button>
                          </td>
                          <td className="px-3 py-3 whitespace-nowrap text-right text-xs font-medium">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEdit(keyword)}
                                className="text-indigo-600 hover:text-indigo-900"
                                title="Sửa"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(keyword.id)}
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
            onClose={() => setShowModal(false)}
            title={editingKeyword ? 'Sửa từ khóa' : 'Thêm từ khóa mới'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                label="Từ khóa"
                type="text"
                value={formData.keyword}
                onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                onKeyDown={editingKeyword ? undefined : handleKeywordEnter}
                placeholder={editingKeyword ? "Nhập từ khóa..." : "Nhập từ khóa rồi nhấn Enter..."}
                required={editingKeyword}
            />

            {/* Hiển thị danh sách các từ khóa đã nhập - CHỈ khi thêm mới */}
            {!editingKeyword && formData.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.keywords.map((kw, idx) => (
                      <span
                          key={idx}
                          className="flex items-center bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-sm"
                      >
                {kw}
                        <button
                            type="button"
                            onClick={() => removeKeyword(kw)}
                            className="ml-2 text-red-500 hover:text-red-700"
                        >
                  ×
                </button>
              </span>
                  ))}
                </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nền tảng <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['facebook', 'youtube', 'tiktok', 'shopee', 'website'].map(platform => (
                    <label key={platform} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                      <input
                          type="checkbox"
                          checked={formData.platforms.includes(platform)}
                          onChange={() => togglePlatform(platform)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm capitalize">{platform}</span>
                    </label>
                ))}
              </div>
              {formData.platforms.length === 0 && (
                  <p className="mt-1 text-sm text-red-600">Vui lòng chọn ít nhất một nền tảng</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Server <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { value: 'server_test', label: 'Server Test' },
                  { value: 'server_live', label: 'Server Live' },
                  { value: 'server_cbs', label: 'Server CBS' }
                ].map(srv => (
                    <label key={srv.value} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                      <input
                          type="checkbox"
                          checked={formData.server.includes(srv.value)}
                          onChange={() => toggleServer(srv.value)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm">{srv.label}</span>
                    </label>
                ))}
              </div>
              {formData.server.length === 0 && (
                  <p className="mt-1 text-sm text-red-600">Vui lòng chọn ít nhất một server</p>
              )}
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    checked={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">Kích hoạt ngay</span>
              </label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                Hủy
              </Button>
              <Button
                  type="submit"
                  disabled={
                    loading || 
                    formData.platforms.length === 0 || 
                    formData.server.length === 0 ||
                    (editingKeyword 
                      ? !formData.keyword.trim() 
                      : (!formData.keyword.trim() && formData.keywords.length === 0)
                    )
                  }
              >
                {loading ? 'Đang xử lý...' : (editingKeyword ? 'Cập nhật' : 'Thêm mới')}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeletingKeywordId(null);
          }}
          onConfirm={confirmDelete}
          title="Xác nhận xóa từ khóa"
          message="Bạn có chắc chắn muốn xóa từ khóa này? Hành động này không thể hoàn tác."
          confirmText="Xóa"
          cancelText="Hủy"
          variant="danger"
        />
      </div>
    </MainLayout>
  );
};

export default KeywordsPage;
