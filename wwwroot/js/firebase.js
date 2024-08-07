import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getAuth, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js';
import { addDoc, collection, query, where, getDocs, updateDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js';
import { serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

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


export async function actualizarOrdenFirestore(idOrden, orden) {
    try {
        const ordenRef = doc(db, "ordenes", idOrden);
        await updateDoc(ordenRef, orden);

        console.log("Orden actualizada con éxito en Firestore");
        return true;
    } catch (error) {
        console.error("Error al actualizar la orden en Firestore:", error);
        return false;
    }
}

window.actualizarOrdenFirestore = actualizarOrdenFirestore;


export async function actualizarEmpresaFirestore(idOrden, empresa) {
    try {
        // Crea una consulta para encontrar el documento con el orderId específico
        const empresasRef = collection(db, "empresas");
        const q = query(empresasRef, where("orderId", "==", idOrden));

        // Ejecuta la consulta
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // Suponiendo que solo esperas un documento que coincida, actualiza el primer documento encontrado
            const documentToUpdate = querySnapshot.docs[0];
            await updateDoc(documentToUpdate.ref, empresa);
            console.log("Empresa actualizada con éxito en Firestore");
            return true;
        } else {
            console.log("No se encontró un documento con el orderId proporcionado.");
            return false;
        }
    } catch (error) {
        console.error("Error al actualizar la Empresa en Firestore:", error);
        return false;
    }
}

window.actualizarEmpresaFirestore = actualizarEmpresaFirestore;

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
            password: password
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


async function getdataempresas(idOrden) {
    try {
        // Referencia a la colección 'empresas'
        const empresasRef = collection(db, 'empresas');

        // Crear una consulta para obtener documentos donde 'orderId' sea igual a 'idOrden'
        const q = query(empresasRef, where('orderId', '==', idOrden));

        // Ejecutar la consulta
        const querySnapshot = await getDocs(q);

        // Verificar si hay resultados
        if (!querySnapshot.empty) {
            // Extraer y retornar los datos del primer documento encontrado
            const empresaData = querySnapshot.docs[0].data();
            return empresaData;
        } else {
            console.log("No matching documents found!");
            return null;
        }
    } catch (error) {
        console.error("Error getting documents: ", error);
        return null;
    }
}

window.getdataempresas = getdataempresas;




export async function getDataDeOrdenes(idOrden) {
    try {
        const docRef = doc(db, 'ordenes', idOrden);
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

window.getDataDeOrdenes = getDataDeOrdenes;

async function saveOrder(order, datosEmpresas, DatosProductosString) {
    try {
        const userId = await getUserId();
        if (order && userId) {
            order.UserId = userId;
            const ordersCollection = collection(db, 'ordenes');
            const docRef = await addDoc(ordersCollection, order);
            order.estado = "Por Entregar"; // o cualquier valor inicial que desees

            order.idOrden = docRef.id;
            await generarYGuardarPDF(order, datosEmpresas, DatosProductosString);

            // Añadir el campo "factura" con el valor "creada"
            order.factura = "creada";

            await setDoc(docRef, order, { merge: true });
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
                            [{ text: 'Direccion:', fillColor: '#FFFF7F' }, `${orden.direccion}`],
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
                        { text: `Subtotal: $${subtotal.toFixed(2)}`, alignment: 'right', width: '*', fontSize: 10, bold: true, margin: [0, 10], color: '#333' },
                        { text: `IVA (19%): $${iva.toFixed(2)}`, alignment: 'right', width: '*', fontSize: 10, bold: true, margin: [0, 10], color: '#333' },
                        { text: `Total: $${orden.total.toFixed(2)}`, alignment: 'right', width: '*', fontSize: 10, bold: true, margin: [0, 10], color: '#333' }
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


export async function NIcoDios(idOrden) {
    try {
        // Get a reference to the orders collection
        const orderssCollection = collection(db, 'ordenes');

        // Create a query against the collection
        const a = query(orderssCollection, where("idOrden", "==", idOrden));

        // Get all documents that match the query
        const querySnapshots = await getDocs(a);

        // Map each document to its data
        const orderss = querySnapshots.docs.map(doc => doc.data());

        // Return the list of orders
        return orderss;
    } catch (error) {
        console.error("Error getting user orders: ", error);
    }
}

window.NIcoDios = NIcoDios;


window.updateOrderStatusWithSetDoc = async function (orderId, newStatus) {
    console.log(`updateOrderStatusWithSetDoc called with orderId: ${orderId}, newStatus: ${newStatus}`);
    try {
        const { value: formValues } = await Swal.fire({
            title: "Escriba el Motivo del Rechazo",
            html:
                '<input id="swal-input1" class="swal2-input" placeholder="Motivo del Rechazo">',
            focusConfirm: false,
            preConfirm: () => {
                return [
                    document.getElementById('swal-input1').value,
                ];
            },
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            confirmButtonText: 'Submit',
        });
        if (formValues) {
            const [motivoRechazo] = formValues;
            const orderRef = doc(db, 'ordenes', orderId);
            await setDoc(orderRef, { estado: newStatus, motivoRechazo: motivoRechazo }, { merge: true });
            console.log(`Order ${orderId} updated to status ${newStatus} with reason ${motivoRechazo}`);

            if (newStatus === "Rechazado") {
                await handleRejectedOrder(orderId, motivoRechazo);
            } else {
                console.log(`No additional processing required for status ${newStatus}`);
            }
        }
    } catch (error) {
        console.error("Error updating order status: ", error);
    }


}



window.anuladooo = async function (orderId, newStatus) {
    console.log(`anuladooo called with orderId: ${orderId}, newStatus: ${newStatus}`);
    try {
        const { value: formValues } = await Swal.fire({
            title: "Escriba el Motivo del Rechazo",
            html:
                '<input id="swal-input1" class="swal2-input" placeholder="Motivo del Rechazo">',
            focusConfirm: false,
            preConfirm: () => {
                return [
                    document.getElementById('swal-input1').value,
                ];
            },
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            confirmButtonText: 'Submit',
        });
        if (formValues) {
            const [motivoRechazo] = formValues;
            const orderRef = doc(db, 'ordenes', orderId);
            await setDoc(orderRef, { estado: newStatus, motivoRechazo: motivoRechazo }, { merge: true });
            console.log(`Order ${orderId} updated to status ${newStatus} with reason ${motivoRechazo}`);

            if (newStatus === "Rechazado") {
                await handleRejectedOrder(orderId, motivoRechazo);
            } else {
                console.log(`No additional processing required for status ${newStatus}`);
            }
        }
    } catch (error) {
        console.error("Error updating order status: ", error);
    }

    
    try {
        // Paso 1: Obtener los datos de la orden desde Firestore
        const ordenDoc = await getDoc(doc(db, "ordenes", orderId));
        if (!ordenDoc.exists()) {
            console.log("No se encontró la orden!");
            return;
        }
        const orden = ordenDoc.data();

        // Paso 2: Obtener los datos de la empresa vinculada a la orden
        const empresasRef = collection(db, "empresas");
        const q = query(empresasRef, where("orderId", "==", orderId));
        const querySnapshot = await getDocs(q);
        let datosEmpresas = {};

        if (!querySnapshot.empty) {
            datosEmpresas = querySnapshot.docs[0].data();
        } else {
            console.log("No se encontró la empresa con el OrderId especificado!");
        }

        // Paso 3: Convertir los items de la orden en una cadena de texto
        let datosProductosString = orden.items.map(item => {
            // Proporcionar valores predeterminados en caso de que las propiedades estén indefinidas
            const cantidad = item.quantity || 0;
            const nombre = item.nombreProducto || 'Desconocido';
            const precio = item.cost || 0;
            const total = item.total || (cantidad * precio);
            
            return `Cantidad: ${cantidad}, Nombre: ${nombre}, Precio: ${precio}, Total: ${total}`;
        }).join('\n');

        // Paso 4: Verificar si el PDF ya existe en Firebase Storage y eliminarlo si es necesario
        const fileName = `order-${orderId}.pdf`;
        const fileRef = ref(storage, 'ordenes/' + fileName);
        try {
            await deleteObject(fileRef); // Intenta eliminar el archivo si existe
            console.log(`PDF existente eliminado: ${fileName}`);
        } catch (error) {
            console.log(`No existe un PDF previo o error al eliminar: ${error}`);
        }

        // Paso 5: Generar el PDF con la función generadora
        await generarpdfAnulado(orden, datosEmpresas, datosProductosString);

        // Paso 6: Actualizar el campo 'factura' de la orden en Firestore a 'RECTIFICADA'
        await updateDoc(doc(db, "ordenes", orderId), {
            factura: "RECTIFICADA"
        });
        console.log("Campo 'factura' actualizado a 'RECTIFICADA'");

    } catch (error) {
        console.error("Error actualizando o guardando el PDF: ", error);
    }

}

window.updateOrderStatusWithDelivery = async function (orderId, newStatus) {
    let imageUrl = null
    console.log(`updateOrderStatusWithDelivery called with orderId: ${orderId}, newStatus: ${newStatus}`);
    try {
        const { value: formValues } = await Swal.fire({
            title: "Ingresa tu Direccion y RUT",
            html:
                '<input id="swal-input1" class="swal2-input" placeholder="Direccion">' +
                '<input id="swal-input2" class="swal2-input" placeholder="Rut">',
            focusConfirm: false,
            preConfirm: () => {
                return [
                    document.getElementById('swal-input1').value,
                    document.getElementById('swal-input2').value
                ];
            },
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            confirmButtonText: 'Submit',
        });

        if (formValues) {
            const [direccion, rut] = formValues;
            const orderRef = doc(db, 'ordenes', orderId);
            await setDoc(orderRef, { estado: newStatus }, { merge: true });
            console.log(`Order ${orderId} updated to status ${newStatus}`);

            const { value: file } = await Swal.fire({
                title: "Select image",
                input: "file",
                inputAttributes: {
                    "accept": "image/*",
                    "aria-label": "Upload your profile picture"
                }
            });

            if (file) {
                const storageRef = ref(storage, `orders/${orderId}/${file.name}`);
                await uploadBytes(storageRef, file);
                imageUrl = await getDownloadURL(storageRef);
                console.log(`File ${file.name} uploaded to Firebase Storage.`);
            }

            if (newStatus === "Entregado") {
                await handleDeliveredOrder(orderId, direccion, rut, imageUrl);
            } else {
                console.log(`No additional processing required for status ${newStatus}`);
            }
        }
    } catch (error) {
        console.error("Error updating order status: ", error);
    }
}

async function handleRejectedOrder(orderId, motivoRechazo) {
    const historialRechazosCollection = collection(db, 'historialRechazos');
    const q = query(historialRechazosCollection, where("idOrden", "==", orderId));
    const querySnapshot = await getDocs(q);
    const existingRechazo = querySnapshot.docs[0];

    if (existingRechazo) {
        await setDoc(doc(db, 'historialRechazos', existingRechazo.id), {
            motivo: motivoRechazo,
            fecha: new Date().toISOString()
        }, { merge: true });
        console.log(`Rechazo actualizado en el historial para la orden ${orderId}`);
    } else {
        await addDoc(historialRechazosCollection, {
            motivo: motivoRechazo,
            fecha: new Date().toISOString(),
            idOrden: orderId
        });
        console.log(`Rechazo registrado en el historial para la orden ${orderId}`);
    }
}

async function handleDeliveredOrder(orderId, direccion, rut, imageUrl) {
    const entregasCollection = collection(db, 'entregas');
    const q = query(entregasCollection, where("idOrden", "==", orderId));
    const querySnapshot = await getDocs(q);
    const existingEntregas = querySnapshot.docs[0];

    if (existingEntregas) {
        await setDoc(doc(db, 'entregas', existingEntregas.id), {
            direccion: direccion,
            rut: rut,
            idOrden: orderId,
            imageUrl: imageUrl, // Guarda la URL de la imagen en la base de datos
            fecha: new Date().toISOString()
        }, { merge: true });
        console.log(`Entrega actualizado en el historial para la orden ${orderId}`);
    } else {
        await addDoc(entregasCollection, {
            direccion: direccion,
            rut: rut,
            idOrden: orderId,
            imageUrl: imageUrl, // Guarda la URL de la imagen en la base de datos
            fecha: new Date().toISOString()
        });
        console.log(`Entrega registrado en el historial para la orden ${orderId}`);
    }
}

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



async function getOrdenes(orderId) {
    try {
        // Get a reference to the empresas collection
        const empresasCollection = collection(db, 'ordenes');

        // Create a query against the collection
        const q = query(empresasCollection, where("orderId", "==", orderId));

        // Get all documents that match the query
        const querySnapshot = await getDocs(q);

        // Map each document to its data
        const empresas = querySnapshot.docs.map(doc => doc.data());

        // Return the first empresa (there should only be one)
        return empresas[0];
    } catch (error) {
        console.error("Error getting ordenes: ", error);
    }
}

window.getOrdenes = getOrdenes;

export async function logoutUser() {
    const auth = getAuth();
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out: ", error);
    }
}

window.getDeliveryDetails = async function (orderId) {
    try {
        // Get a reference to the entregas collection
        const entregasCollection = collection(db, 'entregas');

        // Create a query against the collection
        const q = query(entregasCollection, where("idOrden", "==", orderId));

        // Get all documents that match the query
        const querySnapshot = await getDocs(q);

        // Map each document to its data
        const entregas = querySnapshot.docs.map(doc => doc.data());

        // Return the first entrega (there should only be one)
        return entregas[0];
    } catch (error) {
        console.error("Error getting entrega: ", error);
    }
}

window.getHistorialRechazos = async function (orderId) {
    try {
        // Get a reference to the historialRechazos collection
        const historialRechazosCollection = collection(db, 'historialRechazos');

        // Create a query against the collection
        const q = query(historialRechazosCollection, where("idOrden", "==", orderId));

        // Get all documents that match the query
        const querySnapshot = await getDocs(q);

        // Map each document to its data
        const historialRechazos = querySnapshot.docs.map(doc => doc.data());

        // Return the list of rechazos
        return historialRechazos[0];
    } catch (error) {
        console.error("Error getting historial de rechazos: ", error);
    }
}

async function actualizarOrdenEnFirebase(idOrden, datosOrden) {
    const ordenRef = doc(db, 'ordenes', idOrden);
    try {
        await updateDoc(ordenRef, datosOrden);
        window.location.href = '/home';
        console.log("Orden actualizada con éxito");
    } catch (error) {
        console.error("Error actualizando la orden: ", error);
    }
}

window.actualizarOrdenEnFirebase = actualizarOrdenEnFirebase;

// Función para llamar desde Razor para obtener un array "items" de una orden específica por 'idOrden' en Firebase
async function getItemsFromOrdenById(idOrden) {
    try {
        // Referencia a la colección 'ordenes'
        const ordenesRef = collection(db, 'empresas');

        // Crear una consulta para obtener el documento específico por 'idOrden'
        const q = query(ordenesRef, where("orderId", "==", idOrden));

        // Ejecutar la consulta
        const querySnapshot = await getDocs(q);

        // Inicializar un array para almacenar los items de la orden específica
        let itemsArray = [];

        // Iterar sobre cada documento resultante (debería ser uno solo)
        querySnapshot.forEach((doc) => {
            // Verificar si el documento tiene un campo 'items'
            if (doc.data().items) {
                // Asignar los items del documento a 'itemsArray'
                itemsArray = doc.data().items;
            }
        });

        // Retornar el array 'itemsArray' con los items de la orden específica
        return itemsArray;
    } catch (error) {
        console.error("Error getting items from orden by id: ", error);
        return [];
    }
}

window.getItemsFromOrdenById = getItemsFromOrdenById;


window.logoutUser = logoutUser;


window.alertaSucces = function (message) {
    Swal.fire({  // Muestra una alerta con animación
        title: message,
        icon: 'success',
        confirmButtonText: 'OK'
    });
}


window.alertaError = function (message) {
    Swal.fire({  // Muestra una alerta con animación
        title: message,
        icon: 'error',
        confirmButtonText: 'OK'
    });
}


window.alertaLogin = function (message) {
    Swal.fire({  // Muestra una alerta con animación
        title: message,
        icon: 'success',
    });
}

async function actualizarYGuardarPDF(idOrden) {
    try {
        // Paso 1: Obtener los datos de la orden desde Firestore
        const ordenDoc = await getDoc(doc(db, "ordenes", idOrden));
        if (!ordenDoc.exists()) {
            console.log("No se encontró la orden!");
            return;
        }
        const orden = ordenDoc.data();

        // Paso 2: Obtener los datos de la empresa vinculada a la orden
        const empresasRef = collection(db, "empresas");
        const q = query(empresasRef, where("orderId", "==", idOrden));
        const querySnapshot = await getDocs(q);
        let datosEmpresas = {};

        if (!querySnapshot.empty) {
            datosEmpresas = querySnapshot.docs[0].data();
        } else {
            console.log("No se encontró la empresa con el OrderId especificado!");
        }

        // Paso 3: Convertir los items de la orden en una cadena de texto
        let datosProductosString = orden.items.map(item => {
            // Proporcionar valores predeterminados en caso de que las propiedades estén indefinidas
            const cantidad = item.quantity || 0;
            const nombre = item.nombreProducto || 'Desconocido';
            const precio = item.cost || 0;
            const total = item.total || (cantidad * precio);
            
            return `Cantidad: ${cantidad}, Nombre: ${nombre}, Precio: ${precio}, Total: ${total}`;
        }).join('\n');

        // Paso 4: Verificar si el PDF ya existe en Firebase Storage y eliminarlo si es necesario
        const fileName = `order-${idOrden}.pdf`;
        const fileRef = ref(storage, 'ordenes/' + fileName);
        try {
            await deleteObject(fileRef); // Intenta eliminar el archivo si existe
            console.log(`PDF existente eliminado: ${fileName}`);
        } catch (error) {
            console.log(`No existe un PDF previo o error al eliminar: ${error}`);
        }

        // Paso 5: Generar el PDF con la función generadora
        await generarYGuardarPDF(orden, datosEmpresas, datosProductosString);

        // Paso 6: Actualizar el campo 'factura' de la orden en Firestore a 'RECTIFICADA'
        await updateDoc(doc(db, "ordenes", idOrden), {
            factura: "RECTIFICADA"
        });
        console.log("Campo 'factura' actualizado a 'RECTIFICADA'");

    } catch (error) {
        console.error("Error actualizando o guardando el PDF: ", error);
    }
}

window.actualizarYGuardarPDF = actualizarYGuardarPDF;







async function generarpdfAnulado(orden, datosEmpresas, DatosProductosString) {
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
                            [{ text: 'Direccion:', fillColor: '#FFFF7F' }, `${orden.direccion}`],
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
                        { text: `Subtotal: $${subtotal.toFixed(2)}`, alignment: 'right', width: '*', fontSize: 10, bold: true, margin: [0, 10], color: '#333' },
                        { text: `IVA (19%): $${iva.toFixed(2)}`, alignment: 'right', width: '*', fontSize: 10, bold: true, margin: [0, 10], color: '#333' },
                        { text: `Total: $${orden.total.toFixed(2)}`, alignment: 'right', width: '*', fontSize: 10, bold: true, margin: [0, 10], color: '#333' }
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
            },
            background: [
                {
                    text: 'ANULADO',
                    color: 'red',
                    opacity: 0.3,
                    bold: true,
                    fontSize: 100,
                    angle: 45,
                    alignment: 'center',
                    margin: [0, 300]
                }
            ]
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

window.generarpdfAnulado = generarpdfAnulado;