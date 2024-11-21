exports = async function(changeEvent) {
    // Access the _id of the changed document:
    const docId = changeEvent.documentKey._id;
    const serviceName = ""; // your cluster name
    const database = ""; // your db name
    const collection = context.services.get(serviceName).db(database).collection(changeEvent.ns.coll);
    const MILLSECONDS_BETWEEN_STATUS_CHANGE = 10000
    try {
      if (changeEvent.operationType === "insert") {
        const fullDocument = changeEvent.fullDocument;
        const type = fullDocument.type;
        let states = [];
  
        if (type === "Buy Online, Pick up in store") {
          states = ['Ready for pickup'];
        } else if (type === "Buy Online, Get Delivery at Home") {
          states = ['Ready for delivered', 'Picked up from warehouse', 'In Transit', 'Delivered'];
        }
  
        let index = 0;
  
        const updateStatusHistory = async () => {
          if (index < states.length) {
            const state = states[index];
            const currentDateAsDouble = Number(Date.now());
            await collection.updateOne(
              { _id: docId },
              { $push: { status_history: { status: state, timestamp: currentDateAsDouble }  } }
            );
            index++;
            setTimeout(updateStatusHistory, MILLSECONDS_BETWEEN_STATUS_CHANGE); // Schedule the next update in 10 seconds
          }
        };
        
        // Start the update process after the initial delay
        setTimeout(updateStatusHistory, MILLSECONDS_BETWEEN_STATUS_CHANGE);
      }
    } catch (err) {
      console.log("error performing mongodb write: ", err.message);
    }
  };
  