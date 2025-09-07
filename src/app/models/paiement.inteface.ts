import { Facture } from "./facture.inteface";


export interface Paiement {
  id?: number;
  facture_id: number;
  montant: number;
   methode: string; 
  datePaiement: string;
  created_at?: string;
  updated_at?: string;

  // Relations
  facture?: Facture;
}
