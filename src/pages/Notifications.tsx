import {
  IonButton,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonText,
  useIonToast,
  useIonViewWillEnter,
} from '@ionic/react';
import { checkmarkCircleOutline, notificationsOutline, trashOutline } from 'ionicons/icons';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AppHeader from '../components/AppHeader';
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews';
import { firstError } from '../services/api';
import { listNotifications, markRead, removeNotification, unreadCount } from '../services/notificationService';
import type { AppNotification } from '../services/types';

function mobileTarget(notification: AppNotification): string | null {
  const route = notification.target_route ?? '';
  if (route.includes('loyalty') || route.includes('reward')) {
    return '/rewards';
  }
  if (route.includes('order')) {
    return notification.target_id ? `/orders/${notification.target_id}` : '/orders';
  }
  if (route.includes('favorite')) {
    return '/favorites';
  }
  return null;
}

export default function Notifications(): React.JSX.Element {
  const navigate = useNavigate();
  const [presentToast] = useIonToast();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, count] = await Promise.all([listNotifications(), unreadCount()]);
      setNotifications(list.notifications);
      setUnread(count);
    } catch (loadError) {
      setError(firstError(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useIonViewWillEnter(() => {
    void load();
  });

  async function open(notification: AppNotification) {
    if (notification.read_at === null) {
      setBusyId(notification.id);
      try {
        const updated = await markRead(notification.id);
        setNotifications((rows) => rows.map((row) => (row.id === updated.id ? updated : row)));
        setUnread((count) => Math.max(0, count - 1));
      } catch (readError) {
        await presentToast({ message: firstError(readError), duration: 2500, color: 'danger' });
        setBusyId(null);
        return;
      }
      setBusyId(null);
    }
    const target = mobileTarget(notification);
    if (target) {
      navigate(target);
    }
  }

  async function remove(notification: AppNotification) {
    setBusyId(notification.id);
    try {
      await removeNotification(notification.id);
      await load();
    } catch (removeError) {
      await presentToast({ message: firstError(removeError), duration: 2500, color: 'danger' });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <IonPage>
      <AppHeader title="Notifications" />
      <IonContent className="ion-padding">
        <div className="cafebara-intro">
          <IonText>
            <h1>Inbox</h1>
            <p>
              {unread} unread {unread === 1 ? 'notification' : 'notifications'}.
            </p>
          </IonText>
        </div>
        <IonRefresher slot="fixed" onIonRefresh={(event) => void load().finally(() => event.detail.complete())}>
          <IonRefresherContent />
        </IonRefresher>
        {loading ? (
          <LoadingState label="Loading notifications…" />
        ) : error ? (
          <ErrorState message={error} onRetry={() => void load()} />
        ) : notifications.length === 0 ? (
          <EmptyState title="Nothing yet" message="Order and reward updates will appear here." />
        ) : (
          <IonList lines="none" className="cafebara-notification-list">
            {notifications.map((notification) => (
              <IonItem
                key={notification.id}
                button
                className={notification.read_at === null ? 'is-unread' : ''}
                disabled={busyId === notification.id}
                onClick={() => void open(notification)}
              >
                <IonIcon
                  aria-hidden="true"
                  icon={notificationsOutline}
                  slot="start"
                  color={notification.read_at === null ? 'primary' : 'medium'}
                />
                <IonLabel className="ion-text-wrap">
                  <h3>{notification.label || notification.categoryLabel}</h3>
                  <p>{notification.message}</p>
                  <small>{new Date(notification.created_at * 1000).toLocaleString()}</small>
                </IonLabel>
                {notification.read_at !== null ? (
                  <IonIcon aria-hidden="true" icon={checkmarkCircleOutline} slot="end" color="medium" />
                ) : null}
                <IonButton
                  slot="end"
                  fill="clear"
                  color="danger"
                  aria-label="Delete notification"
                  disabled={busyId === notification.id}
                  onClick={(event) => {
                    event.stopPropagation();
                    void remove(notification);
                  }}
                >
                  <IonIcon aria-hidden="true" icon={trashOutline} />
                </IonButton>
              </IonItem>
            ))}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
}
