import type { PropsWithChildren } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { theme } from "../../theme/tokens";

interface ScreenContainerProps extends PropsWithChildren {
  scrollable?: boolean;
  padded?: boolean;
}

export const ScreenContainer = ({
  children,
  scrollable = true,
  padded = true,
}: ScreenContainerProps) => {
  const content = (
    <View style={[styles.content, padded ? styles.padded : null]}>{children}</View>
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View pointerEvents="none" style={styles.glowTop} />
      <View pointerEvents="none" style={styles.glowBottom} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        {scrollable ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {content}
          </ScrollView>
        ) : (
          content
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  glowTop: {
    position: "absolute",
    top: -58,
    right: -26,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: theme.colors.greenDeep,
    opacity: 0.28,
  },
  glowBottom: {
    position: "absolute",
    bottom: 120,
    left: -46,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: theme.colors.lime,
    opacity: 0.12,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    gap: 20,
  },
  padded: {
    paddingHorizontal: theme.spacing.screen,
    paddingBottom: 118,
  },
});

