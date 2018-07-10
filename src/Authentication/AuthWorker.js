/** @format */

import { AsyncStorage } from "react-native";
import * as firebase from "firebase";
import { remove, findIndex } from "lodash";
import WordpressApi from "./WordpressAPI";

const KEYS = {
  email: "_Email",
  user: "_User",
  posts: "_Post"
};

export default class AuthWorker {
  _firebaseApp = null;
  _authAPI = null;
  _useFirebase = false;
  _firebaseData = null;

  static init = ({ url, logo, useFirebase, firebaseData }) => {
    try {
      this._authAPI = new WordpressApi({
        url,
        logo
      });
      if (useFirebase) {
        AuthWorker.initFirebase(firebaseData);
        this._useFirebase = true;
        this._firebaseData = firebaseData;
      }

      console.log("init success auth", this._authAPI);
    } catch (error) {
      console.log(error);
    }
  };

  static initFirebase = ({
    apiKey,
    authDomain,
    databaseURL,
    storageBucket,
    projectId,
    messagingSenderId,
    readlaterTable
  }) => {
    try {
      this._firebaseApp = firebase.initializeApp({
        apiKey,
        authDomain,
        databaseURL,
        storageBucket,
        projectId,
        messagingSenderId,
        readlaterTable
      });

      console.log("init success firebase", this._firebaseApp);
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Check the user login data is existing on the app
   * @returns {boolean}
   */
  static isLogedIn = async () => {
    try {
      const value = await AsyncStorage.getItem(KEYS.user);

      // can also use this
      // AsyncStorage.getItem(KEYS.user).then((user_data_json) => {
      // 	let user_data = JSON.parse(user_data_json);
      // }
      return value !== null;
    } catch (error) {
      console.log("error isLogin", error);
    }
  };

  /**
   * create account with firebase
   * @param email
   * @param password
   * @param callBackFunc
   * @param onError
   */
  static createWithFirebase = async (
    email,
    password,
    callBackFunc,
    onError
  ) => {
    try {
      this._firebaseApp
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then(userData => {
          if (typeof callBackFunc === "function") {
            callBackFunc();
          }
          return AuthWorker.saveUser(userData, email);
        })
        .catch(error => {
          if (typeof onError === "function") {
            onError(error);
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Create the user login
   * @param email
   * @param password
   * @param callBackFunc
   * @param onError
   * @param isExisted
   */

  // #1
  static create = async (
    email,
    password,
    name,
    callBackFunc,
    onError,
    isExisted
  ) => {
    try {
      // existed on wordpress create with firebase
      if (isExisted) {
        AuthWorker.createWithFirebase(email, password, callBackFunc, onError);
      }
      // register on Wordpress site
      const wordpressRegisterd = await this._authAPI.register(
        email,
        password,
        name
      );

      if (
        typeof wordpressRegisterd.status !== "undefined" &&
        wordpressRegisterd.status === "ok"
      ) {
        if (this._useFirebase) {
          AuthWorker.createWithFirebase(email, password, callBackFunc, onError);
        } else {
          AuthWorker.saveUser(null, email);
          if (typeof callBackFunc === "function") {
            callBackFunc();
          }
        }
      } else {
        onError(wordpressRegisterd);
      }
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * login on both Wordpress and Firebase
   * @param email
   * @param password
   * @param callBackFunc
   */

  // #2
  static login = async (email, password, callBackFunc, onError) => {
    try {
      const wordpressLoggined = await this._authAPI.generateAuthCookie(
        email,
        password
      );

      if (
        typeof wordpressLoggined.status !== "undefined" &&
        wordpressLoggined.status == "ok"
      ) {
        const userData = wordpressLoggined;
        AuthWorker.saveUser(userData, email);

        // if enable user also save to Firebase
        if (this._useFirebase) {
          this._firebaseApp
            .auth()
            .signInWithEmailAndPassword(email, password)
            .then(() => {
              if (typeof callBackFunc === "function") {
                callBackFunc(userData);
              }
              return true;
            })
            .catch(error => {
              // if use not found on firebase, just create it for saving app data
              if (error.code === "auth/user-not-found") {
                return AuthWorker.create(
                  email,
                  password,
                  null,
                  callBackFunc,
                  onError,
                  true
                );
              }

              if (typeof onError === "function") {
                onError(error);
              }
            });
        } else if (typeof callBackFunc === "function") {
          callBackFunc(userData);
        }
      } else if (typeof onError === "function") {
        onError({ message: wordpressLoggined.error });
      }
    } catch (error) {
      console.log(error);
    }
  };

  static loginFacebook = async accessToken => {
    try {
      const auth = this._firebaseApp.auth();
      const credential = firebase.auth.FacebookAuthProvider.credential(
        accessToken
      );

      const data = await auth.signInAndRetrieveDataWithCredential(credential);

      let userEmail = data.email;
      if (userEmail == null) {
        userEmail = `${data.uid}@facebook.com`;
      }

      return this.saveUser(data, userEmail);
    } catch (error) {
      console.log(error);
    }
  };

  static loginGoogle = async input => {
    const auth = this._firebaseApp.auth();
    const credential = firebase.auth.GoogleAuthProvider.credential(
      input.idToken
    );
    const data = await auth
      .signInAndRetrieveDataWithCredential(credential)
      .catch(err => console.log(err));
    return AuthWorker.saveUser(data, input.user.email);
  };

  /**
   * Save user data to offline
   * @param userData
   * @param email
   */
  static saveUser = async (userData = {}, email) => {
    try {
      const isExisted = await AsyncStorage.getItem(KEYS.user);
      if(isExisted !== null){
        await AsyncStorage.removeItem(KEYS.user)
        await AsyncStorage.setItem(KEYS.user, JSON.stringify(userData));
      }
      await AsyncStorage.setItem(KEYS.email, email);
    } catch (error) {
      // console.log(error);
    }
  };

  /**
   * get read later user
   */
  static getUser = async () => {
    try {
      const userData = await AsyncStorage.getItem(KEYS.user);
      if (userData != null) {
        return JSON.parse(userData);
      }
    } catch (error) {}
  };

  static getPosts = async () => {
    const userPosts = await AsyncStorage.getItem(KEYS.posts);

    let postData = [];
    if (userPosts != null) {
      postData = JSON.parse(userPosts);
    }

    // if the offline data is null let check the online and sync back to the app
    if (postData.length == 0) {
      postData = await AuthWorker.getFirebasePost();
      AsyncStorage.setItem(KEYS.posts, JSON.stringify(postData));
    }

    return postData;
  };

  /**
   * Get the data from firebase
   * @returns {*|string|string}
   */
  static getFirebasePost = async () => {
    const userData = await AuthWorker.getUser();
    let postData = [];

    if (
      typeof userData !== "undefined" &&
      typeof userData.uid !== "undefined"
    ) {
      const data = await this._firebaseApp
        .database()
        .ref(`/${this._firebaseData.readlaterTable}/${userData.uid}`)
        .once("value");

      if (data.val() != null) {
        postData = data.val().post;
      }
    } else {
      // console.log('can not get user data');
    }

    return postData;
  };

  /**
   * Add the post to firebase
   * @param post
   */
  static firebaseSync = async postData => {
    const userData = await AuthWorker.getUser();

    if (
      typeof userData !== "undefined" &&
      typeof userData.uid !== "undefined"
    ) {
      this._firebaseApp
        .database()
        .ref(this._firebaseData.readlaterTable)
        .child(`${userData.uid}/post`)
        .set(postData);
    }
  };

  /**
   * Save read later post and sync to firebase
   * @param post
   */
  static savePost = async (post, fnc) => {
    if (typeof post === "undefined" || post == null) {
      return;
    }

    const userPosts = await AsyncStorage.getItem(KEYS.posts);
    let postData = [];
    if (userPosts != null) {
      postData = JSON.parse(userPosts);
    }

    const indexPost = findIndex(postData, data => {
      return data.id == post.id;
    });

    // not in the read later array yet
    if (indexPost == -1) {
      postData.push(post);

      // save to storage local
      await AsyncStorage.setItem(KEYS.posts, JSON.stringify(postData));

      if (typeof fnc === "function") {
        fnc();
      }

      // sync to firebase
      AuthWorker.firebaseSync(postData);
    }

    // console.log('save post', indexPost, post);
  };

  /**
   * remove read later post
   * @param post
   */
  static removePost = async post => {
    const userPosts = await AsyncStorage.getItem(KEYS.posts);
    let postData = [];
    if (userPosts != null) {
      postData = JSON.parse(userPosts);
    }
    const newPostData = remove(postData, data => {
      return data.id != post.id;
    });

    AsyncStorage.setItem(KEYS.posts, JSON.stringify(newPostData));

    // sync to firebase
    AuthWorker.firebaseSync(newPostData);
  };

  /**
   * Remove all read later post
   */
  static clearPosts = isSync => {
    // should remove online also
    if (typeof isSync !== "undefined") {
      AuthWorker.firebaseSync(null);
    }
    // console.log(AsyncStorage.getItem(KEYS.posts));
    AsyncStorage.getItem(KEYS.posts).then(data => {
      // console.log('data asyncStorage: ', data)
      if (data != null) {
        return AsyncStorage.multiRemove([KEYS.posts], error => {
          console.log(error);
        });
      }
    });
  };

  /**
   * Logout and delete all offline data
   */
  static logOut = () => {
    AsyncStorage.getItem(KEYS.user).then(data => {
      // console.log('data asyncStorage: ', data)
      if (data != null) {
        return AsyncStorage.multiRemove([KEYS.user], error => {
          console.log(error);
        });
      }
    });
  };
}
