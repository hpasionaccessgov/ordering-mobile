import {
  IonCard,
  IonCardContent,
  IonContent,
  IonIcon,
  IonList,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonText,
  useIonViewWillEnter,
} from '@ionic/react';
import { chevronForward } from 'ionicons/icons';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AppHeader from '../components/AppHeader';
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews';
import StatusBadge from '../components/StatusBadge';
import { firstError } from '../services/api';
import { listOrders } from '../services/orderService';
import type { Order } from '../services/types';

export default function Orders(): React.JSX.Element {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listOrders();
      setOrders(result.orders);
    } catch (loadError) {
      setError(firstError(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useIonViewWillEnter(() => {
    void load();
  });

  return (
    <IonPage>
      <AppHeader title="Orders" />
      <IonContent className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={(event) => void load().finally(() => event.detail.complete())}>
          <IonRefresherContent />
        </IonRefresher>
        {loading ? (
          <LoadingState label="Loading orders…" />
        ) : error ? (
          <ErrorState message={error} onRetry={() => void load()} />
        ) : orders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            message="Place an order and it will appear here."
            action={{ label: 'Browse menu', onClick: () => navigate('/products') }}
          />
        ) : (
          <IonList lines="none" className="cafebara-order-list">
            {orders.map((order) => (
              <IonCard button key={order.id} onClick={() => navigate(`/orders/${order.id}`)}>
                <IonCardContent>
                  <div className="cafebara-order-row">
                    <div>
                      <h3>{order.order_number}</h3>
                      <IonText color="medium">
                        <p>{new Date(order.created_at * 1000).toLocaleString()}</p>
                      </IonText>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="cafebara-order-row">
                    <IonText color="primary">
                      <strong>₱{Number(order.total_amount).toFixed(2)}</strong>
                    </IonText>
                    <IonIcon aria-hidden="true" icon={chevronForward} color="medium" />
                  </div>
                </IonCardContent>
              </IonCard>
            ))}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
}
