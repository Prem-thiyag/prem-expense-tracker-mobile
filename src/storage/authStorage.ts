import AsyncStorage from "@react-native-async-storage/async-storage";

import type { User } from "../types/api";

const ACCESS_TOKEN_KEY = "@prem-expense-tracker/access-token";
const USER_KEY = "@prem-expense-tracker/user";

export const authStorage = {
  async getAccessToken() {
    return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  },

  async setAccessToken(token: string) {
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  async getUser() {
    const rawUser = await AsyncStorage.getItem(USER_KEY);
    return rawUser ? (JSON.parse(rawUser) as User) : null;
  },

  async setUser(user: User) {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  async saveSession(token: string, user: User) {
    await AsyncStorage.multiSet([
      [ACCESS_TOKEN_KEY, token],
      [USER_KEY, JSON.stringify(user)],
    ]);
  },

  async clearSession() {
    await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, USER_KEY]);
  },
};
