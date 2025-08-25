import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { logStoreState } from './index';

// Initial state
const initialState = {
  // View states
  currentView: 'dashboard', // 'dashboard' | 'campaign-detail'
  previousView: null,
  
  // Modal states
  showAddNote: false,
  showAddMedia: false,
  showVendorDropdown: false,
  showDeleteConfirm: false,
  showCampaignForm: false,
  
  // Global UI states
  sidebarCollapsed: false,
  theme: 'light', // 'light' | 'dark'
  windowWidth: typeof window !== 'undefined' ? window.innerWidth : 1200,
  isMobile: false,
  
  // Loading states
  globalLoading: false,
  
  // Notification system
  notifications: [],
  nextNotificationId: 1,
  
  // Form states
  isFormDirty: false,
  unsavedChanges: false,
  
  // Confirmation dialogs
  confirmDialog: {
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    onCancel: null,
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'default' // 'default' | 'danger' | 'warning'
  },
  
  // Keyboard shortcuts
  keyboardShortcutsEnabled: true,
  
  // Performance monitoring
  renderTimes: []
};

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// View types
export const VIEW_TYPES = {
  DASHBOARD: 'dashboard',
  CAMPAIGN_DETAIL: 'campaign-detail'
};

// Create UI store with persistence for preferences
export const useUIStore = create(
  persist(
    devtools(
      (set, get) => ({
        ...initialState,
        
        // View navigation
        setCurrentView: (view) => {
          const { currentView } = get();
          set({
            previousView: currentView,
            currentView: view
          }, false, 'SET_CURRENT_VIEW');
        },
        
        goToPreviousView: () => {
          const { previousView, currentView } = get();
          if (previousView) {
            set({
              currentView: previousView,
              previousView: currentView
            }, false, 'GO_TO_PREVIOUS_VIEW');
          }
        },
        
        goToDashboard: () => {
          get().setCurrentView(VIEW_TYPES.DASHBOARD);
        },
        
        goToCampaignDetail: () => {
          get().setCurrentView(VIEW_TYPES.CAMPAIGN_DETAIL);
        },
        
        // Modal management
        toggleModal: (modalName) => {
          const currentState = get()[modalName];
          set({ [modalName]: !currentState }, false, `TOGGLE_${modalName.toUpperCase()}`);
        },
        
        openModal: (modalName) => {
          set({ [modalName]: true }, false, `OPEN_${modalName.toUpperCase()}`);
        },
        
        closeModal: (modalName) => {
          set({ [modalName]: false }, false, `CLOSE_${modalName.toUpperCase()}`);
        },
        
        closeAllModals: () => {
          set({
            showAddNote: false,
            showAddMedia: false,
            showVendorDropdown: false,
            showDeleteConfirm: false,
            showCampaignForm: false
          }, false, 'CLOSE_ALL_MODALS');
        },
        
        // Theme management
        setTheme: (theme) => {
          set({ theme }, false, 'SET_THEME');
          
          // Apply theme to document
          if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', theme);
          }
        },
        
        toggleTheme: () => {
          const { theme } = get();
          const newTheme = theme === 'light' ? 'dark' : 'light';
          get().setTheme(newTheme);
        },
        
        // Sidebar management
        toggleSidebar: () => {
          const { sidebarCollapsed } = get();
          set({ sidebarCollapsed: !sidebarCollapsed }, false, 'TOGGLE_SIDEBAR');
        },
        
        setSidebarCollapsed: (collapsed) => {
          set({ sidebarCollapsed: collapsed }, false, 'SET_SIDEBAR_COLLAPSED');
        },
        
        // Window management
        setWindowWidth: (width) => {
          const isMobile = width < 768;
          set({ 
            windowWidth: width, 
            isMobile,
            // Auto-collapse sidebar on mobile
            sidebarCollapsed: isMobile ? true : get().sidebarCollapsed
          }, false, 'SET_WINDOW_WIDTH');
        },
        
        // Global loading
        setGlobalLoading: (loading) => {
          set({ globalLoading: loading }, false, 'SET_GLOBAL_LOADING');
        },
        
        // Notification system
        addNotification: (message, type = NOTIFICATION_TYPES.INFO, options = {}) => {
          const { notifications, nextNotificationId } = get();
          
          const notification = {
            id: nextNotificationId,
            message,
            type,
            timestamp: new Date().toISOString(),
            autoRemove: options.autoRemove !== false,
            duration: options.duration || 5000,
            actions: options.actions || [],
            ...options
          };
          
          const updatedNotifications = [...notifications, notification];
          
          set({
            notifications: updatedNotifications,
            nextNotificationId: nextNotificationId + 1
          }, false, 'ADD_NOTIFICATION');
          
          // Auto-remove notification if specified
          if (notification.autoRemove) {
            setTimeout(() => {
              get().removeNotification(notification.id);
            }, notification.duration);
          }
          
          return notification.id;
        },
        
        removeNotification: (id) => {
          const { notifications } = get();
          const updatedNotifications = notifications.filter(n => n.id !== id);
          set({ notifications: updatedNotifications }, false, 'REMOVE_NOTIFICATION');
        },
        
        clearAllNotifications: () => {
          set({ notifications: [] }, false, 'CLEAR_ALL_NOTIFICATIONS');
        },
        
        // Success/Error notification helpers
        showSuccess: (message, options = {}) => {
          return get().addNotification(message, NOTIFICATION_TYPES.SUCCESS, options);
        },
        
        showError: (message, options = {}) => {
          return get().addNotification(message, NOTIFICATION_TYPES.ERROR, {
            autoRemove: false,
            ...options
          });
        },
        
        showWarning: (message, options = {}) => {
          return get().addNotification(message, NOTIFICATION_TYPES.WARNING, options);
        },
        
        showInfo: (message, options = {}) => {
          return get().addNotification(message, NOTIFICATION_TYPES.INFO, options);
        },
        
        // Form state management
        setFormDirty: (dirty) => {
          set({ isFormDirty: dirty }, false, 'SET_FORM_DIRTY');
        },
        
        setUnsavedChanges: (hasChanges) => {
          set({ unsavedChanges: hasChanges }, false, 'SET_UNSAVED_CHANGES');
        },
        
        // Confirmation dialog
        showConfirmDialog: (options) => {
          const {
            title,
            message,
            onConfirm,
            onCancel,
            confirmText = 'Confirm',
            cancelText = 'Cancel',
            type = 'default'
          } = options;
          
          set({
            confirmDialog: {
              isOpen: true,
              title,
              message,
              onConfirm,
              onCancel,
              confirmText,
              cancelText,
              type
            }
          }, false, 'SHOW_CONFIRM_DIALOG');
        },
        
        hideConfirmDialog: () => {
          set({
            confirmDialog: {
              ...get().confirmDialog,
              isOpen: false
            }
          }, false, 'HIDE_CONFIRM_DIALOG');
        },
        
        confirmDialogAction: (confirmed) => {
          const { confirmDialog } = get();
          
          if (confirmed && confirmDialog.onConfirm) {
            confirmDialog.onConfirm();
          } else if (!confirmed && confirmDialog.onCancel) {
            confirmDialog.onCancel();
          }
          
          get().hideConfirmDialog();
        },
        
        // Keyboard shortcuts
        setKeyboardShortcutsEnabled: (enabled) => {
          set({ keyboardShortcutsEnabled: enabled }, false, 'SET_KEYBOARD_SHORTCUTS');
        },
        
        // Performance monitoring
        recordRenderTime: (componentName, duration) => {
          const { renderTimes } = get();
          const maxRecords = 100; // Keep only last 100 records
          
          const newRecord = {
            component: componentName,
            duration,
            timestamp: Date.now()
          };
          
          const updatedRenderTimes = [...renderTimes, newRecord].slice(-maxRecords);
          
          set({ renderTimes: updatedRenderTimes }, false, 'RECORD_RENDER_TIME');
        },
        
        getRenderStats: () => {
          const { renderTimes } = get();
          const stats = {};
          
          renderTimes.forEach(record => {
            if (!stats[record.component]) {
              stats[record.component] = {
                count: 0,
                totalTime: 0,
                avgTime: 0,
                maxTime: 0,
                minTime: Infinity
              };
            }
            
            const stat = stats[record.component];
            stat.count++;
            stat.totalTime += record.duration;
            stat.maxTime = Math.max(stat.maxTime, record.duration);
            stat.minTime = Math.min(stat.minTime, record.duration);
            stat.avgTime = stat.totalTime / stat.count;
          });
          
          return stats;
        },
        
        // Reset actions
        resetUI: () => {
          set({
            ...initialState,
            // Preserve some user preferences
            theme: get().theme,
            sidebarCollapsed: get().sidebarCollapsed,
            keyboardShortcutsEnabled: get().keyboardShortcutsEnabled
          }, false, 'RESET_UI');
        },
        
        resetNotifications: () => {
          set({ 
            notifications: [],
            nextNotificationId: 1
          }, false, 'RESET_NOTIFICATIONS');
        },
        
        // Development helpers
        _debugState: () => {
          const state = get();
          logStoreState('UI', state);
          return state;
        },
        
        _simulateError: () => {
          get().showError('This is a test error notification', {
            actions: [
              {
                label: 'Retry',
                action: () => console.log('Retry clicked')
              }
            ]
          });
        }
      }),
      { 
        name: 'ui-store',
        serialize: true 
      }
    ),
    {
      name: 'marketing-dashboard-ui',
      // Only persist user preferences, not transient UI state
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        keyboardShortcutsEnabled: state.keyboardShortcutsEnabled
      })
    }
  )
);

// Initialize window width listener
if (typeof window !== 'undefined') {
  const updateWindowWidth = () => {
    useUIStore.getState().setWindowWidth(window.innerWidth);
  };
  
  window.addEventListener('resize', updateWindowWidth);
  
  // Initial call
  updateWindowWidth();
}

export default useUIStore;