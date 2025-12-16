import apiService from '../api/index.js';
import { API_ENDPOINTS } from '../api/config.js';

export const authService = {
  login: async (credentials) => {
    const result = await apiService.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    
    if (result.success && result.data.token) {
      localStorage.setItem('token', result.data.token);
      
      // Lưu refresh token nếu có
      if (result.data.refreshToken) {
        localStorage.setItem('refreshToken', result.data.refreshToken);
      }
      
      const user = {
        username: result.data.username,
        email: result.data.email,
      };
      localStorage.setItem('user', JSON.stringify(user));
    }
    
    return result;
  },

  register: async (userData) => {
    const result = await apiService.post(API_ENDPOINTS.AUTH.REGISTER, userData);
    
    if (result.success && result.data.token) {
      localStorage.setItem('token', result.data.token);
      
      // Lưu refresh token nếu có
      if (result.data.refreshToken) {
        localStorage.setItem('refreshToken', result.data.refreshToken);
      }
      
      localStorage.setItem('user', JSON.stringify(result.data.user));
    }
    
    return result;
  },

  logout: async () => {
    const result = await apiService.post(API_ENDPOINTS.AUTH.LOGOUT);
    
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    return result;
  },

  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        return { success: false, error: 'No refresh token available' };
      }
      
      const result = await apiService.post(API_ENDPOINTS.AUTH.REFRESH, {
        refreshToken: refreshToken
      });
      
      if (result.success && result.data.token) {
        localStorage.setItem('token', result.data.token);
        
        // Cập nhật refresh token mới nếu có
        if (result.data.refreshToken) {
          localStorage.setItem('refreshToken', result.data.refreshToken);
        }
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to refresh token'
      };
    }
  },

  getProfile: async () => {
    return await apiService.get(API_ENDPOINTS.AUTH.PROFILE);
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

export const userService = {
  getUsers: async (params = {}) => {
    return await apiService.get(API_ENDPOINTS.USERS.LIST, { params });
  },

  getUser: async (id) => {
    return await apiService.get(API_ENDPOINTS.USERS.GET(id));
  },

  createUser: async (userData) => {
    return await apiService.post(API_ENDPOINTS.USERS.CREATE, userData);
  },

  updateUser: async (id, userData) => {
    return await apiService.put(API_ENDPOINTS.USERS.UPDATE(id), userData);
  },

  deleteUser: async (id) => {
    return await apiService.delete(API_ENDPOINTS.USERS.DELETE(id));
  },
};

export const postService = {
  getPosts: async (params = {}) => {
    return await apiService.get(API_ENDPOINTS.POSTS.LIST, { params });
  },

  getPost: async (id) => {
    return await apiService.get(API_ENDPOINTS.POSTS.GET(id));
  },

  createPost: async (postData) => {
    return await apiService.post(API_ENDPOINTS.POSTS.CREATE, postData);
  },

  updatePost: async (id, postData) => {
    return await apiService.put(API_ENDPOINTS.POSTS.UPDATE(id), postData);
  },

  deletePost: async (id) => {
    return await apiService.delete(API_ENDPOINTS.POSTS.DELETE(id));
  },
};

export const keywordService = {
  getKeywords: async (page = 0, size = 10, filterRequest = {}) => {
    const params = { page, size };
    
    // Request body theo format KeywordFilterRequest
    const requestBody = {
      platform: filterRequest.platform || null,
      status: filterRequest.status !== undefined ? filterRequest.status : null,
      server: filterRequest.server || null
    };
    
    return await apiService.post(API_ENDPOINTS.KEYWORDS.FILTER, requestBody, { params });
  },

  createKeyword: async (keywordData) => {
    // Backend expects: keywords (array), platforms (array), server (array), status (boolean)
    const requestData = {
      keywords: keywordData.keywords, // Array of keyword strings
      platforms: keywordData.platforms, // Array of platform strings
      server: keywordData.server || [], // Array of server strings
      status: keywordData.status !== undefined ? keywordData.status : true
    };
    return await apiService.post(API_ENDPOINTS.KEYWORDS.CREATE, requestData);
  },

  updateKeyword: async (keywordId, keywordData) => {
    // Backend expects: newKeyword (string), platforms (array), server (array), status (boolean)
    const requestData = {
      newKeyword: keywordData.newKeyword || keywordData.keyword,
      platforms: keywordData.platforms, // Array of platform strings
      server: keywordData.server || [], // Array of server strings
      status: keywordData.status
    };
    return await apiService.post(API_ENDPOINTS.KEYWORDS.UPDATE(keywordId), requestData);
  },

  deleteKeyword: async (keywordId) => {
    return await apiService.post(API_ENDPOINTS.KEYWORDS.DELETE(keywordId));
  },

  toggleStatus: async (keywordId) => {
    return await apiService.post(API_ENDPOINTS.KEYWORDS.TOGGLE_STATUS(keywordId));
  },
};

export const scheduleService = {
  getSchedules: async (page = 0, size = 10, status = null) => {
    const params = { page, size };
    const requestBody = {
      status: status // Boolean: true, false, or null for all
    };
    return await apiService.post(API_ENDPOINTS.SCHEDULE.FILTER, requestBody, { params });
  },

  createSchedule: async (scheduleData) => {
    const requestData = {
      scheduleName: scheduleData.schedule_name,
      startTime: scheduleData.start_date, // yyyy-MM-dd format
      botType: scheduleData.bot_type || 'CRON', // CRON or INTERVAL
      cron: scheduleData.cron, // Backend maps this to 'cronExpr' via @JsonProperty
      interval_seconds: scheduleData.interval_seconds || null,
      status: scheduleData.status !== undefined ? scheduleData.status : true
    };
    return await apiService.post(API_ENDPOINTS.SCHEDULE.CREATE, requestData);
  },

  updateSchedule: async (scheduleId, scheduleData) => {
    const requestData = {
      scheduleName: scheduleData.schedule_name,
      startTime: scheduleData.start_date, // yyyy-MM-dd format
      botType: scheduleData.bot_type || 'CRON',
      cron: scheduleData.cron, // Backend maps this to 'cronExpr' via @JsonProperty
      interval_seconds: scheduleData.interval_seconds || null,
      status: scheduleData.status !== undefined ? scheduleData.status : true
    };
    return await apiService.post(API_ENDPOINTS.SCHEDULE.UPDATE(scheduleId), requestData);
  },

  deleteSchedule: async (scheduleId) => {
    return await apiService.post(API_ENDPOINTS.SCHEDULE.DELETE(scheduleId));
  },

  scheduleKeywords: async (scheduleData) => {
    try {
      const response = await fetch(API_ENDPOINTS.TASK.CREATED_HANDLE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Không thể gửi lịch chạy từ khóa',
      };
    }
  },
};

export const taskService = {
  getTasks: async (page = 0, size = 10, filterData = {}) => {
    const params = { page, size };
    
    // Chỉ gửi các field có giá trị, không gửi null
    const requestBody = {};
    
    if (filterData.keyword) {
      requestBody.keyword = filterData.keyword;
    }
    
    if (filterData.scheduleStatus !== undefined && filterData.scheduleStatus !== null) {
      requestBody.scheduleStatus = filterData.scheduleStatus;
    }
    
    if (filterData.taskStatus) {
      requestBody.taskStatus = filterData.taskStatus;
    }
    
    if (filterData.platform) {
      requestBody.platform = filterData.platform;
    }
    
    return await apiService.post(API_ENDPOINTS.TASK.FILTER, requestBody, { params });
  },

  createTask: async (taskData) => {
    const requestData = {
      scheduleId: taskData.scheduleId,
      keywordName: taskData.keywordName, // Array of keyword names
      status: taskData.status || 'PENDING' // TaskStatus enum value
    };
    return await apiService.post(API_ENDPOINTS.TASK.CREATE, requestData);
  },
  createHandleTask: async (scheduleData) => {
    // Backend expects List<String> directly, not an object with keywords field
    const keywordsList = (scheduleData.keywords || []).map(k =>
        typeof k === 'string' ? k : k.name || k.keyword
    );

    return await apiService.post(API_ENDPOINTS.TASK.SEND_DATA_KEYWORD, keywordsList);
  },
  createHandleSource: async (sourceData) => {
    return await apiService.post(API_ENDPOINTS.TASK.SEND_DATA_SOURCE,  sourceData.sources);
  },


  updateTask: async (taskId, taskData) => {
    const requestData = {
      scheduleId: taskData.scheduleId,
      keywordName: taskData.keywordName, // Array of keyword names
      status: taskData.status
    };
    return await apiService.post(API_ENDPOINTS.TASK.UPDATE(taskId), requestData);
  },

  deleteTask: async (taskId) => {
    return await apiService.post(API_ENDPOINTS.TASK.DELETE(taskId));
  },
};

export const sourceService = {
  getSources: async (page = 0, size = 10, filterRequest = {}) => {
    const params = { page, size };
    
    // Request body theo format SourceFilterRequest
    const requestBody = {
      platform: filterRequest.platform || null,
      status: filterRequest.status !== undefined ? filterRequest.status : null
    };
    
    return await apiService.post(API_ENDPOINTS.SOURCE.FILTER, requestBody, { params });
  },

  createSource: async (sourceData) => {
    // Backend expects: sourceUrl (array), orgId, platforms (array), companyName, sourceType, status
    const requestData = {
      sourceUrl: sourceData.sourceUrl, // Array of URL strings
      orgId: sourceData.orgId || null,
      platforms: sourceData.platforms, // Array of platform strings
      companyName: sourceData.companyName || '',
      sourceType: sourceData.sourceType || 'WEBSITE', // WEBSITE, SOCIAL_MEDIA, etc.
      status: sourceData.status !== undefined ? sourceData.status : true
    };
    return await apiService.post(API_ENDPOINTS.SOURCE.CREATE, requestData);
  },

  updateSource: async (sourceId, sourceData) => {
    const requestData = {
      newSource: sourceData.sourceUrl,
      platforms: sourceData.platforms,
      status: sourceData.status,
    };
    return await apiService.post(API_ENDPOINTS.SOURCE.UPDATE(sourceId), requestData);
  },

  deleteSource: async (sourceId) => {
    return await apiService.post(API_ENDPOINTS.SOURCE.DELETE(sourceId));
  },

  toggleStatus: async (sourceId) => {
    return await apiService.post(API_ENDPOINTS.SOURCE.TOGGLE_STATUS(sourceId));
  },
};