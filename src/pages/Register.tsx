import { IonButton, IonContent, IonInput, IonItem, IonLabel, IonPage, IonText, useIonToast } from '@ionic/react';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import AppHeader from '../components/AppHeader';
import { useAuth } from '../context/AuthContext';
import { firstError } from '../services/api';

interface FormState {
  username: string;
  email: string;
  fullName: string;
  password: string;
  passwordConfirm: string;
}

const EMPTY: FormState = {
  username: '',
  email: '',
  fullName: '',
  password: '',
  passwordConfirm: '',
};

export default function Register(): React.JSX.Element {
  const { user, signUp } = useAuth();
  const navigate = useNavigate();
  const [presentToast] = useIonToast();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [busy, setBusy] = useState(false);

  function update(key: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit() {
    if (Object.values(form).some((value) => !value.trim())) {
      await presentToast({ message: 'Complete every field.', duration: 2000, color: 'warning' });
      return;
    }
    setBusy(true);
    try {
      await signUp({
        username: form.username.trim(),
        email: form.email.trim(),
        fullName: form.fullName.trim(),
        password: form.password,
        passwordConfirm: form.passwordConfirm,
      });
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
      <AppHeader title="Create account" />
      <IonContent className="ion-padding cafebara-auth">
        <div className="cafebara-auth-panel">
          <IonText>
            <h1>Join Cafébara</h1>
            <p>Track orders and collect loyalty points.</p>
          </IonText>
          {(Object.keys(EMPTY) as (keyof FormState)[]).map((key) => (
            <IonItem className="cafebara-field" key={key}>
              <IonLabel position="stacked">
                {key === 'passwordConfirm' ? 'Confirm password' : key.replace(/([A-Z])/g, ' $1')}
              </IonLabel>
              <IonInput
                fill="outline"
                type={key.includes('password') ? 'password' : key === 'email' ? 'email' : 'text'}
                value={form[key]}
                onIonInput={(event) => update(key, event.detail.value ?? '')}
              />
            </IonItem>
          ))}
          <IonButton expand="block" disabled={busy} onClick={() => void submit()}>
            {busy ? 'Creating account…' : 'Create account'}
          </IonButton>
          <IonButton expand="block" fill="clear" routerLink="/login">
            Back to sign in
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
}
