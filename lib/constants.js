export const shippingMethods = {
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
  },
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
  }
}

export const ROLE = {
  assistant: 'AI',
  user: 'USER'
}

export const ORDERS_LISTED_IN_CHATBOT = 5

export const GUIDE_CUE_MESSAGES = {
  // ✅ Orders Page  
  orders: {
    receipts: {
      messages: [
        'View your orders list here.',
        'Click on any order to see its receipt.',
        'Review your receipt details here.'
      ]
    },
    chatbot: {
      messages: [
        'Here are all your orders.',
        'CLICK HERE! to access the Intelligent RAG Enabled Chatbot.'
      ]
    }
  },

  // Cart Page 
  cart: {
    receipts: {
      messages: [
        'View your cart items here.',
        'Review your selected products in detail.',
        'Complete your purchase with checkout.'
      ]
    },
    omnichannelOrdering: {
      messages: [
        'Welcome to Omnichannel Ordering Experience - view your cart here.',
        'Click "Fill Cart" to add products.',
        'Proceed to checkout to complete your order seamlessly.'
      ]
    }
  },

  // Checkout Page  
  checkout: {
    receipts: {
      messages: [
        'Complete your checkout process here.',
        'Review your payment details and order total.',
        'Finalize your purchase to receive a detailed receipt.'
      ]
    },
    omnichannelOrdering: {
      messages: [
        'Review your order details here.',
        'Select your preferred shipping method.',
        'Place your order to complete the Omnichannel Experience.'
      ]
    }
  },

  // Order Details Page  
  orderDetails: {
    receipts: {
      messages: [
        'Click here to view your Digital Receipt'
      ]
    },
    omnichannelOrdering: {
      messages: [
        'Review your order details here.',
        'Review the products in your order here.',
        'Track your order progress here in the status stepper.'
      ]
    }
  },
 // ✅ Digital Receipt Modal  
digitalReceipt: {  
  receipts: {  
    messages: [  
      'This is your digital receipt.',  
      'These are the items in your order.',  
      'Scroll Down to see the recommendations based on the items that you ordered.',  
      'You can also download your digital receipt.'  
    ]  
  }  
}  


};

export const FEATURES = {
  RECEIPTS: 'receipts',
  OMNICHANNEL_ORDERING: 'omnichannelOrdering',
  AI_CHATBOT: 'chatbot'
};  

export const GUIDE_CUE_MESSAGES_2= {
  // :white_check_mark: Orders Page
  orders: {
    [FEATURES.RECEIPTS]: {
      messages: [
        {title: 'View your orders list here.', description: 'cool desciption 1'},
        {title: 'Click on any order to see its receipt.', description: 'cool desciption 2'},
        {title: 'Review your receipt details here.', description: 'cool desciption 3'}
      ]
    },
    [FEATURES.AI_CHATBOT]: {
      messages: [
        {title: 'Here are all your orders.', description: 'cool desciption 4'},
        {title: 'CLICK HERE! to access the Intelligent RAG Enabled Chatbot.', description: 'cool desciption 5'}
      ]
    }
  },
  // Cart Page
  cart: {
    [FEATURES.RECEIPTS]: {
      messages: [
        { title: "My Cart", description: "View your selected products here" },  
        { title: "Products", description: "These are the items in your cart" },  
        { title: "Checkout", description: "Click here to proceed to checkout" },  
    ],  
    },
    [FEATURES.OMNICHANNEL_ORDERING]: {
      messages: [  
        { title: "My Cart", description: "Welcome to Omnichannel Ordering Experience - view your cart here." },  
        { title: "Fill Cart", description: "Click Fill Cart to add products." },  
        { title: "Checkout", description: "Proceed to checkout to complete your order seamlessly" },  
    ],  
    }
  },
  // Checkout Page
  checkout: {
    [FEATURES.RECEIPTS]: {
      messages: [
        {title: 'Checkout', description: 'Complete your checkout process here.'},
        { title: "Review Payment Details", description: 'Review your payment details and order total.'},
        { title: "Finalize Purchase", description: 'Finalize your purchase to receive a detailed receipt.'}
      ]
    },
    [FEATURES.OMNICHANNEL_ORDERING]: {
      messages: [
        {title: 'Review Order Details', description: 'Review your order details here.'},
        {title: 'Select Shipping Method', description: 'Select your preferred shipping method.'},
        {title: 'Place your  Order', description: 'Place your order to complete the Omnichannel Experience.'},
      ]
    }
  },
  // Order Details Page
  orderDetails: {
    [FEATURES.RECEIPTS]: {
      messages: [
        {title: 'View your Digital Receipt', description: 'Click here to view your Digital Receipt'},
      ]
    },
    [FEATURES.OMNICHANNEL_ORDERING]: {
      messages: [
        {title: 'Review Order Details', description: 'Review your order details here.'},
        {title: 'Review Order', description: 'Review the products in your order here.'},
        {title: 'Order Progress', description: 'Track your order progress here in the status stepper.'},
      ]
    }
  },
  // :white_check_mark: Digital Receipt Modal
  digitalReceipt: {
    [FEATURES.RECEIPTS]: {
      messages: [
        {title: 'Digital Receipt', description: 'This is your digital receipt.'},
        {title: 'Your Order', description: 'These are the items in your order.'},
        {title: 'View Recommendations', description: 'Scroll Down to see the recommendations based on the items that you ordered.'},
        {title: 'Download Digital Receipt', description: 'You can also download your digital receipt.'},
      ]
    }
  }
};















