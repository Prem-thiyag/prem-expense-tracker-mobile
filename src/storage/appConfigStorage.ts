import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL_OVERRIDE_KEY = "@prem-expense-tracker/api-base-url";

export const appConfigStorage = {
  async getApiBaseUrlOverride() {
    return AsyncStorage.getItem(API_BASE_URL_OVERRIDE_KEY);
  },

  async setApiBaseUrlOverride(value: string) {
    await AsyncStorage.setItem(API_BASE_URL_OVERRIDE_KEY, value);
  },

  async clearApiBaseUrlOverride() {
    await AsyncStorage.removeItem(API_BASE_URL_OVERRIDE_KEY);
  },
};
