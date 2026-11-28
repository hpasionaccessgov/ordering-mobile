import {
  IonContent,
  IonList,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonText,
  useIonToast,
  useIonViewWillEnter,
} from '@ionic/react';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AppHeader from '../components/AppHeader';
import ProductCard from '../components/ProductCard';
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews';
import { firstError } from '../services/api';
import { addToCart } from '../services/cartService';
import { listProducts } from '../services/catalogService';
import type { Product } from '../services/types';

export default function Products(): React.JSX.Element {
  const navigate = useNavigate();
  const [presentToast] = useIonToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listProducts();
      setProducts(result.products);
    } catch (loadError) {
      setError(firstError(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useIonViewWillEnter(() => {
    void load();
  });

  async function add(product: Product) {
    setAdding(product.id);
    try {
      await addToCart(product.id);
      await presentToast({
        message: `${product.name} added to your cart.`,
        duration: 1800,
        color: 'success',
      });
    } catch (addError) {
      await presentToast({ message: firstError(addError), duration: 2500, color: 'danger' });
    } finally {
      setAdding(null);
    }
  }

  return (
    <IonPage>
      <AppHeader title="Menu" />
      <IonContent className="ion-padding">
        <div className="cafebara-intro">
          <IonText>
            <h1>Cafébara menu</h1>
            <p>Fresh coffee and pastries, made for your day.</p>
          </IonText>
        </div>
        <IonRefresher slot="fixed" onIonRefresh={(event) => void load().finally(() => event.detail.complete())}>
          <IonRefresherContent />
        </IonRefresher>
        {loading ? (
          <LoadingState label="Loading menu…" />
        ) : error ? (
          <ErrorState message={error} onRetry={() => void load()} />
        ) : products.length === 0 ? (
          <EmptyState title="No products yet" message="Check back after the menu is updated." />
        ) : (
          <IonList lines="none" className="cafebara-product-list">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                busy={adding === product.id}
                onOpen={() => navigate(`/products/${product.id}`)}
                onAdd={() => void add(product)}
              />
            ))}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
}
