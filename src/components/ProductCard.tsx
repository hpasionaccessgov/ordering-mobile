import { IonButton, IonCard, IonCardContent, IonIcon, IonImg, IonText } from '@ionic/react';
import { addOutline } from 'ionicons/icons';

import type { Product } from '../services/types';

interface Props {
  product: Product;
  onOpen: () => void;
  onAdd: () => void;
  busy?: boolean;
}

export default function ProductCard({ product, onOpen, onAdd, busy = false }: Props): React.JSX.Element {
  return (
    <IonCard className="cafebara-product-card" button onClick={onOpen}>
      {product.image_url ? (
        <IonImg className="cafebara-product-image" src={product.image_url} alt={product.name} />
      ) : null}
      <IonCardContent>
        <div className="cafebara-product-row">
          <div>
            <h3>{product.name}</h3>
            <IonText color="medium">
              <p>{product.description}</p>
            </IonText>
          </div>
          <IonText color="primary">
            <strong>₱{Number(product.price).toFixed(2)}</strong>
          </IonText>
        </div>
        <IonButton
          fill="outline"
          disabled={busy}
          onClick={(event) => {
            event.stopPropagation();
            onAdd();
          }}
        >
          <IonIcon aria-hidden="true" icon={addOutline} slot="start" />
          Add
        </IonButton>
      </IonCardContent>
    </IonCard>
  );
}
