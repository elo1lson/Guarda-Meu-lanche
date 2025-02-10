import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@env";
import axios from "axios";
import GoBack from "../../components/Back";

export default function CarrinhoScreen({ navigation }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState({});
  const [quantities, setQuantities] = useState({});
  const [visible, setVisible] = useState(false);

  const getCredentials = async () => {
    let rawCredentials = await AsyncStorage.getItem("credentials");
    let credentials = JSON.parse(rawCredentials);

    return credentials;
  };

  const handleClearCart = () => setCartItems([]);

  const updateItemOnDatabase = async (cart_id, restaurant_id, item) => {
    try {
      let credentials = await getCredentials();
      const token = credentials.token;
      const url = `${API_URL}/users/cart/${restaurant_id}`;

      const body = {
        cart_id,
        items: [{ id: item.menu_item_id, quantity: item.quantity }],
      };

      let response = await axios.patch(url, body, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Error updating item:", error.response?.data || error.message);
    }
  };

  const goToRestaurant = async (area_id, restaurant_id) => {
    try {
      const response = await axios.get(
        `${API_URL}/area/${area_id}/restaurants/${restaurant_id}`
      );

      const data = response.data;

      navigation.navigate("RestaurantHomeScreen", {
        name: data.name,
        id: data.id,
        logo: data.logo,
        areaId: area_id,
      });
    } catch (error) {
      console.log(error.response.data);
    }
  };

  const getMyCart = async () => {
    try {
      let credentials = await getCredentials();
      const token = credentials.token;
      const url = `${API_URL}/users/cart`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLoading(false);
      // console.log(JSON.stringify(response.data.cart, null, 2));
      setCartItems(response.data);

      const initialQuantities = {};
      const initialPrice = {};

      response.data.cart.forEach((item) => {
        item.items.forEach((i) => {
          // console.log(JSON.stringify(i, null, 2));
          initialQuantities[item.cart_id] = item.quantity;
        });
        initialQuantities[item.cart_id] = item.quantity;
        initialPrice[item.cart_id] = item.price * item.quantity; // Preço total baseado na quantidade
      });

      setQuantities(initialQuantities);
      setTotalPrice(initialPrice);

      // console.log(JSON.stringify(initialQuantities, null, 2));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getMyCart();
  }, []);

  const increaseQuantity = (cart_id, restaurant_id, item) => {
    // setQuantities((prev) => {
    //   const newQuantity = (prev[item.id] || item.quantity) + 1;
    //   return { ...prev, [item.id]: newQuantity };
    // });

    updateItemOnDatabase(Number(cart_id), restaurant_id, {
      menu_item_id: Number(item.menu_item_id),
      quantity: Number(item.quantity + 1),
    });

    getMyCart();
  };

  const decreaseQuantity = (cart_id, restaurant_id, item) => {
    updateItemOnDatabase(Number(cart_id), restaurant_id, {
      menu_item_id: Number(item.menu_item_id),
      quantity: Number(item.quantity - 1),
    });

    getMyCart();
  };

  const reserveItem = async (item) => {
    console.log(JSON.stringify(item, null, 2), "line 134");

    try {
      let credentials = await getCredentials();
      const token = credentials.token;

      const items = [];
      const body = {};
      body.restaurant_id = Number(item.restaurant_id);
      body.items = items;

      item.items.map((i) => {
        items.push({
          quantity: Number(i.quantity),
          menu_item_id: Number(i.menu_item_id),
        });
      });

      const url = `${API_URL}/orders/`;

      setLoading(true); // Ativa o loading

      const response = await axios
        .post(url, body, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((r) => {
          return r.data;
        })
        .catch((e) => {
          console.log(JSON.stringify(e.response.data, null, 2));
          return e.response.data;
        });

      setLoading(false); // Desativa o loading após a requisição

      if (response?.error) {
        alert(`O item "${item.name}" não foi reservado!`);
      }

      if (response.id) {
        navigation.navigate("Code", { order: response });
      }
    } catch (error) {
      console.log(error);
      setLoading(false); // Garante que o loading será desativado em caso de erro
    }
  };

  const handleConfirm = () => {
    setVisible(true);
    console.log("Confirmado!");
  };

  const handleCancel = () => {
    setVisible(false);
    console.log("Cancelado!");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <GoBack />
        <Text style={styles.title}>Carrinho</Text>
        <View style={{ flex: 1 }}>
          <TouchableOpacity onPress={handleConfirm}>
            <Text style={styles.clearText}>Limpar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Modal
          transparent={true}
          visible={visible}
          animationType="slide"
          onRequestClose={() => setVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>
                Tem certeza que quer deletar todos os items do carrinho?
              </Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={handleConfirm}>
                  <Text style={styles.confirmText}>Sim</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={handleCancel}>
                  <Text style={styles.cancelText}>Não</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        <FlatList
          data={cartItems.cart}
          keyExtractor={(item) => item.cart_id.toString()} // Usando o cart_id como chave
          renderItem={({ item }) => (
            <View>
              <View style={styles.sectionHeader}>
                <TouchableOpacity
                  key={item.restaurant_id}
                  onPress={() => goToRestaurant(item.restaurant_area, item.restaurant_id)} // Use uma função anônima
                >
                  <Text style={styles.sectionTitle}>{item.restaurant_name}</Text>
                </TouchableOpacity>
              </View>

              {item.items.map((i, index) => (
                <View style={styles.itemContainer}>
                  <View style={{ flexDirection: "row" }} key={i.id}>
                    <Image source={{ uri: i.image_url }} style={styles.itemImage} />
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemName}>{i.name}</Text>
                      <Text style={styles.itemDesc} numberOfLines={3}>
                        {i.desc}
                      </Text>
                      <Text style={styles.itemPrice}>R$ {i.price}</Text>
                      <View>
                        <View style={styles.quantitySelector}>
                          <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() =>
                              decreaseQuantity(item.cart_id, item.restaurant_id, i)
                            }
                          >
                            <Text style={styles.quantityButtonText}>-</Text>
                          </TouchableOpacity>
                          <Text style={styles.quantityText}>{i.quantity}</Text>
                          <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() =>
                              increaseQuantity(item.cart_id, item.restaurant_id, i)
                            }
                          >
                            <Text style={styles.quantityButtonText}>+</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
              {cartItems.length > 0 && (
                <View style={styles.buttonContainer}>
                  <Text style={styles.itemQuantity1}>
                    Preço dos items: R$ ${item.cart_value}
                  </Text>
                  <TouchableOpacity
                    style={styles.reserveButton}
                    onPress={() => reserveItem(item)}
                    disabled={loading} // Desativa o botão enquanto carrega
                  >
                    {loading ? (
                      <ActivityIndicator
                        style={styles.reserveButtonText}
                        size="13"
                        color="#fff"
                      />
                    ) : (
                      <Text style={styles.reserveButtonText}>Reservar</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#161616",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 0,
    marginRight: 20,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 15,
    marginTop: 0,
  },

  openButton: {
    padding: 10,
    backgroundColor: "#007BFF",
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "#161616",
    borderRadius: 8,
    alignItems: "center",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    fontFamily: "Circular",
    color: "#9c919c",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    marginHorizontal: 10,
    padding: 10,
    borderRadius: 5,
  },

  confirmText: {
    color: "#E64A19",
    fontSize: 14,
    fontFamily: "Circular",
  },
  cancelText: {
    color: "#aaa",
    fontSize: 14,
    fontFamily: "Circular",
  },

  title: {
    textAlign: "center",
    fontSize: 18,
    color: "#fff",
    fontFamily: "Circular",
    marginTop: 20,
    marginBottom: 20,
  },
  clearText: {
    color: "#FF5C5C",
    fontFamily: "Circular",
    marginRight: 0,
    textAlign: "right",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
  },
  locationImage: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  locationName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  locationArea: {
    fontSize: 14,
    color: "#555",
  },
  sectionHeader: {
    paddingBottom: 10,
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 14,
    color: "#fff",
    fontFamily: "Circular",
  },
  itemContainer: {
    marginBottom: 8,
    backgroundColor: "#232323",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  itemImage: {
    width: 50,
    height: 50,
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
    fontSize: 12,
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
    fontSize: 13,
    color: "#fff",
    fontFamily: "Circular",
    textAlign: "left",
  },
  itemQuantity1: {
    fontSize: 13,
    color: "yellow",
    fontFamily: "Circular",
    textAlign: "left",
  },
  footer: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  totalText: {
    fontSize: 14,
    fontFamily: "Circular",
    color: "green",
  },
  reserveButton: {
    backgroundColor: "green",
    padding: 5,
    borderRadius: 3,
    alignItems: "center",
  },
  reserveButtonText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Circular",
    width: 50,
    textAlign: "center",
  },
  quantitySelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom:10,
  },
  quantityButton: {
    backgroundColor: "#434343",
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 5,
  },
  quantityButtonText: {
    fontSize: 18,
    color: "whitesmoke",
    fontFamily: "Circular",
  },

  quantityText: {
    fontSize: 17,
    color: "whitesmoke",
    marginHorizontal: 15,
    fontFamily: "Circular",
  },
});
