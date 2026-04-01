import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

export function SearchDropdown({
  value,
  onChangeText,
  placeholder,
  items,
  selectedItem,
  onSelectItem,
  getItemKey,
  getItemLabel,
  emptyText = "검색 결과가 없습니다.",
}) {
  const [isFocused, setIsFocused] = useState(false);

  const filteredItems = useMemo(() => {
    const query = normalize(value);
    if (!query) {
      return [];
    }

    return (items || [])
      .filter((item) => normalize(getItemLabel(item)).includes(query))
      .slice(0, 20);
  }, [getItemLabel, items, value]);

  const showDropdown = isFocused && normalize(value).length > 0;

  return (
    <View style={styles.wrapper}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 120)}
      />

      {showDropdown ? (
        <View style={styles.dropdown}>
          {filteredItems.length === 0 ? (
            <Text style={styles.emptyText}>{emptyText}</Text>
          ) : (
            <FlatList
              keyboardShouldPersistTaps="always"
              data={filteredItems}
              keyExtractor={(item) => String(getItemKey(item))}
              renderItem={({ item }) => {
                const active = selectedItem && getItemKey(selectedItem) === getItemKey(item);
                return (
                  <Pressable
                    style={[styles.optionItem, active && styles.optionItemActive]}
                    onPress={() => {
                      onSelectItem(item);
                      setIsFocused(false);
                    }}
                  >
                    <Text style={[styles.optionText, active && styles.optionTextActive]}>{getItemLabel(item)}</Text>
                  </Pressable>
                );
              }}
            />
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    zIndex: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D5D5D5",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#FFF",
    fontSize: 14,
  },
  dropdown: {
    marginTop: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E4E4E4",
    backgroundColor: "#FFF",
    maxHeight: 220,
    overflow: "hidden",
  },
  optionItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EFEFF1",
  },
  optionItemActive: {
    backgroundColor: "#EAF2FF",
  },
  optionText: {
    fontSize: 14,
    color: "#222",
  },
  optionTextActive: {
    color: "#1C73F0",
    fontWeight: "700",
  },
  emptyText: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    color: "#8A8A8A",
    fontSize: 13,
  },
});
