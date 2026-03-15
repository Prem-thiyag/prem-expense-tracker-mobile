import { StyleSheet, Text, View } from "react-native";

import { SectionCard } from "../common/SectionCard";

interface FeaturePlaceholderProps {
  description: string;
  currentFocus: string[];
  nextMilestones: string[];
}

export const FeaturePlaceholder = ({
  description,
  currentFocus,
  nextMilestones,
}: FeaturePlaceholderProps) => {
  return (
    <SectionCard subtitle={description} title="Design roadmap">
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Current focus</Text>
        <View style={styles.chips}>
          {currentFocus.map((item) => (
            <View key={item} style={styles.chip}>
              <Text style={styles.chipText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Next build slice</Text>
        {nextMilestones.map((item, index) => (
          <View key={item} style={styles.milestone}>
            <View style={styles.indexBubble}>
              <Text style={styles.indexText}>{index + 1}</Text>
            </View>
            <Text style={styles.milestoneText}>{item}</Text>
          </View>
        ))}
      </View>
    </SectionCard>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  sectionLabel: {
    color: "#F7FAFD",
    fontSize: 14,
    fontWeight: "800",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    backgroundColor: "#1F2C37",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipText: {
    color: "#C6D0DA",
    fontSize: 13,
    fontWeight: "700",
  },
  milestone: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  indexBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#B7FFC5",
    alignItems: "center",
    justifyContent: "center",
  },
  indexText: {
    color: "#111A21",
    fontSize: 13,
    fontWeight: "900",
  },
  milestoneText: {
    flex: 1,
    color: "#AAB8C4",
    fontSize: 14,
    lineHeight: 20,
  },
});
