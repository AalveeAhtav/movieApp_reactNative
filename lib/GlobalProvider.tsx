import { getCurrentUser } from "@/services/appwrite";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

//Defining the shape of the context data
interface GlobalContextType {
    isLogged: boolean;
    user: any;
    loading: boolean;
    refetch: (newParams?: any) => Promise<void>;
}

//Defining the shape of the user object
interface User {
    $id: string;
    name: string;
    email: string;
    avatar: string;
}

//Creating the context with an undefined default value
const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

interface GlobalProviderProps {
    children: ReactNode
}

export const GlobalProvider = ({ children }: GlobalProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    //Function to refetch the user data from appwrite
    const refetch = async () => {
        setLoading(true);
        try {
            //calling the service to get the current session
            const res = await getCurrentUser();
            if (res) {
                setUser(res as unknown as User); //If the user is logged in, set the user state
            } else {
                setUser(null); //If the user is not logged in, set the user state to null
            }
        } catch (error) {
            console.log("Error fetching user", error);
            setUser(null); //If there is an error, set the user state to null
        } finally {
            setLoading(false); //Set the loading state to false
        }
    };

    //Calling the refetch function on component mount
    useEffect(() => {
        refetch();
    }, []);

    return (
        <GlobalContext.Provider
            value={{
                isLogged: !!user,
                user,
                loading,
                refetch
            }}
        >
            {children}
        </GlobalContext.Provider>
    );
};

//Custom hook to use the global context
export const useGlobalContext = (): GlobalContextType => {
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error("useGlobalContext must be used within a GlobalProvider");
    }
    return context;
};

export default GlobalProvider;