import {
  IonButton,
  IonContent,
  IonIcon,
  IonImg,
  IonPage,
  IonText,
  useIonToast,
  useIonViewWillEnter,
} from '@ionic/react';
import { addOutline, cartOutline } from 'ionicons/icons';
import { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import AppHeader from '../components/AppHeader';
import { ErrorState, LoadingState } from '../components/StateViews';
import { firstError } from '../services/api';
import { addToCart } from '../services/cartService';
import { getProduct } from '../services/catalogService';
import type { Product } from '../services/types';

export default function ProductDetail(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [presentToast] = useIonToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProduct(await getProduct(Number(id)));
    } catch (loadError) {
      setError(firstError(loadError));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useIonViewWillEnter(() => {
    void load();
  });

  async function add() {
    if (!product) {
      return;
    }
    setBusy(true);
    try {
      await addToCart(product.id);
      await presentToast({ message: 'Added to cart.', duration: 1800, color: 'success' });
      navigate('/cart');
    } catch (addError) {
      await presentToast({ message: firstError(addError), duration: 2500, color: 'danger' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <IonPage>
      <AppHeader title="Product details" />
      <IonContent className="ion-padding">
        {loading ? (
          <LoadingState label="Loading product…" />
        ) : error || !product ? (
          <ErrorState message={error ?? 'Product not found.'} onRetry={() => void load()} />
        ) : (
          <div className="cafebara-detail">
            {product.image_url ? (
              <IonImg className="cafebara-detail-image" src={product.image_url} alt={product.name} />
            ) : null}
            <IonText>
              <h1>{product.name}</h1>
              <p>{product.description}</p>
              <h2 className="cafebara-price">₱{Number(product.price).toFixed(2)}</h2>
            </IonText>
            <IonButton expand="block" disabled={busy} onClick={() => void add()}>
              <IonIcon aria-hidden="true" icon={addOutline} slot="start" />
              {busy ? 'Adding…' : 'Add to cart'}
            </IonButton>
            <IonButton expand="block" fill="outline" routerLink="/cart">
              <IonIcon aria-hidden="true" icon={cartOutline} slot="start" />
              View cart
            </IonButton>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
}
