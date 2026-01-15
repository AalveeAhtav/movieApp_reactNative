import { Account, Client, Databases, ID, Query } from "react-native-appwrite";

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const METRICS_TABLE_ID = process.env.EXPO_PUBLIC_APPWRITE_METRICS_TABLE_ID!;
const SAVED_ID = process.env.EXPO_PUBLIC_APPWRITE_SAVED_ID!;

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

//initialize account
const account = new Account(client);

//function to create a new user account
export const createUser = async (email: string, password: string, username: string) => {
    try {
        // create a new account with a unique ID
        const newAccount = await account.create(ID.unique(), email, password, username);
        return newAccount;
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
}

//function to login an existing user
export const signIn = async (email: string, password: string) => {
    try {
        //create a session for the user
        const session = await account.createEmailPasswordSession(email, password);
        return session;
    } catch (error) {
        console.error("Error logging in:", error);
        throw error;
    }
}

//function to get the currently logged in user
export const getCurrentUser = async () => {
    try {
        //retrieve the current user details
        const user = await account.get();
        return user;
    } catch (error) {
        // If there is no active session, account.get() throws an error.
        // We catch it and return null to indicate no user is logged in.
        return null;
    }
}

//function to log out the current user
export const signOut = async () => {
    try {
        //delete the current session
        const result = await account.deleteSession('current');
        return result;
    } catch (error) {
        console.error("Error logging out:", error);
        throw error;
    }
}

//function to save a movie
export const saveMovie = async (userID: string, movie: Movie) => {
    try {
        const result = await databases.createDocument(DATABASE_ID, SAVED_ID, ID.unique(), {
            user_id: userID,
            movie_id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            vote_average: movie.vote_average,
        });
        return result;
    } catch (error) {
        console.error("Error saving movie:", error);
        throw error;
    }
}

//function to get saved movies for a specific user
export const getSavedMovies = async (userId: string) => {
    try {
        // list documents from the saved movies table
        const result = await databases.listDocuments(DATABASE_ID, SAVED_ID, [
            //filter documents by user_id
            Query.equal('user_id', userId)
        ]);
        return result.documents;
    } catch (error) {
        console.error("Error getting saved movies:", error);
        throw error;
    }
}

//function to check if a specific movie is already saved by the user
export const checkIfSaved = async (userId: string, movieId: number) => {
    try {
        const result = await databases.listDocuments(DATABASE_ID, SAVED_ID, [
            Query.equal('user_id', userId),
            Query.equal('movie_id', movieId)
        ]);

        //Return the document if exists, otherwise null
        if (result.documents.length > 0) {
            return result.documents[0];
        }
        return null;
    } catch (error) {
        console.error("Error checking if movie is saved:", error);
        return null;
    }
}

//Function to remove a saved movie
export const deleteSavedMovie = async (documentId: string) => {
    try {
        const result = await databases.deleteDocument(DATABASE_ID, SAVED_ID, documentId);
        return result;
    } catch (error) {
        console.error("Error deleting saved movie:", error);
        throw error;
    }
}