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
import { heartOutline, trashOutline } from 'ionicons/icons';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AppHeader from '../components/AppHeader';
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews';
import { firstError } from '../services/api';
import { listFavorites, removeFavorite } from '../services/favoriteService';
import type { Favorite } from '../services/types';

export default function Favorites(): React.JSX.Element {
  const navigate = useNavigate();
  const [presentToast] = useIonToast();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listFavorites();
      setFavorites(result.favorites);
    } catch (loadError) {
      setError(firstError(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useIonViewWillEnter(() => {
    void load();
  });

  async function remove(favorite: Favorite) {
    setRemoving(favorite.product_id);
    try {
      await removeFavorite(favorite.product_id);
      await presentToast({ message: `${favorite.product?.name ?? 'Product'} removed.`, duration: 1800 });
      await load();
    } catch (removeError) {
      await presentToast({ message: firstError(removeError), duration: 2500, color: 'danger' });
    } finally {
      setRemoving(null);
    }
  }

  return (
    <IonPage>
      <AppHeader title="Favorites" />
      <IonContent className="ion-padding">
        <div className="cafebara-intro">
          <IonText>
            <h1>Saved products</h1>
            <p>Your favorite Cafébara picks, ready for the next order.</p>
          </IonText>
        </div>
        <IonRefresher slot="fixed" onIonRefresh={(event) => void load().finally(() => event.detail.complete())}>
          <IonRefresherContent />
        </IonRefresher>
        {loading ? (
          <LoadingState label="Loading favorites…" />
        ) : error ? (
          <ErrorState message={error} onRetry={() => void load()} />
        ) : favorites.length === 0 ? (
          <EmptyState
            title="No favorites yet"
            message="Tap the heart on a menu product to save it here."
            action={{ label: 'Browse menu', onClick: () => navigate('/products') }}
          />
        ) : (
          <IonList lines="none" className="cafebara-favorite-list">
            {favorites.map((favorite) => (
              <IonItem
                key={favorite.id}
                button
                routerLink={`/products/${favorite.product_id}`}
                disabled={removing === favorite.product_id}
              >
                <IonIcon aria-hidden="true" icon={heartOutline} slot="start" color="primary" />
                <IonLabel>
                  <h3>{favorite.product?.name ?? `Product #${favorite.product_id}`}</h3>
                  {favorite.product ? <p>₱{Number(favorite.product.price).toFixed(2)}</p> : null}
                </IonLabel>
                <IonButton
                  slot="end"
                  fill="clear"
                  color="danger"
                  aria-label={`Remove ${favorite.product?.name ?? 'product'}`}
                  disabled={removing === favorite.product_id}
                  onClick={(event) => {
                    event.stopPropagation();
                    void remove(favorite);
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
