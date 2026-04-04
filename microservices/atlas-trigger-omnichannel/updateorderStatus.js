exports = async function (changeEvent) {
  // Access the _id of the changed document:
  const docId = changeEvent.documentKey._id;
  // Use the standard App Services default for the linked MongoDB service
  const serviceName = "mongodb-atlas";
  const database = "leafy_popup_store";
  const collection = context.services.get(serviceName).db(database).collection(changeEvent.ns.coll);
  const MILLSECONDS_BETWEEN_STATUS_CHANGE = 10000 // 10 seconds between each status update
  const bopis = "BUYONLINE,PICKUPINSTORE"
  const home = "BUYONLINE,GETDELIVERYATHOME"

  // Helper function to sleep
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  try {
      const fullDocument = changeEvent.fullDocument;
      // Depending on the event type (insert or update), type might be in fullDocument or not
      // For updates without fullDocument, we skip since we don't have it unless preimages are on
      if (!fullDocument) {
          console.log("No full document available, exiting");
          return;
      }
      const type = fullDocument.type.toUpperCase().replace(/\s+/g, '')

      if (changeEvent.operationType === "insert") {
          let states = [];

          if (type === bopis) {
              states = ['Ready for pickup'];
          } else if (type === home) {
              states = ['Ready for delivery', 'Picked up from warehouse', 'In Transit', 'Delivered'];
          }

          // We use async/await here instead of loose setTimeout calls.
          // Atlas Functions exit automatically, so loose setTimeouts get cancelled
          // by awaiting, we force the Function execution isolate to stay alive.
          for (let index = 0; index < states.length; index++) {
              await sleep(MILLSECONDS_BETWEEN_STATUS_CHANGE);
              
              const state = states[index];
              const currentDateAsDouble = Number(Date.now());
              
              await collection.updateOne(
                  { _id: docId },
                  { $push: { 
                          status_history: { 
                              status: state, 
                              timestamp: currentDateAsDouble 
                          } 
                      } 
                  }
              );
              console.log(`Updated state to ${state}`);
          }
      }
      else if (changeEvent.operationType === "update") {
          // validate if the updated field is the status history 
          // the '.2' refers to the 3th index in the array of status which stands for the status 'Customer is in the store'
          if (type == bopis && changeEvent.updateDescription && changeEvent.updateDescription.updatedFields && changeEvent.updateDescription.updatedFields.hasOwnProperty("status_history.2")) {
              
              await sleep(MILLSECONDS_BETWEEN_STATUS_CHANGE);
              
              const currentDateAsDouble = Number(Date.now());
              let response = await collection.updateOne(
                  { _id: docId },
                  { $push: { 
                          status_history: { 
                              status: 'Completed', 
                              timestamp: currentDateAsDouble 
                          } 
                      }
                  }
              );
              console.log(JSON.stringify(response))
          }
      }
  } catch (err) {
      console.log("error performing mongodb write: ", err.message);
  }
};
