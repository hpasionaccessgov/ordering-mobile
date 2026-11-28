import { IonButton, IonContent, IonItem, IonLabel, IonList, IonPage, IonText, useIonToast } from '@ionic/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import AppHeader from '../components/AppHeader';
import { useAuth } from '../context/AuthContext';
import { firstError } from '../services/api';

export default function Account(): React.JSX.Element {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [presentToast] = useIonToast();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (error) {
      await presentToast({ message: firstError(error), duration: 2500, color: 'danger' });
    } finally {
      setBusy(false);
    }
  }

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
        <IonList lines="full">
          <IonItem>
            <IonLabel>
              <h3>Username</h3>
              <p>{user?.username}</p>
            </IonLabel>
          </IonItem>
          <IonItem>
            <IonLabel>
              <h3>Status</h3>
              <p>{user?.status === 10 ? 'Active' : 'Inactive'}</p>
            </IonLabel>
          </IonItem>
        </IonList>
        <IonButton expand="block" fill="outline" color="danger" disabled={busy} onClick={() => void logout()}>
          Log out
        </IonButton>
      </IonContent>
    </IonPage>
  );
}
