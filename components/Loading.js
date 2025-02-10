import { ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";

export default function Loading() {
  const navigation = useNavigation();

  return (
    <ActivityIndicator
      size="large"
      color="#fff"
      style={{ justifyContent: "center", alignItems: "center", flex: 1, zIndex: 1 }}
    />
  );
}
