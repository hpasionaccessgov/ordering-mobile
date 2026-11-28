import {
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonProgressBar,
  IonRefresher,
  IonRefresherContent,
  IonText,
  useIonToast,
  useIonViewWillEnter,
} from '@ionic/react';
import { giftOutline, refreshOutline } from 'ionicons/icons';
import { useCallback, useState } from 'react';

import AppHeader from '../components/AppHeader';
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews';
import { firstError } from '../services/api';
import { getLoyalty, listRewards, listTransactions, redeemReward, tierProgress } from '../services/loyaltyService';
import type { LoyaltySummary, LoyaltyTransaction, Reward } from '../services/types';

export default function Rewards(): React.JSX.Element {
  const [presentToast] = useIonToast();
  const [loyalty, setLoyalty] = useState<LoyaltySummary | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextLoyalty, nextRewards, nextTransactions] = await Promise.all([
        getLoyalty(),
        listRewards(),
        listTransactions(),
      ]);
      setLoyalty(nextLoyalty);
      setRewards(nextRewards.rewards);
      setTransactions(nextTransactions.transactions);
    } catch (loadError) {
      setError(firstError(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useIonViewWillEnter(() => {
    void load();
  });

  async function redeem(reward: Reward) {
    setBusyId(reward.id);
    try {
      const result = await redeemReward(reward.id);
      await presentToast({
        message: result.order_number
          ? `Redeemed! Your free order ${result.order_number} is on the way.`
          : 'Reward redeemed.',
        duration: 2500,
        color: 'success',
      });
      await load();
    } catch (redeemError) {
      await presentToast({ message: firstError(redeemError), duration: 2500, color: 'danger' });
    } finally {
      setBusyId(null);
    }
  }

  const progress = loyalty ? tierProgress(loyalty.lifetimeEarned) : null;

  return (
    <IonPage>
      <AppHeader title="Rewards" />
      <IonContent className="ion-padding">
        <div className="cafebara-intro">
          <IonText>
            <h1>Your rewards</h1>
            <p>Earn 1 point for every ₱100 spent on completed orders.</p>
          </IonText>
        </div>
        <IonRefresher slot="fixed" onIonRefresh={(event) => void load().finally(() => event.detail.complete())}>
          <IonRefresherContent />
        </IonRefresher>
        {loading ? (
          <LoadingState label="Loading rewards…" />
        ) : error || !loyalty || !progress ? (
          <ErrorState message={error ?? 'Rewards are unavailable.'} onRetry={() => void load()} />
        ) : (
          <>
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
              <div className="cafebara-reward-stats">
                <span>{loyalty.current} available</span>
                <span>{loyalty.lifetimeEarned} earned</span>
                <span>{loyalty.lifetimeRedeemed} redeemed</span>
              </div>
            </section>
            <h3 className="cafebara-section-title">Available treats</h3>
            {rewards.length === 0 ? (
              <EmptyState title="No rewards yet" message="Check back after the next reward is added." />
            ) : (
              <div className="cafebara-reward-grid">
                {rewards.map((reward) => (
                  <IonCard key={reward.id} className="cafebara-reward-card">
                    <IonCardContent>
                      <IonIcon aria-hidden="true" icon={giftOutline} color="primary" />
                      <h3>{reward.name}</h3>
                      <IonText color="medium">
                        <p>{reward.description ?? reward.product_name ?? 'A Cafébara treat.'}</p>
                      </IonText>
                      <IonText color="primary">
                        <strong>{reward.point_cost} points</strong>
                      </IonText>
                      <IonButton
                        expand="block"
                        size="small"
                        disabled={loyalty.current < reward.point_cost || busyId !== null}
                        onClick={() => void redeem(reward)}
                      >
                        {busyId === reward.id ? 'Redeeming…' : 'Redeem'}
                      </IonButton>
                    </IonCardContent>
                  </IonCard>
                ))}
              </div>
            )}
            <h3 className="cafebara-section-title">Points history</h3>
            {transactions.length === 0 ? (
              <EmptyState title="No points yet" message="Complete an order to start earning points." />
            ) : (
              <IonList lines="none" className="cafebara-ledger">
                {transactions.map((transaction) => (
                  <IonItem key={transaction.id}>
                    <IonIcon
                      aria-hidden="true"
                      icon={refreshOutline}
                      slot="start"
                      color={transaction.points < 0 ? 'warning' : 'primary'}
                    />
                    <IonLabel>
                      <h3>{transaction.typeLabel || transaction.transaction_type}</h3>
                      <p>{transaction.remarks}</p>
                      <small>{new Date(transaction.created_at * 1000).toLocaleDateString()}</small>
                    </IonLabel>
                    <IonText color={transaction.points < 0 ? 'danger' : 'primary'} slot="end">
                      <strong>
                        {transaction.points > 0 ? '+' : ''}
                        {transaction.points}
                      </strong>
                    </IonText>
                  </IonItem>
                ))}
              </IonList>
            )}
          </>
        )}
      </IonContent>
    </IonPage>
  );
}
