var request= require("request");

class AureFaceRec{

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
        
        apiCall(options,(err,data)=>{

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
                body: {
                    name: PersonName,
                    userData: 'User-provided data attached to the person.'
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
            headers: {
                'Content-Type': 'application/octet-stream',
                'Ocp-Apim-Subscription-Key' : process.env.key
                },
            body: img,
            json: true
        };

        this.apiCall(options,(err,data)=>{
            if(err){
                
                callback(err,null);
            }else{

                callback(null,data.persistedfaceId);

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
        const options = {
            uri: 'https://australiaeast.api.cognitive.microsoft.com/face/v1.0/detect',
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
            body:{
                "PersonGroupId": GroupId,
                "faceIds": FaceIds,
                "maxNumOfCandidatesReturned": 1,
                "confidenceThreshold": 0.5
            },
            headers: {
                'Content-Type': 'application/octet-stream',
                'Ocp-Apim-Subscription-Key' : process.env.key
            }

        }

        this.apiCall(options,(err,dat)=>{

            if(err){
                callback(err,null)
            }else{
                callback()
            }

        })



    }


    apiCall(options,callback){
        
        request(options, function (error, response, body) {
            if (error) {
                console.log(error);
                callback(error,null);
              
            }else{
                
                console.log(body);
                callback(null,JSON.parse(body));
              }
            
          });
    }

}