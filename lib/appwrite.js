import { Account, Avatars, Client, Databases, ID, Query } from 'react-native-appwrite';

export const config = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.jsm.aora',
    projectId: '669b30b4002485bd403b',
    databaseId: '669b32e3001c36b479a3',
    userColectionId: '669b331800187e9c5fd8',
    videosColecionId: '669b33c9002e46e368d1',
    storageId: '669b34ee003b8c8cdb46'
}

const client = new Client();

client
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setPlatform(config.platform)

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

export const createUser = async (email, password, username) => {
    
    try {
        
        const newAccount = await account.create(
            ID.unique(),
            email,
            password,
            username
        )

        if(!newAccount) throw Error;

        const avatarURL = avatars.getInitials(username)

        await signIn(email, password);

        const newUser = await databases.createDocument(
            config.databaseId,
            config.userColectionId,
            ID.unique(),
            {
                accountId: newAccount.$id,
                email,
                username,
                avatar: avatarURL
            }
        )

        return newUser;

    } catch (error) {
        console.log(error)
        throw new Error(error)
    }
    
}

export const signIn = async (email, password) => {
    try {

        const session = await account.createEmailPasswordSession(email, password)
        return session;

    } catch (error) {
        throw new Error(error);
    }
}

export const getCurrentUser = async () => {
    try {
        
        const currentAccunt = await account.get();

        if(!currentAccunt) throw new Error;

        const currentUser = await databases.listDocuments(
            config.databaseId,
            config.userColectionId,
            [Query.equal('accountId', currentAccunt.$id)]
        )

        if(!currentUser) throw Error;

        return currentUser.documents[0];

    } catch (error) {
        console.log(error)
    }
}

export async function getAllPosts() {
    try {
        const posts = await databases.listDocuments(
        config.databaseId,
        config.videosColecionId
        );
    
        return posts.documents;
    } catch (error) {
        throw new Error(error);
    }
}

export async function getLatestPosts() {
    try {
        const posts = await databases.listDocuments(
        config.databaseId,
        config.videosColecionId,
        [Query.orderDesc('$createdAt', Query.limit(7))]
        );
    
        return posts.documents;
    } catch (error) {
        throw new Error(error);
    }
}

export async function searchPosts(query) {
    try {
      const posts = await databases.listDocuments(
        config.databaseId,
        config.videosColecionId,
        [Query.search("title", query)]
      );
  
      if (!posts) throw new Error("Something went wrong");
  
      return posts.documents;
    } catch (error) {
      throw new Error(error);
    }
}

export async function getUserPosts(userId) {
    try {
      const posts = await databases.listDocuments(
        config.databaseId,
        config.videosColecionId,
        [Query.equal("creator", userId)]
      );
  
      if (!posts) throw new Error("Something went wrong");
  
      return posts.documents;
    } catch (error) {
      throw new Error(error);
    }
}

export async function signOut() {
    try {
      const session = await account.deleteSession("current");
  
      return session;
    } catch (error) {
      throw new Error(error);
    }
}