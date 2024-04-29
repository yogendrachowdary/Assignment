import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Button,
  Image,
  StatusBar,
  SafeAreaView,
  ImageBackground,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import AsyncStorage from "@react-native-async-storage/async-storage";

WebBrowser.maybeCompleteAuthSession();

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const LoginScreen = ({ navigation }) => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "851901468183-aejdt6pf1gqcbqj1po6bulnu3fk2jolo.apps.googleusercontent.com",
    webClientId: "851901468183-5vdmdbos0g1r6470geka5rq57m8chs3n.apps.googleusercontent.com",
  });

  useEffect(() => {
    if (response?.type === "success") {
      navigation.navigate("Home", { userInfo: response });
    }
  }, [response, navigation]);

  const handleLoginAsGuest = () => {
    navigation.navigate("Home", { userInfo: { type: "guest" } });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground
        source={{ uri: "https://img.freepik.com/free-vector/login-concept-illustration_114360-739.jpg" }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.buttonContainer}>
          <Button
            title="Sign in with Google"
            onPress={() => promptAsync()}
            color="#4285F4"
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button title="Login as Guest" onPress={handleLoginAsGuest} color="#1DA1F2" />
        </View>
        <StatusBar style="auto" />
      </ImageBackground>
    </SafeAreaView>
  );
}
const HomeScreen = ({ route }) => {
  const { userInfo } = route.params;
  const [userInfoState, setUserInfoState] = useState(null);

  useEffect(() => {
    handleSignIn(userInfo);
  }, []);

  const handleSignIn = (userInfo) => {
    if (userInfo && userInfo.type === "guest") {
      // If guest user, assign a guest ID
      const guestUser = {
        id: Math.random().toString(36).substring(7),
        name: "Guest",
        profileImage: getRandomProfileImage(),
      };
      setUserInfoState(guestUser);
      AsyncStorage.setItem("@user", JSON.stringify(guestUser));
    } else if (userInfo && userInfo.type === "success") {
      // If signed in with Google, fetch user profile
      fetchUserProfile(userInfo.authentication.accessToken);
    }
  };

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch("https://www.googleapis.com/userinfo/v2/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = await response.json();
      const user = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        verified_email: userData.verified_email,
        profileImage: userData.picture,
      };
      setUserInfoState(user);
      AsyncStorage.setItem("@user", JSON.stringify(user));
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const getRandomProfileImage = () => {
    return "https://s3.amazonaws.com/images.seroundtable.com/google-links-1510059186.jpg";
  };

  const handleLogout = () => {
    setUserInfoState(null);
    AsyncStorage.removeItem("@user");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.welcomeText}>
        {userInfoState ? `Welcome, ${userInfoState.name}` : "Guest User"}
      </Text>
      {/* Display profile image */}
      {userInfoState && userInfoState.profileImage && (
        <Image
          source={{ uri: userInfoState.profileImage }}
          style={styles.profileImage}
        />
      )}
      <View style={styles.buttonContainer}>
        <Button title="Logout" onPress={handleLogout} color="#F44336" />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    marginVertical: 10,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginVertical: 20,
  },
});