import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword  } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';


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



