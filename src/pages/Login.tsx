import { IonButton, IonContent, IonInput, IonItem, IonLabel, IonPage, IonText, useIonToast } from '@ionic/react';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import AppHeader from '../components/AppHeader';
import { useAuth } from '../context/AuthContext';
import { firstError } from '../services/api';

export default function Login(): React.JSX.Element {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const [presentToast] = useIonToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!username.trim() || !password) {
      await presentToast({ message: 'Enter your username and password.', duration: 2000, color: 'warning' });
      return;
    }
    setBusy(true);
    try {
      await signIn(username.trim(), password);
      navigate('/products', { replace: true });
    } catch (error) {
      await presentToast({ message: firstError(error), duration: 2500, color: 'danger' });
    } finally {
      setBusy(false);
    }
  }

  if (user) {
    return <Navigate to="/products" replace />;
  }

  return (
    <IonPage>
      <AppHeader title="Sign in" />
      <IonContent className="ion-padding cafebara-auth">
        <div className="cafebara-auth-panel">
          <IonText>
            <h1>Welcome back</h1>
            <p>Sign in to order your Cafébara favorites.</p>
          </IonText>
          <IonItem className="cafebara-field">
            <IonLabel position="stacked">Username</IonLabel>
            <IonInput
              fill="outline"
              value={username}
              autocomplete="username"
              onIonInput={(event) => setUsername(event.detail.value ?? '')}
            />
          </IonItem>
          <IonItem className="cafebara-field">
            <IonLabel position="stacked">Password</IonLabel>
            <IonInput
              fill="outline"
              type="password"
              value={password}
              autocomplete="current-password"
              onIonInput={(event) => setPassword(event.detail.value ?? '')}
            />
          </IonItem>
          <IonButton expand="block" disabled={busy} onClick={() => void submit()}>
            {busy ? 'Signing in…' : 'Sign in'}
          </IonButton>
          <IonButton expand="block" fill="clear" routerLink="/register">
            Create an account
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
}
