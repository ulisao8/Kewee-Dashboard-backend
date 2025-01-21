module.exports = {
    fileErrors : {
        ONLY_PDF_ALLOWED : "Solo archivos .pdf permitidos",
        ERROR_ON_LOAD_FILE : "Ha ocurrido un error al hacer público el archivo",
        FILE_NOT_IN_REQUEST: "Archivo no cargado",
        ERROR_TO_GET_FILES: "Error al obtener los archivos"
    },
    authErrors: {
        GENERIC_ERROR: "Se ha producido un error",
        WRONG_CREDENTIALS: "Correo electrónico y contraseña son obligatorios",
        USER_NOT_FOUND: "Usuario no encontrado",
        CLAIMS_ERROR : "Error seteando claims al usuario con uid:",
        CREATE_USER_ERROR: "Error creando usuario en Auth:",
        FIRESTORE_USER_ERROR: "Error guardando usuario en Firestore:"
    },
    userErrors: {
        USERS_NOT_FOUND: "No se han encontrado registros"
    }
}