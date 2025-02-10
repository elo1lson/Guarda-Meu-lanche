import React from "react";
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import GoBack from "../../components/Back";
import Icon from "react-native-vector-icons/FontAwesome5";
import Header from "../../components/Header";

export default function StatusScreen({ navigation, route }) {
  const { orderId, order } = route.params;

  // Etapas da barra de progresso
  const steps = [
    {
      label: "Pedido Criado",
      status: order.status === "created" ? "completed" : "not-started",
    },
    {
      label: "Recebido pela Lanchonete",
      status: order.status === "received" ? "in-progress" : "not-started",
    },
    {
      label: "Em Preparação",
      status: order.status === "preparing" ? "in-progress" : "not-started",
    },
    {
      label: "Pedido Entregue",
      status: order.status === "delivered" ? "completed" : "not-started",
    },
  ];

  return (
    <View style={styles.container}>
      <Header title={"Acompanhar pedido"} />

      <View style={styles.contentContainer}>
     
        <View style={styles.progressContainer}>
        {steps.map((step, index) => (
          <View key={index} style={styles.stepContainer}>
            {index > 0 && (
              <View
                style={[
                  styles.connector,
                  step.status === "completed" && styles.completedConnector,
                ]}
              ></View>
            )}
            <View
              style={[
                styles.stepCircle,
                step.status === "completed" && styles.completed,
                step.status === "in-progress" && styles.inProgress,
              ]}
            >
              {step.status === "completed" && <Text style={styles.stepText}>✔</Text>}
            </View>
            <Text
              style={[
                styles.stepLabel,
                step.status === "completed" && styles.completedText,
              ]}
            >
              {step.label}
            </Text>
          </View>
        ))}
      </View>
      </View>
 
      {/* Actions */}

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
    marginTop: 20,
  },

  progressContainer: {
    width: "100%",
    marginVertical: 0,
    textAlign: "left",
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    marginHorizontal:5
  },
  stepCircle: {
    width: 20,
    height: 20,
    borderRadius: 15,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  completed: {
    backgroundColor: "#4caf50", // verde para etapas completadas
  },
  inProgress: {
    backgroundColor: "#ff9800", // laranja para etapas em andamento
  },
  stepText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Circular", // fonte usada no seu projeto
  },
  stepLabel: {
    fontSize: 14,
    marginLeft: 10,
    color: "#fff",
    fontFamily: "Circular", // fonte usada no seu projeto
  },
  completedText: {
    color: "#4caf50", // texto em verde para etapas completadas
  },

  completedConnector: {
    backgroundColor: "#4caf50", // Conector verde para etapas completadas
  },

  orderId: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 5,
    fontFamily: "Circular",
  },
  orderStatus: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 5,
    fontFamily: "Circular",
  },
  orderDate: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 5,
    fontFamily: "Circular",
  },
  totalPrice: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 15,
    fontFamily: "Circular",
  },
  label: {
    fontWeight: "bold",
    color: "#fff",
  },
  sectionTitle: {
    marginTop: 10,
    fontSize: 18,
    color: "#fff",
    marginBottom: 5,
  },
  itemContainer: {
    flexDirection: "row",
    marginBottom: 10,
    backgroundColor: "#232323",
    borderRadius: 8,
    padding: 10,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 5,
    fontFamily: "Circular",
  },
  itemDesc: {
    fontSize: 14,
    color: "#aaa",
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
    fontSize: 14,
    color: "#fff",
    fontFamily: "Circular",
  },
});
