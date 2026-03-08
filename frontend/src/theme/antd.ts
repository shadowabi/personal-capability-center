import { ConfigProvider, theme as antdTheme } from 'antd';
import zhCN from 'antd/locale/zh_CN';

const { defaultAlgorithm } = antdTheme;

export const theme = {
  algorithm: defaultAlgorithm,
  token: {
    colorPrimary: '#f59e0b', // amber-500
    colorSuccess: '#f97316', // orange-500
    colorWarning: '#ef4444', // red-500
    colorInfo: '#3b82f6', // blue-500
    colorBgContainer: 'rgba(255, 255, 255, 0.7)',
    colorBgElevated: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    borderRadiusLG: 16,
    borderRadiusXL: 24,
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
    fontSize: 14,
    fontSizeLG: 16,
  },
  components: {
    Layout: {
      headerBg: 'rgba(255, 255, 255, 0.8)',
      siderBg: 'rgba(255, 255, 255, 0.9)',
    },
    Menu: {
      itemBorderRadius: 8,
      itemBg: 'transparent',
      itemSelectedBg: 'rgba(245, 158, 11, 0.1)',
      itemSelectedColor: '#d97706',
      itemHoverBg: 'rgba(245, 158, 11, 0.05)',
    },
    Card: {
      colorBgContainer: 'rgba(255, 255, 255, 0.7)',
      borderRadiusLG: 16,
    },
    Button: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Input: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Typography: {
      headingMarginBottom: 0,
    },
  },
};

export const antdConfig = {
  locale: zhCN,
  theme,
};
