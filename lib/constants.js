export const shippingMethods = {
    bopis: {
        id: 'bopis',
        color: 'yellow',
        iconPath:'/rsc/icons/store-solid.svg',
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
    },
    home: {
        id: 'home',
        color: 'blue',
        iconPath:'/rsc/icons/house-solid.svg',
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
    }
}

export const ROLE = {
    assistant: 'AI',
    user: 'USER'
}

export const ORDERS_LISTED_IN_CHATBOT = 5
export const PAGINATION_PER_PAGE = 20

export const event_streams_logs = [
  {
    _id: "651a00000000000000000001",
    timestamp: new Date("2025-11-06T13:00:00Z"),
    tags: {
      userId: "65a546ae4a8f64e8f88fb89e",
      sessionId: 123456,
      action: "view-product"
    },
    metadata: {
      productId: "67192b3f64d161905fbe7795",
      productName: "AmazonBasics Toilet Paper Holder - Modern, 1-Piece, Black",
      masterCategory: "Products",
      subCategory: "Hardware",
      articleType: "TOILET_PAPER_HOLDER",
      vai_text_embedding: []
    }
  },
  {
    _id: "651a00000000000000000002",
    timestamp: new Date("2025-11-06T13:00:03Z"),
    tags: {
      userId: "65a546ae4a8f64e8f88fb89e",
      sessionId: 123456,
      action: "browsing"
    },
    metadata: {
      query: "bracelet"
    }
  },
  {
    _id: "651a00000000000000000003",
    timestamp: new Date("2025-11-06T13:00:06Z"),
    tags: {
      userId: "65a546ae4a8f64e8f88fb89e",
      sessionId: 123456,
      action: "add-to-cart"
    },
    metadata: {
      productId: "67192b3f64d161905fbe7797",
      productName: "Amazon Brand - Goodthreads Men's Merino Wool Beanie, Red, One Size",
      masterCategory: "Departments",
      subCategory: "Men",
      articleType: "HAT",
      vai_text_embedding: []
    }
  },
  {
    _id: "651a00000000000000000004",
    timestamp: new Date("2025-11-06T13:00:09Z"),
    tags: {
      userId: "65a546ae4a8f64e8f88fb89e",
      sessionId: 123456,
      action: "exit-intent"
    },
    metadata: {
      x: 12,
      y: 8
    }
  },
  {
    _id: "651a00000000000000000005",
    timestamp: new Date("2025-11-06T13:00:12Z"),
    tags: {
      userId: "65a546ae4a8f64e8f88fb89e",
      sessionId: 123456,
      action: "view-product"
    },
    metadata: {
      productId: "67192b3f64d161905fbe77af",
      productName: "AmazonBasics Adjustable 36-Inch Bungee Cords, Blue, 2-Pack (20-Piece)",
      masterCategory: "Products",
      subCategory: "Hardware",
      articleType: "CARGO_STRAP",
      vai_text_embedding: []
    }
  },
  {
    _id: "651a00000000000000000006",
    timestamp: new Date("2025-11-06T13:00:15Z"),
    tags: {
      userId: "65a546ae4a8f64e8f88fb89e",
      sessionId: 123456,
      action: "browsing"
    },
    metadata: {
      query: "lighting"
    }
  },
  {
    _id: "651a00000000000000000007",
    timestamp: new Date("2025-11-06T13:00:18Z"),
    tags: {
      userId: "65a546ae4a8f64e8f88fb89e",
      sessionId: 123456,
      action: "add-to-cart"
    },
    metadata: {
      productId: "67192b3f64d161905fbe77bf",
      productName: "Amazon Brand - Symbol Men's Navy Sneakers-11 UK/India (45 EU) (AZ-YS-185 A)",
      masterCategory: "Categories",
      subCategory: "Shoes",
      articleType: "SHOES",
      vai_text_embedding: []
    }
  },
  {
    _id: "651a00000000000000000008",
    timestamp: new Date("2025-11-06T13:00:21Z"),
    tags: {
      userId: "65a546ae4a8f64e8f88fb89e",
      sessionId: 123456,
      action: "exit-intent"
    },
    metadata: {
      x: 20,
      y: 15
    }
  },
  {
    _id: "651a00000000000000000009",
    timestamp: new Date("2025-11-06T13:00:24Z"),
    tags: {
      userId: "65a546ae4a8f64e8f88fb89e",
      sessionId: 123456,
      action: "view-product"
    },
    metadata: {
      productId: "67192b3f64d161905fbe77cb",
      productName: "18k Yellow Gold Plated Sterling Silver Genuine Diamond Hearts Bracelet (1/10 cttw, I-J Color, I2-I3 Clarity), 7.25\"",
      masterCategory: "Categories",
      subCategory: "Women",
      articleType: "FINENECKLACEBRACELETANKLET",
      vai_text_embedding: []
    }
  },
  {
    _id: "651a0000000000000000000a",
    timestamp: new Date("2025-11-06T13:00:27Z"),
    tags: {
      userId: "65a546ae4a8f64e8f88fb89e",
      sessionId: 123456,
      action: "browsing"
    },
    metadata: {
      query: "toilet paper holder"
    }
  },
  {
    _id: "651a0000000000000000000b",
    timestamp: new Date("2025-11-06T13:00:30Z"),
    tags: {
      userId: "65a546ae4a8f64e8f88fb89e",
      sessionId: 123456,
      action: "view-product"
    },
    metadata: {
      productId: "67192b3f64d161905fbe77ce",
      productName: "AmazonBasics Solar-Powered Motion Sensor Accent Light for Front Door, Patio, Yard, and Porch - 10 LED, 100 Lumen, 2-Pack",
      masterCategory: "Categories",
      subCategory: "Indoor Lighting",
      articleType: "LIGHT_FIXTURE",
      vai_text_embedding: []
    }
  },
  {
    _id: "651a0000000000000000000c",
    timestamp: new Date("2025-11-06T13:00:33Z"),
    tags: {
      userId: "65a546ae4a8f64e8f88fb89e",
      sessionId: 123456,
      action: "exit-intent"
    },
    metadata: {
      x: 8,
      y: 5
    }
  },
  {
    _id: "651a0000000000000000000d",
    timestamp: new Date("2025-11-06T13:00:36Z"),
    tags: {
      userId: "65a546ae4a8f64e8f88fb89e",
      sessionId: 123456,
      action: "add-to-cart"
    },
    metadata: {
      productId: "67192b3f64d161905fbe7795",
      productName: "AmazonBasics Toilet Paper Holder - Modern, 1-Piece, Black",
      masterCategory: "Products",
      subCategory: "Hardware",
      articleType: "TOILET_PAPER_HOLDER",
      vai_text_embedding: []
    }
  },
  {
    _id: "651a0000000000000000000e",
    timestamp: new Date("2025-11-06T13:00:39Z"),
    tags: {
      userId: "65a546ae4a8f64e8f88fb89e",
      sessionId: 123456,
      action: "browsing"
    },
    metadata: {
      query: "sneakers"
    }
  },
  {
    _id: "651a0000000000000000000f",
    timestamp: new Date("2025-11-06T13:00:42Z"),
    tags: {
      userId: "65a546ae4a8f64e8f88fb89e",
      sessionId: 123456,
      action: "view-product"
    },
    metadata: {
      productId: "67192b3f64d161905fbe7797",
      productName: "Amazon Brand - Goodthreads Men's Merino Wool Beanie, Red, One Size",
      masterCategory: "Departments",
      subCategory: "Men",
      articleType: "HAT",
      vai_text_embedding: []
    }
  },
  {
    _id: "651a00000000000000000010",
    timestamp: new Date("2025-11-06T13:00:45Z"),
    tags: {
      userId: "65a546ae4a8f64e8f88fb89e",
      sessionId: 123456,
      action: "exit-intent"
    },
    metadata: {
      x: 15,
      y: 12
    }
  },
  {
    _id: "651a00000000000000000011",
    timestamp: new Date("2025-11-06T13:00:48Z"),
    tags: {
      userId: "65a546ae4a8f64e8f88fb89e",
      sessionId: 123456,
      action: "add-to-cart"
    },
    metadata: {
      productId: "67192b3f64d161905fbe77af",
      productName: "AmazonBasics Adjustable 36-Inch Bungee Cords, Blue, 2-Pack (20-Piece)",
      masterCategory: "Products",
      subCategory: "Hardware",
      articleType: "CARGO_STRAP",
      vai_text_embedding: []
    }
  }
];

export const customer_behaviour_docs = [
  {
    _id: "751a00000000000000000001",
    userId: "65a546ae4a8f64e8f88fb89e",
    sessionId: 123456,
    behaviourRegisteredTime: new Date("2025-11-06T13:00:00Z"),
    behaviourType: "prolonged-browsing",
    metadata: {
      productName: "AmazonBasics Toilet Paper Holder - Modern, 1-Piece, Black",
      productId: "67192b3f64d161905fbe7795",
      textEmbedding: [0.12, 0.44, 0.55, 0.98]
    },
    events: ["651a00000000000000000001", "651a00000000000000000005"],
  },
  {
    _id: "751a00000000000000000002",
    userId: "65a546ae4a8f64e8f88fb89e",
    sessionId: 123456,
    behaviourRegisteredTime: new Date("2025-11-06T13:00:03Z"),
    behaviourType: "indecision",
    metadata: {
      masterCategory: "Categories",
      query: "bracelet"
    },
    events: ["651a00000000000000000002", "651a00000000000000000009"],
  },
  {
    _id: "751a00000000000000000003",
    userId: "65a546ae4a8f64e8f88fb89e",
    sessionId: 123456,
    behaviourRegisteredTime: new Date("2025-11-06T13:00:09Z"),
    behaviourType: "exit-intent",
    metadata: {
      x: 12,
      y: 8
    },
    events: ["651a00000000000000000004"],
  },
  {
    _id: "751a00000000000000000004",
    userId: "65a546ae4a8f64e8f88fb89e",
    sessionId: 123456,
    behaviourRegisteredTime: new Date("2025-11-06T13:00:12Z"),
    behaviourType: "prolonged-browsing",
    metadata: {
      productName: "AmazonBasics Adjustable 36-Inch Bungee Cords, Blue, 2-Pack (20-Piece)",
      productId: "67192b3f64d161905fbe77af",
      textEmbedding: [0.78, 0.21, 0.33, 0.56]
    },
    events: ["651a00000000000000000005", "651a00000000000000000011"],
  },
  {
    _id: "751a00000000000000000005",
    userId: "65a546ae4a8f64e8f88fb89e",
    sessionId: 123456,
    behaviourRegisteredTime: new Date("2025-11-06T13:00:15Z"),
    behaviourType: "indecision",
    metadata: {
      masterCategory: "Products",
      query: "lighting"
    },
    events: ["651a00000000000000000006", "651a00000000000000000007"],
  },
  {
    _id: "751a00000000000000000006",
    userId: "65a546ae4a8f64e8f88fb89e",
    sessionId: 123456,
    behaviourRegisteredTime: new Date("2025-11-06T13:00:21Z"),
    behaviourType: "exit-intent",
    metadata: {
      x: 20,
      y: 15
    },
    events: ["651a00000000000000000008"],
  },
  {
    _id: "751a00000000000000000007",
    userId: "65a546ae4a8f64e8f88fb89e",
    sessionId: 123456,
    behaviourRegisteredTime: new Date("2025-11-06T13:00:24Z"),
    behaviourType: "prolonged-browsing",
    metadata: {
      productName: "18k Yellow Gold Plated Sterling Silver Genuine Diamond Hearts Bracelet",
      productId: "67192b3f64d161905fbe77cb",
      textEmbedding: [0.11, 0.92, 0.45, 0.66]
    },
    events: ["651a00000000000000000009"],
  },
  {
    _id: "751a00000000000000000008",
    userId: "65a546ae4a8f64e8f88fb89e",
    sessionId: 123456,
    behaviourRegisteredTime: new Date("2025-11-06T13:00:27Z"),
    behaviourType: "indecision",
    metadata: {
      masterCategory: "Products",
      query: "toilet paper holder"
    },
    events: ["651a0000000000000000000a", "651a0000000000000000000b"],
  },
  {
    _id: "751a00000000000000000009",
    userId: "65a546ae4a8f64e8f88fb89e",
    sessionId: 123456,
    behaviourRegisteredTime: new Date("2025-11-06T13:00:33Z"),
    behaviourType: "exit-intent",
    metadata: {
      x: 8,
      y: 5
    },
    events: ["651a0000000000000000000c"],
  },
 {
    _id: "751a00000000000000000010",
    userId: "65a546ae4a8f64e8f88fb89e",
    sessionId: 123456,
    behaviourRegisteredTime: new Date("2025-11-06T13:00:42Z"),
    behaviourType: "prolonged-browsing",
    metadata: {
      productName: "Amazon Brand - Goodthreads Men's Merino Wool Beanie, Red, One Size",
      productId: "67192b3f64d161905fbe7797",
      textEmbedding: [0.34, 0.77, 0.12, 0.55]
    },
    events: ["651a00000000000000000003", "651a0000000000000000000f"],
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
    createdAt: new Date("2025-11-06T14:00:00Z"),
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
    createdAt: new Date("2025-11-06T14:10:00Z"),
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
      icon: "Coin"
    },
    createdAt: new Date("2025-11-06T14:20:00Z"),
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
    createdAt: new Date("2025-11-06T14:25:00Z"),
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
    createdAt: new Date("2025-11-06T14:30:00Z"),
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
      icon: "Coin"
    },
    createdAt: new Date("2025-11-06T14:35:00Z"),
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
    createdAt: new Date("2025-11-06T14:40:00Z"),
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
    createdAt: new Date("2025-11-06T14:45:00Z"),
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
      icon: "Coin"
    },
    createdAt: new Date("2025-11-06T14:50:00Z"),
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
    createdAt: new Date("2025-11-06T14:55:00Z"),
    redeemed: true
  }
]
