import { Stack } from "expo-router";
import './globals.css';
import { StatusBar } from "react-native";
import GlobalProvider from "@/lib/GlobalProvider";

export default function RootLayout() {
  return ( 
    <GlobalProvider>
        <StatusBar hidden={true} />
        <Stack >
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="movies/[id]"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
    </GlobalProvider>
  )
}
