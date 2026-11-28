import {
  IonButton,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonText,
  useIonToast,
  useIonViewWillEnter,
} from '@ionic/react';
import { checkmarkCircle, refreshOutline, timeOutline } from 'ionicons/icons';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import AppHeader from '../components/AppHeader';
import { ErrorState, LoadingState } from '../components/StateViews';
import StatusBadge from '../components/StatusBadge';
import { firstError } from '../services/api';
import { cancelOrder, getOrder } from '../services/orderService';
import type { Order, OrderStatus } from '../services/types';
import { STATUS_LABELS } from '../services/types';

const TRACKED: OrderStatus[] = ['pending', 'confirmed', 'processing', 'ready_for_pickup', 'completed'];

export default function OrderDetail(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const [presentToast] = useIonToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setOrder(await getOrder(Number(id)));
      setError(null);
    } catch (loadError) {
      setError(firstError(loadError));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useIonViewWillEnter(() => {
    void load();
  });

  useEffect(() => {
    const timer = window.setInterval(() => void load(), 20000);
    return () => window.clearInterval(timer);
  }, [load]);

  async function cancel() {
    setBusy(true);
    try {
      setOrder(await cancelOrder(Number(id)));
      await presentToast({ message: 'Order cancelled.', duration: 2000, color: 'success' });
    } catch (cancelError) {
      await presentToast({ message: firstError(cancelError), duration: 2500, color: 'danger' });
    } finally {
      setBusy(false);
    }
  }

  const currentStep = order ? TRACKED.indexOf(order.status) : -1;

  return (
    <IonPage>
      <AppHeader title={order ? `Order ${order.order_number}` : 'Order details'} />
      <IonContent className="ion-padding">
        {loading ? (
          <LoadingState label="Loading order…" />
        ) : error || !order ? (
          <ErrorState message={error ?? 'Order not found.'} onRetry={() => void load()} />
        ) : (
          <div className="cafebara-order-detail">
            <div className="cafebara-order-row">
              <IonText>
                <h1>{order.order_number}</h1>
                <p>Placed {new Date(order.created_at * 1000).toLocaleString()}</p>
              </IonText>
              <StatusBadge status={order.status} />
            </div>

            <IonList lines="none" className="cafebara-timeline">
              {TRACKED.map((status, index) => (
                <IonItem key={status} className={index <= currentStep ? 'is-reached' : ''}>
                  <IonIcon
                    aria-hidden="true"
                    icon={index <= currentStep ? checkmarkCircle : timeOutline}
                    color={index <= currentStep ? 'primary' : 'medium'}
                    slot="start"
                  />
                  <IonLabel>{STATUS_LABELS[status]}</IonLabel>
                </IonItem>
              ))}
              {order.status === 'cancelled' ? (
                <IonItem>
                  <IonLabel color="danger">Cancelled</IonLabel>
                </IonItem>
              ) : null}
            </IonList>

            <h3>Items</h3>
            <IonList lines="full">
              {order.items.map((item) => (
                <IonItem key={item.id}>
                  <IonLabel>
                    <h3>{item.product_name}</h3>
                    <p>
                      {item.quantity} × ₱{Number(item.unit_price).toFixed(2)}
                    </p>
                  </IonLabel>
                  <IonText color="primary" slot="end">
                    <strong>₱{Number(item.subtotal).toFixed(2)}</strong>
                  </IonText>
                </IonItem>
              ))}
            </IonList>
            <div className="cafebara-total">
              <IonText>
                <span>Total</span>
                <h2>₱{Number(order.total_amount).toFixed(2)}</h2>
              </IonText>
            </div>

            <div className="cafebara-order-actions">
              <IonButton fill="outline" onClick={() => void load()}>
                <IonIcon aria-hidden="true" icon={refreshOutline} slot="start" />
                Refresh status
              </IonButton>
              {order.status === 'pending' ? (
                <IonButton fill="outline" color="danger" disabled={busy} onClick={() => void cancel()}>
                  Cancel order
                </IonButton>
              ) : null}
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
}
