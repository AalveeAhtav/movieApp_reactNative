import { Client, Databases, ID, Query } from "react-native-appwrite";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const METRICS_TABLE_ID = process.env.EXPO_PUBLIC_APPWRITE_METRICS_TABLE_ID!;

const client = new Client()
    .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!) // API Endpoint
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!); // project ID

const databases = new Databases(client);

export const updateSearchCount = async (query: string, movie: Movie) => {
    try {
        const result = await databases.listDocuments(DATABASE_ID, METRICS_TABLE_ID, [
            Query.equal('searchTerm', query)
        ]);

        if (result.documents.length > 0) {
            const doc = result.documents[0];
            await databases.updateDocument(DATABASE_ID, METRICS_TABLE_ID, doc.$id, {
                count: doc.count + 1
            });
        } else {
            await databases.createDocument(DATABASE_ID, METRICS_TABLE_ID, ID.unique(), {
                searchTerm: query,
                count: 1,
                movie_id: movie.id,
                title: movie.title,
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            });
        }
    } catch (error) {
        console.error("Error updating search count:", error);
        throw error;
    }
}

export const getTrendingMovies = async (): Promise<TrendingMovie[] | undefined> => {
    try {
        const result = await databases.listDocuments(DATABASE_ID, METRICS_TABLE_ID, [
            Query.orderDesc('count'),
            Query.limit(5),
        ]);
        return result.documents as unknown as TrendingMovie[];
    } catch (error) {
        console.error("Error fetching trending movies:", error);
        throw error;
    }
}