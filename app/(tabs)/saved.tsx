import { icons } from '@/constants/icons';
import { getCurrentUser, getSavedMovies } from '@/services/appwrite';
import { Link, router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';

//interface defining the structure of a saved movie
interface SavedMovie {
  $id: string;
  title: string;
  poster_path: string;
  movie_id: number;
  vote_average: number;
}

const Saved = () => {
  //state for storing the list of saved movies
  const [savedMovies, setSavedMovies] = useState<SavedMovie[]>([]);
  //state for loading
  const [loading, setLoading] = useState(true);
  // useFocusEffect runs everytime the user navigates to this screen
  useFocusEffect(
    useCallback(() => {
      fetchSavedMovies();
    }, [])
  );

  //function to retrieve saved movies from current user
  const fetchSavedMovies = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();

      //if no user is logged in, redirect to profile or show empty
      if (!user) {
        setSavedMovies([]);
        return;
      }

      //fetch movies from appwrite
      const movies = await getSavedMovies(user.$id);

      // Map Appwrite documents to our SavedMovie interface
      // cast 'as unknown' because Appwrite returns a generous Document type
      setSavedMovies(movies as unknown as SavedMovie[]);
    } catch (error) {
      console.error('Error fetching saved movies:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="bg-primary flex-1 px-5">
      <Text className="text-white text-3xl font-bold mt-32 mb-6">
        Saved Movies
      </Text>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#AB8FF" />
        </View>
      ) : savedMovies.length === 0 ? (
        // Empty state: show when no movies are saved
        <View>
          <Image source={icons.save} className='size-16' tintColor="#667" />
          <Text className='text-grey-500 text-lg'>
            No saved movies yet
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/')}
            className='bg-dark-100 px-6 py-3 rounded-lg border border-dark-200'>
            <Text className='text-white'>
              Explore Movies
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={savedMovies}
          keyExtractor={(item) => item.$id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 20 }}
          renderItem={({ item }) => (
            //Individual movie card
            <Link href={`/movies/${item.movie_id}`} asChild>
              <TouchableOpacity>
                <Image
                  source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }}
                  className="w-full h-64 rounded-xl"
                  resizeMode='cover'
                />
                <Text
                  className='text-white font-semibold mt-2 text-base'
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                {item.vote_average && (
                  <Text className='text-grey-400 text-xs'>
                    ⭐ {item.vote_average.toFixed(1)}
                  </Text>
                )}
              </TouchableOpacity>
            </Link>
          )}
        />
      )}
    </View>
  );
};

export default Saved