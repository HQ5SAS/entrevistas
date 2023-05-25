const fs = require('fs');
const { exportsDB } = require("./db");
const con = exportsDB();
const { spawn, ChildProcess } = require("child_process");

let sqlVideo = "SELECT `aplicar_convocatorias_id` FROM defaultdb.entrevistas where cargo IS NULL OR requisicion = ''"

function python_getInfo(content) {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn("python3", ["./zohoGetInf.py"]);
      let python_response = "";
  
      pythonProcess.stdout.on("data", function (data) {
        python_response += data;
      });
  
      pythonProcess.stderr.on("data", function (data) {
        console.error(data.toString());
        reject(data.toString());
      });
  
      pythonProcess.stdout.on("end", function () {
        console.log(python_response);
        resolve(python_response);
      });
  
      pythonProcess.stdin.write(JSON.stringify(content));
      pythonProcess.stdin.end();
    });
  }

con.query(sqlVideo, async function (err, result){
    //si toma error imprimir en consola
    if(err) console.log(err); 
    for(index in result){
        var id_=result[index]["aplicar_convocatorias_id"];
        console.log(id_)
        //get id info    
        function proceso(){
            
            python_getInfo({ "key": "contenido", "id": id_ }).then((response) => {
                // Hacer algo con la respuesta de Python
                console.log(response);
                try{
                    // console.log("JSONParse: "+ requi)
                    //requi = cargo.pop();   
                    try{
                        var sqlUpdate = "UPDATE `entrevistas` SET `cargo` = '"+response+"' WHERE (`aplicar_convocatorias_id` = '" + id_ + "');";
                        con.query(sqlUpdate, function (err, result) {
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
              })

        }
        proceso( );
        
        //para cada pregunta existente por entrevista crea ruta según parametrización (rutaDigitalocean/idRegistro_numeroPregunta.mp4)
       
        
  
      };
})

