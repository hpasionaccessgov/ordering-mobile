import { IonButtons, IonHeader, IonImg, IonTitle, IonToolbar } from '@ionic/react';
import type { ReactNode } from 'react';

interface Props {
  title: string;
  actions?: ReactNode;
}

export default function AppHeader({ title, actions }: Props): React.JSX.Element {
  return (
    <IonHeader>
      <IonToolbar className="cafebara-toolbar">
        <IonButtons slot="start">
          <IonImg aria-hidden="true" className="cafebara-brand-logo" src="/Cafebara_logo-320.png" alt="" />
          <span className="cafebara-brand-copy">
            <span className="cafebara-brand-name">Cafébara</span>
            <span className="cafebara-brand-caption">Café &amp; ordering</span>
          </span>
        </IonButtons>
        <IonTitle>{title}</IonTitle>
        {actions ? <IonButtons slot="end">{actions}</IonButtons> : null}
      </IonToolbar>
    </IonHeader>
  );
}
