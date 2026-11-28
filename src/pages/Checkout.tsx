import { IonButton, IonContent, IonPage, IonText, useIonToast, useIonViewWillEnter } from '@ionic/react';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AppHeader from '../components/AppHeader';
import { ErrorState, LoadingState } from '../components/StateViews';
import { firstError } from '../services/api';
import { clearCart, getCart } from '../services/cartService';
import { placeOrder } from '../services/orderService';
import type { CartSummary } from '../services/types';

export default function Checkout(): React.JSX.Element {
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

  async function submit() {
    if (!cart || cart.lines.length === 0) {
      await presentToast({ message: 'Your cart is empty.', duration: 2000, color: 'warning' });
      return;
    }
    setBusy(true);
    try {
      const order = await placeOrder(
        cart.lines.map((line) => ({ product_id: line.product.id, quantity: line.quantity })),
      );
      try {
        await clearCart();
      } catch {
        // Order is already placed; a stale cart is less harmful than reporting a failed checkout.
      }
      await presentToast({ message: `Order ${order.order_number} placed.`, duration: 2000, color: 'success' });
      navigate(`/orders/${order.id}`, { replace: true });
    } catch (submitError) {
      await presentToast({ message: firstError(submitError), duration: 2500, color: 'danger' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <IonPage>
      <AppHeader title="Checkout" />
      <IonContent className="ion-padding">
        {loading ? (
          <LoadingState label="Loading checkout…" />
        ) : error ? (
          <ErrorState message={error} onRetry={() => void load()} />
        ) : !cart || cart.lines.length === 0 ? (
          <ErrorState message="Your cart is empty." />
        ) : (
          <div className="cafebara-checkout">
            <IonText>
              <h1>Review your order</h1>
              <p>Prices are confirmed by the server when you place the order.</p>
            </IonText>
            <CheckoutLines cart={cart} />
            <div className="cafebara-total">
              <IonText>
                <span>Total</span>
                <h2>₱{Number(cart.total).toFixed(2)}</h2>
              </IonText>
            </div>
            <IonButton expand="block" disabled={busy} onClick={() => void submit()}>
              {busy ? 'Placing order…' : 'Place order'}
            </IonButton>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
}

function CheckoutLines({ cart }: { cart: CartSummary }) {
  return (
    <div className="cafebara-checkout-lines">
      {cart.lines.map((line) => (
        <div className="cafebara-checkout-line" key={line.product.id}>
          <span>{line.product.name}</span>
          <span>
            {line.quantity} × ₱{Number(line.product.price).toFixed(2)}
          </span>
          <strong>₱{Number(line.subtotal).toFixed(2)}</strong>
        </div>
      ))}
    </div>
  );
}
