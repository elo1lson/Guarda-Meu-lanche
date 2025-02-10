import React, { toLocaleString } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";
import Header from "../../components/Header";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing"; // Para compartilhar o PDF gerado
import Icon from "react-native-vector-icons/FontAwesome5";
export default function OrderCreatedScreen({ navigation, route }) {
  const { order } = route.params;

  const createPDF = async () => {
    try {
      const htmlContent = `
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #161616; color: white; padding: 20px;">
            <h1 style="text-align: center; color: #fff;">Pedido Criado</h1>
            <p><strong>ID do Pedido:</strong> ${order.id}</p>
            <p><strong>Data:</strong> ${new Date(order.order_date).toLocaleString()}</p>
            <p><strong>Status:</strong> ${
              order.status === "created" ? "Criado" : order.status
            }</p>
            <p><strong>Total:</strong> R$ ${order.total_price}</p>
            
            <h2 style="color: #fff;">Itens do Pedido:</h2>
            <ul>
              ${order.items
                .map(
                  (item) => `
                    <li style="background-color: #232323; margin-bottom: 10px; padding: 10px; border-radius: 5px;">
                      <img src="${item.url}" style="width: 50px; height: 50px; border-radius: 5px; margin-right: 10px;" />
                      <span style="color: #fff;">${item.name} - R$ ${item.price} x ${item.quantity}</span>
                    </li>
                  `
                )
                .join("")}
            </ul>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      const fileUri = FileSystem.documentDirectory + "pedido.pdf";
      await FileSystem.copyAsync({
        from: uri,
        to: fileUri,
      });

      // Usar o compartilhamento de arquivos do Expo para permitir o download
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert(
          "Erro",
          "O compartilhamento de arquivos não está disponível neste dispositivo."
        );
      }
    } catch (error) {
      console.error("Erro ao criar o PDF", error);
      Alert.alert("Erro", "Houve um problema ao criar o PDF.");
    }
  };

  return (
    <View style={styles.container}>
      <Header title={`Pedido criado #${order.id}` } />

      <View style={styles.contentContainer}>
          <Text style={styles.label}>
            ID do Pedido:
            <Text style={styles.orderId}> {order.id} </Text>
          </Text>
          <Text style={styles.label}>
            Data:
            <Text style={styles.orderDate}> {order.order_date.toLocaleString()} </Text>
          </Text>
          <Text style={styles.label}>
            Status:
            <Text style={styles.orderStatus}>
              {" "}
              {order.status === "created" ? "Criado" : order.status}
            </Text>
          </Text>
          <Text style={styles.label}>
            Total
            <Text style={styles.totalPrice}> R$ {order.total_price}</Text>
          </Text>

          <Text style={[styles.label, styles.sectionTitle]}>Itens do Pedido:</Text>
          <FlatList
            data={order.items}
            keyExtractor={(item, index) => `${order.id}-item-${index}`}
            renderItem={({ item }) => (
              <View style={styles.itemContainer}>
                <Image source={{ uri: item.url }} style={styles.itemImage} />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>

                  <Text style={styles.itemPrice}>R$ {item.price}</Text>
                  <Text style={styles.itemQuantity}>Quantidade: {item.quantity}</Text>
                </View>
              </View>
            )}
          />
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.button} onPress={createPDF}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center", // Alinha o ícone com o texto
            }}
          >
            <Text style={styles.buttonText}>Baixar PDF</Text>
            <Icon style={{ marginLeft: 10 }} name="file-pdf" size={15} color="red" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            navigation.navigate("Status", { orderId: order.id, order: order })
          }
        >
          <Text style={styles.buttonText}>Acompanhar Pedido</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.buttonText}>Voltar para a Tela Inicial</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#161616",
    alignItems: "center",
    justifyContent: "center",
  },

  contentContainer: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 15,
    marginTop: 5,
  },
 
  orderId: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "CourierPrime-Regular",
   
  },
  orderDate: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 5,
    fontFamily: "CourierPrime-Regular",
  },
  orderStatus: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 5,
    fontFamily: "CourierPrime-Regular",
  },
  totalPrice: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 15,
    fontFamily: "CourierPrime-Regular",
    backgroundColor: "#0f0f0f",
  },
  label: {
    marginVertical: 1,
    fontSize: 15,
    color: "#fff",
    fontFamily: "Circular",
  },
  sectionTitle: {
    marginTop: 10,
    fontSize: 18,
    color: "#fff",
    marginBottom: 5,
    fontFamily: "Circular",
  },
  itemContainer: {
    flexDirection: "row",
    marginBottom: 2,
    backgroundColor: "#212223",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 5,
  },
  itemImage: {
    width: 45,
    height: 45,
    borderRadius: 5,
    marginRight: 10,
    marginVertical: "auto",
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 5,
    fontFamily: "Circular",
  },

  itemPrice: {
    fontSize: 14,
    color: "yellow",
    marginBottom: 5,
    fontFamily: "Circular",
  },
  itemQuantity: {
    fontSize: 12,
    color: "#fff",
    fontFamily: "Circular",
  },
  actionsContainer: {
    padding: 15,
    borderTopWidth: 1,
    borderColor: "#333",
    width: "100%",
  },
  button: {
    backgroundColor: "#434343",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 5,
  },
  buttonText: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "Circular",
  },
  backButton: {
    backgroundColor: "#E64A19", // cor de destaque para o botão de voltar
  },
});
