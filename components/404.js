import { Text, View, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";

export default function NotFound() {
  const navigation = useNavigation();

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image
        source={require("../assets/pngwing.com.png")}
        style={{ width: 60, height: 60, marginVertical: 20 }}
      />
      <Text
        style={{
          fontSize: 20,
          fontFamily: "Circular",
          color: "whitesmoke",
          marginHorizontal: 15,
        }}
      >
        Ops..., parece que não há nada por aqui ainda.
      </Text>
    </View>
  );
}
