import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getAuth, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword  } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js';
import { addDoc, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js';
import { PDFDocument, rgb,StandardFonts  } from 'https://cdn.skypack.dev/pdf-lib'; // Importar pdf-lib para manipular PDFs


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

async function saveOrder(order,datosEmpresas,DatosProductosString) {
    try {
        const userId = await getUserId();
        if (order && userId) {
            order.UserId = userId;
            const ordersCollection = collection(db, 'ordenes');
            const docRef = await addDoc(ordersCollection, order);


            order.idOrden = docRef.id;
            await generarYGuardarPDF(order,datosEmpresas,DatosProductosString);
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

async function generarYGuardarPDF(orden, datosEmpresas, DatosProductosString) {
    try {
        const productLines = DatosProductosString.split('\n').filter(line => line.trim() !== '');
        const productTableBody = productLines.map(line => {
            const parts = line.split(',').map(part => part.split(':')[1].trim());
            return parts;
        });

        const subtotal = orden.total / 1.19;
        const iva = orden.total - subtotal;

        // Define las fuentes
        pdfMake.fonts = {
            Arial: {
                normal: 'http://localhost:5245/js/fonts/ARIAL.TTF',
                bold: 'http://localhost:5245/js/fonts/ARIALBD.TTF',
                italics: 'http://localhost:5245/js/fonts/ARIALI.TTF',
                bolditalics: 'http://localhost:5245/js/fonts/ARIALBI.TTF'
            }
        };

        const docDefinition = {
            content: [
                { text: 'FACTURA', style: 'header' },
                { text: `Orden de Compra: ${orden.idOrden}`, style: 'subheader' },
                {
                    style: 'tableExample',
                    table: {
                        widths: [150, '*'],
                        body: [
                            [{ text: 'Datos del Cliente', colSpan: 2, style: 'subheader', fillColor: '#ffff00' }, {}],
                            [{ text: 'Cliente:', fillColor: '#FFFF7F' }, `${orden.nombre}`],
                            [{ text: 'Fecha:', fillColor: '#FFFF7F' }, `${orden.fecha}`],
                            [{ text: 'Email:', fillColor: '#FFFF7F' }, `${orden.direccion}`],
                        ]
                    },
                    layout: {
                        fillColor: function (rowIndex, node, columnIndex) {
                            return (rowIndex === 0 || rowIndex === node.table.body.length - 1) ? '#eeeeee' : null;
                        },
                        hLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.body.length) ? 2 : 0.5;
                        },
                        vLineWidth: function (i) {
                            return 0.5;
                        },
                        hLineColor: function (i, node) {
                            return (i === 0 || i === node.table.body.length) ? 'black' : 'gray';
                        },
                        vLineColor: function (i) {
                            return 'black';
                        },
                        paddingLeft: function (i) {
                            return i === 0 ? 4 : 4;
                        },
                        paddingRight: function (i, node) {
                            return (i === node.table.widths.length - 1) ? 4 : 4;
                        }
                    },
                    margin: [0, 20]
                },
                {
                    style: 'tableExample',
                    table: {
                        widths: [150, '*'],
                        body: [
                            [{ text: 'Datos de la Empresa', colSpan: 2, style: 'subheader', fillColor: '#ffff00' }, {}],
                            [{ text: 'Empresa:', fillColor: '#FFFF7F' }, `${datosEmpresas.nombreEmpresa}`],
                            [{ text: 'RUT:', fillColor: '#FFFF7F' }, `${datosEmpresas.rutEmpresa}`],
                            [{ text: 'Dirección:', fillColor: '#FFFF7F' }, `${datosEmpresas.direccionEmpresa}`],
                            [{ text: 'Teléfono:', fillColor: '#FFFF7F' }, `${datosEmpresas.telefonoEmpresa}`]
                        ]
                    },
                    layout: {
                        fillColor: function (rowIndex, node, columnIndex) {
                            return (rowIndex === 0 || rowIndex === node.table.body.length - 1) ? '#eeeeee' : null;
                        },
                        hLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.body.length) ? 2 : 0.5;
                        },
                        vLineWidth: function (i) {
                            return 0.5;
                        },
                        hLineColor: function (i, node) {
                            return (i === 0 || i === node.table.body.length) ? 'black' : 'gray';
                        },
                        vLineColor: function (i) {
                            return 'black';
                        },
                        paddingLeft: function (i) {
                            return i === 0 ? 4 : 4;
                        },
                        paddingRight: function (i, node) {
                            return (i === node.table.widths.length - 1) ? 4 : 4;
                        }
                    },
                    margin: [0, 20]
                },
                {
                    style: 'tableExample',
                    table: {
                        headerRows: 1,
                        widths: [70, '*', 100, 100],
                        body: [
                            ['Cantidad', 'Producto', 'Precio Unit.', 'Total'].map(header => ({ text: header, style: 'tableHeader', fillColor: '#ffff00' })),
                            ...productTableBody.map(row => [
                                row[0],
                                row[1],
                                { text: `$${row[2]}`, alignment: 'right' },
                                { text: `$${row[3]}`, alignment: 'right' }
                            ])
                        ]
                    },
                    layout: {
                        hLineWidth: function (i, node) {
                            return (i === 0 || i === node.table.body.length) ? 2 : 0.5;
                        },
                        vLineWidth: function (i) {
                            return 0.5;
                        },
                        hLineColor: function (i, node) {
                            return (i === 0 || i === node.table.body.length) ? 'black' : 'gray';
                        },
                        vLineColor: function (i) {
                            return 'black';
                        },
                        paddingLeft: function (i) {
                            return i === 0 ? 4 : 4;
                        },
                        paddingRight: function (i, node) {
                            return (i === node.table.widths.length - 1) ? 4 : 4;
                        }
                    },
                    margin: [0, 20]
                },
                {
                    columns: [
                        { text: `Subtotal: $${subtotal.toFixed(2)}`, alignment: 'right', width: '*', fontSize: 14, bold: true, margin: [0, 10], color: '#333' },
                        { text: `IVA (19%): $${iva.toFixed(2)}`, alignment: 'right', width: '*', fontSize: 14, bold: true, margin: [0, 10], color: '#333' },
                        { text: `Total: $${orden.total.toFixed(2)}`, alignment: 'right', width: '*', fontSize: 16, bold: true, margin: [0, 10], color: '#333' }
                    ],
                    margin: [0, 10]
                }
            ],
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 0, 0, 10],
                    color: '#000000'
                },
                subheader: {
                    fontSize: 14,
                    bold: true,
                    alignment: 'left',
                    margin: [0, 10, 0, 5],
                    color: '#000000'
                },
                tableHeader: {
                    bold: true,
                    fontSize: 12,
                    color: '#000000',
                    fillColor: '#ffff00'
                },
                tableExample: {
                    margin: [0, 5, 0, 15]
                }
            },
            defaultStyle: {
                font: 'Arial' // Especifica la fuente predeterminada aquí
            }
        };

        // Genera el PDF utilizando pdfMake
        const pdfDocGenerator = pdfMake.createPdf(docDefinition);

        // Convierte el PDF en blob y súbelo a Firebase Storage
        pdfDocGenerator.getBlob(async (blob) => {
            const fileName = `order-${orden.idOrden}.pdf`;
            const fileRef = ref(storage, 'ordenes/' + fileName);
            await uploadBytes(fileRef, blob);
            console.log(`PDF generado y guardado como ${fileName}`);
        });

    } catch (error) {
        console.error("Error generando o guardando el PDF: ", error);
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



