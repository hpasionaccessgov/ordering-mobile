import {
  IonButton,
  IonContent,
  IonIcon,
  IonImg,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonText,
  IonTextarea,
  useIonToast,
  useIonViewWillEnter,
} from '@ionic/react';
import { addOutline, cartOutline, heart, heartOutline, starOutline } from 'ionicons/icons';
import { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import AppHeader from '../components/AppHeader';
import { ErrorState, LoadingState } from '../components/StateViews';
import { assetUrl, firstError } from '../services/api';
import { addToCart } from '../services/cartService';
import { getProduct } from '../services/catalogService';
import { addFavorite, isFavorite, listFavorites, removeFavorite } from '../services/favoriteService';
import { createReview, getReviews } from '../services/reviewService';
import type { Product, ReviewList } from '../services/types';

export default function ProductDetail(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [presentToast] = useIonToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<ReviewList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const [favoriteBusy, setFavoriteBusy] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewBusy, setReviewBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const productId = Number(id);
      const [nextProduct, saved, nextReviews] = await Promise.all([
        getProduct(productId),
        listFavorites(),
        getReviews(productId),
      ]);
      setProduct(nextProduct);
      setFavorite(isFavorite(saved.favorites, nextProduct.id));
      setReviews(nextReviews);
      setOrderId(nextReviews.eligible_orders[0]?.id ?? null);
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

  async function toggleFavorite() {
    if (!product) {
      return;
    }
    setFavoriteBusy(true);
    try {
      if (favorite) {
        await removeFavorite(product.id);
      } else {
        await addFavorite(product.id);
      }
      setFavorite(!favorite);
    } catch (favoriteError) {
      await presentToast({ message: firstError(favoriteError), duration: 2500, color: 'danger' });
    } finally {
      setFavoriteBusy(false);
    }
  }

  async function submitReview() {
    if (!product || orderId === null) {
      return;
    }
    setReviewBusy(true);
    try {
      await createReview({
        product_id: product.id,
        order_id: orderId,
        rating,
        review: reviewText.trim(),
      });
      await presentToast({ message: 'Thanks for your review.', duration: 1800, color: 'success' });
      setReviewText('');
      const refreshed = await getReviews(product.id);
      setReviews(refreshed);
      setOrderId(refreshed.eligible_orders[0]?.id ?? null);
    } catch (reviewError) {
      await presentToast({ message: firstError(reviewError), duration: 2500, color: 'danger' });
    } finally {
      setReviewBusy(false);
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
              <IonImg
                className="cafebara-detail-image"
                src={assetUrl(product.image_url) ?? undefined}
                alt={product.name}
              />
            ) : null}
            <div className="cafebara-detail-head">
              <IonText>
                <h1>{product.name}</h1>
                <p>{product.description}</p>
                <h2 className="cafebara-price">₱{Number(product.price).toFixed(2)}</h2>
              </IonText>
              <IonButton
                fill="clear"
                color={favorite ? 'danger' : 'medium'}
                aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
                disabled={favoriteBusy}
                onClick={() => void toggleFavorite()}
              >
                <IonIcon aria-hidden="true" icon={favorite ? heart : heartOutline} />
              </IonButton>
            </div>
            <IonButton expand="block" disabled={busy} onClick={() => void add()}>
              <IonIcon aria-hidden="true" icon={addOutline} slot="start" />
              {busy ? 'Adding…' : 'Add to cart'}
            </IonButton>
            <IonButton expand="block" fill="outline" routerLink="/cart">
              <IonIcon aria-hidden="true" icon={cartOutline} slot="start" />
              View cart
            </IonButton>
            {reviews ? (
              <section className="cafebara-reviews">
                <h3>Ratings &amp; reviews</h3>
                <IonText color="primary">
                  <strong>
                    <IonIcon aria-hidden="true" icon={starOutline} /> {reviews.summary.average.toFixed(1)}
                  </strong>{' '}
                  <small>({reviews.summary.count} reviews)</small>
                </IonText>
                {reviews.reviews.length === 0 ? (
                  <IonText color="medium">
                    <p>No reviews yet.</p>
                  </IonText>
                ) : (
                  <IonList lines="none" className="cafebara-review-list">
                    {reviews.reviews.map((review) => (
                      <IonItem key={review.id}>
                        <IonLabel className="ion-text-wrap">
                          <h3>{review.rating} / 5 stars</h3>
                          <p>{review.review}</p>
                          <small>{new Date(review.created_at * 1000).toLocaleDateString()}</small>
                        </IonLabel>
                      </IonItem>
                    ))}
                  </IonList>
                )}
                {reviews.eligible_orders.length > 0 ? (
                  <div className="cafebara-review-form">
                    <h3>Write a review</h3>
                    <IonItem>
                      <IonLabel>Order</IonLabel>
                      <IonSelect
                        value={orderId}
                        interface="popover"
                        onIonChange={(event) => setOrderId(Number(event.detail.value))}
                      >
                        {reviews.eligible_orders.map((order) => (
                          <IonSelectOption key={order.id} value={order.id}>
                            {order.order_number}
                          </IonSelectOption>
                        ))}
                      </IonSelect>
                    </IonItem>
                    <IonItem>
                      <IonLabel>Rating</IonLabel>
                      <IonSelect
                        value={rating}
                        interface="popover"
                        onIonChange={(event) => setRating(Number(event.detail.value))}
                      >
                        {[5, 4, 3, 2, 1].map((value) => (
                          <IonSelectOption key={value} value={value}>
                            {value} stars
                          </IonSelectOption>
                        ))}
                      </IonSelect>
                    </IonItem>
                    <IonTextarea
                      label="Your review"
                      label-placement="stacked"
                      value={reviewText}
                      rows={3}
                      onIonInput={(event) => setReviewText(event.detail.value ?? '')}
                    />
                    <IonButton
                      expand="block"
                      disabled={reviewBusy || orderId === null || reviewText.trim().length === 0}
                      onClick={() => void submitReview()}
                    >
                      {reviewBusy ? 'Posting…' : 'Post review'}
                    </IonButton>
                  </div>
                ) : null}
              </section>
            ) : null}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
}
