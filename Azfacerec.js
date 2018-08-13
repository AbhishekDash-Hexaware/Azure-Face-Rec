var request= require("request");
var fs= require("fs");
// var sleep = require("sleep");

class AzureFaceRec{

    constructor(){

        console.log("initializing AureFaceRec");

    }


    createGroup(GroupID,GroupName,GroupInfo,callback){

        var options = { 
                method: 'PUT',
                url: 'https://eastus.api.cognitive.microsoft.com/face/v1.0/persongroups/'+GroupID,
                headers: {
                    'Ocp-Apim-Subscription-Key': process.env.key,
                    'Content-Type': 'application/json'
                },
                body: {
                    name: GroupName,
                    userData: GroupInfo
                },
            json: true
        };
        
        this.apiCall(options,(err,data)=>{

            if(err){
                callback(err,null);
            }else{
                callback(null,"Success");
            }
        });
        

    }

    createPerson(PersonName,GroupID,callback){

        var options = {
                method: 'POST',
                url: `https://eastus.api.cognitive.microsoft.com/face/v1.0/persongroups/${GroupID}/persons`,
                headers: {
                    'Ocp-Apim-Subscription-Key': process.env.key,
                    'Content-Type': 'application/json'
                },
                body:{
                    "name": PersonName,
                    // "userData": "User-provided data attached to the person."
                },
            json: true
        };

        this.apiCall(options,(err,data)=>{

            if(err){

                callback(err,null);

            }else{

                callback(null,data.personId);
            }
        })
    }



    addFaceToPerson(img,personId,GruopId,callback){

        var options={
            url :`https://eastus.api.cognitive.microsoft.com/face/v1.0/persongroups/${GruopId}/persons/${personId}/persistedFaces`,
            method: 'POST',
            qs:{
                'returnFaceId': 'true',
                'returnFaceLandmarks': 'false'
            },
            headers: {
                'Content-Type': 'application/octet-stream',
                'Ocp-Apim-Subscription-Key' : process.env.key
                },
            body: img
        };

        this.apiCall(options,(err,data)=>{
            if(err){
                
                callback(err,null);
            }else{

                callback(null,data);

            }
        })
        

    }

    trainPersonGroup(groupId, callback) {
        var options = {
            method: 'POST',
            url: `https://eastus.api.cognitive.microsoft.com/face/v1.0/persongroups/${groupId}/train`,
            headers: {
                'Ocp-Apim-Subscription-Key': process.env.key
            }
        };

        this.apiCall(options, (err, data) => {
            if (err) {
                callback(err, null);
            } else {
                callback(null, "Successfully Trained");
            }
        });
    }

    faceDetect(img,callback) {
        // const imageUrl = fs.createReadStream("/Users/artrial/Desktop/azure_face_api/DataSet/" + filename);    
        console.log(process.env.key)
        const options = {
            uri: 'https://eastus.api.cognitive.microsoft.com/face/v1.0/detect',
            method:"POST",
            qs: {
                'returnFaceId': 'true',
                'returnFaceLandmarks': 'false'
            },
            body: img,
            headers: {
                'Content-Type': 'application/octet-stream',
                'Ocp-Apim-Subscription-Key' : process.env.key
            }
        };
        
        this.apiCall(options, (err, data) => {
            if (err) {
                callback(err, null);
            } else {
                callback(null,data);
            }
        });

    }

    faceRec(FaceIds,GroupId,callback){

        const options={

            uri:'https://eastus.api.cognitive.microsoft.com/face/v1.0/identify',
            method:"POST",
            body:{
                "PersonGroupId": GroupId,
                "faceIds": FaceIds,
                "maxNumOfCandidatesReturned": 1,
                "confidenceThreshold": 0.5
            },
            headers: {
                'Content-Type': 'application/json',
                'Ocp-Apim-Subscription-Key' : process.env.key
            }

        }

        this.apiCall(options,(err,data)=>{

            if(err){
                callback(err,null);
            }else{
                callback(null,data);
            }

        })
    }

    listAllPerson(GroupId,callback){
        var options={
            url:`https://eastus.api.cognitive.microsoft.com/face/v1.0/persongroups/${GroupId}/persons?top=1000`,
            method:"GET",
            headers: {
                'Content-Type': 'application/octet-stream',
                'Ocp-Apim-Subscription-Key' : process.env.key
            }
        }
        this.apiCall(options,(err,data)=>{
            if(err){
                callback(err,null)
            }else{
                callback(null,data);
            }
        })
    }


    apiCall(options,callback){
        
        request(options, function (error, response, body) {
            // console.log(typeof(body))
            // console.log(response.statusCode);
            if (error || response.statusCode!=200) {
                console.log("ERROR in calling API",body);
                callback(body,null);
              
            }else{
                
                // console.log(body);
                callback(null,body);
              }
            
          });
    }

}

  
  function dirCrawler(dir) {
    var recOb= new AzureFaceRec();

    // console.log(data);
    console.log(__dirname+"\\"+dir)
    var contents=fs.readdirSync(dir)
    console.log(contents.length);
    contents.forEach(function(content) {
        // console.log(__dirname+"\\"+dir+"\\"+content);
        // sleep.sleep(5);
        if (fs.statSync(__dirname+"\\"+dir+"\\"+content).isDirectory()) {
            //create personGroup
            recOb.createPerson(content,"testg9",(err,data)=>{
                    if(err){
                        console.log(err);
                    }else{
                        console.log("person ID",data);
                        
                        fs.readdir(__dirname+"\\"+dir+"\\"+content, (err, files) => {
                            if(err){
                                console.log("error in readining directory");
                            }else{
                                
                                    files.forEach(file => {
                                        var count=0
                                        console.log(file + "filename");
                                        // add face to personId
                                        const img = fs.createReadStream(__dirname+"\\"+dir+"\\"+content + "\\" + file);
                                        if(count<2){
                                        recOb.addFaceToPerson(img,data,"testg9",(err,data)=>{
                                                if(err) {
                                                    console.log(err)
                                                } else{
                                                    count++;
                                                    console.log(data)
                                                }
                                                
                                            })
                                        }

                                    });
                                // }
                                // console.log("====================");
                            }
                        });
                    }
                })
            
        }else {
            console.log("not a directory");
        }
    });   
    
}

dirCrawler("\loader");
// new AzureFaceRec().trainPersonGroup("testg9",(err,data)=>{
//     if(err){
//         console.log(err)
//     }else{
//         console.log(data)
//     }
    
// })
// const img = fs.createReadStream("D:\\Project\\Azure Face rec\\IMG_20171019_090708528.jpg");
// new AzureFaceRec().faceDetect(img,(err,data)=>{
//     if(err){
//         console.log(err)
//     }else{
//         console.log("FINAL RESULT",data);

//     }
    
// })


// new AzureFaceRec().faceRec("1021a32d-5132-41b5-a21a-865a5e701ee1","testg9",(err,data)=>{

//     if(err){
//         console.log(err)
//     }else{
//         console.log(data)
//     }

// })

//1021a32d-5132-41b5-a21a-865a5e701ee1


// recOb.createGroup("testg9","TestGroup9","Test Group for testing api calls",(err,data)=>{
//     if(err){
//         console.log(err);
//     }else{

//         dirCrawler("\photos1");
//     }







// new AureFaceRec().createGroup("testg2","TestGroup1","Test Group for testing api calls",(err,data)=>{
//     if(err){
//         console.log(err);;
//     }else{
//         console.log(data);
//     }
// });

// new AureFaceRec().createPerson("testp1","testg2",(err,data)=>{
//     if(err){
//         console.log(err);
//     }else{
//         console.log("person ID",data);
//     }
// })

// new AzureFaceRec().listAllPerson("testg2",(err,data)=>{
//     console.log(data);
// })
// console.log("path",__dirname+"\\"+"IMG_20171019_090708528.jpg");
// const img = fs.createReadStream("D:\\Project\\Azure Face rec\\IMG_20171019_090708528.jpg");
// console.log(img)
// new AureFaceRec().addFaceToPerson(img,"250900a4-db6d-42ae-8ab4-545d4995136f","testg2",(err,data)=>{
//     if(err){
//         console.log(err)
//     }else{
//         console.log(data)
//     }
    
// })


 




// face storage cost - 1000 - 16.53 
//17000 employee images per month- 289
//51002 each having one photo calls to store 
                            
