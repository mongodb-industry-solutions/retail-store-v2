export const getMinimizedSchemaForDataworkz = async (ordeers) => {
    //TODO
    return [       // [] or [...]
        {
            "id": "order-3",
            "user": "user-1",
            "products": [
                {
                    "id": "prod-2",
                    "name": "ADIDAS Men Spry M Black Sandals",
                    "description": "ADIDAS Men Spry M Black Sandals",
                    "code": "AMSMBS-MDB0001",
                    "brand": "ADIDAS",
                    "price": "$20.0"
                }
            ],
            "shipping_address": "",
            "status": "Dispatched",
            "status_date": "20-Oct-2024",
            "type": "Ship to Home"
        },
        {
            "id": "order-4",
            "user": "user-1",
            "products": [
                {
                    "id": "prod-3",
                    "name": "New Tonal Shirt-Women's",
                    "description": "Show your love for MongoDB in style with this sleek black T-shirt featuring the iconic MongoDB logo, perfect for casual wear or tech events.",
                    "code": "NTSW-MDB0001-S",
                    "brand": "MongoDB",
                    "price": "$10.0"
                }
            ],
            "shipping_address": "",
            "status": "Delivered",
            "status_date": "2-Oct-2024",
            "type": "Ship to Home"
        },
        {
            "id": "order-5",
            "user": "user-1",
            "products": [
                {
                    "id": "prod-4",
                    "name": "Level 1 Live Socks",
                    "code": "L1LS-MDB0001",
                    "brand": "MongoDB",
                    "price": "$11.0"
                }
            ],
            "shipping_address": "",
            "status": "Returned",
            "status_date": "12-Sep-2024",
            "type": "Ship to Home"
        },
        {
            "id": "order-6",
            "user": "user-1",
            "products": [
                {
                    "name": "New Tonal Shirt-Women's",
                    "description": "Show your love for MongoDB in style with this sleek black T-shirt featuring the iconic MongoDB logo, perfect for casual wear or tech events.",
                    "code": "NTSW-MDB0001-XL",
                    "brand": "MongoDB",
                    "price": "$10.0"
                }
            ],
            "shipping_address": "",
            "status": "Cancelled",
            "status_date": "10-Sep-2024",
            "type": "Ship to Home"
        }
    ]
}

export const calculateInitialMessage = async (minimizedOrderSchema) => {
    let txt =  `Hi there! I am a GenAI Chatbot design to assist you!\n
        Here are your orders: \n
            Order Id: order-3 with status as Dispatched and with products: ADIDAS Men Spry M Black Sandals\n
            Order Id: order-4 with status as Delivered and with products: New Tonal Shirt-Women'\n
            Order Id: order-5 with status as Returned and with products: Level 1 Live Socks\n
            Order Id: order-6 with status as Cancelled and with products: New Tonal Shirt-Women' \n
            Which order would you like to track?`
    // <div>
    //     Hi there! I am a GenAI Chatbot design to assist you! <br/> 
    //     Here are your orders: <br/> 
    //         Order Id: order-3 with status as Dispatched and with products: ADIDAS Men Spry M Black Sandals <br/> 
    //         Order Id: order-4 with status as Delivered and with products: New Tonal Shirt-Women' <br/> 
    //         Order Id: order-5 with status as Returned and with products: Level 1 Live Socks <br/> 
    //         Order Id: order-6 with status as Cancelled and with products: New Tonal Shirt-Women' <br/> 
    //         Which order would you like to track?
    // </div>

    
    return txt
    /*
    TODO
    def getOrderStr():
        summary = "Here are your orders:\n"
        for i, order in enumerate(order_data, start=1):
            order_id = order.get("id", "N/A")
            status = order.get("status", "N/A")
            products = order.get("products", [])
            product_names = ", ".join([product.get("name", "N/A") for product in products])
            summary += f"{i}. Order Id: {order_id} with status as {status} and with products: {product_names}\n"
        summary += "\nWhich order would you like to track?"
        return summary
    */
}

//TODO prettify timestamp to date format