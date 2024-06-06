import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getAuth, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword  } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { addDoc, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyCpfbHSHQA_0VgrdNCvMQKc1D1DrNa49RM",
  authDomain: "cyber-electro-d346e.firebaseapp.com",
  projectId: "cyber-electro-d346e",
  storageBucket: "cyber-electro-d346e.appspot.com",
  messagingSenderId: "861266125481",
  appId: "1:861266125481:web:5cef68a1d2a197e3713fb8",
  measurementId: "G-9XFW22X5CD"
};

// Get a reference to the authentication service
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function registerUser(email, password) {
    try {
        const auth = getAuth();
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        return user.uid; // Devuelve el ID del usuario
    } catch (error) {
        console.error("Error registering user: ", error);
    }
}

window.registerUser = registerUser;


export async function saveAdditionalData(uid, nombre, direccion, telefono, email, password) {
    try {
        // Almacenar la información adicional del usuario en Firestore
        await setDoc(doc(db, 'usuarios', uid), {
            uid: uid,
            nombre: nombre,
            direccion: direccion,
            telefono: telefono,
            email: email,
            password : password
        });
    } catch (error) {
        console.error("Error saving additional data: ", error);
    }
}
window.saveAdditionalData = saveAdditionalData;



export async function loginUser(email, password) {
    const auth = getAuth();
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        localStorage.setItem('userId', userCredential.user.uid);
        return userCredential.user.uid;
    } catch (error) {
        console.error("Error signing in: ", error);
        Swal.fire({
            title: 'Error',
            text: 'Usuario o contraseña incorrectos',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        throw error;
    }
}

window.loginUser = loginUser;

async function getUserId() {
    return await localStorage.getItem('userId');
}


export async function getAdditionalData(uid) {
    try {
        const docRef = doc(db, 'usuarios', uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            console.log("No such document!");
        }
    } catch (error) {
        console.error("Error getting document: ", error);
    }
}

window.getAdditionalData = getAdditionalData;

async function saveOrder(order) {
    try {
        // Fetch the user ID asynchronously
        const userId = await getUserId();

        // Check if order and user ID are defined
        if (order && userId) {
            // Set the user ID in the order object
            order.UserId = userId;

            // Store the order in Firestore
            const ordersCollection = collection(db, 'ordenes');
            const docRef = await addDoc(ordersCollection, order);

            // Add the ID of the created document to the order object
            order.idOrden = docRef.id;

            // Update the order in Firestore with the new idOrden
            await setDoc(docRef, order);

            // Return the ID of the created document
            return docRef.id;
        } else {
            console.error("Order or UserId is undefined");
        }
    } catch (error) {
        console.error("Error saving order: ", error);
    }
}
window.saveOrder = saveOrder;

async function saveEmpresa(empresas, orderId) {
    try {
        // Check if empresa is defined
        if (empresas) {
            // Add the order ID to the empresa object
            empresas.orderId = orderId;

            // Store the empresa in Firestore
            const empresasCollection = collection(db, 'empresas');
            await addDoc(empresasCollection, empresas);
        } else {
            console.error("Empresa is undefined");
        }
    } catch (error) {
        console.error("Error saving empresa: ", error);
    }
}

window.saveEmpresa = saveEmpresa;


export async function getUserOrders(userId) {
    try {
        // Get a reference to the orders collection
        const ordersCollection = collection(db, 'ordenes');

        // Create a query against the collection
        const q = query(ordersCollection, where("UserId", "==", userId));

        // Get all documents that match the query
        const querySnapshot = await getDocs(q);

        // Map each document to its data
        const orders = querySnapshot.docs.map(doc => doc.data());

        // Return the list of orders
        return orders;
    } catch (error) {
        console.error("Error getting user orders: ", error);
    }
}

window.getUserOrders = getUserOrders;

async function getEmpresa(orderId) {
    try {
        // Get a reference to the empresas collection
        const empresasCollection = collection(db, 'empresas');

        // Create a query against the collection
        const q = query(empresasCollection, where("orderId", "==", orderId));

        // Get all documents that match the query
        const querySnapshot = await getDocs(q);

        // Map each document to its data
        const empresas = querySnapshot.docs.map(doc => doc.data());

        // Return the first empresa (there should only be one)
        return empresas[0];
    } catch (error) {
        console.error("Error getting empresa: ", error);
    }
}
window.getEmpresa = getEmpresa;

export async function logoutUser() {
    const auth = getAuth();
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out: ", error);
    }
}

window.logoutUser = logoutUser;




window.alertaSucces = function(message) {
    Swal.fire({  // Muestra una alerta con animación
        title: message,
        icon: 'success',
        confirmButtonText: 'OK'
    });
}



window.alertaError = function(message) {
    Swal.fire({  // Muestra una alerta con animación
        title: message,
        icon: 'error',
        confirmButtonText: 'OK'
    });
}


window.alertaLogin = function(message) {
    Swal.fire({  // Muestra una alerta con animación
        title: message,
        icon: 'success',
    });
}



