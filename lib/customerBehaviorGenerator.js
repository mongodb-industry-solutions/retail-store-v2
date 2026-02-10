import { clientPromise, dbName } from "@/lib/mongodb";
import { COLLECTIONS } from "./constants";

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

    const customerBehaviourCollection = db.collection(
      COLLECTIONS.CUSTOMER_BEHAVIOUR
    );
    const nextBestActionsCollection = db.collection(
      COLLECTIONS.NEXT_BEST_ACTIONS
    );

    let nbaIndex = 0; // pointer to next_best_actions array

    const customer_behaviour_docs = [
      {
        evidence:
          "no add-to-cart and no sustained focus >= 0.5 in any dimension during last 30s. The user showed interest in articles with subCategory Shoes.",
        severity: "medium",
        sid: sid,
        signal: "high-intent",

        uid: uid,
        productId: "67192b4364d161905fbe844a",
      },
      {
        evidence:
          "no add-to-cart and no sustained focus >= 0.5 in any dimension during last 30s. The user showed interest in articles with subCategory Shoes.",
        severity: "medium",
        sid: sid,
        signal: "exit-risk",

        uid: uid,
      },
      {
        evidence:
          "no add-to-cart and no sustained focus >= 0.5 in any dimension during last 30s",
        severity: "medium",
        sid: sid,
        signal: "search-friction",
        uid: uid,
      },
    ];

    const next_best_actions = [
      {
        uid: "66fe219d625d93a100528224",
        sid: "ecbfe119-0de4-44d9-9fb6-23642b010ba1",
        type: "social-proof-notification",
        actionMetadata: {
          title: "Shoes are a hit!",
          message:
            "Over 1,000 customers have viewed our Shoes collection in the last hour. Don't miss out on the latest trends.",
        },
        embedInProduct: {
          productId: "67192b4364d161905fbe844a",
          message:
            "Hurry, this high-demand item is selling fast! Don't miss out on this popular choice.",
        },

        redeemed: false,
      },
      {
        uid: uid,
        sid: sid,
        type: "product-recommendation",
        actionMetadata: {
          title: "Still deciding? You might also like this",
          message:
            "Based on your recent browsing, this modern towel rack might be a great match.",
          product: {
            productId: "67192b3f64d161905fbe7795",
            productName: "AmazonBasics Modern Towel Rack",
            imageUrl: "https://example.com/products/towelrack.jpg",
          },
        },
        redeemed: false,
      },

      {
        uid: uid,
        sid: sid,
        type: "free-delivery",
        actionMetadata: {
          title: "Wait! Free Delivery Awaits",
          message:
            "Complete your purchase now and enjoy free delivery on your order.",
        },
        redeemed: false,
      },

    ];

    const results = {
      customerBehaviors: [],
      nextBestActions: [],
    };

    // Insert documents (with optional delay like the original script)
    for (let index = 0; index < customer_behaviour_docs.length; index++) {
      const doc = customer_behaviour_docs[index];

      const behaviourResult = await customerBehaviourCollection.insertOne({
        ...doc,
        ts: new Date(),
      });

      const behaviourId = behaviourResult.insertedId;
      console.log(
        `Inserted customer_behaviour ${index + 1} with _id ${behaviourId}`
      );

      results.customerBehaviors.push({
        _id: behaviourId,
        ...doc,
        ts: new Date(),
      });

      // Every 1 inserts → insert next_best_action
        const baseNba = next_best_actions[nbaIndex];

        const nbaDoc = {
          ...baseNba,
          ts: new Date(),
          trigger: {
            ...baseNba.trigger,
            customerBehaviourId: behaviourId,
          },
        };

        const nbaResult = await nextBestActionsCollection.insertOne(nbaDoc);

        console.log(
          `Inserted next_best_action ${nbaIndex + 1} linked to customer_behaviour ${behaviourId}`
        );

        results.nextBestActions.push({
          _id: nbaResult.insertedId,
          ...nbaDoc,
        });

        // Move pointer + loop back if needed
        nbaIndex = (nbaIndex + 1) % next_best_actions.length;
      

      // Add delay if requested (for testing/demo purposes)
      if (useDelay) {
        await new Promise((resolve) => setTimeout(resolve, 10000));
      }
    }

    return results;
  } catch (error) {
    console.error("Error generating customer behavior data:", error);
    throw error;
  }
}

/**
 * Helper function to create a delay (replaces MongoDB sleep)
 * @param {number} ms - Milliseconds to wait
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
