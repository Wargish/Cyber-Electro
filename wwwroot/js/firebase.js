import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getAuth, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword  } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js';
import { addDoc, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js';
import { PDFDocument, rgb } from 'https://cdn.skypack.dev/pdf-lib'; // Importar pdf-lib para manipular PDFs



const firebaseConfig = {
  apiKey: "AIzaSyCpfbHSHQA_0VgrdNCvMQKc1D1DrNa49RM",
  authDomain: "cyber-electro-d346e.firebaseapp.com",
  projectId: "cyber-electro-d346e",
  storageBucket: "cyber-electro-d346e.appspot.com",
  messagingSenderId: "861266125481",
  appId: "1:861266125481:web:5cef68a1d2a197e3713fb8",
  measurementId: "G-9XFW22X5CD"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

async function descargarPDF(ordenDeCompraId) {
    // Asegúrate de usar la referencia de storage correcta importada de Firebase
    const storageRef = getStorage(app);

    // Construye la referencia al archivo PDF específico en el directorio 'orders/'
    const pdfRef = ref(storageRef, 'ordenes/order-' + ordenDeCompraId + '.pdf');

    try {
        // Obtiene la URL de descarga del archivo PDF
        const url = await getDownloadURL(pdfRef);
        // Abre el PDF en una nueva pestaña del navegador
        window.open(url, '_blank');
    } catch (error) {
        console.error('Error al descargar el archivo:', error);
    }
}

window.descargarPDF = descargarPDF;


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

async function saveOrder(order,datosExtras,datosItems) {
    try {
        const userId = await getUserId();
        if (order && userId) {
            order.UserId = userId;
            const ordersCollection = collection(db, 'ordenes');
            const docRef = await addDoc(ordersCollection, order);


            order.idOrden = docRef.id;
            await generarYGuardarPDF(order,datosExtras,datosItems);
            await setDoc(docRef, order);
            return docRef.id;
            
        } else {
            console.error("Order or UserId is undefined");
        }
    } catch (error) {
        console.error("Error saving order: ", error);
    }
}
window.saveOrder = saveOrder;

// Función para generar y guardar el PDF en Firebase Storage
// Función para generar y guardar el PDF en Firebase Storage
// Función para generar y guardar el PDF en Firebase Storage
async function generarYGuardarPDF(orden, datosExtras,datosItems) {
    try {
        // Crear un nuevo documento PDF
        const doc = await PDFDocument.create();
        
        // Crear una nueva página
        const page = doc.addPage();
        
        // Definir el contenido inicial del PDF con la información de la orden
        let content = `Orden de Compra:
            - Fecha: ${orden.fecha}
            - ID de Orden: ${orden.idOrden}
            - Usuario ID: ${orden.UserId}
            - Dirección de Email: ${orden.direccion}
            - Total: ${orden.total}
            
            Items:\n`;
        
        // Agregar cada item a la lista en el PDF
        orden.items.forEach((item, index) => {
            content += `\t${index + 1}. ${item.NombreProducto} - Cantidad: ${item.Quantity} - Precio unitario: ${item.Cost}\n`;
        });

        // Agregar datos extras al contenido del PDF
        if (datosExtras) {
            content += `
            Datos adicionales:
            - Nombre Empresa: ${datosExtras.nombreEmpresa}
            - Rut Empresa: ${datosExtras.rutEmpresa}
            - Dirección Empresa: ${datosExtras.direccionEmpresa}
            - Teléfono Empresa: ${datosExtras.telefonoEmpresa}
            `;
        }

        if (datosItems) {
            content += `
            Datos adicionales:
            - Nombre Producto: ${datosItems.NombreProducto}
            `;
        }

        // Añadir contenido al documento
        page.drawText(content, {
            x: 50,
            y: 500,
            size: 12,
            color: rgb(0, 0, 0),
        });
        
        // Guardar el PDF en el storage de Firebase
        const pdfBytes = await doc.save();
        const fileName = `order-${orden.idOrden}.pdf`;
        const fileRef = ref(storage, 'ordenes/' + fileName); // Directorio 'ordenes' dentro del storage
        await uploadBytes(fileRef, pdfBytes);

        console.log(`PDF generado y guardado como ${fileName}`);
    } catch (error) {
        console.error("Error generating or saving PDF: ", error);
    }
}

window.generarYGuardarPDF = generarYGuardarPDF;


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



