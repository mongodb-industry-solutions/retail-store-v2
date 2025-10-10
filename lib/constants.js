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
    },  
    digitalReceipts: {  // Support both 'receipts' and 'digitalReceipts' features  
      messages: [  
        'This is your digital receipt.',  
        'These are the items in your order.',  
        'Scroll Down to see the recommendations based on the items that you ordered.',  
        'You can also download your digital receipt.'  
      ]  
    }  
  }  
      
  };  