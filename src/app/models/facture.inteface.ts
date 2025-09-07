import { Paiement } from "./paiement.inteface";
import { Voyage } from "./voyage.inteface";


export interface Facture {
  id?: number;
  voyage_id: number;
  montantTotal: number;
  montantPaye: number;
  montantRestant: number;
  created_at?: string;
  updated_at?: string;

  // Relations
  voyage?: Voyage;
  paiements?: Paiement[];
}
