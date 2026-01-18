import { clientPromise, dbName } from '@/lib/mongodb';

/**
 * Generate customer behavior data and next best actions
 * This function replicates the MongoDB Playground script functionality
 * @param {string} uid - User ID
 * @param {string} sid - Session ID
 * @param {boolean} useDelay - Whether to add delays between insertions (default: false for API usage)
 * @returns {Promise<Object>} Object containing inserted documents
 */
export async function generateCustomerBehaviorData(uid, sid, useDelay = false) {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    
    const customerBehaviourCollection = db.collection("customer_behaviour");
    const nextBestActionsCollection = db.collection("next_best_actions");

    let nbaIndex = 0; // pointer to next_best_actions array

    const customer_behaviour_docs = [
      {
        uid: uid,
        sid: sid,
        signalType: "exit-risk",
        signalVersion: 1,
        confidence: 0.82,
        severity: "high",
      },
      {
        uid: uid,
        sid: sid,
        signalType: "search-friction",
        signalVersion: 1,
        confidence: 0.82,
        severity: "high",
      },
      {
        uid: uid,
        sid: sid,
        signalType: "high-intent",
        signalVersion: 1,
        confidence: 0.82,
        severity: "high",
      },
      {
        uid: uid,
        sid: sid,
        signalType: "high-intent",
        signalVersion: 1,
        confidence: 0.82,
        severity: "high",
      },
      {
        uid: uid,
        sid: sid,
        signalType: "search-friction",
        signalVersion: 1,
        confidence: 0.82,
        severity: "high",
      },
      {
        uid: uid,
        sid: sid,
        signalType: "exit-intent",
        signalVersion: 1,
        confidence: 0.82,
        severity: "high",
      },
      {
        uid: uid,
        sid: sid,
        signalType: "high-intent", // Fixed typo from "huigh-intent"
        signalVersion: 1,
        confidence: 0.82,
        severity: "high",
      },
      {
        uid: uid,
        sid: sid,
        signalType: "high-intent",
        signalVersion: 1,
        confidence: 0.82,
        severity: "high",
      },
      {
        uid: uid,
        sid: sid,
        signalType: "exit-intent",
        signalVersion: 1,
        confidence: 0.82,
        severity: "high",
      },
      {
        uid: uid,
        sid: sid,
        signalType: "search-friction",
        signalVersion: 1,
        confidence: 0.82,
        severity: "high",
      },
    ];

    const next_best_actions = [
      {
        uid: uid,
        sid: sid,
        trigger: {
          customerBehaviourId: "671b00000000000000000001",
          signalType: "prolonged-browsing"
        },
        action: {
          type: "product-recommendation",
          title: "Still deciding? You might also like this",
          message: "Based on your recent browsing, this modern towel rack might be a great match.",
          product: {
            productId: "67192b3f64d161905fbe7795",
            productName: "AmazonBasics Modern Towel Rack",
            imageUrl: "https://example.com/products/towelrack.jpg"
          },
          icon: "AllProducts"
        },
        redeemed: false
      },
      {
        uid: uid,
        sid: sid,
        trigger: {
          customerBehaviourId: "671b00000000000000000002",
          signalType: "indecision"
        },
        action: {
          type: "social-proof-notification",
          title: "Popular pick!",
          message: "25 people bought this shower curtain today — grab yours before it's gone.",
          icon: "Bell"
        },
        redeemed: false
      },
      {
        uid: uid,
        sid: sid,
        trigger: {
          customerBehaviourId: "671b00000000000000000003",
          signalType: "exit-intent"
        },
        action: {
          type: "free-delivery",
          title: "Wait! Free Delivery Awaits",
          message: "Complete your purchase now and enjoy free delivery on your order.",
          icon: "Secondary"
        },
        redeemed: false
      },
      {
        uid: uid,
        sid: sid,
        trigger: {
          customerBehaviourId: "671b00000000000000000004",
          signalType: "prolonged-browsing"
        },
        action: {
          type: "social-proof-notification",
          title: "Others loved this too!",
          message: "12 customers added this Chrome Faucet to their cart today.",
          icon: "Bell"
        },
        redeemed: false
      },
      {
        uid: uid,
        sid: sid,
        trigger: {
          customerBehaviourId: "671b00000000000000000005",
          signalType: "indecision"
        },
        action: {
          type: "social-proof-notification",
          title: "Only a few left!",
          message: "Hurry — only 5 units of the Ceramic Soap Dispenser remain in stock.",
          icon: "Bell"
        },
        redeemed: false
      },
      {
        uid: uid,
        sid: sid,
        trigger: {
          customerBehaviourId: "671b00000000000000000006",
          signalType: "exit-intent"
        },
        action: {
          type: "free-delivery",
          title: "Before you go...",
          message: "Complete checkout now and get free shipping — for a limited time!",
          icon: "Secondary"
        },
        redeemed: false
      },
      {
        uid: uid,
        sid: sid,
        trigger: {
          customerBehaviourId: "671b00000000000000000007",
          signalType: "prolonged-browsing"
        },
        action: {
          type: "product-recommendation",
          title: "You might also like...",
          message: "Check out this stylish stainless steel toothbrush holder — pairs perfectly with your bathroom set.",
          product: {
            productId: "67192b3f64d161905fbe7801",
            productName: "Stainless Steel Toothbrush Holder",
            imageUrl: "https://example.com/products/toothbrushholder.jpg"
          },
          icon: "AllProducts"
        },
        redeemed: false
      },
      {
        uid: uid,
        sid: sid,
        trigger: {
          customerBehaviourId: "671b00000000000000000008",
          signalType: "indecision"
        },
        action: {
          type: "social-proof-notification",
          title: "Selling fast!",
          message: "30 people viewed this Black Shower Mat in the last hour.",
          icon: "Bell"
        },
        redeemed: false
      },
      {
        uid: uid,
        sid: sid,
        trigger: {
          customerBehaviourId: "671b00000000000000000009",
          signalType: "exit-intent"
        },
        action: {
          type: "free-delivery",
          title: "Don't miss this!",
          message: "Free delivery available today only — finish your purchase before midnight.",
          icon: "Secondary"
        },
        redeemed: false
      },
      {
        uid: uid,
        sid: sid,
        trigger: {
          customerBehaviourId: "671b00000000000000000010",
          signalType: "prolonged-browsing"
        },
        action: {
          type: "product-recommendation",
          title: "Recommended for you",
          message: "You may like this minimalist towel hook based on your recent browsing.",
          product: {
            productId: "67192b3f64d161905fbe7799",
            productName: "Minimalist Wall Towel Hook",
            imageUrl: "https://example.com/products/towelhook.jpg"
          },
          icon: "AllProducts"
        },
        redeemed: false
      }
    ];

    const results = {
      customerBehaviors: [],
      nextBestActions: []
    };

    // Insert documents (with optional delay like the original script)
    for (let index = 0; index < customer_behaviour_docs.length; index++) {
      const doc = customer_behaviour_docs[index];
      
      const behaviourResult = await customerBehaviourCollection.insertOne({
        ...doc,
        ts: new Date(),
      });

      const behaviourId = behaviourResult.insertedId;
      console.log(`Inserted customer_behaviour ${index + 1} with _id ${behaviourId}`);
      
      results.customerBehaviors.push({
        _id: behaviourId,
        ...doc,
        ts: new Date()
      });

      // Every 3 inserts → insert next_best_action
      if ((index + 1) % 3 === 0) {
        const baseNba = next_best_actions[nbaIndex];

        const nbaDoc = {
          ...baseNba,
          ts: new Date(),
          trigger: {
            ...baseNba.trigger,
            customerBehaviourId: behaviourId
          }
        };

        const nbaResult = await nextBestActionsCollection.insertOne(nbaDoc);

        console.log(`Inserted next_best_action ${nbaIndex + 1} linked to customer_behaviour ${behaviourId}`);
        
        results.nextBestActions.push({
          _id: nbaResult.insertedId,
          ...nbaDoc
        });

        // Move pointer + loop back if needed
        nbaIndex = (nbaIndex + 1) % next_best_actions.length;
      }

      // Add delay if requested (for testing/demo purposes)
      if (useDelay) {
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }

    return results;

  } catch (error) {
    console.error('Error generating customer behavior data:', error);
    throw error;
  }
}

/**
 * Helper function to create a delay (replaces MongoDB sleep)
 * @param {number} ms - Milliseconds to wait
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}