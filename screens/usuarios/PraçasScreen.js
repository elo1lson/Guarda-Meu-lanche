import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { API_URL } from "@env";
import CupertinoFooter1 from "../../components/CupertinoFooter1";
import styles from "../../styles/usuarios/PraçasScreenStyles";
import Header from "../../components/Header";

export default function PraçasScreen({ navigation }) {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAreas = async () => {
    try {
      const response = await axios.get(`${API_URL}/area/`);

      setAreas(response.data.areas);
    } catch (error) {
      console.error("Erro ao carregar áreas: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  return (
    <View style={styles.container}>
      <Header title={"Praças de Alimentação"} />
      <View style={styles.contentContainer}>
        <View
          style={{
            justifyContent: "flex-start",
            alignItems: "flex-start",
            width: "100%",
            marginVertical: 15,
          }}
        >
          <Text style={styles.text}>{areas.length} Praça(s)</Text>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#fff"
            style={{ justifyContent: "center", alignItems: "center", flex: 1, zIndex: 1 }}
          />
        ) : (
          areas.map((area, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => navigation.navigate("Restaurants", { id: area.id })}
              style={styles.card}
            >
              <Image source={{ uri: area.image }} style={styles.image} />
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{area.name}</Text>
                <Text style={styles.cardDescription}>
                  {area.restaurant_count} lanchonete(s)
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      <CupertinoFooter1
        style={styles.cupertinoFooter1}
        onPress={(route) => navigation.navigate(route)}
      />
    </View>
  );
}
