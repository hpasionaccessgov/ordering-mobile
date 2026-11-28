import {
  IonContent,
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
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AppHeader from '../components/AppHeader';
import ProductCard from '../components/ProductCard';
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews';
import { firstError } from '../services/api';
import { addToCart } from '../services/cartService';
import { getHighlights, listProducts } from '../services/catalogService';
import { addFavorite, listFavorites, removeFavorite } from '../services/favoriteService';
import type { Product, ProductHighlights } from '../services/types';

export default function Products(): React.JSX.Element {
  const navigate = useNavigate();
  const [presentToast] = useIonToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [highlights, setHighlights] = useState<ProductHighlights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState<number | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [favoriteBusy, setFavoriteBusy] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [menu, saved, featured] = await Promise.all([listProducts(), listFavorites(), getHighlights()]);
      setProducts(menu.products);
      setFavoriteIds(saved.favorites.map((favorite) => favorite.product_id));
      setHighlights(featured);
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

  async function toggleFavorite(product: Product) {
    setFavoriteBusy(product.id);
    try {
      if (favoriteIds.includes(product.id)) {
        await removeFavorite(product.id);
      } else {
        await addFavorite(product.id);
      }
      const saved = await listFavorites();
      setFavoriteIds(saved.favorites.map((favorite) => favorite.product_id));
    } catch (favoriteError) {
      await presentToast({ message: firstError(favoriteError), duration: 2500, color: 'danger' });
    } finally {
      setFavoriteBusy(null);
    }
  }

  function productCard(product: Product): React.JSX.Element {
    return (
      <ProductCard
        key={product.id}
        product={product}
        busy={adding === product.id}
        favorite={favoriteIds.includes(product.id)}
        favoriteBusy={favoriteBusy === product.id}
        onToggleFavorite={() => void toggleFavorite(product)}
        onOpen={() => navigate(`/products/${product.id}`)}
        onAdd={() => void add(product)}
      />
    );
  }

  function highlightStrip(title: string, items: Product[]): React.JSX.Element | null {
    if (items.length === 0) {
      return null;
    }
    return (
      <section className="cafebara-highlight-section">
        <h2 className="cafebara-section-title">{title}</h2>
        <div className="cafebara-highlight-strip">{items.map(productCard)}</div>
      </section>
    );
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
          <>
            {highlights ? highlightStrip("Today's specials", highlights.special_products) : null}
            {highlights ? highlightStrip('Featured drinks & bites', highlights.featured_products) : null}
            {highlights && highlights.best_sellers.length > 0 ? (
              <section className="cafebara-highlight-section">
                <h2 className="cafebara-section-title">Best sellers</h2>
                <IonList lines="none" className="cafebara-best-sellers">
                  {highlights.best_sellers.map((item, index) => (
                    <IonItem key={item.product_id} button routerLink={`/products/${item.product_id}`}>
                      <span className="cafebara-rank" slot="start">
                        #{index + 1}
                      </span>
                      <IonLabel>
                        <h3>{item.product_name}</h3>
                        <p>{item.quantity} sold</p>
                      </IonLabel>
                    </IonItem>
                  ))}
                </IonList>
              </section>
            ) : null}
            <h2 className="cafebara-section-title">All drinks &amp; bites</h2>
            <IonList lines="none" className="cafebara-product-list">
              {products.map(productCard)}
            </IonList>
          </>
        )}
      </IonContent>
    </IonPage>
  );
}
