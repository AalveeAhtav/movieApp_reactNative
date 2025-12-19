import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'
import { icons } from '@/constants/icons'

const MovieCard = ({ id, poster_path, title, vote_average, release_date, original_language }: Movie) => {
  return (
    <Link href={`/movies/${id}`} asChild>
        <TouchableOpacity className="w-[30%]">
            <Image
                source={{
                    uri: poster_path ? `https://image.tmdb.org/t/p/w500${poster_path}` 
                    : 'https://placeholder.co/600x400/1a1a1a/ffffff/png',
                }}
                className="w-full h-52 rounded-lg"
                resizeMode="cover"
            />

            <Text className="text-sm font-bold text-white" numberOfLines={1}>{title}</Text>

            <View className="flex-row justify-start items-center gap-x-1">
                <Image source={icons.star} className="size-4"/>
                <Text className="text-xs text-white font-bold uppercase">{(vote_average).toFixed(2)}</Text>
            </View>

            <View>
                <Text className="text-xs text-light-300">{release_date}</Text>
                <Text className="text-xs text-yellow-600">{original_language}</Text>
                {/* <Text className="text-xs font-medium text-light-300 uppercase">Movie</Text> */}
            </View>

        </TouchableOpacity>
    </Link>
  )
}

export default MovieCard