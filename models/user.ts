import { supabase } from "./db";
import { User } from "@/types/user";
import { getSupabaseClient } from "@/models/db";

export async function insertUser(user: User): Promise<User> {
  const { data, error } = await supabase
    .from("users")
    .insert([user])
    .select()
    .single();

  if (error) {
    console.error("Error inserting user:", error);
    throw error;
  }

  return data as User;
}

export async function findUserByEmail(email: string, provider?: string): Promise<User | null> {
  let query = supabase.from("users").select("*").eq("email", email);

  if (provider) {
    query = query.eq("signin_provider", provider);
  }

  const { data, error } = await query.single();

  if (error && error.code !== "PGRST116") {
    console.error("Error finding user by email:", error);
    return null;
  }

  return data as User | null;
}

export async function findUserByUuid(uuid: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("uuid", uuid)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error finding user by uuid:", error);
    return null;
  }

  return data as User | null;
}

export async function updateUser(uuid: string, updates: Partial<User>): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("uuid", uuid)
    .select()
    .single();

  if (error) {
    console.error("Error updating user:", error);
    return null;
  }

  return data as User;
}

export async function getUsersTotal(): Promise<number | undefined> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("users")
    .select("id");

  if (error) {
    return undefined;
  }

  return data?.length || 0;
}

export async function getUserCountByDate(
  startTime: string
): Promise<Map<string, number> | undefined> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("users")
    .select("created_at")
    .gte("created_at", startTime)
    .order("created_at", { ascending: true });

  if (error) {
    return undefined;
  }

  // Group by date in memory since Supabase doesn't support GROUP BY directly
  const dateCountMap = new Map<string, number>();
  data.forEach((item: any) => {
    const date = item.created_at.split("T")[0];
    dateCountMap.set(date, (dateCountMap.get(date) || 0) + 1);
  });

  return dateCountMap;
}

export async function getUsers(
  page: number = 1,
  limit: number = 50
): Promise<User[]> {
  const supabase = getSupabaseClient();
  const offset = (page - 1) * limit;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }

  return data as User[];
}

export async function getUsersByUuids(uuids: string[]): Promise<User[]> {
  if (!uuids || uuids.length === 0) {
    return [];
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .in("uuid", uuids);

  if (error) {
    console.error("Error fetching users by uuids:", error);
    return [];
  }

  return data as User[];
}
