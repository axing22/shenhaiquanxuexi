import { ReactNode } from "react";
import { ConsumptionItemsData } from "@/services/consumption";

export interface ContextValue {
  consumptionItems?: ConsumptionItemsData;
  [propName: string]: any;
}
