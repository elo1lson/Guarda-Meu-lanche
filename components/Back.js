import { StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";

export default function GoBack() {
  const navigation = useNavigation();

  return (
    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
      <Icon name="arrow-back" size={24} color="#fff" />
    </TouchableOpacity>
  );
}
export const styles = StyleSheet.create({
  back: {
    marginTop: 20,
    marginHorizontal: 20,
    color: "#FFF",
    fontSize: 16,
    maxHeight: 50,
    alignSelf: "stretch", 
  },
});
