import React, { useEffect, useState } from 'react';
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
  duration = 4000,
  type = 'info',
}) => {
  const [internalVisible, setInternalVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      // Pequeno delay para evitar que o onDismiss seja chamado imediatamente
      const timer = setTimeout(() => {
        setInternalVisible(true);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setInternalVisible(false);
    }
  }, [visible]);

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

  const handleDismiss = () => {
    setInternalVisible(false);
    setTimeout(onDismiss, 100);
  };

  return (
    <Snackbar
      visible={internalVisible}
      onDismiss={handleDismiss}
      duration={duration}
      style={{ backgroundColor: getBackgroundColor() }}
      action={{
        label: '×',
        onPress: handleDismiss,
        textColor: '#fff',
      }}
    >
      {message}
    </Snackbar>
  );
};

export default SnackbarNotification;
