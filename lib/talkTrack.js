export const cartPage = [
    {
        heading: "What is Omnichannel Ordering Solution?",
        content: [
            {
                heading: "What is Omnichannel Ordering Solution?",
                body: `
                The Omnichannel Ordering Solution demo highlights how MongoDB can streamline the
                shopping experience by integrating online and in- store systems, enabling real-time
                inventory visibility and efficient order management. This solution supports Buy Online,
                Pick Up in Store (BOPIS) and home delivery options, reducing logistical issues while
                enhancing the customer journey. This unified approach ensures smooth transactions,
                up-to-date inventory, and improved customer satisfaction across multiple touchpoints.
                `,
            },
            {
                heading: "How to Demo this page",
                body: [
                    {
                        heading: "Click on “Proceed to Checkout”, in case you don’t see that button click first on “Fill cart” to get random products into the cart.",
                        body: []
                    },
                    {
                        heading: "Then you should see the “Proceed to checkout” button.",
                        body: []
                    }
                ]

            }
        ],
    },
    {
        heading: "Behind the Scenes",
        content: [
            {
                heading: "Architecture overview (omnichannel)",
                body: "",
            },
            {
                image: {
                    src: "/rsc/diagrams/omnichannel.svg",
                    alt: "Architecture",
                },
            },
            {
                heading: '',
                body: 'Database modifications are recorded in the oplog as events. The change stream API monitors this log to identify specific changes that applications or triggers are set to observe. Once detected, a change event is created and sent to the appropriate listener, whether it’s an external application or a database trigger, allowing them to respond in real time and initiate actions as needed.'
            },
            {
                heading: "Architecture overview (Agentic RAG chatbot)",
                body: "",
            },
            {
                image: {
                    src: "/rsc/diagrams/chatbotDiagram.png",
                    alt: "Architecture",
                },
            }
        ],
    },
    {
        heading: "Why MongoDB?",
        content: [
            {
                heading: "Easy, Flexible and Fast",
                body: "MongoDB?s document model combines simplicity and flexibility, aligning with how developers naturally structure and retrieve data. This makes queries more intuitive and improves performance. As business needs evolve, the schema adapts seamlessly, allowing for rapid iteration without rigid constraints.",
            },
            {
                heading: "Real-Time Data Responsiveness",
                body: "Leverage MongoDB's Change Streams and Triggers to keep your data synchronized across all systems in real time. Whether updating order statuses or automating processes, MongoDB ensures seamless synchronization, all without adding an extra layer of complexity."
            },
            {
                heading: "Smart Customer Experience with RAG",
                body: "MongoDB Atlas and Dataworkz combine to deliver Agentic RAG-as-a-Service, improving customer interactions with smart, context-aware AI. Atlas uses vector embeddings for more accurate, meaning-based searches, while its scalable infrastructure ensures reliability during peak traffic. Dataworkz enhances this with agentic workflows powered by RAG pipelines, leveraging semantic search and knowledge graphs to pull the most relevant data for AI-driven responses."
            }
        ],
    },
]
export const checkoutPage = [
    {
        heading: "What is Omnichannel Ordering Solution?",
        content: [
            {
                heading: "What is Omnichannel Ordering Solution?",
                body: `
                The Omnichannel Ordering Solution demo highlights how MongoDB can streamline the
                shopping experience by integrating online and in- store systems, enabling real-time
                inventory visibility and efficient order management. This solution supports Buy Online,
                Pick Up in Store (BOPIS) and home delivery options, reducing logistical issues while
                enhancing the customer journey. This unified approach ensures smooth transactions,
                up-to-date inventory, and improved customer satisfaction across multiple touchpoints.
                `,
            },
            {
                heading: "How to Demo this page",
                body: [
                    {
                        heading: "Highlight the 2 shipping methods available ‘Buy Online, Pickup in store’ (BOPIS) which shows a list of available stores to pick up the order. And ‘Buy Online, Get Delivery At home’ which shows the address of that specific user",
                        body: []
                    },
                    {
                        heading: "Click on “Continue” once you have selected your preferred shipping method. This will generate the order and redirect you to the ”Order Details” page.",
                        body: []
                    }
                ]

            },

        ],
    },
    {
        heading: "Behind the Scenes",
        content: [
            {
                heading: "Architecture overview (omnichannel)",
                body: "",
            },
            {
                image: {
                    src: "/rsc/diagrams/omnichannel.svg",
                    alt: "Architecture",
                },
            },
            {
                heading: '',
                body: 'Database modifications are recorded in the oplog as events. The change stream API monitors this log to identify specific changes that applications or triggers are set to observe. Once detected, a change event is created and sent to the appropriate listener, whether it’s an external application or a database trigger, allowing them to respond in real time and initiate actions as needed.'
            },
            {
                heading: "Architecture overview (Agentic RAG chatbot)",
                body: "",
            },
            {
                image: {
                    src: "/rsc/diagrams/chatbotDiagram.png",
                    alt: "Architecture",
                },
            }
        ],
    },
    {
        heading: "Why MongoDB?",
        content: [
            {
                heading: "Easy, Flexible and Fast",
                body: "MongoDB?s document model combines simplicity and flexibility, aligning with how developers naturally structure and retrieve data. This makes queries more intuitive and improves performance. As business needs evolve, the schema adapts seamlessly, allowing for rapid iteration without rigid constraints.",
            },
            {
                heading: "Real-Time Data Responsiveness",
                body: "Leverage MongoDB's Change Streams and Triggers to keep your data synchronized across all systems in real time. Whether updating order statuses or automating processes, MongoDB ensures seamless synchronization, all without adding an extra layer of complexity."
            },
            {
                heading: "Smart Customer Experience with RAG",
                body: "MongoDB Atlas and Dataworkz combine to deliver Agentic RAG-as-a-Service, improving customer interactions with smart, context-aware AI. Atlas uses vector embeddings for more accurate, meaning-based searches, while its scalable infrastructure ensures reliability during peak traffic. Dataworkz enhances this with agentic workflows powered by RAG pipelines, leveraging semantic search and knowledge graphs to pull the most relevant data for AI-driven responses."
            }
        ],
    },
]
export const orderDetailsPage = [
    {
        heading: "What is Omnichannel Ordering Solution?",
        content: [
            {
                heading: "What is Omnichannel Ordering Solution?",
                body: `
                The Omnichannel Ordering Solution demo highlights how MongoDB can streamline the
                shopping experience by integrating online and in- store systems, enabling real-time
                inventory visibility and efficient order management. This solution supports Buy Online,
                Pick Up in Store (BOPIS) and home delivery options, reducing logistical issues while
                enhancing the customer journey. This unified approach ensures smooth transactions,
                up-to-date inventory, and improved customer satisfaction across multiple touchpoints.
                `,
            },
            {
                heading: 'How to Demo this page',
                body: `<div>
                    <p class="mb-0">From the Order details page you can highlight the following:</p>
                    <ul>
                        <li>
                            <p>
                                <strong>Any order:</strong> 
                                You first have the <i>'Summary'</i> which lists general info about the order. 
                                Below that, you have the <i>'Status'</i> showing a Stepper showing the order status progressing 
                                through each stage until the order is marked as <i>Delivered/Completed</i>. Every time the order 
                                moves forward with the next stage the stepper circle will turn green and a new entry will 
                                show with the timestamp that status was logged into the database. Every order will 
                                automatically move from status every 10 seconds thanks to an Atlas Trigger. The only status
                                that depends on the user is the  <i>'Customer in store'</i> status from the BOPIS orders. This status
                                is to indicate to the store that the customer is physically at the store and ready to 
                                pick up the order. So the customer has to click on the <i>'I am here'</i> button to change of status
                            </p>
                            <img width="100%" src="/rsc/images/status.png"/>
                        </li>
                        <li>
                            <p>
                                <strong>Only 'BOPIS orders:</strong> 
                                It has specific states displayed in the graph below.
                            </p>
                        </li>
                        <li>
                            <p>
                                <strong>Only 'Buy Online Get Delivery at Home' orders:</strong> 
                                It has specific states displayed in the graph below.
                            </p>
                        </li>
                        <li>
                            <img width="100%" src="/rsc/diagrams/statusFlow.png"/>
                        </li>
                    </ul>
                </div>`,
                isHTML: true
            }
        ],
    },
    {
        heading: "Behind the Scenes",
        content: [
            {
                heading: "Architecture overview (omnichannel)",
                body: "",
            },
            {
                image: {
                    src: "/rsc/diagrams/omnichannel.svg",
                    alt: "Architecture",
                },
            },
            {
                heading: '',
                body: 'Database modifications are recorded in the oplog as events. The change stream API monitors this log to identify specific changes that applications or triggers are set to observe. Once detected, a change event is created and sent to the appropriate listener, whether it’s an external application or a database trigger, allowing them to respond in real time and initiate actions as needed.'
            },
            {
                heading: "Architecture overview (Agentic RAG chatbot)",
                body: "",
            },
            {
                image: {
                    src: "/rsc/diagrams/chatbotDiagram.png",
                    alt: "Architecture",
                },
            }
        ],
    },
    {
        heading: "Why MongoDB?",
        content: [
            {
                heading: "Easy, Flexible and Fast",
                body: "MongoDB?s document model combines simplicity and flexibility, aligning with how developers naturally structure and retrieve data. This makes queries more intuitive and improves performance. As business needs evolve, the schema adapts seamlessly, allowing for rapid iteration without rigid constraints.",
            },
            {
                heading: "Real-Time Data Responsiveness",
                body: "Leverage MongoDB's Change Streams and Triggers to keep your data synchronized across all systems in real time. Whether updating order statuses or automating processes, MongoDB ensures seamless synchronization, all without adding an extra layer of complexity."
            },
            {
                heading: "Smart Customer Experience with RAG",
                body: "MongoDB Atlas and Dataworkz combine to deliver Agentic RAG-as-a-Service, improving customer interactions with smart, context-aware AI. Atlas uses vector embeddings for more accurate, meaning-based searches, while its scalable infrastructure ensures reliability during peak traffic. Dataworkz enhances this with agentic workflows powered by RAG pipelines, leveraging semantic search and knowledge graphs to pull the most relevant data for AI-driven responses."
            }
        ],
    },
]
export const ordersPage = [
    {
        heading: "What is Agentic RAG?",
        content: [
            {
                heading: "What is Agentic RAG?",
                body: `With Agentic RAG architecture different tools and functions can be accessed by the agent, enabling it to go beyond information retrieval and generation – it allows it to plan. Agents can determine if they need to retrieve specific information or not, which tool to use for the retrieval, and formulate queries. These capabilities are crucial as it enables the agent to pull information from multiple data sources, handling complex queries that require more than one source to formulate the response.`,
            },
            {
                heading: "",
                body: `In this demo we show a real-time, GenAI-powered support chatbot that is able to assist customers at any point in time and is context aware of the business’s policies as well as the user’s history.`,
            },
            {
                heading: "How to Demo this page",
                body: [
                    {
                        heading: "Click on the floating button at the bottom right corner to open the chatbot.",
                        body: []
                    },
                ]

            }
        ],
    },
    {
        heading: "Behind the Scenes",
        content: [
            {
                heading: "Architecture overview (Agentic RAG chatbot)",
                body: "",
            },
            {
                image: {
                    src: "/rsc/diagrams/chatbotDiagram.png",
                    alt: "Architecture",
                },
            },
            {
                heading: "Architecture overview (omnichannel)",
                body: "",
            },
            {
                image: {
                    src: "/rsc/diagrams/omnichannel.svg",
                    alt: "Architecture",
                },
            },
            {
                heading: '',
                body: 'Database modifications are recorded in the oplog as events. The change stream API monitors this log to identify specific changes that applications or triggers are set to observe. Once detected, a change event is created and sent to the appropriate listener, whether it’s an external application or a database trigger, allowing them to respond in real time and initiate actions as needed.'
            },
        ],
    },
    {
        heading: "Why MongoDB?",
        content: [
            {
                heading: "Vector embeddings and smart search",
                body: "The Dataworkz RAG builder enables anyone to build sophisticated retrieval mechanisms that turn words, phrases, or even customer behaviors into vector embeddings—essentially, numbers that capture their meaning in a way that’s easy for AI to understand—and store them in MongoDB Atlas. This makes it possible to search for content based on meaning rather than exact wording, so search results are more accurate and relevant.",
            },
            {
                heading: "Scalable, reliable performance",
                body: "MongoDB Atlas’s cloud-based, distributed setup is built to handle high-traffic retail environments, minimizing disruptions during peak shopping times."
            },
            {
                heading: "Deep context with Dataworkz’s agentic RAG as a service",
                body: "Retailers can build agentic workflows powered by RAG pipelines that combine lexical and semantic search with knowledge graphs to fetch the most relevant data from unstructured operational and analytical data sources before generating AI responses."
            }
        ],
    },
]
export const landingPagePersonalizedRecommendations = [
    {
        heading: "Personalized recommendations",
        content: [
            {
                heading: 'Digital Receipts',
                body: `
                    Digital receipts are the electronic version of traditional paper receipts. 
                    They serve as official proof of payment containing relevant invoice details such as the transaction timestamp, 
                    total amount, items purchased, and more. They provide real-time and historical insight into customers' purchases.
                    </br>
                    The Global Digital Receipts in Retail Market size is expected to be worth around USD 5,214.9 million by 2034, 
                    growing at a CAGR of 21.4% during the forecast period from 2025 to 2034. </br> </br>
                    <img src="/rsc/diagrams/digitalReceiptsChart.png"/>
                    <small><strong>Resource:</strong> https://market.us/report/digital-receipts-in-retail-market/</small>
                    `,
                isHTML: true
            },
            {
                heading: 'Personalized recommendations',
                body: `
                     B2B marketers who personalize web experiences see an average increase of <a 
                     href="https://instapage.com/blog/personalization-statistics/#:~:text=Website%20personalization%20statistics,-76%25%20of%20consumers&text=85%25%20of%20businesses%20say%20that,a%2019%25%20increase%20in%20sales." 
                     target="_blank">19% in sales</a>. Product recommendations generate <a 
                     href="https://www.mckinsey.com/industries/retail/our-insights/how-retailers-can-keep-up-with-consumers"
                     target="_blank">35% of Amazon sales and 75%</a> of what people watch on Netflix.
                `,
                isHTML: true
            
            },
            {
                heading: 'Leverage digital receipts data to personalize recommendations',
                body: `
                    Nearly <a href="https://www.pymnts.com/study/item-level-receipt-data-technology-merchant-innovation-strategy/" target="_blank">
                    9 out of 10 firms (88%)</a> believe the most important impact data can have is on personalization.
                    Retailers can leverage digital receipt data to enhance customers post-purchase experience 
                    by including personalized recommendations the receipt itself delivering relevant targeted marketing 
                    for customers. </br>
                    <img width="480" src="/rsc/diagrams/personalizationDiagram.png"/>
                    `,
                isHTML:true
            },

        ],
    },
    {
        heading: "How to demo",
        content: [
            {
                heading: 'In this screen',
                body: `
                    Highlight the <strong>'Based on your last order you might like'</strong> section. This carrusel shows product 
                    recommendations relevant to this user based on their latest placed order. </br></br>
                    These items where retrieved through an <a href='https://www.mongodb.com/products/platform/atlas-vector-search' target='_blank'>
                    Atlas Vector Search</a> query. When a user makes a purchase a microservice is triggered to take the invoice data 
                    and based on one of the items selected (i.e. the most expensive item of the invoice) it performs the Atlas Vector Search 
                    query to retrieve similar products from the catalog. The top 20 results are displayed on the carousel.
                    
                    </br></br>
                    At the top left corner of every item you can see the <code>$vectorSearchScore</code>  </br>
                    <img src="/rsc/images/recommendedItem.png"/>     </br>   </br>
                    Click on the  <img width={35} height={25} alt="Wizard Tooltip" src="/rsc/images/wizardTooltip.png" />  
                    tooltip next to the carrousel title to see the full document model where we read the recommendations from and 
                    understand relevant fields within the document.
                `,
                isHTML: true
            }
        ],
    },
    {
        heading: "Behind the Scenes",
        content: [
          {
            heading: "What’s the Value of Digital Receipts — and How Do We Capture It in This Demo?",
            body: "This demo shows how retailers can leverage digital receipt data to spark a personalized customer journey — and how MongoDB enables that journey to happen in real time, across both online and physical channels.",
          },
          {
            image: {
              src: "/rsc/diagrams/digital-receipts-high-level.png",
              alt: "Digital Receipts Architecture",
            },
          },
          {
            body: [
              "🧾 Invoice microservice: Captures order data and stores rich, flexible receipts in MongoDB Atlas.",
              "⚡ Recommendation microservice: Reacts to each new purchase, generating personalized product suggestions using Vector Search.",
              "👤 Real-time personalization: Recommendations are written into both the receipt and the user profile, connecting online and in-store journeys."
            ]
          },
          {
            image: {
              src: "/rsc/diagrams/components-digital-receipts.png",
              alt: "Digital Receipts Components Diagram",
            },
          },
          {
            body: "Although the demo uses e-commerce, the architecture is designed to reflect real-world retail systems. The invoice microservice could easily ingest data from physical stores — using MongoDB as a single source of truth to centralize and activate all transaction data.",
          },
          {
            body: "In this demo, we deploy our microservices on Azure and simulate common external integrations involved in digital receipt generation — such as tax calculation and loyalty programs — using Azure Functions. When the customer downloads the invoice, it’s rendered as a PDF and stored in Azure Blob Storage, providing a scalable and easily linkable solution for unstructured files.",
          },
          {
            heading: "Build AI-powered recommendations using flexible data and easy vector search",
            body: "Our products collection stores traditional attributes (name, price, category) plus AI-generated vector embeddings that capture product meaning. This allows MongoDB Vector Search to retrieve relevant recommendations in real time.",
          },
          {
            image: {
              src: "/rsc/diagrams/embeddings-and-vector-search.png",
              alt: "Embeddings and Vector Search",
            },
          },
          {
            heading: "Event-Driven Architecture and Seamless Integration with MongoDB",
            body: "Modern retailers need systems that react instantly and scale. With MongoDB’s Change Streams and Atlas Triggers, services can react to events in real time, enabling true data-driven workflows.",
          },
          {
            image: {
              src: "/rsc/diagrams/workflow-architecture.png",
              alt: "Workflow Event Architecture",
            },
          },
          {
            body: [
              "🛒 A customer places an order, and the invoice microservice creates a new invoice in MongoDB.",
              "🧠 The recommendation microservice listens via Change Streams, detects the event in real time, and generates product suggestions based on the most expensive item purchased.",
              "📂 These recommendations are stored in a dedicated collection. Then, Atlas Triggers propagate them:",
              "– into the invoice document, so the customer receives a receipt with real-time suggestions,",
              "– and into the user profile, so their homepage reflects new preferences right after purchase.",
              "📊 Meanwhile, MongoDB retains the full history of purchases and recommendations across collections — supporting analytics and AI training."
            ]
          },
          {
            body: "The result? A seamless, real-time personalization experience that delights customers and scales with your business — powered by MongoDB.",
          }
        ]
      },      
      {
        heading: "Why MongoDB?",
        content: [
          
          {
            heading: "⚠️ The Challenge",
            body: [
              " Fragmented data: Sales data is duplicated across disconnected tools and legacy systems.",
              " Rigid schemas: Traditional databases spread complex XML receipt data across many tables—too inflexible for evolving needs.",
              " Slow innovation: Without a unified view of operational data, real-time insights and AI use cases are hard to implement.",
              " Scalability pressure: Growing volumes of receipt data can slow down performance, analytics, and customer-facing applications.",
              " Compliance complexity: Sensitive customer information must meet privacy laws like GDPR—especially for global businesses operating across regions."
            ]
          },
          {
            heading: "✅ How MongoDB Solves It",
            body: [
              " Schema flexibility: Its document model fits the data, not the other way around. You can store receipts as-is and add fields (like recommendations) anytime—without downtime.",
              " Centralized operational layer: Consolidates data from multiple sources into a single source of truth—breaking silos and simplifying integration.",
              " Real-time activation: Supports Change Streams and Triggers to instantly react to purchases and personalize the customer experience.",
              " Scalability & performance: Uses sharding for horizontal scaling and replica sets for high availability, while enabling workload isolation for analytics, AI, or reporting.",
              " Security & compliance: Built-in features like encryption, auditing, and zone sharding help meet GDPR requirements and ensure data stays close to where it’s generated."
            ]
          }
        ]
      }
,      
]