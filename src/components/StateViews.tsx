import { IonButton, IonIcon, IonSpinner, IonText } from '@ionic/react';
import { alertCircleOutline, refreshOutline } from 'ionicons/icons';

export function LoadingState({ label = 'Loading…' }: { label?: string }): React.JSX.Element {
  return (
    <div className="cafebara-state">
      <IonSpinner name="crescent" />
      <IonText color="medium">{label}</IonText>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }): React.JSX.Element {
  return (
    <div className="cafebara-state">
      <IonIcon aria-hidden="true" icon={alertCircleOutline} color="danger" />
      <IonText color="danger">{message}</IonText>
      {onRetry ? (
        <IonButton fill="outline" onClick={onRetry}>
          <IonIcon aria-hidden="true" icon={refreshOutline} slot="start" />
          Retry
        </IonButton>
      ) : null}
    </div>
  );
}

export function EmptyState({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: { label: string; onClick: () => void };
}): React.JSX.Element {
  return (
    <div className="cafebara-state">
      <IonText>
        <h3>{title}</h3>
        <p>{message}</p>
      </IonText>
      {action ? <IonButton onClick={action.onClick}>{action.label}</IonButton> : null}
    </div>
  );
}
