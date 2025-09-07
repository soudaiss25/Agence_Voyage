import { Avis } from "./avis.inteface";
import { User } from "./user.inteface";

export interface Client {
  id?: number;
  user_id: number; // correspond à la colonne en BDD
  created_at?: string;
  updated_at?: string;

  // Relations
  user?: User; // correspond à la relation définie dans le modèle Laravel
  avis?: Avis[];
}

