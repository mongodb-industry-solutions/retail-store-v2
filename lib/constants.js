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

export const logs = [
  {
    _id: "651a00000000000000000001",
    userId: "65a546ae4a8f64e8f88fb89e",
    sessionId: 123456,
    timestamp: new Date("2025-11-06T13:00:00Z"),
    action: "view-product",
    metadata: {
      productName: "AmazonBasics Toilet Paper Holder - Modern, 1-Piece, Black",
      productId: "67192b3f64d161905fbe7795",
      vai_text_embedding: [],
      masterCategory: "Products",
      subCategory: "Hardware",
      articleType: "TOILET_PAPER_HOLDER",
    },
  },
  {
    _id: "651a00000000000000000002",
    userId: "65a546ae4a8f64e8f88fb89e",
    sessionId: 123456,
    timestamp: new Date("2025-11-06T13:00:03Z"),
    action: "browsing",
    metadata: {
      query: "bracelet",
    },
  },
  {
    _id: "651a00000000000000000003",
    userId: "65a546ae4a8f64e8f88fb89e",
    sessionId: 123456,
    timestamp: new Date("2025-11-06T13:00:06Z"),
    action: "add-to-cart",
    metadata: {
      productName: "Amazon Brand - Goodthreads Men's Merino Wool Beanie, Red, One Size",
      productId: "67192b3f64d161905fbe7797",
      vai_text_embedding: [],
      masterCategory: "Departments",
      subCategory: "Men",
      articleType: "HAT",
    },
  },
  {
    _id: "651a00000000000000000004",
    userId: "65a546ae4a8f64e8f88fb89e",
    sessionId: 123456,
    timestamp: new Date("2025-11-06T13:00:09Z"),
    action: "exit-intent",
    metadata: {
      x: 12,
      y: 8,
    },
  },
  {
    _id: "651a00000000000000000005",
    userId: "65a546ae4a8f64e8f88fb89e",
    sessionId: 123456,
    timestamp: new Date("2025-11-06T13:00:12Z"),
    action: "view-product",
    metadata: {
      productName: "AmazonBasics Adjustable 36-Inch Bungee Cords, Blue, 2-Pack (20-Piece)",
      productId: "67192b3f64d161905fbe77af",
      vai_text_embedding: [],
      masterCategory: "Products",
      subCategory: "Hardware",
      articleType: "CARGO_STRAP",
    },
  },
  {
    _id: "651a00000000000000000006",
    userId: "65a546ae4a8f64e8f88fb89e",
    sessionId: 123456,
    timestamp: new Date("2025-11-06T13:00:15Z"),
    action: "browsing",
    metadata: {
      query: "lighting",
    },
  },
  {
    _id: "651a00000000000000000007",
    userId: "65a546ae4a8f64e8f88fb89e",
    sessionId: 123456,
    timestamp: new Date("2025-11-06T13:00:18Z"),
    action: "add-to-cart",
    metadata: {
      productName: "Amazon Brand - Symbol Men's Navy Sneakers-11 UK/India (45 EU) (AZ-YS-185 A)",
      productId: "67192b3f64d161905fbe77bf",
      vai_text_embedding: [],
      masterCategory: "Categories",
      subCategory: "Shoes",
      articleType: "SHOES",
    },
  },
  {
    _id: "651a00000000000000000008",
    userId: "65a546ae4a8f64e8f88fb89e",
    sessionId: 123456,
    timestamp: new Date("2025-11-06T13:00:21Z"),
    action: "exit-intent",
    metadata: {
      x: 20,
      y: 15,
    },
  },
  {
    _id: "651a00000000000000000009",
    userId: "65a546ae4a8f64e8f88fb89e",
    sessionId: 123456,
    timestamp: new Date("2025-11-06T13:00:24Z"),
    action: "view-product",
    metadata: {
      productName: "18k Yellow Gold Plated Sterling Silver Genuine Diamond Hearts Bracelet (1/10 cttw, I-J Color, I2-I3 Clarity), 7.25\"",
      productId: "67192b3f64d161905fbe77cb",
      vai_text_embedding: [],
      masterCategory: "Categories",
      subCategory: "Women",
      articleType: "FINENECKLACEBRACELETANKLET",
    },
  },
  {
    _id: "651a0000000000000000000a",
    userId: "65a546ae4a8f64e8f88fb89e",
    sessionId: 123456,
    timestamp: new Date("2025-11-06T13:00:27Z"),
    action: "browsing",
    metadata: {
      query: "toilet paper holder",
    },
  },
  {
    _id: "651a0000000000000000000b",
    userId: "65a546ae4a8f64e8f88fb89e",
    sessionId: 123456,
    timestamp: new Date("2025-11-06T13:00:30Z"),
    action: "view-product",
    metadata: {
      productName: "AmazonBasics Solar-Powered Motion Sensor Accent Light for Front Door, Patio, Yard, and Porch - 10 LED, 100 Lumen, 2-Pack",
      productId: "67192b3f64d161905fbe77ce",
      vai_text_embedding: [],
      masterCategory: "Categories",
      subCategory: "Indoor Lighting",
      articleType: "LIGHT_FIXTURE",
    },
  },
  {
    _id: "651a0000000000000000000c",
    userId: "65a546ae4a8f64e8f88fb89e",
    sessionId: 123456,
    timestamp: new Date("2025-11-06T13:00:33Z"),
    action: "exit-intent",
    metadata: {
      x: 8,
      y: 5,
    },
  },
  {
    _id: "651a0000000000000000000d",
    userId: "65a546ae4a8f64e8f88fb89e",
    sessionId: 123456,
    timestamp: new Date("2025-11-06T13:00:36Z"),
    action: "add-to-cart",
    metadata: {
      productName: "AmazonBasics Toilet Paper Holder - Modern, 1-Piece, Black",
      productId: "67192b3f64d161905fbe7795",
      vai_text_embedding: [],
      masterCategory: "Products",
      subCategory: "Hardware",
      articleType: "TOILET_PAPER_HOLDER",
    },
  },
  {
    _id: "651a0000000000000000000e",
    userId: "65a546ae4a8f64e8f88fb89e",
    sessionId: 123456,
    timestamp: new Date("2025-11-06T13:00:39Z"),
    action: "browsing",
    metadata: {
      query: "sneakers",
    },
  },
  {
    _id: "651a0000000000000000000f",
    userId: "65a546ae4a8f64e8f88fb89e",
    sessionId: 123456,
    timestamp: new Date("2025-11-06T13:00:42Z"),
    action: "view-product",
    metadata: {
      productName: "Amazon Brand - Goodthreads Men's Merino Wool Beanie, Red, One Size",
      productId: "67192b3f64d161905fbe7797",
      vai_text_embedding: [],
      masterCategory: "Departments",
      subCategory: "Men",
      articleType: "HAT",
    },
  },
  {
    _id: "651a00000000000000000010",
    userId: "65a546ae4a8f64e8f88fb89e",
    sessionId: 123456,
    timestamp: new Date("2025-11-06T13:00:45Z"),
    action: "exit-intent",
    metadata: {
      x: 15,
      y: 12,
    },
  },
  {
    _id: "651a00000000000000000011",
    userId: "65a546ae4a8f64e8f88fb89e",
    sessionId: 123456,
    timestamp: new Date("2025-11-06T13:00:48Z"),
    action: "add-to-cart",
    metadata: {
      productName: "AmazonBasics Adjustable 36-Inch Bungee Cords, Blue, 2-Pack (20-Piece)",
      productId: "67192b3f64d161905fbe77af",
      vai_text_embedding: [],
      masterCategory: "Products",
      subCategory: "Hardware",
      articleType: "CARGO_STRAP",
    },
  }
];
