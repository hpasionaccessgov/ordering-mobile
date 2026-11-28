import { IonButton, IonCard, IonCardContent, IonIcon, IonImg, IonText } from '@ionic/react';
import { addOutline, heart, heartOutline } from 'ionicons/icons';

import { assetUrl } from '../services/api';
import type { Product } from '../services/types';

interface Props {
  product: Product;
  onOpen: () => void;
  onAdd: () => void;
  busy?: boolean;
  favorite?: boolean;
  favoriteBusy?: boolean;
  onToggleFavorite?: () => void;
}

export default function ProductCard({
  product,
  onOpen,
  onAdd,
  busy = false,
  favorite,
  favoriteBusy = false,
  onToggleFavorite,
}: Props): React.JSX.Element {
  return (
    <IonCard className="cafebara-product-card" button onClick={onOpen}>
      {product.image_url ? (
        <IonImg className="cafebara-product-image" src={assetUrl(product.image_url) ?? undefined} alt={product.name} />
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
        <div className="cafebara-product-actions">
          {onToggleFavorite ? (
            <IonButton
              fill="clear"
              color={favorite ? 'danger' : 'medium'}
              aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
              disabled={favoriteBusy}
              onClick={(event) => {
                event.stopPropagation();
                onToggleFavorite();
              }}
            >
              <IonIcon aria-hidden="true" icon={favorite ? heart : heartOutline} />
            </IonButton>
          ) : null}
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
        </div>
      </IonCardContent>
    </IonCard>
  );
}
