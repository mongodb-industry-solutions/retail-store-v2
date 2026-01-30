
export const shippingMethods = {
    home: {
    id: 'home',
    color: 'blue',
    iconPath: '/rsc/icons/house-solid.svg',
    label: 'Buy Online, Get Delivery at Home',
    steps: [
      {
        id: 'inProcess',
        label: 'In Process'
      },
      {
        id: 'ready',
        label: 'Ready for delivery'
      },
      {
        id: 'warehouse',
        label: 'Picked up from warehouse'
      },
      {
        id: 'transit',
        label: 'In Transit'
      },
      {
        id: 'delivered',
        label: 'Delivered'
      }
    ]
  },
  bopis: {
    id: 'bopis',
    color: 'yellow',
    iconPath: '/rsc/icons/store-solid.svg',
    label: 'Buy Online, Pick up in Store',
    steps: [
      {
        id: 'inProcess',
        label: 'In Process'
      },
      {
        id: 'ready',
        label: 'Ready for pickup'
      },
      {
        id: 'sutomerInStore',
        label: 'Customer In Store'
      },
      {
        id: 'completed',
        label: 'Completed'
      }
    ]
  }
}

export const ROLE = {
  assistant: 'AI',
  user: 'USER'
}

export const COLLECTIONS = {
  EVENTS_INGEST: 'events_ingest',
  CUSTOMER_BEHAVIOUR: 'customer_behaviour',
  NEXT_BEST_ACTIONS: 'next_best_actions'

}

export const ORDERS_LISTED_IN_CHATBOT = 5

export const PAGINATION_PER_PAGE = 20

export const HEARTBEAT_INTERVAL_MS = 10000 // 10 seconds

export const INACTIVITY_TIMEOUT_MS = 180000 // 3 minutes

export const EVENT_STREAMS_TYPES = {
  HEARTBEAT: {name: 'heartbeat', requiredFields: []},
  VIEW_PRODUCT: {name: 'view-product', requiredFields: ['productId', 'subCategory', 'brand']},
  ADD_TO_CART: {name: 'add-to-cart', requiredFields: ['productId', 'subCategory', 'brand']},
  EXIT_RISK: {name: 'exit-risk', requiredFields: ['exitMethod']},
  SEARCH: {name: 'search', requiredFields: ['query', 'productId', 'subCategory', 'articleType', 'brand']},
}

export const CUSTOMER_BEHAVIOUR_TYPES = {
  HIGH_INTENT: {name: 'high-intent', label: 'High Intent', description: 'User shows strong interest in products, indicating a high likelihood of purchase.'},
  SEARCH_FRICTION: {name: 'search-friction', label: 'Search Friction', description: 'User is experiencing difficulties finding products, suggesting potential barriers to purchase.'},
  EXIT_RISK: {name: 'exit-risk', label: 'Exit Risk', description: 'User is about to leave the site, indicating a risk of losing a potential customer.'}
}

export const NEXT_BEST_ACTIONS_TYPES = {
  PRODUCT_RECOMMENDATION: {name: 'product-recommendation', label: "Product Recommendation", description: 'Suggesting relevant products to the user based on their browsing behavior to encourage purchase.'},
  SOCIAL_PROOF_NOTIFICATION: {name: 'social-proof-notification', label: "Social Proof Notification", description: 'Leveraging social proof by notifying users of popular products or recent purchases to build trust and encourage buying.'},
  FREE_DELIVERY: {name: 'free-delivery', label: "Free Delivery", description: 'Offering free delivery to incentivize users to complete their purchase, especially when they show exit intent.'}
}

export const FEATURES = {
  RECEIPTS: 'receipts',
  OMNICHANNEL_ORDERING: 'omnichannelOrdering',
  AI_CHATBOT: 'chatbot',
  CUSTOMER_RETENTION: 'customerRetention',
};  

export const DEVELOPMENT = true; // Set to false for production

export const GUIDE_CUE_MESSAGES= {
  // Orders Page
  orders: {
    [FEATURES.RECEIPTS]: {
      messages: [
        {title: 'Your Orders', description: 'This is your history of orders'},
        {title: 'See receipt', description: 'Click here to see the digital receipt for your order'},
      ]
    },
    [FEATURES.AI_CHATBOT]: {
      messages: [
        {title: 'Your Orders', description: 'The AI Assistant is aware of all the detailed information regarding these orders.'},
        {title: 'Agentic RAG Assistant', description: 'Click here to start chatting with the Intelligent RAG Enabled Chatbot'}
      ]
    }
  },
  // Cart Page
  cart: {
    [FEATURES.RECEIPTS]: {
      messages: [
        { title: "Your Cart", description: "Welcome to Digital Receipts Experience - view your cart here" },  
        { title: "Continue", description: "Proceed to checkout to continue your experience." },  
    ],  
    },
    [FEATURES.OMNICHANNEL_ORDERING]: {
      messages: [  
        { title: "Your Cart", description: "Welcome to Omnichannel Ordering Experience - view your cart here" },  
        { title: "Continue", description: "Proceed to checkout to continue your experience." },  
    ],  
    }
  },
  // Checkout Page
  checkout: {
    [FEATURES.RECEIPTS]: {
      messages: [
        { title: "Complete your order", description: 'Finalize your purchase to receive a detailed receipt'}
      ]
    },
    [FEATURES.OMNICHANNEL_ORDERING]: {
      messages: [
        {title: 'Select Shipping Method', description: 'You can get your order delivered to your home or pick it up in store'},
        {title: 'Place your order', description: 'Complete the order to proceed to the order details page' },
      ]
    }
  },
  // Order Details Page
  orderDetails: {
    [FEATURES.RECEIPTS]: {
      messages: [
        {title: 'View your Digital Receipt', description: 'Click here to view your digital receipt'},
      ]
    },
    [FEATURES.OMNICHANNEL_ORDERING]: {
      messages: [
        {title: 'Real time updates', description: 'Change streams help update your order status in real time'},
        {title: 'Details of the status', description: 'Timestamps and details are available for each step of your order'},
        // {title: 'Go to Your Orders ', description: 'Go to the Orders page to see all your orders' },
      ]
    }
  },
  // Digital Receipt Modal
  digitalReceipt: {
    [FEATURES.RECEIPTS]: {
      messages: [
        {title: 'Your Digital Receipt', description: 'See releveant order, tax and loyalty information here'},
        {title: 'Personalized recommendations', description: 'Relevant suggestions based on items inside this order'},
        {title: 'Download it!', description: 'You can also download your digital receipt here'},
      ]
    }
  },
  // Shopping page
  shop: {
    [FEATURES.CUSTOMER_RETENTION]: {
      messages: [
        {title: 'Customer retention strategy', description: 'Browse products to trigger customer retention behaviors'},
      ]
    }
  }
};

// Aggregation Pipelines for Analytics
export const AGGREGATION_PIPELINES = {
  CUSTOMER_BEHAVIOR_ANALYSIS: [
    // 1. Scope to one user across all sessions
    {
      $match: { uid: "USER_ID_PLACEHOLDER" }
    },

    // 2. Count per signal
    {
      $group: {
        _id: "$signal",
        count: { $sum: 1 }
      }
    },

    // 3. Compute total count
    {
      $group: {
        _id: null,
        total: { $sum: "$count" },
        signals: {
          $push: {
            signal: "$_id",
            count: "$count"
          }
        }
      }
    },

    // 4. Calculate percentages
    {
      $unwind: "$signals"
    },
    {
      $project: {
        _id: 0,
        signal: "$signals.signal",
        count: "$signals.count",
        percentage: {
          $round: [
            {
              $multiply: [{ $divide: ["$signals.count", "$total"] }, 100]
            },
            0
          ]
        }
      }
    },

    // 5. Sort for UI
    {
      $sort: { percentage: -1 }
    }
  ],

  NEXT_BEST_ACTIONS_ANALYSIS: [
    // 1. Scope to one user
    {
      $match: {
        uid: "USER_ID_PLACEHOLDER"
      }
    },

    // 2. Group by action.type
    {
      $group: {
        _id: "$action.type",
        count: { $sum: 1 }
      }
    },

    // 3. Compute total
    {
      $group: {
        _id: null,
        total: { $sum: "$count" },
        actions: {
          $push: {
            type: "$_id",
            count: "$count"
          }
        }
      }
    },

    // 4. Calculate percentages
    { $unwind: "$actions" },
    {
      $project: {
        _id: 0,
        actionType: "$actions.type",
        count: "$actions.count",
        percentage: {
          $round: [
            {
              $multiply: [{ $divide: ["$actions.count", "$total"] }, 100]
            },
            0
          ]
        }
      }
    },

    // 5. Sort for UI
    { $sort: { percentage: -1 } }
  ],

  ENGAGED_ACTIONS_ANALYSIS: [
    // 1. Scope to one user + only engaged actions
    {
      $match: {
        uid: "USER_ID_PLACEHOLDER",
        redeemed: true
      }
    },

    // 2. Group by action type
    {
      $group: {
        _id: "$action.type",
        count: { $sum: 1 }
      }
    },

    // 3. Compute total engagements
    {
      $group: {
        _id: null,
        total: { $sum: "$count" },
        actions: {
          $push: {
            type: "$_id",
            count: "$count"
          }
        }
      }
    },

    // 4. Calculate percentages
    { $unwind: "$actions" },
    {
      $project: {
        _id: 0,
        actionType: "$actions.type",
        count: "$actions.count",
        percentage: {
          $round: [
            {
              $multiply: [{ $divide: ["$actions.count", "$total"] }, 100]
            },
            0
          ]
        }
      }
    },

    // 5. Sort for UI
    {
      $sort: { percentage: -1 }
    }
  ]
};












