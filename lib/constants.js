
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

export const ORDERS_LISTED_IN_CHATBOT = 5

export const PAGINATION_PER_PAGE = 20

export const HEARTBEAT_INTERVAL_MS = 10000 // 10 seconds

export const INACTIVITY_TIMEOUT_MS = 60000 // 1 minute

export const EVENT_STREAMS_TYPES = {
  HEARTBEAT: {name: 'heartbeat', requiredFields: []},
  VIEW_PRODUCT: {name: 'view-product', requiredFields: ['productId', 'masterCategory', 'brand']},
  ADD_TO_CART: {name: 'add-to-cart', requiredFields: ['productId', 'masterCategory', 'brand']},
  EXIT_INTENT: {name: 'exit-intent', requiredFields: ['exitMethod']},
  SEARCH: {name: 'search', requiredFields: ['query']}
}


export const behaviour_types = [
  'prolonged-browsing',
  'indecision',
  'exit-intent'
]
export const next_best_actions_types = [
  'product-recommendation',
  'social-proof-notification',
  'free-delivery'
]

export const  customer_behaviour_docs = [
  {
    userId: "66fe219d625d93a100528224",
    sessionId: "1768337334157",
    behaviourType: "prolonged-browsing",
    metadata: {
      productName: "AmazonBasics Toilet Paper Holder - Modern, 1-Piece, Black",
      productId: "67192b3f64d161905fbe7795"
    },
    events: ["651a00000000000000000001", "651a00000000000000000005"]
  },
  {
    userId: "66fe219d625d93a100528224",
    sessionId: "1768337334157",
    behaviourType: "indecision",
    metadata: {
      masterCategory: "Categories",
      products: [
        "67192b3f64d161905fbe77cb",
        "67192b3f64d161905fbe7797"
      ]
    },
    events: ["651a00000000000000000002", "651a00000000000000000009"]
  },
  {
    userId: "66fe219d625d93a100528224",
    sessionId: "1768337334157",
    behaviourType: "exit-intent",
    metadata: {},
    events: ["651a00000000000000000004"]
  },
  {
    userId: "66fe219d625d93a100528224",
    sessionId: "1768337334157",
    behaviourType: "prolonged-browsing",
    metadata: {
      productName: "AmazonBasics Adjustable 36-Inch Bungee Cords, Blue, 2-Pack (20-Piece)",
      productId: "67192b3f64d161905fbe77af"
    },
    events: ["651a00000000000000000005", "651a00000000000000000011"]
  },
  {
    userId: "66fe219d625d93a100528224",
    sessionId: "1768337334157",
    behaviourType: "indecision",
    metadata: {
      masterCategory: "Products",
      products: [
        "67192b3f64d161905fbe7795",
        "67192b3f64d161905fbe77af"
      ]
    },
    events: ["651a00000000000000000006", "651a00000000000000000007"]
  },
  {
    userId: "66fe219d625d93a100528224",
    sessionId: "1768337334157",
    behaviourType: "exit-intent",
    metadata: {},
    events: ["651a00000000000000000008"]
  },
  {
    userId: "66fe219d625d93a100528224",
    sessionId: "1768337334157",
    behaviourType: "prolonged-browsing",
    metadata: {
      productName: "18k Yellow Gold Plated Sterling Silver Genuine Diamond Hearts Bracelet",
      productId: "67192b3f64d161905fbe77cb"
    },
    events: ["651a00000000000000000009"]
  },
  {
    userId: "66fe219d625d93a100528224",
    sessionId: "1768337334157",
    behaviourType: "indecision",
    metadata: {
      masterCategory: "Products",
      products: [
        "67192b3f64d161905fbe7795",
        "67192b3f64d161905fbe77cb"
      ]
    },
    events: ["651a0000000000000000000a", "651a0000000000000000000b"]
  },
  {
    userId: "66fe219d625d93a100528224",
    sessionId: "1768337334157",
    behaviourType: "exit-intent",
    metadata: {},
    events: ["651a0000000000000000000c"]
  },
  {
    userId: "66fe219d625d93a100528224",
    sessionId: "1768337334157",
    behaviourType: "prolonged-browsing",
    metadata: {
      productName: "Amazon Brand - Goodthreads Men's Merino Wool Beanie, Red, One Size",
      productId: "67192b3f64d161905fbe7797"
    },
    events: ["651a00000000000000000003", "651a0000000000000000000f"]
  }
];

export const next_best_actions = [
  {
    _id: "672b00000000000000000001",
    userId: "65a546ae4a8f64e8f88fb89e",
    sessionId: 123456,
    trigger: {
      customerBehaviourId: "671b00000000000000000001",
      behaviourType: "prolonged-browsing"
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
    createdAt: "2025-11-06T14:00:00Z",
    redeemed: false
  },
  {
    _id: "672b00000000000000000002",
    userId: "65a546ae4a8f64e8f88fb89e",
    sessionId: 123456,
    trigger: {
      customerBehaviourId: "671b00000000000000000002",
      behaviourType: "indecision"
    },
    action: {
      type: "social-proof-notification",
      title: "Popular pick!",
      message: "25 people bought this shower curtain today — grab yours before it’s gone.",
      icon: "Bell"
    },
    createdAt: "2025-11-06T14:10:00Z",
    redeemed: false
  },
  {
    _id: "672b00000000000000000003",
    userId: "65a546ae4a8f64e8f88fb89e",
    sessionId: 123456,
    trigger: {
      customerBehaviourId: "671b00000000000000000003",
      behaviourType: "exit-intent"
    },
    action: {
      type: "free-delivery",
      title: "Wait! Free Delivery Awaits",
      message: "Complete your purchase now and enjoy free delivery on your order.",
      icon: "Secondary"
    },
    createdAt: "2025-11-06T14:20:00Z",
    redeemed: false
  },
  {
    _id: "672b00000000000000000004",
    userId: "65a546ae4a8f64e8f88fb89e",
    sessionId: 123456,
    trigger: {
      customerBehaviourId: "671b00000000000000000004",
      behaviourType: "prolonged-browsing"
    },
    action: {
      type: "social-proof-notification",
      title: "Others loved this too!",
      message: "12 customers added this Chrome Faucet to their cart today.",
      icon: "Bell"
    },
    createdAt: "2025-11-06T14:25:00Z",
    redeemed: false
  },
  {
    _id: "672b00000000000000000005",
    userId: "65a546ae4a8f64e8f88fb89e",
    sessionId: 123456,
    trigger: {
      customerBehaviourId: "671b00000000000000000005",
      behaviourType: "indecision"
    },
    action: {
      type: "social-proof-notification",
      title: "Only a few left!",
      message: "Hurry — only 5 units of the Ceramic Soap Dispenser remain in stock.",
      icon: "Bell"
    },
    createdAt: "2025-11-06T14:30:00Z",
    redeemed: true
  },
  {
    _id: "672b00000000000000000006",
    userId: "65a546ae4a8f64e8f88fb89e",
    sessionId: 123456,
    trigger: {
      customerBehaviourId: "671b00000000000000000006",
      behaviourType: "exit-intent"
    },
    action: {
      type: "free-delivery",
      title: "Before you go...",
      message: "Complete checkout now and get free shipping — for a limited time!",
      icon: "Secondary"
    },
    createdAt: "2025-11-06T14:35:00Z",
    redeemed: false
  },
  {
    _id: "672b00000000000000000007",
    userId: "65a546ae4a8f64e8f88fb89e",
    sessionId: 123456,
    trigger: {
      customerBehaviourId: "671b00000000000000000007",
      behaviourType: "prolonged-browsing"
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
    createdAt: "2025-11-06T14:40:00Z",
    redeemed: false
  },
  {
    _id: "672b00000000000000000008",
    userId: "65a546ae4a8f64e8f88fb89e",
    sessionId: 123456,
    trigger: {
      customerBehaviourId: "671b00000000000000000008",
      behaviourType: "indecision"
    },
    action: {
      type: "social-proof-notification",
      title: "Selling fast!",
      message: "30 people viewed this Black Shower Mat in the last hour.",
      icon: "Bell"
    },
    createdAt: "2025-11-06T14:45:00Z",
    redeemed: false
  },
  {
    _id: "672b00000000000000000009",
    userId: "65a546ae4a8f64e8f88fb89e",
    sessionId: 123456,
    trigger: {
      customerBehaviourId: "671b00000000000000000009",
      behaviourType: "exit-intent"
    },
    action: {
      type: "free-delivery",
      title: "Don’t miss this!",
      message: "Free delivery available today only — finish your purchase before midnight.",
      icon: "Secondary"
    },
    createdAt: "2025-11-06T14:50:00Z",
    redeemed: false
  },
  {
    _id: "672b00000000000000000010",
    userId: "65a546ae4a8f64e8f88fb89e",
    sessionId: 123456,
    trigger: {
      customerBehaviourId: "671b00000000000000000010",
      behaviourType: "prolonged-browsing"
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
    createdAt: "2025-11-06T14:55:00Z",
    redeemed: true
  }
]

export const FEATURES = {
  RECEIPTS: 'receipts',
  OMNICHANNEL_ORDERING: 'omnichannelOrdering',
  AI_CHATBOT: 'chatbot',
  CUSTOMER_RETENTION: 'customerRetention',
};  

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












