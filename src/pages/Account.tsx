import {
  IonButton,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonProgressBar,
  IonText,
  useIonToast,
  useIonViewWillEnter,
} from '@ionic/react';
import {
  cashOutline,
  giftOutline,
  heartOutline,
  logOutOutline,
  notificationsOutline,
  receiptOutline,
  starOutline,
  trophyOutline,
} from 'ionicons/icons';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AppHeader from '../components/AppHeader';
import { ErrorState, LoadingState } from '../components/StateViews';
import { useAuth } from '../context/AuthContext';
import { firstError } from '../services/api';
import { getCustomerSummary } from '../services/customerService';
import { getLoyalty, tierProgress } from '../services/loyaltyService';
import { unreadCount } from '../services/notificationService';
import type { CustomerSummary, LoyaltySummary } from '../services/types';

function Kpi({
  label,
  value,
  caption,
  icon,
}: {
  label: string;
  value: string;
  caption: string;
  icon: string;
}): React.JSX.Element {
  return (
    <div className="cafebara-kpi-card">
      <IonIcon aria-hidden="true" icon={icon} />
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{caption}</small>
    </div>
  );
}

export default function Account(): React.JSX.Element {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [presentToast] = useIonToast();
  const [summary, setSummary] = useState<CustomerSummary | null>(null);
  const [loyalty, setLoyalty] = useState<LoyaltySummary | null>(null);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextSummary, nextLoyalty, nextUnread] = await Promise.all([
        getCustomerSummary(),
        getLoyalty(),
        unreadCount(),
      ]);
      setSummary(nextSummary);
      setLoyalty(nextLoyalty);
      setUnread(nextUnread);
    } catch (loadError) {
      setError(firstError(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useIonViewWillEnter(() => {
    void load();
  });

  async function logout() {
    setBusy(true);
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (logoutError) {
      await presentToast({ message: firstError(logoutError), duration: 2500, color: 'danger' });
    } finally {
      setBusy(false);
    }
  }

  const progress = loyalty ? tierProgress(loyalty.lifetimeEarned) : null;

  return (
    <IonPage>
      <AppHeader title="Account" />
      <IonContent className="ion-padding">
        <div className="cafebara-intro">
          <IonText>
            <h1>{user?.full_name ?? 'Your account'}</h1>
            <p>{user?.email}</p>
          </IonText>
        </div>
        {loading ? (
          <LoadingState label="Loading your account…" />
        ) : error || !summary || !loyalty || !progress ? (
          <ErrorState message={error ?? 'Account details are unavailable.'} onRetry={() => void load()} />
        ) : (
          <>
            <div className="cafebara-kpi-grid">
              <Kpi
                label="Current points"
                value={String(loyalty.current)}
                caption="Ready to redeem"
                icon={starOutline}
              />
              <Kpi
                label="Lifetime earned"
                value={String(loyalty.lifetimeEarned)}
                caption="All completed orders"
                icon={trophyOutline}
              />
              <Kpi
                label="Total spent"
                value={`₱${Number(summary.total_spent).toFixed(2)}`}
                caption={`${summary.order_count} orders`}
                icon={cashOutline}
              />
              <Kpi
                label="Favorite product"
                value={summary.favorite_product?.name ?? 'None yet'}
                caption={`${summary.favorite_count} saved`}
                icon={heartOutline}
              />
            </div>
            <section className="cafebara-panel cafebara-progress-panel">
              <div className="cafebara-progress-head">
                <IonText>
                  <strong>{loyalty.tier_label} tier</strong>
                </IonText>
                <IonText color="medium">
                  <small>Next: {progress.nextTier}</small>
                </IonText>
              </div>
              <IonProgressBar value={progress.percent / 100} />
              <IonText color="medium">
                <small>
                  {progress.remaining > 0
                    ? `${progress.remaining} more earned points to reach ${progress.nextTier}.`
                    : 'You reached the highest tier. Enjoy your perks!'}
                </small>
              </IonText>
            </section>
            <IonList lines="full" className="cafebara-quick-links">
              <IonItem routerLink="/rewards">
                <IonIcon aria-hidden="true" icon={giftOutline} slot="start" />
                <IonLabel>
                  <h3>Rewards</h3>
                  <p>Redeem your points</p>
                </IonLabel>
              </IonItem>
              <IonItem routerLink="/favorites">
                <IonIcon aria-hidden="true" icon={heartOutline} slot="start" />
                <IonLabel>
                  <h3>Favorites</h3>
                  <p>{summary.favorite_count} saved products</p>
                </IonLabel>
              </IonItem>
              <IonItem routerLink="/notifications">
                <IonIcon aria-hidden="true" icon={notificationsOutline} slot="start" />
                <IonLabel>
                  <h3>Notifications</h3>
                  <p>{unread} unread</p>
                </IonLabel>
              </IonItem>
              <IonItem routerLink="/orders">
                <IonIcon aria-hidden="true" icon={receiptOutline} slot="start" />
                <IonLabel>
                  <h3>Orders</h3>
                  <p>Track your orders</p>
                </IonLabel>
              </IonItem>
            </IonList>
          </>
        )}
        <IonButton expand="block" fill="outline" color="danger" disabled={busy} onClick={() => void logout()}>
          <IonIcon aria-hidden="true" icon={logOutOutline} slot="start" />
          Log out
        </IonButton>
      </IonContent>
    </IonPage>
  );
}
