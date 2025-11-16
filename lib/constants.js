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

export const FEATURES = {
  RECEIPTS: 'receipts',
  OMNICHANNEL_ORDERING: 'omnichannelOrdering',
  AI_CHATBOT: 'chatbot'
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
  }
};















