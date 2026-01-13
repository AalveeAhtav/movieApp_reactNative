import { View, Text, ScrollView, Image, TouchableOpacity, Alert } from 'react-native'
import React, { use, useEffect, useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router'
import useFetch from '@/services/useFetch';
import { fetchMovieDetails } from '@/services/api';
import { icons } from '@/constants/icons';
import { checkIfSaved, deleteSavedMovie, getCurrentUser, saveMovie } from '@/services/appwrite';

interface MovieInfoProps {
  label: string;
  value: string | number | null | undefined;
}

const MovieInfo = ({ label, value }: MovieInfoProps) => (
  <View className="flex-col items-start justify-center mt-5">
    <Text className="text-light-200 font-normal text-sm">
      {label}
    </Text>
    <Text className="text-light-100 font-bold text-sm mt-2">
      {value || 'N/A'}
    </Text>
  </View>
)

const MovieDetails = () => {
  const { id } = useLocalSearchParams();

  const{ data:movie, loading } = useFetch(() => fetchMovieDetails(id as string));

  //state for state functionality
  const [isSaved, setIsSaved] = useState(false);
  const [savedDocId, setSavedDocId] = useState<string | null>(null); // to store doc id for deletion
  const [user, setUser] = useState<any>(null);

  //check save status when movie loads
  useEffect(() => {
    checkStatus();
  }, [id]);

  const checkStatus = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      if(currentUser) {
        const savedDoc = await checkIfSaved(currentUser.$id, Number(id));
        if(savedDoc) {
          setIsSaved(true);
          setSavedDocId(savedDoc.$id);
        } else {
          setIsSaved(false);
          setSavedDocId(null);
        }
      }
    } catch (error) {
      console.error("Error checking save status:", error);
    }
  }

  const toggleSave = async () => {
    if (!user) {
      Alert.alert(
        "Please login to save this movie",
        "You need to be logged in to save this movie."
      );
      return;
    }

    try {
      if (isSaved && savedDocId) {
        //unsave
        await deleteSavedMovie(savedDocId);
        setIsSaved(false);
        setSavedDocId(null);
      } else {
        //save
        const movieToSave = {
          id: Number(id),
          title: movie?.title || '',
          poster_path: movie?.poster_path || '',
          vote_average: movie?.vote_average || 0
        };

        const result = await saveMovie(user.$id, movieToSave as any);
        setIsSaved(true)
        setSavedDocId(result.$id);
      }
    } catch (error) {
      console.error("Error toggling save:", error);
      Alert.alert("Error", "Could not update saved status.");
    }
  }

  
  return (
    <View className="bg-primary flex-1">
      <ScrollView contentContainerStyle={{ paddingBottom: 90 }}>
        <View>
          <Image source= {{ uri: `https://image.tmdb.org/t/p/w500${movie?.poster_path}`}} className="w-full h-[550px]" resizeMode="stretch" />
        </View>

        <View className="flex-col items-start justify-center mt-5 px-5">
          <Text className="text-white font-bold text-xl">
            {movie?.title}
          </Text>

          <View className="flex-row items-center gap-x-1 mt-2">
            <Text className="text-light-200 text-sm">
              {movie?.release_date?.split('-')[0]}
            </Text>
            <Text className="text-light-200 text-sm"> | </Text>
            <Text className="text-light-200 text-sm">{movie?.runtime} min</Text>
          </View>

          <View className="flex-row items-center bg-dark-100 px-2 py-1 rounded-md gap-x-1 mt-2">
            <Image source={icons.star} className="size-4" />
            <Text className="text-white font-bold text-sm">{Math.round(movie?.vote_average ?? 0)} / 10</Text>
            <Text className="text-light-200 text-sm">({movie?.vote_count} votes)</Text>
          </View>

          <MovieInfo label="Overview" value={movie?.overview} />
          <MovieInfo label="Genres" value={movie?.genres?.map((genre) => genre.name).join(' · ') || 'N/A'} />
          
          <View className="flex flex-row justify-between gap-10">
            <MovieInfo label="Budget" value={`$${((movie?.budget ?? 0) / 100000)} million`} />
            <MovieInfo label="Revenue" value={`$${((movie?.revenue ?? 0) / 100000).toFixed(2)} million`} />
          </View>

          <MovieInfo label="Production Companies" value={movie?.production_companies?.map((company) => company.name).join(' · ') || 'N/A'} />
        </View>
      </ScrollView>

      <TouchableOpacity className="absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex flex-row justify-center items-center z-50" onPress={router.back}>
        <Image source={icons.arrow} className="size-5 mr-1 mt-0.5 rotate-180" tintColor="#fff" />
        <Text className="text-white font-semibold text-base">Go back</Text>
      </TouchableOpacity>

      {/* save button */}
      <TouchableOpacity
        onPress={toggleSave}
        className="absolute top-20 right-5 bg-dark-100/80 border border-white/10 px-4 py-2 flex-row items-center justify-center gap-x-2 rounded-full"
      >
        <Image 
          source={icons.save}
          className="size-6"
        />
        <Text className='text-white font-semibold text-sm '>
          {isSaved ? "Saved" : "Save"}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default MovieDetails