import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import GoBack from "./Back";

export default function Header({ title }) {
  // Recebe a prop "title"
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      <GoBack />
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 0,
    marginRight: 20,
    paddingHorizontal: 5,
    width: "100%",
  },
  title: {
    textAlign: "center",
    fontSize: 18,
    color: "#fff",
    fontFamily: "Circular",
    marginTop: 20,
    marginBottom: 20,
  },
});
