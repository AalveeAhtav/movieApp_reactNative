import { View, Text, Image, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native"
import { icons } from "@/constants/icons"
import { createUser, getCurrentUser, signIn, signOut } from "@/services/appwrite"
import React, { useEffect, useState } from "react"
import { Redirect, router } from "expo-router"

interface User {
    $id: string;
    email: string;
    name: string;
    [key: string]: any;
}

const Profile = () => {
    //state variables for managing user data and UI
    const [user, setUser] = useState<User | null>(null); // current logged in user
    const [loading, setLoading] = useState(true); // loading state
    const [isLoginMode, setIsLoginMode] = useState(true); // login or signup mode

    //signup forms
    //form input states
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    //efect to check for an existing user
    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            setLoading(true);
            const currentUser = await getCurrentUser();
            // if a user is found, update the state
            if (currentUser) {
                setUser(currentUser as User);
            }
        } catch (error) {
            console.log('No user logged in or error checking user');
        } finally {
            setLoading(false);
        }
    };

    //handle the user Login
    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Please fill in all fields');
            return;
        }

        try {
            setLoading(true);
            // attempt to create a session
            await signIn(email, password)

            //if successful, fecth user details and update UI
            const currentUser = await getCurrentUser();
            setUser(currentUser as User);
        } catch (error: any) {
            Alert.alert('Error logging in', error.message);
        } finally {
            setLoading(false);
        }
    };

    //handle the user Signup
    const handleSignup = async () => {
        if (!email || !password || !username) {
            Alert.alert('Please fill in all fields');
            return;
        }

        try {
            setLoading(true);
            //create the account first
            await createUser(email, password, username);

            //then automatically log them in
            await signIn(email, password);

            const currentUser = await getCurrentUser();
            setUser(currentUser as User);
            Alert.alert('Success', 'User created and logged in successfully');
        } catch (error: any) {
            Alert.alert('Error creating user', error.message);
        } finally {
            setLoading(false);
        }
    }

    //handle the user logout
    const handleLogout = async () => {
        try {
            setLoading(true);
            await signOut();
            setUser(null); //clear the user state and show the login form again
            setEmail('');
            setPassword('');
            setUsername('');
        } catch (error: any) {
            Alert.alert('Error logging out', error.message);
        } finally {
            setLoading(false);
        }
    }

    //render a loading screen while the app checks for a logged in user
    if (loading && !user && !email) {
        return (
            <View className="bg-primary flex-1 justify-center items-center">
                <Text className="text-white">
                    Loading...
                </Text>
            </View>
        )
    }

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-primary">
            <View className="flex-1 px-10 justify-center">

                {user ? (
                    //logged in view
                    <View className="items-center gap-10">
                        <View className="items-center gap-4">
                            {/* use Avatar Placeholder */}
                            <View className="size-24 bg-dark-100 rounded-full items-center justify-center">
                                <Image source={icons.person} className="size-12" tintColor="#AB8BFF" />
                            </View>

                            <View className="items-center">
                                <Text className="text-white text-2xl font-bold">{user.name}</Text>
                                <Text className="text-gray-400 text-base">{user.email}</Text>
                            </View>
                        </View>

                        //logout button
                        <TouchableOpacity
                            onPress={handleLogout}
                            className="bg-gray-800 p-4 rounded-lg items-center"
                        >
                            <Text className="text-white text-base font-semibold">Logout</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    //login /signup view
                    <View className="gap-6 w-full">
                        <View className="items-center mb-4">
                            <Image source={icons.person} className="size-16 mb-4" tintColor="#fff" />

                            <Text className="text-white text-3xl font-bold">
                                {isLoginMode ? 'Welcome back' : 'Create an account'}
                            </Text>

                            <Text className="text-gray-400 text-center mt-2">
                                {isLoginMode ? 'Please sign in to access your saved movies' : 'Sign up to save your favorite movies'}
                            </Text>
                        </View>

                        //Form fields
                    </View>
                )

                )}
            </View>
        </ScrollView>
    )
}

export default Profile;