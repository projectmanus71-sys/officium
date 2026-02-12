
// Service to handle system notifications and permissions
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.error('Este navegador não suporta notificações.');
    return false;
  }

  if (Notification.permission === 'granted') return true;

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const sendNotification = async (title: string, options?: NotificationOptions) => {
  if (Notification.permission !== 'granted') return;

  // Use 'any' to bypass TS errors as 'vibrate' is not part of the standard DOM NotificationOptions 
  // definition, but is used in ServiceWorker showNotification.
  const defaultOptions: any = {
    icon: 'data:image/svg+xml,%3Csvg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M50 15C30.67 15 15 30.67 15 50C15 69.33 30.67 85 50 85C69.33 85 85 69.33 85 50C85 30.67 69.33 15 50 15Z" fill="%236366f1" /%3E%3C/svg%3E',
    badge: 'data:image/svg+xml,%3Csvg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M50 15C30.67 15 15 30.67 15 50C15 69.33 30.67 85 50 85C69.33 85 85 69.33 85 50C85 30.67 69.33 15 50 15Z" fill="%236366f1" /%3E%3C/svg%3E',
    vibrate: [200, 100, 200],
    ...options
  };

  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    registration.showNotification(title, defaultOptions);
  } else {
    new Notification(title, defaultOptions);
  }
};
