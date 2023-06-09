const fs = require('fs');
const { exportsDB } = require("./db");
const path = require('path');
const con = exportsDB();
const {client}=require('./sftpConect.js')

//let sqlIds = "SELECT `id` FROM defaultdb.antecedentes where ruta IS NULL OR ruta = ''"
let sqlIds = "SELECT `id` FROM defaultdb.antecedentes where id = 8198 "
//const ruta="/mnt/entrevistavirtual/";

con.query(sqlIds, async function (err, result){
    //si toma error imprimir en consola
    if(err) console.log(err); 
    for(index in result){
        var id_=result[index]["id"];
        console.log(id_)
        //para cada pregunta existente por entrevista crea ruta según parametrización (rutaDigitalocean/idRegistro_numeroPregunta.mp4)
       try{
        let sqlPdf = "SELECT `consolidado` FROM defaultdb.evidencia_antecedentes WHERE id = ?";
        con.query(sqlPdf, [id_], function (error, res) {
            if (error) {
                console.log(error);
                return;
            }
        
            if (res.length > 0) {
                var base64Pdf = res[0]['consolidado'];
        
                if (typeof(base64Pdf) !== "object") {
                    async function createSaveFile(){
                        var pdfData = base64Pdf.replace(/^data:(.*?);base64,/, "");
                        pdfData = pdfData.replace(/ /g, '+');
                        //ruta de almecenamiento
                        path=`./transfdhq5/hunterx/${id_}.pdf`
                        tempFile=`${id_}.pdf`
                        fs.writeFile(tempFile, pdfData, 'base64', function(err) {
                            if (err) {
                                console.log(err);
                            } else {
                                async function createSaveFile(){
                                    await client.uploadFile(path,tempFile)
                                    console.log("done")
                                    fs.unlink(tempFile, (error) => {
                                        if (error) {
                                        console.log(`Error al eliminar el archivo: ${error}`);
                                        } else {
                                        console.log('Archivo eliminado correctamente.');
                                        }
                                    });
                                    var sqlUpdate = "UPDATE `antecedentes` SET `ruta`= '"+ path+ "' WHERE id = " + id_ + "');";
                                    con.query(sqlUpdate, function (err, result) {
                                        if (err) throw err;
                                    console.log("video guardado en db");
                                    });
                                    console.log("Archivo guardado exitosamente.");
                                }
                                createSaveFile();
                            }
                        });
                        
                    }
                    
                } else {
                    console.log("No hay archivo disponible.");
                }
            } else {
                console.log("No se encontraron resultados para la consulta.");
            }
        });     

       }
       catch(err){
        console.log(err);
       }
        
  
      };
})

