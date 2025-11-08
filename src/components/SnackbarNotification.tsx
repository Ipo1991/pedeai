import React from 'react';
import { Snackbar } from 'react-native-paper';

interface SnackbarNotificationProps {
  visible: boolean;
  message: string;
  onDismiss: () => void;
  duration?: number;
  type?: 'success' | 'error' | 'warning' | 'info';
}

const SnackbarNotification: React.FC<SnackbarNotificationProps> = ({
  visible,
  message,
  onDismiss,
  duration = 3000,
  type = 'info',
}) => {
  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#4caf50';
      case 'error':
        return '#f44336';
      case 'warning':
        return '#ff9800';
      default:
        return '#333';
    }
  };

  return (
    <Snackbar
      visible={visible}
      onDismiss={onDismiss}
      duration={duration}
      style={{ backgroundColor: getBackgroundColor() }}
      action={{
        label: '×',
        onPress: onDismiss,
        textColor: '#fff',
      }}
    >
      {message}
    </Snackbar>
  );
};

export default SnackbarNotification;
