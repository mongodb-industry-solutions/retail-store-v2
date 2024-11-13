import { NextResponse } from "next/server";
import { connectToDatabase } from "../../_db/connect";
import { ROLE } from "@/lib/constants";
const { ObjectId } = require('mongodb');

const service = process.env.SERVICE
const systemId = process.env.SYSTEM_ID
const llmId = process.env.LLM_ID
const token = process.env.TOKEN
const agentSpec = {
	"agentSpec": {
		"persona": "You are a helpful assistant for Leafy Corp (an ecommerce store) and help Leafy Corp users with their questions.",
		"scenarioSelectionFailureMessage": "I could not follow what you meant. Please rephrase and try. If you would like to know what I can do - please ask \"What can you do?\"",
		"scenarios": [
			{
				"name": "qna",
				"description": "Query for information on policies such as shipping policies, cancellation, refunds",
				"examples": [
					"What is the returns process?",
					"Do you ship internationally?"
				],
				"toolRefs": [
					{
						"name": "GetPolicies",
						"toolId": "e682ac1f-d5e8-4a9e-b3e6-dc78c7412ac1",
						"properties": {}
					}

				]

			},
			{
				"name": "order",
				"description": "Operate on a single order - such as getting its details, tracking info, cancel or return it",
				"instructions": "Do not ask the user for their customer id.",
				"examples": [],
				"toolRefs": [
					{
						"name": "GetPolicies",
						"toolId": "e682ac1f-d5e8-4a9e-b3e6-dc78c7412ac1",
						"properties": {}
					},
					{
						"name": "GetOrder",
						"toolId": "json_mongo_demo_order",
						"properties": {}
					}

				]
			},
			{
				"name": "greetings",
				"description": "When the user greets us with a welcome message",
				"persona": "Cheerful, helpful assistant AI Customer Support Assistant speaking on behalf of Leafy Corp (An ECommerce portal).",
				"instructions": "Please respond with a cheery welcome message. The customer id should not be mentioned to the user.",
				"examples": [],
				"toolRefs": []
			},
			{
				"name": "goodbye",
				"description": "When the user indicates that their question is resolved or they say bye or give some other indication that the conversation on that topic is over or they want to start a new conversation or ask a new question",
				"instructions": "Always Generate ###CLOSE### in your response.",
				"examples": [
	                                "I have another question",
        	                        "I want to ask you something else",
                	                "Can you also help me with this",
                        	        "Thanks",
	                                "Bye",
                                	"I am all set",
        	                        "OK"
				],
				"toolRefs": []
			},
			{
				"name": "about",
				"description": "When the user asks a question about the assistant",
				"instructions": "Please use this information about yourself to respond - Customer Support AI Assistant that can help with listing orders, tracking individual orders and answer questions on store policies.",
				"examples": [
					"What can I ask about?",
					"What can you do?",
					"How can you help me?"
				],
				"toolRefs": []
			}
		],
		"tools": [
{
  "toolId": "json_mongo_demo_order",
  "typeId": "json",
  "description": "Use this tool to get details of the order we are operating on. Usually this will be the first step so we have the correct order context. If we cannot retrieve the order then we must ask the user for the order id.",
  "examples": [
  ],
  "parameters": {
    "user_id": {
      "type": {
        "name": "string"
      },
      "description": "The id of the user who is talking to us. This will be provided from the context. Do not ask the user for this."
    },
    "order_query": {
      "type": { "name": "string" },
      "description": "query string to help identify which order the user is interested in"
    }
  },
  "returnType": {
    "name": "Order",
    "description": "An object that represents an order in the system",
    "fields": {
      "id": {
        "name": "string",
        "description": "the id of the order"
      },
      "user": {
        "name": "string",
        "description": "the id of the user or customer that placed this order"
      },
      "shipping_address": {
        "name": "string",
        "description": "the address to where the products are being shipped - could be the users's preferred address or a store"
      },
      "status": {
        "name": "enum",
        "description": "the status of the order - values are from [InProcess,Cancelled,Delivered,Ready for pickup,Customer In Store,Ready For Delivery,Picked up from warehouse]"
      },
      "status_date": {
        "name": "string",
        "description": "the date at which the status of the order was last updated - in DD-MMM-YYYY format"
      },
      "products": {
        "name": "Product[]",
        "description": "a list of products that are part of this order",
        "fields": {
          "id": {
            "name": "string",
            "description": "the id of this product"
          },
          "amount": {
            "name": "integer",
            "description": "the number of items of this product that are in the order"
          },
          "name": {
            "name": "string",
            "description": "the name of this product"
          },
          "code": {
            "name": "string",
            "description": "the code or sku of this product"
          },
          "price": {
            "name": "string",
            "description": "The price of this product e.g. $20, $33.2"
          }
        }
      },
      "type": {
        "name": "enum",
        "description": "The type of order - one of [Ship to Home,Buy Online Pickup in Store]"
      }
    }
  },
  "implConfig": {
    "data": [
      {
        "id": "order-1",
        "user": "user-2",
        "products": [
          {
            "id": "prod-1",
            "amount": 2,
            "brand": "Helix",
            "code": "HWSDW-MDB0001",
            "description": "Helix Women Silver Dial Watch",
            "name": "Helix Women Silver Dial Watch",
            "price": "$20.0"
          }
        ],
        "shipping_address": "",
        "status": "Ready for pickup",
        "status_date": "23-Oct-2024",
        "type": "Buy Online Pickup in Store"
      },
      {
        "id": "order-2",
        "user": "user-2",
        "products": [
          {
            "id": "prod-1",
            "amount": 2,
            "brand": "Helix",
            "code": "HWSDW-MDB0001",
            "description": "Helix Women Silver Dial Watch",
            "name": "Helix Women Silver Dial Watch",
            "price": "$23.0"
          }
        ],
        "shipping_address": "",
        "status": "Delivered",
        "status_date": "23-Oct-2024",
        "type": "Buy Online Pickup in Store"
      },
      {
        "id": "order-3",
        "user": "user-1",
        "products": [
          {
            "id": "prod-2",
            "amount": 1,
            "name": "ADIDAS Men Spry M Black Sandals",
            "description": "ADIDAS Men Spry M Black Sandals",
            "code": "AMSMBS-MDB0001",
            "brand": "ADIDAS",
            "price": "$20.0"
          }
        ],
        "shipping_address": "",
        "status": "In Transit",
        "status_date": "20-Oct-2024",
        "type": "Ship to Home"
      },
      {
        "id": "order-4",
        "user": "user-1",
        "products": [
          {
            "id": "prod-3",
            "amount": 1,
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
            "amount": 3,
            "name": "Level 1 Live Socks",
	    "description": "Keep your feet cozy and stylish with these white socks featuring the MongoDB logo, adding a touch of geeky charm to your sock drawer.",
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
            "amount": 1,
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
    ],
    "dataType": {
      "name": "Order",
      "description": "An object that represents an order in the system",
      "fields": {
        "id": {
          "name": "string",
          "description": "the id of the order"
        },
        "user": {
          "name": "string",
          "description": "the id of the user or customer that placed this order"
        },
        "shipping_address": {
          "name": "string",
          "description": "the address to where the products are being shipped - could be the users's preferred address or a store"
        },
        "status": {
          "name": "enum",
          "description": "the status of the order - values are from [InProcess,Cancelled,Delivered,Ready for pickup,Customer In Store,Ready For Delivery,Picked up from warehouse]"
        },
        "status_date": {
          "name": "string",
          "description": "the date at which the status of the order was last updated - in DD-MMM-YYYY format"
        },
        "products": {
          "name": "Product[]",
          "description": "a list of products that are part of this order",
          "fields": {
            "id": {
              "name": "string",
              "description": "the id of this product"
            },
            "amount": {
              "name": "integer",
              "description": "the number of items of this product that are in the order"
            },
            "name": {
              "name": "string",
              "description": "the name of this product"
            },
            "code": {
              "name": "string",
              "description": "the code or sku of this product"
            },
            "price": {
              "name": "string",
              "description": "The price of this product e.g. $20, $33.2"
            }
          }
        },
        "type": {
          "name": "enum",
          "description": "The type of order - one of [Ship to Home,Buy Online Pickup in Store]"
        }
      }
    }
  }
}
		]
	}
}

export async function POST(request) {
    const {userId, userText, messages } = await request.json(); 
    const urlTemplate = service + "/api/qna/v1/systems/" + systemId + "/call-agent?llmProviderId=" + llmId + "&userText=";
    let json_data = agentSpec;
    let string_dialogue = [];

    messages.map(message => {
        string_dialogue.push( { by: message.sender, text: message.content } )
    })
    string_dialogue.push( { by: ROLE.user, text: userText } )
    console.log('--', userId, string_dialogue)
    json_data["conversationHistory"] = string_dialogue;
    const response = await fetch(`${urlTemplate}${userText}`, {
        method: "POST",
        headers: {
            "Authorization": "SSWS " + token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(json_data)
    });
    let output = "I am sorry but I was unable to get a response.";
    let resJson;
    if (response.ok) { // response.ok is true if the status code is in the 200-299 range
        resJson = await response.json();
        console.log('-- resJson: ', resJson);
        output = resJson.answer;
    }
    return NextResponse.json({ message: output || null,  resJson}, { status: 200 });
}
