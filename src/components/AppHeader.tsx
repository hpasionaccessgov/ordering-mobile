import { IonButtons, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/react';
import { cafeOutline } from 'ionicons/icons';
import type { ReactNode } from 'react';

interface Props {
  title: string;
  actions?: ReactNode;
}

export default function AppHeader({ title, actions }: Props): React.JSX.Element {
  return (
    <IonHeader>
      <IonToolbar className="cafebara-toolbar">
        <IonIcon aria-hidden="true" icon={cafeOutline} slot="start" className="cafebara-mark" />
        <IonTitle>{title}</IonTitle>
        {actions ? <IonButtons slot="end">{actions}</IonButtons> : null}
      </IonToolbar>
    </IonHeader>
  );
}
