import React, { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Select from "../components/ui/Select.jsx";
import Modal from "../components/ui/Modal.jsx";
import ConfirmModal from "../components/ui/ConfirmModal.jsx";
import Card from "../components/ui/Card.jsx";
import Loading from "../components/ui/Loading.jsx";
import Alert from "../components/ui/Alert.jsx";
import { sourceService } from "../services/index.js";

const formatVietnameseDate = (date) => {
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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
const URLsPage = () => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUrlId, setDeletingUrlId] = useState(null);
  const [editingUrl, setEditingUrl] = useState(null);
  const [formData, setFormData] = useState({
    companyName: "",
    sourceUrl: "",
    platforms: ["website"],
    status: true,
  });
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 10,
  });

  // Fetch danh sách
  const fetchUrls = async () => {
    try {
      setLoading(true);
      const filterRequest = {};
      if (platformFilter !== "all") filterRequest.platform = platformFilter;
      if (statusFilter === "active") filterRequest.status = true;
      else if (statusFilter === "inactive") filterRequest.status = false;

      const result = await sourceService.getSources(
          pagination.currentPage,
          pagination.pageSize,
          filterRequest
      );

      if (result.success && result.data) {
        setUrls(result.data.content || []);
        setPagination((prev) => ({
          ...prev,
          totalPages: result.data.totalPages || 0,
          totalElements: result.data.totalElements || 0,
        }));
      } else {
        setError(result.error || "Không thể tải danh sách URL");
      }
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, [pagination.currentPage, platformFilter, statusFilter]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, currentPage: 0 }));
  }, [platformFilter, statusFilter]);

  // Alert timeout
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // CRUD
  const handleAdd = () => {
    setEditingUrl(null);
    setFormData({
      companyName: "",
      sourceUrl: "",
      platforms: ["website"],
      status: true,
    });
    setShowModal(true);
  };

  const handleEdit = (url) => {
    setEditingUrl(url);
    setFormData({
      companyName: url.companyName || "",
      sourceUrl: url.sourceUrl?.[0] || "",
      platforms: url.platform || ["website"],
      status: url.status,
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setDeletingUrlId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      const result = await sourceService.deleteSource(deletingUrlId);
      if (result.success) {
        setSuccess("Xóa URL thành công");
        fetchUrls();
      } else {
        setError(result.error || "Không thể xóa URL");
      }
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi xóa URL");
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setDeletingUrlId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payloadCreate = {
        sourceUrl: [formData.sourceUrl],
        platforms: formData.platforms,
        orgId: 2,
        companyName: formData.companyName,
        sourceType: "PAGE",
        status: formData.status,
      };
      const payloadUpdate = {
        sourceUrl: formData.sourceUrl,
        platforms: formData.platforms,
        companyName: formData.companyName,
        sourceType: "PAGE",
        status: formData.status,
      };

      const result = editingUrl
          ? await sourceService.updateSource(editingUrl.id, payloadUpdate)
          : await sourceService.createSource(payloadCreate);

      if (result.success) {
        setSuccess(editingUrl ? "Cập nhật thành công" : "Thêm mới thành công");
        setShowModal(false);
        fetchUrls();
      } else {
        setError(result.error || "Không thể lưu URL");
      }
    } catch (err) {
      setError(err.message || "Lỗi khi lưu dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id) => {
    try {
      setLoading(true);
      const result = await sourceService.toggleStatus(id);
      if (result.success) {
        setSuccess("Thay đổi trạng thái thành công");
        fetchUrls();
      } else {
        setError(result.error || "Không thể thay đổi trạng thái");
      }
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi thay đổi trạng thái");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const togglePlatform = (platform) => {
    setFormData((prev) => {
      const exists = prev.platforms.includes(platform);
      return {
        ...prev,
        platforms: exists
            ? prev.platforms.filter((p) => p !== platform)
            : [...prev.platforms, platform],
      };
    });
  };

  const filteredUrls = urls.filter((u) =>
      u.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
      <MainLayout>
        <div className="space-y-6">
          {error && <Alert variant="error">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          {/* Header */}
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Quản lý URL</h1>
              <p className="mt-2 text-sm text-gray-700">
                Quản lý danh sách URL để BOT crawl dữ liệu
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
              <Button onClick={handleAdd} disabled={loading}>
                <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                  <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                  />
                </svg>
                Thêm URL
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                  label="Tìm kiếm tên công ty"
                  placeholder="Nhập tên công ty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={
                    <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                      <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  }
              />
              <Select
                  label="Nền tảng"
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                  options={[
                    { value: "all", label: "Tất cả" },
                    { value: "website", label: "Website" },
                    { value: "facebook", label: "Facebook" },
                    { value: "youtube", label: "YouTube" },
                    { value: "tiktok", label: "Tiktok" },
                    { value: "shopee", label: "Shopee" },
                  ]}
              />
              <Select
                  label="Trạng thái"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: "all", label: "Tất cả" },
                    { value: "active", label: "Hoạt động" },
                    { value: "inactive", label: "Ngừng" },
                  ]}
              />
            </div>
          </Card>

          {/* Table */}
          <Card>
            {loading ? (
                <div className="text-center py-12">
                  <Loading />
                </div>
            ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        STT
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Tên công ty
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        URL
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Nền tảng
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Trạng thái
                      </th>
                      <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Thao tác
                      </th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUrls.length === 0 ? (
                        <tr>
                          <td
                              colSpan="6"
                              className="px-6 py-8 text-center text-gray-500"
                          >
                            Không có dữ liệu
                          </td>
                        </tr>
                    ) : (
                        filteredUrls.map((url, i) => (
                            <tr key={url.id} className="hover:bg-gray-50">
                              <td className="px-3 py-3 text-sm text-gray-500">
                                {pagination.currentPage * pagination.pageSize + i + 1}
                              </td>
                              <td className="px-3 py-3 text-sm font-medium text-gray-900">
                                {url.companyName}
                              </td>
                              <td className="px-3 py-3 text-sm text-blue-600 truncate max-w-[180px]">
                                <a
                                    href={url.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                  {url.sourceUrl}
                                </a>
                              </td>
                              <td className="px-3 py-3 text-sm text-gray-700">
                                {url.platform && url.platform.length > 0 ? (
                                    url.platform.map((platform, idx) => (
                                        <PlatformBadge key={idx} platform={platform} />
                                    ))
                                ) : (
                                    <span className="text-xs text-gray-400 italic">-</span>
                                )}
                              </td>
                              <td className="px-3 py-3">
                                <button
                                    onClick={() => toggleStatus(url.id)}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                        url.status
                                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                                            : "bg-red-100 text-red-800 hover:bg-red-200"
                                    }`}
                                >
                                  {url.status ? (
                                      <>
                                        <svg
                                            className="w-3 h-3"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                          <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={3}
                                              d="M5 13l4 4L19 7"
                                          />
                                        </svg>
                                        Hoạt động
                                      </>
                                  ) : (
                                      <>
                                        <svg
                                            className="w-3 h-3"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                          <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={3}
                                              d="M6 18L18 6M6 6l12 12"
                                          />
                                        </svg>
                                        Ngừng
                                      </>
                                  )}
                                </button>
                              </td>
                              <td className="px-3 py-3 text-right whitespace-nowrap">
                                <div className="flex justify-end gap-2">
                                  <button
                                      onClick={() => handleEdit(url)}
                                      className="text-indigo-600 hover:text-indigo-900"
                                      title="Sửa"
                                  >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                      <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                      />
                                    </svg>
                                  </button>
                                  <button
                                      onClick={() => handleDelete(url.id)}
                                      className="text-red-600 hover:text-red-900"
                                      title="Xóa"
                                  >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                      <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                        <p className="text-sm text-gray-700">
                          Trang {pagination.currentPage + 1} / {pagination.totalPages}
                        </p>
                        <div className="space-x-2">
                          <Button
                              variant="secondary"
                              disabled={pagination.currentPage === 0}
                              onClick={() =>
                                  handlePageChange(pagination.currentPage - 1)
                              }
                          >
                            Trước
                          </Button>
                          <Button
                              variant="secondary"
                              disabled={
                                  pagination.currentPage >= pagination.totalPages - 1
                              }
                              onClick={() =>
                                  handlePageChange(pagination.currentPage + 1)
                              }
                          >
                            Sau
                          </Button>
                        </div>
                      </div>
                  )}
                </div>
            )}
          </Card>

          {/* Modal Add/Edit */}
          <Modal
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              title={editingUrl ? "Sửa URL" : "Thêm URL mới"}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                  label="Tên công ty"
                  value={formData.companyName}
                  onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                  }
                  required
              />
              <Input
                  label="URL"
                  value={formData.sourceUrl}
                  onChange={(e) =>
                      setFormData({ ...formData, sourceUrl: e.target.value })
                  }
                  required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nền tảng
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["website", "facebook", "youtube", "tiktok", "shopee"].map(
                      (p) => (
                          <label
                              key={p}
                              className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                                type="checkbox"
                                checked={formData.platforms.includes(p)}
                                onChange={() => togglePlatform(p)}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm capitalize">{p}</span>
                          </label>
                      )
                  )}
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                      type="checkbox"
                      checked={formData.status}
                      onChange={(e) =>
                          setFormData({ ...formData, status: e.target.checked })
                      }
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                  Kích hoạt ngay
                </span>
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowModal(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading
                      ? "Đang xử lý..."
                      : editingUrl
                          ? "Cập nhật"
                          : "Thêm mới"}
                </Button>
              </div>
            </form>
          </Modal>

          {/* Confirm Delete */}
          <ConfirmModal
              isOpen={showDeleteModal}
              onClose={() => setShowDeleteModal(false)}
              onConfirm={confirmDelete}
              title="Xác nhận xóa URL"
              message="Bạn có chắc chắn muốn xóa URL này? Hành động này không thể hoàn tác."
              confirmText="Xóa"
              cancelText="Hủy"
              variant="danger"
          />
        </div>
      </MainLayout>
  );
};

export default URLsPage;
