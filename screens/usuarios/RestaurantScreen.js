import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import axios from "axios";
import { API_URL } from "@env";
import CupertinoFooter1 from "../../components/CupertinoFooter1";
import styles from "../../styles/usuarios/RestaurantScreen";

import Header from "../../components/Header";
import Loading from "../../components/Loading";
import NotFound from "../../components/404";

const RestaurantCard = ({ restaurant, navigation, areaId }) => (
  <TouchableOpacity
    onPress={() =>
      navigation.navigate("RestaurantHomeScreen", {
        name: restaurant.name,
        id: restaurant.id,
        logo: restaurant.logo,
        areaId,
      })
    }
    style={styles.card}
  >
    <View style={styles.cardContent}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image
          source={{ uri: restaurant.logo }}
          style={{ width: 50, height: 50, borderRadius: 8 }}
          onError={() =>
            console.error(`Erro ao carregar imagem da área ${restaurant.name}`)
          }
        />
        <Text style={styles.cardTitle}>{restaurant.name}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

export default function RestaurantsScreen({ navigation, route }) {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const areaId = route.params.id;

  const fetchAreas = async () => {
    try {
      const response = await axios.get(`${API_URL}/area/${areaId}/restaurants`);
      setAreas(response.data);
    } catch (error) {
      console.error("Erro ao carregar áreas: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  const renderContent = () => {
    if (loading) return <Loading />;

    if (areas.length > 0) {
      return areas.restaurants.map((restaurant, index) => (
        <RestaurantCard
          key={index}
          restaurant={restaurant}
          navigation={navigation}
          areaId={areaId}
        />
      ));
    }

    return <NotFound />;
  };

  return (
    <View style={styles.container}>
      <Header title="Lanchonetes" />
      <View style={styles.contentContainer}>
        <View
          style={{
            justifyContent: "flex-start",
            alignItems: "flex-start",
            width: "100%",
            marginVertical: 15,
          }}
        >
          <Text style={styles.text}>{areas.length} lanchonete(s)</Text>
        </View>
        {renderContent()}
      </View>
      <CupertinoFooter1
        style={styles.cupertinoFooter1}
        onPress={(route) => navigation.navigate(route)}
      />
    </View>
  );
}
