import { View, Text, ScrollView, Image } from 'react-native'
import React, { use } from 'react'
import { useLocalSearchParams } from 'expo-router'
import useFetch from '@/services/useFetch';
import { fetchMovieDetails } from '@/services/api';

const MovieDetails = () => {
  const { id } = useLocalSearchParams();

  const{ data:movie, loading } = useFetch(() => fetchMovieDetails(id as string));
  
  return (
    <View className="bg-primary flex-1">
      <ScrollView>
        <View>
          <Image source= {{ uri: `https://image.tmdb.org/t/p/w500${movie?.poster_path}`}} className="w-full h-[550px]" resizeMode="stretch" />
        </View>

        <View className="flex-col items-start justify-center mt-5 px-5">
          <Text className="text-white font-bold text-xl">
            {movie?.title}
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}

export default MovieDetails