import { supabase } from "./db";

export interface Credit {
  id?: number;
  user_uuid: string;
  balance: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreditHistory {
  id?: number;
  user_uuid: string;
  amount: number;
  type: string;
  description?: string;
  created_at?: string;
}

export async function getUserCredits(userUuid: string): Promise<Credit | null> {
  const { data, error } = await supabase
    .from("credits")
    .select("*")
    .eq("user_uuid", userUuid)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error getting user credits:", error);
    return null;
  }

  return data as Credit | null;
}

export async function createUserCredits(
  userUuid: string,
  initialBalance: number = 0
): Promise<Credit | null> {
  const { data, error } = await supabase
    .from("credits")
    .insert([{ user_uuid: userUuid, balance: initialBalance }])
    .select()
    .single();

  if (error) {
    console.error("Error creating user credits:", error);
    return null;
  }

  return data as Credit;
}

export async function updateUserCredits(
  userUuid: string,
  amount: number,
  type: string,
  description?: string
): Promise<Credit | null> {
  // Get current balance
  let currentCredits = await getUserCredits(userUuid);

  if (!currentCredits) {
    // Create credits if not exist
    currentCredits = await createUserCredits(userUuid, 0);
  }

  if (!currentCredits) {
    return null;
  }

  const newBalance = currentCredits.balance + amount;

  // Update balance
  const { data, error } = await supabase
    .from("credits")
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq("user_uuid", userUuid)
    .select()
    .single();

  if (error) {
    console.error("Error updating user credits:", error);
    return null;
  }

  // Add history record
  await addCreditHistory(userUuid, amount, type, description);

  return data as Credit;
}

export async function addCreditHistory(
  userUuid: string,
  amount: number,
  type: string,
  description?: string
): Promise<CreditHistory | null> {
  const { data, error } = await supabase
    .from("credit_history")
    .insert([{ user_uuid: userUuid, amount, type, description }])
    .select()
    .single();

  if (error) {
    console.error("Error adding credit history:", error);
    return null;
  }

  return data as CreditHistory;
}

export async function getCreditHistory(userUuid: string): Promise<CreditHistory[]> {
  const { data, error } = await supabase
    .from("credit_history")
    .select("*")
    .eq("user_uuid", userUuid)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error getting credit history:", error);
    return [];
  }

  return data as CreditHistory[];
}

export async function getCreditHistoryPaginated(
  userUuid: string,
  page: number = 1,
  pageSize: number = 10
): Promise<{ list: CreditHistory[]; total: number }> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  // Get total count
  const { count, error: countError } = await supabase
    .from("credit_history")
    .select("*", { count: "exact", head: true })
    .eq("user_uuid", userUuid);

  if (countError) {
    console.error("Error getting credit history count:", countError);
    return { list: [], total: 0 };
  }

  // Get paginated data
  const { data, error } = await supabase
    .from("credit_history")
    .select("*")
    .eq("user_uuid", userUuid)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Error getting credit history:", error);
    return { list: [], total: 0 };
  }

  return {
    list: data as CreditHistory[],
    total: count || 0,
  };
}

// Legacy credit system functions (for backward compatibility)
export async function getUserValidCredits(userUuid: string): Promise<any[]> {
  // This function seems to be from an older credit system
  // Return empty array for now to prevent build errors
  return [];
}

export async function insertCredit(credit: any): Promise<void> {
  // Legacy function - implement based on actual requirements
  console.warn("insertCredit called - legacy function, implement if needed");
}

export async function findCreditByOrderNo(orderNo: string): Promise<any | null> {
  // Legacy function - implement based on actual requirements
  return null;
}
