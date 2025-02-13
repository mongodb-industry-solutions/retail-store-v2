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
                heading: "How to Demo",
                body: [
                    {
                        heading: 'Access the cart',
                        body: [
                            'Click the user icon in the top-right corner and navigate to the Cart screen.',
                            'Use the tip icon to learn how MongoDB is integrated into this page.'
                        ]
                    },
                    {
                        heading: 'Proceed to Checkout',
                        body: [
                            'Click "Proceed to Checkout". If not visible, first click ?Fill Cart? to add random products, then the button should appear.'
                        ]
                    },
                    {
                        heading: 'Choose Shipping Method',
                        body: [
                            "On the Checkout page, select either ?Buy Online, Pickup in Store? (BOPIS) to view available store locations, or '?'Buy Online, Get Delivery At Home' to input the user's address."
                        ]
                    },
                    {
                        heading: 'Confirm Selection',
                        body: [
                            "Click 'Continue' after choosing your shipping method, which generates the order and redirects you to the Order Details page"
                        ]
                    },
                    {
                        heading: 'Review Order Details',
                        body: [
                            "The Order Summary provides general information",
                            "The Order Status stepper shows progress: as each step completes, it turns green with a timestamp update every 10 seconds (via Atlas Trigger).",
                            "For BOPIS Orders: The status will update when the customer clicks 'I am here' to notify the store they are ready to pick up the order.",
                            "For Buy Online, Get Delivery at Home Orders: Specific status stages will be displayed in the graph.Review Order Details"
                        ]
                    }
                ],
            }
        ],
    },
    {
        heading: "Behind the Scenes",
        content: [
            {
                heading: "Architecture overview",
                body: "",
            },
            {
                image: {
                    src: "./OF_info.png",
                    alt: "Architecture",
                },
            },
        ],
    },
    {
        heading: "Why MongoDB?",
        content: [
            {
                heading: "Flexibility",
                body: "MongoDB shines in its flexibility—serving as a central data storage solution for retrieving data from external financial institutions while seamlessly supporting diverse formats and structures.",
            },
        ],
    },
]