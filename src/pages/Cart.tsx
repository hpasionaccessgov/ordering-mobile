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
import { addOutline, removeOutline, trashOutline } from 'ionicons/icons';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AppHeader from '../components/AppHeader';
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews';
import { firstError } from '../services/api';
import { getCart, removeCartItem, updateCartItem } from '../services/cartService';
import type { CartSummary } from '../services/types';

export default function Cart(): React.JSX.Element {
  const navigate = useNavigate();
  const [presentToast] = useIonToast();
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCart(await getCart());
    } catch (loadError) {
      setError(firstError(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useIonViewWillEnter(() => {
    void load();
  });

  async function change(productId: number, quantity: number) {
    setBusy(true);
    try {
      setCart(quantity === 0 ? await removeCartItem(productId) : await updateCartItem(productId, quantity));
    } catch (changeError) {
      await presentToast({ message: firstError(changeError), duration: 2500, color: 'danger' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <IonPage>
      <AppHeader title="Cart" />
      <IonContent className="ion-padding">
        {loading ? (
          <LoadingState label="Loading cart…" />
        ) : error ? (
          <ErrorState message={error} onRetry={() => void load()} />
        ) : !cart || cart.lines.length === 0 ? (
          <EmptyState
            title="Your cart is empty"
            message="Browse the menu and add something you like."
            action={{ label: 'Browse menu', onClick: () => navigate('/products') }}
          />
        ) : (
          <>
            <IonList lines="full" className="cafebara-cart-list">
              {cart.lines.map((line) => (
                <IonItem key={line.product.id}>
                  <IonLabel>
                    <h3>{line.product.name}</h3>
                    <p>₱{Number(line.product.price).toFixed(2)} each</p>
                    <IonText color="primary">
                      <strong>₱{Number(line.subtotal).toFixed(2)}</strong>
                    </IonText>
                  </IonLabel>
                  <div className="cafebara-qty" slot="end">
                    <IonButton
                      fill="clear"
                      size="small"
                      disabled={busy}
                      aria-label={`Remove one ${line.product.name}`}
                      onClick={() => void change(line.product.id, line.quantity - 1)}
                    >
                      <IonIcon aria-hidden="true" icon={removeOutline} />
                    </IonButton>
                    <span>{line.quantity}</span>
                    <IonButton
                      fill="clear"
                      size="small"
                      disabled={busy}
                      aria-label={`Add one ${line.product.name}`}
                      onClick={() => void change(line.product.id, line.quantity + 1)}
                    >
                      <IonIcon aria-hidden="true" icon={addOutline} />
                    </IonButton>
                    <IonButton
                      fill="clear"
                      size="small"
                      color="danger"
                      disabled={busy}
                      aria-label={`Remove ${line.product.name}`}
                      onClick={() => void change(line.product.id, 0)}
                    >
                      <IonIcon aria-hidden="true" icon={trashOutline} />
                    </IonButton>
                  </div>
                </IonItem>
              ))}
            </IonList>
            <div className="cafebara-total">
              <IonText>
                <span>Total</span>
                <h2>₱{Number(cart.total).toFixed(2)}</h2>
              </IonText>
            </div>
            <IonButton expand="block" routerLink="/checkout" disabled={busy}>
              Checkout
            </IonButton>
          </>
        )}
      </IonContent>
    </IonPage>
  );
}
