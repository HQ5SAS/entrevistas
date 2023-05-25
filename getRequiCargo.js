const fs = require('fs');
const { exportsDB } = require("./db");
const con = exportsDB();
const { spawn, ChildProcess } = require("child_process");

// let sqlVideo = "SELECT `aplicar_convocatorias_id` FROM defaultdb.entrevistas where requisicion IS NULL OR requisicion = ''"
let sqlVideo = "SELECT `aplicar_convocatorias_id` FROM defaultdb.entrevistas where aplicar_convocatorias_id = '396034840020119398'"


async function python_getInfo(content) {

    //subproceso python fn
    pythonProcess = spawn("python3", ["./zohoGetInf.py"]);
    var python_response = "";

    pythonProcess.stdout.on("data", function (data) {
    python_response += data
    });

    pythonProcess.stderr.on('data', function (data) {
    console.error(data.toString());
    })

    pythonProcess.stdout.on("end", function () {
    return python_response
    });
    pythonProcess.stdin.write(JSON.stringify(content));
    pythonProcess.stdin.end();

}

con.query(sqlVideo, async function (err, result){
    //si toma error imprimir en consola
    if(err) console.log(err); 
    for(index in result){
        var id_=result[index]["aplicar_convocatorias_id"];
        console.log(id_)
        //get id info
        list_= python_getInfo({ "key": "contenido", "id": id_ });
        console.log("RESULTADO ZOHO: "+list_)
        try{

            requi = list_;
             cargo = requi.pop();   
             try{
                var sqlUpdate = "UPDATE `entrevistas` SET `requisicion` = '"+requi+"', `cargo` = '"+cargo+"' WHERE (`aplicar_convocatorias_id` = '" + id_ + "');";
                await con.query(sqlUpdate, function (err, result) {
                      if (err) throw err;
                      console.log("guardado en db");
                    });
               }
               catch(err){
                console.log(err);
               } 
        }
        catch(err){
            console.log(err);
        }
        
        //para cada pregunta existente por entrevista crea ruta según parametrización (rutaDigitalocean/idRegistro_numeroPregunta.mp4)
       
        
  
      };
})

